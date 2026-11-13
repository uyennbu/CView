"""Unit and integration tests for Recruiter Profile & Company API (GET/PUT /recruiter/profile)."""

import uuid

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.main import app
from app.models.business import Address, Company, RecruiterProfile
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
def recruiter_auth_headers(db_session):
    """Lấy hoặc tạo tài khoản recruiter để test và trả về Bearer Token."""
    account = db_session.scalar(select(Account).where(Account.username == "recruiter01"))
    if not account:
        account = Account(
            username=f"rec_test_{uuid.uuid4().hex[:6]}",
            email=f"rec_{uuid.uuid4().hex[:6]}@example.com",
            password_hash="mock_hash",
            status="ACTIVE",
        )
        db_session.add(account)
        db_session.flush()

        address = Address(
            street_address="1 Phạm Văn Bạch",
            ward="Dịch Vọng",
            city="Hà Nội",
            country="Việt Nam",
        )
        db_session.add(address)
        db_session.flush()

        company = Company(
            name=f"Công ty Test {uuid.uuid4().hex[:6]}",
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
            full_name="Nguyễn Thị Lan Anh",
            job_title="Technical Recruiter",
            work_email=f"work_{uuid.uuid4().hex[:6]}@techcorp.vn",
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


def test_get_recruiter_profile_success(client, recruiter_auth_headers):
    """Kiểm thử GET /api/v1/recruiter/profile lấy đầy đủ thông tin nhà tuyển dụng, công ty và địa chỉ."""
    headers, account = recruiter_auth_headers
    res = client.get("/api/v1/recruiter/profile", headers=headers)
    assert res.status_code == 200

    data = res.json()
    assert data["account_id"] == str(account.account_id)
    assert data["username"] == account.username
    assert "recruiter_id" in data
    assert "full_name" in data
    assert "job_title" in data
    assert "work_email" in data
    assert "company" in data
    assert "name" in data["company"]
    assert "tax_code" in data["company"]
    assert "industry" in data["company"]
    assert "address" in data["company"]


def test_update_recruiter_profile_success(client, recruiter_auth_headers, db_session):
    """Kiểm thử PUT /api/v1/recruiter/profile cập nhật hồ sơ nhà tuyển dụng và công ty."""
    headers, account = recruiter_auth_headers

    unique_title = f"Head of HR {uuid.uuid4().hex[:4]}"
    update_payload = {
        "full_name": "Nguyễn Thị Lan Anh Cập Nhật",
        "job_title": unique_title,
        "company": {
            "website": "https://techcorp.vn/careers",
            "industry": "Trí tuệ nhân tạo & Điện toán đám mây",
            "address": {
                "street_address": "88 Đường Cầu Giấy",
                "ward": "Dịch Vọng",
                "city": "Hà Nội",
                "country": "Việt Nam",
            },
        },
    }

    res = client.put("/api/v1/recruiter/profile", headers=headers, json=update_payload)
    assert res.status_code == 200

    data = res.json()
    assert data["full_name"] == "Nguyễn Thị Lan Anh Cập Nhật"
    assert data["job_title"] == unique_title
    assert data["company"]["website"] == "https://techcorp.vn/careers"
    assert data["company"]["industry"] == "Trí tuệ nhân tạo & Điện toán đám mây"
    assert data["company"]["address"]["street_address"] == "88 Đường Cầu Giấy"

    # Kiểm tra trực tiếp trong CSDL
    recruiter = db_session.scalar(
        select(RecruiterProfile).where(RecruiterProfile.account_id == account.account_id)
    )
    assert recruiter.full_name == "Nguyễn Thị Lan Anh Cập Nhật"
    assert recruiter.job_title == unique_title

    company = db_session.get(Company, recruiter.company_id)
    assert company.website == "https://techcorp.vn/careers"
    assert company.industry == "Trí tuệ nhân tạo & Điện toán đám mây"

    address = db_session.get(Address, company.address_id)
    assert address.street_address == "88 Đường Cầu Giấy"


def test_update_recruiter_profile_duplicate_work_email_fails(client, recruiter_auth_headers, db_session):
    """Kiểm thử cập nhật email công vụ bị trùng với nhà tuyển dụng khác -> HTTP 409 Conflict."""
    headers, account = recruiter_auth_headers

    # Lấy email công vụ của một nhà tuyển dụng khác (ví dụ recruiter02)
    other_rec = db_session.scalar(
        select(RecruiterProfile).where(RecruiterProfile.account_id != account.account_id)
    )
    if other_rec and other_rec.work_email:
        res = client.put(
            "/api/v1/recruiter/profile",
            headers=headers,
            json={"work_email": other_rec.work_email},
        )
        assert res.status_code == 409
        assert "Email công vụ" in res.json()["detail"]


def test_update_recruiter_profile_duplicate_tax_code_fails(client, recruiter_auth_headers, db_session):
    """Kiểm thử cập nhật mã số thuế bị trùng với doanh nghiệp khác -> HTTP 409 Conflict."""
    headers, account = recruiter_auth_headers

    recruiter = db_session.scalar(
        select(RecruiterProfile).where(RecruiterProfile.account_id == account.account_id)
    )
    # Lấy mã số thuế của một công ty khác
    other_comp = db_session.scalar(
        select(Company).where(Company.company_id != recruiter.company_id)
    )
    if other_comp and other_comp.tax_code:
        res = client.put(
            "/api/v1/recruiter/profile",
            headers=headers,
            json={"company": {"tax_code": other_comp.tax_code}},
        )
        assert res.status_code == 409
        assert "Mã số thuế" in res.json()["detail"]


def test_update_recruiter_profile_invalid_tax_code_fails(client, recruiter_auth_headers):
    """Kiểm thử mã số thuế không đúng định dạng (10 hoặc 13 số)."""
    headers, _ = recruiter_auth_headers
    res = client.put(
        "/api/v1/recruiter/profile",
        headers=headers,
        json={"company": {"tax_code": "12345"}},
    )
    assert res.status_code == 422


def test_update_recruiter_profile_invalid_website_fails(client, recruiter_auth_headers):
    """Kiểm thử website không đúng định dạng URL http/https."""
    headers, _ = recruiter_auth_headers
    res = client.put(
        "/api/v1/recruiter/profile",
        headers=headers,
        json={"company": {"website": "ftp://techcorp.vn"}},
    )
    assert res.status_code == 422


def test_recruiter_profile_unauthorized(client):
    """Kiểm thử không có token truy cập -> HTTP 401 Unauthorized."""
    res_get = client.get("/api/v1/recruiter/profile")
    assert res_get.status_code == 401

    res_put = client.put("/api/v1/recruiter/profile", json={"full_name": "Test"})
    assert res_put.status_code == 401


def test_recruiter_profile_forbidden_for_candidate(client, candidate_auth_headers):
    """Kiểm thử tài khoản Ứng viên không có quyền RECRUITER -> HTTP 403 Forbidden."""
    res = client.get("/api/v1/recruiter/profile", headers=candidate_auth_headers)
    assert res.status_code == 403
    assert "RECRUITER" in res.json()["detail"]

