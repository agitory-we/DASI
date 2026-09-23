-- ==========================================
-- DASI 포인트 정책 강화 마이그레이션
-- CFO 요청: 24개월 유효기간 + 일일 중복 방어
-- ==========================================

ALTER TABLE point_transactions
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_point_tx_idempotency
  ON point_transactions(user_id, action, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.deduct_expired_points()
RETURNS void AS $$
BEGIN
  INSERT INTO point_transactions (user_id, action, points, description, created_at)
  SELECT
    user_id,
    'expired',
    -SUM(points),
    '포인트 유효기간 만료 (24개월)',
    now()
  FROM point_transactions
  WHERE expires_at IS NOT NULL
    AND expires_at < now()
    AND action NOT IN ('expired', 'redeem')
  GROUP BY user_id
  HAVING SUM(points) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;