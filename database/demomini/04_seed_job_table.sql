-- =============================================================================
-- SEED DATA: Bảng nghiệp vụ (Section 3 — Job & Matching)
-- job_posts, job_skills, job_certificates, job_domains,
-- cv_analyses, matched_results, saved_jobs, job_applications, search_history
-- 5 dòng mỗi bảng
-- =============================================================================
-- UUID prefixes tái sử dụng từ file trước:
--   recruiter_profiles : e5000000-0000-0000-0000-00000000000x
--   companies          : d4000000-0000-0000-0000-00000000000x
--   addresses          : c3000000-0000-0000-0000-00000000000x  (c3-001..005 = cty, c3-006..010 = ứng viên)
--   accounts (admin)   : a1000000-0000-0000-0000-00000000000x  (001..003 = ADMIN)
--   candidate_profiles : f6000000-0000-0000-0000-00000000000x
--   resumes            : g7000000-0000-0000-0000-00000000000x
--   skills/domains/certs: serial (JOIN theo tên để tránh hardcode)
--
-- UUID mới trong file này:
--   job_posts          : h8000000-0000-0000-0000-00000000000x
--   cv_analyses        : i9000000-0000-0000-0000-00000000000x
-- =============================================================================

SET client_min_messages TO WARNING;

-- =============================================================================
-- 19. job_posts (5 tin tuyển dụng)
--     Constraints quan trọng:
--       job_type        : FULL_TIME | PART_TIME | INTERNSHIP | CONTRACT | FREELANCE
--       workplace_type  : ON_SITE | HYBRID | REMOTE
--       required_education: NONE | HIGH_SCHOOL | ASSOCIATE | BACHELOR | MASTER
--       approval_status : PENDING | APPROVED | REJECTED | EXPIRED | CLOSED
--       deadline        : > created_at  =>  dùng NOW() + INTERVAL
--       salary_max      : >= salary_min (nếu cả hai không NULL)
-- =============================================================================
INSERT INTO job_posts (
    job_post_id, recruiter_id, company_id,
    position, title, job_description, requirements, benefits,
    job_type, workplace_type, address_id,
    salary_min, salary_max, is_salary_negotiable,
    experience_years_min, required_education,
    approval_status, approved_by, approved_at, deadline
) VALUES

-- JP-01: TechCorp — Senior Backend Developer (APPROVED)
(   'h8000000-0000-0000-0000-000000000001',
    'e5000000-0000-0000-0000-000000000001',   -- recruiter: Nguyen Thi Lan Anh / TechCorp
    'd4000000-0000-0000-0000-000000000001',   -- TechCorp Vietnam JSC
    'Backend Developer', 'Senior Backend Developer (Java Spring Boot)',
    'Phat trien va bao tri cac microservices su dung Java Spring Boot, toi uu hieu nang he thong.',
    'Co it nhat 3 nam kinh nghiem Spring Boot; thong thao Docker, REST API; co kinh nghiem PostgreSQL.',
    'Luong canh tranh; BHXH day du;13 thang luong; MacBook Pro; WFH 2 ngay/tuan.',
    'FULL_TIME', 'HYBRID',
    'c3000000-0000-0000-0000-000000000001',   -- dia chi TechCorp Ha Noi
    25000000, 45000000, FALSE,
    3.0, 'BACHELOR',
    'APPROVED',
    'a1000000-0000-0000-0000-000000000001',   -- admin_root phe duyet
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days'
),

-- JP-02: FPT Software — Python Data Engineer (APPROVED)
(   'h8000000-0000-0000-0000-000000000002',
    'e5000000-0000-0000-0000-000000000002',   -- recruiter: Tran Minh Duc / FPT
    'd4000000-0000-0000-0000-000000000002',   -- FPT Software Ha Noi
    'Data Engineer', 'Python Data Engineer (Mid-Senior)',
    'Xay dung data pipeline, ETL tren AWS Glue & Airflow; phat trien mo hinh du lieu cho he thong analytics.',
    'Thong thao Python; co kinh nghiem Apache Airflow hoac Spark; hieu biet SQL nang cao.',
    'Thang thuong du an; dao tao chung chi AWS; phong lam viec hien dai.',
    'FULL_TIME', 'HYBRID',
    'c3000000-0000-0000-0000-000000000002',   -- dia chi FPT Ha Noi
    20000000, 38000000, FALSE,
    2.0, 'BACHELOR',
    'APPROVED',
    'a1000000-0000-0000-0000-000000000002',   -- admin_ops phe duyet
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '30 days'
),

-- JP-03: Vingroup — DevOps Engineer (APPROVED)
(   'h8000000-0000-0000-0000-000000000003',
    'e5000000-0000-0000-0000-000000000003',   -- recruiter: Pham Bao Chau / Vingroup
    'd4000000-0000-0000-0000-000000000003',   -- Vingroup Digital Solutions
    'DevOps Engineer', 'Senior DevOps / Cloud Engineer (AWS & K8s)',
    'Quan ly ha tang Kubernetes tren AWS; thiet ke CI/CD pipeline; dam bao uptime 99.9%.',
    'Tren 4 nam DevOps; thong thao Kubernetes, Terraform, Helm; chung chi CKA la loi the.',
    'Stock option; bao hiem suc khoe cao cap; nghi phep 18 ngay/nam.',
    'FULL_TIME', 'ON_SITE',
    'c3000000-0000-0000-0000-000000000003',   -- dia chi Vingroup HCM
    35000000, 60000000, FALSE,
    4.0, 'BACHELOR',
    'APPROVED',
    'a1000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '20 days'
),

-- JP-04: VNPAY — Fresher Mobile Developer (PENDING, chua phe duyet)
(   'h8000000-0000-0000-0000-000000000004',
    'e5000000-0000-0000-0000-000000000004',   -- recruiter: Le Quoc Hung / VNPAY
    'd4000000-0000-0000-0000-000000000004',   -- VNPAY Technology Corp
    'Mobile Developer', 'Fresher React Native Developer (Thuc tap co luong)',
    'Tham gia phat trien ung dung thanh toan di dong; hoc hoi tu senior; review code hang ngay.',
    'Biet React Native co ban; hieu JavaScript ES6+; co du an ca nhan tren GitHub.',
    'Luong thuc tap 5-8 trieu; xu huong chuyen full-time sau 3 thang.',
    'INTERNSHIP', 'ON_SITE',
    'c3000000-0000-0000-0000-000000000004',   -- dia chi VNPAY Ha Noi
    5000000, 8000000, FALSE,
    0.0, 'NONE',
    'PENDING',
    NULL, NULL,
    NOW() + INTERVAL '45 days'
),

-- JP-05: Tiki — Data Scientist (APPROVED, luong thuong luong)
(   'h8000000-0000-0000-0000-000000000005',
    'e5000000-0000-0000-0000-000000000005',   -- recruiter: Hoang Thi Mai Linh / Tiki
    'd4000000-0000-0000-0000-000000000005',   -- Tiki Corporation
    'Data Scientist', 'Senior Data Scientist — Recommendation System',
    'Nghien cuu va trien khai mo hinh recommendation; A/B testing; lam viec voi tap du lieu hang trieu ban ghi.',
    'Tren 5 nam kinh nghiem ML/DS; thong thao Python, Spark; co bai bao khoa hoc la loi the.',
    'Luong thuong luong, khong gioi han; ESOP; remote toan phan; nghi phep khong gioi han.',
    'FULL_TIME', 'REMOTE',
    NULL,                                       -- remote, khong can dia chi cu the
    NULL, NULL, TRUE,                           -- thuong luong
    5.0, 'MASTER',
    'APPROVED',
    'a1000000-0000-0000-0000-000000000003',   -- admin_support phe duyet
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '60 days'
);

-- =============================================================================
-- 20. job_skills (5 yêu cầu kỹ năng cho tin tuyển dụng)
--     requirement_type: MANDATORY | PREFERRED
--     Dùng JOIN theo skill_name để không hardcode serial skill_id
-- =============================================================================
INSERT INTO job_skills (job_post_id, skill_id, requirement_type, min_years_experience)
SELECT j.job_post_id, s.skill_id, m.requirement_type, m.min_years_exp
FROM (VALUES
    ('h8000000-0000-0000-0000-000000000001'::UUID, 'Java Spring Boot',     'MANDATORY', 3.0),
    ('h8000000-0000-0000-0000-000000000002'::UUID, 'Python',              'MANDATORY', 2.0),
    ('h8000000-0000-0000-0000-000000000003'::UUID, 'Docker & Kubernetes', 'MANDATORY', 4.0),
    ('h8000000-0000-0000-0000-000000000003'::UUID, 'English (B2+)',       'PREFERRED', 0.0),
    ('h8000000-0000-0000-0000-000000000005'::UUID, 'Python',              'MANDATORY', 5.0)
) AS m(job_post_id, skill_name, requirement_type, min_years_exp)
JOIN job_posts j ON j.job_post_id = m.job_post_id
JOIN skills    s ON s.skill_name  = m.skill_name;

-- =============================================================================
-- 21. job_certificates (5 yêu cầu chứng chỉ cho tin tuyển dụng)
--     Dùng JOIN theo certificate_name để không hardcode serial certificate_id
-- =============================================================================
INSERT INTO job_certificates (job_post_id, certificate_id, is_mandatory)
SELECT j.job_post_id, c.certificate_id, m.is_mandatory
FROM (VALUES
    ('h8000000-0000-0000-0000-000000000001'::UUID, 'AWS Certified Solutions Architect - Associate', FALSE),
    ('h8000000-0000-0000-0000-000000000002'::UUID, 'AWS Certified Solutions Architect - Associate', FALSE),
    ('h8000000-0000-0000-0000-000000000003'::UUID, 'Certified Kubernetes Administrator (CKA)',      TRUE),
    ('h8000000-0000-0000-0000-000000000004'::UUID, 'IELTS Academic',                                FALSE),
    ('h8000000-0000-0000-0000-000000000005'::UUID, 'Google Professional Cloud Developer',           FALSE)
) AS m(job_post_id, certificate_name, is_mandatory)
JOIN job_posts    j ON j.job_post_id      = m.job_post_id
JOIN certificates c ON c.certificate_name = m.certificate_name;

-- =============================================================================
-- 22. job_domains (5 gán lĩnh vực cho tin tuyển dụng)
--     Dùng JOIN theo domain_name để không hardcode serial domain_id
-- =============================================================================
INSERT INTO job_domains (job_post_id, domain_id)
SELECT j.job_post_id, d.domain_id
FROM (VALUES
    ('h8000000-0000-0000-0000-000000000001'::UUID, 'Phan mem & Cong nghe thong tin'),
    ('h8000000-0000-0000-0000-000000000002'::UUID, 'Phan mem & Cong nghe thong tin'),
    ('h8000000-0000-0000-0000-000000000003'::UUID, 'Phan mem & Cong nghe thong tin'),
    ('h8000000-0000-0000-0000-000000000004'::UUID, 'Fintech & Ngan hang so'),
    ('h8000000-0000-0000-0000-000000000005'::UUID, 'Thuong mai dien tu & Logistics')
) AS m(job_post_id, domain_name)
JOIN job_posts j ON j.job_post_id  = m.job_post_id
JOIN domains   d ON d.domain_name  = m.domain_name;

-- =============================================================================
-- 23. cv_analyses (5 phiên phân tích CV do ứng viên kích hoạt)
--     status: PENDING | PROCESSING | COMPLETED | FAILED
--     target_job_type: FULL_TIME | PART_TIME | INTERNSHIP | CONTRACT | FREELANCE | NULL
--     target_workplace_type: ON_SITE | HYBRID | REMOTE | NULL
--     target_job_level: INTERN | FRESHER | JUNIOR | MIDDLE | SENIOR | LEAD | NULL
-- =============================================================================
INSERT INTO cv_analyses (
    analysis_id, resume_id,
    target_position_title, target_city, target_domain_id,
    target_job_type, target_workplace_type, target_min_salary,
    target_experience_years, target_job_level,
    status, total_jobs_scanned, matched_jobs_count, execution_time_ms
)
SELECT
    m.analysis_id, m.resume_id,
    m.target_position_title, m.target_city, d.domain_id,
    m.target_job_type, m.target_workplace_type, m.target_min_salary,
    m.target_experience_years, m.target_job_level,
    m.status, m.total_jobs_scanned, m.matched_jobs_count, m.execution_time_ms
FROM (VALUES
    -- analysis 1: Nguyen Van An (Backend 3 năm) → tìm MIDDLE backend ở Hà Nội, COMPLETED
    ('i9000000-0000-0000-0000-000000000001'::UUID,
     'g7000000-0000-0000-0000-000000000001'::UUID,
     'Backend Developer', 'Ha Noi', 'Phan mem & Cong nghe thong tin',
     'FULL_TIME', 'HYBRID', 20000000::BIGINT,
     3.0::NUMERIC, 'MIDDLE',
     'COMPLETED', 120, 5, 4350),

    -- analysis 2: Tran Thi Bich Ngoc (Frontend 1.5 năm) → tìm JUNIOR, COMPLETED
    ('i9000000-0000-0000-0000-000000000002'::UUID,
     'g7000000-0000-0000-0000-000000000002'::UUID,
     'Frontend Developer', 'Ha Noi', 'Phan mem & Cong nghe thong tin',
     'FULL_TIME', 'HYBRID', 12000000::BIGINT,
     1.5::NUMERIC, 'JUNIOR',
     'COMPLETED', 120, 3, 3870),

    -- analysis 3: Le Hoang Nam (DevOps 5 năm) → tìm SENIOR, COMPLETED
    ('i9000000-0000-0000-0000-000000000003'::UUID,
     'g7000000-0000-0000-0000-000000000003'::UUID,
     'DevOps Engineer', 'Ho Chi Minh', 'Phan mem & Cong nghe thong tin',
     'FULL_TIME', 'ON_SITE', 30000000::BIGINT,
     5.0::NUMERIC, 'SENIOR',
     'COMPLETED', 120, 4, 5120),

    -- analysis 4: Pham Ngoc Linh (Fresher) → đang xử lý, PROCESSING
    ('i9000000-0000-0000-0000-000000000004'::UUID,
     'g7000000-0000-0000-0000-000000000004'::UUID,
     'Mobile Developer', 'Ha Noi', 'Fintech & Ngan hang so',
     'INTERNSHIP', 'ON_SITE', 5000000::BIGINT,
     0.0::NUMERIC, 'FRESHER',
     'PROCESSING', 0, 0, NULL),

    -- analysis 5: Vo Duc Thinh (Data 8.5 năm) → tìm LEAD, COMPLETED
    ('i9000000-0000-0000-0000-000000000005'::UUID,
     'g7000000-0000-0000-0000-000000000005'::UUID,
     'Data Scientist', NULL, 'Thuong mai dien tu & Logistics',
     'FULL_TIME', 'REMOTE', 40000000::BIGINT,
     8.5::NUMERIC, 'LEAD',
     'COMPLETED', 120, 2, 6200)
) AS m(analysis_id, resume_id,
       target_position_title, target_city, domain_name,
       target_job_type, target_workplace_type, target_min_salary,
       target_experience_years, target_job_level,
       status, total_jobs_scanned, matched_jobs_count, execution_time_ms)
LEFT JOIN domains d ON d.domain_name = m.domain_name;

-- =============================================================================
-- 24. matched_results (5 kết quả khớp CV–JD)
--     overall/skill/experience/education_score: 0.00–100.00
--     UNIQUE (analysis_id, job_post_id)
-- =============================================================================
INSERT INTO matched_results (
    analysis_id, job_post_id,
    overall_score, skill_score, experience_score, education_score,
    missing_skills, ai_feedback
) VALUES

-- Nguyen Van An vs Senior Backend (JP-01) → khớp tốt
('i9000000-0000-0000-0000-000000000001',
 'h8000000-0000-0000-0000-000000000001',
 82.50, 85.00, 80.00, 90.00,
 '["Kafka", "Redis"]'::JSONB,
 'Ung vien co nen tang Java Spring Boot vung chac, phu hop 85% yeu cau. Can bo sung Kafka va Redis de tang muc do phu hop.'),

-- Tran Thi Bich Ngoc vs Python Data Engineer (JP-02) → kha hop
('i9000000-0000-0000-0000-000000000002',
 'h8000000-0000-0000-0000-000000000002',
 68.00, 70.00, 60.00, 80.00,
 '["Apache Airflow", "SQL nang cao"]'::JSONB,
 'Ung vien biet Python nhung thieu kinh nghiem voi Airflow va xu ly du lieu lon. Can tang cuong ky nang ETL.'),

-- Le Hoang Nam vs DevOps Engineer (JP-03) → khop rat tot
('i9000000-0000-0000-0000-000000000003',
 'h8000000-0000-0000-0000-000000000003',
 91.00, 95.00, 95.00, 85.00,
 '[]'::JSONB,
 'Ung vien xuat sac, dap ung day du 95% yeu cau ky thuat, co chung chi CKA. De xuat phong van ngay.'),

-- Pham Ngoc Linh vs Fresher Mobile (JP-04) → phu hop vua
('i9000000-0000-0000-0000-000000000004',
 'h8000000-0000-0000-0000-000000000004',
 55.00, 50.00, 60.00, 70.00,
 '["React Native", "Git"]'::JSONB,
 'Ung vien fresher co tiem nang, can hoc them React Native. Phu hop vi tri thuc tap co dao tao.'),

-- Vo Duc Thinh vs Data Scientist (JP-05) → khop cao
('i9000000-0000-0000-0000-000000000005',
 'h8000000-0000-0000-0000-000000000005',
 88.00, 90.00, 95.00, 80.00,
 '["Spark Streaming"]'::JSONB,
 'Ung vien co 8+ nam kinh nghiem, rat phu hop vi tri LEAD. Chi thieu kinh nghiem Spark Streaming real-time.');

-- =============================================================================
-- 25. saved_jobs (5 lượt lưu tin yêu thích)
--     PK composite (candidate_id, job_post_id) — UNIQUE
-- =============================================================================
INSERT INTO saved_jobs (candidate_id, job_post_id, notes) VALUES
    -- Nguyen Van An luu JP-01 (Backend - phu hop)
    ('f6000000-0000-0000-0000-000000000001', 'h8000000-0000-0000-0000-000000000001',
     'Luong tot, hybrid, dung stack cua minh'),

    -- Nguyen Van An cung luu JP-05 (DS remote - de xem them)
    ('f6000000-0000-0000-0000-000000000001', 'h8000000-0000-0000-0000-000000000005',
     'Remote toan phan, thuong luong, xem xet sau'),

    -- Tran Thi Bich Ngoc luu JP-02
    ('f6000000-0000-0000-0000-000000000002', 'h8000000-0000-0000-0000-000000000002',
     'FPT uy tin, luong ok cho fresher 1.5 nam'),

    -- Le Hoang Nam luu JP-03
    ('f6000000-0000-0000-0000-000000000003', 'h8000000-0000-0000-0000-000000000003',
     'Vingroup, luong cao, phu hop ky nang K8s'),

    -- Vo Duc Thinh luu JP-05
    ('f6000000-0000-0000-0000-000000000005', 'h8000000-0000-0000-0000-000000000005',
     'Tiki, remote, thuong luong, phu hop nhat hien tai');

-- =============================================================================
-- 26. job_applications (5 đơn ứng tuyển)
--     UNIQUE (job_post_id, candidate_id)
--     status: SUBMITTED | VIEWED | SHORTLISTED | INTERVIEWING | OFFERED | REJECTED | WITHDRAWN
--     resume_id FK tới resumes
-- =============================================================================
INSERT INTO job_applications (application_id, job_post_id, candidate_id, resume_id, status, recruiter_notes) VALUES
    -- Nguyen Van An ung tuyen JP-01 (Backend TechCorp) → SHORTLISTED
    (gen_random_uuid(),
     'h8000000-0000-0000-0000-000000000001',
     'f6000000-0000-0000-0000-000000000001',
     'g7000000-0000-0000-0000-000000000001',
     'SHORTLISTED',
     'CV an tuong, ky nang Spring Boot tot. Moi phong van vong ky thuat.'),

    -- Tran Thi Bich Ngoc ung tuyen JP-02 (Python FPT) → VIEWED
    (gen_random_uuid(),
     'h8000000-0000-0000-0000-000000000002',
     'f6000000-0000-0000-0000-000000000002',
     'g7000000-0000-0000-0000-000000000002',
     'VIEWED',
     'Da xem CV, can xem xet them kinh nghiem ETL.'),

    -- Le Hoang Nam ung tuyen JP-03 (DevOps Vingroup) → INTERVIEWING
    (gen_random_uuid(),
     'h8000000-0000-0000-0000-000000000003',
     'f6000000-0000-0000-0000-000000000003',
     'g7000000-0000-0000-0000-000000000003',
     'INTERVIEWING',
     'Co chung chi CKA, kinh nghiem 5 nam. Dang phong van vong 2.'),

    -- Pham Ngoc Linh ung tuyen JP-04 (Fresher VNPAY) → SUBMITTED
    (gen_random_uuid(),
     'h8000000-0000-0000-0000-000000000004',
     'f6000000-0000-0000-0000-000000000004',
     'g7000000-0000-0000-0000-000000000004',
     'SUBMITTED',
     NULL),

    -- Vo Duc Thinh ung tuyen JP-05 (DS Tiki) → OFFERED
    (gen_random_uuid(),
     'h8000000-0000-0000-0000-000000000005',
     'f6000000-0000-0000-0000-000000000005',
     'g7000000-0000-0000-0000-000000000005',
     'OFFERED',
     'Ung vien xuat sac, da gui offer thuong luong 55 trieu. Cho phan hoi.');

-- =============================================================================
-- 27. search_history (5 lịch sử tìm kiếm của ứng viên)
--     min_salary >= 0 | results_count >= 0
--     Dùng JOIN theo domain_name để lấy domain_id
-- =============================================================================
INSERT INTO search_history (candidate_id, keyword, domain_id, city, min_salary, results_count)
SELECT s.candidate_id, s.keyword, d.domain_id, s.city, s.min_salary, s.results_count
FROM (VALUES
    ('f6000000-0000-0000-0000-000000000001'::UUID,
     'Backend Developer Java', 'Phan mem & Cong nghe thong tin',
     'Ha Noi', 20000000::BIGINT, 42),

    ('f6000000-0000-0000-0000-000000000002'::UUID,
     'Frontend React NextJS', 'Phan mem & Cong nghe thong tin',
     'Ha Noi', 12000000::BIGINT, 28),

    ('f6000000-0000-0000-0000-000000000003'::UUID,
     'DevOps Kubernetes AWS', 'Phan mem & Cong nghe thong tin',
     'Ho Chi Minh', 30000000::BIGINT, 15),

    ('f6000000-0000-0000-0000-000000000004'::UUID,
     'Thuc tap Mobile Developer', 'Fintech & Ngan hang so',
     'Ha Noi', 5000000::BIGINT, 9),

    ('f6000000-0000-0000-0000-000000000005'::UUID,
     'Data Scientist Machine Learning', 'Thuong mai dien tu & Logistics',
     NULL, 40000000::BIGINT, 7)
) AS s(candidate_id, keyword, domain_name, city, min_salary, results_count)
LEFT JOIN domains d ON d.domain_name = s.domain_name;

