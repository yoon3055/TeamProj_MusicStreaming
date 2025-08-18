-- 스키마 수정: song_like 테이블에서 liked_at 컬럼 삭제
-- 엔티티 클래스와 데이터베이스 스키마 일치를 위해 실행

ALTER TABLE song_like DROP COLUMN liked_at;
