from typing import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt

from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_token_payload(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """Decode and validate the Bearer JWT token from the Authorization header."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chưa đăng nhập hoặc thiếu Access Token.",
        )
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access Token đã hết hạn.",
        ) from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access Token không hợp lệ.",
        ) from exc


def require_roles(*allowed_roles: str) -> Callable:
    """Dependency factory to enforce RBAC roles ('CANDIDATE', 'RECRUITER', 'ADMIN')."""

    def role_checker(payload: dict = Depends(get_current_token_payload)) -> dict:
        user_roles: list[str] = payload.get("roles", [])
        if not any(role in allowed_roles for role in user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Yêu cầu quyền truy cập thuộc nhóm: {', '.join(allowed_roles)}",
            )
        return payload

    return role_checker

