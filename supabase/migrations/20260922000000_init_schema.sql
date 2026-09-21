-- DASI Database Schema Migration

-- 1. Pickup Shops
CREATE TABLE IF NOT EXISTS pickup_shops (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  master_name TEXT NOT NULL,
  master_experience_years INTEGER NOT NULL DEFAULT 0,
  master_quote TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  open_hours TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cameras
CREATE TABLE IF NOT EXISTS cameras (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  era TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('film', 'digital_compact', 'vintage_ccd')),
  condition_grade TEXT NOT NULL CHECK (condition_grade IN ('Mint', 'Excellent', 'Good')),
  rental_price_per_day INTEGER NOT NULL DEFAULT 0,
  purchase_price INTEGER NOT NULL DEFAULT 0,
  shop_id TEXT REFERENCES pickup_shops(id) ON DELETE SET NULL,
  shop_name TEXT NOT NULL DEFAULT '',
  pickup_location TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sample_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL DEFAULT '',
  story TEXT NOT NULL DEFAULT '',
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_available BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Analog Spots
CREATE TABLE IF NOT EXISTS analog_spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('lab', 'film_shop', 'vending_machine', 'repair', 'pickup')),
  is_micro_ad_partner BOOLEAN NOT NULL DEFAULT false,
  partner_badge_text TEXT,
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  open_hours TEXT NOT NULL DEFAULT '',
  today_scan_cutoff TEXT,
  film_stock_status TEXT,
  scanner_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  sample_color_tone_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  promo_notice TEXT,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Repair Masters
CREATE TABLE IF NOT EXISTS repair_masters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  profile_image TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL DEFAULT '',
  available_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Photo Gigs
CREATE TABLE IF NOT EXISTS photo_gigs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_avatar TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL,
  gear_used JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_per_hour INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  portfolio_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL DEFAULT '',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  languages JSONB NOT NULL DEFAULT '["한국어"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Experiences
CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('photo_walk', 'master_class')),
  title TEXT NOT NULL,
  host_name TEXT NOT NULL,
  host_role TEXT NOT NULL,
  host_avatar TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL,
  date_time TEXT NOT NULL,
  duration TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  rental_package_discount TEXT NOT NULL DEFAULT '',
  capacity TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  included JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Rentals (Rent-to-Own Tracking)
CREATE TABLE IF NOT EXISTS rentals (
  id TEXT PRIMARY KEY,
  camera_id TEXT REFERENCES cameras(id) ON DELETE SET NULL,
  camera_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  rental_days INTEGER NOT NULL DEFAULT 1,
  rental_paid INTEGER NOT NULL DEFAULT 0,
  purchase_total INTEGER NOT NULL DEFAULT 0,
  is_converted_to_own BOOLEAN NOT NULL DEFAULT false,
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Repair Inquiries / Estimates
CREATE TABLE IF NOT EXISTS repair_estimates (
  id TEXT PRIMARY KEY,
  camera_model TEXT NOT NULL,
  symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
  details TEXT NOT NULL DEFAULT '',
  master_name TEXT NOT NULL DEFAULT '',
  estimate_code TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'diagnosing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE pickup_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE analog_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_estimates ENABLE ROW LEVEL SECURITY;

-- Read policies (Public Access)
CREATE POLICY "Allow public read pickup_shops" ON pickup_shops FOR SELECT USING (true);
CREATE POLICY "Allow public read cameras" ON cameras FOR SELECT USING (true);
CREATE POLICY "Allow public read analog_spots" ON analog_spots FOR SELECT USING (true);
CREATE POLICY "Allow public read repair_masters" ON repair_masters FOR SELECT USING (true);
CREATE POLICY "Allow public read photo_gigs" ON photo_gigs FOR SELECT USING (true);
CREATE POLICY "Allow public read experiences" ON experiences FOR SELECT USING (true);
CREATE POLICY "Allow public read rentals" ON rentals FOR SELECT USING (true);
CREATE POLICY "Allow public read repair_estimates" ON repair_estimates FOR SELECT USING (true);

-- Write policies (Public/Anon Insert & Update)
CREATE POLICY "Allow public insert rentals" ON rentals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update rentals" ON rentals FOR UPDATE USING (true);
CREATE POLICY "Allow public insert repair_estimates" ON repair_estimates FOR INSERT WITH CHECK (true);
