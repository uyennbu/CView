"""Notification service for managing other_notifications and job_notifications."""

from datetime import datetime, timezone
import logging
from typing import Any, Optional
import uuid

from sqlalchemy import delete, func, or_, select, update
from sqlalchemy.orm import Session

from app.models.business import (
    Address,
    CandidateProfile,
    Company,
    JobDomain,
    JobNotification,
    JobPost,
    SearchHistory,
)
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


def create_job_notification(
    db: Session,
    candidate_id: uuid.UUID,
    job_post_id: uuid.UUID,
    title: str,
    content: str,
) -> JobNotification:
    """Tạo bản ghi thông báo việc làm mới vào bảng job_notifications."""
    notification = JobNotification(
        candidate_id=candidate_id,
        job_post_id=job_post_id,
        title=title,
        content=content,
        is_read=False,
    )
    db.add(notification)
    db.flush()
    logger.info(
        "Tạo thông báo job_notifications cho candidate_id=%s, job_post_id=%s (id=%s)",
        candidate_id,
        job_post_id,
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


def get_candidate_job_notifications(
    db: Session,
    candidate_id: uuid.UUID,
    unread_only: bool = False,
    limit: int = 50,
) -> list[JobNotification]:
    """Lấy danh sách thông báo việc làm phù hợp của một ứng viên."""
    query = select(JobNotification).where(JobNotification.candidate_id == candidate_id)
    if unread_only:
        query = query.where(JobNotification.is_read.is_(False))

    return list(
        db.scalars(
            query.order_by(JobNotification.created_at.desc()).limit(limit)
        ).all()
    )


def get_notifications_for_account(
    db: Session,
    account_id: uuid.UUID,
    page: int = 1,
    limit: int = 20,
    is_read: Optional[bool] = None,
    notification_type: Optional[str] = None,
    unread_only: bool = False,
) -> dict[str, Any]:
    """Lấy danh sách thông báo hệ thống và gợi ý việc làm kèm phân trang và bộ lọc trạng thái/loại."""
    # Xác định trạng thái đọc
    effective_is_read = is_read
    if effective_is_read is None and unread_only:
        effective_is_read = False

    type_clean = notification_type.strip().upper() if notification_type else None
    offset = (page - 1) * limit

    candidate = db.scalar(
        select(CandidateProfile).where(CandidateProfile.account_id == account_id)
    )

    # 1. Xử lý job_notifications (nếu loại yêu cầu bao gồm JOB)
    job_notifs: list[JobNotification] = []
    total_job = 0
    allow_job = type_clean in [None, "ALL", "JOB", "JOB_SUGGESTION"]
    if allow_job and candidate:
        query_job = select(JobNotification).where(
            JobNotification.candidate_id == candidate.candidate_id
        )
        if effective_is_read is not None:
            query_job = query_job.where(JobNotification.is_read.is_(effective_is_read))

        total_job = (
            db.scalar(
                select(func.count()).select_from(
                    query_job.subquery()
                )
            )
            or 0
        )
        job_notifs = list(
            db.scalars(
                query_job.order_by(JobNotification.created_at.desc())
                .offset(offset)
                .limit(limit)
            ).all()
        )

    # 2. Xử lý other_notifications (nếu loại yêu cầu bao gồm SYSTEM / OTHER hoặc mã cụ thể)
    other_notifs: list[OtherNotification] = []
    total_other = 0
    allow_other = type_clean not in ["JOB", "JOB_SUGGESTION"]
    if allow_other:
        query_other = select(OtherNotification).where(
            OtherNotification.account_id == account_id
        )
        if effective_is_read is not None:
            query_other = query_other.where(
                OtherNotification.is_read.is_(effective_is_read)
            )

        if type_clean and type_clean not in ["ALL", "SYSTEM", "OTHER"]:
            query_other = query_other.where(
                OtherNotification.notification_type == type_clean
            )

        total_other = (
            db.scalar(
                select(func.count()).select_from(
                    query_other.subquery()
                )
            )
            or 0
        )
        other_notifs = list(
            db.scalars(
                query_other.order_by(OtherNotification.created_at.desc())
                .offset(offset)
                .limit(limit)
            ).all()
        )

    # 3. Đếm tổng số thông báo chưa đọc toàn bộ của tài khoản (dành cho badge)
    unread_counts = get_unread_count(db=db, account_id=account_id)
    total_unread = unread_counts["total_unread"]

    total = total_job + total_other
    total_pages = (total + limit - 1) // limit if limit > 0 and total > 0 else (0 if total == 0 else 1)

    return {
        "job_notifications": job_notifs,
        "other_notifications": other_notifs,
        "total_unread": total_unread,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


def get_unread_count(db: Session, account_id: uuid.UUID) -> dict[str, int]:
    """Lấy số lượng thông báo chưa đọc của tài khoản."""
    unread_other = (
        db.scalar(
            select(func.count(OtherNotification.notification_id)).where(
                OtherNotification.account_id == account_id,
                OtherNotification.is_read.is_(False),
            )
        )
        or 0
    )

    candidate = db.scalar(
        select(CandidateProfile).where(CandidateProfile.account_id == account_id)
    )
    unread_job = 0
    if candidate:
        unread_job = (
            db.scalar(
                select(func.count(JobNotification.notification_id)).where(
                    JobNotification.candidate_id == candidate.candidate_id,
                    JobNotification.is_read.is_(False),
                )
            )
            or 0
        )

    return {
        "unread_other_count": unread_other,
        "unread_job_count": unread_job,
        "total_unread": unread_other + unread_job,
    }


def mark_notification_as_read(
    db: Session,
    notification_id: int,
    account_id: uuid.UUID,
) -> Optional[Any]:
    """Đánh dấu một thông báo là đã đọc (hỗ trợ cả OtherNotification và JobNotification)."""
    now_utc = datetime.now(timezone.utc)

    # 1. Kiểm tra trong other_notifications
    other_notif = db.get(OtherNotification, notification_id)
    if other_notif and other_notif.account_id == account_id:
        other_notif.is_read = True
        other_notif.read_at = now_utc
        db.commit()
        db.refresh(other_notif)
        return other_notif

    # 2. Kiểm tra trong job_notifications nếu tài khoản là Candidate
    candidate = db.scalar(
        select(CandidateProfile).where(CandidateProfile.account_id == account_id)
    )
    if candidate:
        job_notif = db.get(JobNotification, notification_id)
        if job_notif and job_notif.candidate_id == candidate.candidate_id:
            job_notif.is_read = True
            job_notif.read_at = now_utc
            db.commit()
            db.refresh(job_notif)
            return job_notif

    return None


def mark_all_notifications_as_read(db: Session, account_id: uuid.UUID) -> int:
    """Đánh dấu tất cả thông báo của tài khoản là đã đọc."""
    now_utc = datetime.now(timezone.utc)

    stmt_other = (
        update(OtherNotification)
        .where(
            OtherNotification.account_id == account_id,
            OtherNotification.is_read.is_(False),
        )
        .values(is_read=True, read_at=now_utc)
    )
    res_other = db.execute(stmt_other)
    count = res_other.rowcount or 0

    candidate = db.scalar(
        select(CandidateProfile).where(CandidateProfile.account_id == account_id)
    )
    if candidate:
        stmt_job = (
            update(JobNotification)
            .where(
                JobNotification.candidate_id == candidate.candidate_id,
                JobNotification.is_read.is_(False),
            )
            .values(is_read=True, read_at=now_utc)
        )
        res_job = db.execute(stmt_job)
        count += res_job.rowcount or 0

    db.commit()
    return count


def delete_notification(
    db: Session, notification_id: int, account_id: uuid.UUID
) -> bool:
    """Xóa một thông báo nếu thuộc quyền sở hữu của tài khoản."""
    # Thử xóa trong other_notifications
    other_notif = db.get(OtherNotification, notification_id)
    if other_notif and other_notif.account_id == account_id:
        db.delete(other_notif)
        db.commit()
        return True

    # Thử xóa trong job_notifications nếu tài khoản là ứng viên
    candidate = db.scalar(
        select(CandidateProfile).where(CandidateProfile.account_id == account_id)
    )
    if candidate:
        job_notif = db.get(JobNotification, notification_id)
        if job_notif and job_notif.candidate_id == candidate.candidate_id:
            db.delete(job_notif)
            db.commit()
            return True

    return False


def auto_generate_job_notifications_for_post(
    db: Session, job_post_id: uuid.UUID
) -> list[JobNotification]:
    """Tự động quét lịch sử tìm kiếm và gửi job_notifications cho các ứng viên phù hợp khi tin được duyệt."""
    job = db.get(JobPost, job_post_id)
    if not job:
        return []

    company_name = job.company.name if job.company else "Nhà tuyển dụng"
    address = db.get(Address, job.address_id) if job.address_id else None
    city = address.city if address else None

    # Lấy các domain_id gắn với job
    job_domain_ids = [jd.domain_id for jd in job.domains]

    # Tìm các ứng viên có lịch sử tìm kiếm tương đồng
    search_conditions = []
    if job_domain_ids:
        search_conditions.append(SearchHistory.domain_id.in_(job_domain_ids))
    if city:
        search_conditions.append(SearchHistory.city.ilike(f"%{city}%"))
    if job.title:
        title_words = [w.strip() for w in job.title.split() if len(w.strip()) >= 2]
        for kw in title_words:
            search_conditions.append(SearchHistory.keyword.ilike(f"%{kw}%"))
    if job.position:
        pos_words = [w.strip() for w in job.position.split() if len(w.strip()) >= 2]
        for kw in pos_words:
            search_conditions.append(SearchHistory.keyword.ilike(f"%{kw}%"))

    if not search_conditions:
        return []

    matched_candidate_ids = set(
        db.scalars(
            select(SearchHistory.candidate_id)
            .where(or_(*search_conditions))
            .distinct()
            .limit(100)
        ).all()
    )

    created_notifs: list[JobNotification] = []
    for cand_id in matched_candidate_ids:
        # Tránh gửi thông báo lặp lại cho cùng 1 ứng viên và 1 bài đăng
        existing = db.scalar(
            select(JobNotification).where(
                JobNotification.candidate_id == cand_id,
                JobNotification.job_post_id == job_post_id,
            )
        )
        if existing:
            continue

        notif = JobNotification(
            candidate_id=cand_id,
            job_post_id=job_post_id,
            title=f"Cơ hội việc làm mới: {job.title}",
            content=(
                f"{company_name} vừa đăng tuyển vị trí '{job.title}' "
                f"phù hợp với lịch sử tìm kiếm gần đây của bạn."
            ),
            is_read=False,
        )
        db.add(notif)
        created_notifs.append(notif)

    if created_notifs:
        db.flush()
        logger.info(
            "Đã tự động tạo %d job_notifications cho job_post_id=%s",
            len(created_notifs),
            job_post_id,
        )

    return created_notifs
