# Fitrack

A phone-first personal movie tracker with a cozy, storybook RPG-inspired look.

## Run locally

```sh
npm install
npm run dev
```

## Home catalog integration

The Home screen can load trending, fantasy, and popular movie shelves plus submitted searches through the `home-movies` Supabase Edge Function. The TMDB token is read only by that function. Other screens still use sample data and browser-memory interactions; Supabase authentication and user data persistence are not connected yet.

The More tab's About Fitrack panel shows the current app version and a short history of released features.

### Connect the Home catalog

1. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and publishable (or legacy anon) key. These are browser client settings; do not put a TMDB token in a `VITE_` variable.
2. In the Supabase Dashboard, open **Edge Functions → Secrets** and add `TMDB_READ_ACCESS_TOKEN` with your TMDB Read Access Token. The token already in the ignored local `.env` is not automatically uploaded to Supabase.
3. Install the Supabase CLI and sign in: `npx supabase login`.
4. Link this checkout to your Supabase project: `npx supabase link --project-ref YOUR_PROJECT_REF` (find the ref in the project URL or project settings).
5. Deploy the function: `npx supabase functions deploy home-movies`.
6. Run `npm run dev` and open Home. The function is read-only and does not require a signed-in user yet.

For local Edge Function development, put the TMDB token in `supabase/functions/.env` (ignored by Git) and run `npx supabase functions serve home-movies --env-file supabase/functions/.env` alongside the Vite server.

## Planned services

- **TMDB** for movie metadata and artwork. The required approved logo and non-endorsement notice appear under **More → Movie credits**. Review TMDB's current terms before launch.
- **Supabase** for authentication and per-user movie lists.
- **Cloudflare Pages** for hosting on a generated `pages.dev` address.

TMDB ratings are labeled as TMDB ratings when loaded from TMDB; they are not IMDb scores. Free tiers and terms may change. Supabase's free projects may pause after inactivity. Never commit API secrets; keep private credentials in local environment variables and deployment settings.

See [project guidance](AGENTS.md) and [product plan](docs/PRODUCT_PLAN.md).
