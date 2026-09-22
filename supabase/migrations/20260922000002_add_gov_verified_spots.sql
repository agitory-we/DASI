-- Add is_gov_verified and sub_tags to analog_spots
ALTER TABLE analog_spots ADD COLUMN IF NOT EXISTS is_gov_verified BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE analog_spots ADD COLUMN IF NOT EXISTS sub_tags JSONB NOT NULL DEFAULT '[]'::jsonb;