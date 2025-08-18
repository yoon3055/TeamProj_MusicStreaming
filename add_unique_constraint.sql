-- user_subscription 테이블의 order_id에 UNIQUE 제약조건 추가
ALTER TABLE user_subscription ADD CONSTRAINT uk_order_id UNIQUE (order_id);
