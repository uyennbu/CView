"""
Database Seed Data Generator for CView System
Generated based on DESIGN.md specifications for Demo scale.

Scale Target Summary:
  - accounts: 100
  - roles: 3
  - permissions: 20
  - account_roles: 100
  - role_permissions: 36
  - sessions: 200
  - auth_logs: 500
  - activity_logs: 2,000
  - system_error_logs: 50
  - addresses: 50
  - companies: 20
  - recruiter_profiles: 60
  - candidate_profiles: 50
  - domains: 20
  - skills: 100
  - certificates: 30
  - resumes: 50
  - resume_skills: 200
  - job_posts: 50
  - job_skills: 200
  - job_certificates: 50
  - job_domains: 70
  - cv_analyses: 50
  - matched_results: 1,000
  - saved_jobs: 100
  - job_applications: 50
  - search_history: 200
  - job_notifications: 200
  - other_notifications: 100
"""

import os
import uuid
import random
import json
from datetime import datetime

# Cố định random seed để đảm bảo tính tái tạo dữ liệu
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

def gen_uuid():
    """Tạo UUIDv4 deterministic dựa trên random seed cố định"""
    return str(uuid.UUID(int=random.getrandbits(128), version=4))

# ---------------------------------------------------------
# MASTER DATA LISTS
# ---------------------------------------------------------
DOMAINS_LIST = [
    ("Software Development & Engineering", "Phát triển phần mềm và kỹ thuật hệ thống"),
    ("Data Science & AI", "Khoa học dữ liệu, học máy và trí tuệ nhân tạo"),
    ("FinTech", "Công nghệ tài chính và giải pháp thanh toán số"),
    ("E-Commerce", "Thương mại điện tử và bán lẻ trực tuyến"),
    ("EdTech", "Công nghệ giáo dục và đào tạo trực tuyến"),
    ("Cybersecurity", "An ninh mạng và bảo mật thông tin"),
    ("Cloud Computing & DevOps", "Điện toán đám mây và hạ tầng DevOps"),
    ("HealthTech", "Công nghệ y tế và chăm sóc sức khỏe số"),
    ("Logistics & Supply Chain", "Chuỗi cung ứng, kho vận và vận tải"),
    ("Digital Marketing", "Marketing kỹ thuật số và tiếp thị trực tuyến"),
    ("Product Management", "Quản lý và phát triển sản phẩm công nghệ"),
    ("UI/UX Design", "Thiết kế giao diện và trải nghiệm người dùng"),
    ("Blockchain & Web3", "Công nghệ chuỗi khối và tài sản số"),
    ("Game Development", "Phát triển trò chơi điện tử và đồ họa 3D"),
    ("Embedded Systems & IoT", "Hệ thống nhúng và internet kết nối vạn vật"),
    ("Business Intelligence", "Phân tích dữ liệu kinh doanh và báo cáo chiến lược"),
    ("Quality Assurance & Testing", "Kiểm thử chất lượng phần mềm"),
    ("Telecom & Networking", "Viễn thông và hạ tầng mạng"),
    ("HR Tech", "Công nghệ quản trị nhân sự và tuyển dụng"),
    ("Real Estate Tech (PropTech)", "Công nghệ bất động sản và tài sản số")
]

SKILLS_LIST = [
    ("Python", "HARD_SKILL"), ("Java", "HARD_SKILL"), ("C++", "HARD_SKILL"), ("C#", "HARD_SKILL"),
    ("JavaScript", "HARD_SKILL"), ("TypeScript", "HARD_SKILL"), ("Go", "HARD_SKILL"), ("Rust", "HARD_SKILL"),
    ("PHP", "HARD_SKILL"), ("Ruby", "HARD_SKILL"), ("Swift", "HARD_SKILL"), ("Kotlin", "HARD_SKILL"),
    ("React", "HARD_SKILL"), ("Vue.js", "HARD_SKILL"), ("Angular", "HARD_SKILL"), ("Next.js", "HARD_SKILL"),
    ("Node.js", "HARD_SKILL"), ("FastAPI", "HARD_SKILL"), ("Django", "HARD_SKILL"), ("Spring Boot", "HARD_SKILL"),
    (".NET Core", "HARD_SKILL"), ("Express.js", "HARD_SKILL"), ("Laravel", "HARD_SKILL"), ("NestJS", "HARD_SKILL"),
    ("PostgreSQL", "HARD_SKILL"), ("MySQL", "HARD_SKILL"), ("MongoDB", "HARD_SKILL"), ("Redis", "HARD_SKILL"),
    ("Elasticsearch", "HARD_SKILL"), ("Oracle DB", "HARD_SKILL"), ("Cassandra", "HARD_SKILL"), ("Neo4j", "HARD_SKILL"),
    ("Docker", "HARD_SKILL"), ("Kubernetes", "HARD_SKILL"), ("AWS", "HARD_SKILL"), ("Azure", "HARD_SKILL"),
    ("GCP", "HARD_SKILL"), ("Terraform", "HARD_SKILL"), ("CI/CD (GitLab/GitHub Actions)", "HARD_SKILL"), ("Ansible", "HARD_SKILL"),
    ("PyTorch", "HARD_SKILL"), ("TensorFlow", "HARD_SKILL"), ("Scikit-Learn", "HARD_SKILL"), ("OpenCV", "HARD_SKILL"),
    ("Pandas", "HARD_SKILL"), ("NumPy", "HARD_SKILL"), ("NLP (BERT/LLMs)", "HARD_SKILL"), ("Apache Spark", "HARD_SKILL"),
    ("Hadoop", "HARD_SKILL"), ("Kafka", "HARD_SKILL"), ("Airflow", "HARD_SKILL"), ("Power BI", "HARD_SKILL"),
    ("Tableau", "HARD_SKILL"), ("GraphQL", "HARD_SKILL"), ("RESTful API", "HARD_SKILL"), ("gRPC", "HARD_SKILL"),
    ("Git", "HARD_SKILL"), ("Linux Shell Scripting", "HARD_SKILL"), ("RabbitMQ", "HARD_SKILL"), ("Flutter", "HARD_SKILL"),
    ("React Native", "HARD_SKILL"), ("iOS Development", "HARD_SKILL"), ("Android Development", "HARD_SKILL"),
    ("Microservices Architecture", "HARD_SKILL"), ("System Design", "HARD_SKILL"), ("Object-Oriented Programming", "HARD_SKILL"),
    ("Data Structures & Algorithms", "HARD_SKILL"), ("Unit Testing (PyTest/JUnit)", "HARD_SKILL"), ("Selenium / Cypress", "HARD_SKILL"),
    ("Cybersecurity Basics", "HARD_SKILL"), ("Penetration Testing", "HARD_SKILL"),
    ("Giao tiếp hiệu quả", "SOFT_SKILL"), ("Làm việc nhóm", "SOFT_SKILL"), ("Giải quyết vấn đề", "SOFT_SKILL"),
    ("Tư duy phản biện", "SOFT_SKILL"), ("Quản lý thời gian", "SOFT_SKILL"), ("Khả năng thích ứng", "SOFT_SKILL"),
    ("Thuyết trình & Đàm phán", "SOFT_SKILL"), ("Tự học & Nghiên cứu", "SOFT_SKILL"),
    ("Agile / Scrum Methodologies", "MANAGEMENT_LEADERSHIP"), ("Quản lý dự án", "MANAGEMENT_LEADERSHIP"),
    ("Lãnh đạo nhóm", "MANAGEMENT_LEADERSHIP"), ("Quản lý rủi ro", "MANAGEMENT_LEADERSHIP"),
    ("Lập kế hoạch chiến lược", "MANAGEMENT_LEADERSHIP"), ("Đánh giá hiệu suất (KPI/OKR)", "MANAGEMENT_LEADERSHIP"),
    ("Tối ưu hóa quy trình", "MANAGEMENT_LEADERSHIP"), ("Tuyển dụng & Đào tạo", "MANAGEMENT_LEADERSHIP"),
    ("Tiếng Anh giao tiếp", "LANGUAGE"), ("Tiếng Anh chuyên ngành IT", "LANGUAGE"), ("Tiếng Nhật (N3+)", "LANGUAGE"),
    ("Tiếng Hàn (TOPIK 4+)", "LANGUAGE"), ("Tiếng Trung giao tiếp", "LANGUAGE"), ("Technical Writing", "OTHER"),
    ("Design Patterns", "HARD_SKILL"), ("SEO Technical", "OTHER"), ("Figma / UI/UX Prototyping", "HARD_SKILL"),
    ("Jira / Confluence", "MANAGEMENT_LEADERSHIP"), ("Prompt Engineering", "HARD_SKILL"), ("LLM Fine-tuning", "HARD_SKILL")
]

CERTIFICATES_LIST = [
    ("AWS Certified Solutions Architect - Associate", "Amazon Web Services", "TECH_DATA"),
    ("AWS Certified Developer - Associate", "Amazon Web Services", "TECH_DATA"),
    ("AWS Certified DevOps Engineer - Professional", "Amazon Web Services", "TECH_DATA"),
    ("Google Associate Cloud Engineer", "Google Cloud", "TECH_DATA"),
    ("Certified Kubernetes Administrator (CKA)", "Cloud Native Computing Foundation", "TECH_DATA"),
    ("Microsoft Certified: Azure Fundamentals", "Microsoft", "TECH_DATA"),
    ("Oracle Certified Professional: Java SE Developer", "Oracle", "TECH_DATA"),
    ("TensorFlow Developer Certificate", "Google", "TECH_DATA"),
    ("Cisco Certified Network Associate (CCNA)", "Cisco", "TECH_DATA"),
    ("Certified Information Systems Security Professional (CISSP)", "(ISC)²", "TECH_DATA"),
    ("CompTIA Security+", "CompTIA", "TECH_DATA"),
    ("Offensive Security Certified Professional (OSCP)", "Offensive Security", "TECH_DATA"),
    ("Project Management Professional (PMP)", "Project Management Institute", "MANAGEMENT_AGILE"),
    ("Certified ScrumMaster (CSM)", "Scrum Alliance", "MANAGEMENT_AGILE"),
    ("PMI Agile Certified Practitioner (PMI-ACP)", "Project Management Institute", "MANAGEMENT_AGILE"),
    ("Professional Scrum Master I (PSM I)", "Scrum.org", "MANAGEMENT_AGILE"),
    ("IELTS Academic (7.0+)", "IDP / British Council", "LANGUAGE"),
    ("TOEIC Listening & Reading (800+)", "ETS", "LANGUAGE"),
    ("Japanese Language Proficiency Test (JLPT N2)", "Japan Foundation", "LANGUAGE"),
    ("JLPT N1", "Japan Foundation", "LANGUAGE"),
    ("TOEFL iBT (90+)", "ETS", "LANGUAGE"),
    ("Certified Public Accountant (CPA)", "Ministry of Finance", "FINANCE_ACCOUNTING"),
    ("Chartered Financial Analyst (CFA Level 1)", "CFA Institute", "FINANCE_ACCOUNTING"),
    ("Google Digital Marketing & E-commerce Certificate", "Google", "BUSINESS_MARKETING"),
    ("HubSpot Content Marketing Certification", "HubSpot", "BUSINESS_MARKETING"),
    ("Google UX Design Professional Certificate", "Google", "DESIGN_CREATIVE"),
    ("Certified Information Systems Auditor (CISA)", "ISACA", "TECH_DATA"),
    ("ITIL 4 Foundation", "AXELOS", "MANAGEMENT_AGILE"),
    ("TOGAF Enterprise Architecture Certified", "The Open Group", "TECH_DATA"),
    ("Six Sigma Green Belt", "IASSC", "QUALITY_SAFETY")
]

CITIES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"]

STREETS = [
    "123 Đường Duy Tân, Quận Cầu Giấy", "456 Đường Nguyễn Huệ, Quận 1", "789 Đường Nguyễn Văn Linh, Quận Thanh Khê",
    "12 Đường Lê Đại Hành, Quận Hai Bà Trưng", "34 Đường Tôn Đức Thắng, Quận 1", "56 Đường Phạm Hùng, Quận Nam Từ Liêm",
    "78 Đường Cách Mạng Tháng 8, Quận 3", "90 Đường Võ Văn Kiệt, Quận Sơn Trà", "11 Đường Hoàng Quốc Việt, Quận Cầu Giấy",
    "22 Đường Nguyễn Trãi, Quận Thanh Xuân", "33 Đường Lê Lợi, Quận 1", "44 Đường Trần Phú, Quận Hải Châu",
    "55 Đường Cộng Hòa, Quận Tân Bình", "66 Đường Điện Biên Phủ, Quận Bình Thạnh", "77 Đường Nguyễn Văn Cừ, Quận Long Biên",
    "88 Đường Hàng Bông, Quận Hoàn Kiếm", "99 Đường Láng, Quận Đống Đa", "101 Đường Kim Mã, Quận Ba Đình",
    "102 Đường Bến Vân Đồn, Quận 4", "103 Đường Ba Tháng Hai, Quận 10"
]

COMPANY_NAMES = [
    "FPT Software", "Viettel Group", "VNPT Technology", "VNG Corporation", "MISA Joint Stock Company",
    "One Mount Group", "Techcombank Digital", "MB Bank Tech Center", "VPBank Digital Banking", "Shopee Vietnam",
    "Tiki Corporation", "Sendo Vietnam", "Chotot Tech", "KMS Technology", "Raksul Vietnam",
    "NashTech Vietnam", "Sun* Inc. Vietnam", "Framgia Technology", "Got It Vietnam", "Base.vn Technology"
]

FIRST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"]
MIDDLE_NAMES = ["Văn", "Thị", "Đức", "Minh", "Hồng", "Thành", "Quang", "Phương", "Anh", "Thái", "Hoài", "Gia", "Bảo"]
LAST_NAMES = ["An", "Bình", "Cường", "Dũng", "Em", "Phúc", "Giang", "Hùng", "Hải", "Khánh", "Lâm", "Nam", "Oanh", "Phong", "Quân", "Sơn", "Trang", "Tùng", "Vinh", "Yến"]

def gen_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(MIDDLE_NAMES)} {random.choice(LAST_NAMES)}"

def gen_email(name, index):
    clean_name = name.lower().replace(" ", "")
    return f"{clean_name}{index}@example.com"

# ---------------------------------------------------------
# GENERATOR FUNCTION
# ---------------------------------------------------------
def generate_seed_data():
    data = {}

    # 1. Accounts (100 total: 1 Admin, 50 Candidates, 49 Recruiters)
    accounts = []
    accounts.append({
        "account_id": gen_uuid(),
        "username": "admin_system",
        "email": "admin@cview.vn",
        "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjO5E.8A8R3qO2bLq3G8hJ9v1K0mO2sCGe",
        "phone_number": "0901234567",
        "status": "ACTIVE",
        "last_login_at": "2026-11-08T10:00:00Z",
        "created_at": "2026-01-01T00:00:00Z"
    })
    
    for i in range(1, 51):
        accounts.append({
            "account_id": gen_uuid(),
            "username": f"candidate_{i:03d}",
            "email": f"candidate{i:03d}@gmail.com",
            "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjO5E.8A8R3qO2bLq3G8hJ9v1K0mO2sCGe",
            "phone_number": f"0912345{i:03d}",
            "status": "ACTIVE" if i <= 45 else ("PENDING" if i <= 48 else "SUSPENDED"),
            "last_login_at": f"2026-11-0{random.randint(1,7)}T{random.randint(8,20):02d}:00:00Z",
            "created_at": "2026-02-15T08:30:00Z"
        })

    for i in range(1, 50):
        accounts.append({
            "account_id": gen_uuid(),
            "username": f"recruiter_{i:03d}",
            "email": f"hr{i:03d}@company.com",
            "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjO5E.8A8R3qO2bLq3G8hJ9v1K0mO2sCGe",
            "phone_number": f"0987654{i:03d}",
            "status": "ACTIVE",
            "last_login_at": f"2026-11-0{random.randint(1,7)}T{random.randint(8,20):02d}:00:00Z",
            "created_at": "2026-02-01T09:00:00Z"
        })
    data["accounts"] = accounts

    # 2. Roles
    roles = [
        {"role_id": 1, "role_name": "ADMIN", "description": "Quản trị viên tối cao của hệ thống", "created_at": "2026-01-01T00:00:00Z"},
        {"role_id": 2, "role_name": "RECRUITER", "description": "Nhà tuyển dụng doanh nghiệp", "created_at": "2026-01-01T00:00:00Z"},
        {"role_id": 3, "role_name": "CANDIDATE", "description": "Ứng viên tìm kiếm việc làm", "created_at": "2026-01-01T00:00:00Z"}
    ]
    data["roles"] = roles

    # 3. Permissions (20 permissions)
    permission_names = [
        "VIEW_SYSTEM_LOGS", "MANAGE_USERS", "APPROVE_JOB_POST", "REJECT_JOB_POST", "VERIFY_COMPANY",
        "CREATE_JOB_POST", "UPDATE_JOB_POST", "DELETE_JOB_POST", "VIEW_JOB_APPLICATIONS", "UPDATE_APPLICATION_STATUS",
        "UPLOAD_RESUME", "DELETE_RESUME", "ANALYZE_CV", "APPLY_JOB", "SAVE_JOB",
        "SEARCH_JOB", "VIEW_MATCHED_RESULTS", "MANAGE_COMPANY_PROFILE", "EXPORT_REPORTS", "MANAGE_PERMISSIONS"
    ]
    permissions = []
    for idx, p_name in enumerate(permission_names, 1):
        permissions.append({
            "permission_id": idx,
            "permission_name": p_name,
            "description": f"Quyền hạn {p_name} trong hệ thống",
            "created_at": "2026-01-01T00:00:00Z"
        })
    data["permissions"] = permissions

    # 4. Account Roles (100 mappings)
    account_roles = []
    account_roles.append({"account_id": accounts[0]["account_id"], "role_id": 1, "created_at": "2026-01-01T00:00:00Z"})
    for i in range(1, 51):
        account_roles.append({"account_id": accounts[i]["account_id"], "role_id": 3, "created_at": "2026-02-15T08:30:00Z"})
    for i in range(51, 100):
        account_roles.append({"account_id": accounts[i]["account_id"], "role_id": 2, "created_at": "2026-02-01T09:00:00Z"})
    data["account_roles"] = account_roles

    # 5. Role Permissions (36 mappings)
    role_permissions = []
    for p_id in range(1, 21):
        role_permissions.append({"role_id": 1, "permission_id": p_id, "created_at": "2026-01-01T00:00:00Z"})
    for p_id in [3, 6, 7, 8, 9, 10, 17, 18, 19]:
        role_permissions.append({"role_id": 2, "permission_id": p_id, "created_at": "2026-01-01T00:00:00Z"})
    for p_id in [11, 12, 13, 14, 15, 16, 17]:
        role_permissions.append({"role_id": 3, "permission_id": p_id, "created_at": "2026-01-01T00:00:00Z"})
    data["role_permissions"] = role_permissions

    # 6. Sessions (200 records)
    sessions = []
    for i in range(200):
        acc = random.choice(accounts)
        sessions.append({
            "session_id": gen_uuid(),
            "account_id": acc["account_id"],
            "refresh_token_hash": f"hash_sha256_token_{i:04d}_{gen_uuid()[:8]}",
            "ip_address": f"113.160.{random.randint(1,254)}.{random.randint(1,254)}",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
            "is_revoked": random.choice([False, False, False, True]),
            "expires_at": "2026-11-15T10:00:00Z",
            "created_at": f"2026-11-0{random.randint(1,8)}T{random.randint(0,23):02d}:{random.randint(0,59):02d}:00Z"
        })
    data["sessions"] = sessions

    # 7. Auth Logs (500 records)
    auth_logs = []
    event_types = ["LOGIN_SUCCESS", "LOGIN_SUCCESS", "LOGIN_SUCCESS", "LOGIN_FAILED", "LOGOUT", "PASSWORD_CHANGE", "TOKEN_REFRESH"]
    for i in range(1, 501):
        acc = random.choice(accounts)
        e_type = random.choice(event_types)
        auth_logs.append({
            "log_id": i,
            "account_id": acc["account_id"],
            "event_type": e_type,
            "ip_address": f"113.160.{random.randint(1,254)}.{random.randint(1,254)}",
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "failure_reason": "INVALID_CREDENTIALS" if e_type == "LOGIN_FAILED" else None,
            "created_at": f"2026-10-{random.randint(1,31):02d}T{random.randint(0,23):02d}:{random.randint(0,59):02d}:00Z"
        })
    data["auth_logs"] = auth_logs

    # 8. Activity Logs (2,000 records)
    activity_logs = []
    action_targets = [
        ("UPLOAD_RESUME", "RESUME"),
        ("ANALYZE_CV", "CV_ANALYSIS"),
        ("VIEW_JOB", "JOB_POST"),
        ("SEARCH_JOB", "JOB_POST"),
        ("SAVE_JOB", "JOB_POST"),
        ("APPLY_JOB", "APPLICATION"),
        ("CREATE_JOB_POST", "JOB_POST"),
        ("APPROVE_JOB_POST", "JOB_POST")
    ]
    for i in range(1, 2001):
        sess = random.choice(sessions)
        act, target = random.choice(action_targets)
        activity_logs.append({
            "activity_id": i,
            "sessions_id": sess["session_id"],
            "action_type": act,
            "target_entity": target,
            "target_id": gen_uuid(),
            "details": json.dumps({"info": f"Activity log detail for {act}", "timestamp": "2026-11-05"}),
            "created_at": f"2026-10-{random.randint(1,30):02d}T{random.randint(0,23):02d}:{random.randint(0,59):02d}:00Z"
        })
    data["activity_logs"] = activity_logs

    # 9. System Error Logs (50 records)
    system_error_logs = []
    services = ["api-gateway", "ai-matching-engine", "pdf-parser", "auth-service"]
    severities = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    for i in range(1, 51):
        system_error_logs.append({
            "error_id": i,
            "service_name": random.choice(services),
            "severity": random.choice(severities),
            "error_code": f"ERR_{random.choice(['DB_DEADLOCK', 'PDF_PARSE_TIMEOUT', 'AUTH_TOKEN_EXPIRED', 'AI_SERVICE_UNAVAILABLE'])}",
            "message": f"Sample error log message number {i}",
            "stack_trace": "Traceback (most recent call last):\n  File \"app.py\", line 42, in process\n    raise TimeoutError()",
            "created_at": "2026-11-01T12:00:00Z"
        })
    data["system_error_logs"] = system_error_logs

    