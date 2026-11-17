"""Pytest fixtures and configuration for backend testing with automated database rollback."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.database import engine, get_db
import app.core.database as app_db
from app.main import app
import app.middlewares.logger_utils as app_logger_utils


@pytest.fixture(scope="function", autouse=True)
def db_session_rollback(monkeypatch):
    """Mỗi bài test chạy trong một savepoint transaction riêng biệt và tự động rollback sau khi test xong.

    Đảm bảo 100% dữ liệu tạo trong quá trình test (qua API hoặc trực tiếp qua ORM)
    không bị lưu lại gây rác cơ sở dữ liệu.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(
        bind=connection,
        join_transaction_mode="create_savepoint",
        expire_on_commit=False,
    )

    # Chống việc middleware/utils gọi session.close() làm đóng sớm session trong lúc test đang chạy
    real_close = session.close
    session.close = lambda: None

    # Override SessionLocal trong app_db và app_logger_utils để toàn bộ các tầng dùng chung session transaction này
    monkeypatch.setattr(app_db, "SessionLocal", lambda: session)
    monkeypatch.setattr(app_logger_utils, "SessionLocal", lambda: session)

    def override_get_db():
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    yield session

    real_close()
    transaction.rollback()
    connection.close()
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture(scope="function")
def db_session(db_session_rollback):
    """Cung cấp database session có rollback tự động cho các bài test."""
    return db_session_rollback


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient kết nối cùng session có rollback tự động."""
    return TestClient(app)
