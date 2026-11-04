BEGIN;

CREATE EXTENSION IF NOT EXISTS "citext";

-- =============================================================================
-- 1. Bảng hệ thống
-- =============================================================================

-- 1.1 Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    account_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    account_type VARCHAR(30) NOT NULL DEFAULT 'candidate',
    CONSTRAINT chk_accounts_status CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    CONSTRAINT chk_accounts_type CHECK (account_type IN ('admin', 'candidate', 'recruiter'))
);

-- 1.2 Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 1.3 Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    permission_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 1.4 Account Roles (Junction Table)
CREATE TABLE IF NOT EXISTS account_roles (
    account_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (account_id, role_id),
    CONSTRAINT fk_account_roles_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_account_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- 1.5 Role Permissions (Junction Table)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- 1.6 Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    account_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_sessions_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT chk_sessions_expiration CHECK (expires_at > created_at)
);

-- 1.7 Auth Logs Table
CREATE TABLE IF NOT EXISTS auth_logs (
    auth_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    login_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_auth_logs_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT chk_auth_logs_status CHECK (status IN ('success', 'failed', 'locked'))
);

-- 1.8 Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    activity_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    account_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_logs_session FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_logs_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

-- 1.9 System Error Logs Table
CREATE TABLE IF NOT EXISTS system_error_logs (
    error_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id INT,
    error_code VARCHAR(100),
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_system_error_logs_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE SET NULL
);

-- 1.10 System Notifications Table
CREATE TABLE IF NOT EXISTS system_notifications (
    notification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_system_notifications_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

-- 1.11 Other Notifications Table
CREATE TABLE IF NOT EXISTS other_notifications (
    notification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_other_notifications_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);


-- =============================================================================
-- 2. Bảng nghiệp vụ công ty và các yêu cầu của jd
-- =============================================================================

-- 2.1 Detailed Address Table
CREATE TABLE IF NOT EXISTS detailed_addresses (
    address_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    street VARCHAR(255),
    house_number VARCHAR(225)
);

-- 2.2 Candidate Profiles Table
CREATE TABLE IF NOT EXISTS candidate_profiles (
    profile_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id INT NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    birth_date DATE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    gender VARCHAR(20),
    address_id INT UNIQUE,
    CONSTRAINT fk_candidate_profiles_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_candidate_profiles_address FOREIGN KEY (address_id) REFERENCES detailed_addresses(address_id) ON DELETE SET NULL,
    CONSTRAINT chk_candidate_profiles_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_candidate_profiles_phone CHECK (phone ~ '^(0|\+84)[3|5|7|8|9][0-9]{8}$'),
    CONSTRAINT chk_candidate_profiles_age CHECK (birth_date <= CURRENT_DATE - INTERVAL '16 years')
);

-- 2.3 Companies Table
CREATE TABLE IF NOT EXISTS companies (
    company_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_code VARCHAR(20) UNIQUE,
    link VARCHAR(500),
    description TEXT,
    address_id INT UNIQUE,
    CONSTRAINT fk_companies_address FOREIGN KEY (address_id) REFERENCES detailed_addresses(address_id) ON DELETE RESTRICT,
    CONSTRAINT chk_companies_tax_code CHECK (tax_code IS NULL OR tax_code ~ '^[0-9]{10}(-[0-9]{3})?$')
);

-- 2.4 Domains Table
CREATE TABLE IF NOT EXISTS domains (
    domain_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT
);

-- 2.5 Company Domains (Junction Table)
CREATE TABLE IF NOT EXISTS company_domains (
    company_id INT NOT NULL,
    domain_id INT NOT NULL,
    PRIMARY KEY (company_id, domain_id),
    CONSTRAINT fk_company_domains_company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_company_domains_domain FOREIGN KEY (domain_id) REFERENCES domains(domain_id) ON DELETE RESTRICT
);

-- 2.6 Positions Catalog Table
CREATE TABLE IF NOT EXISTS positions (
    position_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT
);

-- 2.7 Skills Table
CREATE TABLE IF NOT EXISTS skills (
    skill_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT
);

-- 2.8 Education Catalog Table
CREATE TABLE IF NOT EXISTS educations (
    education_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

-- 2.9 Certificates Catalog Table
CREATE TABLE IF NOT EXISTS certificates (
    cert_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT
);

-- =============================================================================
-- 3. Bài đăng tuyển dụng và các thành phần liên quan
-- =============================================================================

-- 3.1 Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    resume_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    profile_id INT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'uploaded',
    CONSTRAINT fk_resumes_profile FOREIGN KEY (profile_id) REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
    CONSTRAINT chk_resumes_file_size CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760), -- Max 10MB
    CONSTRAINT chk_resumes_status CHECK (status IN ('uploaded', 'processing', 'analyzed', 'archived'))
);

-- 3.2 Resume Experiences
CREATE TABLE IF NOT EXISTS resume_experiences (
    experience_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    resume_id INT NOT NULL,
    position_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    CONSTRAINT fk_resume_exp_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE,
    CONSTRAINT fk_resume_exp_position FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE RESTRICT,
    CONSTRAINT chk_resume_exp_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- 3.3 Resume Skills
CREATE TABLE IF NOT EXISTS resume_skills (
    resume_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency VARCHAR(50),
    PRIMARY KEY (resume_id, skill_id),
    CONSTRAINT fk_resume_skills_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE,
    CONSTRAINT fk_resume_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE RESTRICT
);

-- 3.4 Resume Educations
CREATE TABLE IF NOT EXISTS resume_educations (
    resume_education_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    resume_id INT NOT NULL,
    education_id INT NOT NULL,
    school VARCHAR(255) NOT NULL,
    major VARCHAR(150),
    degree VARCHAR(100),
    start_year INT NOT NULL,
    end_year INT,
    CONSTRAINT fk_resume_edu_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE,
    CONSTRAINT fk_resume_edu_education FOREIGN KEY (education_id) REFERENCES educations(education_id) ON DELETE RESTRICT,
    CONSTRAINT chk_resume_edu_years CHECK (end_year IS NULL OR end_year >= start_year)
);

-- 3.5 Resume Certificates
CREATE TABLE IF NOT EXISTS resume_certificates (
    resume_certificate_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    resume_id INT NOT NULL,
    cert_id INT NOT NULL,
    issuer VARCHAR(255),
    issued_date DATE,
    expiry_date DATE,
    CONSTRAINT fk_resume_cert_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE,
    CONSTRAINT fk_resume_cert_certificate FOREIGN KEY (cert_id) REFERENCES certificates(cert_id) ON DELETE RESTRICT,
    CONSTRAINT chk_resume_cert_dates CHECK (expiry_date IS NULL OR issued_date IS NULL OR expiry_date >= issued_date)
);

-- 3.6 Job Posts Table (Standardized position_id link to positions table)
CREATE TABLE IF NOT EXISTS job_posts (
    job_post_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INT NOT NULL,
    position_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    salary_min NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    salary_max NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    posted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closing_date DATE NOT NULL,
    CONSTRAINT fk_job_posts_company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_posts_position FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE RESTRICT,
    CONSTRAINT chk_job_posts_salary CHECK (salary_min >= 0 AND salary_max >= salary_min),
    CONSTRAINT chk_job_posts_status CHECK (status IN ('draft', 'open', 'closed', 'expired'))
);

-- 3.7 Job Skills
CREATE TABLE IF NOT EXISTS job_skills (
    job_post_id INT NOT NULL,
    skill_id INT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    importance_score NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    PRIMARY KEY (job_post_id, skill_id),
    CONSTRAINT fk_job_skills_job FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE RESTRICT,
    CONSTRAINT chk_job_skills_score CHECK (importance_score >= 0.00 AND importance_score <= 100.00)
);

-- 3.8 Job Experiences
CREATE TABLE IF NOT EXISTS job_experiences (
    job_experience_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_post_id INT NOT NULL,
    position_id INT NOT NULL,
    during_time_years INT NOT NULL DEFAULT 0,
    importance_score NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_job_exp_job FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_exp_position FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE RESTRICT,
    CONSTRAINT chk_job_exp_score CHECK (importance_score >= 0.00 AND importance_score <= 100.00)
);

-- 3.9 Job Educations
CREATE TABLE IF NOT EXISTS job_educations (
    job_education_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_post_id INT NOT NULL,
    education_id INT NOT NULL,
    major VARCHAR(150),
    importance_score NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_job_edu_job FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_edu_education FOREIGN KEY (education_id) REFERENCES educations(education_id) ON DELETE RESTRICT,
    CONSTRAINT chk_job_edu_score CHECK (importance_score >= 0.00 AND importance_score <= 100.00)
);

-- 3.10 Job Certificates
CREATE TABLE IF NOT EXISTS job_certificates (
    job_certificate_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_post_id INT NOT NULL,
    cert_id INT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_job_cert_job FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_cert_certificate FOREIGN KEY (cert_id) REFERENCES certificates(cert_id) ON DELETE RESTRICT
);

-- 3.11 Job Notifications
CREATE TABLE IF NOT EXISTS job_notifications (
    notification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id INT NOT NULL,
    job_post_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'JOB_MATCH',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    deadline TIMESTAMPTZ,
    CONSTRAINT fk_job_notifications_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_notifications_job FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE
);


-- =============================================================================
-- 4. Bảng phân tích cv, tìm kiếm và so khớp kết quả 
-- =============================================================================

-- 4.1 CV Analyses Table (Standardized position_id link to positions table)
CREATE TABLE IF NOT EXISTS cv_analyses (
    analysis_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    resume_id INT NOT NULL,
    position_id INT, -- Unified with positions catalog
    analysis_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'completed',
    overall_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT fk_cv_analyses_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE,
    CONSTRAINT fk_cv_analyses_position FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE SET NULL,
    CONSTRAINT chk_cv_analyses_score CHECK (overall_score >= 0.00 AND overall_score <= 100.00),
    CONSTRAINT chk_cv_analyses_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- 4.2 Matched Results Table
CREATE TABLE IF NOT EXISTS matched_results (
    match_result_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    analysis_id BIGINT NOT NULL,
    job_post_id INT NOT NULL,
    points NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_matched_results_analysis FOREIGN KEY (analysis_id) REFERENCES cv_analyses(analysis_id) ON DELETE CASCADE,
    CONSTRAINT fk_matched_results_job FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id) ON DELETE CASCADE,
    CONSTRAINT uq_matched_results_analysis_job UNIQUE (analysis_id, job_post_id),
    CONSTRAINT chk_matched_results_points CHECK (points >= 0.00 AND points <= 100.00)
);

-- 4.3 Search History Table
CREATE TABLE IF NOT EXISTS search_history (
    search_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id INT NOT NULL,
    query_text TEXT NOT NULL,
    filters_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_search_history_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

COMMIT;