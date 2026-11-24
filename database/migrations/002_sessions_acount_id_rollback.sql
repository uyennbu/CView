-- =============================================================================
-- Migration Rollback: 002_sessions_acount_id_rollback.sql
-- Mục đích: Hoàn tác migration 002_sessions_acount_id.sql
--           Khôi phục bảng sessions về trạng thái ban đầu:
--           - Bắt buộc account_id NOT NULL và refresh_token_hash NOT NULL
--           - Khôi phục khóa ngoại fk_sessions_account về ON DELETE CASCADE
--           - Xóa bỏ ràng buộc chk_sessions_anonymous
-- Ngày tạo: 2026-11-24
-- =============================================================================

BEGIN;

-- Bước 1: Dọn dẹp dữ liệu phiên ẩn danh (nếu có) trước khi đặt lại NOT NULL
--         (Các bản ghi có account_id hoặc refresh_token_hash IS NULL sẽ làm lệnh SET NOT NULL thất bại)
DELETE FROM sessions 
WHERE account_id IS NULL 
   OR refresh_token_hash IS NULL;

-- Bước 2: Xóa bỏ ràng buộc kiểm tra phiên ẩn danh
ALTER TABLE sessions
    DROP CONSTRAINT IF EXISTS chk_sessions_anonymous;

-- Bước 3: Khôi phục ràng buộc NOT NULL cho cột refresh_token_hash
ALTER TABLE sessions
    ALTER COLUMN refresh_token_hash SET NOT NULL;

-- Bước 4: Khôi phục ràng buộc NOT NULL cho cột account_id
ALTER TABLE sessions
    ALTER COLUMN account_id SET NOT NULL;

-- Bước 5: Khôi phục lại khóa ngoại cũ với hành vi ON DELETE CASCADE
ALTER TABLE sessions
    DROP CONSTRAINT IF EXISTS fk_sessions_account;

ALTER TABLE sessions
    ADD CONSTRAINT fk_sessions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(account_id)
        ON DELETE CASCADE;

-- Bước 6: Khôi phục COMMENT nguyên bản cho bảng và các cột
COMMENT ON TABLE sessions IS
    'Quản lý phiên đăng nhập hợp lệ và Refresh Token';

COMMENT ON COLUMN sessions.account_id IS NULL;

COMMENT ON COLUMN sessions.refresh_token_hash IS NULL;

-- Bước 7: Xóa bản ghi lịch sử migration nếu hệ thống có bảng theo dõi schema_migrations
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'schema_migrations'
    ) THEN
        DELETE FROM schema_migrations WHERE version IN ('002', '002_sessions_acount_id');
    END IF;
END $$;

COMMIT;
