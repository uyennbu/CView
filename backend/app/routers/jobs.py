from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel

from app.core.dependencies import bearer_scheme, require_roles
from app.middlewares import set_activity_log

router = APIRouter(prefix="/jobs", tags=["Jobs (Tìm việc, Đăng bài & Kiểm duyệt)"])


class JobModerationRequest(BaseModel):
    approval_status: str = "APPROVED"
    rejection_reason: str | None = None


@router.get("/search", dependencies=[Depends(bearer_scheme)])
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
    request: Request,
    payload: JobModerationRequest | None = None,
    token_payload: dict = Depends(require_roles("ADMIN")),
):
    """Kiểm duyệt tin tuyển dụng (yêu cầu quyền ADMIN)."""
    status_val = payload.approval_status if payload and payload.approval_status else "APPROVED"
    action = "REJECT_JOB_POST" if status_val.upper() == "REJECTED" else "APPROVE_JOB_POST"
    set_activity_log(
        request,
        action_type=action,
        target_entity="JOB_POST",
        target_id=job_id,
        details={
            "approval_status": status_val,
            "rejection_reason": payload.rejection_reason if payload else None,
        },
    )
    return {
        "job_id": job_id,
        "status": status_val,
        "approval_status": status_val,
        "moderated_by": token_payload.get("sub"),
        "message": f"Tin tuyển dụng {job_id} đã được chuyển sang trạng thái {status_val}.",
    }


@router.get("/{job_id}", dependencies=[Depends(bearer_scheme)])
def get_job_detail(job_id: str):
    """Xem chi tiết bài tuyển dụng (activity: VIEW_JOB)."""
    return {
        "job_id": job_id,
        "title": "Software Engineer",
        "description": "Chi tiết công việc",
    }


@router.post("/{job_id}/save", status_code=status.HTTP_200_OK)
def save_job(job_id: str, token_payload: dict = Depends(require_roles("CANDIDATE"))):
    """Lưu việc làm yêu thích (activity: SAVE_JOB)."""
    return {
        "job_id": job_id,
        "candidate_id": token_payload.get("sub"),
        "saved": True,
        "message": f"Đã lưu công việc {job_id} vào danh sách yêu thích.",
    }


@router.post("/{job_id}/apply", status_code=status.HTTP_201_CREATED)
def apply_job(job_id: str, token_payload: dict = Depends(require_roles("CANDIDATE"))):
    """Nộp đơn ứng tuyển việc làm (activity: APPLY_JOB)."""
    return {
        "job_id": job_id,
        "candidate_id": token_payload.get("sub"),
        "status": "SUBMITTED",
        "message": f"Đã nộp đơn ứng tuyển công việc {job_id} thành công.",
    }
