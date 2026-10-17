import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TMDB_API = "https://api.themoviedb.org/3";
const AVAILABILITY_API = "https://api.movieofthenight.com/v4";

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond({ error: "Use POST." }, 405);

  const token = Deno.env.get("TMDB_READ_ACCESS_TOKEN");
  if (!token) return respond({ error: "Movie catalog is not configured yet." }, 500);

  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action;
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

    const [trending, popular] = await Promise.all([
      tmdb("/trending/movie/week?language=en-US", token),
      tmdb("/movie/popular?language=en-US&page=1", token),
    ]);
    return respond({
      shelves: [
        { title: "Trending this week", movies: trending.results ?? [] },
        { title: "Popular movies", movies: popular.results ?? [] },
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

function validRegion(value: unknown) {
  return typeof value === "string" && /^[A-Za-z]{2}$/.test(value) ? value.toUpperCase() : "US";
}

async function tmdb(path: string, token: string) {
  const response = await fetch(`${TMDB_API}${path}`, {
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`);
  return await response.json();
}

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}
