-- 기존 데이터 정리
DELETE FROM user_subscription;
DELETE FROM subscription_plan;

-- 구독 플랜 테이블에 기본 데이터 추가 (DB 스키마에 맞춰서)
INSERT INTO subscription_plan (name, price, duration_days, description) VALUES
('basic', 9900, 30, '베이직 플랜'),
('plus', 14900, 30, '플러스 플랜');

-- 데이터 확인
SELECT * FROM subscription_plan;
SELECT * FROM user_subscription;
