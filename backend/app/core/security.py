from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from typing import Any, Dict

import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, roles: list[str], extra_claims: Dict[str, Any] | None = None) -> str:
    """Create a signed JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: Dict[str, Any] = {
        "sub": str(subject),
        "roles": roles,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def generate_refresh_token() -> tuple[str, str, datetime]:
    """Generate a random refresh token, its SHA-256 hash (for `sessions.refresh_token_hash`), and expiration."""
    raw_token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return raw_token, token_hash, expires_at


def hash_refresh_token(raw_token: str) -> str:
    """Compute SHA-256 hash of a refresh token for lookup in `sessions` table."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

