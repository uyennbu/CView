from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from app.core.dependencies import require_roles

router = APIRouter(prefix="/jobs", tags=["Jobs (Tìm việc, Đăng bài & Kiểm duyệt)"])


class JobModerationRequest(BaseModel):
    approval_status: str = "APPROVED"
    rejection_reason: str | None = None


@router.get("/search")
def search_jobs(keyword: str | None = None, city: str | None = None, domain_id: int | None = None):
    """Tìm kiếm việc làm theo từ khóa trên trang 'Tìm việc' và lưu lịch sử vào search_history."""
    return {"items": [], "total": 0, "keyword": keyword, "city": city, "domain_id": domain_id}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_job(token_payload: dict = Depends(require_roles("RECRUITER", "ADMIN"))):
    """Đăng tin tuyển dụng (yêu cầu quyền RECRUITER)."""
    return {
        "status": "PENDING",
        "approval_status": "PENDING",
        "recruiter_id": token_payload.get("sub"),
        "message": "Tin tuyển dụng đã được tạo thành công và đang chờ kiểm duyệt.",
    }


@router.patch("/{job_id}/moderation")
def moderate_job(
    job_id: str,
    payload: JobModerationRequest | None = None,
    token_payload: dict = Depends(require_roles("ADMIN")),
):
    """Kiểm duyệt tin tuyển dụng (yêu cầu quyền ADMIN)."""
    status_val = payload.approval_status if payload and payload.approval_status else "APPROVED"
    return {
        "job_id": job_id,
        "status": status_val,
        "approval_status": status_val,
        "moderated_by": token_payload.get("sub"),
        "message": f"Tin tuyển dụng {job_id} đã được chuyển sang trạng thái {status_val}.",
    }
