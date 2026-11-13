"""Service layer for Job Postings, Skills, Certificates, and Domains."""

from datetime import datetime, timezone
from decimal import Decimal
import logging
from typing import Optional
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.business import (
    Address,
    Certificate,
    Company,
    Domain,
    JobCertificate,
    JobDomain,
    JobPost,
    JobSkill,
    RecruiterProfile,
    Skill,
)
from app.schemas.candidate import AddressResponse
from app.schemas.jobs import (
    CertificateCatalogItem,
    DomainCatalogItem,
    JobCertificateResponse,
    JobDomainResponse,
    JobPostCreateRequest,
    JobPostResponse,
    JobSkillResponse,
    RecruiterJobListResponse,
    SkillCatalogItem,
)

logger = logging.getLogger(__name__)


def _format_job_post_response(post: JobPost, db: Session) -> JobPostResponse:
    """Format JobPost ORM model into JobPostResponse schema."""
    address_response: Optional[AddressResponse] = None
    if post.address:
        address_response = AddressResponse.model_validate(post.address)
    elif post.address_id:
        addr = db.get(Address, post.address_id)
        if addr:
            address_response = AddressResponse.model_validate(addr)

    company_name: Optional[str] = None
    if post.company:
        company_name = post.company.name
    elif post.company_id:
        comp = db.get(Company, post.company_id)
        if comp:
            company_name = comp.name

    skills_data = [
        JobSkillResponse(
            skill_id=js.skill_id,
            skill_name=js.skill.skill_name if js.skill else "",
            category=js.skill.category if js.skill else "",
            requirement_type=js.requirement_type,
            min_years_experience=float(js.min_years_experience or 0.0),
        )
        for js in post.skills
    ]

    certs_data = [
        JobCertificateResponse(
            certificate_id=jc.certificate_id,
            certificate_name=jc.certificate.certificate_name if jc.certificate else "",
            issuer=jc.certificate.issuer if jc.certificate else "",
            is_mandatory=jc.is_mandatory,
        )
        for jc in post.certificates
    ]

    domains_data = [
        JobDomainResponse(
            domain_id=jd.domain_id,
            domain_name=jd.domain.domain_name if jd.domain else "",
            description=jd.domain.description if jd.domain else None,
        )
        for jd in post.domains
    ]

    return JobPostResponse(
        job_post_id=post.job_post_id,
        recruiter_id=post.recruiter_id,
        company_id=post.company_id,
        company_name=company_name,
        title=post.title,
        position=post.position,
        job_description=post.job_description,
        requirements=post.requirements,
        benefits=post.benefits,
        job_type=post.job_type,
        workplace_type=post.workplace_type,
        address_id=post.address_id,
        address=address_response,
        salary_min=post.salary_min,
        salary_max=post.salary_max,
        is_salary_negotiable=post.is_salary_negotiable,
        experience_years_min=float(post.experience_years_min or 0.0),
        required_education=post.required_education,
        approval_status=post.approval_status,
        rejection_reason=post.rejection_reason,
        deadline=post.deadline,
        created_at=post.created_at,
        skills=skills_data,
        certificates=certs_data,
        domains=domains_data,
    )


def create_job_post(
    db: Session, account_id: uuid.UUID, payload: JobPostCreateRequest
) -> JobPostResponse:
    """Tạo mới tin tuyển dụng gắn kèm kỹ năng, chứng chỉ và lĩnh vực hoạt động."""
    recruiter = db.scalar(
        select(RecruiterProfile).where(RecruiterProfile.account_id == account_id)
    )
    if not recruiter:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ tài khoản Nhà tuyển dụng mới có quyền đăng tin tuyển dụng.",
        )

    company = db.get(Company, recruiter.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin công ty của nhà tuyển dụng.",
        )

    now_utc = datetime.now(timezone.utc)
    deadline_dt = payload.deadline
    if deadline_dt.tzinfo is None:
        deadline_dt = deadline_dt.replace(tzinfo=timezone.utc)

    if deadline_dt <= now_utc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Hạn chót nộp hồ sơ (deadline) phải lớn hơn thời điểm hiện tại.",
        )

    # Xử lý địa chỉ làm việc
    address_id: Optional[uuid.UUID] = payload.address_id
    if payload.address:
        new_address = Address(
            street_address=payload.address.street_address,
            ward=payload.address.ward,
            city=payload.address.city,
            country=payload.address.country,
        )
        db.add(new_address)
        db.flush()
        address_id = new_address.address_id
    elif address_id:
        existing_addr = db.get(Address, address_id)
        if not existing_addr:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Địa chỉ với ID {address_id} không tồn tại trong hệ thống.",
            )
    elif payload.workplace_type != "REMOTE" and company.address_id:
        address_id = company.address_id

    # Kiểm tra tính hợp lệ và chống trùng lặp kỹ năng
    skill_ids = [s.skill_id for s in payload.skills]
    if len(skill_ids) != len(set(skill_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Danh sách kỹ năng chứa các ID kỹ năng trùng lặp.",
        )
    for s in payload.skills:
        skill = db.get(Skill, s.skill_id)
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Kỹ năng với ID {s.skill_id} không tồn tại trong hệ thống.",
            )

    # Kiểm tra chứng chỉ
    cert_ids = [c.certificate_id for c in payload.certificates]
    if len(cert_ids) != len(set(cert_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Danh sách chứng chỉ chứa các ID chứng chỉ trùng lặp.",
        )
    for c in payload.certificates:
        cert = db.get(Certificate, c.certificate_id)
        if not cert:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Chứng chỉ với ID {c.certificate_id} không tồn tại trong hệ thống.",
            )

    # Kiểm tra lĩnh vực
    if len(payload.domain_ids) != len(set(payload.domain_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Danh sách lĩnh vực chứa các ID lĩnh vực trùng lặp.",
        )
    for d_id in payload.domain_ids:
        domain = db.get(Domain, d_id)
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Lĩnh vực với ID {d_id} không tồn tại trong hệ thống.",
            )

    # Tạo bản ghi bài đăng tuyển dụng
    job_post = JobPost(
        recruiter_id=recruiter.recruiter_id,
        company_id=recruiter.company_id,
        position=payload.position,
        title=payload.title,
        job_description=payload.job_description,
        requirements=payload.requirements,
        benefits=payload.benefits,
        job_type=payload.job_type,
        workplace_type=payload.workplace_type,
        address_id=address_id,
        salary_min=payload.salary_min,
        salary_max=payload.salary_max,
        is_salary_negotiable=payload.is_salary_negotiable,
        experience_years_min=Decimal(str(payload.experience_years_min)),
        required_education=payload.required_education,
        approval_status="PENDING",
        deadline=deadline_dt,
    )
    db.add(job_post)
    db.flush()

    for s in payload.skills:
        db.add(
            JobSkill(
                job_post_id=job_post.job_post_id,
                skill_id=s.skill_id,
                requirement_type=s.requirement_type,
                min_years_experience=Decimal(str(s.min_years_experience)),
            )
        )

    for c in payload.certificates:
        db.add(
            JobCertificate(
                job_post_id=job_post.job_post_id,
                certificate_id=c.certificate_id,
                is_mandatory=c.is_mandatory,
            )
        )

    for d_id in payload.domain_ids:
        db.add(
            JobDomain(
                job_post_id=job_post.job_post_id,
                domain_id=d_id,
            )
        )

    db.commit()
    db.refresh(job_post)
    logger.info(
        "Tạo tin tuyển dụng thành công: %s bởi recruiter %s",
        job_post.job_post_id,
        recruiter.recruiter_id,
    )
    return _format_job_post_response(job_post, db)


def get_recruiter_jobs(
    db: Session,
    account_id: uuid.UUID,
    approval_status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> RecruiterJobListResponse:
    """Lấy danh sách tin tuyển dụng do nhà tuyển dụng đăng tải kèm trạng thái duyệt."""
    recruiter = db.scalar(
        select(RecruiterProfile).where(RecruiterProfile.account_id == account_id)
    )
    if not recruiter:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ tài khoản Nhà tuyển dụng mới có danh sách tin đã đăng.",
        )

    query = select(JobPost).where(JobPost.recruiter_id == recruiter.recruiter_id)
    count_query = select(func.count(JobPost.job_post_id)).where(
        JobPost.recruiter_id == recruiter.recruiter_id
    )

    if approval_status:
        status_normalized = approval_status.upper().strip()
        query = query.where(JobPost.approval_status == status_normalized)
        count_query = count_query.where(JobPost.approval_status == status_normalized)

    total = db.scalar(count_query) or 0
    offset = (page - 1) * limit
    posts = db.scalars(
        query.order_by(JobPost.created_at.desc()).offset(offset).limit(limit)
    ).all()

    items = [_format_job_post_response(post, db) for post in posts]
    return RecruiterJobListResponse(items=items, total=total, page=page, limit=limit)


def get_job_detail(db: Session, job_post_id: uuid.UUID) -> JobPostResponse:
    """Xem chi tiết bài đăng tuyển dụng theo ID."""
    job_post = db.get(JobPost, job_post_id)
    if not job_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tin tuyển dụng.",
        )
    return _format_job_post_response(job_post, db)


def get_skills_catalog(db: Session, category: Optional[str] = None) -> list[SkillCatalogItem]:
    """Lấy danh mục các kỹ năng chuẩn hóa hệ thống."""
    query = select(Skill)
    if category:
        query = query.where(Skill.category == category)
    skills = db.scalars(query.order_by(Skill.skill_name.asc())).all()
    return [SkillCatalogItem.model_validate(s) for s in skills]


def get_certificates_catalog(
    db: Session, category: Optional[str] = None
) -> list[CertificateCatalogItem]:
    """Lấy danh mục các chứng chỉ chuẩn hóa hệ thống."""
    query = select(Certificate)
    if category:
        query = query.where(Certificate.category == category)
    certs = db.scalars(query.order_by(Certificate.certificate_name.asc())).all()
    return [CertificateCatalogItem.model_validate(c) for c in certs]


def get_domains_catalog(db: Session) -> list[DomainCatalogItem]:
    """Lấy danh mục các lĩnh vực chuẩn hóa hệ thống."""
    domains = db.scalars(select(Domain).order_by(Domain.domain_name.asc())).all()
    return [DomainCatalogItem.model_validate(d) for d in domains]

