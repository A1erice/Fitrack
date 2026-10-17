# Product plan

## Goal
A private, phone-first web app to track movies the user likes and wants to watch, with online access and account-backed persistence.

## Navigation
1. **Home:** recently added movies and recent watched activity.
2. **Discover:** a movie recommendation card; swipe/tap left to pass and right to like. Provide accessible buttons and an undo path.
3. **Watchlist:** main destination and emphasized center navigation button; shows movies intended for later viewing.
4. **Lists:** Favorites exists by default; custom lists can be added later.
5. **More:** reserved for future options.

## Core concepts
- **Liked/Favorite:** the user likes the movie.
- **Watchlisted:** the user intends to watch the movie.
- **Watched:** the user has seen the movie; preserve liked status independently.
- These states can overlap where meaningful.

## First useful release
- Sign up/sign in and sign out.
- Search TMDB and view movie details.
- Add/remove a movie from Watchlist and Favorites.
- Mark a watchlisted movie watched.
- Discover movies and record like/pass decisions, with undo.
- Show recently added/watched items on Home.
- Persist personal data per account with access controls.

## Suggested data model
- `profiles`: user id and minimal account profile fields.
- `movies`: TMDB id plus only the metadata needed for display/cache.
- `user_movies`: user id, TMDB movie id, liked, watchlisted, watched, timestamps, optional personal rating/notes.
- `lists`: user id, name, created timestamp.
- `list_movies`: list id, TMDB movie id, added timestamp.

Add database row-level security so users can access only their own profile, lists, and user movie states. Avoid storing more TMDB content than allowed by its current terms.

## Technical direction
- TMDB API: movie metadata, posters, discovery, and provider logos. Credit TMDB and JustWatch.
- Streaming Availability API by Movie of the Night: U.S. subscription departures with exact expiry dates. Cache selected-service results in Supabase for one UTC day; credit the provider in More.
- Supabase Auth with Google OAuth is the primary sign-in method. First-time users select the streaming services they currently use; that preference is stored in their profile for future recommendations.
- Supabase Postgres holds profiles under row-level security. Movie lists and activity are still in-memory sample data and need their own persistence implementation.
- Supabase free tier is suitable for a small personal project but may pause inactive projects.
- Cloudflare Pages: deploy the phone-first web frontend on a free generated subdomain.
- Custom domain, desktop layout, social features, and advanced recommendation tuning are out of initial scope.

## Open decisions for implementation
- Whether to seed Discover with popular movies, genres, or a mix.
- Whether “watched” items remain in Watchlist or move to a separate history.

