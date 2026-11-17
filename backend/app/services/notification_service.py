"""Notification service for managing other_notifications and job_notifications."""

from datetime import datetime, timezone
import logging
from typing import Optional
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.system import OtherNotification

logger = logging.getLogger(__name__)


def create_other_notification(
    db: Session,
    account_id: uuid.UUID,
    notification_type: str,
    title: str,
    message: str,
) -> OtherNotification:
    """Tạo bản ghi thông báo mới vào bảng other_notifications."""
    notification = OtherNotification(
        account_id=account_id,
        notification_type=notification_type,
        title=title,
        message=message,
        is_read=False,
    )
    db.add(notification)
    db.flush()
    logger.info(
        "Tạo thông báo type=%s cho account_id=%s thành công (id=%s)",
        notification_type,
        account_id,
        notification.notification_id,
    )
    return notification


def get_account_notifications(
    db: Session,
    account_id: uuid.UUID,
    unread_only: bool = False,
    limit: int = 50,
) -> list[OtherNotification]:
    """Lấy danh sách thông báo hệ thống của một tài khoản."""
    query = select(OtherNotification).where(OtherNotification.account_id == account_id)
    if unread_only:
        query = query.where(OtherNotification.is_read.is_(False))

    return list(
        db.scalars(
            query.order_by(OtherNotification.created_at.desc()).limit(limit)
        ).all()
    )


def mark_notification_as_read(
    db: Session,
    notification_id: int,
    account_id: uuid.UUID,
) -> Optional[OtherNotification]:
    """Đánh dấu một thông báo là đã đọc."""
    notification = db.get(OtherNotification, notification_id)
    if notification and notification.account_id == account_id:
        notification.is_read = True
        notification.read_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(notification)
        return notification
    return None
