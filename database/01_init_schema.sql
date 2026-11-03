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