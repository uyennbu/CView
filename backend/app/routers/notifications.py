from fastapi import APIRouter

router = APIRouter(prefix="/notifications", tags=["Notifications (Thông báo Job mới & Hệ thống)"])


@router.get("")
def list_notifications():
    """Lấy danh sách job_notifications và other_notifications cho chuông thông báo trên Navbar."""
    return {"job_notifications": [], "other_notifications": []}

