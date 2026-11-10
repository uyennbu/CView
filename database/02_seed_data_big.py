"""
Large-Scale Benchmark Seed Data Generator for CView System
Generated based on DESIGN.md specifications for Performance & Scale Evaluation.

Scale Target:
  - accounts: 15,000
  - addresses: 15,000
  - candidate_profiles: 10,000
  - recruiter_profiles: 5,000
  - companies: 1,000
  - resumes: 10,000
  - resume_skills: 40,000
  - job_posts: 10,000
  - job_skills: 40,000
  - search_history: 30,000
  - job_notifications: 30,000
  - job_applications: 15,000
  - sessions: 20,000
  - cv_analyses: 10,000
  - activity_logs: 100,000 (Super-large partitioned table benchmark)
  - matched_results: 200,000 (Super-large matching result matrix)
"""

import os
import uuid
import random
import json

# Cố định Seed cho tính nhất quán & tái tạo dữ liệu
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

def gen_uuid():
    return str(uuid.UUID(int=random.getrandbits(128), version=4))

# Master data mẫu
DOMAINS_LIST = [
    ("Software Development & Engineering", "Phát triển phần mềm"),
    ("Data Science & AI", "Khoa học dữ liệu & AI"),
    ("FinTech", "Công nghệ tài chính"),
    ("E-Commerce", "Thương mại điện tử"),
    ("EdTech", "Công nghệ giáo dục"),
    ("Cybersecurity", "An ninh mạng"),
    ("Cloud Computing & DevOps", "Điện toán đám mây & DevOps"),
    ("HealthTech", "Công nghệ y tế"),
    ("Logistics & Supply Chain", "Chuỗi cung ứng"),
    ("Digital Marketing", "Marketing kỹ thuật số")
]

SKILLS_LIST = [
    ("Python", "HARD_SKILL"), ("Java", "HARD_SKILL"), ("C++", "HARD_SKILL"), ("C#", "HARD_SKILL"),
    ("JavaScript", "HARD_SKILL"), ("TypeScript", "HARD_SKILL"), ("Go", "HARD_SKILL"), ("Rust", "HARD_SKILL"),
    ("React", "HARD_SKILL"), ("Vue.js", "HARD_SKILL"), ("Angular", "HARD_SKILL"), ("Node.js", "HARD_SKILL"),
    ("FastAPI", "HARD_SKILL"), ("Django", "HARD_SKILL"), ("Spring Boot", "HARD_SKILL"), ("PostgreSQL", "HARD_SKILL"),
    ("MySQL", "HARD_SKILL"), ("MongoDB", "HARD_SKILL"), ("Redis", "HARD_SKILL"), ("Docker", "HARD_SKILL"),
    ("Kubernetes", "HARD_SKILL"), ("AWS", "HARD_SKILL"), ("PyTorch", "HARD_SKILL"), ("TensorFlow", "HARD_SKILL"),
    ("Giao tiếp hiệu quả", "SOFT_SKILL"), ("Làm việc nhóm", "SOFT_SKILL"), ("Giải quyết vấn đề", "SOFT_SKILL"),
    ("Agile / Scrum", "MANAGEMENT_LEADERSHIP"), ("Quản lý dự án", "MANAGEMENT_LEADERSHIP"), ("Tiếng Anh IT", "LANGUAGE")
]

CITIES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"]
FIRST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Vũ", "Đặng", "Bùi", "Đỗ"]
MIDDLE_NAMES = ["Văn", "Thị", "Đức", "Minh", "Hồng", "Thành", "Quang", "Phương"]
LAST_NAMES = ["An", "Bình", "Cường", "Dũng", "Phúc", "Giang", "Hùng", "Hải", "Khánh", "Nam"]

def gen_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(MIDDLE_NAMES)} {random.choice(LAST_NAMES)}"

def generate_large_scale_data():
    print("Đang khởi tạo Bộ dữ liệu Lớn (Benchmark Scale)...")
    data = {}

    # 1. Accounts (15,000 bản ghi)
    print("-> Sinh 15.000 bản ghi accounts...")
    accounts = []
    # 1 Admin account
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
    # 10,000 Candidate accounts
    for i in range(1, 10001):
        accounts.append({
            "account_id": gen_uuid(),
            "username": f"candidate_{i:05d}",
            "email": f"candidate_{i:05d}@cview.vn",
            "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjO5E.8A8R3qO2bLq3G8hJ9v1K0mO2sCGe",
            "phone_number": f"091{i:07d}",
            "status": "ACTIVE" if i <= 9500 else "SUSPENDED",
            "last_login_at": f"2026-11-0{random.randint(1,7)}T10:00:00Z",
            "created_at": "2026-02-01T00:00:00Z"
        })
    # 4,999 Recruiter accounts
    for i in range(1, 5000):
        accounts.append({
            "account_id": gen_uuid(),
            "username": f"recruiter_{i:05d}",
            "email": f"recruiter_{i:05d}@company.com",
            "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjO5E.8A8R3qO2bLq3G8hJ9v1K0mO2sCGe",
            "phone_number": f"098{i:07d}",
            "status": "ACTIVE",
            "last_login_at": f"2026-11-0{random.randint(1,7)}T10:00:00Z",
            "created_at": "2026-02-01T00:00:00Z"
        })
    data["accounts"] = accounts

    # 2. Addresses (15,000 bản ghi)
    print("-> Sinh 15.000 bản ghi addresses...")
    addresses = []
    for i in range(1, 15001):
        addresses.append({
            "address_id": gen_uuid(),
            "street_address": f"{random.randint(1, 999)} Đường Lê Lợi",
            "ward": f"Phường {random.randint(1, 20)}",
            "city": CITIES[i % len(CITIES)],
            "country": "Việt Nam",
            "created_at": "2026-01-15T00:00:00Z"
        })
    data["addresses"] = addresses

    # 3. Companies (1,000) & Recruiter Profiles (5,000 bản ghi)
    print("-> Sinh 1.000 công ty và 5.000 recruiter_profiles...")
    companies = []
    for i in range(1, 1001):
        companies.append({
            "company_id": gen_uuid(),
            "name": f"Enterprise Company {i:04d} Ltd",
            "address_id": addresses[i - 1]["address_id"],
            "tax_code": f"010{i:07d}",
            "website": f"https://company{i:04d}.com.vn",
            "logo_url": f"https://s3.cloud.vn/cview/logos/company_{i:04d}.png",
            "industry": "Công nghệ thông tin",
            "verification_status": "VERIFIED",
            "created_at": "2026-01-20T00:00:00Z"
        })
    data["companies"] = companies

    recruiter_profiles = []
    recruiter_accs = accounts[10001:15000]
    for i in range(5000):
        acc = recruiter_accs[i % len(recruiter_accs)]
        comp = companies[i % 1000]
        recruiter_profiles.append({
            "recruiter_id": gen_uuid(),
            "account_id": acc["account_id"],
            "company_id": comp["company_id"],
            "full_name": gen_name(),
            "job_title": "HR Manager",
            "work_email": f"hr_{i+1:05d}@company{i%1000+1:04d}.com.vn",
            "phone_number": f"093{i:07d}",
            "created_at": "2026-02-01T00:00:00Z"
        })
    data["recruiter_profiles"] = recruiter_profiles

    # 4. Candidate Profiles (10,000 bản ghi)
    print("-> Sinh 10.000 bản ghi candidate_profiles...")
    candidate_profiles = []
    candidate_accs = accounts[1:10001]
    for i in range(10000):
        candidate_profiles.append({
            "candidate_id": gen_uuid(),
            "account_id": candidate_accs[i]["account_id"],
            "full_name": gen_name(),
            "date_of_birth": f"{random.randint(1992, 2003)}-05-15",
            "gender": random.choice(["MALE", "FEMALE"]),
            "address_id": addresses[i]["address_id"],
            "current_job_title": random.choice(["Software Engineer", "Data Analyst", "DevOps Engineer", "Frontend Developer"]),
            "years_of_experience": round(random.uniform(1.0, 8.0), 1),
            "education_level": "BACHELOR",
            "created_at": "2026-02-15T00:00:00Z"
        })
    data["candidate_profiles"] = candidate_profiles

    # 5. Domains & Skills Master Tables
    domains = [{"domain_id": i, "domain_name": d[0], "description": d[1], "created_at": "2026-01-01T00:00:00Z"} for i, d in enumerate(DOMAINS_LIST, 1)]
    skills = [{"skill_id": i, "skill_name": s[0], "category": s[1], "description": f"Skill {s[0]}", "created_at": "2026-01-01T00:00:00Z"} for i, s in enumerate(SKILLS_LIST, 1)]
    data["domains"] = domains
    data["skills"] = skills

    # 6. Resumes (10,000) & Resume Skills (40,000 bản ghi)
    print("-> Sinh 10.000 resumes & 40.000 resume_skills...")
    resumes = []
    for i in range(10000):
        resumes.append({
            "resume_id": gen_uuid(),
            "candidate_id": candidate_profiles[i]["candidate_id"],
            "title": f"CV {candidate_profiles[i]['current_job_title']} 2026",
            "file_name": f"cv_candidate_{i+1:05d}.pdf",
            "file_url": f"https://s3.cloud.vn/cview/resumes/cv_{i+1:05d}.pdf",
            "file_size_bytes": 1024000,
            "created_at": "2026-03-01T00:00:00Z"
        })
    data["resumes"] = resumes

    resume_skills = []
    for r in resumes:
        s_sample = random.sample(skills, 4)
        for s in s_sample:
            resume_skills.append({
                "resume_id": r["resume_id"],
                "skill_id": s["skill_id"],
                "years_experience": round(random.uniform(1.0, 5.0), 1),
                "proficiency_level": "ADVANCED",
                "confidence_score": 0.95,
                "created_at": "2026-03-01T00:00:00Z"
            })
    data["resume_skills"] = resume_skills

    # 7. Job Posts (10,000), Job Skills (40,000) & Job Applications (15,000 bản ghi)
    print("-> Sinh 10.000 job_posts & 40.000 job_skills...")
    job_posts = []
    for i in range(10000):
        rec = recruiter_profiles[i % 5000]
        job_posts.append({
            "job_post_id": gen_uuid(),
            "recruiter_id": rec["recruiter_id"],
            "company_id": rec["company_id"],
            "position": "Backend Developer",
            "title": f"Tuyển dụng Senior Software Engineer {i+1:05d}",
            "job_description": "Mô tả công việc chi tiết...",
            "requirements": "Yêu cầu ứng viên...",
            "benefits": "Quyền lợi công ty...",
            "job_type": "FULL_TIME",
            "workplace_type": "HYBRID",
            "address_id": addresses[10000 + (i % 5000)]["address_id"],
            "salary_min": 20000000,
            "salary_max": 40000000,
            "is_salary_negotiable": False,
            "experience_years_min": 2.0,
            "required_education": "BACHELOR",
            "approval_status": "APPROVED",
            "rejection_reason": None,
            "approved_by": accounts[0]["account_id"],
            "approved_at": "2026-03-10T00:00:00Z",
            "deadline": "2026-12-31T23:59:59Z",
            "created_at": "2026-03-10T00:00:00Z"
        })
    data["job_posts"] = job_posts

    job_skills = []
    for jp in job_posts:
        s_sample = random.sample(skills, 4)
        for s in s_sample:
            job_skills.append({
                "job_post_id": jp["job_post_id"],
                "skill_id": s["skill_id"],
                "requirement_type": "MANDATORY",
                "min_years_experience": 2.0,
                "created_at": "2026-03-10T00:00:00Z"
            })
    data["job_skills"] = job_skills

    print("-> Sinh 15.000 bản ghi job_applications...")
    job_applications = []
    for i in range(15000):
        cand = candidate_profiles[i % 10000]
        res = resumes[i % 10000]
        jp = job_posts[i % 10000]
        job_applications.append({
            "application_id": gen_uuid(),
            "job_post_id": jp["job_post_id"],
            "candidate_id": cand["candidate_id"],
            "resume_id": res["resume_id"],
            "status": "SUBMITTED",
            "recruiter_notes": "Đã nhận đơn ứng tuyển",
            "applied_at": "2026-04-01T00:00:00Z"
        })
    data["job_applications"] = job_applications

    # 8. Search History (30,000) & Job Notifications (30,000 bản ghi)
    print("-> Sinh 30.000 search_history & 30.000 job_notifications...")
    search_history = []
    for i in range(1, 30001):
        cand = candidate_profiles[i % 10000]
        search_history.append({
            "search_id": i,
            "candidate_id": cand["candidate_id"],
            "keyword": "Python Developer",
            "domain_id": 1,
            "city": "Hà Nội",
            "min_salary": 20000000,
            "results_count": 15,
            "created_at": "2026-04-10T00:00:00Z"
        })
    data["search_history"] = search_history

    job_notifications = []
    for i in range(1, 30001):
        cand = candidate_profiles[i % 10000]
        jp = job_posts[i % 10000]
        job_notifications.append({
            "notification_id": i,
            "candidate_id": cand["candidate_id"],
            "job_post_id": jp["job_post_id"],
            "title": "Gợi ý công việc mới phù hợp",
            "content": "Nội dung gợi ý phân tích từ CV...",
            "is_read": False,
            "read_at": None,
            "created_at": "2026-04-15T00:00:00Z"
        })
    data["job_notifications"] = job_notifications

    # 9. CV Analyses (10,000) & Matched Results (200,000 bản ghi - Bảng siêu lớn)
    print("-> Sinh 10.000 cv_analyses và 200.000 matched_results (Bảng Siêu Lớn)...")
    cv_analyses = []
    for i in range(10000):
        cv_analyses.append({
            "analysis_id": gen_uuid(),
            "resume_id": resumes[i]["resume_id"],
            "target_position_id": None,
            "target_city": "Hà Nội",
            "target_domain_id": 1,
            "target_job_type": "FULL_TIME",
            "target_workplace_type": "HYBRID",
            "target_min_salary": 20000000,
            "target_experience_years": 2.0,
            "target_job_level": "MIDDLE",
            "status": "COMPLETED",
            "total_jobs_scanned": 100,
            "matched_jobs_count": 20,
            "execution_time_ms": 1500,
            "created_at": "2026-04-01T00:00:00Z"
        })
    data["cv_analyses"] = cv_analyses

    matched_results = []
    match_counter = 1
    # 10,000 analyses * 20 matched jobs per analysis = 200,000 bản ghi
    for ca in cv_analyses:
        sampled_jobs = random.sample(job_posts, 20)
        for jp in sampled_jobs:
            matched_results.append({
                "match_id": match_counter,
                "analysis_id": ca["analysis_id"],
                "job_post_id": jp["job_post_id"],
                "overall_score": round(random.uniform(60.0, 95.0), 2),
                "skill_score": round(random.uniform(60.0, 95.0), 2),
                "experience_score": round(random.uniform(60.0, 95.0), 2),
                "education_score": round(random.uniform(60.0, 95.0), 2),
                "missing_skills": json.dumps([{"skill_id": 1, "skill_name": "Python"}]),
                "ai_feedback": "Tư vấn nâng cao kỹ năng từ mô hình AI...",
                "created_at": "2026-04-01T00:00:00Z"
            })
            match_counter += 1
    data["matched_results"] = matched_results

    # 10. Activity Logs (100,000 bản ghi - Phân vùng Range Partition)
    print("-> Sinh 100.000 activity_logs (Bảng Siêu Lớn Partition Benchmark)...")
    sessions = []
    for i in range(20000):
        sessions.append({
            "session_id": gen_uuid(),
            "account_id": accounts[i % 15000]["account_id"],
            "refresh_token_hash": f"hash_token_{i:06d}",
            "ip_address": "113.160.10.20",
            "user_agent": "Mozilla/5.0",
            "is_revoked": False,
            "expires_at": "2026-11-15T00:00:00Z",
            "created_at": "2026-10-01T00:00:00Z"
        })
    data["sessions"] = sessions

    activity_logs = []
    actions = ["VIEW_JOB", "SEARCH_JOB", "ANALYZE_CV", "APPLY_JOB"]
    # Trải dài qua 4 Quý năm 2026 để test Partitioning Strategy
    quarters_date = ["2026-02-15T10:00:00Z", "2026-05-15T10:00:00Z", "2026-08-15T10:00:00Z", "2026-11-01T10:00:00Z"]
    for i in range(1, 100001):
        sess = sessions[i % 20000]
        activity_logs.append({
            "activity_id": i,
            "sessions_id": sess["session_id"],
            "action_type": random.choice(actions),
            "target_entity": "JOB_POST",
            "target_id": gen_uuid(),
            "details": json.dumps({"log": f"Log benchmark {i}"}),
            "created_at": random.choice(quarters_date)
        })
    data["activity_logs"] = activity_logs

    print("==================================================")
    print("Sinh dữ liệu quy mô Lớn hoàn tất thành công!")
    return data

if __name__ == "__main__":
    generate_large_scale_data()