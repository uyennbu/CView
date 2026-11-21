"""Router for Notifications (Job suggestions & other system notifications)."""

from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_token_payload
from app.schemas.notifications import (
    CreateJobNotificationRequest,
    CreateOtherNotificationRequest,
    JobNotificationResponse,
    MarkAllNotificationsReadResponse,
    MarkNotificationReadResponse,
    NotificationListResponse,
    OtherNotificationResponse,
    UnreadCountResponse,
)
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications (Thông báo Job mới & Hệ thống)"])


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    page: int = Query(1, ge=1, description="Số thứ tự trang hiện tại"),
    limit: int = Query(20, ge=1, le=100, description="Số lượng thông báo tối đa mỗi trang"),
    is_read: Optional[bool] = Query(
        None, description="Lọc theo trạng thái đã đọc: True (đã đọc), False (chưa đọc), None (tất cả)"
    ),
    type: Optional[str] = Query(
        None,
        description=(
            "Lọc theo loại: 'ALL', 'JOB' (gợi ý việc làm), 'SYSTEM' (thông báo hệ thống), "
            "hoặc chi tiết: 'JOB_APPROVAL_STATUS', 'APPLICATION_UPDATE', "
            "'CV_PARSE_COMPLETED', 'ACCOUNT_SECURITY', 'SYSTEM_ANNOUNCEMENT'"
        ),
    ),
    unread_only: bool = Query(False, description="Tương thích ngược: Nếu True tương đương is_read=False"),
    token_payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
):
    """Lấy danh sách job_notifications và other_notifications (hỗ trợ phân trang, lọc theo loại, chưa đọc/đã đọc)."""
    account_id = uuid.UUID(token_payload.get("sub"))
    notif_data = notification_service.get_notifications_for_account(
        db=db,
        account_id=account_id,
        page=page,
        limit=limit,
        is_read=is_read,
        notification_type=type,
        unread_only=unread_only,
    )

    job_notifs_formatted = []
    for jn in notif_data["job_notifications"]:
        item = JobNotificationResponse.model_validate(jn)
        if jn.job_post:
            item.job_title = jn.job_post.title
            if jn.job_post.company:
                item.company_name = jn.job_post.company.name
        job_notifs_formatted.append(item)

    other_notifs_formatted = [
        OtherNotificationResponse.model_validate(on)
        for on in notif_data["other_notifications"]
    ]

    return NotificationListResponse(
        job_notifications=job_notifs_formatted,
        other_notifications=other_notifs_formatted,
        total_unread=notif_data["total_unread"],
        total=notif_data["total"],
        page=notif_data["page"],
        limit=notif_data["limit"],
        total_pages=notif_data["total_pages"],
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    token_payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
):
    """Lấy số lượng thông báo chưa đọc phân loại chi tiết theo hệ thống và việc làm."""
    account_id = uuid.UUID(token_payload.get("sub"))
    counts = notification_service.get_unread_count(db=db, account_id=account_id)
    return UnreadCountResponse(**counts)


@router.patch("/read-all", response_model=MarkAllNotificationsReadResponse)
def mark_all_notifications_read(
    token_payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
):
    """Đánh dấu toàn bộ thông báo của tài khoản là đã đọc."""
    account_id = uuid.UUID(token_payload.get("sub"))
    updated_count = notification_service.mark_all_notifications_as_read(
        db=db, account_id=account_id
    )
    return MarkAllNotificationsReadResponse(
        success=True,
        updated_count=updated_count,
        message=f"Đã đánh dấu {updated_count} thông báo là đã đọc.",
    )


@router.patch("/{notification_id}/read", response_model=MarkNotificationReadResponse)
def mark_notification_read(
    notification_id: int,
    token_payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
):
    """Đánh dấu 1 thông báo là đã đọc (hỗ trợ cả thông báo hệ thống và việc làm)."""
    account_id = uuid.UUID(token_payload.get("sub"))
    notif = notification_service.mark_notification_as_read(
        db=db,
        notification_id=notification_id,
        account_id=account_id,
    )
    if not notif:
        return MarkNotificationReadResponse(
            success=False,
            notification_id=notification_id,
            is_read=False,
            read_at=None,
            message="Thông báo không tồn tại hoặc không thuộc quyền sở hữu.",
        )
    return MarkNotificationReadResponse(
        success=True,
        notification_id=notif.notification_id,
        is_read=notif.is_read,
        read_at=notif.read_at,
        message="Đã cập nhật trạng thái đã đọc thành công.",
    )


@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
def delete_notification(
    notification_id: int,
    token_payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
):
    """Xóa một thông báo của tài khoản."""
    account_id = uuid.UUID(token_payload.get("sub"))
    deleted = notification_service.delete_notification(
        db=db,
        notification_id=notification_id,
        account_id=account_id,
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thông báo không tồn tại hoặc bạn không có quyền xóa.",
        )
    return {"success": True, "message": "Đã xóa thông báo thành công."}


@router.post("/other", response_model=OtherNotificationResponse, status_code=status.HTTP_201_CREATED)
def create_system_notification(
    payload: CreateOtherNotificationRequest,
    token_payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
):
    """Tạo mới thông báo hệ thống (Dành cho Admin)."""
    roles = token_payload.get("roles", [])
    if "ADMIN" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ quản trị viên (Admin) mới có quyền gửi thông báo hệ thống.",
        )

    valid_types = {
        "JOB_APPROVAL_STATUS",
        "APPLICATION_UPDATE",
        "CV_PARSE_COMPLETED",
        "ACCOUNT_SECURITY",
        "SYSTEM_ANNOUNCEMENT",
    }
    if payload.notification_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Loại thông báo không hợp lệ. Phải thuộc một trong các giá trị: {valid_types}",
        )

    notif = notification_service.create_other_notification(
        db=db,
        account_id=payload.account_id,
        notification_type=payload.notification_type,
        title=payload.title,
        message=payload.message,
    )
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/job", response_model=JobNotificationResponse, status_code=status.HTTP_201_CREATED)
def create_job_notification(
    payload: CreateJobNotificationRequest,
    token_payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
):
    """Tạo mới thông báo việc làm cho ứng viên (Dành cho Admin / Hệ thống)."""
    roles = token_payload.get("roles", [])
    if "ADMIN" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ quản trị viên mới có quyền tạo thông báo việc làm thủ công.",
        )

    notif = notification_service.create_job_notification(
        db=db,
        candidate_id=payload.candidate_id,
        job_post_id=payload.job_post_id,
        title=payload.title,
        content=payload.content,
    )
    db.commit()
    db.refresh(notif)
    return notif
