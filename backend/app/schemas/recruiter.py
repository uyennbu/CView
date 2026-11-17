"""Pydantic schemas for Recruiter Profile and Company."""

from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel, EmailStr, Field

from app.schemas.candidate import AddressResponse, AddressUpdateRequest


class CompanyResponse(BaseModel):
    """Thông tin pháp nhân doanh nghiệp và địa chỉ trụ sở."""

    company_id: uuid.UUID
    name: str
    tax_code: str
    website: Optional[str] = None
    logo_url: Optional[str] = None
    industry: str
    verification_status: str
    address: Optional[AddressResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CompanyUpdateRequest(BaseModel):
    """Schema cập nhật thông tin công ty và trụ sở."""

    name: Optional[str] = Field(None, min_length=3, max_length=255, description="Tên pháp nhân công ty")
    tax_code: Optional[str] = Field(
        None,
        pattern=r"^[0-9]{10}(-[0-9]{3})?$",
        description="Mã số thuế doanh nghiệp (10 hoặc 13 chữ số)",
    )
    website: Optional[str] = Field(None, pattern=r"^https?://.*$", description="Website doanh nghiệp (http/https)")
    logo_url: Optional[str] = Field(None, max_length=500, description="Đường dẫn logo công ty")
    industry: Optional[str] = Field(None, min_length=2, max_length=100, description="Ngành nghề hoạt động chính")
    address: Optional[AddressUpdateRequest] = Field(None, description="Địa chỉ trụ sở chính của công ty")


class RecruiterProfileResponse(BaseModel):
    """Schema phản hồi hồ sơ cá nhân nhà tuyển dụng kèm thông tin công ty."""

    recruiter_id: uuid.UUID
    account_id: uuid.UUID
    username: str
    account_email: EmailStr
    full_name: str
    job_title: str
    work_email: EmailStr
    phone_number: Optional[str] = None
    company: CompanyResponse
    created_at: datetime

    model_config = {"from_attributes": True}


class RecruiterProfileUpdateRequest(BaseModel):
    """Schema cập nhật thông tin hồ sơ nhà tuyển dụng và công ty (PUT /recruiter/profile)."""

    full_name: Optional[str] = Field(None, min_length=2, max_length=100, description="Họ và tên nhà tuyển dụng")
    job_title: Optional[str] = Field(None, min_length=2, max_length=100, description="Chức danh công tác")
    work_email: Optional[EmailStr] = Field(None, description="Email công vụ tại doanh nghiệp")
    phone_number: Optional[str] = Field(
        None,
        pattern=r"^(0[3|5|7|8|9][0-9]{8}|\+84[3|5|7|8|9][0-9]{8})$",
        description="Số điện thoại liên hệ trực tiếp",
    )
    company: Optional[CompanyUpdateRequest] = Field(None, description="Thông tin cập nhật của công ty")

