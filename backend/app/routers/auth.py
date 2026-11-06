from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_token_payload
from app.schemas.auth import CandidateRegisterRequest, LoginRequest, RecruiterRegisterRequest

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


@router.post("/candidate/register", status_code=status.HTTP_201_CREATED)
def register_candidate(payload: CandidateRegisterRequest):
    """Đăng ký tài khoản Ứng viên (từ nút 'Đăng ký' trên Navbar)."""
    return {"message": "API đăng ký Ứng viên đã sẵn sàng", "username": payload.username}


@router.post("/candidate/login")
def login_candidate(payload: LoginRequest):
    """Đăng nhập Ứng viên (từ nút 'Đăng nhập' trên Navbar)."""
    return {"message": "API đăng nhập Ứng viên đã sẵn sàng", "user": payload.username_or_email}


@router.post("/recruiter/register", status_code=status.HTTP_201_CREATED)
def register_recruiter(payload: RecruiterRegisterRequest):
    """Đăng ký tài khoản Nhà tuyển dụng & Công ty (từ nút 'Tuyển dụng' trên Navbar)."""
    return {
        "message": "API đăng ký Nhà tuyển dụng đã sẵn sàng",
        "company_name": payload.company_name,
    }


@router.post("/recruiter/login")
def login_recruiter(payload: LoginRequest):
    """Đăng nhập Nhà tuyển dụng (dẫn vào UI Nhà tuyển dụng: Đăng bài & Theo dõi thống kê)."""
    return {"message": "API đăng nhập Nhà tuyển dụng đã sẵn sàng", "user": payload.username_or_email}


@router.get("/me")
def get_me(token_payload: dict = Depends(get_current_token_payload)):
    """Lấy thông tin tài khoản hiện tại để Navbar hiển thị hình Account hoặc chuyển luồng role."""
    return {"account_id": token_payload.get("sub"), "roles": token_payload.get("roles", [])}

