from datetime import datetime
from typing import List
import uuid
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Schema đăng nhập cho Ứng viên, Nhà tuyển dụng và Admin."""

    username_or_email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class CandidateRegisterRequest(BaseModel):
    """Schema đăng ký từ nút 'Đăng ký' trên Navbar dành cho Ứng viên."""

    username: str = Field(..., pattern=r"^[a-zA-Z0-9_]{3,50}$")
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=100)
    phone_number: str | None = None


class RecruiterRegisterRequest(BaseModel):
    """Schema đăng ký từ nút 'Tuyển dụng' trên Navbar dành cho Nhà tuyển dụng."""

    username: str = Field(..., pattern=r"^[a-zA-Z0-9_]{3,50}$")
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=100)
    job_title: str = Field(..., min_length=2, max_length=100)
    work_email: EmailStr
    phone_number: str | None = None
    company_name: str = Field(..., min_length=3, max_length=255)
    tax_code: str = Field(..., pattern=r"^[0-9]{10}(-[0-9]{3})?$")
    industry: str = Field(..., min_length=2, max_length=100)
    street_address: str = Field(default="Chưa cập nhật", min_length=2, max_length=255)
    ward: str | None = None
    city: str = Field(default="TP. Hồ Chí Minh", min_length=2, max_length=100)
    website: str | None = None


class RefreshTokenRequest(BaseModel):
    """Schema yêu cầu cấp mới Access Token hoặc Đăng xuất (thu hồi phiên)."""

    refresh_token: str = Field(..., min_length=10)


class TokenResponse(BaseModel):
    """Token trả về sau khi đăng nhập hoặc làm mới phiên thành công."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    roles: List[str]


class CurrentAccountResponse(BaseModel):
    """Thông tin tài khoản hiện tại để Navbar hiển thị hình Account hoặc chuyển vào UI Tuyển dụng."""

    account_id: uuid.UUID
    username: str
    email: EmailStr
    phone_number: str | None = None
    status: str
    roles: List[str]
    full_name: str | None = None
    candidate_id: uuid.UUID | None = None
    recruiter_id: uuid.UUID | None = None
    company_id: uuid.UUID | None = None
    created_at: datetime
