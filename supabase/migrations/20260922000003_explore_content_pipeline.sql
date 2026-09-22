-- DASI Explore Content Pipeline
CREATE TABLE IF NOT EXISTS events (
  id            uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id     text            UNIQUE,
  source        text            NOT NULL DEFAULT 'manual',
  title         text            NOT NULL,
  location      text,
  area          text,
  start_date    text,
  end_date      text,
  image_url     text,
  lat           float8,
  lng           float8,
  tags          text[]          DEFAULT '{}',
  golden_hour   text,
  recommended_lenses text,
  tips          text,
  is_published  boolean         NOT NULL DEFAULT true,
  created_at    timestamptz     NOT NULL DEFAULT now(),
  updated_at    timestamptz     NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS photo_spots (
  id            uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text            NOT NULL,
  location      text,
  area          text,
  lat           float8,
  lng           float8,
  golden_hour   text,
  recommended_lenses text,
  film_tips     text,
  best_season   text[]          DEFAULT '{}',
  tags          text[]          DEFAULT '{}',
  image_url     text,
  is_verified   boolean         NOT NULL DEFAULT false,
  created_at    timestamptz     NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS daily_golden_hour (
  date                text        PRIMARY KEY,
  location            text        NOT NULL DEFAULT 'seoul',
  sunrise             text,
  sunset              text,
  morning_golden_start text,
  morning_golden_end   text,
  evening_golden_start text,
  evening_golden_end   text,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_area ON events(area);
CREATE INDEX IF NOT EXISTS idx_photo_spots_verified ON photo_spots(is_verified);
CREATE INDEX IF NOT EXISTS idx_photo_spots_area ON photo_spots(area);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_golden_hour ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_public_read ON events FOR SELECT USING (is_published = true);
CREATE POLICY photo_spots_public_read ON photo_spots FOR SELECT USING (is_verified = true);
CREATE POLICY golden_hour_public_read ON daily_golden_hour FOR SELECT USING (true);
CREATE POLICY events_service_write ON events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY photo_spots_service_write ON photo_spots FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY golden_hour_service_write ON daily_golden_hour FOR ALL USING (auth.role() = 'service_role');
