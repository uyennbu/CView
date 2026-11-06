-- =============================================================================
-- SEED DATA: Bảng thông báo
-- job_notifications, other_notifications
-- 5 dòng mỗi bảng
-- =============================================================================
-- UUID tái sử dụng từ các file trước:
--   candidate_profiles : f6000000-0000-0000-0000-00000000000x
--   job_posts          : h8000000-0000-0000-0000-00000000000x
--   accounts           : a1000000-0000-0000-0000-00000000000x
--     001-003 = ADMIN | 004-009 = RECRUITER | 005,010-013 = CANDIDATE
-- =============================================================================

SET client_min_messages TO WARNING;

-- =============================================================================
-- 28. job_notifications (thông báo việc làm gợi ý tự động cho ứng viên)
--     candidate_id FK → candidate_profiles
--     job_post_id  FK → job_posts
--     is_read / read_at: read_at chỉ có giá trị khi is_read = TRUE
-- =============================================================================
INSERT INTO job_notifications (candidate_id, job_post_id, title, content, is_read, read_at) VALUES

    -- 1. Nguyen Van An nhận gợi ý JP-01 (Backend TechCorp) → đã đọc
    ('f6000000-0000-0000-0000-000000000001',
     'h8000000-0000-0000-0000-000000000001',
     'Viec lam phu hop voi ban: Senior Backend Developer',
     'CView phat hien tin tuyen dung "Senior Backend Developer (Java Spring Boot)" tai TechCorp Vietnam JSC phu hop 82% voi CV cua ban. Luong 25-45 trieu, lam viec Hybrid tai Ha Noi. Xem ngay!',
     TRUE,  NOW() - INTERVAL '4 days'),

    -- 2. Nguyen Van An nhận gợi ý JP-05 (DS Tiki remote) → chưa đọc
    ('f6000000-0000-0000-0000-000000000001',
     'h8000000-0000-0000-0000-000000000005',
     'Co 1 co hoi viec lam moi danh cho ban',
     'Tin tuyen dung "Senior Data Scientist — Recommendation System" tai Tiki Corporation vua duoc dang. Vi tri lam viec Remote toan phan, luong thuong luong. Kiem tra ngay!',
     FALSE, NULL),

    -- 3. Tran Thi Bich Ngoc nhận gợi ý JP-02 (Python FPT) → đã đọc
    ('f6000000-0000-0000-0000-000000000002',
     'h8000000-0000-0000-0000-000000000002',
     'Viec lam phu hop: Python Data Engineer tai FPT Software',
     'Dua tren ky nang Python va kinh nghiem 1.5 nam cua ban, chung toi de xuat vi tri "Python Data Engineer (Mid-Senior)" tai FPT Software Ha Noi. Luong 20-38 trieu. Nop don ngay!',
     TRUE,  NOW() - INTERVAL '2 days'),

    -- 4. Le Hoang Nam nhận gợi ý JP-03 (DevOps Vingroup) → đã đọc
    ('f6000000-0000-0000-0000-000000000003',
     'h8000000-0000-0000-0000-000000000003',
     '[Hot Job] Senior DevOps / Cloud Engineer phu hop cao voi CV cua ban',
     'CV cua ban khop 91% voi vi tri "Senior DevOps / Cloud Engineer" tai Vingroup Digital Solutions. Luong 35-60 trieu, On-site HCM. Day la co hoi hang dau cho ban! Ung tuyen truoc ngay ' || TO_CHAR(NOW() + INTERVAL '20 days', 'DD/MM/YYYY') || '.',
     TRUE,  NOW() - INTERVAL '6 days'),

    -- 5. Pham Ngoc Linh nhận gợi ý JP-04 (Fresher VNPAY) → chưa đọc
    ('f6000000-0000-0000-0000-000000000004',
     'h8000000-0000-0000-0000-000000000004',
     'Co hoi thuc tap: Fresher React Native Developer tai VNPAY',
     'CView tim thay vi tri "Fresher React Native Developer" tai VNPAY Technology Corp phu hop voi ho so sinh vien cua ban. Luong thuc tap 5-8 trieu, co the chuyen full-time sau 3 thang. Dung bo lo!',
     FALSE, NULL);

-- =============================================================================
-- 29. other_notifications (thông báo hệ thống các loại)
--     notification_type CHECK:
--       JOB_APPROVAL_STATUS | APPLICATION_UPDATE | CV_PARSE_COMPLETED
--       | ACCOUNT_SECURITY   | SYSTEM_ANNOUNCEMENT
--     account_id FK → accounts (cả admin, recruiter lẫn candidate đều nhận)
-- =============================================================================
INSERT INTO other_notifications (account_id, notification_type, title, message, is_read, read_at) VALUES

    -- 1. Recruiter01 (TechCorp) nhận thông báo tin đăng được duyệt → đã đọc
    ('a1000000-0000-0000-0000-000000000004',
     'JOB_APPROVAL_STATUS',
     'Tin tuyen dung cua ban da duoc phe duyet',
     'Tin tuyen dung "Senior Backend Developer (Java Spring Boot)" da duoc Admin phe duyet va hien thi tren he thong. Tin se het han vao ngay ' || TO_CHAR(NOW() + INTERVAL '25 days', 'DD/MM/YYYY') || '. Chuc ban tuyen dung thanh cong!',
     TRUE,  NOW() - INTERVAL '5 days'),

    -- 2. Candidate01 nhận cập nhật trạng thái đơn ứng tuyển → chưa đọc
    ('a1000000-0000-0000-0000-000000000005',
     'APPLICATION_UPDATE',
     'Don ung tuyen cua ban da duoc cap nhat trang thai',
     'Nha tuyen dung TechCorp Vietnam JSC vua cap nhat trang thai don ung tuyen vi tri "Senior Backend Developer" cua ban thanh SHORTLISTED. Ho se lien he voi ban trong 3-5 ngay lam viec. Hay chuan bi ky!',
     FALSE, NULL),

    -- 3. Candidate03 nhận thông báo phân tích CV hoàn tất → đã đọc
    ('a1000000-0000-0000-0000-000000000011',
     'CV_PARSE_COMPLETED',
     'Phan tich CV cua ban da hoan tat',
     'He thong AI da phan tich xong CV "CV DevOps Senior 2026.pdf". Tim thay 5 ky nang chinh, diem phu hop trung binh voi 4 vi tri la 85.5/100. Xem ket qua chi tiet tai muc "Phan tich CV" cua ban.',
     TRUE,  NOW() - INTERVAL '1 day'),

    -- 4. Candidate01 nhận cảnh báo bảo mật tài khoản → đã đọc
    ('a1000000-0000-0000-0000-000000000005',
     'ACCOUNT_SECURITY',
     '[Canh bao] Dang nhap tu dia chi IP moi',
     'Chung toi phat hien tai khoan cua ban vua dang nhap tu dia chi IP 203.113.152.44 (Vietnam) luc ' || TO_CHAR(NOW() - INTERVAL '2 hours', 'HH24:MI DD/MM/YYYY') || '. Neu day khong phai ban, hay doi mat khau ngay lap tuc hoac lien he ho tro.',
     TRUE,  NOW() - INTERVAL '1 hour 30 minutes'),

    -- 5. Toàn bộ hệ thống: thông báo bảo trì (gửi cho admin) → chưa đọc
    ('a1000000-0000-0000-0000-000000000001',
     'SYSTEM_ANNOUNCEMENT',
     '[Bao tri] He thong se tam ngung luc 02:00 - 04:00 ngay ' || TO_CHAR(NOW() + INTERVAL '3 days', 'DD/MM/YYYY'),
     'CView se tien hanh nang cap co so du lieu va dich vu AI vao khung gio 02:00 - 04:00 ngay ' || TO_CHAR(NOW() + INTERVAL '3 days', 'DD/MM/YYYY') || '. Trong thoi gian nay, toan bo chuc nang se tam thoi khong kha dung. Xin loi vi su bat tien nay.',
     FALSE, NULL);

