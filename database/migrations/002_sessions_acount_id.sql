-- =============================================================================
-- Migration: Cho phép account_id NULL trong bảng sessions
-- Mục đích: Hỗ trợ phiên ẩn danh (anonymous session) — người dùng duyệt web
--           chưa đăng nhập vẫn được tạo session để theo dõi hành vi.
-- Áp dụng lên: sessions
-- Ngày tạo: 2026-11-18
-- =============================================================================

BEGIN;

-- Bước 1: Bỏ ràng buộc NOT NULL trên cột account_id
ALTER TABLE sessions
    ALTER COLUMN account_id DROP NOT NULL;

-- Bước 2: Thay FK constraint cũ (ON DELETE CASCADE — không hợp lệ khi NULL)
--         bằng FK mới cho phép NULL, chỉ kiểm tra khi giá trị khác NULL
ALTER TABLE sessions
    DROP CONSTRAINT fk_sessions_account;

ALTER TABLE sessions
    ADD CONSTRAINT fk_sessions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(account_id)
        ON DELETE SET NULL;        -- Khi account bị xóa → session trở thành anonymous

-- Bước 3: Thêm CHECK constraint để đảm bảo tính nhất quán:
--         Nếu account_id IS NULL thì refresh_token_hash phải NULL
--         (session ẩn danh không cần refresh token xác thực)
--         Nếu có refresh_token_hash thì bắt buộc phải có account_id
ALTER TABLE sessions
    ADD CONSTRAINT chk_sessions_anonymous
        CHECK (
            (account_id IS NOT NULL)                        -- session đã đăng nhập: account bắt buộc
            OR
            (account_id IS NULL AND refresh_token_hash IS NULL)  -- session ẩn danh: không có token
        );

-- Bước 4: Cho phép refresh_token_hash NULL (anonymous session không có token)
ALTER TABLE sessions
    ALTER COLUMN refresh_token_hash DROP NOT NULL;

-- Bước 5: Cập nhật COMMENT bảng để phản ánh chức năng mới
COMMENT ON TABLE sessions IS
    'Quản lý phiên đăng nhập hợp lệ và Refresh Token. '
    'account_id = NULL biểu thị phiên ẩn danh (người dùng chưa đăng nhập).';

COMMENT ON COLUMN sessions.account_id IS
    'UUID của tài khoản đã đăng nhập. NULL nếu là phiên ẩn danh (anonymous session).';

COMMENT ON COLUMN sessions.refresh_token_hash IS
    'Hash của Refresh Token. NULL nếu là phiên ẩn danh.';

COMMIT;
