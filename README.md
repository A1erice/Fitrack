# Fitrack

A phone-first personal movie tracker with a cozy, storybook RPG-inspired look.

## Run locally

```sh
npm install
npm run dev
```

## Home catalog integration

The Home screen loads trending and popular movie shelves plus submitted searches through the `home-movies` Supabase Edge Function. It also has an AI movie-recommendation section after the seasonal shelf: Gemini returns a short explanation and movie suggestions, which are matched to TMDB records before they are shown. Matching prompts are cached in Supabase for one UTC day to reduce API use. Discover samples random release years and shuffled TMDB results by default, with multi-select genres, a release-year range, optional TMDB theme keywords, rating, runtime, language, streaming-service, and sort filters. It avoids movies already saved to any collection or the Quest Log. Passed movies are stored in a private per-account history; a single pass adds the movie to that list and hides it from Discover. Each filter/page response is cached in Supabase for one UTC day. Its compact **Leaving soon** shelf uses each user's saved streaming services to show U.S. subscription movies with announced departure dates in the next 31 days. Additional departure pages are fetched only when the user taps **Show more movies**. Quest Log entries are stored per account in Supabase, including the movie data needed to display catalog results and whether each movie is to watch or watched.

The account avatar opens streaming-provider settings and a per-account movie blacklist. Blacklisted release years, genres, and original languages are excluded from Home recommendations and Discover; explicit Home searches bypass the blacklist.

The More tab's About Fitrack panel shows the current app version and a short history of released features.

### Connect the Home catalog

1. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and publishable (or legacy anon) key. These are browser client settings; do not put a TMDB token in a `VITE_` variable.
2. In the Supabase Dashboard, open **Edge Functions → Secrets** and add `TMDB_READ_ACCESS_TOKEN` and `STREAMING_AVAILABILITY_API_KEY`. To enable AI movie recommendations, add `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey). To show IMDb ratings, also add an `OMDB_API_KEY` from [OMDb](https://www.omdbapi.com/apikey.aspx). These are server-side Edge Function secrets; do not add them to frontend `VITE_` variables. Secrets must be configured in each environment where the function runs. The token already in the ignored local `.env` is not automatically uploaded to Supabase.
3. Install the Supabase CLI and sign in: `npx supabase login`.
4. Link this checkout to your Supabase project: `npx supabase link --project-ref YOUR_PROJECT_REF` (find the ref in the project URL or project settings).
5. Apply database migrations: `npx supabase db push` (creates the private daily response cache, user collections, Quest Log tables, and private Discover pass history).
6. Deploy the function: `npx supabase functions deploy home-movies`.
7. Run `npm run dev` and open Home. The function reads catalog data and writes a server-side daily cache; it does not require a signed-in user yet.

For local Edge Function development, put the TMDB and Movie of the Night keys, plus the optional Gemini and OMDb keys, in `supabase/functions/.env` (ignored by Git) and run `npx supabase functions serve home-movies --env-file supabase/functions/.env` alongside the Vite server. After changing the function or adding its secrets in Supabase, deploy it with `npx supabase functions deploy home-movies`.

## Planned services

- **TMDB** for movie metadata and artwork. The required approved logo and non-endorsement notice appear under **More → Movie credits**. Review TMDB's current terms before launch.
- **Streaming Availability API by Movie of the Night** for announced streaming departures and expiry timestamps. The required attribution appears under **More → Movie credits**; response pages are cached for one UTC day to limit requests.
- **OMDb** (optional) for IMDb scores, using the TMDB movie's IMDb ID. Its key is stored only as a Supabase Edge Function secret.
- **Gemini 3.5 Flash-Lite** (optional) for short, prompt-based movie recommendations with minimal thinking for lower latency. Fitrack matches up to 20 suggestions to TMDB movie records; its key is stored only as a Supabase Edge Function secret. Recommendations are cached by prompt for one UTC day.
- **Supabase** for authentication and per-user movie lists.
- **Cloudflare Pages** for hosting on a generated `pages.dev` address.

## Google sign-in and first-time setup

1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` (the Supabase URL and publishable/anon key are safe for browser use; never use a service-role key here). Restart the Vite server after changing the file.
2. Apply the database migrations with `npx supabase db push`, or run the SQL files in `supabase/migrations/` in order from Supabase **SQL Editor**. This creates the per-user profile, collections, Quest Log, and private Discover pass history with row-level security.
3. In Google Cloud Console, create an OAuth 2.0 **Web application** client. Add your local app origin (for example `http://localhost:5173`) under Authorized JavaScript origins. Set the Authorized redirect URI to `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` (replace with the callback URL shown by Supabase).
4. In Supabase **Authentication → Sign In / Providers → Google**, enable Google and enter the OAuth client ID and client secret from Google Cloud.
5. In Supabase **Authentication → URL Configuration**, set the Site URL to your deployed app origin and add redirect URLs for local development (`http://localhost:5173/**`) and each deployed origin you use. If using a tunnel, add its current origin too; temporary tunnel addresses change.
6. Open Fitrack and choose **Continue with Google**. New accounts are asked which streaming services they use. The selection can be skipped and is saved to the signed-in user's profile.

The profile stores only a display name and selected service names. Fitrack does not sign in to those streaming services or read their accounts. Quest Log and collection records are saved separately for each signed-in account.

TMDB ratings are labeled as TMDB ratings; they are not IMDb scores. IMDb scores require the optional OMDb secret. Streaming-provider icons use TMDB/JustWatch, while departure dates come from Streaming Availability API by Movie of the Night. Expiry dates are shown only when the API supplies an exact date; they can change. Free tiers and terms may change. Supabase's free projects may pause after inactivity. Never commit API secrets; keep private credentials in local environment variables and deployment settings.

See [project guidance](AGENTS.md) and [product plan](docs/PRODUCT_PLAN.md).
