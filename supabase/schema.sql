-- Droid Tycoon Planner schema
-- Runs against the shared bbfnwswogaesrpifuoht Supabase project.
-- All tables are prefixed droid_tycoon_ to avoid collisions with sprite-tracker.

CREATE TABLE IF NOT EXISTS droid_tycoon_droids (
  id   SERIAL PRIMARY KEY,
  name TEXT   NOT NULL UNIQUE,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS droid_tycoon_requirements (
  id       SERIAL PRIMARY KEY,
  cycle    SMALLINT NOT NULL CHECK (cycle BETWEEN 1 AND 4),
  step     SMALLINT NOT NULL CHECK (step BETWEEN 1 AND 27),
  droid_id INTEGER  NOT NULL REFERENCES droid_tycoon_droids(id),
  rarity   TEXT     NOT NULL CHECK (rarity IN ('base','gold','diamond','rainbow','beskar')),
  UNIQUE (cycle, step, droid_id)
);

-- Public read — no auth needed for this app
ALTER TABLE droid_tycoon_droids       ENABLE ROW LEVEL SECURITY;
ALTER TABLE droid_tycoon_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read droids"
  ON droid_tycoon_droids FOR SELECT USING (true);

CREATE POLICY "public read requirements"
  ON droid_tycoon_requirements FOR SELECT USING (true);
