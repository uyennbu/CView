"""Pydantic schemas for Candidate Profile and Addresses."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
import uuid

from pydantic import BaseModel, EmailStr, Field


class AddressResponse(BaseModel):
    """Thông tin địa chỉ cư trú của ứng viên."""

    address_id: uuid.UUID
    street_address: str
    ward: Optional[str] = None
    city: str
    country: str = "Việt Nam"
    created_at: datetime

    model_config = {"from_attributes": True}


class AddressUpdateRequest(BaseModel):
    """Schema cập nhật địa chỉ cư trú."""

    street_address: str = Field(..., min_length=2, max_length=255, description="Địa chỉ chi tiết (số nhà, tên đường)")
    ward: Optional[str] = Field(None, max_length=100, description="Phường / Xã")
    city: str = Field(..., min_length=2, max_length=100, description="Tỉnh / Thành phố")
    country: str = Field(default="Việt Nam", max_length=50, description="Quốc gia")


class CandidateProfileResponse(BaseModel):
    """Schema phản hồi toàn bộ thông tin tài khoản và hồ sơ ứng viên."""

    candidate_id: uuid.UUID
    account_id: uuid.UUID
    username: str
    email: EmailStr
    phone_number: Optional[str] = None
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    current_job_title: Optional[str] = None
    years_of_experience: float
    education_level: str
    address: Optional[AddressResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CandidateProfileUpdateRequest(BaseModel):
    """Schema cập nhật hồ sơ cá nhân và địa chỉ cho ứng viên (PUT /candidate/profile)."""

    full_name: Optional[str] = Field(None, min_length=2, max_length=100, description="Họ và tên ứng viên")
    phone_number: Optional[str] = Field(
        None,
        pattern=r"^(0[3|5|7|8|9][0-9]{8}|\+84[3|5|7|8|9][0-9]{8})$",
        description="Số điện thoại di động Việt Nam",
    )
    date_of_birth: Optional[date] = Field(None, description="Ngày sinh (ứng viên phải từ đủ 16 tuổi trở lên)")
    gender: Optional[str] = Field(None, pattern=r"^(MALE|FEMALE|OTHER)$", description="Giới tính: MALE, FEMALE, OTHER")
    current_job_title: Optional[str] = Field(None, max_length=100, description="Vị trí công việc hiện tại")
    years_of_experience: Optional[float] = Field(None, ge=0.0, le=50.0, description="Số năm kinh nghiệm (0.0 - 50.0)")
    education_level: Optional[str] = Field(
        None,
        pattern=r"^(HIGH_SCHOOL|ASSOCIATE|BACHELOR|MASTER|DOCTORATE|OTHER)$",
        description="Trình độ học vấn cao nhất",
    )
    address: Optional[AddressUpdateRequest] = Field(None, description="Thông tin địa chỉ cư trú")

