"""Unit and integration tests for Candidate Profile API (GET/PUT /candidate/profile)."""

from datetime import date
import uuid

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.main import app
from app.models.business import Address, CandidateProfile
from app.models.system import Account, Role


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
def candidate_auth_headers(db_session):
    """Lấy hoặc tạo tài khoản candidate để test và trả về Bearer Token."""
    account = db_session.scalar(select(Account).where(Account.username == "candidate01"))
    if not account:
        account = Account(
            username=f"cand_test_{uuid.uuid4().hex[:6]}",
            email=f"cand_{uuid.uuid4().hex[:6]}@example.com",
            password_hash="mock_hash",
            status="ACTIVE",
            phone_number=f"09{uuid.uuid4().int % 100000000:08d}",
        )
        db_session.add(account)
        db_session.flush()

        profile = CandidateProfile(
            account_id=account.account_id,
            full_name="Nguyễn Văn An Test",
            years_of_experience=2.0,
            education_level="BACHELOR",
        )
        db_session.add(profile)
        db_session.commit()
        db_session.refresh(account)

    token = create_access_token(
        subject=str(account.account_id),
        roles=["CANDIDATE"],
    )
    return {"Authorization": f"Bearer {token}"}, account


@pytest.fixture(scope="module")
def recruiter_auth_headers(db_session):
    """Token của tài khoản Recruiter để kiểm thử phân quyền 403 Forbidden."""
    account = db_session.scalar(select(Account).where(Account.username == "recruiter01"))
    token = create_access_token(
        subject=str(account.account_id) if account else str(uuid.uuid4()),
        roles=["RECRUITER"],
    )
    return {"Authorization": f"Bearer {token}"}


def test_get_candidate_profile_success(client, candidate_auth_headers):
    """Kiểm thử GET /api/v1/candidate/profile lấy đầy đủ thông tin hồ sơ và địa chỉ."""
    headers, account = candidate_auth_headers
    res = client.get("/api/v1/candidate/profile", headers=headers)
    assert res.status_code == 200

    data = res.json()
    assert data["account_id"] == str(account.account_id)
    assert data["username"] == account.username
    assert data["email"] == account.email
    assert "candidate_id" in data
    assert "full_name" in data
    assert "years_of_experience" in data
    assert "education_level" in data


def test_update_candidate_profile_success(client, candidate_auth_headers, db_session):
    """Kiểm thử PUT /api/v1/candidate/profile cập nhật hồ sơ cá nhân và địa chỉ."""
    headers, account = candidate_auth_headers

    unique_job = f"Senior Engineer {uuid.uuid4().hex[:4]}"
    update_payload = {
        "full_name": "Nguyễn Văn An Cập Nhật",
        "date_of_birth": "1998-08-20",
        "gender": "MALE",
        "current_job_title": unique_job,
        "years_of_experience": 5.5,
        "education_level": "MASTER",
        "address": {
            "street_address": "123 Đường Nguyễn Huệ",
            "ward": "Phường Bến Nghé",
            "city": "TP. Hồ Chí Minh",
            "country": "Việt Nam",
        },
    }

    res = client.put("/api/v1/candidate/profile", headers=headers, json=update_payload)
    assert res.status_code == 200

    data = res.json()
    assert data["full_name"] == "Nguyễn Văn An Cập Nhật"
    assert data["date_of_birth"] == "1998-08-20"
    assert data["gender"] == "MALE"
    assert data["current_job_title"] == unique_job
    assert data["years_of_experience"] == 5.5
    assert data["education_level"] == "MASTER"
    assert data["address"] is not None
    assert data["address"]["street_address"] == "123 Đường Nguyễn Huệ"
    assert data["address"]["city"] == "TP. Hồ Chí Minh"

    # Kiểm tra trực tiếp trong CSDL
    profile = db_session.scalar(select(CandidateProfile).where(CandidateProfile.account_id == account.account_id))
    assert profile.full_name == "Nguyễn Văn An Cập Nhật"
    assert profile.current_job_title == unique_job
    assert float(profile.years_of_experience) == 5.5

    address = db_session.get(Address, profile.address_id)
    assert address is not None
    assert address.street_address == "123 Đường Nguyễn Huệ"
    assert address.city == "TP. Hồ Chí Minh"


def test_update_candidate_profile_create_new_address(client, db_session):
    """Kiểm thử PUT /api/v1/candidate/profile khi ứng viên chưa có địa chỉ -> tự tạo mới và gắn FK."""
    new_acc = Account(
        username=f"cand_no_addr_{uuid.uuid4().hex[:6]}",
        email=f"no_addr_{uuid.uuid4().hex[:6]}@example.com",
        password_hash="mock_hash",
        status="ACTIVE",
    )
    db_session.add(new_acc)
    db_session.flush()

    new_prof = CandidateProfile(
        account_id=new_acc.account_id,
        full_name="Ứng viên chưa có địa chỉ",
        address_id=None,
    )
    db_session.add(new_prof)
    db_session.commit()
    db_session.refresh(new_acc)

    token = create_access_token(subject=str(new_acc.account_id), roles=["CANDIDATE"])
    headers = {"Authorization": f"Bearer {token}"}

    update_payload = {
        "address": {
            "street_address": "88 Đường Lê Duẩn",
            "ward": "Hải Châu 1",
            "city": "Đà Nẵng",
            "country": "Việt Nam",
        }
    }

    res = client.put("/api/v1/candidate/profile", headers=headers, json=update_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["address"] is not None
    assert data["address"]["street_address"] == "88 Đường Lê Duẩn"
    assert data["address"]["city"] == "Đà Nẵng"

    db_session.refresh(new_prof)
    assert new_prof.address_id is not None


def test_update_candidate_profile_age_under_16_fails(client, candidate_auth_headers):
    """Kiểm thử ràng buộc nghiệp vụ: Ứng viên phải từ đủ 16 tuổi trở lên."""
    headers, _ = candidate_auth_headers
    res = client.put(
        "/api/v1/candidate/profile",
        headers=headers,
        json={"date_of_birth": "2020-01-01"},  # Dưới 16 tuổi
    )
    assert res.status_code == 400
    assert "16 tuổi" in res.json()["detail"]


def test_update_candidate_profile_invalid_gender_fails(client, candidate_auth_headers):
    """Kiểm thử giới tính không thuộc danh mục CHECK (MALE, FEMALE, OTHER)."""
    headers, _ = candidate_auth_headers
    res = client.put(
        "/api/v1/candidate/profile",
        headers=headers,
        json={"gender": "UNKNOWN_GENDER"},
    )
    assert res.status_code == 422  # Pydantic regex pattern validation


def test_update_candidate_profile_duplicate_phone_fails(client, candidate_auth_headers, db_session):
    """Kiểm thử cập nhật số điện thoại bị trùng với tài khoản khác -> HTTP 409 Conflict."""
    headers, account = candidate_auth_headers

    # Lấy số điện thoại của một tài khoản khác
    other_acc = db_session.scalar(
        select(Account).where(
            Account.account_id != account.account_id,
            Account.phone_number.isnot(None),
        )
    )
    if other_acc and other_acc.phone_number:
        res = client.put(
            "/api/v1/candidate/profile",
            headers=headers,
            json={"phone_number": other_acc.phone_number},
        )
        assert res.status_code == 409
        assert "Số điện thoại" in res.json()["detail"]


def test_candidate_profile_unauthorized(client):
    """Kiểm thử không có token truy cập -> HTTP 401 Unauthorized."""
    res_get = client.get("/api/v1/candidate/profile")
    assert res_get.status_code == 401

    res_put = client.put("/api/v1/candidate/profile", json={"full_name": "Test"})
    assert res_put.status_code == 401


def test_candidate_profile_forbidden_for_recruiter(client, recruiter_auth_headers):
    """Kiểm thử tài khoản Nhà tuyển dụng không có quyền CANDIDATE -> HTTP 403 Forbidden."""
    res = client.get("/api/v1/candidate/profile", headers=recruiter_auth_headers)
    assert res.status_code == 403
    assert "CANDIDATE" in res.json()["detail"]

