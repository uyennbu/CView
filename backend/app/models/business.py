"""Business models for Tables 10-13 in docs/DESIGN.md (Addresses, Companies, Profiles)."""
from datetime import date, datetime
from decimal import Decimal
import uuid

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

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
