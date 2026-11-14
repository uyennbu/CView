# HƯỚNG DẪN SỬ DỤNG BỘ POSTMAN COLLECTION CVIEW

Bộ Postman Collection này kiểm thử các luồng **Auth, RBAC, Session Lifecycle** và nghiệp vụ **Sprint 2** của dự án **CView - Doanh nghiệp nào cần bạn?**.

---

## 1. Danh mục tài liệu trong thư mục này
1. **`CView_Auth_RBAC_Session.postman_collection.json`**: Tập hợp 23 requests tự động hóa kiểm thử các kịch bản:
   - **Luồng Ứng viên (Candidate Flow):** Đăng ký mới, bắt lỗi trùng lặp (409), đăng nhập cấp JWT + Refresh token, lấy profile (`/auth/me`).
   - **Luồng Nhà tuyển dụng (Recruiter Flow):** Đăng ký kèm tạo công ty (`companies`) & MST, đăng nhập cấp quyền `RECRUITER`, gửi thông tin bài đăng (`POST /jobs`) và kiểm tra trạng thái `PENDING`.
   - **Luồng Quản trị viên (Admin Flow):** Đăng nhập Admin, phê duyệt bài đăng (`APPROVED`) hoặc từ chối (`REJECTED`) kèm lý do qua `PATCH /jobs/{id}/moderation`.
   - **Tìm việc (Candidate - Sprint 2):** Tìm theo từ khóa; lọc địa điểm, lĩnh vực, loại việc, hình thức làm việc, mức lương và phân trang; kiểm tra cấu trúc kết quả.
   - **Kiểm thử Phân quyền (RBAC Boundary Tests):** Chặn ứng viên gọi API Admin/NTD (kỳ vọng `403 Forbidden`), mật khẩu sai (`401 Unauthorized`), tài khoản chưa kích hoạt `PENDING` (`403 Forbidden`), gọi thiếu token (`401 Unauthorized`).
   - **Quản lý Phiên làm việc (Session Lifecycle):** Xoay vòng Refresh Token (Token Rotation), phát hiện và chặn sử dụng lại token cũ (Reuse Detection), đăng xuất thu hồi session (`is_revoked = True`).
2. **`CView_Local_Environment.postman_environment.json`**: Môi trường biến chứa `base_url` và các biến lưu tự động Token (`access_token`, `refresh_token`).

---

## 2. Cách chạy bằng ứng dụng Postman (GUI)

1. Mở Postman $\rightarrow$ Chọn nút **Import** ở góc trên bên trái.
2. Kéo thả 2 file `CView_Auth_RBAC_Session.postman_collection.json` và `CView_Local_Environment.postman_environment.json` vào Postman.
3. Ở góc trên bên phải, chọn môi trường active là **"CView - Local / VM2 Environment"**.
4. Chọn collection **"CView - Auth, RBAC, Session & Sprint 2 Jobs"** $\rightarrow$ Bấm nút **Run Collection** (hoặc Runner).
5. Chạy tuần tự các thư mục từ **1 đến 6** để các token và mã bài đăng được lưu, dùng ở các request tiếp theo.
6. Các kiểm thử Sprint 2 xác nhận response có `job_post_id` khi tạo bài, trả lại `rejection_reason` khi từ chối và trả đúng cấu trúc `items`/`total` khi tìm kiếm.

> **Lưu ý:** `backend/app/routers/jobs.py` hiện là bản triển khai khung: `POST /jobs` chưa trả `job_post_id`, API kiểm duyệt chưa trả lại `rejection_reason`, và `/jobs/search` mới nhận `keyword`, `city`, `domain_id` (chưa xử lý các bộ lọc bổ sung hoặc phân trang). Vì vậy các kiểm thử hợp đồng đầy đủ của Sprint 2 cần backend triển khai các trường/filters tương ứng trước khi kỳ vọng toàn bộ collection chạy xanh.

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

