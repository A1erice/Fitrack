# Project guidance

## Product
- Build a phone-first web app for one person's movie collection. Desktop support is out of scope until requested.
- Keep five bottom navigation destinations: Home, Discover, Watchlist (visually emphasized center action), Lists, More.
- Treat Watchlist as movies the user intends to watch. Favorites are movies the user likes. A movie may belong to both.
- Start Lists with Favorites; allow custom lists as a later feature. Keep More as a purposeful placeholder until options are defined.

## Architecture direction
- Planned services: TMDB for movie catalog data, Supabase Auth and Postgres for accounts and personal data, Cloudflare Pages for hosting.
- Keep user-owned records protected by authentication and database row-level security. Never expose a service-role key in browser code.
- Use environment variables for credentials. Commit only a safe `.env.example` with placeholder values.
- Credit TMDB and follow its current API terms before launch.

## Working style
- Prefer accessible, touch-friendly controls and responsive layouts designed for narrow phone screens first.
- Keep dependencies small and document setup commands in README.
- Update docs when product scope, data model, or service decisions change.
- Before each GitHub push, increment the patch version in `package.json`; show that version dynamically in the app instead of hard-coding it.
- Do not add tests unless specifically requested; when the user asks for verification, run the relevant checks and report results.

