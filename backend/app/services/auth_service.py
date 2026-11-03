"""Authentication, RBAC, session management, and auth_logs service."""
from datetime import datetime, timezone
import uuid

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models.business import Address, CandidateProfile, Company, RecruiterProfile
from app.models.system import Account, AccountRole, AuthLog, Role, SessionRecord
from app.schemas.auth import (
    CandidateRegisterRequest,
    CurrentAccountResponse,
    LoginRequest,
    RecruiterRegisterRequest,
    TokenResponse,
)


def _get_or_create_role(db: Session, role_name: str, description: str) -> Role:
    role = db.scalar(select(Role).where(Role.role_name == role_name))
    if not role:
        role = Role(role_name=role_name, description=description)
        db.add(role)
        db.flush()
    return role


def _get_account_roles(db: Session, account_id: uuid.UUID) -> list[str]:
    stmt = (
        select(Role.role_name)
        .join(AccountRole, AccountRole.role_id == Role.role_id)
        .where(AccountRole.account_id == account_id)
    )
    return list(db.scalars(stmt).all())


def register_candidate_account(
    db: Session, payload: CandidateRegisterRequest
) -> CurrentAccountResponse:
    """Đăng ký Ứng viên, gán role CANDIDATE và tạo candidate_profiles trong 1 transaction."""
    email_lower = payload.email.lower()
    if db.scalar(select(Account).where(or_(Account.username == payload.username, Account.email == email_lower))):
        raise HTTPException(status.HTTP_409_CONFLICT, "Username hoặc Email đã tồn tại trên hệ thống.")
    if payload.phone_number and db.scalar(select(Account).where(Account.phone_number == payload.phone_number)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Số điện thoại đã được sử dụng.")

    try:
        role = _get_or_create_role(db, "CANDIDATE", "Ứng viên tìm kiếm việc làm")
        account = Account(
            username=payload.username,
            email=email_lower,
            password_hash=hash_password(payload.password),
            phone_number=payload.phone_number,
            status="ACTIVE",
        )
        db.add(account)
        db.flush()
        db.add(AccountRole(account_id=account.account_id, role_id=role.role_id))
        profile = CandidateProfile(account_id=account.account_id, full_name=payload.full_name)
        db.add(profile)
        db.commit()
        db.refresh(account)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Lỗi tạo tài khoản ứng viên: {exc}") from exc

    return CurrentAccountResponse(
        account_id=account.account_id,
        username=account.username,
        email=account.email,
        phone_number=account.phone_number,
        status=account.status,
        roles=["CANDIDATE"],
        full_name=profile.full_name,
        candidate_id=profile.candidate_id,
        created_at=account.created_at,
    )


def register_recruiter_account(
    db: Session, payload: RecruiterRegisterRequest
) -> CurrentAccountResponse:
    """Đăng ký Nhà tuyển dụng, tạo addresses, companies và recruiter_profiles trong 1 transaction."""
    email_lower = payload.email.lower()
    work_email_lower = payload.work_email.lower()

    if db.scalar(select(Account).where(or_(Account.username == payload.username, Account.email == email_lower))):
        raise HTTPException(status.HTTP_409_CONFLICT, "Username hoặc Email tài khoản đã tồn tại.")
    if db.scalar(select(Company).where(or_(Company.name == payload.company_name, Company.tax_code == payload.tax_code))):
        raise HTTPException(status.HTTP_409_CONFLICT, "Tên doanh nghiệp hoặc Mã số thuế đã được đăng ký.")
    if db.scalar(select(RecruiterProfile).where(RecruiterProfile.work_email == work_email_lower)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email công vụ (work_email) đã được sử dụng.")

    try:
        role = _get_or_create_role(db, "RECRUITER", "Nhà tuyển dụng doanh nghiệp")
        account = Account(
            username=payload.username,
            email=email_lower,
            password_hash=hash_password(payload.password),
            phone_number=payload.phone_number,
            status="ACTIVE",
        )
        db.add(account)
        db.flush()
        db.add(AccountRole(account_id=account.account_id, role_id=role.role_id))

        address = Address(street_address=payload.street_address, ward=payload.ward, city=payload.city)
        db.add(address)
        db.flush()

        company = Company(
            name=payload.company_name,
            address_id=address.address_id,
            tax_code=payload.tax_code,
            website=payload.website,
            industry=payload.industry,
            verification_status="PENDING",
        )
        db.add(company)
        db.flush()

        recruiter = RecruiterProfile(
            account_id=account.account_id,
            company_id=company.company_id,
            full_name=payload.full_name,
            job_title=payload.job_title,
            work_email=work_email_lower,
            phone_number=payload.phone_number,
        )
        db.add(recruiter)
        db.commit()
        db.refresh(account)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Lỗi tạo tài khoản nhà tuyển dụng: {exc}") from exc

    return CurrentAccountResponse(
        account_id=account.account_id,
        username=account.username,
        email=account.email,
        phone_number=account.phone_number,
        status=account.status,
        roles=["RECRUITER"],
        full_name=recruiter.full_name,
        recruiter_id=recruiter.recruiter_id,
        company_id=company.company_id,
        created_at=account.created_at,
    )


def authenticate_and_login(
    db: Session,
    payload: LoginRequest,
    required_role: str,
    ip_address: str,
    user_agent: str | None,
) -> TokenResponse:
    """Xác thực đăng nhập theo vai trò, lưu phiên vào sessions và ghi nhật ký vào auth_logs."""
    identifier = payload.username_or_email.strip()
    account = db.scalar(
        select(Account).where(or_(Account.username == identifier, Account.email == identifier.lower()))
    )

    if not account or not verify_password(payload.password, account.password_hash):
        if account:
            db.add(AuthLog(account_id=account.account_id, event_type="LOGIN_FAILED", ip_address=ip_address, user_agent=user_agent, failure_reason="INVALID_CREDENTIALS"))
            db.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Tên đăng nhập/Email hoặc mật khẩu không chính xác.")

    if account.status != "ACTIVE":
        db.add(AuthLog(account_id=account.account_id, event_type="LOGIN_FAILED", ip_address=ip_address, user_agent=user_agent, failure_reason="ACCOUNT_LOCKED"))
        db.commit()
        raise HTTPException(status.HTTP_403_FORBIDDEN, f"Tài khoản đang ở trạng thái '{account.status}'.")

    roles = _get_account_roles(db, account.account_id)
    if required_role not in roles and "ADMIN" not in roles:
        raise HTTPException(status.HTTP_403_FORBIDDEN, f"Tài khoản không thuộc nhóm quyền {required_role}.")

    raw_refresh, refresh_hash, expires_at = generate_refresh_token()
    session_record = SessionRecord(
        account_id=account.account_id,
        refresh_token_hash=refresh_hash,
        ip_address=ip_address,
        user_agent=user_agent,
        is_revoked=False,
        expires_at=expires_at,
    )
    account.last_login_at = datetime.now(timezone.utc)
    db.add(session_record)
    db.add(AuthLog(account_id=account.account_id, event_type="LOGIN_SUCCESS", ip_address=ip_address, user_agent=user_agent))
    db.commit()

    access_token = create_access_token(
        subject=str(account.account_id),
        roles=roles,
        extra_claims={"session_id": str(session_record.session_id)},
    )
    return TokenResponse(access_token=access_token, refresh_token=raw_refresh, roles=roles)


def refresh_session_token(
    db: Session, refresh_token: str, ip_address: str, user_agent: str | None
) -> TokenResponse:
    """Làm mới Access Token và Refresh Token dựa trên bảng sessions, ghi TOKEN_REFRESH vào auth_logs."""
    token_hash = hash_refresh_token(refresh_token)
    session_record = db.scalar(select(SessionRecord).where(SessionRecord.refresh_token_hash == token_hash))
    now = datetime.now(timezone.utc)

    if not session_record or session_record.is_revoked or session_record.expires_at <= now:
        if session_record:
            session_record.is_revoked = True
            db.add(AuthLog(account_id=session_record.account_id, event_type="TOKEN_REFRESH", ip_address=ip_address, user_agent=user_agent, failure_reason="TOKEN_EXPIRED"))
            db.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh Token không hợp lệ hoặc đã hết hạn.")

    roles = _get_account_roles(db, session_record.account_id)
    new_raw, new_hash, new_expires_at = generate_refresh_token()
    session_record.refresh_token_hash = new_hash
    session_record.expires_at = new_expires_at
    session_record.ip_address = ip_address
    session_record.user_agent = user_agent

    db.add(AuthLog(account_id=session_record.account_id, event_type="TOKEN_REFRESH", ip_address=ip_address, user_agent=user_agent))
    db.commit()

    access_token = create_access_token(
        subject=str(session_record.account_id),
        roles=roles,
        extra_claims={"session_id": str(session_record.session_id)},
    )
    return TokenResponse(access_token=access_token, refresh_token=new_raw, roles=roles)


def logout_session(
    db: Session, refresh_token: str, ip_address: str, user_agent: str | None
) -> dict:
    """Thu hồi phiên trong bảng sessions (is_revoked=True) và ghi LOGOUT vào auth_logs."""
    token_hash = hash_refresh_token(refresh_token)
    session_record = db.scalar(select(SessionRecord).where(SessionRecord.refresh_token_hash == token_hash))
    if not session_record:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy phiên đăng nhập tương ứng.")

    session_record.is_revoked = True
    db.add(AuthLog(account_id=session_record.account_id, event_type="LOGOUT", ip_address=ip_address, user_agent=user_agent))
    db.commit()
    return {"message": "Đăng xuất thành công, phiên làm việc đã được thu hồi."}


def get_current_account_info(db: Session, account_id_str: str) -> CurrentAccountResponse:
    """Lấy thông tin tài khoản, roles và hồ sơ để Frontend điều hướng Navbar / Recruiter Portal."""
    try:
        account_uuid = uuid.UUID(account_id_str)
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Định dạng account_id không hợp lệ.") from exc

    account = db.get(Account, account_uuid)
    if not account:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy tài khoản người dùng.")

    roles = _get_account_roles(db, account.account_id)
    candidate = db.scalar(select(CandidateProfile).where(CandidateProfile.account_id == account.account_id))
    recruiter = db.scalar(select(RecruiterProfile).where(RecruiterProfile.account_id == account.account_id))

    return CurrentAccountResponse(
        account_id=account.account_id,
        username=account.username,
        email=account.email,
        phone_number=account.phone_number,
        status=account.status,
        roles=roles,
        full_name=candidate.full_name if candidate else (recruiter.full_name if recruiter else None),
        candidate_id=candidate.candidate_id if candidate else None,
        recruiter_id=recruiter.recruiter_id if recruiter else None,
        company_id=recruiter.company_id if recruiter else None,
        created_at=account.created_at,
    )
