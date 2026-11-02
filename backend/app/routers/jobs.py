from fastapi import APIRouter

router = APIRouter(prefix="/jobs", tags=["Jobs (Tìm việc, Đăng bài & Kiểm duyệt)"])


@router.get("/search")
def search_jobs(keyword: str | None = None, city: str | None = None, domain_id: int | None = None):
    """Tìm kiếm việc làm theo từ khóa trên trang 'Tìm việc' và lưu lịch sử vào search_history."""
    return {"items": [], "total": 0, "keyword": keyword, "city": city, "domain_id": domain_id}

