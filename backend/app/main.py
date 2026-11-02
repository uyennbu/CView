from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, jobs, notifications, resumes, statistics

app = FastAPI(
    title=settings.APP_NAME,
    description="Hệ thống phân tích độ phù hợp CV và kết nối doanh nghiệp tuyển dụng (CView)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(jobs.router, prefix=settings.API_V1_PREFIX)
app.include_router(resumes.router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications.router, prefix=settings.API_V1_PREFIX)
app.include_router(statistics.router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Health Check"])
def health_check():
    """Kiểm tra trạng thái hoạt động của Backend trên VM2."""
    return {"status": "ok", "service": settings.APP_NAME, "environment": settings.APP_ENV}

