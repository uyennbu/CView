-- =============================================================================
-- Migration: Thêm bảng đánh giá dịch vụ web — service_reviews
-- Mục đích: Lưu trữ đánh giá, nhận xét của người dùng về chất lượng
--           dịch vụ CView (phân tích CV, gợi ý việc làm, UI/UX, v.v.)
-- Ngày tạo: 2026-11-20
-- =============================================================================

BEGIN;

-- =============================================================================
-- Bảng: service_reviews
-- =============================================================================
CREATE TABLE service_reviews (
    review_id       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Người đánh giá (NULL = ẩn danh, nhưng phải cung cấp display_name)
    account_id      UUID,
    display_name    VARCHAR(100)    NOT NULL,

    -- Nội dung đánh giá
    rating          SMALLINT        NOT NULL,              -- 1 ÷ 5 sao
    title           VARCHAR(150),
    content         TEXT,

    -- Khía cạnh dịch vụ được đánh giá
    service_aspect  VARCHAR(30)     NOT NULL DEFAULT 'OVERALL',

    -- Trạng thái kiểm duyệt & tin cậy
    is_verified     BOOLEAN         NOT NULL DEFAULT FALSE, -- account đã dùng dịch vụ thực tế
    is_published    BOOLEAN         NOT NULL DEFAULT FALSE, -- admin đã duyệt hiển thị
    helpful_count   INTEGER         NOT NULL DEFAULT 0,     -- số người bấm "hữu ích"

    -- Phản hồi từ admin/team CView
    admin_reply     TEXT,
    replied_at      TIMESTAMPTZ,

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- ── Foreign Keys ──────────────────────────────────────────────────────────
    CONSTRAINT fk_service_reviews_account
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE SET NULL,

    -- ── CHECK Constraints ─────────────────────────────────────────────────────
    CONSTRAINT chk_reviews_rating
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT chk_reviews_aspect
        CHECK (service_aspect IN (
            'OVERALL',          -- Đánh giá tổng thể nền tảng
            'CV_ANALYSIS',      -- Chức năng phân tích CV bằng AI
            'JOB_MATCHING',     -- Chức năng gợi ý / so khớp việc làm
            'JOB_SEARCH',       -- Chức năng tìm kiếm việc làm
            'UI_UX',            -- Giao diện và trải nghiệm người dùng
            'PERFORMANCE',      -- Tốc độ và hiệu năng hệ thống
            'SUPPORT',          -- Dịch vụ hỗ trợ khách hàng
            'RECRUITER_TOOLS'   -- Công cụ dành cho nhà tuyển dụng
        )),

    CONSTRAINT chk_reviews_helpful
        CHECK (helpful_count >= 0),

    -- Bảo đảm: có admin_reply thì phải có replied_at và ngược lại
    CONSTRAINT chk_reviews_reply_consistency
        CHECK (
            (admin_reply IS NULL AND replied_at IS NULL)
            OR
            (admin_reply IS NOT NULL AND replied_at IS NOT NULL)
        ),

    -- Bảo đảm: updated_at >= created_at
    CONSTRAINT chk_reviews_dates
        CHECK (updated_at >= created_at)
);

-- =============================================================================
-- Index để tăng hiệu năng truy vấn phổ biến
-- =============================================================================

-- Lọc theo khía cạnh + rating (trang thống kê)
CREATE INDEX idx_reviews_aspect_rating
    ON service_reviews (service_aspect, rating)
    WHERE is_published = TRUE;

-- Lấy tất cả đánh giá của 1 account
CREATE INDEX idx_reviews_account_id
    ON service_reviews (account_id)
    WHERE account_id IS NOT NULL;

-- Lấy đánh giá mới nhất (sắp xếp theo thời gian)
CREATE INDEX idx_reviews_created_at
    ON service_reviews (created_at DESC)
    WHERE is_published = TRUE;

-- =============================================================================
-- Trigger: tự động cập nhật updated_at khi UPDATE
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_service_reviews_updated_at
    BEFORE UPDATE ON service_reviews
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();

-- =============================================================================
-- COMMENT tài liệu hóa
-- =============================================================================
COMMENT ON TABLE service_reviews IS
    'Lưu trữ đánh giá và nhận xét của người dùng về chất lượng dịch vụ CView.';

COMMENT ON COLUMN service_reviews.account_id IS
    'FK tới accounts. NULL nếu người đánh giá ẩn danh.';
COMMENT ON COLUMN service_reviews.display_name IS
    'Tên hiển thị của người đánh giá (tự điền, không lấy từ account).';
COMMENT ON COLUMN service_reviews.rating IS
    'Điểm đánh giá từ 1 (rất tệ) đến 5 (xuất sắc).';
COMMENT ON COLUMN service_reviews.service_aspect IS
    'Khía cạnh dịch vụ được đánh giá: OVERALL, CV_ANALYSIS, JOB_MATCHING, v.v.';
COMMENT ON COLUMN service_reviews.is_verified IS
    'TRUE nếu hệ thống xác nhận account đã thực sự sử dụng dịch vụ được đánh giá.';
COMMENT ON COLUMN service_reviews.is_published IS
    'TRUE nếu admin đã duyệt cho hiển thị công khai.';
COMMENT ON COLUMN service_reviews.helpful_count IS
    'Số lượt người dùng khác bấm "Đánh giá này hữu ích".';
COMMENT ON COLUMN service_reviews.admin_reply IS
    'Phản hồi chính thức từ đội ngũ CView gửi tới người đánh giá.';

COMMIT;
