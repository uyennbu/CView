"""FastAPI Middleware tự động ghi nhận activity_logs và system_error_logs."""

import logging
import time
import traceback
from typing import Any, Dict, Optional
import uuid

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.core.config import settings
from app.middlewares.logger_utils import (
    EXCLUDED_ACTIVITY_PATHS,
    VALID_ACTION_TYPES,
    VALID_TARGET_ENTITIES,
    extract_client_info,
    extract_session_id_from_token,
    infer_activity,
    log_activity,
    log_system_error,
)

logger = logging.getLogger(__name__)


class ActivityAndSystemErrorLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware tự động:

    1. Ghi nhận hành vi người dùng vào bảng `activity_logs` khi có session_id hợp lệ.
    2. Ghi nhận lỗi exception và 5xx vào bảng `system_error_logs`.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.perf_counter()
        client_ip, user_agent = extract_client_info(request)

        # 1. Trích xuất sessions_id từ request.state, header hoặc Bearer JWT
        session_id: Optional[uuid.UUID] = None
        state_session_id = getattr(request.state, "session_id", None)
        if state_session_id:
            try:
                session_id = uuid.UUID(str(state_session_id))
            except ValueError:
                pass

        if not session_id:
            header_session_id = request.headers.get("x-session-id")
            if header_session_id:
                try:
                    session_id = uuid.UUID(header_session_id)
                except ValueError:
                    pass

        if not session_id:
            auth_header = request.headers.get("authorization")
            if auth_header and auth_header.lower().startswith("bearer "):
                raw_token = auth_header[7:].strip()
                session_id = extract_session_id_from_token(raw_token)

        if session_id:
            request.state.session_id = session_id

        # 2. Thực thi request qua downstream pipeline
        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            stack_trace = traceback.format_exc()
            exc_name = exc.__class__.__name__

            severity = (
                "CRITICAL"
                if any(k in exc_name.lower() for k in ["operational", "database", "connection", "memory"])
                else "ERROR"
            )

            # Ghi lỗi chưa xử lý vào bảng system_error_logs
            log_system_error(
                service_name=settings.APP_NAME[:50],
                severity=severity,
                error_code=exc_name[:50],
                message=str(exc) or "Internal server error occurred",
                stack_trace=stack_trace,
            )

            logger.exception("Ngoại lệ không xử lý tại %s %s: %s", request.method, request.url.path, exc)

            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Đã xảy ra lỗi hệ thống nội bộ."},
            )

        # 3. Tính toán thời gian phản hồi
        duration_ms = (time.perf_counter() - start_time) * 1000.0

        # 4. Ghi nhận lỗi HTTP 5xx nếu xảy ra
        if response.status_code >= 500:
            log_system_error(
                service_name=settings.APP_NAME[:50],
                severity="ERROR",
                error_code=f"ERR_HTTP_{response.status_code}",
                message=f"HTTP {response.status_code} phát sinh khi truy cập {request.method} {request.url.path}",
                stack_trace=None,
            )

        # 5. Ghi nhận nhật ký hành vi vào activity_logs cho các request thành công
        path = request.url.path.rstrip("/") or "/"
        if 200 <= response.status_code < 400 and path not in EXCLUDED_ACTIVITY_PATHS:
            if not getattr(request.state, "skip_activity_log", False):
                action_type = getattr(request.state, "activity_action", None)
                target_entity = getattr(request.state, "activity_entity", None)
                target_id = getattr(request.state, "activity_target_id", None)

                if not action_type or not target_entity:
                    inferred = infer_activity(request)
                    if inferred:
                        action_type, target_entity, inferred_id = inferred
                        if not target_id:
                            target_id = inferred_id

                active_session_id = getattr(request.state, "session_id", None) or session_id

                if (
                    active_session_id
                    and action_type in VALID_ACTION_TYPES
                    and target_entity in VALID_TARGET_ENTITIES
                ):
                    details: Dict[str, Any] = {
                        "method": request.method,
                        "path": request.url.path,
                        "status_code": response.status_code,
                        "ip_address": client_ip,
                        "user_agent": user_agent,
                        "duration_ms": round(duration_ms, 2),
                    }
                    if request.query_params:
                        details["query_params"] = dict(request.query_params)

                    custom_details = getattr(request.state, "activity_details", None)
                    if custom_details and isinstance(custom_details, dict):
                        sanitized = {
                            k: v
                            for k, v in custom_details.items()
                            if not any(s in k.lower() for s in ["password", "token", "secret"])
                        }
                        details.update(sanitized)

                    log_activity(
                        sessions_id=active_session_id,
                        action_type=action_type,
                        target_entity=target_entity,
                        target_id=target_id,
                        details=details,
                    )

        return response
