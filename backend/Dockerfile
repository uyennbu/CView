# Sử dụng base image Python 3.12 slim chính thức để tối ưu dung lượng và bảo mật
FROM python:3.12-slim

# Thiết lập các biến môi trường chuẩn cho Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Cài đặt các gói hệ thống cần thiết (curl để healthcheck, libpq-dev và gcc cho PostgreSQL client)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file requirements.txt trước để tận dụng cơ chế Docker layer caching
COPY requirements.txt .

# Cài đặt các thư viện Python
RUN pip install -r requirements.txt

# Sao chép toàn bộ mã nguồn Backend vào thư mục làm việc
COPY . .

# Tạo thư mục lưu trữ CV PDF tải lên (phục vụ upload resumes)
RUN mkdir -p uploads/resumes

# Khai báo mở cổng 8000 của FastAPI Backend
EXPOSE 8000

# Healthcheck định kỳ qua endpoint /health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Lệnh khởi chạy ứng dụng FastAPI với Uvicorn (hỗ trợ hot-reload cho môi trường dev)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

