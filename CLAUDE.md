# Droid Tycoon Planner

Mobile-first PWA for planning Super Rebirth targets in Star Wars: Droid Tycoon (Fortnite).

## Stack

- **Frontend**: React + Vite 7 + Tailwind CSS, deployed to both Netlify and Vercel (both auto-deploy on push to main — Netlify via its GitHub App, Vercel via its own Git integration; kept in parallel, Netlify not yet decommissioned)
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

- **Cycle picker** (1–4): identifies which Super Rebirth cycle the user is in by matching their Rebirth 1 droid trio against `CYCLE_IDENTIFIERS` in `src/utils/rarity.js`
- **Target stepper**: the Super Rebirth step the user is planning toward (min 1, max 23 currently, `MAX_STEP` in `rarity.js`). Displays the credits required at that step from `STEP_COSTS`
- **Current stepper**: the step the user is *actually* at right now (separate from target) — min 0, same max as target
- **Droid list**: computed from `droid_tycoon_requirements` filtered to `step <= target`, grouped per droid. Each droid shows its first-appearance step, its highest rarity needed up to the target, and its last-needed step (the "safe to sell" point)
- **View toggle**: "Still Needed" (droids whose last-needed step is still ahead of `current`) vs "Ready to Sell" (droids whose last-needed step is already behind `current`) — this is what the Current stepper actually drives
- **Sort/search**: sort by first-needed step (default), rarity, or name; free-text name search
- **Reference Drawer** (swipe-up panel, opened via the header's REF button) — static lookup tables, not tied to any specific droid or DB row (see "Reference data" below)
- State (cycle, target, current) lives in URL params (`?cycle=2&target=20&current=14`) + localStorage (`dt_` prefix) — no login required, links are shareable

## Reference data (chip economy & Super Rebirth rewards)

All of this lives hardcoded in `src/components/ReferenceDrawer.jsx` — it is general game reference info, not derived from the database. Update it there directly when Epic changes these numbers; there is no ingestion script for it.

- **Super Rebirth Rewards** (`SRB_REWARDS`): per Rebirth level 12–27, the crystal reward and the credit/XP multiplier bonuses earned.
- **Chip Upgrade Costs** (`CHIP_UPGRADE_COSTS`) and **Chip Sell Values** (`CHIP_SELL_VALUES`): chips needed to upgrade a droid slot to a given rarity, and chips earned when selling a droid, broken out by droid **class** (Common/Rare/Epic/Legendary) × rarity tier (gold/diamond/rainbow/beskar).

**Important distinction**: droid "class" (Common/Rare/Epic/Legendary) used here is a *different* axis from `rarity` (base/gold/diamond/rainbow/beskar) used in `droid_tycoon_requirements` and the droid list. Class is not a column anywhere in the schema (`droid_tycoon_droids` only has `id`/`name`/`image_url`) — it only exists as a classification inside this static reference table. Don't assume a missing `class` column needs to be backfilled; the chip tables are intentionally general-purpose reference data, independent of any specific droid.

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

Push to main → both Netlify and Vercel build and deploy automatically in parallel (each has its own Git integration connected to this repo). Netlify is kept live as a fallback; Vercel is the actively-used deployment.

Set these env vars in **both** dashboards (Netlify: Settings → Environment variables; Vercel: Project → Settings → Environment Variables):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Releases

Tag and release on GitHub when asked:
```bash
git tag v0.1.0
git push origin v0.1.0
gh release create v0.1.0 --title "v0.1.0" --notes "..."
```
