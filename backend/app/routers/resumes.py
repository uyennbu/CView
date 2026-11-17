from fastapi import APIRouter, Depends, status

from app.core.dependencies import bearer_scheme

router = APIRouter(prefix="/resumes", tags=["CV Analysis (Tải CV PDF & Phân tích độ phù hợp)"])


@router.post("/upload", status_code=status.HTTP_201_CREATED, dependencies=[Depends(bearer_scheme)])
def upload_cv():
    """Tải lên hồ sơ CV (activity: UPLOAD_RESUME)."""
    return {"message": "Tải lên hồ sơ CV thành công", "resume_id": "res-demo-001"}


@router.post("/analyze", dependencies=[Depends(bearer_scheme)])
def analyze_cv():
    """Nhận file PDF + bộ lọc trên trang 'Phân tích CV' -> trả về Chấm điểm, Góp ý, Đề xuất việc làm (activity: ANALYZE_CV)."""
    return {"message": "Endpoint phân tích CV đã sẵn sàng", "analysis_id": "anl-demo-001"}

