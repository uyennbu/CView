-- =============================================================================
-- SEED DATA: Bảng nghiệp vụ (Section 2)
-- addresses, companies, recruiter_profiles, candidate_profiles,
-- domains, skills, certificates, resumes, resume_skills
-- 5 dòng mỗi bảng
-- =============================================================================

SET client_min_messages TO WARNING;

-- Dọn dẹp các bảng nghiệp vụ trước khi nạp để chạy lại an toàn, không trùng key
TRUNCATE TABLE resume_skills, resumes, candidate_profiles, recruiter_profiles,
               companies, addresses, domains, skills, certificates CASCADE;

-- =============================================================================
-- 10. addresses
--     Tạo trước: 5 địa chỉ công ty (addr-C) + 5 địa chỉ ứng viên (addr-U)
-- =============================================================================
INSERT INTO addresses (address_id, street_address, ward, city, country) VALUES
    -- Địa chỉ công ty
    ('c3000000-0000-0000-0000-000000000001', '1 Pham Van Bach, Cau Giay',         'Yen Hoa',       'Ha Noi',     'Viet Nam'),
    ('c3000000-0000-0000-0000-000000000002', '8 Nguyen Phong Sac, Cau Giay',      'Dich Vong Hau', 'Ha Noi',     'Viet Nam'),
    ('c3000000-0000-0000-0000-000000000003', '72 Le Thanh Ton, Quan 1',           'Ben Nghe',      'Ho Chi Minh','Viet Nam'),
    ('c3000000-0000-0000-0000-000000000004', '458 Minh Khai, Hai Ba Trung',       'Vinh Tuy',      'Ha Noi',     'Viet Nam'),
    ('c3000000-0000-0000-0000-000000000005', '52 Ut Tich, Tan Phu',               'Hiep Thanh',    'Ho Chi Minh','Viet Nam'),
    -- Địa chỉ ứng viên
    ('c3000000-0000-0000-0000-000000000006', '15 Trung Kinh, Cau Giay',           'Yen Hoa',       'Ha Noi',     'Viet Nam'),
    ('c3000000-0000-0000-0000-000000000007', '34 Hoang Ngan, Thanh Xuan',         'Nhan Chinh',    'Ha Noi',     'Viet Nam'),
    ('c3000000-0000-0000-0000-000000000008', '120 Ly Thuong Kiet, Quan 10',       'Phuong 14',     'Ho Chi Minh','Viet Nam'),
    ('c3000000-0000-0000-0000-000000000009', '5 Ngo Quyen, Ngo Quyen District',   'Lac Vien',      'Hai Phong',  'Viet Nam'),
    ('c3000000-0000-0000-0000-000000000010', '99 Hung Vuong, Hai Chau',           'Thach Thang',   'Da Nang',    'Viet Nam');

-- =============================================================================
-- 11. companies (5 công ty — mỗi công ty dùng 1 address_id UNIQUE)
--     tax_code: đúng pattern ^[0-9]{10}(-[0-9]{3})?$
--     website:  đúng pattern ^https?://.*$
-- =============================================================================
INSERT INTO companies (company_id, name, address_id, tax_code, website, logo_url, industry, verification_status) VALUES
    ('d4000000-0000-0000-0000-000000000001',
     'TechCorp Vietnam JSC',
     'c3000000-0000-0000-0000-000000000001',
     '0101234567', 'https://techcorp.vn',
     'https://cdn.techcorp.vn/logo.png',
     'Phan mem & Cong nghe thong tin', 'VERIFIED'),

    ('d4000000-0000-0000-0000-000000000002',
     'FPT Software Ha Noi',
     'c3000000-0000-0000-0000-000000000002',
     '0102345678', 'https://software.fpt.com.vn',
     'https://cdn.fpt.vn/logo.png',
     'Phan mem & Cong nghe thong tin', 'VERIFIED'),

    ('d4000000-0000-0000-0000-000000000003',
     'Vingroup Digital Solutions',
     'c3000000-0000-0000-0000-000000000003',
     '0313456789', 'https://digital.vingroup.net',
     'https://cdn.vingroup.net/logo.png',
     'Thuong mai dien tu & Dich vu so', 'VERIFIED'),

    ('d4000000-0000-0000-0000-000000000004',
     'VNPAY Technology Corp',
     'c3000000-0000-0000-0000-000000000004',
     '0104567890', 'https://vnpay.vn',
     'https://cdn.vnpay.vn/logo.png',
     'Fintech & Thanh toan dien tu', 'PENDING'),

    ('d4000000-0000-0000-0000-000000000005',
     'Tiki Corporation',
     'c3000000-0000-0000-0000-000000000005',
     '0315678901', 'https://tiki.vn',
     'https://cdn.tiki.vn/logo.png',
     'Thuong mai dien tu & Logistics', 'VERIFIED');

-- =============================================================================
-- 12. recruiter_profiles (5 nhà tuyển dụng)
-- =============================================================================
INSERT INTO recruiter_profiles (recruiter_id, account_id, company_id, full_name, job_title, work_email, phone_number) VALUES
    ('e5000000-0000-0000-0000-000000000001',
     'a1000000-0000-0000-0000-000000000004',
     'd4000000-0000-0000-0000-000000000001',
     'Nguyen Thi Lan Anh', 'Technical Recruiter', 'lan.anh@techcorp.vn', '0912345671'),

    ('e5000000-0000-0000-0000-000000000002',
     'a1000000-0000-0000-0000-000000000006',
     'd4000000-0000-0000-0000-000000000002',
     'Tran Minh Duc', 'HR Manager', 'minh.duc@fptsoft.vn', '0912345672'),

    ('e5000000-0000-0000-0000-000000000003',
     'a1000000-0000-0000-0000-000000000007',
     'd4000000-0000-0000-0000-000000000003',
     'Pham Bao Chau', 'Talent Acquisition Lead', 'bao.chau@vingroup.vn', '0912345673'),

    ('e5000000-0000-0000-0000-000000000004',
     'a1000000-0000-0000-0000-000000000008',
     'd4000000-0000-0000-0000-000000000004',
     'Le Quoc Hung', 'Recruitment Specialist', 'quoc.hung@vnpay.vn', '0912345674'),

    ('e5000000-0000-0000-0000-000000000005',
     'a1000000-0000-0000-0000-000000000009',
     'd4000000-0000-0000-0000-000000000005',
     'Hoang Thi Mai Linh', 'HR Business Partner', 'mai.linh@tiki.vn', '0912345675');

-- =============================================================================
-- 13. candidate_profiles (5 ứng viên)
-- =============================================================================
INSERT INTO candidate_profiles (candidate_id, account_id, full_name, date_of_birth, gender, address_id, current_job_title, years_of_experience, education_level) VALUES
    ('f6000000-0000-0000-0000-000000000001',
     'a1000000-0000-0000-0000-000000000005',
     'Nguyen Van An', '1998-05-15', 'MALE',
     'c3000000-0000-0000-0000-000000000006',
     'Backend Developer', 3.0, 'BACHELOR'),

    ('f6000000-0000-0000-0000-000000000002',
     'a1000000-0000-0000-0000-000000000010',
     'Tran Thi Bich Ngoc', '2000-09-20', 'FEMALE',
     'c3000000-0000-0000-0000-000000000007',
     'Frontend Developer', 1.5, 'BACHELOR'),

    ('f6000000-0000-0000-0000-000000000003',
     'a1000000-0000-0000-0000-000000000011',
     'Le Hoang Nam', '1995-03-10', 'MALE',
     'c3000000-0000-0000-0000-000000000008',
     'DevOps Engineer', 5.0, 'MASTER'),

    ('f6000000-0000-0000-0000-000000000004',
     'a1000000-0000-0000-0000-000000000012',
     'Pham Ngoc Linh', '2002-11-01', 'FEMALE',
     'c3000000-0000-0000-0000-000000000009',
     NULL, 0.0, 'BACHELOR'),

    ('f6000000-0000-0000-0000-000000000005',
     'a1000000-0000-0000-0000-000000000013',
     'Vo Duc Thinh', '1990-07-25', 'MALE',
     'c3000000-0000-0000-0000-000000000010',
     'Data Engineer', 8.5, 'MASTER');

-- =============================================================================
-- 14. domains (5 lĩnh vực ngành nghề)
-- =============================================================================
INSERT INTO domains (domain_name, description) VALUES
    ('Phan mem & Cong nghe thong tin', 'Phat trien phan mem, web, mobile, cloud, AI/ML'),
    ('Fintech & Ngan hang so',          'Cong nghe tai chinh, thanh toan, blockchain, bao hiem so'),
    ('Thuong mai dien tu & Logistics',  'Nen tang TMDT, quan ly chuoi cung ung, van tai'),
    ('Y te & Cong nghe Y sinh',         'Phan mem y te, telemedicine, thiet bi y te so'),
    ('Giao duc & Edtech',               'Nen tang hoc truc tuyen, quan ly dao tao, LMS');

-- =============================================================================
-- 15. skills (5 kỹ năng chuẩn hóa)
-- =============================================================================
INSERT INTO skills (skill_name, category, description) VALUES
    ('Java Spring Boot',    'HARD_SKILL',           'Framework Java cho backend enterprise'),
    ('Python',             'HARD_SKILL',           'Ngon ngu lap trinh da nang, manh ve AI/data'),
    ('Docker & Kubernetes','HARD_SKILL',           'Cong nghe container hoa va dieu phoi container'),
    ('Giao tiep hieu qua', 'SOFT_SKILL',           'Ky nang trinh bay, thuyet trinh, lam viec nhom'),
    ('English (B2+)',       'LANGUAGE',             'Tieng Anh chuyen nghiep, doc viet tai lieu ky thuat');

-- =============================================================================
-- 16. certificates (5 chứng chỉ nghề nghiệp)
-- =============================================================================
INSERT INTO certificates (certificate_name, issuer, score, category) VALUES
    ('AWS Certified Solutions Architect - Associate', 'Amazon Web Services',          NULL,  'TECH_DATA'),
    ('Google Professional Cloud Developer',           'Google Cloud',                 NULL,  'TECH_DATA'),
    ('Project Management Professional (PMP)',         'Project Management Institute',  NULL,  'MANAGEMENT_AGILE'),
    ('IELTS Academic',                                'British Council / IDP',         7.0,   'LANGUAGE'),
    ('Certified Kubernetes Administrator (CKA)',      'Cloud Native Computing Found.', NULL,  'TECH_DATA');

-- =============================================================================
-- 17. resumes (5 CV của ứng viên)
-- =============================================================================
INSERT INTO resumes (resume_id, candidate_id, title, file_name, file_url, file_size_bytes) VALUES
    ('07000000-0000-0000-0000-000000000001',
     'f6000000-0000-0000-0000-000000000001',
     'CV Backend Developer 2026',
     'NguyenVanAn_CV_Backend_2026.pdf',
     'https://storage.cview.vn/resumes/f6-01/NguyenVanAn_CV_Backend_2026.pdf',
     524288),

    ('07000000-0000-0000-0000-000000000002',
     'f6000000-0000-0000-0000-000000000002',
     'CV Frontend Developer 2026',
     'TranThiBichNgoc_CV_Frontend_2026.pdf',
     'https://storage.cview.vn/resumes/f6-02/TranThiBichNgoc_CV_Frontend_2026.pdf',
     409600),

    ('07000000-0000-0000-0000-000000000003',
     'f6000000-0000-0000-0000-000000000003',
     'CV DevOps Senior 2026',
     'LeHoangNam_CV_DevOps_2026.pdf',
     'https://storage.cview.vn/resumes/f6-03/LeHoangNam_CV_DevOps_2026.pdf',
     786432),

    ('07000000-0000-0000-0000-000000000004',
     'f6000000-0000-0000-0000-000000000004',
     'CV Fresher Developer 2026',
     'PhamNgocLinh_CV_Fresher_2026.pdf',
     'https://storage.cview.vn/resumes/f6-04/PhamNgocLinh_CV_Fresher_2026.pdf',
     307200),

    ('07000000-0000-0000-0000-000000000005',
     'f6000000-0000-0000-0000-000000000005',
     'CV Data Engineer Senior 2026',
     'VoDucThinh_CV_DataEng_2026.pdf',
     'https://storage.cview.vn/resumes/f6-05/VoDucThinh_CV_DataEng_2026.pdf',
     1048576);

-- =============================================================================
-- 18. resume_skills (5 kỹ năng trích xuất từ CV qua AI)
-- =============================================================================
INSERT INTO resume_skills (resume_id, skill_id, years_experience, proficiency_level, confidence_score)
SELECT r.resume_id, s.skill_id, m.years_experience, m.proficiency_level, m.confidence_score
FROM (VALUES
    ('07000000-0000-0000-0000-000000000001'::UUID, 'Java Spring Boot',    3.0, 'ADVANCED', 0.950),
    ('07000000-0000-0000-0000-000000000002'::UUID, 'Python',             1.5, 'MEDIUM',   0.880),
    ('07000000-0000-0000-0000-000000000003'::UUID, 'Docker & Kubernetes', 5.0, 'EXPERT',   0.970),
    ('07000000-0000-0000-0000-000000000004'::UUID, 'Giao tiep hieu qua', 0.0, 'MEDIUM',   0.750),
    ('07000000-0000-0000-0000-000000000005'::UUID, 'Python',             8.5, 'EXPERT',   0.990)
) AS m(resume_id, skill_name, years_experience, proficiency_level, confidence_score)
JOIN resumes r ON r.resume_id = m.resume_id
JOIN skills  s ON s.skill_name = m.skill_name;
