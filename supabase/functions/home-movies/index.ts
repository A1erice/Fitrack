import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TMDB_API = "https://api.themoviedb.org/3";
const AVAILABILITY_API = "https://api.movieofthenight.com/v4";
const MONTHLY_THEMES = [
  { month: "January", title: "Winter magic", keyword: "winter" },
  { month: "February", title: "Love stories", keyword: "romance" },
  { month: "March", title: "Myths & legends", keyword: "mythology" },
  { month: "April", title: "Spring adventures", keyword: "spring" },
  { month: "May", title: "Road trip stories", keyword: "road trip" },
  { month: "June", title: "Summer nights", keyword: "summer" },
  { month: "July", title: "Ocean adventures", keyword: "ocean" },
  { month: "August", title: "Back to school", keyword: "school" },
  { month: "September", title: "Mystery season", keyword: "mystery" },
  { month: "October", title: "Halloween", keyword: "halloween" },
  { month: "November", title: "Found family", keyword: "family" },
  { month: "December", title: "Holiday magic", keyword: "christmas" },
];

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond({ error: "Use POST." }, 405);

  const token = Deno.env.get("TMDB_READ_ACCESS_TOKEN");
  if (!token) return respond({ error: "Movie catalog is not configured yet." }, 500);

  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action;
    if (action === "recommend") {
      const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 300) : "";
      if (!prompt) return respond({ error: "Describe the kind of movie you want." }, 400);
      const watchedTitles = Array.isArray(body.watchedTitles)
        ? body.watchedTitles.filter((title: unknown): title is string => typeof title === "string").slice(0, 10).map((title: string) => title.trim().slice(0, 100)).filter(Boolean)
        : [];
      const watchedContext = watchedTitles.length ? `\n\nThe user's recently watched movies are: ${watchedTitles.join("; ")}. Use these only as taste signals: avoid recommending titles already watched, and find other movies with a similar tone, genres, themes, or storytelling.` : "";
      const today = new Date().toISOString().slice(0, 10);
      const cacheKey = `gemini-recommend-v7:${await sha256Hex(`${prompt.toLocaleLowerCase()}|${watchedTitles.join("|").toLocaleLowerCase()}`)}`;
      const cached = await readDailyCache(cacheKey, today).catch(() => null);
      if (cached) return respond({ ...cached, cacheHit: true });

      const geminiKey = Deno.env.get("GEMINI_API_KEY");
      if (!geminiKey) return respond({ error: "AI recommendations need the GEMINI_API_KEY secret in Supabase." }, 503);
      const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "You are a movie recommendation engine. The user asks for movies based on a mood, theme, or preference, optionally informed by watched movie taste context. Return only a compact JSON object with exactly two fields: summary, a helpful explanation of one or two sentences (35 to 50 words, max 50), and movies, an array of real feature films with no more than 20 items. Return exactly 20 suitable movies whenever possible. For a narrow prompt, broaden to closely related movies that still fit the user's mood rather than stopping at 5 or padding with unrelated titles. Return fewer than 20 only when fewer suitable real feature films exist. Each movie must have only title and year. Do not include reasons, descriptions, markdown, or any other fields. Choose films that fit the request; never invent titles." }] },
          contents: [{ role: "user", parts: [{ text: `${prompt}${watchedContext}` }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                summary: { type: "STRING" },
                movies: {
                  type: "ARRAY",
                  maxItems: 20,
                  items: {
                    type: "OBJECT",
                    properties: { title: { type: "STRING" }, year: { type: "STRING" } },
                    required: ["title", "year"],
                  },
                },
              },
              required: ["summary", "movies"],
            },
            thinkingConfig: { thinkingLevel: "minimal" },
            maxOutputTokens: 1400,
          },
        }),
      });
      if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.json().catch(() => ({}));
        const providerMessage = typeof errorBody?.error?.message === "string" ? errorBody.error.message.slice(0, 240) : "";
        console.error("Gemini recommendation request failed", geminiResponse.status, providerMessage);
        const message = geminiResponse.status === 429
          ? "Gemini is busy right now. Try again in a little while."
          : geminiResponse.status === 400
            ? "Gemini rejected the request settings. Check the deployed recommendation function and try again."
            : geminiResponse.status === 401 || geminiResponse.status === 403
              ? "Gemini rejected its API key. Check GEMINI_API_KEY in Supabase Edge Function secrets."
              : "Gemini could not create recommendations right now.";
        return respond({ error: message }, 502);
      }
      const generated = await geminiResponse.json();
      const candidate = generated.candidates?.[0];
      const generatedText = (candidate?.content?.parts ?? []).map((part: any) => part.text ?? "").join("").trim();
      const recommendation = parseGeminiRecommendation(generatedText);
      if (!recommendation) {
        console.error("Gemini returned no usable recommendation", candidate?.finishReason ?? generated.promptFeedback?.blockReason ?? "empty response");
        return respond({ error: candidate?.finishReason === "SAFETY" || generated.promptFeedback?.blockReason
          ? "Gemini couldn’t answer that prompt. Try describing a movie mood or theme."
          : "Gemini returned an incomplete recommendation. Please try again." }, 502);
      }
      const suggestions = recommendation.recommendations.slice(0, 20);
      const results = (await Promise.all(suggestions.map(async (suggestion: any) => {
        const title = typeof suggestion?.title === "string" ? suggestion.title.trim().slice(0, 100) : "";
        if (!title) return null;
        const year = validYear(suggestion.year);
        const search = await tmdb(`/search/movie?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1${year ? `&year=${year}` : ""}`, token);
        const matches = (search.results ?? []).filter((movie: any) => normalizeTitle(movie.title ?? movie.original_title ?? "") === normalizeTitle(title));
        const match = matches.find((movie: any) => !year || !movie.release_date || Number(movie.release_date.slice(0, 4)) === year) ?? matches[0];
        return match ? { ...match, id: Number(match.id), tmdbId: Number(match.id) } : null;
      }))).filter(Boolean);
      const payload = {
        summary: typeof recommendation.summary === "string" ? recommendation.summary.slice(0, 400) : "Here are a few movies that fit your mood.",
        results,
      };
      await writeDailyCache(cacheKey, today, payload).catch((error) => console.error("daily Gemini recommendation cache write failed", error));
      return respond({ ...payload, cacheHit: false });
    }
    if (action === "movie-detail") {
      let movieId = parseTmdbMovieId(body.movieId);
      if (!movieId && typeof body.title === "string" && body.title.trim()) {
        const title = body.title.trim().slice(0, 100);
        const year = Number(body.year);
        const search = await tmdb(`/search/movie?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1${Number.isInteger(year) && year > 1800 ? `&year=${year}` : ""}`, token);
        const exactMatches = (search.results ?? []).filter((result: any) => normalizeTitle(result.title ?? result.original_title ?? "") === normalizeTitle(title));
        const match = exactMatches.find((result: any) => !Number.isInteger(year) || !result.release_date || Number(result.release_date.slice(0, 4)) === year) ?? exactMatches[0];
        movieId = parseTmdbMovieId(match?.id);
      }
      if (!movieId) return respond({ error: "Could not match this title to a TMDB movie." }, 404);
      const region = validRegion(body.region);
      const today = new Date().toISOString().slice(0, 10);
      const omdbKey = Deno.env.get("OMDB_API_KEY");
      const suppliedExpiry = body.isExpiring === true && typeof body.expiryAt === "string" && Number.isFinite(Date.parse(body.expiryAt))
        ? { expiryAt: new Date(body.expiryAt).toISOString(), service: typeof body.expiryService === "string" ? body.expiryService.slice(0, 60) : "" }
        : null;
      const cacheKey = `movie-detail-v3:${region}:${movieId}:${omdbKey ? "imdb" : "no-imdb"}`;
      const cached = await readDailyCache(cacheKey, today).catch((error) => {
        console.error("daily movie-detail cache read failed", error);
        return null;
      });
      if (cached) return respond({ ...cached, cacheHit: true });
      const [detail, watchProviders] = await Promise.all([
        tmdb(`/movie/${movieId}?language=en-US&append_to_response=images,videos,credits&include_image_language=en,null`, token),
        tmdb(`/movie/${movieId}/watch/providers`, token),
      ]);
      const backdrops = (detail.images?.backdrops ?? []).filter((image: any) => image.file_path).slice(0, 12)
        .map((image: any) => `https://image.tmdb.org/t/p/w1280${image.file_path}`);
      const videos = detail.videos?.results ?? [];
      const trailer = videos.find((video: any) => video.site === "YouTube" && video.type === "Trailer" && video.official)
        ?? videos.find((video: any) => video.site === "YouTube" && video.type === "Trailer")
        ?? videos.find((video: any) => video.site === "YouTube" && video.type === "Teaser");
      const regionProviders = watchProviders.results?.[region];
      const providers = [...(regionProviders?.flatrate ?? []), ...(regionProviders?.free ?? []), ...(regionProviders?.ads ?? [])]
        .filter((provider: any, index: number, items: any[]) => items.findIndex((item) => item.provider_id === provider.provider_id) === index)
        .map((provider: any) => ({ id: provider.provider_id, name: provider.provider_name, logo: provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : "" }));
      const expiry = suppliedExpiry;
      const imdbId = detail.imdb_id ?? "";
      const imdbRating = omdbKey && imdbId ? await fetchImdbRating(imdbId, omdbKey) : "";
      const payload = {
        id: detail.id, title: detail.title ?? "", year: detail.release_date ? Number(detail.release_date.slice(0, 4)) : "",
        poster: detail.poster_path ? `https://image.tmdb.org/t/p/w780${detail.poster_path}` : "",
        overview: detail.overview ?? "", runtime: detail.runtime ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m` : "See details",
        rating: Number(detail.vote_average || 0).toFixed(1), ratingLabel: "TMDB", imdbId,
        imdbUrl: imdbId ? `https://www.imdb.com/title/${encodeURIComponent(imdbId)}/` : "", imdbRating,
        genres: (detail.genres ?? []).map((genre: any) => genre.name),
        backdrops,
        trailer: trailer ? { key: trailer.key, name: trailer.name ?? "Official trailer" } : null,
        cast: (detail.credits?.cast ?? []).filter((person: any) => person.name).slice(0, 14).map((person: any) => ({
          id: person.id, name: person.name, character: person.character ?? "", profile: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : "",
        })),
        providers, providerRegion: region, expiryAt: expiry?.expiryAt ?? null, expiryService: expiry?.service ?? "",
      };
      await writeDailyCache(cacheKey, today, payload).catch((error) => console.error("daily movie-detail cache write failed", error));
      return respond(payload);
    }
    if (action === "search") {
      const query = typeof body.query === "string" ? body.query.trim().slice(0, 100) : "";
      if (!query) return respond({ results: [] });
      const result = await tmdb(`/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, token);
      return respond({ results: result.results ?? [] });
    }
    if (action === "providers") {
      const services = Array.isArray(body.services)
        ? body.services.filter((service: unknown): service is string => typeof service === "string").slice(0, 12)
        : [];
      const region = validRegion(body.region);
      const result = await tmdb(`/watch/providers/movie?language=en-US&watch_region=${region}`, token);
      const available = result.results ?? [];
      const providers = services.flatMap((service) => {
        const aliases = serviceAliases[service] ?? [service];
        const match = available.find((provider: { provider_name?: string }) =>
          aliases.some((alias) => normalizeName(alias) === normalizeName(provider.provider_name ?? "")),
        );
        return match ? [{ service, id: match.provider_id, name: match.provider_name, logoPath: match.logo_path }] : [];
      });
      return respond({ providers, region });
    }
    if (action === "provider-movies") {
      const providerId = Number(body.providerId);
      if (!Number.isInteger(providerId) || providerId <= 0) return respond({ error: "Choose a valid streaming provider." }, 400);
      const region = validRegion(body.region);
      const result = await tmdb(`/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&watch_region=${region}&with_watch_providers=${providerId}&with_watch_monetization_types=flatrate`, token);
      return respond({ results: result.results ?? [], region });
    }
    if (action === "discover") {
      const filters = body?.filters && typeof body.filters === "object" ? body.filters : {};
      const region = validRegion(body.region);
      const page = Number.isInteger(Number(body.page)) ? Math.min(500, Math.max(1, Number(body.page))) : 1;
      const today = new Date().toISOString().slice(0, 10);
      const params = new URLSearchParams({
        include_adult: "false",
        include_video: "false",
        language: "en-US",
        page: String(page),
        sort_by: ["popularity.desc", "vote_average.desc", "primary_release_date.desc", "primary_release_date.asc", "revenue.desc", "vote_count.desc"].includes(filters.sort) ? filters.sort : "popularity.desc",
      });
      const genreValues = Array.isArray(filters.genres)
        ? filters.genres.filter((genre: unknown): genre is string => typeof genre === "string" && /^\d{1,3}$/.test(genre)).slice(0, 8)
        : typeof filters.genre === "string" && /^\d{1,3}$/.test(filters.genre) ? [filters.genre] : [];
      if (genreValues.length) params.set("with_genres", [...new Set(genreValues)].join("|"));
      const blockedGenres = Array.isArray(filters.blacklistGenres)
        ? [...new Set(filters.blacklistGenres.filter((genre: unknown): genre is string => typeof genre === "string" && /^\d{1,3}$/.test(genre)).slice(0, 20))]
        : [];
      const excludedGenres = [...new Set([...blockedGenres, "10770"])]; // Exclude TV movies from the Discover feed.
      params.set("without_genres", excludedGenres.join("|"));
      const yearFrom = validYear(filters.yearFrom);
      const yearTo = validYear(filters.yearTo);
      if (yearFrom) params.set("primary_release_date.gte", `${yearFrom}-01-01`);
      if (yearTo) params.set("primary_release_date.lte", `${yearTo}-12-31`);
      const minimumRating = validDecimal(filters.minimumRating, 0, 10);
      if (minimumRating !== null) params.set("vote_average.gte", String(minimumRating));
      params.set("vote_count.gte", minimumRating !== null ? "50" : "10");
      params.set("with_runtime.gte", filters.runtime === "feature" ? "91" : filters.runtime === "long" ? "151" : "40");
      if (filters.runtime === "short") params.set("with_runtime.lte", "90");
      if (filters.runtime === "feature") params.set("with_runtime.lte", "150");
      const language = typeof filters.language === "string" && /^[a-z]{2,3}$/i.test(filters.language) ? filters.language.toLowerCase() : "";
      if (language) params.set("with_original_language", language);
      const provider = Number(filters.provider);
      if (Number.isInteger(provider) && provider > 0 && provider <= 10000) {
        params.set("watch_region", region);
        params.set("with_watch_providers", String(provider));
        params.set("with_watch_monetization_types", "flatrate|free|ads");
      }
      const keyword = typeof filters.keyword === "string" ? filters.keyword.trim().slice(0, 60) : "";
      if (keyword) {
        const keywordMatch = await resolveKeyword(keyword, token, today);
        if (!keywordMatch?.id) return respond({ results: [], page, totalPages: 1, region, keywordNotFound: true });
        params.set("with_keywords", String(keywordMatch.id));
      }
      const cacheKey = `discover-v1:${params.toString()}`;
      const cached = await readDailyCache(cacheKey, today).catch((error) => {
        console.error("daily discover cache read failed", error);
        return null;
      });
      if (cached) return respond({ ...cached, cacheHit: true });
      const result = await tmdb(`/discover/movie?${params.toString()}`, token);
      const payload = { results: result.results ?? [], page, totalPages: Math.min(500, Number(result.total_pages ?? 1)), region, cacheHit: false };
      await writeDailyCache(cacheKey, today, payload).catch((error) => console.error("daily discover cache write failed", error));
      return respond(payload);
    }
    if (action === "expiring") {
      const availabilityKey = Deno.env.get("STREAMING_AVAILABILITY_API_KEY");
      if (!availabilityKey) return respond({ error: "Expiring-title tracking is not configured." }, 503);

      const services = Array.isArray(body.services)
        ? body.services.filter((service: unknown): service is string => typeof service === "string").slice(0, 12)
        : [];
      const catalogs = [...new Set(services.map((service) => serviceCatalogs[service]).filter(Boolean))].sort();
      const selectedCatalog = typeof body.service === "string" ? serviceCatalogs[body.service] : undefined;
      if (!selectedCatalog || !catalogs.includes(selectedCatalog)) return respond({ error: "Choose a selected streaming service." }, 400);
      // Query only the provider being viewed so each 25-change page is dense with its titles.
      const queryCatalogs = [selectedCatalog];

      const region = validRegion(body.region).toLowerCase();
      const today = new Date().toISOString().slice(0, 10);
      const cursor = typeof body.cursor === "string" && body.cursor.length <= 300 ? body.cursor : "";
      const emptyCacheKey = `expiring-empty-v1:${region}:${selectedCatalog}`;
      if (!cursor) {
        const emptyCache = await readDailyCache(emptyCacheKey, today).catch((error) => {
          console.error("daily empty-expiry cache read failed", error);
          return null;
        });
        if (emptyCache?.empty === true) {
          return respond({ results: [], hasMore: false, nextCursor: null, region: region.toUpperCase(), cacheHit: true, updatedDate: today });
        }
      }
      // The upstream API fixes each page at 25 changes. On explicit load-more,
      // bundle up to three cursor pages into one app response and cache each page.
      const pageLimit = cursor && body.batch === true ? 3 : 1;
      const changes = [];
      const shows = {};
      let pageCursor = cursor;
      let hasMore = false;
      let cacheHit = true;
      for (let page = 0; page < pageLimit; page++) {
        const cacheKey = `expiring-v2:${region}:${selectedCatalog}:${pageCursor}`;
        let payload = await readDailyCache(cacheKey, today).catch((error) => {
          console.error("daily expiry cache read failed", error);
          return null;
        });
        if (!payload) {
          cacheHit = false;
          const params = new URLSearchParams({
            country: region,
            change_type: "expiring",
            item_type: "show",
            show_type: "movie",
            include_unknown_dates: "false",
            order_direction: "asc",
            catalogs: queryCatalogs.map((catalog) => `${catalog}.subscription`).join(","),
          });
          if (pageCursor) params.set("cursor", pageCursor);
          const response = await fetch(`${AVAILABILITY_API}/changes?${params}`, {
            headers: { accept: "application/json", "X-API-Key": availabilityKey },
          });
          if (!response.ok) throw new Error(`Streaming availability provider returned ${response.status}`);
          payload = await response.json();
          await writeDailyCache(cacheKey, today, payload).catch((error) => console.error("daily expiry cache write failed", error));
        }
        changes.push(...(payload.changes ?? []));
        Object.assign(shows, payload.shows ?? {});
        hasMore = Boolean(payload.hasMore);
        pageCursor = payload.nextCursor ?? null;
        if (!hasMore || !pageCursor) break;
      }
      const results = expiringMovies({ changes, shows }, selectedCatalog);
      // A provider with no matching movie departures should not invite repeated
      // pagination requests. Keep that empty answer shared for the rest of today.
      if (!cursor && results.length === 0) {
        await writeDailyCache(emptyCacheKey, today, { empty: true }).catch((error) => console.error("daily empty-expiry cache write failed", error));
        return respond({ results, hasMore: false, nextCursor: null, region: region.toUpperCase(), cacheHit, updatedDate: today });
      }
      return respond({ results, hasMore, nextCursor: pageCursor, region: region.toUpperCase(), cacheHit, updatedDate: today });
    }
    if (action !== "home") return respond({ error: "Unknown action." }, 400);

    const requestedMonth = Number(body.month);
    const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12 ? requestedMonth : new Date().getMonth() + 1;
    const theme = MONTHLY_THEMES[month - 1];
    const today = new Date().toISOString().slice(0, 10);
    const [trending, keywordMatch] = await Promise.all([
      tmdb("/trending/movie/week?language=en-US", token),
      resolveKeyword(theme.keyword, token, today),
    ]);
    let themedMovies: any[] = [];
    if (keywordMatch?.id) {
      const params = new URLSearchParams({ include_adult: "false", include_video: "false", language: "en-US", page: "1", sort_by: "popularity.desc", "vote_count.gte": "10" });
      params.set("with_keywords", String(keywordMatch.id));
      const themeCacheKey = `discover-v1:${params.toString()}`;
      const cached = await readDailyCache(themeCacheKey, today).catch(() => null);
      if (cached) themedMovies = cached.results ?? [];
      else {
        const themed = await tmdb(`/discover/movie?${params.toString()}`, token);
        themedMovies = themed.results ?? [];
        await writeDailyCache(themeCacheKey, today, { results: themedMovies, page: 1, totalPages: Math.min(500, Number(themed.total_pages ?? 1)), region: "US", cacheHit: false }).catch((error) => console.error("daily monthly theme cache write failed", error));
      }
    }
    return respond({
      shelves: [
        { title: "Trending this week", movies: trending.results ?? [] },
        { title: `${theme.month} · ${theme.title}`, theme: month, movies: themedMovies },
      ],
    });
  } catch (error) {
    console.error("home-movies error", error);
    return respond({ error: "Could not load movies from TMDB. Please try again." }, 502);
  }
});

const serviceAliases: Record<string, string[]> = {
  "Netflix": ["Netflix"],
  "Prime Video": ["Prime Video", "Amazon Prime Video"],
  "Disney+": ["Disney+", "Disney Plus"],
  "Apple TV+": ["Apple TV", "Apple TV+", "Apple TV Plus"],
  "Max": ["Max", "HBO Max"],
  "Hulu": ["Hulu"],
  "Paramount+": ["Paramount+", "Paramount Plus", "Paramount Plus Premium", "Paramount Plus Essential"],
  "Peacock": ["Peacock", "Peacock Premium", "Peacock Premium Plus"],
  "Crunchyroll": ["Crunchyroll"],
};

const serviceCatalogs: Record<string, string> = {
  "Netflix": "netflix",
  "Prime Video": "prime",
  "Disney+": "disney",
  "Apple TV+": "apple",
  "Max": "hbo",
  "Hulu": "hulu",
  "Paramount+": "paramount",
  "Peacock": "peacock",
  "Crunchyroll": "crunchyroll",
};

async function readDailyCache(cacheKey: string, today: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;
  const url = new URL(`${supabaseUrl}/rest/v1/streaming_expiry_cache`);
  url.searchParams.set("select", "payload");
  url.searchParams.set("cache_key", `eq.${cacheKey}`);
  url.searchParams.set("cache_date", `eq.${today}`);
  url.searchParams.set("limit", "1");
  const response = await fetch(url, { headers: restHeaders(serviceRoleKey) });
  if (!response.ok) throw new Error("Could not read the daily streaming cache.");
  const rows = await response.json();
  return rows[0]?.payload ?? null;
}

function parseGeminiRecommendation(text: string): { summary: string; recommendations: any[] } | null {
  if (!text) return null;
  const candidates = [text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()];
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) candidates.push(text.slice(firstBrace, lastBrace + 1));
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (!parsed || typeof parsed !== "object") continue;
      const raw = parsed.movies ?? parsed.recommendations ?? parsed.results;
      if (!Array.isArray(raw)) continue;
      const recommendations = raw.map((item: any) => typeof item === "string"
        ? { title: item, year: null }
        : item && typeof item === "object"
          ? { title: item.title ?? item.name, year: item.year ?? null }
          : null).filter((item: any) => typeof item?.title === "string" && item.title.trim());
      if (!recommendations.length) continue;
      return {
        summary: typeof parsed.summary === "string" ? parsed.summary : typeof parsed.answer === "string" ? parsed.answer : "Here are a few movies that fit your mood.",
        recommendations,
      };
    } catch {
      // Try the next extracted JSON candidate, including fenced model output.
    }
  }
  return null;
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function resolveKeyword(keyword: string, token: string, today: string) {
  const keywordCacheKey = `discover-keyword-v1:${normalizeTitle(keyword)}`;
  let keywordMatch = await readDailyCache(keywordCacheKey, today).catch(() => null);
  if (!keywordMatch) {
    const keywordResults = await tmdb(`/search/keyword?query=${encodeURIComponent(keyword)}&page=1`, token);
    const matches = keywordResults.results ?? [];
    const exact = matches.find((match: any) => normalizeTitle(match.name ?? "") === normalizeTitle(keyword));
    keywordMatch = exact ?? matches[0] ?? null;
    if (keywordMatch) await writeDailyCache(keywordCacheKey, today, keywordMatch).catch((error) => console.error("daily discover keyword cache write failed", error));
  }
  return keywordMatch;
}

async function writeDailyCache(cacheKey: string, today: string, payload: unknown) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return;
  const response = await fetch(`${supabaseUrl}/rest/v1/streaming_expiry_cache?on_conflict=cache_key`, {
    method: "POST",
    headers: { ...restHeaders(serviceRoleKey), "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ cache_key: cacheKey, cache_date: today, payload, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error("Could not save the daily streaming cache.");
}

function restHeaders(serviceRoleKey: string) {
  return { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` };
}

function expiringMovies(payload: any, selectedCatalog: string) {
  const movies = new Map<string, any>();
  const showMap = payload?.shows ?? {};
  for (const change of payload?.changes ?? []) {
    const serviceId = String(change.service?.id ?? change.service?.serviceId ?? "").toLowerCase();
    if (serviceId !== selectedCatalog || change.showType !== "movie") continue;
    const show = showMap[String(change.showId)];
    if (!show || show.showType !== "movie") continue;
    const key = String(show.tmdbId ?? show.id);
    const timestamp = Number(change.timestamp);
    const expiryAt = Number.isFinite(timestamp) && timestamp > 0 ? new Date(timestamp * 1000).toISOString() : null;
    const current = movies.get(key);
    if (current) {
      if (expiryAt && (!current.expiryAt || expiryAt < current.expiryAt)) current.expiryAt = expiryAt;
      continue;
    }
    movies.set(key, {
      id: key,
      tmdbId: parseTmdbMovieId(show.tmdbId),
      title: show.title ?? "Untitled movie",
      year: show.releaseYear ?? "",
      genre: (show.genres ?? []).map((genre: any) => typeof genre === "string" ? genre : genre.name).filter(Boolean).slice(0, 2).join(" · ") || "Movie",
      runtime: show.runtime ? `${Math.floor(show.runtime / 60)}h ${show.runtime % 60}m` : "See details",
      image: findImageUrl(show.imageSet?.verticalPoster) || findImageUrl(show.imageSet?.horizontalPoster) || "",
      shots: [findImageUrl(show.imageSet?.horizontalBackdrop) || findImageUrl(show.imageSet?.horizontalPoster)].filter(Boolean),
      tone: "lavender",
      tags: [],
      overview: show.overview ?? "",
      hideRating: true,
      expiryAt,
    });
  }
  return [...movies.values()].sort((a, b) => {
    if (!a.expiryAt) return b.expiryAt ? 1 : 0;
    if (!b.expiryAt) return -1;
    return a.expiryAt.localeCompare(b.expiryAt);
  });
}

function findImageUrl(value: unknown): string {
  if (typeof value === "string") return value.startsWith("https://") ? value : "";
  if (!value || typeof value !== "object") return "";
  for (const child of Object.values(value)) {
    const found = findImageUrl(child);
    if (found) return found;
  }
  return "";
}

function normalizeName(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeTitle(value: string) {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function parseTmdbMovieId(value: unknown): number | null {
  const match = String(value ?? "").match(/^(?:movie\/)?(\d+)$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validRegion(value: unknown) {
  return typeof value === "string" && /^[A-Za-z]{2}$/.test(value) ? value.toUpperCase() : "US";
}

function validYear(value: unknown) {
  const year = Number(value);
  const currentYear = new Date().getUTCFullYear() + 1;
  return Number.isInteger(year) && year >= 1870 && year <= currentYear ? year : null;
}

function validDecimal(value: unknown, minimum: number, maximum: number) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum && number <= maximum ? Math.round(number * 10) / 10 : null;
}

async function tmdb(path: string, token: string) {
  const response = await fetch(`${TMDB_API}${path}`, {
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`);
  return await response.json();
}

async function fetchImdbRating(imdbId: string, apiKey: string) {
  try {
    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("i", imdbId);
    url.searchParams.set("apikey", apiKey);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OMDb returned ${response.status}`);
    const data = await response.json();
    return data.Response === "True" && data.imdbRating !== "N/A" ? String(data.imdbRating ?? "") : "";
  } catch (error) {
    console.error("IMDb rating lookup failed", error);
    return "";
  }
}

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}
