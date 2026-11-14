"""Pydantic schemas for Job Postings, Skills, Certificates, and Domains."""

from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel, Field, model_validator

from app.schemas.candidate import AddressResponse, AddressUpdateRequest


class JobSkillInput(BaseModel):
    """Kỹ năng yêu cầu cho bài đăng tuyển dụng."""

    skill_id: int = Field(..., description="ID kỹ năng chuẩn hóa trong hệ thống")
    requirement_type: str = Field(
        default="MANDATORY",
        pattern=r"^(MANDATORY|PREFERRED)$",
        description="Mức độ yêu cầu: MANDATORY (bắt buộc) hoặc PREFERRED (ưu tiên)",
    )
    min_years_experience: float = Field(
        default=0.0,
        ge=0.0,
        le=50.0,
        description="Số năm kinh nghiệm tối thiểu yêu cầu cho kỹ năng này",
    )


class JobSkillResponse(BaseModel):
    """Thông tin chi tiết kỹ năng gắn với bài đăng."""

    skill_id: int
    skill_name: str
    category: str
    requirement_type: str
    min_years_experience: float

    model_config = {"from_attributes": True}


class JobCertificateInput(BaseModel):
    """Chứng chỉ yêu cầu cho bài đăng tuyển dụng."""

    certificate_id: int = Field(..., description="ID chứng chỉ chuẩn hóa trong hệ thống")
    is_mandatory: bool = Field(
        default=False,
        description="Chứng chỉ này là bắt buộc (True) hay ưu tiên/tùy chọn (False)",
    )


class JobCertificateResponse(BaseModel):
    """Thông tin chi tiết chứng chỉ gắn với bài đăng."""

    certificate_id: int
    certificate_name: str
    issuer: str
    is_mandatory: bool

    model_config = {"from_attributes": True}


class JobDomainResponse(BaseModel):
    """Lĩnh vực chuyên môn gắn với bài đăng."""

    domain_id: int
    domain_name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class JobPostCreateRequest(BaseModel):
    """Schema tạo mới tin tuyển dụng từ Nhà tuyển dụng (POST /jobs)."""

    title: str = Field(..., min_length=3, max_length=255, description="Tiêu đề tin tuyển dụng")
    position: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Vị trí công việc (ví dụ: Backend Developer, Data Engineer)",
    )
    job_description: str = Field(..., min_length=10, description="Mô tả chi tiết công việc")
    requirements: str = Field(..., min_length=5, description="Yêu cầu đối với ứng viên")
    benefits: Optional[str] = Field(None, description="Quyền lợi và chế độ đãi ngộ")
    job_type: str = Field(
        ...,
        pattern=r"^(FULL_TIME|PART_TIME|INTERNSHIP|CONTRACT|FREELANCE)$",
        description="Hình thức làm việc: FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT, FREELANCE",
    )
    workplace_type: str = Field(
        ...,
        pattern=r"^(ON_SITE|HYBRID|REMOTE)$",
        description="Môi trường làm việc: ON_SITE, HYBRID, REMOTE",
    )
    address_id: Optional[uuid.UUID] = Field(
        None, description="ID địa chỉ làm việc đã lưu trong hệ thống"
    )
    address: Optional[AddressUpdateRequest] = Field(
        None, description="Tạo mới địa chỉ làm việc nếu chưa có trong danh mục"
    )
    salary_min: Optional[int] = Field(None, ge=0, description="Mức lương tối thiểu (VND)")
    salary_max: Optional[int] = Field(None, ge=0, description="Mức lương tối đa (VND)")
    is_salary_negotiable: bool = Field(default=False, description="Mức lương có thể thỏa thuận")
    experience_years_min: float = Field(
        default=0.0, ge=0.0, le=50.0, description="Số năm kinh nghiệm tối thiểu yêu cầu"
    )
    required_education: str = Field(
        default="NONE",
        pattern=r"^(NONE|HIGH_SCHOOL|ASSOCIATE|BACHELOR|MASTER)$",
        description="Trình độ học vấn yêu cầu: NONE, HIGH_SCHOOL, ASSOCIATE, BACHELOR, MASTER",
    )
    deadline: datetime = Field(
        ..., description="Hạn chót nộp hồ sơ ứng tuyển (ISO 8601, phải trong tương lai)"
    )
    skills: list[JobSkillInput] = Field(
        default_factory=list, description="Danh sách kỹ năng yêu cầu ('MANDATORY' hoặc 'PREFERRED')"
    )
    certificates: list[JobCertificateInput] = Field(
        default_factory=list, description="Danh sách chứng chỉ nghề nghiệp / ngoại ngữ"
    )
    domain_ids: list[int] = Field(
        default_factory=list, description="Danh sách ID lĩnh vực ngành nghề hoạt động"
    )

    @model_validator(mode="after")
    def validate_post_data(self):
        if self.salary_min is not None and self.salary_max is not None:
            if self.salary_max < self.salary_min:
                raise ValueError("salary_max phải lớn hơn hoặc bằng salary_min.")
        return self


class JobPostResponse(BaseModel):
    """Schema phản hồi chi tiết tin tuyển dụng."""

    job_post_id: uuid.UUID
    recruiter_id: uuid.UUID
    company_id: uuid.UUID
    company_name: Optional[str] = None
    title: str
    position: str
    job_description: str
    requirements: str
    benefits: Optional[str] = None
    job_type: str
    workplace_type: str
    address_id: Optional[uuid.UUID] = None
    address: Optional[AddressResponse] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    is_salary_negotiable: bool
    experience_years_min: float
    required_education: str
    approval_status: str
    rejection_reason: Optional[str] = None
    approved_by: Optional[uuid.UUID] = None
    approved_at: Optional[datetime] = None
    deadline: datetime
    created_at: datetime
    skills: list[JobSkillResponse] = Field(default_factory=list)
    certificates: list[JobCertificateResponse] = Field(default_factory=list)
    domains: list[JobDomainResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class RecruiterJobListResponse(BaseModel):
    """Danh sách tin tuyển dụng do nhà tuyển dụng đã đăng kèm trạng thái duyệt."""

    items: list[JobPostResponse]
    total: int
    page: int
    limit: int


class SkillCatalogItem(BaseModel):
    """Danh mục kỹ năng chuẩn hóa."""

    skill_id: int
    skill_name: str
    category: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class CertificateCatalogItem(BaseModel):
    """Danh mục chứng chỉ chuẩn hóa."""

    certificate_id: int
    certificate_name: str
    issuer: str
    category: str

    model_config = {"from_attributes": True}


class DomainCatalogItem(BaseModel):
    """Danh mục lĩnh vực chuẩn hóa."""

    domain_id: int
    domain_name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class JobModerationRequest(BaseModel):
    """Schema yêu cầu phê duyệt hoặc từ chối tin tuyển dụng từ Admin."""

    approval_status: str = Field(
        ...,
        pattern=r"^(APPROVED|REJECTED)$",
        description="Trạng thái phê duyệt: 'APPROVED' hoặc 'REJECTED'",
    )
    rejection_reason: Optional[str] = Field(
        None,
        max_length=1000,
        description="Lý do từ chối bài đăng (bắt buộc khi approval_status = 'REJECTED')",
    )


class JobModerationResponse(BaseModel):
    """Schema kết quả kiểm duyệt tin tuyển dụng."""

    job_id: uuid.UUID
    title: str
    approval_status: str
    approved_by: Optional[uuid.UUID] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    notification_id: Optional[int] = None
    message: str


class OtherNotificationResponse(BaseModel):
    """Schema thông báo hệ thống (bảng other_notifications)."""

    notification_id: int
    account_id: uuid.UUID
    notification_type: str
    title: str
    message: str
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


