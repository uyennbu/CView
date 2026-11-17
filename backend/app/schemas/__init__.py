"""Pydantic schemas for request validation and response serialization."""

from app.schemas.auth import (
    CandidateRegisterRequest,
    CurrentAccountResponse,
    LoginRequest,
    RecruiterRegisterRequest,
    RefreshTokenRequest,
    TokenResponse,
)
from app.schemas.candidate import (
    AddressResponse,
    AddressUpdateRequest,
    CandidateProfileResponse,
    CandidateProfileUpdateRequest,
)
from app.schemas.jobs import (
    CertificateCatalogItem,
    DomainCatalogItem,
    JobCertificateInput,
    JobCertificateResponse,
    JobDomainResponse,
    JobModerationRequest,
    JobModerationResponse,
    JobPostCreateRequest,
    JobPostResponse,
    JobSkillInput,
    JobSkillResponse,
    OtherNotificationResponse,
    RecruiterJobListResponse,
    SkillCatalogItem,
)
from app.schemas.recruiter import (
    CompanyResponse,
    CompanyUpdateRequest,
    RecruiterProfileResponse,
    RecruiterProfileUpdateRequest,
)

__all__ = [
    "LoginRequest",
    "CandidateRegisterRequest",
    "RecruiterRegisterRequest",
    "RefreshTokenRequest",
    "TokenResponse",
    "CurrentAccountResponse",
    "AddressResponse",
    "AddressUpdateRequest",
    "CandidateProfileResponse",
    "CandidateProfileUpdateRequest",
    "CompanyResponse",
    "CompanyUpdateRequest",
    "RecruiterProfileResponse",
    "RecruiterProfileUpdateRequest",
    "JobSkillInput",
    "JobSkillResponse",
    "JobCertificateInput",
    "JobCertificateResponse",
    "JobDomainResponse",
    "JobPostCreateRequest",
    "JobPostResponse",
    "RecruiterJobListResponse",
    "SkillCatalogItem",
    "CertificateCatalogItem",
    "DomainCatalogItem",
    "JobModerationRequest",
    "JobModerationResponse",
    "OtherNotificationResponse",
]
