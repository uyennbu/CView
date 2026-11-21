"""Pydantic schemas for Notification models (job_notifications & other_notifications)."""

from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel, Field


class OtherNotificationResponse(BaseModel):
    """Schema phản hồi thông báo hệ thống (bảng other_notifications)."""

    notification_id: int
    account_id: uuid.UUID
    notification_type: str
    title: str
    message: str
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class JobNotificationResponse(BaseModel):
    """Schema phản hồi thông báo gợi ý việc làm (bảng job_notifications)."""

    notification_id: int
    candidate_id: uuid.UUID
    job_post_id: uuid.UUID
    title: str
    content: str
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    job_title: Optional[str] = None
    company_name: Optional[str] = None

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    """Danh sách thông báo kết hợp cho chuông thông báo trên giao diện."""

    job_notifications: list[JobNotificationResponse] = Field(
        default_factory=list, description="Danh sách gợi ý việc làm phù hợp (dành cho ứng viên)"
    )
    other_notifications: list[OtherNotificationResponse] = Field(
        default_factory=list, description="Danh sách thông báo hệ thống / kiểm duyệt"
    )
    total_unread: int = Field(0, description="Tổng số lượng thông báo chưa đọc")


class UnreadCountResponse(BaseModel):
    """Số lượng thông báo chưa đọc phân loại chi tiết."""

    unread_other_count: int = 0
    unread_job_count: int = 0
    total_unread: int = 0


class MarkNotificationReadResponse(BaseModel):
    """Phản hồi sau khi đánh dấu đọc 1 thông báo."""

    success: bool
    notification_id: int
    is_read: bool
    read_at: Optional[datetime] = None
    message: Optional[str] = None


class MarkAllNotificationsReadResponse(BaseModel):
    """Phản hồi sau khi đánh dấu đọc toàn bộ thông báo."""

    success: bool
    updated_count: int
    message: str


class CreateOtherNotificationRequest(BaseModel):
    """Dữ liệu yêu cầu tạo mới thông báo hệ thống."""

    account_id: uuid.UUID = Field(..., description="ID tài khoản nhận thông báo")
    notification_type: str = Field(
        ...,
        description=(
            "Loại thông báo: 'JOB_APPROVAL_STATUS', 'APPLICATION_UPDATE', "
            "'CV_PARSE_COMPLETED', 'ACCOUNT_SECURITY', 'SYSTEM_ANNOUNCEMENT'"
        ),
    )
    title: str = Field(..., min_length=1, max_length=255, description="Tiêu đề thông báo")
    message: str = Field(..., min_length=1, description="Nội dung chi tiết thông báo")


class CreateJobNotificationRequest(BaseModel):
    """Dữ liệu yêu cầu tạo mới thông báo việc làm phù hợp cho ứng viên."""

    candidate_id: uuid.UUID = Field(..., description="ID hồ sơ ứng viên nhận thông báo")
    job_post_id: uuid.UUID = Field(..., description="ID bài đăng tuyển dụng được gợi ý")
    title: str = Field(..., min_length=1, max_length=255, description="Tiêu đề gợi ý việc làm")
    content: str = Field(..., min_length=1, description="Nội dung mô tả ngắn gọn về việc làm")
