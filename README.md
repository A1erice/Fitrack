# Fitrack

A phone-first personal movie tracker for discovering films, saving a watchlist, and organizing favorites.

## Product direction

- **Home:** recently added and watched movies.
- **Discover:** one movie at a time; swipe left to pass and right to like.
- **Watchlist:** central destination for movies to watch.
- **Lists:** Favorites by default, with custom lists planned.
- **More:** reserved for future settings and options.

A movie can be both a favorite and on the watchlist. Favorites mean “I like this”; watchlist means “I want to watch this.”

## Planned services

- **TMDB** for movie metadata and artwork. Non-commercial use requires TMDB attribution; include the required logo and credit in an About/Credits area. Review TMDB's current terms before launch.
- **Supabase** for authentication and per-user movie lists.
- **Cloudflare Pages** for hosting on a generated `pages.dev` address.

Free tiers and terms may change. Supabase's free projects may pause after inactivity. Never commit API secrets; keep private credentials in local environment variables and deployment settings.

## Project status

Planning and project setup. The application implementation has not started.

See [project guidance](AGENTS.md) and [product plan](docs/PRODUCT_PLAN.md).

