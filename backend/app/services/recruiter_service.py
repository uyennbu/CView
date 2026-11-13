"""Business logic for Recruiter Profile and Company management."""

import logging
from typing import Optional
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.business import Address, Company, RecruiterProfile
from app.models.system import Account
from app.schemas.candidate import AddressResponse
from app.schemas.recruiter import (
    CompanyResponse,
    RecruiterProfileResponse,
    RecruiterProfileUpdateRequest,
)

logger = logging.getLogger(__name__)


def get_recruiter_profile(db: Session, account_id: uuid.UUID) -> RecruiterProfileResponse:
    """Lấy chi tiết hồ sơ Nhà tuyển dụng, thông tin pháp nhân Doanh nghiệp và địa chỉ trụ sở."""
    account = db.get(Account, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản người dùng.",
        )

    recruiter = db.scalar(
        select(RecruiterProfile).where(RecruiterProfile.account_id == account.account_id)
    )
    if not recruiter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin hồ sơ nhà tuyển dụng của tài khoản này.",
        )

    company = db.get(Company, recruiter.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin doanh nghiệp tương ứng.",
        )

    address: Optional[Address] = None
    if company.address_id:
        address = db.get(Address, company.address_id)

    return RecruiterProfileResponse(
        recruiter_id=recruiter.recruiter_id,
        account_id=account.account_id,
        username=account.username,
        account_email=account.email,
        full_name=recruiter.full_name,
        job_title=recruiter.job_title,
        work_email=recruiter.work_email,
        phone_number=recruiter.phone_number or account.phone_number,
        company=CompanyResponse(
            company_id=company.company_id,
            name=company.name,
            tax_code=company.tax_code,
            website=company.website,
            logo_url=company.logo_url,
            industry=company.industry,
            verification_status=company.verification_status,
            address=AddressResponse.model_validate(address) if address else None,
            created_at=company.created_at,
        ),
        created_at=recruiter.created_at,
    )


def update_recruiter_profile(
    db: Session, account_id: uuid.UUID, payload: RecruiterProfileUpdateRequest
) -> RecruiterProfileResponse:
    """Cập nhật thông tin nhà tuyển dụng (recruiter_profiles), công ty (companies) và địa chỉ (addresses) trong 1 transaction."""
    account = db.get(Account, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản người dùng.",
        )

    recruiter = db.scalar(
        select(RecruiterProfile).where(RecruiterProfile.account_id == account.account_id)
    )
    if not recruiter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin hồ sơ nhà tuyển dụng của tài khoản này.",
        )

    company = db.get(Company, recruiter.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin doanh nghiệp tương ứng.",
        )

    address: Optional[Address] = db.get(Address, company.address_id) if company.address_id else None

    # 1. Cập nhật thông tin cá nhân nhà tuyển dụng
    if payload.full_name is not None:
        name_clean = payload.full_name.strip()
        if len(name_clean) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Họ và tên nhà tuyển dụng phải có ít nhất 2 ký tự.",
            )
        recruiter.full_name = name_clean

    if payload.job_title is not None:
        recruiter.job_title = payload.job_title.strip()

    if payload.work_email is not None:
        work_email_clean = payload.work_email.lower().strip()
        if work_email_clean != recruiter.work_email:
            conflict_work = db.scalar(
                select(RecruiterProfile).where(
                    RecruiterProfile.work_email == work_email_clean,
                    RecruiterProfile.recruiter_id != recruiter.recruiter_id,
                )
            )
            if conflict_work:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email công vụ đã được sử dụng bởi một nhà tuyển dụng khác.",
                )
            recruiter.work_email = work_email_clean

    if payload.phone_number is not None:
        phone_clean = payload.phone_number.strip()
        recruiter.phone_number = phone_clean
        # Đồng bộ số điện thoại vào account nếu chưa bị trùng
        conflict_acc = db.scalar(
            select(Account).where(
                Account.phone_number == phone_clean,
                Account.account_id != account.account_id,
            )
        )
        if not conflict_acc:
            account.phone_number = phone_clean

    # 2. Cập nhật thông tin doanh nghiệp (companies)
    if payload.company is not None:
        comp_payload = payload.company

        if comp_payload.name is not None:
            cname = comp_payload.name.strip()
            if cname != company.name:
                conflict_cname = db.scalar(
                    select(Company).where(
                        Company.name == cname,
                        Company.company_id != company.company_id,
                    )
                )
                if conflict_cname:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Tên doanh nghiệp đã tồn tại trên hệ thống.",
                    )
                company.name = cname

        if comp_payload.tax_code is not None:
            tcode = comp_payload.tax_code.strip()
            if tcode != company.tax_code:
                conflict_tax = db.scalar(
                    select(Company).where(
                        Company.tax_code == tcode,
                        Company.company_id != company.company_id,
                    )
                )
                if conflict_tax:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Mã số thuế này đã được đăng ký bởi doanh nghiệp khác.",
                    )
                company.tax_code = tcode

        if comp_payload.website is not None:
            company.website = comp_payload.website.strip() if comp_payload.website else None

        if comp_payload.logo_url is not None:
            company.logo_url = comp_payload.logo_url.strip() if comp_payload.logo_url else None

        if comp_payload.industry is not None:
            company.industry = comp_payload.industry.strip()

        # 3. Cập nhật địa chỉ trụ sở công ty (addresses)
        if comp_payload.address is not None:
            addr_data = comp_payload.address
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
                company.address_id = address.address_id

    try:
        db.commit()
        db.refresh(recruiter)
        db.refresh(company)
        db.refresh(account)
    except Exception as exc:
        db.rollback()
        logger.error("Lỗi cập nhật hồ sơ nhà tuyển dụng: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật hồ sơ nhà tuyển dụng: {exc}",
        ) from exc

    address_result = db.get(Address, company.address_id) if company.address_id else None

    return RecruiterProfileResponse(
        recruiter_id=recruiter.recruiter_id,
        account_id=account.account_id,
        username=account.username,
        account_email=account.email,
        full_name=recruiter.full_name,
        job_title=recruiter.job_title,
        work_email=recruiter.work_email,
        phone_number=recruiter.phone_number or account.phone_number,
        company=CompanyResponse(
            company_id=company.company_id,
            name=company.name,
            tax_code=company.tax_code,
            website=company.website,
            logo_url=company.logo_url,
            industry=company.industry,
            verification_status=company.verification_status,
            address=AddressResponse.model_validate(address_result) if address_result else None,
            created_at=company.created_at,
        ),
        created_at=recruiter.created_at,
    )

