-- =========================================================================
-- DASI 자율 동기화 & 마스터 데이터 시딩 & UGC 트리거 마이그레이션
-- =========================================================================

-- 1. 출사지별 실제 필름 사진 (Shot at this Spot) UGC 테이블
CREATE TABLE IF NOT EXISTS spot_photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id         TEXT NOT NULL,                       -- analog_spots.id 또는 photo_spots.id
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_nickname   TEXT,
  image_url       TEXT NOT NULL,
  camera_used     TEXT,
  film_used       TEXT,
  iso_used        INTEGER,
  shutter_aperture TEXT,
  caption         TEXT,
  likes_count     INTEGER NOT NULL DEFAULT 0,
  is_verified     BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_spot_photos_spot ON spot_photos(spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_photos_created ON spot_photos(created_at DESC);

ALTER TABLE spot_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY spot_photos_public_read ON spot_photos FOR SELECT USING (true);
CREATE POLICY spot_photos_user_insert ON spot_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY spot_photos_user_delete ON spot_photos FOR DELETE USING (auth.uid() = user_id);

-- 2. 리뷰 작성 시 대상 엔티티(카메라/현상소/스팟) 평점 & 리뷰 수 자동 재계산 트리거
CREATE OR REPLACE FUNCTION public.fn_sync_entity_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_target_type TEXT;
  v_target_id   TEXT;
  v_avg_rating  NUMERIC(3, 2);
  v_cnt         INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_target_type := OLD.target_type;
    v_target_id   := OLD.target_id;
  ELSE
    v_target_type := NEW.target_type;
    v_target_id   := NEW.target_id;
  END IF;

  SELECT ROUND(COALESCE(AVG(rating), 5.0)::numeric, 2), COUNT(*)
  INTO v_avg_rating, v_cnt
  FROM public.user_reviews
  WHERE target_id = v_target_id;

  -- 2-1. 카메라 평점 자동 갱신
  IF v_target_type = 'camera' THEN
    UPDATE public.cameras
    SET rating = v_avg_rating, reviews_count = v_cnt
    WHERE id = v_target_id;

  -- 2-2. 현상소/자판기/출사지 평점 자동 갱신
  ELSIF v_target_type = 'spot' OR v_target_type = 'lab' THEN
    UPDATE public.analog_spots
    SET rating = v_avg_rating, reviews_count = v_cnt
    WHERE id = v_target_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_review_rating ON public.user_reviews;
CREATE TRIGGER trg_sync_review_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.user_reviews
  FOR EACH ROW EXECUTE FUNCTION public.fn_sync_entity_rating();

-- 3. 마스터 엔티티 안전 시딩 (ON CONFLICT DO UPDATE)

-- 3-1. 픽업 매장 시딩
INSERT INTO public.pickup_shops (id, name, area, address, master_name, master_experience_years, master_quote, contact, open_hours, lat, lng, image_url)
VALUES
  ('shop-1', '을지로 신성카메라', '을지로', '서울 중구 을지로 157 대림상가 3층 341호', '강태훈 명장', 42, '카메라는 손때가 묻어야 비로소 기계가 아닌 기록자가 됩니다.', '02-2273-0981', '월-토 10:00 - 19:00', 37.5668, 126.9972, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'),
  ('shop-2', '충무로 보성광학', '충무로', '서울 중구 충무로 42 충무스퀘어 1층', '한동규 장인', 38, '셔터 소리만 들어도 노출계와 셔터막 오차를 1/1000초 단위로 알아냅니다.', '02-2268-4521', '월-금 09:30 - 19:30, 토 10:00 - 17:00', 37.5615, 126.9942, 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800&auto=format&fit=crop&q=80'),
  ('shop-3', '남대문 중앙사', '남대문', '서울 중구 남대문시장4길 9 중앙상가 B1', '문정식 장인', 35, '입문자가 실패하지 않고 첫 롤에 반하게 만드는 것이 우리의 자부심입니다.', '02-776-8812', '매일 10:00 - 18:30', 37.5592, 126.9774, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  contact = EXCLUDED.contact,
  open_hours = EXCLUDED.open_hours;

-- 3-2. 카메라 시딩 (Rent-to-Own 마스터 8종)
INSERT INTO public.cameras (id, name, brand, era, category, condition_grade, rental_price_per_day, purchase_price, shop_id, shop_name, pickup_location, image_url, sample_images, description, story, specs, is_available, rating, reviews_count)
VALUES
  ('cam-1', 'Olympus PEN EE-3', 'Olympus', '1973년 출시 (일본)', 'film', 'Mint', 18000, 190000, 'shop-1', '을지로 신성카메라', '을지로3가역 대림상가 3층 341호', 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&auto=format&fit=crop&q=80', ARRAY['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80'], '하프 프레임의 대명사. 36컷 필름으로 72컷을 찍을 수 있는 경제적인 빈티지 카메라입니다.', '을지로 신성카메라 강태훈 명장이 셀레늄 수광 소자와 조리개 깃을 직접 오버홀하여 최적의 측광 정확도를 보장합니다.', '{"lens":"D.Zuiko 28mm F3.5","shutterSpeed":"1/40, 1/200초 자동 전환","weight":"335g","battery":"불필요 (셀레늄 광전지 수광)","difficulty":"초보자 추천 (포커스 프리)"}'::jsonb, true, 4.9, 128),
  ('cam-2', 'Nikon FM2 (실버)', 'Nikon', '1982년 출시 (일본)', 'film', 'Near Mint', 32000, 680000, 'shop-2', '충무로 보성광학', '충무로역 5번 출구 충무스퀘어 1층', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', ARRAY['https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800&auto=format&fit=crop&q=80'], '기계식 수동 카메라의 절대 기준. 배터리 없이도 1/4000초 셔터 스피드가 작동하는 명기입니다.', '충무로 보성광학에서 벌집 모양 티타늄 셔터막의 텐션을 캘리브레이션 완료한 특A급 바디입니다.', '{"lens":"Nikkor 50mm F1.4 AIS","shutterSpeed":"1초 ~ 1/4000초, B셔터","weight":"540g (바디)","battery":"LR44 2개 (노출계 전용)","difficulty":"중급자 추천"}'::jsonb, true, 4.95, 254),
  ('cam-3', 'Canon Canonet QL17 G-III', 'Canon', '1972년 출시 (일본)', 'film', 'Near Mint', 24000, 320000, 'shop-3', '남대문 중앙사', '회현역 5번 출구 중앙상가 B1', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80', ARRAY['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80'], '가난한 자의 라이카라는 별칭을 가진 전설적인 컴팩트 RF 카메라입니다.', '남대문 중앙사 문정식 장인의 수작업 렌즈 클리닝으로 곰팡이 없이 투명한 유리알 렌즈를 유지하고 있습니다.', '{"lens":"Canon 40mm F1.7","shutterSpeed":"1/4 ~ 1/500초, B셔터","weight":"620g","battery":"LR44 변환 어댑터 포함","difficulty":"입문-중급 추천"}'::jsonb, true, 4.88, 89)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  rental_price_per_day = EXCLUDED.rental_price_per_day,
  purchase_price = EXCLUDED.purchase_price,
  is_available = EXCLUDED.is_available,
  description = EXCLUDED.description;
