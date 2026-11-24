-- =============================================================================
-- Migration Rollback: 001_add_service_reviews_rollback.sql
-- Mục đích: Hoàn tác migration 001_add_service_reviews.sql
--           Xóa bảng service_reviews, trigger, function và các index liên quan.
-- Ngày tạo: 2026-11-24
-- =============================================================================

BEGIN;

-- 1. Xóa Trigger cập nhật thời gian
DROP TRIGGER IF EXISTS trg_service_reviews_updated_at ON service_reviews;

-- 2. Xóa Function cập nhật updated_at
DROP FUNCTION IF EXISTS fn_set_updated_at();

-- 3. Xóa các Index (DROP TABLE CASCADE cũng tự động xóa, nhưng liệt kê rõ ràng để đảm bảo an toàn)
DROP INDEX IF EXISTS idx_reviews_aspect_rating;
DROP INDEX IF EXISTS idx_reviews_account_id;
DROP INDEX IF EXISTS idx_reviews_created_at;

-- 4. Xóa bảng service_reviews và các ràng buộc liên quan
DROP TABLE IF EXISTS service_reviews CASCADE;

-- 5. Xóa bản ghi lịch sử migration nếu hệ thống có sử dụng bảng theo dõi schema_migrations
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'schema_migrations'
    ) THEN
        DELETE FROM schema_migrations WHERE version IN ('001', '001_add_service_reviews');
    END IF;
END $$;

COMMIT;
