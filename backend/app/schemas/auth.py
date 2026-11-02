from datetime import datetime
from typing import List
import uuid
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Schema đăng nhập cho cả Ứng viên, Nhà tuyển dụng và Admin."""

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
    company_name: str = Field(..., min_length=3, max_length=255)
    tax_code: str = Field(..., pattern=r"^[0-9]{10}(-[0-9]{3})?$")
    industry: str = Field(..., min_length=2, max_length=100)


class TokenResponse(BaseModel):
    """Token trả về sau khi đăng nhập thành công."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    roles: List[str]


class CurrentAccountResponse(BaseModel):
    """Thông tin tài khoản hiện tại để Navbar hiển thị hình Account hoặc chuyển sang UI Tuyển dụng."""

    account_id: uuid.UUID
    username: str
    email: EmailStr
    status: str
    roles: List[str]
    created_at: datetime

