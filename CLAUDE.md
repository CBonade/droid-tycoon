# Droid Tycoon Planner

Mobile-first PWA for planning Super Rebirth targets in Star Wars: Droid Tycoon (Fortnite).

## Stack

- **Frontend**: React + Vite 7 + Tailwind CSS, deployed to Netlify (auto-deploy on push to main)
- **Backend**: Supabase (Postgres + RLS, no auth) — shared project `bbfnwswogaesrpifuoht` with sprite-tracker
- **Repo**: github.com/CBonade/droid-tycoon (commit directly to main, no branches/PRs)

## Environment variables

Create a `.env` file (gitignored) with:
```
VITE_SUPABASE_URL=https://bbfnwswogaesrpifuoht.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key — same as sprite-tracker>
```

`VITE_` vars are baked into the client bundle at build time. Netlify env var changes require a redeploy.

## Data model

All tables are prefixed `droid_tycoon_` to avoid collisions with sprite-tracker.

**`droid_tycoon_droids`**: `id`, `name` (unique), `image_url` (nullable)

**`droid_tycoon_requirements`**: `id`, `cycle` (1–4), `step` (1–27), `droid_id` → droids, `rarity` (base/gold/diamond/rainbow/beskar)

No auth — both tables have RLS enabled with a public SELECT policy.

## Setup (first time)

1. Run `supabase/schema.sql` in the Supabase SQL editor
2. Run `supabase/seed.sql` in the Supabase SQL editor
3. Create `.env` as shown above
4. `npm install`
5. `npm run gen-icons` (generates PWA icons in `public/`)
6. `npm run dev`

## How the app works

- **Cycle picker** (1–4): identifies which Super Rebirth cycle the user is in via their Rebirth 1 droid trio
- **Target stepper**: sets the planned Super Rebirth step (min 1, max 23 currently)
- **Droid list**: each droid shown once, sorted by first appearance step, with the highest rarity needed up to the target and the last step they're needed (safe-to-sell point)
- State lives in URL params (`?cycle=2&target=20`) + localStorage — no login required, links are shareable

## Adding droid images

Run a SQL update against `droid_tycoon_droids`:
```sql
UPDATE droid_tycoon_droids SET image_url = '<url>' WHERE name = '<name>';
```

Images are fetched and cached by the client. No redeploy needed.

## Updating game data (new rebirth steps added by Epic)

Add new rows to `supabase/seed.sql` and re-run the affected INSERT block in the Supabase SQL editor. The `ON CONFLICT DO NOTHING` clause makes it safe to re-run the entire seed.

Also update `MAX_STEP` in `src/utils/rarity.js` and add the new cost to `STEP_COSTS`.

## Deployment

Push to main → Netlify builds and deploys automatically.

Set these env vars in the Netlify dashboard (Settings → Environment variables):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Releases

Tag and release on GitHub when asked:
```bash
git tag v0.1.0
git push origin v0.1.0
gh release create v0.1.0 --title "v0.1.0" --notes "..."
```
