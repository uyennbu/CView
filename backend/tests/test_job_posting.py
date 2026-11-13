"""Unit and integration tests for Job Posting module (job_posts, job_skills, job_certificates, job_domains)."""

from datetime import datetime, timedelta, timezone
import uuid

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.main import app
from app.models.business import (
    Address,
    Certificate,
    Company,
    Domain,
    JobPost,
    RecruiterProfile,
    Skill,
)
from app.models.system import Account


@pytest.fixture(scope="module")
def db_session():
    """Fixture cung cấp SQLAlchemy Session kết nối tới CSDL cview_db."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def client():
    """FastAPI TestClient."""
    return TestClient(app)


@pytest.fixture(scope="module")
def test_catalogs(db_session):
    """Lấy danh mục kỹ năng, chứng chỉ và lĩnh vực từ database."""
    skill1 = db_session.scalar(select(Skill).order_by(Skill.skill_id.asc()))
    skill2 = db_session.scalar(select(Skill).order_by(Skill.skill_id.desc()))
    cert1 = db_session.scalar(select(Certificate).order_by(Certificate.certificate_id.asc()))
    domain1 = db_session.scalar(select(Domain).order_by(Domain.domain_id.asc()))

    assert skill1 and skill2 and cert1 and domain1, "Cần có seed data cho skills, certs, domains"
    return {
        "skill1": skill1,
        "skill2": skill2,
        "cert1": cert1,
        "domain1": domain1,
    }


@pytest.fixture(scope="module")
def recruiter_auth_headers(db_session):
    """Lấy hoặc tạo tài khoản recruiter để test và trả về Bearer Token."""
    account = db_session.scalar(select(Account).where(Account.username == "recruiter01"))
    if not account:
        account = Account(
            username=f"rec_jp_{uuid.uuid4().hex[:6]}",
            email=f"rec_jp_{uuid.uuid4().hex[:6]}@example.com",
            password_hash="mock_hash",
            status="ACTIVE",
        )
        db_session.add(account)
        db_session.flush()

        address = Address(
            street_address="123 Kim Mã",
            ward="Kim Mã",
            city="Hà Nội",
            country="Việt Nam",
        )
        db_session.add(address)
        db_session.flush()

        company = Company(
            name=f"Công ty Test JP {uuid.uuid4().hex[:6]}",
            address_id=address.address_id,
            tax_code=f"{uuid.uuid4().int % 10000000000:010d}",
            industry="Công nghệ phần mềm",
            verification_status="VERIFIED",
        )
        db_session.add(company)
        db_session.flush()

        recruiter = RecruiterProfile(
            account_id=account.account_id,
            company_id=company.company_id,
            full_name="Nguyễn Văn Tuyển",
            job_title="HR Manager",
            work_email=f"hr_{uuid.uuid4().hex[:6]}@testcompany.vn",
        )
        db_session.add(recruiter)
        db_session.commit()
        db_session.refresh(account)

    token = create_access_token(
        subject=str(account.account_id),
        roles=["RECRUITER"],
    )
    return {"Authorization": f"Bearer {token}"}, account


@pytest.fixture(scope="module")
def candidate_auth_headers(db_session):
    """Token của tài khoản Candidate để kiểm thử phân quyền 403 Forbidden."""
    account = db_session.scalar(select(Account).where(Account.username == "candidate01"))
    token = create_access_token(
        subject=str(account.account_id) if account else str(uuid.uuid4()),
        roles=["CANDIDATE"],
    )
    return {"Authorization": f"Bearer {token}"}


def test_get_job_catalogs(client):
    """Kiểm thử API lấy danh mục chuẩn hóa kỹ năng, chứng chỉ và lĩnh vực."""
    res_skills = client.get("/api/v1/jobs/catalogs/skills")
    assert res_skills.status_code == 200
    skills_data = res_skills.json()
    assert isinstance(skills_data, list)
    assert len(skills_data) > 0
    assert "skill_id" in skills_data[0]
    assert "skill_name" in skills_data[0]

    res_certs = client.get("/api/v1/jobs/catalogs/certificates")
    assert res_certs.status_code == 200
    certs_data = res_certs.json()
    assert isinstance(certs_data, list)
    assert len(certs_data) > 0
    assert "certificate_id" in certs_data[0]
    assert "certificate_name" in certs_data[0]

    res_domains = client.get("/api/v1/jobs/catalogs/domains")
    assert res_domains.status_code == 200
    domains_data = res_domains.json()
    assert isinstance(domains_data, list)
    assert len(domains_data) > 0
    assert "domain_id" in domains_data[0]
    assert "domain_name" in domains_data[0]


def test_create_job_post_success(client, recruiter_auth_headers, test_catalogs):
    """Kiểm thử tạo tin tuyển dụng thành công với kỹ năng (MANDATORY/PREFERRED), chứng chỉ và lĩnh vực."""
    headers, _ = recruiter_auth_headers
    deadline = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()

    payload = {
        "title": "Senior Python Backend Engineer",
        "position": "Backend Developer",
        "job_description": "Xây dựng hệ thống microservices backend xử lý dữ liệu lớn bằng FastAPI và PostgreSQL.",
        "requirements": "Ít nhất 3 năm kinh nghiệm Python, thông thạo Docker và cơ sở dữ liệu quan hệ.",
        "benefits": "Lương tháng 13, bảo hiểm sức khỏe VIP, cấp MacBook Pro, làm việc Hybrid.",
        "job_type": "FULL_TIME",
        "workplace_type": "HYBRID",
        "salary_min": 30000000,
        "salary_max": 50000000,
        "is_salary_negotiable": False,
        "experience_years_min": 3.0,
        "required_education": "BACHELOR",
        "deadline": deadline,
        "skills": [
            {
                "skill_id": test_catalogs["skill1"].skill_id,
                "requirement_type": "MANDATORY",
                "min_years_experience": 2.5,
            },
            {
                "skill_id": test_catalogs["skill2"].skill_id,
                "requirement_type": "PREFERRED",
                "min_years_experience": 1.0,
            },
        ],
        "certificates": [
            {
                "certificate_id": test_catalogs["cert1"].certificate_id,
                "is_mandatory": False,
            }
        ],
        "domain_ids": [test_catalogs["domain1"].domain_id],
    }

    res = client.post("/api/v1/jobs", json=payload, headers=headers)
    assert res.status_code == 201

    data = res.json()
    assert "job_post_id" in data
    assert data["title"] == payload["title"]
    assert data["position"] == payload["position"]
    assert data["approval_status"] == "PENDING"
    assert data["salary_min"] == 30000000
    assert data["salary_max"] == 50000000
    assert len(data["skills"]) == 2

    # Kiểm tra kỹ năng MANDATORY và PREFERRED
    skill_req_types = {s["skill_id"]: s["requirement_type"] for s in data["skills"]}
    assert skill_req_types[test_catalogs["skill1"].skill_id] == "MANDATORY"
    assert skill_req_types[test_catalogs["skill2"].skill_id] == "PREFERRED"

    # Kiểm tra chứng chỉ và lĩnh vực
    assert len(data["certificates"]) == 1
    assert data["certificates"][0]["certificate_id"] == test_catalogs["cert1"].certificate_id
    assert len(data["domains"]) == 1
    assert data["domains"][0]["domain_id"] == test_catalogs["domain1"].domain_id


def test_get_my_job_posts_and_filtering(client, recruiter_auth_headers):
    """Kiểm thử xem danh sách tin tuyển dụng đã đăng và lọc theo trạng thái duyệt ('PENDING', 'APPROVED', 'REJECTED')."""
    headers, _ = recruiter_auth_headers

    # Lấy toàn bộ tin của recruiter
    res = client.get("/api/v1/jobs/my-jobs", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1

    # Lọc trạng thái PENDING
    res_pending = client.get("/api/v1/jobs/my-jobs?approval_status=PENDING", headers=headers)
    assert res_pending.status_code == 200
    pending_data = res_pending.json()
    for item in pending_data["items"]:
        assert item["approval_status"] == "PENDING"

    # Lọc trạng thái REJECTED (chưa có tin nào bị từ chối)
    res_rejected = client.get("/api/v1/jobs/my-jobs?approval_status=REJECTED", headers=headers)
    assert res_rejected.status_code == 200
    rejected_data = res_rejected.json()
    for item in rejected_data["items"]:
        assert item["approval_status"] == "REJECTED"


def test_create_job_post_with_new_address(client, recruiter_auth_headers, test_catalogs):
    """Kiểm thử tạo tin tuyển dụng gắn kèm địa chỉ làm việc mới."""
    headers, _ = recruiter_auth_headers
    deadline = (datetime.now(timezone.utc) + timedelta(days=20)).isoformat()

    payload = {
        "title": "Frontend React Lead",
        "position": "Frontend Developer",
        "job_description": "Dẫn dắt đội ngũ phát triển giao diện người dùng Next.js, tối ưu hóa Web Vitals.",
        "requirements": "Ít nhất 4 năm kinh nghiệm React/TypeScript, kinh nghiệm làm việc với TailwindCSS.",
        "job_type": "FULL_TIME",
        "workplace_type": "ON_SITE",
        "address": {
            "street_address": "88 Cầu Giấy",
            "ward": "Quan Hoa",
            "city": "Hà Nội",
            "country": "Việt Nam",
        },
        "salary_min": 35000000,
        "salary_max": 55000000,
        "deadline": deadline,
        "skills": [
            {
                "skill_id": test_catalogs["skill1"].skill_id,
                "requirement_type": "MANDATORY",
                "min_years_experience": 3.0,
            }
        ],
    }

    res = client.post("/api/v1/jobs", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["address"] is not None
    assert data["address"]["street_address"] == "88 Cầu Giấy"
    assert data["address"]["city"] == "Hà Nội"


def test_create_job_post_validation_salary_error(client, recruiter_auth_headers):
    """Kiểm thử lỗi validation khi salary_max < salary_min."""
    headers, _ = recruiter_auth_headers
    deadline = (datetime.now(timezone.utc) + timedelta(days=15)).isoformat()

    payload = {
        "title": "Invalid Salary Developer",
        "position": "Developer",
        "job_description": "Mô tả công việc với mức lương không hợp lệ.",
        "requirements": "Yêu cầu kỹ năng cơ bản.",
        "job_type": "FULL_TIME",
        "workplace_type": "REMOTE",
        "salary_min": 50000000,
        "salary_max": 20000000,  # Lỗi: max < min
        "deadline": deadline,
    }

    res = client.post("/api/v1/jobs", json=payload, headers=headers)
    assert res.status_code == 422


def test_create_job_post_validation_past_deadline(client, recruiter_auth_headers):
    """Kiểm thử lỗi khi deadline trong quá khứ."""
    headers, _ = recruiter_auth_headers
    past_deadline = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()

    payload = {
        "title": "Expired Job Post",
        "position": "Developer",
        "job_description": "Mô tả bài tuyển dụng có deadline đã qua.",
        "requirements": "Yêu cầu cơ bản.",
        "job_type": "FULL_TIME",
        "workplace_type": "REMOTE",
        "deadline": past_deadline,
    }

    res = client.post("/api/v1/jobs", json=payload, headers=headers)
    assert res.status_code == 422


def test_create_job_post_duplicate_skills_error(client, recruiter_auth_headers, test_catalogs):
    """Kiểm thử lỗi 400 khi danh sách kỹ năng bị trùng lặp ID."""
    headers, _ = recruiter_auth_headers
    deadline = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()

    payload = {
        "title": "Duplicate Skills Test",
        "position": "Developer",
        "job_description": "Mô tả kiểm thử trùng lặp kỹ năng.",
        "requirements": "Yêu cầu cơ bản.",
        "job_type": "FULL_TIME",
        "workplace_type": "REMOTE",
        "deadline": deadline,
        "skills": [
            {"skill_id": test_catalogs["skill1"].skill_id, "requirement_type": "MANDATORY"},
            {"skill_id": test_catalogs["skill1"].skill_id, "requirement_type": "PREFERRED"},
        ],
    }

    res = client.post("/api/v1/jobs", json=payload, headers=headers)
    assert res.status_code == 400
    assert "trùng lặp" in res.json()["detail"]


def test_create_job_post_nonexistent_skill_error(client, recruiter_auth_headers):
    """Kiểm thử lỗi 400 khi skill_id không tồn tại."""
    headers, _ = recruiter_auth_headers
    deadline = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()

    payload = {
        "title": "Nonexistent Skill Test",
        "position": "Developer",
        "job_description": "Mô tả kiểm thử kỹ năng không tồn tại.",
        "requirements": "Yêu cầu cơ bản.",
        "job_type": "FULL_TIME",
        "workplace_type": "REMOTE",
        "deadline": deadline,
        "skills": [{"skill_id": 999999, "requirement_type": "MANDATORY"}],
    }

    res = client.post("/api/v1/jobs", json=payload, headers=headers)
    assert res.status_code == 400
    assert "không tồn tại" in res.json()["detail"]


def test_job_posting_forbidden_for_candidate(client, candidate_auth_headers):
    """Kiểm thử ứng viên không được phép tạo tin tuyển dụng hoặc xem my-jobs (403 Forbidden)."""
    deadline = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
    payload = {
        "title": "Candidate Trying To Post Job",
        "position": "Developer",
        "job_description": "Ứng viên cố gắng đăng tin tuyển dụng trái phép.",
        "requirements": "Yêu cầu ứng viên.",
        "job_type": "FULL_TIME",
        "workplace_type": "REMOTE",
        "deadline": deadline,
    }

    res_post = client.post("/api/v1/jobs", json=payload, headers=candidate_auth_headers)
    assert res_post.status_code == 403

    res_my_jobs = client.get("/api/v1/jobs/my-jobs", headers=candidate_auth_headers)
    assert res_my_jobs.status_code == 403


def test_job_posting_unauthorized(client):
    """Kiểm thử truy cập không có token bị từ chối 401 Unauthorized."""
    res_post = client.post("/api/v1/jobs", json={})
    assert res_post.status_code == 401

    res_my_jobs = client.get("/api/v1/jobs/my-jobs")
    assert res_my_jobs.status_code == 401

