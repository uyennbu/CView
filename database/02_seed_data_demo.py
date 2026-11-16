"""
Database Seed Data Generator for CView System
Generated based on DESIGN.md specifications for Demo scale.

Scale Target Summary:
  - accounts: 111
  - roles: 3
  - permissions: 20
  - account_roles: 111
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
from datetime import datetime, timedelta, timezone

# Cố định random seed để đảm bảo tính tái tạo dữ liệu
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

def gen_uuid():
    """Tạo UUIDv4 deterministic dựa trên random seed cố định"""
    return str(uuid.UUID(int=random.getrandbits(128), version=4))

# ---------------------------------------------------------
# DATETIME HELPERS (Đảm bảo tính logic thời gian)
# ---------------------------------------------------------
def parse_iso(iso_str: str) -> datetime:
    return datetime.strptime(iso_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)

def fmt_iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

def rand_dt(start_iso: str, end_iso: str) -> str:
    """Sinh ngẫu nhiên một timestamp ISO-8601 trong khoảng [start_iso, end_iso]"""
    start_dt = parse_iso(start_iso)
    end_dt = parse_iso(end_iso)
    if end_dt <= start_dt:
        return fmt_iso(start_dt)
    delta_seconds = int((end_dt - start_dt).total_seconds())
    random_second = random.randint(0, delta_seconds)
    return fmt_iso(start_dt + timedelta(seconds=random_second))

def add_rand_offset(base_iso: str, min_seconds: int = 60, max_seconds: int = 86400) -> str:
    """Cộng thêm một khoảng thời gian ngẫu nhiên vào mốc thời gian gốc"""
    base_dt = parse_iso(base_iso)
    offset = random.randint(min_seconds, max_seconds)
    return fmt_iso(base_dt + timedelta(seconds=offset))

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
    ("Jira / Confluence", "MANAGEMENT_LEADERSHIP"), ("Prompt Engineering", "HARD_SKILL"), ("LLM Fine-tuning", "HARD_SKILL"),
    ("Bash", "HARD_SKILL")
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

    # 1. Accounts (111 total: 1 Admin, 50 Candidates, 60 Recruiters)
    accounts = []
    admin_created = rand_dt("2026-01-01T00:00:00Z", "2026-01-02T12:00:00Z")
    accounts.append({
        "account_id": gen_uuid(),
        "username": "admin_system",
        "email": "admin@cview.vn",
        "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjO5E.8A8R3qO2bLq3G8hJ9v1K0mO2sCGe",
        "phone_number": "0901234567",
        "status": "ACTIVE",
        "last_login_at": rand_dt("2026-11-05T08:00:00Z", "2026-11-08T22:00:00Z"),
        "created_at": admin_created
    })
    
    for i in range(1, 51):
        cand_created = rand_dt("2026-01-15T00:00:00Z", "2026-02-28T23:59:59Z")
        accounts.append({
            "account_id": gen_uuid(),
            "username": f"candidate_{i:03d}",
            "email": f"candidate{i:03d}@gmail.com",
            "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjO5E.8A8R3qO2bLq3G8hJ9v1K0mO2sCGe",
            "phone_number": f"0912345{i:03d}",
            "status": "ACTIVE" if i <= 45 else ("PENDING" if i <= 48 else "SUSPENDED"),
            "last_login_at": rand_dt("2026-10-25T00:00:00Z", "2026-11-08T23:59:59Z"),
            "created_at": cand_created
        })

    for i in range(1, 61):
        rec_created = rand_dt("2026-01-10T00:00:00Z", "2026-02-20T23:59:59Z")
        accounts.append({
            "account_id": gen_uuid(),
            "username": f"recruiter_{i:03d}",
            "email": f"hr{i:03d}@company.com",
            "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjO5E.8A8R3qO2bLq3G8hJ9v1K0mO2sCGe",
            "phone_number": f"0987654{i:03d}",
            "status": "ACTIVE",
            "last_login_at": rand_dt("2026-10-25T00:00:00Z", "2026-11-08T23:59:59Z"),
            "created_at": rec_created
        })
    data["accounts"] = accounts

    # 2. Roles (Random nhẹ trong ngày khởi tạo hệ thống 01/01/2026)
    roles = [
        {"role_id": 1, "role_name": "ADMIN", "description": "Quản trị viên tối cao của hệ thống", "created_at": rand_dt("2026-01-01T00:00:00Z", "2026-01-01T02:00:00Z")},
        {"role_id": 2, "role_name": "RECRUITER", "description": "Nhà tuyển dụng doanh nghiệp", "created_at": rand_dt("2026-01-01T00:00:00Z", "2026-01-01T02:00:00Z")},
        {"role_id": 3, "role_name": "CANDIDATE", "description": "Ứng viên tìm kiếm việc làm", "created_at": rand_dt("2026-01-01T00:00:00Z", "2026-01-01T02:00:00Z")}
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
            "created_at": rand_dt("2026-01-01T00:05:00Z", "2026-01-01T04:00:00Z")
        })
    data["permissions"] = permissions

    # 4. Account Roles (111 mappings - Gán ngay sau khi account được tạo 1s - 10s)
    account_roles = []
    account_roles.append({
        "account_id": accounts[0]["account_id"],
        "role_id": 1,
        "created_at": add_rand_offset(accounts[0]["created_at"], 1, 10)
    })
    for i in range(1, 51):
        account_roles.append({
            "account_id": accounts[i]["account_id"],
            "role_id": 3,
            "created_at": add_rand_offset(accounts[i]["created_at"], 1, 10)
        })
    for i in range(51, 111):
        account_roles.append({
            "account_id": accounts[i]["account_id"],
            "role_id": 2,
            "created_at": add_rand_offset(accounts[i]["created_at"], 1, 10)
        })
    data["account_roles"] = account_roles

    # 5. Role Permissions (36 mappings)
    role_permissions = []
    for p_id in range(1, 21):
        role_permissions.append({
            "role_id": 1,
            "permission_id": p_id,
            "created_at": rand_dt("2026-01-01T04:05:00Z", "2026-01-01T06:00:00Z")
        })
    for p_id in [3, 6, 7, 8, 9, 10, 17, 18, 19]:
        role_permissions.append({
            "role_id": 2,
            "permission_id": p_id,
            "created_at": rand_dt("2026-01-01T04:05:00Z", "2026-01-01T06:00:00Z")
        })
    for p_id in [11, 12, 13, 14, 15, 16, 17]:
        role_permissions.append({
            "role_id": 3,
            "permission_id": p_id,
            "created_at": rand_dt("2026-01-01T04:05:00Z", "2026-01-01T06:00:00Z")
        })
    data["role_permissions"] = role_permissions

    # 6. Sessions (200 records - expires_at ngẫu nhiên từ 7 đến 30 ngày sau created_at)
    sessions = []
    for i in range(200):
        acc = random.choice(accounts)
        sess_created = rand_dt("2026-10-15T00:00:00Z", "2026-11-08T23:59:59Z")
        sess_expires = add_rand_offset(sess_created, 7 * 86400, 30 * 86400)
        sessions.append({
            "session_id": gen_uuid(),
            "account_id": acc["account_id"],
            "refresh_token_hash": f"hash_sha256_token_{i:04d}_{gen_uuid()[:8]}",
            "ip_address": f"113.160.{random.randint(1,254)}.{random.randint(1,254)}",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
            "is_revoked": random.choice([False, False, False, True]),
            "expires_at": sess_expires,
            "created_at": sess_created
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
            "created_at": rand_dt("2026-10-01T00:00:00Z", "2026-11-08T23:59:59Z")
        })
    data["auth_logs"] = auth_logs

    # 8. Activity Logs (2,000 records - Nằm trong khoảng thời gian hoạt động của session)
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
        act_created = add_rand_offset(sess["created_at"], 5, 7200)
        activity_logs.append({
            "activity_id": i,
            "sessions_id": sess["session_id"],
            "action_type": act,
            "target_entity": target,
            "target_id": gen_uuid(),
            "details": json.dumps({"info": f"Activity log detail for {act}", "timestamp": act_created[:10]}),
            "created_at": act_created
        })
    data["activity_logs"] = activity_logs

    # 9. System Error Logs (50 records - Random trong tháng 10 - đầu tháng 11)
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
            "created_at": rand_dt("2026-10-01T00:00:00Z", "2026-11-08T23:59:59Z")
        })
    data["system_error_logs"] = system_error_logs

    # 10. Addresses (50 records)
    addresses = []
    for i in range(50):
        addresses.append({
            "address_id": gen_uuid(),
            "street_address": STREETS[i % len(STREETS)],
            "ward": f"Phường {random.randint(1, 15)}",
            "city": CITIES[i % len(CITIES)],
            "country": "Việt Nam",
            "created_at": rand_dt("2026-01-05T00:00:00Z", "2026-01-25T23:59:59Z")
        })
    data["addresses"] = addresses

    # 11. Companies (20 records)
    companies = []
    for i in range(20):
        comp_created = add_rand_offset(addresses[i]["created_at"], 60, 86400 * 3)
        companies.append({
            "company_id": gen_uuid(),
            "name": COMPANY_NAMES[i],
            "address_id": addresses[i]["address_id"],
            "tax_code": f"010{random.randint(1000000, 9999999)}",
            "website": f"https://{COMPANY_NAMES[i].lower().replace(' ', '').replace('.', '')}.com.vn",
            "logo_url": f"https://s3.cloud.vn/cview/logos/company_{i+1:02d}.png",
            "industry": random.choice(["Công nghệ thông tin", "Tài chính - Ngân hàng", "Thương mại điện tử", "Viễn thông"]),
            "verification_status": "VERIFIED" if i < 18 else "PENDING",
            "created_at": comp_created
        })
    data["companies"] = companies

    # 12. Recruiter Profiles (60 records - Tạo sau khi account và company đã tồn tại)
    recruiter_profiles = []
    recruiter_accs = accounts[51:111]
    for i in range(60):
        acc = recruiter_accs[i % len(recruiter_accs)]
        comp = companies[i % 20]
        base_time = max(acc["created_at"], comp["created_at"])
        name = gen_name()
        recruiter_profiles.append({
            "recruiter_id": gen_uuid(),
            "account_id": acc["account_id"],
            "company_id": comp["company_id"],
            "full_name": name,
            "job_title": random.choice(["HR Manager", "Technical Recruiter", "Talent Acquisition Lead", "Head of HR"]),
            "work_email": gen_email(name, i+1),
            "phone_number": f"0934567{i:03d}",
            "created_at": add_rand_offset(base_time, 300, 86400 * 2)
        })
    data["recruiter_profiles"] = recruiter_profiles

    # 13. Candidate Profiles (50 records - Tạo sau khi candidate account được tạo)
    candidate_profiles = []
    candidate_accs = accounts[1:51]
    edu_levels = ["HIGH_SCHOOL", "ASSOCIATE", "BACHELOR", "BACHELOR", "BACHELOR", "MASTER", "DOCTORATE"]
    genders = ["MALE", "FEMALE", "OTHER"]
    for i in range(50):
        name = gen_name()
        acc = candidate_accs[i]
        addr = addresses[i % len(addresses)]
        base_time = max(acc["created_at"], addr["created_at"])
        candidate_profiles.append({
            "candidate_id": gen_uuid(),
            "account_id": acc["account_id"],
            "full_name": name,
            "date_of_birth": f"{random.randint(1990, 2004)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
            "gender": random.choice(genders),
            "address_id": addr["address_id"],
            "current_job_title": random.choice(["Backend Developer", "Data Scientist", "Frontend Engineer", "DevOps Engineer", "Fullstack Developer", "Sinh viên năm 4"]),
            "years_of_experience": round(random.uniform(0.5, 10.0), 1),
            "education_level": random.choice(edu_levels),
            "created_at": add_rand_offset(base_time, 120, 86400 * 3)
        })
    data["candidate_profiles"] = candidate_profiles

    # 14. Domains (20 records)
    domains = []
    for i, (d_name, d_desc) in enumerate(DOMAINS_LIST, 1):
        domains.append({
            "domain_id": i,
            "domain_name": d_name,
            "description": d_desc,
            "created_at": rand_dt("2026-01-01T06:00:00Z", "2026-01-03T18:00:00Z")
        })
    data["domains"] = domains

    # 15. Skills (100 records)
    skills = []
    for i, (s_name, s_cat) in enumerate(SKILLS_LIST, 1):
        skills.append({
            "skill_id": i,
            "skill_name": s_name,
            "category": s_cat,
            "description": f"Kỹ năng chuẩn hóa {s_name}",
            "created_at": rand_dt("2026-01-01T06:00:00Z", "2026-01-04T18:00:00Z")
        })
    data["skills"] = skills

    # 16. Certificates (30 records)
    certificates = []
    for i, (c_name, c_issuer, c_cat) in enumerate(CERTIFICATES_LIST, 1):
        certificates.append({
            "certificate_id": i,
            "certificate_name": c_name,
            "issuer": c_issuer,
            "score": round(random.uniform(7.0, 9.0), 1) if "IELTS" in c_name else None,
            "category": c_cat,
            "created_at": rand_dt("2026-01-01T06:00:00Z", "2026-01-04T18:00:00Z")
        })
    data["certificates"] = certificates

    # 17. Resumes (50 records - Tạo sau candidate_profiles)
    resumes = []
    for i in range(50):
        cand = candidate_profiles[i]
        resumes.append({
            "resume_id": gen_uuid(),
            "candidate_id": cand["candidate_id"],
            "title": f"CV {cand['current_job_title']} 2026",
            "file_name": f"cv_candidate_{i+1:02d}.pdf",
            "file_url": f"https://s3.cloud.vn/cview/resumes/cv_candidate_{i+1:02d}.pdf",
            "file_size_bytes": random.randint(250000, 2500000),
            "created_at": add_rand_offset(cand["created_at"], 600, 86400 * 10)
        })
    data["resumes"] = resumes

    # 18. Resume Skills (200 records - Parse ngay sau khi upload CV 10s - 120s)
    resume_skills = []
    levels = ["BEGINNER", "MEDIUM", "ADVANCED", "EXPERT"]
    for r in resumes:
        selected_skills = random.sample(skills, 4)
        for s in selected_skills:
            resume_skills.append({
                "resume_id": r["resume_id"],
                "skill_id": s["skill_id"],
                "years_experience": round(random.uniform(0.5, 6.0), 1),
                "proficiency_level": random.choice(levels),
                "confidence_score": round(random.uniform(0.85, 0.99), 3),
                "created_at": add_rand_offset(r["created_at"], 10, 120)
            })
    data["resume_skills"] = resume_skills

    # 19. Job Posts (50 records - Đăng sau khi recruiter_profiles được tạo; approved_at sau created_at; deadline ngẫu nhiên)
    job_posts = []
    job_types = ["FULL_TIME", "FULL_TIME", "FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "FREELANCE"]
    workplace_types = ["ON_SITE", "HYBRID", "REMOTE"]
    for i in range(50):
        rec = recruiter_profiles[i % len(recruiter_profiles)]
        jp_created = add_rand_offset(rec["created_at"], 3600, 86400 * 15)
        is_approved = i < 45
        jp_approved = add_rand_offset(jp_created, 600, 86400 * 3) if is_approved else None
        jp_deadline = add_rand_offset(jp_created, 86400 * 30, 86400 * 90)
        job_posts.append({
            "job_post_id": gen_uuid(),
            "recruiter_id": rec["recruiter_id"],
            "company_id": rec["company_id"],
            "position": random.choice(["Backend Developer", "Frontend Developer", "AI Engineer", "Data Engineer", "DevOps Engineer", "Fullstack Engineer"]),
            "title": f"Tuyển dụng {random.choice(['Senior', 'Middle', 'Junior'])} {random.choice(['Python Developer', 'React Engineer', 'AI/ML Specialist', 'DevOps Specialist'])}",
            "job_description": "Mô tả chi tiết công việc, chịu trách nhiệm phát triển và bảo trì các dịch vụ backend/frontend cao cấp...",
            "requirements": "Yêu cầu có tối thiểu 2 năm kinh nghiệm làm việc với ngôn ngữ và framework tương ứng...",
            "benefits": "Mức lương cạnh tranh, thưởng theo dự án, bảo hiểm sức khỏe cao cấp, môi trường năng động...",
            "job_type": random.choice(job_types),
            "workplace_type": random.choice(workplace_types),
            "address_id": addresses[i % len(addresses)]["address_id"],
            "salary_min": random.choice([15000000, 20000000, 25000000, 30000000]),
            "salary_max": random.choice([35000000, 45000000, 50000000, 60000000]),
            "is_salary_negotiable": False,
            "experience_years_min": round(random.choice([1.0, 2.0, 3.0, 5.0]), 1),
            "required_education": random.choice(["NONE", "BACHELOR", "BACHELOR", "MASTER"]),
            "approval_status": "APPROVED" if is_approved else "PENDING",
            "rejection_reason": None,
            "approved_by": accounts[0]["account_id"] if is_approved else None,
            "approved_at": jp_approved,
            "deadline": jp_deadline,
            "created_at": jp_created
        })
    data["job_posts"] = job_posts

    # 20. Job Skills (200 records - Tạo cùng lúc đăng tin tuyển dụng)
    job_skills = []
    for jp in job_posts:
        selected_skills = random.sample(skills, 4)
        for s in selected_skills:
            job_skills.append({
                "job_post_id": jp["job_post_id"],
                "skill_id": s["skill_id"],
                "requirement_type": random.choice(["MANDATORY", "MANDATORY", "PREFERRED"]),
                "min_years_experience": round(random.choice([1.0, 2.0, 3.0]), 1),
                "created_at": add_rand_offset(jp["created_at"], 0, 5)
            })
    data["job_skills"] = job_skills

    # 21. Job Certificates (50 records)
    job_certificates = []
    for jp in job_posts:
        cert = random.choice(certificates)
        job_certificates.append({
            "job_post_id": jp["job_post_id"],
            "certificate_id": cert["certificate_id"],
            "is_mandatory": random.choice([True, False]),
            "created_at": add_rand_offset(jp["created_at"], 0, 5)
        })
    data["job_certificates"] = job_certificates

    # 22. Job Domains (70 records)
    job_domains = []
    two_domain_job_ids = set(random.sample(range(len(job_posts)), 20))
    for i, jp in enumerate(job_posts):
        d_sample = random.sample(domains, 2 if i in two_domain_job_ids else 1)
        for d in d_sample:
            job_domains.append({
                "job_post_id": jp["job_post_id"],
                "domain_id": d["domain_id"],
                "created_at": add_rand_offset(jp["created_at"], 0, 5)
            })
    data["job_domains"] = job_domains

    # 23. CV Analyses (50 records - Phân tích CV sau khi resume được upload)
    cv_analyses = []
    for r in resumes:
        exec_ms = random.randint(1200, 3500)
        ca_created = add_rand_offset(r["created_at"], 300, 86400 * 14)
        cv_analyses.append({
            "analysis_id": gen_uuid(),
            "resume_id": r["resume_id"],
            "target_position_title": None,
            "target_city": random.choice(CITIES),
            "target_domain_id": random.choice(domains)["domain_id"],
            "target_job_type": "FULL_TIME",
            "target_workplace_type": "HYBRID",
            "target_min_salary": 20000000,
            "target_experience_years": 2.0,
            "target_job_level": "MIDDLE",
            "status": "COMPLETED",
            "total_jobs_scanned": 50,
            "matched_jobs_count": 20,
            "execution_time_ms": exec_ms,
            "created_at": ca_created
        })
    data["cv_analyses"] = cv_analyses

    # 24. Matched Results (1,000 records - Tạo ngay sau khi phiên phân tích CV hoàn tất 1s - 5s)
    matched_results = []
    match_counter = 1
    for ca in cv_analyses:
        sampled_jobs = random.sample(job_posts, 20)
        for jp in sampled_jobs:
            overall = round(random.uniform(50.0, 95.0), 2)
            matched_results.append({
                "match_id": match_counter,
                "analysis_id": ca["analysis_id"],
                "job_post_id": jp["job_post_id"],
                "overall_score": overall,
                "skill_score": round(overall + random.uniform(-5.0, 5.0), 2),
                "experience_score": round(overall + random.uniform(-5.0, 5.0), 2),
                "education_score": round(overall + random.uniform(-5.0, 5.0), 2),
                "missing_skills": json.dumps([{"skill_id": 10, "skill_name": "Docker"}]),
                "ai_feedback": "Ứng viên có nền tảng tốt về Python/FastAPI, cần bổ sung thêm kinh nghiệm thực chiến với Kubernetes.",
                "created_at": add_rand_offset(ca["created_at"], 1, 5)
            })
            match_counter += 1
    data["matched_results"] = matched_results

    # 25. Saved Jobs (100 records - Lưu sau khi cả candidate và job_post đều đã tồn tại)
    saved_jobs = []
    for cand in candidate_profiles:
        saved_sample = random.sample(job_posts, 2)
        for jp in saved_sample:
            base_time = max(cand["created_at"], jp["created_at"])
            saved_jobs.append({
                "candidate_id": cand["candidate_id"],
                "job_post_id": jp["job_post_id"],
                "notes": "Công việc tiềm năng, lương cao.",
                "created_at": add_rand_offset(base_time, 600, 86400 * 20)
            })
    data["saved_jobs"] = saved_jobs

    # 26. Job Applications (50 records - Ứng tuyển sau khi resume và job_post đều tồn tại)
    job_applications = []
    statuses = ["SUBMITTED", "VIEWED", "SHORTLISTED", "INTERVIEWING", "OFFERED", "REJECTED"]
    for i in range(50):
        base_time = max(resumes[i]["created_at"], job_posts[i]["created_at"])
        job_applications.append({
            "application_id": gen_uuid(),
            "job_post_id": job_posts[i]["job_post_id"],
            "candidate_id": candidate_profiles[i]["candidate_id"],
            "resume_id": resumes[i]["resume_id"],
            "status": random.choice(statuses),
            "recruiter_notes": "Ứng viên tiềm năng cho vòng phỏng vấn kỹ thuật.",
            "applied_at": add_rand_offset(base_time, 1800, 86400 * 25)
        })
    data["job_applications"] = job_applications

    # 27. Search History (200 records)
    search_history = []
    keywords = ["FastAPI", "Python AI", "React Frontend", "DevOps Cloud", "Data Analyst", "Backend Junior"]
    for i in range(1, 201):
        cand = random.choice(candidate_profiles)
        search_history.append({
            "search_id": i,
            "candidate_id": cand["candidate_id"],
            "keyword": random.choice(keywords),
            "domain_id": random.choice(domains)["domain_id"],
            "city": random.choice(CITIES),
            "min_salary": 15000000,
            "results_count": random.randint(5, 45),
            "created_at": add_rand_offset(cand["created_at"], 300, 86400 * 45)
        })
    data["search_history"] = search_history

    # 28. Job Notifications (200 records - read_at luôn nằm sau created_at)
    job_notifications = []
    for i in range(1, 201):
        cand = random.choice(candidate_profiles)
        jp = random.choice(job_posts)
        base_time = max(cand["created_at"], jp["created_at"])
        notif_created = add_rand_offset(base_time, 600, 86400 * 30)
        is_read = random.choice([True, False])
        notif_read = add_rand_offset(notif_created, 60, 86400 * 5) if is_read else None
        job_notifications.append({
            "notification_id": i,
            "candidate_id": cand["candidate_id"],
            "job_post_id": jp["job_post_id"],
            "title": f"Gợi ý việc làm: {jp['title']}",
            "content": f"Hệ thống phát hiện bài tuyển dụng {jp['title']} có độ tương đồng >80% với hồ sơ của bạn.",
            "is_read": is_read,
            "read_at": notif_read,
            "created_at": notif_created
        })
    data["job_notifications"] = job_notifications

    # 29. Other Notifications (100 records - read_at luôn nằm sau created_at)
    other_notifications = []
    n_types = ["JOB_APPROVAL_STATUS", "APPLICATION_UPDATE", "CV_PARSE_COMPLETED", "ACCOUNT_SECURITY"]
    for i in range(1, 101):
        acc = random.choice(accounts)
        notif_created = add_rand_offset(acc["created_at"], 600, 86400 * 45)
        is_read = random.choice([True, False])
        notif_read = add_rand_offset(notif_created, 60, 86400 * 5) if is_read else None
        other_notifications.append({
            "notification_id": i,
            "account_id": acc["account_id"],
            "notification_type": random.choice(n_types),
            "title": "Thông báo từ hệ thống CView",
            "message": "Chi tiết thông báo hệ thống liên quan đến tài khoản và hoạt động tuyển dụng.",
            "is_read": is_read,
            "read_at": notif_read,
            "created_at": notif_created
        })
    data["other_notifications"] = other_notifications

    return data

def export_to_sql_file(filename="database/02_seed_data.sql"):
    seed_data = generate_seed_data()
    table_order = [
        "accounts", "roles", "permissions", "account_roles", "role_permissions",
        "addresses", "companies", "recruiter_profiles", "candidate_profiles",
        "domains", "skills", "certificates", "resumes", "resume_skills",
        "job_posts", "job_skills", "job_certificates", "job_domains",
        "cv_analyses", "matched_results", "saved_jobs", "job_applications",
        "search_history", "job_notifications", "other_notifications",
        "sessions", "auth_logs", "activity_logs", "system_error_logs"
    ]

    with open(filename, "w", encoding="utf-8") as f:
        f.write("-- CView Database Seed Data Dump\n\n")
        for table in table_order:
            records = seed_data.get(table, [])
            if not records:
                continue
            for r in records:
                cols = ", ".join(r.keys())
                vals = []
                for v in r.values():
                    if v is None:
                        vals.append("NULL")
                    elif isinstance(v, bool):          # bool trước int (bool là subclass của int)
                        vals.append("TRUE" if v else "FALSE")
                    elif isinstance(v, (int, float)):
                        vals.append(str(v))
                    else:
                        escaped = str(v).replace("'", "''")
                        vals.append(f"'{escaped}'")
                vals_str = ", ".join(vals)
                f.write(f"INSERT INTO {table} ({cols}) VALUES ({vals_str});\n")
            f.write("\n")
    print(f"Đã xuất dữ liệu ra file thành công: {filename}")

if __name__ == "__main__":
    export_to_sql_file()