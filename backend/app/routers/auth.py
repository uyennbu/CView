from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_token_payload
from app.schemas.auth import (
    CandidateRegisterRequest,
    CurrentAccountResponse,
    LoginRequest,
    RecruiterRegisterRequest,
    RefreshTokenRequest,
    TokenResponse,
)
from app.services.auth_service import (
    authenticate_and_login,
    get_current_account_info,
    logout_session,
    refresh_session_token,
    register_candidate_account,
    register_recruiter_account,
)

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


def _extract_client_info(request: Request) -> tuple[str, str | None]:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    elif request.client and request.client.host:
        client_ip = request.client.host
    else:
        client_ip = "127.0.0.1"
    user_agent = request.headers.get("user-agent")
    return client_ip, user_agent


@router.post("/candidate/register", status_code=status.HTTP_201_CREATED, response_model=CurrentAccountResponse)
def register_candidate(
    payload: CandidateRegisterRequest,
    db: Session = Depends(get_db),
):
    """Đăng ký tài khoản Ứng viên (từ nút 'Đăng ký' trên Navbar)."""
    return register_candidate_account(db, payload)


@router.post("/candidate/login", response_model=TokenResponse)
def login_candidate(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Đăng nhập Ứng viên (từ nút 'Đăng nhập' trên Navbar)."""
    ip_address, user_agent = _extract_client_info(request)
    return authenticate_and_login(db, payload, required_role="CANDIDATE", ip_address=ip_address, user_agent=user_agent)


@router.post("/recruiter/register", status_code=status.HTTP_201_CREATED, response_model=CurrentAccountResponse)
def register_recruiter(
    payload: RecruiterRegisterRequest,
    db: Session = Depends(get_db),
):
    """Đăng ký tài khoản Nhà tuyển dụng & Công ty (từ nút 'Tuyển dụng' trên Navbar)."""
    return register_recruiter_account(db, payload)


@router.post("/recruiter/login", response_model=TokenResponse)
def login_recruiter(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Đăng nhập Nhà tuyển dụng (dẫn vào UI Nhà tuyển dụng: Đăng bài & Theo dõi thống kê)."""
    ip_address, user_agent = _extract_client_info(request)
    return authenticate_and_login(db, payload, required_role="RECRUITER", ip_address=ip_address, user_agent=user_agent)


@router.post("/admin/login", response_model=TokenResponse)
def login_admin(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Đăng nhập Quản trị viên (Admin Portal)."""
    ip_address, user_agent = _extract_client_info(request)
    return authenticate_and_login(db, payload, required_role="ADMIN", ip_address=ip_address, user_agent=user_agent)


@router.get("/me", response_model=CurrentAccountResponse)
def get_me(
    token_payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
):
    """Lấy thông tin tài khoản hiện tại để Navbar hiển thị hình Account hoặc chuyển luồng role."""
    account_id = token_payload.get("sub")
    return get_current_account_info(db, str(account_id))


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    payload: RefreshTokenRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Làm mới Access Token & xoay vòng Refresh Token."""
    ip_address, user_agent = _extract_client_info(request)
    return refresh_session_token(db, payload.refresh_token, ip_address=ip_address, user_agent=user_agent)


@router.post("/logout")
def logout(
    payload: RefreshTokenRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Đăng xuất và thu hồi phiên làm việc (Session Revoke)."""
    ip_address, user_agent = _extract_client_info(request)
    return logout_session(db, payload.refresh_token, ip_address=ip_address, user_agent=user_agent)
