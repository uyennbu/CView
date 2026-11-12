"""Unit tests for Activity & System Error logging utilities and constraint checks."""

import uuid

from datetime import datetime, timedelta, timezone
import pytest
from sqlalchemy import select

from app.core.database import SessionLocal
from app.middlewares import (
    VALID_ACTION_TYPES,
    VALID_SEVERITIES,
    VALID_TARGET_ENTITIES,
    log_activity,
    log_system_error,
)
from app.models.system import Account, ActivityLog, SessionRecord, SystemErrorLog


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


def test_categories_match_database_check_constraints():
    """Kiểm tra danh mục action_type, target_entity, severity khớp 100% với DDL CSDL."""
    expected_actions = {
        "UPLOAD_RESUME",
        "ANALYZE_CV",
        "VIEW_JOB",
        "SEARCH_JOB",
        "SAVE_JOB",
        "APPLY_JOB",
        "CREATE_JOB_POST",
        "APPROVE_JOB_POST",
        "REJECT_JOB_POST",
    }
    assert VALID_ACTION_TYPES == expected_actions

    expected_entities = {
        "RESUME",
        "JOB_POST",
        "CV_ANALYSIS",
        "ACCOUNT",
        "APPLICATION",
    }
    assert VALID_TARGET_ENTITIES == expected_entities

    expected_severities = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
    assert VALID_SEVERITIES == expected_severities


def test_log_activity_direct(db_session, test_session_record):
    """Kiểm thử ghi nhận trực tiếp vào bảng activity_logs bằng hàm log_activity."""
    log_entry = log_activity(
        sessions_id=test_session_record.session_id,
        action_type="SEARCH_JOB",
        target_entity="JOB_POST",
        target_id=None,
        details={"keyword": "Python Backend", "city": "TP.HCM"},
        db=db_session,
    )
    assert log_entry is not None
    assert log_entry.activity_id is not None
    assert log_entry.sessions_id == test_session_record.session_id
    assert log_entry.action_type == "SEARCH_JOB"
    assert log_entry.target_entity == "JOB_POST"
    assert log_entry.details["keyword"] == "Python Backend"

    # Kiểm tra ràng buộc action_type không hợp lệ -> từ chối ghi
    invalid_action = log_activity(
        sessions_id=test_session_record.session_id,
        action_type="NON_EXISTENT_ACTION",
        target_entity="JOB_POST",
        db=db_session,
    )
    assert invalid_action is None

    # Kiểm tra ràng buộc target_entity không hợp lệ -> từ chối ghi
    invalid_entity = log_activity(
        sessions_id=test_session_record.session_id,
        action_type="VIEW_JOB",
        target_entity="NON_EXISTENT_ENTITY",
        db=db_session,
    )
    assert invalid_entity is None

    # Kiểm tra sessions_id không phải UUID -> từ chối ghi
    invalid_uuid = log_activity(
        sessions_id="invalid-uuid-string",
        action_type="VIEW_JOB",
        target_entity="JOB_POST",
        db=db_session,
    )
    assert invalid_uuid is None


def test_log_system_error_direct(db_session):
    """Kiểm thử ghi nhận trực tiếp vào bảng system_error_logs bằng hàm log_system_error."""
    err_entry = log_system_error(
        service_name="ai-matching-engine",
        severity="CRITICAL",
        error_code="ERR_DB_DEADLOCK",
        message="Deadlock detected during batch update",
        stack_trace="Traceback (most recent call last):\n  line 1 in run",
        db=db_session,
    )
    assert err_entry is not None
    assert err_entry.error_id is not None
    assert err_entry.service_name == "ai-matching-engine"
    assert err_entry.severity == "CRITICAL"
    assert err_entry.error_code == "ERR_DB_DEADLOCK"
    assert "Deadlock" in err_entry.message

    # Kiểm tra fallback severity khi nhập giá trị không nằm trong danh mục CHECK
    fallback_entry = log_system_error(
        service_name="pdf-parser",
        severity="INVALID_SEVERITY",
        error_code="ERR_PARSE_TIMEOUT",
        message="Timeout after 30 seconds",
        db=db_session,
    )
    assert fallback_entry is not None
    assert fallback_entry.severity == "ERROR"  # Tự động chuẩn hóa về ERROR

