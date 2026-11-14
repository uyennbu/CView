"""Unit and integration tests for Admin Job Moderation and other_notifications."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
import uuid

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.main import app
from app.models.business import (
    Address,
    Company,
    JobPost,
    RecruiterProfile,
)
from app.models.system import Account, OtherNotification


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
def admin_auth(db_session):
    """Tạo hoặc lấy tài khoản Admin và sinh Bearer Token."""
    account = db_session.scalar(select(Account).where(Account.username == "admin_root"))
    if not account:
        account = Account(
            username=f"admin_{uuid.uuid4().hex[:6]}",
            email=f"admin_{uuid.uuid4().hex[:6]}@cview.vn",
            password_hash="mock_hash",
            status="ACTIVE",
        )
        db_session.add(account)
        db_session.commit()
        db_session.refresh(account)

    token = create_access_token(
        subject=str(account.account_id),
        roles=["ADMIN"],
    )
    return {"Authorization": f"Bearer {token}"}, account


@pytest.fixture(scope="module")
def recruiter_info(db_session):
    """Tạo hoặc lấy tài khoản Recruiter có profile để nhận thông báo duyệt bài."""
    account = db_session.scalar(select(Account).where(Account.username == "recruiter01"))
    if not account:
        account = Account(
            username=f"rec_mod_{uuid.uuid4().hex[:6]}",
            email=f"rec_mod_{uuid.uuid4().hex[:6]}@example.com",
            password_hash="mock_hash",
            status="ACTIVE",
        )
        db_session.add(account)
        db_session.flush()

        address = Address(
            street_address="456 Hoàng Hoa Thám",
            city="Hà Nội",
            country="Việt Nam",
        )
        db_session.add(address)
        db_session.flush()

        company = Company(
            name=f"Công ty Moderation Test {uuid.uuid4().hex[:6]}",
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
            full_name="Nguyễn Văn Kiểm",
            job_title="HR Director",
            work_email=f"hr_{uuid.uuid4().hex[:6]}@modtest.vn",
        )
        db_session.add(recruiter)
        db_session.commit()
        db_session.refresh(account)
    else:
        recruiter = db_session.scalar(
            select(RecruiterProfile).where(RecruiterProfile.account_id == account.account_id)
        )

    token = create_access_token(
        subject=str(account.account_id),
        roles=["RECRUITER"],
    )
    return {"Authorization": f"Bearer {token}"}, account, recruiter


@pytest.fixture(scope="module")
def candidate_headers():
    """Bearer token cho vai trò CANDIDATE để kiểm thử 403 Forbidden."""
    token = create_access_token(
        subject=str(uuid.uuid4()),
        roles=["CANDIDATE"],
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def pending_job(db_session, recruiter_info):
    """Tạo một bài đăng tuyển dụng ở trạng thái PENDING để kiểm thử kiểm duyệt."""
    _, _, recruiter = recruiter_info
    job = JobPost(
        recruiter_id=recruiter.recruiter_id,
        company_id=recruiter.company_id,
        position="Golang Engineer",
        title=f"Golang Backend Developer {uuid.uuid4().hex[:6]}",
        job_description="Phát triển hệ thống xử lý phân tán với Golang và gRPC.",
        requirements="Ít nhất 2 năm kinh nghiệm Go, hiểu biết concurrency và Redis.",
        benefits="Thưởng dự án, bảo hiểm PVI, laptop Pro.",
        job_type="FULL_TIME",
        workplace_type="HYBRID",
        salary_min=25000000,
        salary_max=40000000,
        is_salary_negotiable=False,
        experience_years_min=Decimal("2.0"),
        required_education="BACHELOR",
        approval_status="PENDING",
        deadline=datetime.now(timezone.utc) + timedelta(days=25),
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)
    return job


def test_admin_approves_job_post_success(client, admin_auth, recruiter_info, pending_job, db_session):
    """Kiểm thử Admin phê duyệt tin tuyển dụng thành công và gửi thông báo vào other_notifications."""
    admin_headers, admin_account = admin_auth
    _, recruiter_account, _ = recruiter_info

    res = client.patch(
        f"/api/v1/jobs/{pending_job.job_post_id}/moderation",
        headers=admin_headers,
        json={"approval_status": "APPROVED"},
    )
    assert res.status_code == 200
    data = res.json()

    assert data["job_id"] == str(pending_job.job_post_id)
    assert data["approval_status"] == "APPROVED"
    assert data["approved_by"] == str(admin_account.account_id)
    assert data["approved_at"] is not None
    assert data["rejection_reason"] is None
    assert data["notification_id"] is not None

    # Kiểm tra bản ghi trong bảng job_posts
    db_session.expire_all()
    updated_job = db_session.get(JobPost, pending_job.job_post_id)
    assert updated_job.approval_status == "APPROVED"
    assert updated_job.approved_by == admin_account.account_id
    assert updated_job.approved_at is not None
    assert updated_job.rejection_reason is None

    # Kiểm tra thông báo được lưu vào bảng other_notifications
    notif = db_session.get(OtherNotification, data["notification_id"])
    assert notif is not None
    assert notif.account_id == recruiter_account.account_id
    assert notif.notification_type == "JOB_APPROVAL_STATUS"
    assert "phê duyệt" in notif.title.lower()
    assert pending_job.title in notif.message
    assert notif.is_read is False


def test_admin_rejects_job_post_success(client, admin_auth, recruiter_info, pending_job, db_session):
    """Kiểm thử Admin từ chối tin tuyển dụng kèm lý do và gửi thông báo tới nhà tuyển dụng."""
    admin_headers, admin_account = admin_auth
    _, recruiter_account, _ = recruiter_info
    reason = "Mô tả công việc thiếu thông tin chi tiết về các chế độ đãi ngộ bắt buộc."

    res = client.patch(
        f"/api/v1/jobs/{pending_job.job_post_id}/moderation",
        headers=admin_headers,
        json={"approval_status": "REJECTED", "rejection_reason": reason},
    )
    assert res.status_code == 200
    data = res.json()

    assert data["job_id"] == str(pending_job.job_post_id)
    assert data["approval_status"] == "REJECTED"
    assert data["approved_by"] == str(admin_account.account_id)
    assert data["rejection_reason"] == reason
    assert data["notification_id"] is not None

    # Kiểm tra bản ghi trong bảng job_posts
    db_session.expire_all()
    updated_job = db_session.get(JobPost, pending_job.job_post_id)
    assert updated_job.approval_status == "REJECTED"
    assert updated_job.rejection_reason == reason
    assert updated_job.approved_by == admin_account.account_id

    # Kiểm tra thông báo lưu vào other_notifications
    notif = db_session.get(OtherNotification, data["notification_id"])
    assert notif is not None
    assert notif.account_id == recruiter_account.account_id
    assert notif.notification_type == "JOB_APPROVAL_STATUS"
    assert "từ chối" in notif.title.lower()
    assert reason in notif.message
    assert notif.is_read is False


def test_admin_rejects_without_reason_fails(client, admin_auth, pending_job):
    """Kiểm thử từ chối bài đăng nhưng không cung cấp lý do -> Lỗi 422 Unprocessable Entity."""
    admin_headers, _ = admin_auth

    res = client.patch(
        f"/api/v1/jobs/{pending_job.job_post_id}/moderation",
        headers=admin_headers,
        json={"approval_status": "REJECTED", "rejection_reason": ""},
    )
    assert res.status_code == 422
    assert "lý do từ chối" in res.json()["detail"].lower()


def test_moderation_invalid_approval_status_fails(client, admin_auth, pending_job):
    """Kiểm thử trạng thái kiểm duyệt không hợp lệ -> 422 Unprocessable Entity."""
    admin_headers, _ = admin_auth

    res = client.patch(
        f"/api/v1/jobs/{pending_job.job_post_id}/moderation",
        headers=admin_headers,
        json={"approval_status": "INVALID_STATUS"},
    )
    assert res.status_code == 422


def test_moderation_nonexistent_job_fails(client, admin_auth):
    """Kiểm thử kiểm duyệt bài đăng không tồn tại -> 404 Not Found."""
    admin_headers, _ = admin_auth
    fake_uuid = uuid.uuid4()

    res = client.patch(
        f"/api/v1/jobs/{fake_uuid}/moderation",
        headers=admin_headers,
        json={"approval_status": "APPROVED"},
    )
    assert res.status_code == 404


def test_moderation_forbidden_for_non_admin(client, recruiter_info, candidate_headers, pending_job):
    """Kiểm thử nhà tuyển dụng và ứng viên không được phép kiểm duyệt bài đăng (403 Forbidden)."""
    recruiter_headers, _, _ = recruiter_info

    # Recruiter cố tình duyệt bài
    res_rec = client.patch(
        f"/api/v1/jobs/{pending_job.job_post_id}/moderation",
        headers=recruiter_headers,
        json={"approval_status": "APPROVED"},
    )
    assert res_rec.status_code == 403

    # Candidate cố tình duyệt bài
    res_cand = client.patch(
        f"/api/v1/jobs/{pending_job.job_post_id}/moderation",
        headers=candidate_headers,
        json={"approval_status": "APPROVED"},
    )
    assert res_cand.status_code == 403


def test_moderation_unauthorized(client, pending_job):
    """Kiểm thử không có token xác thực -> 401 Unauthorized."""
    res = client.patch(
        f"/api/v1/jobs/{pending_job.job_post_id}/moderation",
        json={"approval_status": "APPROVED"},
    )
    assert res.status_code == 401


def test_admin_get_pending_jobs(client, admin_auth, candidate_headers, pending_job):
    """Kiểm thử Admin xem danh sách tin tuyển dụng chờ kiểm duyệt (GET /jobs/moderation/pending)."""
    admin_headers, _ = admin_auth

    # Admin lấy danh sách tin chờ duyệt
    res = client.get("/api/v1/jobs/moderation/pending", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1
    job_ids = [item["job_post_id"] for item in data["items"]]
    assert str(pending_job.job_post_id) in job_ids

    # Candidate không có quyền xem
    res_cand = client.get("/api/v1/jobs/moderation/pending", headers=candidate_headers)
    assert res_cand.status_code == 403


def test_recruiter_reads_notification(client, admin_auth, recruiter_info, pending_job):
    """Kiểm thử nhà tuyển dụng xem danh sách thông báo và đánh dấu đã đọc."""
    admin_headers, _ = admin_auth
    recruiter_headers, _, _ = recruiter_info

    # 1. Admin duyệt tin -> tạo thông báo
    res_mod = client.patch(
        f"/api/v1/jobs/{pending_job.job_post_id}/moderation",
        headers=admin_headers,
        json={"approval_status": "APPROVED"},
    )
    notif_id = res_mod.json()["notification_id"]

    # 2. Recruiter gọi GET /notifications
    res_notif = client.get("/api/v1/notifications", headers=recruiter_headers)
    assert res_notif.status_code == 200
    notifs = res_notif.json()["other_notifications"]
    target = next((n for n in notifs if n["notification_id"] == notif_id), None)
    assert target is not None
    assert target["is_read"] is False

    # 3. Recruiter đánh dấu đã đọc
    res_read = client.patch(f"/api/v1/notifications/{notif_id}/read", headers=recruiter_headers)
    assert res_read.status_code == 200
    assert res_read.json()["success"] is True
    assert res_read.json()["is_read"] is True

