-- Allow public insert and update for master tables (for seeding & partner sync)
CREATE POLICY "Allow public insert pickup_shops" ON pickup_shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update pickup_shops" ON pickup_shops FOR UPDATE USING (true);

CREATE POLICY "Allow public insert cameras" ON cameras FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update cameras" ON cameras FOR UPDATE USING (true);

CREATE POLICY "Allow public insert analog_spots" ON analog_spots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update analog_spots" ON analog_spots FOR UPDATE USING (true);

CREATE POLICY "Allow public insert repair_masters" ON repair_masters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update repair_masters" ON repair_masters FOR UPDATE USING (true);

CREATE POLICY "Allow public insert photo_gigs" ON photo_gigs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update photo_gigs" ON photo_gigs FOR UPDATE USING (true);

CREATE POLICY "Allow public insert experiences" ON experiences FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update experiences" ON experiences FOR UPDATE USING (true);