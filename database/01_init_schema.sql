-- 0. Khởi tạo Extensions cần thiết
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SECTION 1: Bảng hệ thống
-- =============================================================================

-- Bảng 1: accounts
CREATE TABLE accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_accounts_username CHECK (username ~ '^[a-zA-Z0-9_]{3,50}$'),
    CONSTRAINT chk_accounts_status CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED')),
    CONSTRAINT chk_accounts_phone CHECK (phone_number IS NULL OR phone_number ~ '^(0[3|5|7|8|9][0-9]{8}|\+84[3|5|7|8|9][0-9]{8})$')
);
COMMENT ON TABLE accounts IS 'Quản lý thông tin tài khoản xác thực đăng nhập duy nhất cho tất cả các nhóm đối tượng';

-- Bảng 2: roles
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_roles_name CHECK (role_name IN ('ADMIN', 'RECRUITER', 'CANDIDATE'))
);
COMMENT ON TABLE roles IS 'Lưu trữ danh mục các vai trò trong hệ thống (RBAC)';

-- Bảng 3: permissions
CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE permissions IS 'Định nghĩa danh mục các quyền hạn chi tiết (granular permissions)';

-- Bảng 4: account_roles
CREATE TABLE account_roles (
    account_id UUID NOT NULL,
    role_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id, role_id),
    CONSTRAINT fk_account_roles_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_account_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);
COMMENT ON TABLE account_roles IS 'Bảng trung gian N-N giữa accounts và roles';

-- Bảng 5: role_permissions
CREATE TABLE role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);
COMMENT ON TABLE role_permissions IS 'Bảng trung gian N-N giữa roles và permissions';

-- Bảng 6: sessions
CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT chk_sessions_expiry CHECK (expires_at > created_at)
);
COMMENT ON TABLE sessions IS 'Quản lý phiên đăng nhập hợp lệ và Refresh Token';

-- Bảng 7: auth_logs
CREATE TABLE auth_logs (
    log_id BIGSERIAL PRIMARY KEY,
    account_id UUID,
    event_type VARCHAR(30) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    failure_reason VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auth_logs_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE SET NULL,
    CONSTRAINT chk_auth_logs_event_type CHECK (event_type IN ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGE', 'PASSWORD_RESET_REQUEST', 'TOKEN_REFRESH'))
);
COMMENT ON TABLE auth_logs IS 'Ghi nhận lịch sử các sự kiện liên quan tới xác thực bảo mật tài khoản';

-- Bảng 8: activity_logs
CREATE TABLE activity_logs (
    activity_id BIGSERIAL PRIMARY KEY,
    sessions_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_entity VARCHAR(30) NOT NULL,
    target_id VARCHAR(64),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_logs_session FOREIGN KEY (sessions_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    CONSTRAINT chk_activity_logs_action CHECK (action_type IN ('UPLOAD_RESUME', 'ANALYZE_CV', 'VIEW_JOB', 'SEARCH_JOB', 'SAVE_JOB', 'APPLY_JOB', 'CREATE_JOB_POST', 'APPROVE_JOB_POST', 'REJECT_JOB_POST')),
    CONSTRAINT chk_activity_logs_entity CHECK (target_entity IN ('RESUME', 'JOB_POST', 'CV_ANALYSIS', 'ACCOUNT', 'APPLICATION'))
);
COMMENT ON TABLE activity_logs IS 'Ghi vết hành vi thao tác nghiệp vụ của người dùng trên toàn hệ thống';

-- Bảng 9: system_error_logs
CREATE TABLE system_error_logs (
    error_id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    severity VARCHAR(15) NOT NULL,
    error_code VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_system_error_severity CHECK (severity IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'))
);
COMMENT ON TABLE system_error_logs IS 'Ghi nhận các lỗi hệ thống, exception, timeout';

-- =============================================================================
-- SECTION 2: Bảng nghiệp vụ
-- =============================================================================

-- Bảng 11: addresses (Tạo trước để Companies và Candidate Profiles tham chiếu)
CREATE TABLE addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    street_address VARCHAR(255) NOT NULL,
    ward VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'Việt Nam',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE addresses IS 'Quản lý thông tin địa chỉ hành chính chuẩn hóa';

-- Bảng 10: companies
CREATE TABLE companies (
    company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    address_id UUID NOT NULL UNIQUE,
    tax_code VARCHAR(20) NOT NULL UNIQUE,
    website VARCHAR(255),
    logo_url VARCHAR(500),
    industry VARCHAR(100) NOT NULL,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_companies_address FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE RESTRICT,
    CONSTRAINT chk_companies_tax_code CHECK (tax_code ~ '^[0-9]{10}(-[0-9]{3})?$'),
    CONSTRAINT chk_companies_website CHECK (website IS NULL OR website ~ '^https?://.*$'),
    CONSTRAINT chk_companies_status CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'))
);
COMMENT ON TABLE companies IS 'Quản lý thông tin pháp nhân doanh nghiệp';

-- Bảng 12: recruiter_profiles
CREATE TABLE recruiter_profiles (
    recruiter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL UNIQUE,
    company_id UUID NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    work_email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(15),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recruiter_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_recruiter_company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE RESTRICT
);
COMMENT ON TABLE recruiter_profiles IS 'Quản lý thông tin hồ sơ nhà tuyển dụng';

-- Bảng 13: candidate_profiles
CREATE TABLE candidate_profiles (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    address_id UUID,
    current_job_title VARCHAR(100),
    years_of_experience NUMERIC(3, 1) NOT NULL DEFAULT 0.0,
    education_level VARCHAR(30) NOT NULL DEFAULT 'BACHELOR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidate_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_candidate_address FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE SET NULL,
    CONSTRAINT chk_candidate_dob CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '16 years'),
    CONSTRAINT chk_candidate_gender CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER')),
    CONSTRAINT chk_candidate_yoe CHECK (years_of_experience >= 0 AND years_of_experience <= 50),
    CONSTRAINT chk_candidate_edu CHECK (education_level IN ('HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'OTHER'))
);
COMMENT ON TABLE candidate_profiles IS 'Quản lý thông tin cá nhân và hồ sơ tìm việc của ứng viên';

-- Bảng 14: domains
CREATE TABLE domains (
    domain_id SERIAL PRIMARY KEY,
    domain_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE domains IS 'Danh mục chuẩn hóa các lĩnh vực ngành nghề';

-- Bảng 15: skills
CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(30) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_skills_category CHECK (category IN ('HARD_SKILL', 'SOFT_SKILL', 'MANAGEMENT_LEADERSHIP', 'LANGUAGE', 'OTHER'))
);
COMMENT ON TABLE skills IS 'Quản lý danh mục kỹ năng chuẩn hóa';

-- Bảng 16: certificates
CREATE TABLE certificates (
    certificate_id SERIAL PRIMARY KEY,
    certificate_name VARCHAR(150) NOT NULL UNIQUE,
    issuer VARCHAR(100) NOT NULL,
    score REAL,
    category VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_certificates_category CHECK (category IN (
        'TECH_DATA', 'MANAGEMENT_AGILE', 'FINANCE_ACCOUNTING', 'BUSINESS_MARKETING', 
        'LANGUAGE', 'PROFESSIONAL_LICENSE', 'QUALITY_SAFETY', 'DESIGN_CREATIVE', 
        'ENGINEERING_MANUFACTURING', 'CONSTRUCTION_REAL_ESTATE', 'HEALTHCARE_MEDICAL', 
        'EDUCATION_TRAINING', 'LOGISTICS_TRANSPORT', 'HOSPITALITY_SERVICES', 'OTHER'
    ))
);
COMMENT ON TABLE certificates IS 'Quản lý danh mục chứng chỉ nghề nghiệp và ngoại ngữ chuẩn hóa';

-- Bảng 17: resumes
CREATE TABLE resumes (
    resume_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resumes_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(candidate_id) ON DELETE CASCADE,
    CONSTRAINT chk_resumes_file_size CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760)
);
COMMENT ON TABLE resumes IS 'Quản lý các file CV dạng PDF do ứng viên tải lên';

-- Bảng 18: resume_skills
CREATE TABLE resume_skills (
    resume_id UUID NOT NULL,
    skill_id INTEGER NOT NULL,
    years_experience NUMERIC(3, 1),
    proficiency_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (resume_id, skill_id),
    CONSTRAINT fk_resume_skills_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE,
    CONSTRAINT fk_resume_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE RESTRICT,
    CONSTRAINT chk_resume_skills_yoe CHECK (years_experience IS NULL OR years_experience >= 0),
    CONSTRAINT chk_resume_skills_proficiency CHECK (proficiency_level IN ('BEGINNER', 'MEDIUM', 'ADVANCED', 'EXPERT')),
    CONSTRAINT chk_resume_skills_confidence CHECK (confidence_score BETWEEN 0.000 AND 1.000)
);
COMMENT ON TABLE resume_skills IS 'Lưu trữ danh sách kỹ năng trích xuất từ CV qua AI';

-- Bảng 19: job_posts
CREATE TABLE job_posts (
    job_post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL,
    company_id UUID NOT NULL,
    position VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    benefits TEXT,
    job_type VARCHAR(20) NOT NULL,
    workplace_type VARCHAR(20) NOT NULL,
    address_id UUID,
    salary_min BIGINT,
    salary_max BIGINT,
    is_salary_negotiable BOOLEAN NOT NULL DEFAULT FALSE,
    experience_years_min NUMERIC(3, 1) NOT NULL DEFAULT 0.0,
    required_education VARCHAR(30) NOT NULL DEFAULT 'NONE',
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    deadline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_posts_recruiter FOREIGN KEY (recruiter_id) REFERENCES recruiter_profiles(recruiter_id) ON DELETE RESTRICT,
    CONSTRAINT fk_job_posts_company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE RESTRICT,
    CONSTRAINT fk_job_posts_address FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE SET NULL,
    CONSTRAINT fk_job_posts_approved_by FOREIGN KEY (approved_by) REFERENCES accounts(account_id) ON DELETE SET NULL,
    CONSTRAINT chk_job_posts_type CHECK (job_type IN ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE')),
    CONSTRAINT chk_job_posts_workplace CHECK (workplace_type IN ('ON_SITE', 'HYBRID', 'REMOTE')),
    CONSTRAINT chk_job_posts_salary CHECK (
        (salary_min IS NULL OR salary_min >= 0) AND 
        (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min)
    ),
    CONSTRAINT chk_job_posts_exp CHECK (experience_years_min >= 0),
    CONSTRAINT chk_job_posts_edu CHECK (required_education IN ('NONE', 'HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER')),
    CONSTRAINT chk_job_posts_status CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CLOSED')),
    CONSTRAINT chk_job_posts_deadline CHECK (deadline > created_at)
);
COMMENT ON TABLE job_posts IS 'Quản lý toàn bộ thông tin các bài đăng tuyển dụng';

-- Bảng 20: job_skills
CREATE TABLE job_skills (
    job_post_id UUID NOT NULL,
    skill_id INTEGER NOT NULL,
    requirement_type VARCHAR(20) NOT NULL DEFAULT 'MANDATORY',
    min_years_experience NUMERIC(3, 1) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (job_post_id, skill_id),
    CONSTRAINT fk_job_skills_post FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE RESTRICT,
    CONSTRAINT chk_job_skills_req CHECK (requirement_type IN ('MANDATORY', 'PREFERRED')),
    CONSTRAINT chk_job_skills_exp CHECK (min_years_experience >= 0)
);
COMMENT ON TABLE job_skills IS 'Bảng trung gian gán kỹ năng yêu cầu cho từng tin tuyển dụng';

-- Bảng 21: job_certificates
CREATE TABLE job_certificates (
    job_post_id UUID NOT NULL,
    certificate_id INTEGER NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (job_post_id, certificate_id),
    CONSTRAINT fk_job_certs_post FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_certs_cert FOREIGN KEY (certificate_id) REFERENCES certificates(certificate_id) ON DELETE RESTRICT
);
COMMENT ON TABLE job_certificates IS 'Bảng trung gian định nghĩa các chứng chỉ yêu cầu cho tin tuyển dụng';

-- Bảng 22: job_domains
CREATE TABLE job_domains (
    job_post_id UUID NOT NULL,
    domain_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (job_post_id, domain_id),
    CONSTRAINT fk_job_domains_post FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_domains_domain FOREIGN KEY (domain_id) REFERENCES domains(domain_id) ON DELETE RESTRICT
);
COMMENT ON TABLE job_domains IS 'Bảng trung gian gán tin tuyển dụng vào lĩnh vực chuyên môn';

-- Bảng 23: cv_analyses
CREATE TABLE cv_analyses (
    analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL,
    target_position_title VARCHAR(100),
    target_city VARCHAR(100),
    target_domain_id INTEGER,
    target_job_type VARCHAR(20),
    target_workplace_type VARCHAR(20),
    target_min_salary BIGINT,
    target_experience_years NUMERIC(3, 1),
    target_job_level VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_jobs_scanned INTEGER NOT NULL DEFAULT 0,
    matched_jobs_count INTEGER NOT NULL DEFAULT 0,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cv_analyses_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE,
    CONSTRAINT fk_cv_analyses_domain FOREIGN KEY (target_domain_id) REFERENCES domains(domain_id) ON DELETE SET NULL,
    CONSTRAINT chk_cv_analyses_job_type CHECK (target_job_type IS NULL OR target_job_type IN ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE')),
    CONSTRAINT chk_cv_analyses_workplace CHECK (target_workplace_type IS NULL OR target_workplace_type IN ('ON_SITE', 'HYBRID', 'REMOTE')),
    CONSTRAINT chk_cv_analyses_salary CHECK (target_min_salary IS NULL OR target_min_salary >= 0),
    CONSTRAINT chk_cv_analyses_exp CHECK (target_experience_years IS NULL OR (target_experience_years >= 0 AND target_experience_years <= 50)),
    CONSTRAINT chk_cv_analyses_level CHECK (target_job_level IS NULL OR target_job_level IN ('INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD')),
    CONSTRAINT chk_cv_analyses_status CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    CONSTRAINT chk_cv_analyses_scanned CHECK (total_jobs_scanned >= 0),
    CONSTRAINT chk_cv_analyses_matched CHECK (matched_jobs_count >= 0),
    CONSTRAINT chk_cv_analyses_time CHECK (execution_time_ms IS NULL OR execution_time_ms >= 0)
);
COMMENT ON TABLE cv_analyses IS 'Lưu phiên phân tích so khớp CV do ứng viên kích hoạt';

-- Bảng 24: matched_results
CREATE TABLE matched_results (
    match_id BIGSERIAL PRIMARY KEY,
    analysis_id UUID NOT NULL,
    job_post_id UUID NOT NULL,
    overall_score NUMERIC(5, 2) NOT NULL,
    skill_score NUMERIC(5, 2) NOT NULL,
    experience_score NUMERIC(5, 2) NOT NULL,
    education_score NUMERIC(5, 2) NOT NULL,
    missing_skills JSONB,
    ai_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_matched_results UNIQUE (analysis_id, job_post_id),
    CONSTRAINT fk_matched_results_analysis FOREIGN KEY (analysis_id) REFERENCES cv_analyses(analysis_id) ON DELETE CASCADE,
    CONSTRAINT fk_matched_results_job FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE,
    CONSTRAINT chk_matched_overall CHECK (overall_score BETWEEN 0.00 AND 100.00),
    CONSTRAINT chk_matched_skill CHECK (skill_score BETWEEN 0.00 AND 100.00),
    CONSTRAINT chk_matched_exp CHECK (experience_score BETWEEN 0.00 AND 100.00),
    CONSTRAINT chk_matched_edu CHECK (education_score BETWEEN 0.00 AND 100.00)
);
COMMENT ON TABLE matched_results IS 'Lưu chi tiết kết quả phân tích độ phù hợp giữa 1 CV và 1 bài tuyển dụng';

-- Bảng 25: saved_jobs
CREATE TABLE saved_jobs (
    candidate_id UUID NOT NULL,
    job_post_id UUID NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (candidate_id, job_post_id),
    CONSTRAINT fk_saved_jobs_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(candidate_id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_jobs_job FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE
);
COMMENT ON TABLE saved_jobs IS 'Quản lý danh sách công việc ứng viên bấm lưu lại';

-- Bảng 26: job_applications
CREATE TABLE job_applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_post_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    resume_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    recruiter_notes TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_job_applications UNIQUE (job_post_id, candidate_id),
    CONSTRAINT fk_job_app_post FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE RESTRICT,
    CONSTRAINT fk_job_app_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(candidate_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_app_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE RESTRICT,
    CONSTRAINT chk_job_app_status CHECK (status IN ('SUBMITTED', 'VIEWED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'WITHDRAWN'))
);
COMMENT ON TABLE job_applications IS 'Quản lý việc nộp đơn ứng tuyển của ứng viên vào bài đăng tuyển dụng';

-- Bảng 27: search_history
CREATE TABLE search_history (
    search_id BIGSERIAL PRIMARY KEY,
    candidate_id UUID NOT NULL,
    keyword VARCHAR(255),
    domain_id INTEGER,
    city VARCHAR(100),
    min_salary BIGINT,
    results_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_search_history_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(candidate_id) ON DELETE CASCADE,
    CONSTRAINT fk_search_history_domain FOREIGN KEY (domain_id) REFERENCES domains(domain_id) ON DELETE SET NULL,
    CONSTRAINT chk_search_history_salary CHECK (min_salary IS NULL OR min_salary >= 0),
    CONSTRAINT chk_search_history_results CHECK (results_count >= 0)
);
COMMENT ON TABLE search_history IS 'Lưu trữ lịch sử tìm kiếm việc làm của ứng viên';

-- Bảng 28: job_notifications
CREATE TABLE job_notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    candidate_id UUID NOT NULL,
    job_post_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_notif_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(candidate_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_notif_post FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE
);
COMMENT ON TABLE job_notifications IS 'Quản lý thông báo việc làm gợi ý tự động cho ứng viên';

-- Bảng 29: other_notifications
CREATE TABLE other_notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    account_id UUID NOT NULL,
    notification_type VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_other_notif_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT chk_other_notif_type CHECK (notification_type IN ('JOB_APPROVAL_STATUS', 'APPLICATION_UPDATE', 'CV_PARSE_COMPLETED', 'ACCOUNT_SECURITY', 'SYSTEM_ANNOUNCEMENT'))
);
COMMENT ON TABLE other_notifications IS 'Quản lý các loại thông báo hệ thống khác';
