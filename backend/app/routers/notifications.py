"""Router for Notifications (Job suggestions & other system notifications)."""

from typing import Optional
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_token_payload
from app.schemas.jobs import OtherNotificationResponse
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications (Thông báo Job mới & Hệ thống)"])


@router.get("")
def list_notifications(
    unread_only: bool = Query(False, description="Chỉ lấy các thông báo chưa đọc"),
    limit: int = Query(50, ge=1, le=100, description="Số lượng thông báo tối đa"),
    token_payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
):
    """Lấy danh sách job_notifications và other_notifications cho chuông thông báo trên Navbar."""
    account_id = uuid.UUID(token_payload.get("sub"))
    other_notifs = notification_service.get_account_notifications(
        db=db,
        account_id=account_id,
        unread_only=unread_only,
        limit=limit,
    )
    return {
        "job_notifications": [],
        "other_notifications": [
            OtherNotificationResponse.model_validate(n) for n in other_notifs
        ],
    }


@router.patch("/{notification_id}/read", status_code=status.HTTP_200_OK)
def mark_notification_read(
    notification_id: int,
    token_payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
):
    """Đánh dấu thông báo là đã đọc (is_read = TRUE, read_at = now)."""
    account_id = uuid.UUID(token_payload.get("sub"))
    notif = notification_service.mark_notification_as_read(
        db=db,
        notification_id=notification_id,
        account_id=account_id,
    )
    if not notif:
        return {"success": False, "message": "Thông báo không tồn tại hoặc không thuộc quyền sở hữu."}
    return {
        "success": True,
        "notification_id": notif.notification_id,
        "is_read": notif.is_read,
        "read_at": notif.read_at,
    }
