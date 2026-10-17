# Fitrack

A phone-first personal movie tracker with a cozy, storybook RPG-inspired look.

## Run locally

```sh
npm install
npm run dev
```

## Home catalog integration

The Home screen can load trending, fantasy, and popular movie shelves plus submitted searches through the `home-movies` Supabase Edge Function. Google sign-in uses Supabase Auth. First-time users choose the streaming services they use, and that preference is saved to their private Supabase profile. Movie lists on other screens are still sample data held in browser memory.

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

## Google sign-in and first-time setup

1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` (the Supabase URL and publishable/anon key are safe for browser use; never use a service-role key here). Restart the Vite server after changing the file.
2. In Supabase **SQL Editor**, run [`supabase/migrations/202610170001_create_profiles.sql`](supabase/migrations/202610170001_create_profiles.sql). This creates the per-user profile table and row-level security rules.
3. In Google Cloud Console, create an OAuth 2.0 **Web application** client. Add your local app origin (for example `http://localhost:5173`) under Authorized JavaScript origins. Set the Authorized redirect URI to `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` (replace with the callback URL shown by Supabase).
4. In Supabase **Authentication → Sign In / Providers → Google**, enable Google and enter the OAuth client ID and client secret from Google Cloud.
5. In Supabase **Authentication → URL Configuration**, set the Site URL to your deployed app origin and add redirect URLs for local development (`http://localhost:5173/**`) and each deployed origin you use. If using a tunnel, add its current origin too; temporary tunnel addresses change.
6. Open Fitrack and choose **Continue with Google**. New accounts are asked which streaming services they use. The selection can be skipped and is saved to the signed-in user's profile.

The profile stores only a display name and selected service names. Fitrack does not sign in to those streaming services or read their accounts. Movie lists and ratings are not yet persisted per user.

TMDB ratings are labeled as TMDB ratings when loaded from TMDB; they are not IMDb scores. Free tiers and terms may change. Supabase's free projects may pause after inactivity. Never commit API secrets; keep private credentials in local environment variables and deployment settings.

See [project guidance](AGENTS.md) and [product plan](docs/PRODUCT_PLAN.md).
