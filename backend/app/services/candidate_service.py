"""Business logic for Candidate Profile & Address management."""

from datetime import date
from decimal import Decimal
import logging
from typing import Optional
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.business import Address, CandidateProfile
from app.models.system import Account
from app.schemas.candidate import (
    AddressResponse,
    CandidateProfileResponse,
    CandidateProfileUpdateRequest,
)

logger = logging.getLogger(__name__)


def get_candidate_profile(db: Session, account_id: uuid.UUID) -> CandidateProfileResponse:
    """Lấy chi tiết hồ sơ cá nhân và địa chỉ cư trú của Ứng viên theo account_id."""
    account = db.get(Account, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản người dùng.",
        )

    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.account_id == account.account_id)
    )

    # Trường hợp tài khoản CANDIDATE chưa có bản ghi hồ sơ, tự động khởi tạo mặc định
    if not profile:
        profile = CandidateProfile(
            account_id=account.account_id,
            full_name=account.username,
            years_of_experience=Decimal("0.0"),
            education_level="BACHELOR",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    address: Optional[Address] = None
    if profile.address_id:
        address = db.get(Address, profile.address_id)

    return CandidateProfileResponse(
        candidate_id=profile.candidate_id,
        account_id=account.account_id,
        username=account.username,
        email=account.email,
        phone_number=account.phone_number,
        full_name=profile.full_name,
        date_of_birth=profile.date_of_birth,
        gender=profile.gender,
        current_job_title=profile.current_job_title,
        years_of_experience=float(profile.years_of_experience),
        education_level=profile.education_level,
        address=AddressResponse.model_validate(address) if address else None,
        created_at=profile.created_at,
    )


def update_candidate_profile(
    db: Session, account_id: uuid.UUID, payload: CandidateProfileUpdateRequest
) -> CandidateProfileResponse:
    """Cập nhật hồ sơ cá nhân (candidate_profiles), số điện thoại (accounts) và địa chỉ (addresses) trong 1 transaction."""
    account = db.get(Account, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản người dùng.",
        )

    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.account_id == account.account_id)
    )
    if not profile:
        profile = CandidateProfile(
            account_id=account.account_id,
            full_name=account.username,
            years_of_experience=Decimal("0.0"),
            education_level="BACHELOR",
        )
        db.add(profile)
        db.flush()

    # 1. Cập nhật họ và tên
    if payload.full_name is not None:
        name_clean = payload.full_name.strip()
        if len(name_clean) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Họ và tên phải có ít nhất 2 ký tự.",
            )
        profile.full_name = name_clean

    # 2. Cập nhật số điện thoại (kiểm tra tính duy nhất trên bảng accounts)
    if payload.phone_number is not None:
        phone_clean = payload.phone_number.strip()
        if phone_clean != account.phone_number:
            conflict = db.scalar(
                select(Account).where(
                    Account.phone_number == phone_clean,
                    Account.account_id != account.account_id,
                )
            )
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Số điện thoại này đã được sử dụng bởi một tài khoản khác.",
                )
            account.phone_number = phone_clean

    # 3. Cập nhật ngày sinh (kiểm tra ràng buộc tuổi >= 16)
    if payload.date_of_birth is not None:
        today = date.today()
        dob = payload.date_of_birth
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if age < 16:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ứng viên phải từ đủ 16 tuổi trở lên theo quy định.",
            )
        profile.date_of_birth = dob

    # 4. Cập nhật giới tính
    if payload.gender is not None:
        profile.gender = payload.gender

    # 5. Cập nhật chức danh công việc hiện tại
    if payload.current_job_title is not None:
        profile.current_job_title = payload.current_job_title.strip()

    # 6. Cập nhật số năm kinh nghiệm
    if payload.years_of_experience is not None:
        profile.years_of_experience = Decimal(str(round(payload.years_of_experience, 1)))

    # 7. Cập nhật trình độ học vấn
    if payload.education_level is not None:
        profile.education_level = payload.education_level

    # 8. Cập nhật hoặc tạo mới thông tin địa chỉ cư trú (bảng addresses)
    if payload.address is not None:
        addr_data = payload.address
        if profile.address_id:
            address = db.get(Address, profile.address_id)
            if address:
                address.street_address = addr_data.street_address.strip()
                address.ward = addr_data.ward.strip() if addr_data.ward else None
                address.city = addr_data.city.strip()
                address.country = addr_data.country.strip() if addr_data.country else "Việt Nam"
            else:
                address = Address(
                    street_address=addr_data.street_address.strip(),
                    ward=addr_data.ward.strip() if addr_data.ward else None,
                    city=addr_data.city.strip(),
                    country=addr_data.country.strip() if addr_data.country else "Việt Nam",
                )
                db.add(address)
                db.flush()
                profile.address_id = address.address_id
        else:
            address = Address(
                street_address=addr_data.street_address.strip(),
                ward=addr_data.ward.strip() if addr_data.ward else None,
                city=addr_data.city.strip(),
                country=addr_data.country.strip() if addr_data.country else "Việt Nam",
            )
            db.add(address)
            db.flush()
            profile.address_id = address.address_id

    try:
        db.commit()
        db.refresh(profile)
        db.refresh(account)
    except Exception as exc:
        db.rollback()
        logger.error("Lỗi cập nhật hồ sơ ứng viên: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật hồ sơ ứng viên: {exc}",
        ) from exc

    address_result: Optional[Address] = None
    if profile.address_id:
        address_result = db.get(Address, profile.address_id)

    return CandidateProfileResponse(
        candidate_id=profile.candidate_id,
        account_id=account.account_id,
        username=account.username,
        email=account.email,
        phone_number=account.phone_number,
        full_name=profile.full_name,
        date_of_birth=profile.date_of_birth,
        gender=profile.gender,
        current_job_title=profile.current_job_title,
        years_of_experience=float(profile.years_of_experience),
        education_level=profile.education_level,
        address=AddressResponse.model_validate(address_result) if address_result else None,
        created_at=profile.created_at,
    )

