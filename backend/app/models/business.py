"""Business models for Tables 10-22 in docs/DESIGN.md."""
from datetime import date, datetime
from decimal import Decimal
import uuid

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Address(Base):
    """Bảng 11: addresses."""

    __tablename__ = "addresses"

    address_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    street_address: Mapped[str] = mapped_column(String(255), nullable=False)
    ward: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(50), nullable=False, default="Việt Nam")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class Company(Base):
    """Bảng 10: companies."""

    __tablename__ = "companies"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    address_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("addresses.address_id", ondelete="RESTRICT"),
        unique=True,
        nullable=False,
    )
    tax_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    industry: Mapped[str] = mapped_column(String(100), nullable=False)
    verification_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="UNVERIFIED"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class RecruiterProfile(Base):
    """Bảng 12: recruiter_profiles."""

    __tablename__ = "recruiter_profiles"

    recruiter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("accounts.account_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.company_id", ondelete="RESTRICT"),
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    job_title: Mapped[str] = mapped_column(String(100), nullable=False)
    work_email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone_number: Mapped[str | None] = mapped_column(String(15), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class CandidateProfile(Base):
    """Bảng 13: candidate_profiles."""

    __tablename__ = "candidate_profiles"

    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("accounts.account_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    address_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("addresses.address_id", ondelete="SET NULL"),
        nullable=True,
    )
    current_job_title: Mapped[str | None] = mapped_column(String(100), nullable=True)
    years_of_experience: Mapped[Decimal] = mapped_column(
        Numeric(3, 1), nullable=False, default=Decimal("0.0")
    )
    education_level: Mapped[str] = mapped_column(
        String(30), nullable=False, default="BACHELOR"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class Domain(Base):
    """Bảng 14: domains."""

    __tablename__ = "domains"

    domain_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    domain_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class Skill(Base):
    """Bảng 15: skills."""

    __tablename__ = "skills"

    skill_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    skill_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class Certificate(Base):
    """Bảng 16: certificates."""

    __tablename__ = "certificates"

    certificate_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    certificate_name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    issuer: Mapped[str] = mapped_column(String(100), nullable=False)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class JobPost(Base):
    """Bảng 19: job_posts."""

    __tablename__ = "job_posts"

    job_post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    recruiter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("recruiter_profiles.recruiter_id", ondelete="RESTRICT"),
        nullable=False,
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.company_id", ondelete="RESTRICT"),
        nullable=False,
    )
    position: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)
    requirements: Mapped[str] = mapped_column(Text, nullable=False)
    benefits: Mapped[str | None] = mapped_column(Text, nullable=True)
    job_type: Mapped[str] = mapped_column(String(20), nullable=False)
    workplace_type: Mapped[str] = mapped_column(String(20), nullable=False)
    address_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("addresses.address_id", ondelete="SET NULL"),
        nullable=True,
    )
    salary_min: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    is_salary_negotiable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    experience_years_min: Mapped[Decimal] = mapped_column(
        Numeric(3, 1), nullable=False, default=Decimal("0.0")
    )
    required_education: Mapped[str] = mapped_column(
        String(30), nullable=False, default="NONE"
    )
    approval_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="PENDING"
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("accounts.account_id", ondelete="SET NULL"),
        nullable=True,
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    recruiter: Mapped["RecruiterProfile"] = relationship(
        "RecruiterProfile", foreign_keys=[recruiter_id], lazy="joined"
    )
    company: Mapped["Company"] = relationship(
        "Company", foreign_keys=[company_id], lazy="joined"
    )
    address: Mapped[Address | None] = relationship(
        "Address", foreign_keys=[address_id], lazy="joined"
    )
    skills: Mapped[list["JobSkill"]] = relationship(
        "JobSkill", back_populates="job_post", cascade="all, delete-orphan", lazy="selectin"
    )
    certificates: Mapped[list["JobCertificate"]] = relationship(
        "JobCertificate",
        back_populates="job_post",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    domains: Mapped[list["JobDomain"]] = relationship(
        "JobDomain", back_populates="job_post", cascade="all, delete-orphan", lazy="selectin"
    )


class JobSkill(Base):
    """Bảng 20: job_skills."""

    __tablename__ = "job_skills"

    job_post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_posts.job_post_id", ondelete="CASCADE"),
        primary_key=True,
    )
    skill_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("skills.skill_id", ondelete="RESTRICT"), primary_key=True
    )
    requirement_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="MANDATORY"
    )
    min_years_experience: Mapped[Decimal] = mapped_column(
        Numeric(3, 1), nullable=False, default=Decimal("0.0")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    job_post: Mapped["JobPost"] = relationship("JobPost", back_populates="skills")
    skill: Mapped["Skill"] = relationship("Skill", lazy="joined")


class JobCertificate(Base):
    """Bảng 21: job_certificates."""

    __tablename__ = "job_certificates"

    job_post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_posts.job_post_id", ondelete="CASCADE"),
        primary_key=True,
    )
    certificate_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("certificates.certificate_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    is_mandatory: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    job_post: Mapped["JobPost"] = relationship("JobPost", back_populates="certificates")
    certificate: Mapped["Certificate"] = relationship("Certificate", lazy="joined")


class JobDomain(Base):
    """Bảng 22: job_domains."""

    __tablename__ = "job_domains"

    job_post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_posts.job_post_id", ondelete="CASCADE"),
        primary_key=True,
    )
    domain_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("domains.domain_id", ondelete="RESTRICT"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    job_post: Mapped["JobPost"] = relationship("JobPost", back_populates="domains")
    domain: Mapped["Domain"] = relationship("Domain", lazy="joined")
