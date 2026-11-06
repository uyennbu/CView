from fastapi import APIRouter

router = APIRouter(prefix="/resumes", tags=["CV Analysis (Tải CV PDF & Phân tích độ phù hợp)"])


@router.post("/analyze")
def analyze_cv():
    """Nhận file PDF + bộ lọc trên trang 'Phân tích CV' -> trả về Chấm điểm, Góp ý, Đề xuất việc làm."""
    return {"message": "Endpoint phân tích CV đã sẵn sàng"}

