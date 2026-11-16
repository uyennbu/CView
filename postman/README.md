# HƯỚNG DẪN SỬ DỤNG BỘ POSTMAN COLLECTION KIỂM THỬ AUTH & RBAC (CVIEW)

Bộ Postman Collection này được xây dựng phục vụ **Kế hoạch kiểm thử tổng thể (Master Test Plan - Sprint 1)** của dự án **CView - Doanh nghiệp nào cần bạn?**.

---

## 1. Danh mục tài liệu trong thư mục này
1. **`CView_Auth_RBAC_Session.postman_collection.json`**: Tập hợp 14 requests tự động hóa kiểm thử đầy đủ các kịch bản:
   - **Luồng Ứng viên (Candidate Flow):** Đăng ký mới, bắt lỗi trùng lặp (409), đăng nhập cấp JWT + Refresh token, lấy profile (`/auth/me`).
   - **Luồng Nhà tuyển dụng (Recruiter Flow):** Đăng ký kèm tạo công ty (`companies`) & MST, đăng nhập cấp quyền `RECRUITER`, tạo bài đăng tin (`POST /jobs`).
   - **Luồng Quản trị viên (Admin Flow):** Đăng nhập Admin, thực thi API kiểm duyệt tin tuyển dụng (`PATCH /jobs/{id}/moderation`).
   - **Kiểm thử Phân quyền (RBAC Boundary Tests):** Chặn ứng viên gọi API Admin/NTD (kỳ vọng `403 Forbidden`), mật khẩu sai (`401 Unauthorized`), tài khoản chưa kích hoạt `PENDING` (`403 Forbidden`), gọi thiếu token (`401 Unauthorized`).
   - **Quản lý Phiên làm việc (Session Lifecycle):** Xoay vòng Refresh Token (Token Rotation), phát hiện và chặn sử dụng lại token cũ (Reuse Detection), đăng xuất thu hồi session (`is_revoked = True`).
2. **`CView_Local_Environment.postman_environment.json`**: Môi trường biến chứa `base_url` và các biến lưu tự động Token (`access_token`, `refresh_token`).

---

## 2. Cách chạy bằng ứng dụng Postman (GUI)

1. Mở Postman $\rightarrow$ Chọn nút **Import** ở góc trên bên trái.
2. Kéo thả 2 file `CView_Auth_RBAC_Session.postman_collection.json` và `CView_Local_Environment.postman_environment.json` vào Postman.
3. Ở góc trên bên phải, chọn môi trường active là **"CView - Local / VM2 Environment"**.
4. Chọn collection **"CView - Auth, RBAC & Session Test Suite"** $\rightarrow$ Bấm nút **Run Collection** (hoặc Runner).
5. Đảm bảo chọn thứ tự chạy từ thư mục 1 đến thư mục 5 $\rightarrow$ Bấm **Run CView - Auth, RBAC & Session Test Suite**.
6. Kết quả mong đợi: **100% Test Scripts Pass (Màu xanh)**.

---

## 3. Cách chạy bằng dòng lệnh (Newman CLI / CI-CD)

Nếu muốn chạy tự động trên terminal hoặc tích hợp vào pipeline kiểm thử hạ tầng 3 VMs:

```bash
# Cài đặt newman nếu chưa có
npm install -g newman

# Chạy test suite với môi trường local
newman run postman/CView_Auth_RBAC_Session.postman_collection.json \
  -e postman/CView_Local_Environment.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export postman/test-results.json
```

