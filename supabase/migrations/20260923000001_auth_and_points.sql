-- ==========================================
-- DASI 인증 & 포인트 시스템 마이그레이션
-- ==========================================

-- 1. 사용자 프로필 테이블 (Supabase auth.users 확장)
CREATE TABLE IF NOT EXISTS user_profiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname        text,
  avatar_url      text,
  phone           text,
  tier            text        NOT NULL DEFAULT 'filmmer',   -- 'filmmer' | 'photowalker' | 'legend'
  total_points    integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. DASI 포인트 적립/사용 이력 테이블
CREATE TABLE IF NOT EXISTS point_transactions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action          text        NOT NULL,  -- 'spot_report' | 'film_review' | 'photo_upload' | 'rental_review' | 'referral' | 'repair_case' | 'redeem'
  points          integer     NOT NULL,  -- 양수: 적립, 음수: 사용
  description     text,
  ref_id          text,                  -- 관련 리소스 ID (spot_id, camera_id 등)
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 3. 출사 명소 제보 테이블 (UGC)
CREATE TABLE IF NOT EXISTS spot_reports (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           text        NOT NULL,
  location        text        NOT NULL,
  lat             float8,
  lng             float8,
  golden_hour     text,
  film_tips       text,
  best_time       text,
  image_url       text,
  tags            text[]      DEFAULT '{}',
  status          text        NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  points_awarded  boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 4. 필름/카메라 리뷰 테이블
CREATE TABLE IF NOT EXISTS user_reviews (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type     text        NOT NULL,  -- 'camera' | 'spot' | 'lab' | 'gig'
  target_id       text        NOT NULL,
  rating          integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content         text,
  image_urls      text[]      DEFAULT '{}',
  film_used       text,
  points_awarded  boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_point_tx_user    ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_tx_action  ON point_transactions(action);
CREATE INDEX IF NOT EXISTS idx_spot_reports_status ON spot_reports(status);
CREATE INDEX IF NOT EXISTS idx_reviews_target   ON user_reviews(target_type, target_id);

-- RLS 활성화
ALTER TABLE user_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews        ENABLE ROW LEVEL SECURITY;

-- 프로필: 본인만 읽기/쓰기, 공개 조회 허용
CREATE POLICY profile_public_read    ON user_profiles FOR SELECT USING (true);
CREATE POLICY profile_self_write     ON user_profiles FOR ALL    USING (auth.uid() = id);

-- 포인트 이력: 본인만 조회
CREATE POLICY points_self_read       ON point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY points_service_write   ON point_transactions FOR ALL    USING (auth.role() = 'service_role');

-- 제보: 본인 제보 조회 + 승인된 것은 전체 공개
CREATE POLICY spot_report_self       ON spot_reports FOR SELECT USING (auth.uid() = reporter_id OR status = 'approved');
CREATE POLICY spot_report_insert     ON spot_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- 리뷰: 전체 공개 조회, 본인 작성
CREATE POLICY review_public_read     ON user_reviews FOR SELECT USING (true);
CREATE POLICY review_self_insert     ON user_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 신규 유저 프로필 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 포인트 적립 시 tier 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_user_tier()
RETURNS trigger AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    total_points = total_points + NEW.points,
    tier = CASE
      WHEN total_points + NEW.points >= 3000 THEN 'legend'
      WHEN total_points + NEW.points >= 500  THEN 'photowalker'
      ELSE 'filmmer'
    END,
    updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_point_transaction ON point_transactions;
CREATE TRIGGER on_point_transaction
  AFTER INSERT ON point_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_tier();
