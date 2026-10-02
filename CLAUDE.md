# Droid Tycoon Planner

Mobile-first PWA for planning Super Rebirth targets in Star Wars: Droid Tycoon (Fortnite).

## Stack

- **Frontend**: React + Vite 7 + Tailwind CSS, deployed to Vercel (auto-deploy on push to main)
- **Backend**: Supabase (Postgres + RLS, no auth) — shared project `bbfnwswogaesrpifuoht` with sprite-tracker
- **Repo**: github.com/CBonade/droid-tycoon (commit directly to main, no branches/PRs)

## Scope discipline

Change only what was asked. When adding new game data (new rebirth steps, tiers, reference rows), leave existing data alone and don't propose "corrections" to it — the existing requirements have been checked in-game, and a disagreeing wiki or guide is not a reason to touch them. If a source conflicts with existing data, mention it only when asked.

## Environment variables

Create a `.env` file (gitignored) with:
```
VITE_SUPABASE_URL=https://bbfnwswogaesrpifuoht.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key — same as sprite-tracker>
```

`VITE_` vars are baked into the client bundle at build time. Vercel env var changes require a redeploy.

## Schema changes

Shares its Supabase project (`bbfnwswogaesrpifuoht`) with sprite-tracker. For schema **and data** changes (new tables/columns/constraints, or bulk requirement edits), run SQL against the Supabase Management API query endpoint, authenticated with the Supabase CLI login token (`npx supabase login`) — sprite-tracker's `CLAUDE.md` "Schema changes" section is the canonical write-path doc for the shared project and has the exact steps.

## Data model

All tables are prefixed `droid_tycoon_` to avoid collisions with sprite-tracker.

**`droid_tycoon_droids`**: `id`, `name` (unique), `image_url` (nullable)

**`droid_tycoon_requirements`**: `id`, `cycle` (1–5), `step` (1–40), `droid_id` → droids, `rarity` (base/gold/diamond/rainbow/beskar/galactic/stellar/kyber)

Both ranges are enforced by CHECK constraints (`droid_tycoon_requirements_step_check`, `droid_tycoon_requirements_rarity_check`), so a new step range or tier needs a constraint change in the live DB (and in `supabase/schema.sql`) before rows can be inserted.

Steps 36–40 are all Kyber requirements. Kyber has four in-game colors (Inactive/Green/Blue/Purple); any of them satisfies a requirement, so the app models Kyber as one tier.

No auth — both tables have RLS enabled with a public SELECT policy.

## Setup (first time)

1. Run `supabase/schema.sql` in the Supabase SQL editor
2. Run `supabase/seed.sql` in the Supabase SQL editor
3. Create `.env` as shown above
4. `npm install`
5. `npm run gen-icons` (generates PWA icons in `public/`)
6. `npm run dev`

## How the app works

- **Cycle picker** (1–5): identifies which Super Rebirth cycle the user is in by matching their Rebirth 1 droid trio against `CYCLE_IDENTIFIERS` in `src/utils/rarity.js`. Cycles 2 and 5 share the same Rebirth 1 trio (ID10/MOUSE/GONK) — `CYCLE_TIEBREAKERS` supplies a distinguishing Rebirth 2 droid shown on those two buttons
- **Target stepper**: the Super Rebirth step the user is planning toward (min 1, max 40 currently, `MAX_STEP` in `rarity.js`). Displays the credits required at that step from `STEP_COSTS`
- **Current stepper**: the step the user is *actually* at right now (separate from target) — min 0, same max as target
- **Droid list**: computed from `droid_tycoon_requirements` filtered to `step <= target`, grouped per droid. Each droid shows its first-appearance step, its highest rarity needed up to the target, and its last-needed step (the "safe to sell" point)
- **View toggle** — three tabs, all driven by the **Current** stepper (each tab shows a live count):
  - **Still Needed** (`needed`): droids still required to reach your **Target** — last-needed step is still ahead of current (`lastStep > current`). Each row shows the **highest rarity** needed for that droid across every step up to Target (`maxRarity`).
  - **Up Next** (`upNext`): the exact droids + rarities required at your **next** rebirth only (`step === current + 1`), sorted by name. Independent of Target, and it **hides the sort/search bar** (uses the `upNext` card variant).
  - **Ready to Sell** (`sell`): droids no longer needed at current progress (`lastStep <= current`, within the Target range). Droids that became sellable *exactly at* current are flagged **new** (`isNew`); switching to this tab defaults the sort to newest-sellable-first (`recentSell` / "Recently Sellable", a sort option that only appears on this tab).
- **Sort/search**: sort by first-needed step (default), rarity, or name; free-text name search
- **Portraits** follow the tier the card is about: Still Needed and Ready to Sell show the droid's highest needed tier (matching the badge); Up Next shows the tier that step requires. Kyber cards show the Stellar portrait (no Kyber art exists yet). See "Droid portraits" below.
- **Fusion panel** (tap a card): cards expand to show
  - a **Tier up** line — "Fuse 3× <tier below> X to get 1× <tier> X" (Still Needed and Up Next only, for any tier above base);
  - every **exclusive fusion recipe** the droid is an input to, with each input tagged by its status at current progress: *Need to R<n>* (still required), *Sellable*, or *Not in plan* (outside the Target range). A note under each recipe says whether every input is sellable (fuse instead of selling), whether fusing would consume a still-needed droid, or which inputs aren't in the plan.
  - Recipe inputs carry a teal **FUSION** chip (**FUSION ×N** for multiple recipes; **FUSION INPUT** on Ready to Sell). On Ready to Sell only recipe inputs expand. Status is computed from all requirements up to Target, independent of the search box.
  - Recipes live in `src/data/fusions.js` (`FUSION_RECIPES`). Fusion-only droids are never rebirth requirements, so they are not in the database; their portraits are at `/droids/<slug>/base.webp`.
- **Reference Drawer** (swipe-up panel, opened via the header's REF button) — static lookup tables, not tied to any specific droid or DB row (see "Reference data" below)
- State (cycle, target, current) lives in URL params (`?cycle=2&target=20&current=14`) + localStorage (`dt_` prefix) — no login required, links are shareable

## Reference data (chip economy, Super Rebirth rewards, protocol droids)

All of this lives hardcoded in `src/components/ReferenceDrawer.jsx` — it is general game reference info, not derived from the database. Update it there directly when Epic changes these numbers; there is no ingestion script for it. Source for chips and protocol bonuses: [gonk.tools/wiki](https://gonk.tools/wiki) (droid catalogue per rarity, and its Upgrade Costs tab).

- **Super Rebirth Rewards** (`SRB_REWARDS`): per Rebirth level 12–40, the crystal reward and the credit/XP multiplier bonuses earned.
- **Upgrade Chips** — one table with an Upgrade cost / Sell value toggle, tiers as rows and droid classes as columns (eight tiers don't fit across a phone):
  - `CHIP_UPGRADE_COSTS`: chips to upgrade a slot *into* each tier from the tier below, Gold through Kyber, all five classes.
  - `CHIP_SELL_VALUES`: chips earned selling a droid of each tier, Gold through Kyber, all five classes (Base droids sell for 0 chips).
  - `ChipTable` draws one column per class and one row per tier present in the data, so the tables can carry different class or tier sets without breaking.
- **Protocol Droids** (`PROTOCOL_DROIDS`): SA-5 (Rare), LOM (Epic), PZ (Legendary), TDA (Mythic). Each droid bay has one protocol slot for credits per second and one for crafting speed; a protocol droid gives a CPS bonus or a crafting-speed bonus to that bay depending on the slot. Only the Base-tier percentages are stored — each tier multiplies them by its tier number (Base ×1 … Kyber ×8), which matches gonk.tools through Stellar; gonk.tools derives the Kyber value with the same formula. Where to get them isn't shown — they all come from World Mission crates. C-3PO is also typed Protocol in-game but is an Iconic with no bay bonus, so it isn't listed.

**Important distinction**: droid "class" (Common/Rare/Epic/Legendary/Mythic) used here is a *different* axis from `rarity` (base/gold/…/kyber) used in `droid_tycoon_requirements` and the droid list. Class is not a column anywhere in the schema (`droid_tycoon_droids` only has `id`/`name`/`image_url`) — it only exists as a classification inside these static reference tables. Don't assume a missing `class` column needs to be backfilled; the chip tables are intentionally general-purpose reference data, independent of any specific droid.

## Droid portraits

Portraits are **self-hosted** WebP files, one folder per droid and one file per tier: `public/droids/<slug>/<tier>.webp` (slug = droid name lowercased, runs of non-alphanumerics → `-`, e.g. `DRK-1 PROBE` → `drk-1-probe`; tiers `base` … `stellar`). There is no Kyber art yet; `portraitUrl()` in `src/utils/portrait.js` serves the Stellar file for Kyber.

`image_url` in `droid_tycoon_droids` holds either the folder (`/droids/<slug>/`, trailing slash — `portraitUrl()` appends `<tier>.webp`) or a single image URL used for every tier.

All art comes from [gonk.tools](https://gonk.tools/wiki). `npm run fetch-portraits` downloads every tier listed in `scripts/portrait-sources.json` (droid → gonk.tools image path per tier, plus the fusion-only droids' base portraits) and writes 256px WebP. To add a droid: add its entry to that JSON, run the script, commit the files, then

```sql
UPDATE droid_tycoon_droids SET image_url = '/droids/<slug>/' WHERE name = '<name>';
```

New files need a deploy (push) to go live; the SQL change itself does not — so run the SQL right before pushing, or live cards fall back to initials until the deploy lands. When Kyber portraits appear on gonk.tools, add a `kyber` path per droid and drop the Stellar fallback in `portraitUrl()`.

## Updating game data (new rebirth steps added by Epic)

Add new rows to `supabase/seed.sql` and re-run the affected INSERT block in the Supabase SQL editor. The `ON CONFLICT DO NOTHING` clause makes it safe to re-run the entire seed.

Also update `MAX_STEP` in `src/utils/rarity.js` and add the new cost to `STEP_COSTS`. If the new steps go past the step CHECK constraint (or use a new tier), widen the constraint first — see "Data model". A new tier also needs `RARITY_ORDER`/`RARITY_LABEL`/`RARITY_STYLES` in `rarity.js`, a badge class in `src/index.css`, a shadow in `tailwind.config.js`, and `RARITY_AVATAR` in `DroidCard.jsx`.

## Deployment

Push to main → Vercel builds and deploys automatically.

Set these env vars in the Vercel dashboard (Project → Settings → Environment Variables):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Commit per feature as usual, but do not push after every commit.** Vercel's free tier caps monthly deploys, and this project (and sprite-tracker, on the same plan) blew through that cap in under 2 days when every commit auto-deployed. Batch commits locally and push only once a full round of work is ready to ship, then push everything together in one go (multiple commits in that push is fine — each commit should still represent one feature/fix, per normal commit hygiene).

## Releases

Every time a batch is pushed (see the push-batching note above), tag a release and publish notes — this is routine, not something that waits for the user to ask. Use semantic versioning: bump minor for new features, patch for fixes/docs-only batches. Generate notes as a short bullet list from the commits since the last tag (`git log <last-tag>..HEAD --oneline`), grouped by feature/fix, not a raw commit dump. Tagging started at v0.1.0 (2026-07-10); bump from the latest tag (`git describe --tags --abbrev=0`).

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
gh release create vX.Y.Z --title "vX.Y.Z" --notes "..."
```

No in-app release-notes display yet — that's deferred to a future iteration. For now this is purely the tag + GitHub release.

## Future features (planned, not yet built)

### Iconic droid income optimizer
Guidance for when adding "iconic" droids maximizes total income.

- The base has a limited number of droid slots — believed to be **~25** total (needs confirmation).
- Most droids give a flat credits/second income. **Iconic** droids instead give a **percentage of your total income from all other droids** — either **15%** or **25%** per iconic.
- Because iconics are percentage-based, they're weak when your flat-income base is small. After a Super Rebirth wipe you start with only a few slots, so filling too many with iconics *lowers* total income versus flat-income droids. As you add more (and higher-value) flat droids, each iconic's percentage cut grows, so there's a crossover point where an iconic beats the best flat droid you could slot instead.
- Goal: given current slot count and income mix, tell the player when each iconic is worth slotting for maximum income (and how many iconics is optimal).
- Likely requires per-droid income values, which may be hard to source; also needs the confirmed slot count and the list of iconic droids and their percentages.
- Status: concept only. No research done yet (slot count, income values, iconic roster all TBD).
