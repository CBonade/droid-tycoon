# Droid Tycoon Planner

Mobile-first PWA for planning Super Rebirth targets in Star Wars: Droid Tycoon (Fortnite).

## Stack

- **Frontend**: React + Vite 7 + Tailwind CSS, deployed to Vercel (auto-deploy on push to main)
- **Backend**: Supabase (Postgres + RLS, no auth) — shared project `bbfnwswogaesrpifuoht` with sprite-tracker
- **Repo**: github.com/CBonade/droid-tycoon (commit directly to main, no branches/PRs)

## Environment variables

Create a `.env` file (gitignored) with:
```
VITE_SUPABASE_URL=https://bbfnwswogaesrpifuoht.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key — same as sprite-tracker>
```

`VITE_` vars are baked into the client bundle at build time. Vercel env var changes require a redeploy.

## Schema changes

Shares its Supabase project (`bbfnwswogaesrpifuoht`) with sprite-tracker. For schema changes (new tables/columns/constraints), use the Supabase Management API via the CLI rather than the SQL editor — see sprite-tracker's `CLAUDE.md` "Schema changes" section for the exact steps and the Keychain PAT entry (`cc/personal/supabase/bbfnwswogaesrpifuoht-pat`) shared across both projects.

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
- **Target stepper**: the Super Rebirth step the user is planning toward (min 1, max 27 currently, `MAX_STEP` in `rarity.js`). Displays the credits required at that step from `STEP_COSTS`
- **Current stepper**: the step the user is *actually* at right now (separate from target) — min 0, same max as target
- **Droid list**: computed from `droid_tycoon_requirements` filtered to `step <= target`, grouped per droid. Each droid shows its first-appearance step, its highest rarity needed up to the target, and its last-needed step (the "safe to sell" point)
- **View toggle** — three tabs, all driven by the **Current** stepper (each tab shows a live count):
  - **Still Needed** (`needed`): droids still required to reach your **Target** — last-needed step is still ahead of current (`lastStep > current`). Each row shows the **highest rarity** needed for that droid across every step up to Target (`maxRarity`).
  - **Up Next** (`upNext`): the exact droids + rarities required at your **next** rebirth only (`step === current + 1`), sorted by name. Independent of Target, and it **hides the sort/search bar** (uses the `upNext` card variant).
  - **Ready to Sell** (`sell`): droids no longer needed at current progress (`lastStep <= current`, within the Target range). Droids that became sellable *exactly at* current are flagged **new** (`isNew`); switching to this tab defaults the sort to newest-sellable-first (`recentSell` / "Recently Sellable", a sort option that only appears on this tab).
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

Push to main → Vercel builds and deploys automatically.

Set these env vars in the Vercel dashboard (Project → Settings → Environment Variables):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Commit per feature as usual, but do not push after every commit.** Vercel's free tier caps monthly deploys, and this project (and sprite-tracker, on the same plan) blew through that cap in under 2 days when every commit auto-deployed. Batch commits locally and push only once a full round of work is ready to ship, then push everything together in one go (multiple commits in that push is fine — each commit should still represent one feature/fix, per normal commit hygiene).

## Releases

Every time a batch is pushed (see the push-batching note above), tag a release and publish notes — this is routine, not something that waits for the user to ask. Use semantic versioning: bump minor for new features, patch for fixes/docs-only batches. Generate notes as a short bullet list from the commits since the last tag (`git log <last-tag>..HEAD --oneline`), grouped by feature/fix, not a raw commit dump. No tags exist yet as of 2026-07-09 — the first push under this convention starts at v0.1.0.

```bash
git tag v0.1.0
git push origin v0.1.0
gh release create v0.1.0 --title "v0.1.0" --notes "..."
```

No in-app release-notes display yet — that's deferred to a future iteration. For now this is purely the tag + GitHub release.
