"""Unit and integration tests for Notifications API (job_notifications and other_notifications)."""

from datetime import datetime, timedelta, timezone
import uuid

import pytest
from sqlalchemy import select

from app.core.security import create_access_token
from app.models.business import (
    Address,
    CandidateProfile,
    Company,
    JobNotification,
    JobPost,
    RecruiterProfile,
    SearchHistory,
)
from app.models.system import Account, OtherNotification


@pytest.fixture
def admin_user(db_session):
    """Fixture tạo tài khoản Admin và token xác thực."""
    account = db_session.scalar(select(Account).where(Account.username == "admin_notif_test"))
    if not account:
        account = Account(
            username=f"admin_notif_{uuid.uuid4().hex[:6]}",
            email=f"admin_{uuid.uuid4().hex[:6]}@cview.vn",
            password_hash="mock_hash",
            status="ACTIVE",
        )
        db_session.add(account)
        db_session.commit()
        db_session.refresh(account)

    token = create_access_token(subject=str(account.account_id), roles=["ADMIN"])
    return {"Authorization": f"Bearer {token}"}, account


@pytest.fixture
def candidate_user(db_session):
    """Fixture tạo tài khoản Candidate kèm CandidateProfile."""
    account = Account(
        username=f"cand_notif_{uuid.uuid4().hex[:6]}",
        email=f"cand_{uuid.uuid4().hex[:6]}@example.com",
        password_hash="mock_hash",
        status="ACTIVE",
    )
    db_session.add(account)
    db_session.commit()
    db_session.refresh(account)

    candidate = CandidateProfile(
        account_id=account.account_id,
        full_name="Nguyễn Văn Test",
        current_job_title="Frontend Developer",
    )
    db_session.add(candidate)
    db_session.commit()
    db_session.refresh(candidate)

    token = create_access_token(subject=str(account.account_id), roles=["CANDIDATE"])
    return {"Authorization": f"Bearer {token}"}, account, candidate


@pytest.fixture
def sample_job_post(db_session):
    """Fixture tạo công ty, recruiter và tin tuyển dụng mẫu."""
    address = Address(
        street_address="123 Cầu Giấy",
        city="Hà Nội",
        country="Việt Nam",
    )
    db_session.add(address)
    db_session.flush()

    company = Company(
        name=f"Công ty Thông Báo {uuid.uuid4().hex[:4]}",
        address_id=address.address_id,
        tax_code=f"{uuid.uuid4().int % 10000000000:010d}",
        industry="Công nghệ phần mềm",
        verification_status="VERIFIED",
    )
    db_session.add(company)
    db_session.flush()

    rec_account = Account(
        username=f"rec_notif_{uuid.uuid4().hex[:6]}",
        email=f"rec_{uuid.uuid4().hex[:6]}@example.com",
        password_hash="mock_hash",
        status="ACTIVE",
    )
    db_session.add(rec_account)
    db_session.flush()

    recruiter = RecruiterProfile(
        account_id=rec_account.account_id,
        company_id=company.company_id,
        full_name="Trần Tuyển Dụng",
        job_title="HR Manager",
        work_email=f"hr_{uuid.uuid4().hex[:6]}@notiftest.vn",
    )
    db_session.add(recruiter)
    db_session.commit()
    db_session.refresh(recruiter)

    job = JobPost(
        recruiter_id=recruiter.recruiter_id,
        company_id=company.company_id,
        title="Lập trình viên ReactJS Fullstack",
        position="Senior Developer",
        job_type="FULL_TIME",
        workplace_type="HYBRID",
        job_description="Phát triển hệ thống web hiện đại",
        requirements="3+ năm kinh nghiệm React, TypeScript",
        approval_status="PENDING",
        deadline=datetime.now(timezone.utc) + timedelta(days=30),
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)
    return job


def test_list_notifications_empty(client, candidate_user):
    """Kiểm thử khi người dùng chưa có thông báo nào."""
    headers, _, _ = candidate_user
    res = client.get("/api/v1/notifications", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["job_notifications"] == []
    assert data["other_notifications"] == []
    assert data["total_unread"] == 0


def test_admin_create_other_notification(client, admin_user, candidate_user):
    """Kiểm thử Admin tạo thông báo hệ thống cho người dùng."""
    admin_headers, _ = admin_user
    _, cand_account, _ = candidate_user

    payload = {
        "account_id": str(cand_account.account_id),
        "notification_type": "SYSTEM_ANNOUNCEMENT",
        "title": "Bảo trì hệ thống",
        "message": "Hệ thống CView sẽ bảo trì lúc 00:00 ngày mai.",
    }
    res = client.post("/api/v1/notifications/other", headers=admin_headers, json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Bảo trì hệ thống"
    assert data["notification_type"] == "SYSTEM_ANNOUNCEMENT"
    assert data["is_read"] is False


def test_admin_create_job_notification(client, admin_user, candidate_user, sample_job_post):
    """Kiểm thử Admin tạo thông báo việc làm cho ứng viên."""
    admin_headers, _ = admin_user
    _, _, candidate = candidate_user

    payload = {
        "candidate_id": str(candidate.candidate_id),
        "job_post_id": str(sample_job_post.job_post_id),
        "title": "Việc làm ReactJS phù hợp",
        "content": "Có một công việc ReactJS mới phù hợp với bạn.",
    }
    res = client.post("/api/v1/notifications/job", headers=admin_headers, json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Việc làm ReactJS phù hợp"
    assert data["candidate_id"] == str(candidate.candidate_id)
    assert data["is_read"] is False


def test_candidate_receives_and_reads_notifications(
    client, db_session, admin_user, candidate_user, sample_job_post
):
    """Kiểm thử luồng Ứng viên nhận danh sách, kiểm tra unread count, và đánh dấu đọc."""
    cand_headers, cand_account, candidate = candidate_user

    # Tạo 1 other_notification
    other_notif = OtherNotification(
        account_id=cand_account.account_id,
        notification_type="APPLICATION_UPDATE",
        title="Hồ sơ đã được gửi",
        message="Nhà tuyển dụng đã xem hồ sơ của bạn",
        is_read=False,
    )
    # Tạo 1 job_notification
    job_notif = JobNotification(
        candidate_id=candidate.candidate_id,
        job_post_id=sample_job_post.job_post_id,
        title="Gợi ý việc làm React",
        content="Vị trí mới phù hợp",
        is_read=False,
    )
    db_session.add_all([other_notif, job_notif])
    db_session.commit()
    db_session.refresh(other_notif)
    db_session.refresh(job_notif)

    # 1. Kiểm tra unread count
    res_count = client.get("/api/v1/notifications/unread-count", headers=cand_headers)
    assert res_count.status_code == 200
    count_data = res_count.json()
    assert count_data["unread_other_count"] >= 1
    assert count_data["unread_job_count"] >= 1
    assert count_data["total_unread"] >= 2

    # 2. Lấy danh sách notifications
    res_list = client.get("/api/v1/notifications", headers=cand_headers)
    assert res_list.status_code == 200
    list_data = res_list.json()
    assert len(list_data["job_notifications"]) >= 1
    assert len(list_data["other_notifications"]) >= 1

    # 3. Đánh dấu đã đọc cho job_notification
    res_read_job = client.patch(
        f"/api/v1/notifications/{job_notif.notification_id}/read",
        headers=cand_headers,
    )
    assert res_read_job.status_code == 200
    assert res_read_job.json()["success"] is True
    assert res_read_job.json()["is_read"] is True

    # 4. Đánh dấu đã đọc cho other_notification
    res_read_other = client.patch(
        f"/api/v1/notifications/{other_notif.notification_id}/read",
        headers=cand_headers,
    )
    assert res_read_other.status_code == 200
    assert res_read_other.json()["success"] is True

    # 5. Xóa thông báo
    res_del = client.delete(
        f"/api/v1/notifications/{other_notif.notification_id}",
        headers=cand_headers,
    )
    assert res_del.status_code == 200
    assert res_del.json()["success"] is True


def test_mark_all_notifications_read(client, db_session, candidate_user, sample_job_post):
    """Kiểm thử đánh dấu đã đọc tất cả thông báo cùng một lúc."""
    cand_headers, cand_account, candidate = candidate_user

    notif1 = OtherNotification(
        account_id=cand_account.account_id,
        notification_type="SYSTEM_ANNOUNCEMENT",
        title="Thông báo 1",
        message="Nội dung 1",
        is_read=False,
    )
    notif2 = JobNotification(
        candidate_id=candidate.candidate_id,
        job_post_id=sample_job_post.job_post_id,
        title="Gợi ý việc 2",
        content="Nội dung 2",
        is_read=False,
    )
    db_session.add_all([notif1, notif2])
    db_session.commit()

    res = client.patch("/api/v1/notifications/read-all", headers=cand_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["updated_count"] >= 2


def test_auto_generate_job_notifications_on_approval(
    client, db_session, admin_user, candidate_user, sample_job_post
):
    """Kiểm thử khi Admin duyệt tin tuyển dụng, hệ thống tự động sinh thông báo cho ứng viên tìm kiếm phù hợp."""
    admin_headers, _ = admin_user
    cand_headers, _, candidate = candidate_user

    # Tạo lịch sử tìm kiếm cho ứng viên với từ khóa trùng với tin tuyển dụng ("ReactJS")
    history = SearchHistory(
        candidate_id=candidate.candidate_id,
        keyword="ReactJS",
        results_count=1,
    )
    db_session.add(history)
    db_session.commit()

    # Admin duyệt tin
    res_mod = client.patch(
        f"/api/v1/jobs/{sample_job_post.job_post_id}/moderation",
        headers=admin_headers,
        json={"approval_status": "APPROVED"},
    )
    assert res_mod.status_code == 200

    # Ứng viên kiểm tra danh sách thông báo việc làm
    res_notif = client.get("/api/v1/notifications", headers=cand_headers)
    assert res_notif.status_code == 200
    jobs_notifs = res_notif.json()["job_notifications"]
    matched = [jn for jn in jobs_notifs if jn["job_post_id"] == str(sample_job_post.job_post_id)]
    assert len(matched) == 1
    assert "ReactJS" in matched[0]["title"]


def test_list_notifications_pagination_and_filtering(
    client, db_session, candidate_user, sample_job_post
):
    """Kiểm thử toàn diện API GET /notifications: phân trang, lọc theo loại, lọc chưa đọc/đã đọc."""
    cand_headers, cand_account, candidate = candidate_user

    # Tạo 2 other_notifications: 1 đã đọc, 1 chưa đọc
    on_read = OtherNotification(
        account_id=cand_account.account_id,
        notification_type="SYSTEM_ANNOUNCEMENT",
        title="Thông báo hệ thống đã đọc",
        message="Hệ thống đã nâng cấp phiên bản mới",
        is_read=True,
    )
    on_unread = OtherNotification(
        account_id=cand_account.account_id,
        notification_type="ACCOUNT_SECURITY",
        title="Cảnh báo bảo mật",
        message="Phát hiện đăng nhập mới",
        is_read=False,
    )
    # Tạo 2 job_notifications: 1 đã đọc, 1 chưa đọc
    jn_read = JobNotification(
        candidate_id=candidate.candidate_id,
        job_post_id=sample_job_post.job_post_id,
        title="Job đã đọc",
        content="Nội dung job đã đọc",
        is_read=True,
    )
    jn_unread = JobNotification(
        candidate_id=candidate.candidate_id,
        job_post_id=sample_job_post.job_post_id,
        title="Job chưa đọc",
        content="Nội dung job chưa đọc",
        is_read=False,
    )
    db_session.add_all([on_read, on_unread, jn_read, jn_unread])
    db_session.commit()

    # 1. Lọc chưa đọc (is_read=false)
    res_unread = client.get("/api/v1/notifications?is_read=false", headers=cand_headers)
    assert res_unread.status_code == 200
    data_unread = res_unread.json()
    assert all(not j["is_read"] for j in data_unread["job_notifications"])
    assert all(not o["is_read"] for o in data_unread["other_notifications"])
    assert data_unread["total"] == 2

    # 2. Lọc đã đọc (is_read=true)
    res_read = client.get("/api/v1/notifications?is_read=true", headers=cand_headers)
    assert res_read.status_code == 200
    data_read = res_read.json()
    assert all(j["is_read"] for j in data_read["job_notifications"])
    assert all(o["is_read"] for o in data_read["other_notifications"])
    assert data_read["total"] == 2

    # 3. Lọc theo loại việc làm (type=JOB)
    res_job_type = client.get("/api/v1/notifications?type=JOB", headers=cand_headers)
    assert res_job_type.status_code == 200
    data_job_type = res_job_type.json()
    assert len(data_job_type["job_notifications"]) == 2
    assert len(data_job_type["other_notifications"]) == 0
    assert data_job_type["total"] == 2

    # 4. Lọc theo loại hệ thống (type=SYSTEM)
    res_sys_type = client.get("/api/v1/notifications?type=SYSTEM", headers=cand_headers)
    assert res_sys_type.status_code == 200
    data_sys_type = res_sys_type.json()
    assert len(data_sys_type["job_notifications"]) == 0
    assert len(data_sys_type["other_notifications"]) == 2
    assert data_sys_type["total"] == 2

    # 5. Lọc theo mã loại chi tiết (type=ACCOUNT_SECURITY)
    res_detail_type = client.get(
        "/api/v1/notifications?type=ACCOUNT_SECURITY", headers=cand_headers
    )
    assert res_detail_type.status_code == 200
    data_detail_type = res_detail_type.json()
    assert len(data_detail_type["job_notifications"]) == 0
    assert len(data_detail_type["other_notifications"]) == 1
    assert data_detail_type["other_notifications"][0]["notification_type"] == "ACCOUNT_SECURITY"

    # 6. Kiểm tra phân trang (page=1, limit=1)
    res_page1 = client.get(
        "/api/v1/notifications?type=JOB&page=1&limit=1", headers=cand_headers
    )
    assert res_page1.status_code == 200
    p1_data = res_page1.json()
    assert len(p1_data["job_notifications"]) == 1
    assert p1_data["page"] == 1
    assert p1_data["limit"] == 1
    assert p1_data["total"] == 2
    assert p1_data["total_pages"] == 2

    res_page2 = client.get(
        "/api/v1/notifications?type=JOB&page=2&limit=1", headers=cand_headers
    )
    assert res_page2.status_code == 200
    p2_data = res_page2.json()
    assert len(p2_data["job_notifications"]) == 1
    assert p2_data["page"] == 2
    assert p1_data["job_notifications"][0]["notification_id"] != p2_data["job_notifications"][0]["notification_id"]


def test_mark_notification_read_endpoints(client, db_session, candidate_user, admin_user, sample_job_post):
    """Kiểm thử chi tiết API PATCH /notifications/{notification_id}/read."""
    cand_headers, cand_account, candidate = candidate_user
    admin_headers, admin_account = admin_user

    # 1. Tạo 1 job_notification và 1 other_notification chưa đọc
    job_notif = JobNotification(
        candidate_id=candidate.candidate_id,
        job_post_id=sample_job_post.job_post_id,
        title="Thông báo tuyển dụng chưa đọc",
        content="Chi tiết vị trí mới",
        is_read=False,
    )
    other_notif = OtherNotification(
        account_id=cand_account.account_id,
        notification_type="SYSTEM_ANNOUNCEMENT",
        title="Thông báo hệ thống chưa đọc",
        message="Bảo trì vào cuối tuần",
        is_read=False,
    )
    db_session.add_all([job_notif, other_notif])
    db_session.commit()
    db_session.refresh(job_notif)
    db_session.refresh(other_notif)

    # 2. Đánh dấu đọc job_notification kèm query param type=JOB
    res_job = client.patch(
        f"/api/v1/notifications/{job_notif.notification_id}/read?type=JOB",
        headers=cand_headers,
    )
    assert res_job.status_code == 200
    job_data = res_job.json()
    assert job_data["success"] is True
    assert job_data["is_read"] is True
    assert job_data["notification_type"] == "JOB"
    assert job_data["read_at"] is not None

    # 3. Đánh dấu đọc other_notification kèm query param type=SYSTEM
    res_other = client.patch(
        f"/api/v1/notifications/{other_notif.notification_id}/read?type=SYSTEM",
        headers=cand_headers,
    )
    assert res_other.status_code == 200
    other_data = res_other.json()
    assert other_data["success"] is True
    assert other_data["is_read"] is True
    assert other_data["notification_type"] == "SYSTEM_ANNOUNCEMENT"
    assert other_data["read_at"] is not None

    # 4. Đánh dấu đọc lại thông báo đã đọc (idempotent, giữ nguyên read_at)
    first_read_at = other_data["read_at"]
    res_re_read = client.patch(
        f"/api/v1/notifications/{other_notif.notification_id}/read",
        headers=cand_headers,
    )
    assert res_re_read.status_code == 200
    assert res_re_read.json()["read_at"] == first_read_at

    # 5. ID không tồn tại -> 404 Not Found
    res_404 = client.patch(
        "/api/v1/notifications/99999999/read",
        headers=cand_headers,
    )
    assert res_404.status_code == 404

    # 6. Người dùng khác cố tình đọc thông báo không thuộc quyền sở hữu -> 404 Not Found
    res_forbidden = client.patch(
        f"/api/v1/notifications/{other_notif.notification_id}/read",
        headers=admin_headers,
    )
    assert res_forbidden.status_code == 404


