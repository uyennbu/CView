-- =============================================================================
-- SEED DATA: Bảng hệ thống (Section 1)
-- 5 dòng mỗi bảng
-- =============================================================================

-- Tắt notice để seed sạch hơn
SET client_min_messages TO WARNING;

-- =============================================================================
-- 1. accounts (3 ADMIN + 1 RECRUITER + 1 CANDIDATE để dùng lại ở FK bên dưới)
-- password_hash: bcrypt của 'Password@123'
-- =============================================================================
INSERT INTO accounts (account_id, username, email, password_hash, phone_number, status, last_login_at) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'admin_root',    'admin.root@cview.vn',      '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0901234561', 'ACTIVE',    NOW() - INTERVAL '1 hour'),
    ('a1000000-0000-0000-0000-000000000002', 'admin_ops',     'admin.ops@cview.vn',       '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0901234562', 'ACTIVE',    NOW() - INTERVAL '2 hours'),
    ('a1000000-0000-0000-0000-000000000003', 'admin_support', 'admin.support@cview.vn',   '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0901234563', 'ACTIVE',    NOW() - INTERVAL '3 hours'),
    ('a1000000-0000-0000-0000-000000000004', 'recruiter01',   'recruiter01@techcorp.vn',  '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0912345671', 'ACTIVE',    NOW() - INTERVAL '30 minutes'),
    ('a1000000-0000-0000-0000-000000000005', 'candidate01',   'candidate01@gmail.com',    '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0978901231', 'ACTIVE',    NOW() - INTERVAL '15 minutes');
    -- Thêm recruiters
    ('a1000000-0000-0000-0000-000000000006', 'recruiter02', 'recruiter02@fptsoft.vn',    '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0912345672', 'ACTIVE', NOW() - INTERVAL '1 day'),
    ('a1000000-0000-0000-0000-000000000007', 'recruiter03', 'recruiter03@vingroup.vn',   '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0912345673', 'ACTIVE', NOW() - INTERVAL '2 days'),
    ('a1000000-0000-0000-0000-000000000008', 'recruiter04', 'recruiter04@vnpay.vn',      '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0912345674', 'ACTIVE', NOW() - INTERVAL '3 days'),
    ('a1000000-0000-0000-0000-000000000009', 'recruiter05', 'recruiter05@tiki.vn',       '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0912345675', 'ACTIVE', NOW() - INTERVAL '4 days'),
    -- Thêm candidates
    ('a1000000-0000-0000-0000-000000000010', 'candidate02', 'candidate02@gmail.com',     '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0978901232', 'ACTIVE', NOW() - INTERVAL '1 hour'),
    ('a1000000-0000-0000-0000-000000000011', 'candidate03', 'candidate03@yahoo.com',     '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0978901233', 'ACTIVE', NOW() - INTERVAL '2 hours'),
    ('a1000000-0000-0000-0000-000000000012', 'candidate04', 'candidate04@outlook.com',   '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0978901234', 'ACTIVE', NOW() - INTERVAL '3 hours'),
    ('a1000000-0000-0000-0000-000000000013', 'candidate05', 'candidate05@proton.me',     '$2a$12$KIXkFqkGJ1qW.e8RZQaXCOfOO1p.vSVMZ.Rk6J2Ei8Ls7GEyUxGSe', '0978901235', 'PENDING', NULL);

-- =============================================================================
-- 2. roles (3 role chuẩn theo constraint chk_roles_name)
-- =============================================================================
INSERT INTO roles (role_name, description) VALUES
    ('ADMIN',     'Quản trị viên hệ thống, toàn quyền thao tác'),
    ('RECRUITER', 'Nhà tuyển dụng, quản lý tin đăng và ứng viên'),
    ('CANDIDATE', 'Ứng viên tìm kiếm việc làm');

-- =============================================================================
-- 3. permissions (5 quyền hạn chi tiết)
-- =============================================================================
INSERT INTO permissions (permission_name, description) VALUES
    ('MANAGE_ACCOUNTS',    'Toàn quyền quản lý tài khoản: tạo, sửa, khoá, xoá'),
    ('APPROVE_JOB_POSTS',  'Phê duyệt hoặc từ chối bài đăng tuyển dụng'),
    ('VIEW_SYSTEM_LOGS',   'Xem nhật ký hệ thống và lịch sử xác thực'),
    ('MANAGE_OWN_JOBS',    'Tạo, sửa, đóng bài tuyển dụng do mình đăng'),
    ('APPLY_JOBS',         'Nộp đơn ứng tuyển và theo dõi trạng thái đơn');

-- =============================================================================
-- 4. account_roles (gán role cho 5 accounts)
--    admin_root     => ADMIN
--    admin_ops      => ADMIN
--    admin_support  => ADMIN
--    recruiter01    => RECRUITER
--    candidate01    => CANDIDATE
-- =============================================================================
INSERT INTO account_roles (account_id, role_id)
SELECT a.account_id, r.role_id
FROM (VALUES
    ('a1000000-0000-0000-0000-000000000001'::UUID, 'ADMIN'),
    ('a1000000-0000-0000-0000-000000000002'::UUID, 'ADMIN'),
    ('a1000000-0000-0000-0000-000000000003'::UUID, 'ADMIN'),
    ('a1000000-0000-0000-0000-000000000004'::UUID, 'RECRUITER'),
    ('a1000000-0000-0000-0000-000000000005'::UUID, 'CANDIDATE')
    ('a1000000-0000-0000-0000-000000000006'::UUID, 'RECRUITER'),
    ('a1000000-0000-0000-0000-000000000007'::UUID, 'RECRUITER'),
    ('a1000000-0000-0000-0000-000000000008'::UUID, 'RECRUITER'),
    ('a1000000-0000-0000-0000-000000000009'::UUID, 'RECRUITER'),
    ('a1000000-0000-0000-0000-000000000010'::UUID, 'CANDIDATE'),
    ('a1000000-0000-0000-0000-000000000011'::UUID, 'CANDIDATE'),
    ('a1000000-0000-0000-0000-000000000012'::UUID, 'CANDIDATE'),
    ('a1000000-0000-0000-0000-000000000013'::UUID, 'CANDIDATE')
) AS mapping(account_id, role_name)
JOIN accounts a ON a.account_id = mapping.account_id
JOIN roles    r ON r.role_name  = mapping.role_name;
-- =============================================================================
-- 5. role_permissions (gán permission cho role, 5 cặp)
--    ADMIN     => MANAGE_ACCOUNTS, APPROVE_JOB_POSTS, VIEW_SYSTEM_LOGS
--    RECRUITER => MANAGE_OWN_JOBS
--    CANDIDATE => APPLY_JOBS
-- =============================================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM (VALUES
    ('ADMIN',     'MANAGE_ACCOUNTS'),
    ('ADMIN',     'APPROVE_JOB_POSTS'),
    ('ADMIN',     'VIEW_SYSTEM_LOGS'),
    ('RECRUITER', 'MANAGE_OWN_JOBS'),
    ('CANDIDATE', 'APPLY_JOBS')
) AS mapping(role_name, permission_name)
JOIN roles       r ON r.role_name       = mapping.role_name
JOIN permissions p ON p.permission_name = mapping.permission_name;

-- =============================================================================
-- 6. sessions (5 phiên đăng nhập)
-- =============================================================================
INSERT INTO sessions (session_id, account_id, refresh_token_hash, ip_address, user_agent, is_revoked, expires_at) VALUES
    ('b2000000-0000-0000-0000-000000000001',
     'a1000000-0000-0000-0000-000000000001',
     '$2a$12$SESSION_HASH_ADMIN_ROOT_001xxxxxxxxxxxxxxxxxxxxxxxxxxx',
     '192.168.1.10',  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0',
     FALSE, NOW() + INTERVAL '7 days'),

    ('b2000000-0000-0000-0000-000000000002',
     'a1000000-0000-0000-0000-000000000002',
     '$2a$12$SESSION_HASH_ADMIN_OPS__002xxxxxxxxxxxxxxxxxxxxxxxxxxx',
     '192.168.1.11',  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) Safari/17.4',
     FALSE, NOW() + INTERVAL '7 days'),

    ('b2000000-0000-0000-0000-000000000003',
     'a1000000-0000-0000-0000-000000000003',
     '$2a$12$SESSION_HASH_ADMIN_SUP_003xxxxxxxxxxxxxxxxxxxxxxxxxxx',
     '10.0.0.5',      'Mozilla/5.0 (X11; Linux x86_64) Firefox/126.0',
     TRUE,  NOW() + INTERVAL '1 day'),     -- phiên đã revoke (vẫn chưa hết hạn)

    ('b2000000-0000-0000-0000-000000000004',
     'a1000000-0000-0000-0000-000000000004',
     '$2a$12$SESSION_HASH_RECRUITER01_004xxxxxxxxxxxxxxxxxxxxxxxxxx',
     '203.113.152.44','Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Mobile/15E148',
     FALSE, NOW() + INTERVAL '30 days'),

    ('b2000000-0000-0000-0000-000000000005',
     'a1000000-0000-0000-0000-000000000005',
     '$2a$12$SESSION_HASH_CANDIDATE01_005xxxxxxxxxxxxxxxxxxxxxxxxxx',
     '14.161.38.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/125.0',
     FALSE, NOW() + INTERVAL '30 days');

-- =============================================================================
-- 7. auth_logs (5 bản ghi lịch sử xác thực)
-- =============================================================================
INSERT INTO auth_logs (account_id, event_type, ip_address, user_agent, failure_reason) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'LOGIN_SUCCESS',          '192.168.1.10',  'Mozilla/5.0 Chrome/125.0',    NULL),
    ('a1000000-0000-0000-0000-000000000002', 'LOGIN_SUCCESS',          '192.168.1.11',  'Mozilla/5.0 Safari/17.4',     NULL),
    ('a1000000-0000-0000-0000-000000000003', 'LOGIN_FAILED',           '10.0.0.5',      'Mozilla/5.0 Firefox/126.0',   'Sai mật khẩu'),
    ('a1000000-0000-0000-0000-000000000004', 'PASSWORD_CHANGE',        '203.113.152.44','Mozilla/5.0 Mobile/15E148',   NULL),
    ('a1000000-0000-0000-0000-000000000005', 'PASSWORD_RESET_REQUEST', '14.161.38.100', 'Mozilla/5.0 Edge/125.0',      NULL);

-- =============================================================================
-- 8. activity_logs (5 bản ghi hành vi nghiệp vụ)
-- Dùng session_id đã có ở bảng sessions
-- =============================================================================
INSERT INTO activity_logs (sessions_id, action_type, target_entity, target_id, details) VALUES
    ('b2000000-0000-0000-0000-000000000004',
     'CREATE_JOB_POST', 'JOB_POST', 'jp-placeholder-001',
     '{"title": "Senior Backend Developer", "company": "TechCorp VN"}'::JSONB),

    ('b2000000-0000-0000-0000-000000000005',
     'UPLOAD_RESUME',   'RESUME',   'resume-placeholder-001',
     '{"file_name": "NguyenVanA_CV_2026.pdf", "file_size_bytes": 512000}'::JSONB),

    ('b2000000-0000-0000-0000-000000000005',
     'SEARCH_JOB',      'JOB_POST', NULL,
     '{"keyword": "Backend Developer", "city": "Ha Noi", "results_count": 42}'::JSONB),

    ('b2000000-0000-0000-0000-000000000005',
     'VIEW_JOB',        'JOB_POST', 'jp-placeholder-001',
     '{"duration_seconds": 95}'::JSONB),

    ('b2000000-0000-0000-0000-000000000001',
     'APPROVE_JOB_POST','JOB_POST', 'jp-placeholder-001',
     '{"note": "Noi dung hop le, phe duyet."}'::JSONB);

-- =============================================================================
-- 9. system_error_logs (5 bản ghi lỗi hệ thống với các severity khác nhau)
-- =============================================================================
INSERT INTO system_error_logs (service_name, severity, error_code, message, stack_trace) VALUES
    ('auth-service',
     'INFO',     'AUTH_001',
     'Nguoi dung dang nhap thanh cong.',
     NULL),

    ('cv-parser',
     'WARNING',  'CV_PARSE_002',
     'File PDF co font khong nhung, ket qua OCR co the kem chinh xac.',
     'CVParserService.parse() line 87'),

    ('job-matcher',
     'ERROR',    'MATCH_503',
     'Timeout khi goi AI embedding service sau 30s, thu lai lan 1.',
     'JobMatcherService.embedResume() line 213 -> HttpClient.post() -> TimeoutException'),

    ('notification-svc',
     'DEBUG',    'NOTIF_DEBUG_001',
     'Dang thu gui email thong bao toi candidate01@gmail.com.',
     NULL),

    ('api-gateway',
     'CRITICAL', 'GW_500',
     'Unhandled exception: NullPointerException tai endpoint GET /api/v1/jobs.',
     'GlobalExceptionHandler.handle() line 55 -> JobController.getAll() line 32 -> NullPointerException');
