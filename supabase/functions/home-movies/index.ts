import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TMDB_API = "https://api.themoviedb.org/3";

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
    if (action !== "home") return respond({ error: "Unknown action." }, 400);

    const [trending, fantasy, popular] = await Promise.all([
      tmdb("/trending/movie/week?language=en-US", token),
      tmdb("/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=vote_average.desc&vote_count.gte=100&with_genres=14", token),
      tmdb("/movie/popular?language=en-US&page=1", token),
    ]);
    return respond({
      shelves: [
        { title: "Trending this week", movies: trending.results ?? [] },
        { title: "Fantasy favorites", movies: fantasy.results ?? [] },
        { title: "Popular movies", movies: popular.results ?? [] },
      ],
    });
  } catch (error) {
    console.error("home-movies error", error);
    return respond({ error: "Could not load movies from TMDB. Please try again." }, 502);
  }
});

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
