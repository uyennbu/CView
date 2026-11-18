from fastapi import APIRouter

router = APIRouter(prefix="/statistics", tags=["Statistics (Thống kê Ứng viên, Nhà tuyển dụng & Admin)"])


@router.get("/candidate")
def candidate_statistics():
    """Thống kê lịch sử sử dụng và kết quả matching trong trang Account Ứng viên."""
    return {"summary": {}}


@router.get("/recruiter")
def recruiter_statistics():
    """Thống kê độ phổ biến bài đăng, tiếp cận ứng viên và phân phối điểm matching trong UI Nhà tuyển dụng."""
    return {"summary": {}}


@router.get("/admin")
def admin_statistics():
    """Thống kê lịch sử hoạt động và tương tác toàn hệ thống cho Admin."""
    return {"summary": {}}

