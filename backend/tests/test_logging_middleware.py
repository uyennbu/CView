"""Integration tests for Activity & System Error Logging Middleware."""

from datetime import datetime, timedelta, timezone
import uuid

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
import pytest
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.main import app
from app.middlewares import record_activity
from app.models.system import Account, ActivityLog, SessionRecord, SystemErrorLog

mock_router = APIRouter(prefix="/api/v1/test", tags=["Test Routes"])


@mock_router.get("/crash")
def trigger_crash():
    """Giả lập unhandled exception 500."""
    raise ValueError("Lỗi giả lập unhandled exception để kiểm thử system_error_logs")


@mock_router.get("/error-503")
def trigger_503():
    """Giả lập lỗi HTTP 503."""
    return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"detail": "Service Unavailable"})


@mock_router.get("/decorated/{item_id}")
@record_activity(action_type="VIEW_JOB", target_entity="JOB_POST", target_id_param="item_id")
def decorated_endpoint(item_id: str, request: Request):
    """Endpoint sử dụng @record_activity decorator."""
    return {"item_id": item_id, "status": "ok"}


app.include_router(mock_router)


@pytest.fixture(scope="module")
def db_session():
    """Fixture cung cấp SQLAlchemy Session kết nối tới CSDL cview_db."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def test_session_record(db_session):
    """Đảm bảo có một session hợp lệ trong bảng `sessions` để liên kết FK sessions_id."""
    session_record = db_session.scalar(select(SessionRecord).where(SessionRecord.is_revoked == False))
    if not session_record:
        account = db_session.scalar(select(Account))
        if not account:
            account = Account(
                username=f"test_user_{uuid.uuid4().hex[:8]}",
                email=f"test_{uuid.uuid4().hex[:8]}@example.com",
                password_hash="mock_hash",
                status="ACTIVE",
            )
            db_session.add(account)
            db_session.flush()

        session_record = SessionRecord(
            account_id=account.account_id,
            refresh_token_hash=uuid.uuid4().hex,
            ip_address="127.0.0.1",
            user_agent="pytest-client",
            is_revoked=False,
            expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        )
        db_session.add(session_record)
        db_session.commit()
        db_session.refresh(session_record)

    return session_record


@pytest.fixture(scope="module")
def auth_headers(test_session_record):
    """Tạo Bearer token hợp lệ mang session_id."""
    token = create_access_token(
        subject=str(test_session_record.account_id),
        roles=["ADMIN", "CANDIDATE", "RECRUITER"],
        extra_claims={"session_id": str(test_session_record.session_id)},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def client():
    """FastAPI TestClient."""
    return TestClient(app)


def test_middleware_auto_activity_logging_jobs_search(client, auth_headers, db_session, test_session_record):
    """Kiểm thử Middleware tự động ghi log SEARCH_JOB khi người dùng gọi API tìm kiếm."""
    unique_keyword = f"kw_{uuid.uuid4().hex[:6]}"
    res = client.get(
        f"/api/v1/jobs/search?keyword={unique_keyword}&city=Hanoi",
        headers=auth_headers,
    )
    assert res.status_code == 200

    log = db_session.scalar(
        select(ActivityLog)
        .where(
            ActivityLog.sessions_id == test_session_record.session_id,
            ActivityLog.action_type == "SEARCH_JOB",
        )
        .order_by(ActivityLog.activity_id.desc())
    )
    assert log is not None
    assert log.target_entity == "JOB_POST"
    assert log.details["method"] == "GET"
    assert log.details["query_params"]["keyword"] == unique_keyword
    assert log.details["status_code"] == 200
    assert "duration_ms" in log.details


def test_middleware_auto_activity_logging_create_job(client, auth_headers, db_session, test_session_record):
    """Kiểm thử Middleware tự động ghi log CREATE_JOB_POST."""
    res = client.post("/api/v1/jobs", headers=auth_headers)
    assert res.status_code == 201

    log = db_session.scalar(
        select(ActivityLog)
        .where(
            ActivityLog.sessions_id == test_session_record.session_id,
            ActivityLog.action_type == "CREATE_JOB_POST",
        )
        .order_by(ActivityLog.activity_id.desc())
    )
    assert log is not None
    assert log.target_entity == "JOB_POST"
    assert log.details["status_code"] == 201


def test_middleware_auto_activity_logging_view_job(client, auth_headers, db_session, test_session_record):
    """Kiểm thử Middleware tự động ghi log VIEW_JOB và trích xuất target_id."""
    job_id = f"job-{uuid.uuid4().hex[:6]}"
    res = client.get(f"/api/v1/jobs/{job_id}", headers=auth_headers)
    assert res.status_code == 200

    log = db_session.scalar(
        select(ActivityLog)
        .where(
            ActivityLog.sessions_id == test_session_record.session_id,
            ActivityLog.action_type == "VIEW_JOB",
            ActivityLog.target_id == job_id,
        )
        .order_by(ActivityLog.activity_id.desc())
    )
    assert log is not None
    assert log.target_entity == "JOB_POST"
    assert log.target_id == job_id


def test_middleware_auto_activity_logging_save_job(client, auth_headers, db_session, test_session_record):
    """Kiểm thử Middleware tự động ghi log SAVE_JOB."""
    job_id = f"job-{uuid.uuid4().hex[:6]}"
    res = client.post(f"/api/v1/jobs/{job_id}/save", headers=auth_headers)
    assert res.status_code == 200

    log = db_session.scalar(
        select(ActivityLog)
        .where(
            ActivityLog.sessions_id == test_session_record.session_id,
            ActivityLog.action_type == "SAVE_JOB",
            ActivityLog.target_id == job_id,
        )
        .order_by(ActivityLog.activity_id.desc())
    )
    assert log is not None
    assert log.target_entity == "JOB_POST"


def test_middleware_auto_activity_logging_apply_job(client, auth_headers, db_session, test_session_record):
    """Kiểm thử Middleware tự động ghi log APPLY_JOB vào target_entity APPLICATION."""
    job_id = f"job-{uuid.uuid4().hex[:6]}"
    res = client.post(f"/api/v1/jobs/{job_id}/apply", headers=auth_headers)
    assert res.status_code == 201

    log = db_session.scalar(
        select(ActivityLog)
        .where(
            ActivityLog.sessions_id == test_session_record.session_id,
            ActivityLog.action_type == "APPLY_JOB",
            ActivityLog.target_id == job_id,
        )
        .order_by(ActivityLog.activity_id.desc())
    )
    assert log is not None
    assert log.target_entity == "APPLICATION"


def test_middleware_auto_activity_logging_moderation_reject_and_approve(
    client, auth_headers, db_session, test_session_record
):
    """Kiểm thử Middleware ghi log APPROVE_JOB_POST và REJECT_JOB_POST."""
    job_id = f"job-{uuid.uuid4().hex[:6]}"

    # 1. Từ chối kiểm duyệt -> REJECT_JOB_POST
    res_reject = client.patch(
        f"/api/v1/jobs/{job_id}/moderation",
        headers=auth_headers,
        json={"approval_status": "REJECTED", "rejection_reason": "Vi phạm quy định mô tả"},
    )
    assert res_reject.status_code == 200

    log_reject = db_session.scalar(
        select(ActivityLog)
        .where(
            ActivityLog.sessions_id == test_session_record.session_id,
            ActivityLog.action_type == "REJECT_JOB_POST",
            ActivityLog.target_id == job_id,
        )
        .order_by(ActivityLog.activity_id.desc())
    )
    assert log_reject is not None
    assert log_reject.target_entity == "JOB_POST"
    assert log_reject.details["approval_status"] == "REJECTED"

    # 2. Phê duyệt kiểm duyệt -> APPROVE_JOB_POST
    res_approve = client.patch(
        f"/api/v1/jobs/{job_id}/moderation",
        headers=auth_headers,
        json={"approval_status": "APPROVED"},
    )
    assert res_approve.status_code == 200

    log_approve = db_session.scalar(
        select(ActivityLog)
        .where(
            ActivityLog.sessions_id == test_session_record.session_id,
            ActivityLog.action_type == "APPROVE_JOB_POST",
            ActivityLog.target_id == job_id,
        )
        .order_by(ActivityLog.activity_id.desc())
    )
    assert log_approve is not None
    assert log_approve.target_entity == "JOB_POST"


def test_middleware_auto_activity_logging_resumes(client, auth_headers, db_session, test_session_record):
    """Kiểm thử Middleware tự động ghi log UPLOAD_RESUME và ANALYZE_CV."""
    # 1. Tải CV lên -> UPLOAD_RESUME
    res_upload = client.post("/api/v1/resumes/upload", headers=auth_headers)
    assert res_upload.status_code == 201

    log_upload = db_session.scalar(
        select(ActivityLog)
        .where(
            ActivityLog.sessions_id == test_session_record.session_id,
            ActivityLog.action_type == "UPLOAD_RESUME",
        )
        .order_by(ActivityLog.activity_id.desc())
    )
    assert log_upload is not None
    assert log_upload.target_entity == "RESUME"

    # 2. Phân tích CV -> ANALYZE_CV
    res_analyze = client.post("/api/v1/resumes/analyze", headers=auth_headers)
    assert res_analyze.status_code == 200

    log_analyze = db_session.scalar(
        select(ActivityLog)
        .where(
            ActivityLog.sessions_id == test_session_record.session_id,
            ActivityLog.action_type == "ANALYZE_CV",
        )
        .order_by(ActivityLog.activity_id.desc())
    )
    assert log_analyze is not None
    assert log_analyze.target_entity == "CV_ANALYSIS"


def test_middleware_unauthenticated_requests_do_not_violate_fk(client, db_session):
    """Kiểm thử: Request không có phiên xác thực (khách vãng lai) không làm sập ứng dụng và không vi phạm ràng buộc FK sessions_id."""
    count_before = db_session.scalar(select(ActivityLog).where(ActivityLog.action_type == "SEARCH_JOB"))

    res = client.get("/api/v1/jobs/search?keyword=guest")
    assert res.status_code == 200

    count_after = db_session.scalar(select(ActivityLog).where(ActivityLog.action_type == "SEARCH_JOB"))
    assert res.json()["keyword"] == "guest"


def test_middleware_captures_unhandled_exception(client, db_session):
    """Kiểm thử Middleware bắt unhandled exception, ghi vào system_error_logs và trả về HTTP 500 JSON."""
    res = client.get("/api/v1/test/crash")
    assert res.status_code == 500
    assert res.json() == {"detail": "Đã xảy ra lỗi hệ thống nội bộ."}

    err_log = db_session.scalar(
        select(SystemErrorLog)
        .where(SystemErrorLog.error_code == "ValueError")
        .order_by(SystemErrorLog.error_id.desc())
    )
    assert err_log is not None
    assert err_log.severity == "ERROR"
    assert "Lỗi giả lập unhandled exception" in err_log.message
    assert "Traceback" in err_log.stack_trace


def test_middleware_captures_http_5xx_status(client, db_session):
    """Kiểm thử Middleware bắt phản hồi HTTP 5xx trả về từ backend và ghi vào system_error_logs."""
    res = client.get("/api/v1/test/error-503")
    assert res.status_code == 503

    err_log = db_session.scalar(
        select(SystemErrorLog)
        .where(SystemErrorLog.error_code == "ERR_HTTP_503")
        .order_by(SystemErrorLog.error_id.desc())
    )
    assert err_log is not None
    assert err_log.severity == "ERROR"
    assert "503" in err_log.message


def test_record_activity_decorator(client, auth_headers, db_session, test_session_record):
    """Kiểm thử decorator @record_activity trên route độc lập."""
    target_id = f"item-{uuid.uuid4().hex[:6]}"
    res = client.get(f"/api/v1/test/decorated/{target_id}", headers=auth_headers)
    assert res.status_code == 200

    log = db_session.scalar(
        select(ActivityLog)
        .where(
            ActivityLog.sessions_id == test_session_record.session_id,
            ActivityLog.action_type == "VIEW_JOB",
            ActivityLog.target_id == target_id,
        )
        .order_by(ActivityLog.activity_id.desc())
    )
    assert log is not None
    assert log.target_entity == "JOB_POST"
    assert log.target_id == target_id
