# Fitrack

A phone-first personal movie tracker with a cozy, storybook RPG-inspired look.

## Run locally

```sh
npm install
npm run dev
```

## Current frontend prototype

The five bottom navigation areas are Home, Discover, Quest Log (watchlist), Collections, and More. The middle Quest Log button is emphasized. The current screens use sample movie data and browser-memory interactions only; TMDB, Supabase authentication, and database persistence are not connected yet.

## Planned services

- **TMDB** for movie metadata and artwork. Non-commercial use requires TMDB attribution; include the required logo and credit in an About/Credits area. Review TMDB's current terms before launch.
- **Supabase** for authentication and per-user movie lists.
- **Cloudflare Pages** for hosting on a generated `pages.dev` address.

Free tiers and terms may change. Supabase's free projects may pause after inactivity. Never commit API secrets; keep private credentials in local environment variables and deployment settings.

See [project guidance](AGENTS.md) and [product plan](docs/PRODUCT_PLAN.md).
