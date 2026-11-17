"""Tiện ích ghi nhật ký kiểm toán (activity_logs) và lỗi hệ thống (system_error_logs).

Tuân thủ thiết kế Database tại docs/DESIGN.md:
- Bảng 8: activity_logs (action_type, target_entity, target_id, details JSONB gắn với sessions_id)
- Bảng 9: system_error_logs (service_name, severity, error_code, message, stack_trace)
"""

from functools import wraps
import logging
import re
from typing import Any, Callable, Dict, Optional, Tuple
import uuid

from fastapi import Request
import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.system import ActivityLog, SystemErrorLog

logger = logging.getLogger(__name__)

# Danh mục miền giá trị chuẩn theo ràng buộc CHECK trong database/01_init_schema.sql
VALID_ACTION_TYPES = {
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

VALID_TARGET_ENTITIES = {
    "RESUME",
    "JOB_POST",
    "CV_ANALYSIS",
    "ACCOUNT",
    "APPLICATION",
}

VALID_SEVERITIES = {
    "DEBUG",
    "INFO",
    "WARNING",
    "ERROR",
    "CRITICAL",
}

EXCLUDED_ACTIVITY_PATHS = {
    "/",
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/favicon.ico",
}


def extract_client_info(request: Request) -> Tuple[str, Optional[str]]:
    """Trích xuất địa chỉ IP và User-Agent của client từ Request."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    elif request.client and request.client.host:
        client_ip = request.client.host
    else:
        client_ip = "127.0.0.1"
    user_agent = request.headers.get("user-agent")
    return client_ip, user_agent


def extract_session_id_from_token(token: str) -> Optional[uuid.UUID]:
    """Giải mã Bearer JWT để lấy claim session_id."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_signature": True, "verify_exp": False},
        )
        session_id_str = payload.get("session_id")
        if session_id_str:
            return uuid.UUID(str(session_id_str))
    except Exception as exc:
        logger.debug("Không thể giải mã session_id từ JWT token: %s", exc)
    return None


def log_activity(
    sessions_id: uuid.UUID | str,
    action_type: str,
    target_entity: str,
    target_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    db: Optional[Session] = None,
) -> Optional[ActivityLog]:
    """Ghi trực tiếp một bản ghi hành vi vào bảng activity_logs."""
    if action_type not in VALID_ACTION_TYPES:
        logger.warning("Bỏ qua activity_log: action_type '%s' không hợp lệ: %s", action_type, VALID_ACTION_TYPES)
        return None

    if target_entity not in VALID_TARGET_ENTITIES:
        logger.warning("Bỏ qua activity_log: target_entity '%s' không hợp lệ: %s", target_entity, VALID_TARGET_ENTITIES)
        return None

    if isinstance(sessions_id, str):
        try:
            sessions_id = uuid.UUID(sessions_id)
        except ValueError:
            logger.warning("Bỏ qua activity_log: sessions_id '%s' không phải định dạng UUID.", sessions_id)
            return None

    target_id_str = str(target_id)[:64] if target_id is not None else None

    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        activity_entry = ActivityLog(
            sessions_id=sessions_id,
            action_type=action_type,
            target_entity=target_entity,
            target_id=target_id_str,
            details=details,
        )
        db.add(activity_entry)
        db.commit()
        db.refresh(activity_entry)
        return activity_entry
    except Exception as exc:
        db.rollback()
        logger.error("Lỗi khi ghi nhận activity_log vào CSDL: %s", exc)
        return None
    finally:
        if should_close:
            db.close()


def log_system_error(
    service_name: str = "cview-backend",
    severity: str = "ERROR",
    error_code: str = "ERR_INTERNAL_SERVER",
    message: str = "An unexpected system error occurred",
    stack_trace: Optional[str] = None,
    db: Optional[Session] = None,
) -> Optional[SystemErrorLog]:
    """Ghi nhận lỗi hệ thống vào bảng system_error_logs."""
    if severity not in VALID_SEVERITIES:
        severity = "ERROR"

    service_name_clipped = (service_name or "cview-backend")[:50]
    error_code_clipped = (error_code or "ERR_UNKNOWN")[:50]
    message_text = str(message) if message else "Unknown error"

    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        error_entry = SystemErrorLog(
            service_name=service_name_clipped,
            severity=severity,
            error_code=error_code_clipped,
            message=message_text,
            stack_trace=stack_trace,
        )
        db.add(error_entry)
        db.commit()
        db.refresh(error_entry)
        return error_entry
    except Exception as exc:
        db.rollback()
        logger.error("Lỗi khi ghi nhận system_error_log vào CSDL: %s", exc)
        return None
    finally:
        if should_close:
            db.close()


def set_activity_log(
    request: Request,
    action_type: str,
    target_entity: str,
    target_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    """Helper cho các endpoints để gán thông tin kiểm toán vào request.state."""
    request.state.activity_action = action_type
    request.state.activity_entity = target_entity
    if target_id is not None:
        request.state.activity_target_id = str(target_id)
    if details is not None:
        request.state.activity_details = details


def record_activity(
    action_type: str,
    target_entity: str,
    target_id_param: Optional[str] = None,
) -> Callable:
    """Decorator để khai báo hành vi ghi log cho một endpoint FastAPI."""

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            request: Optional[Request] = kwargs.get("request")
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            if request:
                target_id = kwargs.get(target_id_param) if target_id_param else None
                set_activity_log(request, action_type, target_entity, target_id=target_id)
            return await func(*args, **kwargs)

        @wraps(func)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            request: Optional[Request] = kwargs.get("request")
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            if request:
                target_id = kwargs.get(target_id_param) if target_id_param else None
                set_activity_log(request, action_type, target_entity, target_id=target_id)
            return func(*args, **kwargs)

        import asyncio

        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper

    return decorator


def infer_activity(request: Request) -> Optional[Tuple[str, str, Optional[str]]]:
    """Tự động suy luận action_type, target_entity và target_id từ URL path và HTTP method."""
    path = request.url.path.rstrip("/")
    method = request.method.upper()

    # Nhóm việc làm: /api/v1/jobs/...
    if path == f"{settings.API_V1_PREFIX}/jobs/search" and method == "GET":
        return ("SEARCH_JOB", "JOB_POST", None)

    if path == f"{settings.API_V1_PREFIX}/jobs" and method == "POST":
        return ("CREATE_JOB_POST", "JOB_POST", None)

    m_save = re.match(rf"^{re.escape(settings.API_V1_PREFIX)}/jobs/([^/]+)/save$", path)
    if m_save and method == "POST":
        return ("SAVE_JOB", "JOB_POST", m_save.group(1))

    m_apply = re.match(rf"^{re.escape(settings.API_V1_PREFIX)}/jobs/([^/]+)/apply$", path)
    if m_apply and method == "POST":
        return ("APPLY_JOB", "APPLICATION", m_apply.group(1))

    m_mod = re.match(rf"^{re.escape(settings.API_V1_PREFIX)}/jobs/([^/]+)/moderation$", path)
    if m_mod and method in ("PATCH", "POST", "PUT"):
        return ("APPROVE_JOB_POST", "JOB_POST", m_mod.group(1))

    m_job = re.match(rf"^{re.escape(settings.API_V1_PREFIX)}/jobs/([^/]+)$", path)
    if m_job and method == "GET" and m_job.group(1) not in ("search", "feed"):
        return ("VIEW_JOB", "JOB_POST", m_job.group(1))

    # Nhóm hồ sơ CV: /api/v1/resumes/...
    if path == f"{settings.API_V1_PREFIX}/resumes/upload" and method == "POST":
        return ("UPLOAD_RESUME", "RESUME", None)

    if path == f"{settings.API_V1_PREFIX}/resumes/analyze" and method == "POST":
        return ("ANALYZE_CV", "CV_ANALYSIS", None)

    if path == f"{settings.API_V1_PREFIX}/resumes" and method == "POST":
        return ("UPLOAD_RESUME", "RESUME", None)

    return None

