# KẾ HOẠCH KIỂM THỬ TỔNG THỂ (MASTER TEST PLAN)
**Dự án:** CView - Doanh nghiệp nào cần bạn?  
**Người lập:** Nguyễn Thị Thu Uyên (QA / Infrastructure Owner)  
**Phiên bản:** 1.0 (Sprint 1)  

---

## 1. MỤC TIÊU VÀ PHẠM VI KIỂM THỬ

### 1.1. Mục tiêu
- Đảm bảo tính toàn vẹn dữ liệu, hiệu năng và độ ổn định của hệ thống CView trên kiến trúc 3 máy ảo (VMs).
- Xác minh tính chính xác của các thuật toán phân tích CV, khớp nối công việc (Matching Engine) và phân quyền người dùng (RBAC).
- Phát hiện sớm các lỗi về logic nghiệp vụ, giao diện người dùng (UI/UX) và bảo mật trước khi release.

### 1.2. Phạm vi kiểm thử (In-Scope)
- **Kiểm thử Phân quyền & Xác thực (Auth & RBAC):** Đăng ký, đăng nhập, quản lý phiên làm việc (Session) cho 3 nhóm vai trò: `CANDIDATE` (Ứng viên), `RECRUITER` (Nhà tuyển dụng), và `ADMIN`.
- **Kiểm thử Nghiệp vụ lõi:** 
  - Tải CV PDF ($\le 10\text{MB}$), bóc tách kỹ năng (`resume_skills`).
  - Thuật toán chấm điểm matching (`matched_results`).
  - Quy trình Đăng bài tuyển dụng & Kiểm duyệt bài đăng (`job_posts`).
  - Hệ thống thông báo việc làm tự động (`job_notifications`).
- **Kiểm thử Hạ tầng & CSDL:** 
  - Hoạt động của ứng dụng trên 3 VMs (VM1: React, VM2: FastAPI, VM3: PostgreSQL).
  - Tình huống giao dịch (Transaction), Rollback khi lỗi và tranh chấp đồng thời (Concurrency).
  - Đánh giá hiệu năng truy vấn trước/sau khi tạo Index trên bảng $\ge 100.000$ bản ghi.
  - Kịch bản Sao lưu & Khôi phục CSDL (Backup & Restore).

### 1.3. Ngoài phạm vi (Out-of-Scope)
- Kiểm thử bảo mật chuyên sâu (Penetration Testing) cấp độ hạ tầng mạng đám mây ngoài phạm vi 3 VMs.

---

## 2. MÔI TRƯỜNG VÀ CÔNG CỤ KIỂM THỬ

### 2.1. Môi trường kiểm thử
1. **Môi trường Phát triển (Local Dev):** Docker Compose (containers: `cview-frontend`, `cview-backend`, `cview-postgres`).
2. **Môi trường Triển khai Chính thức (3 VMs Architecture):**
   - **VM1 (Frontend):** ReactJS + Nginx Reverse Proxy (Cổng 3000 / 80).
   - **VM2 (Backend):** Python FastAPI / Uvicorn (Cổng 8000).
   - **VM3 (DB & Storage):** PostgreSQL 15 + Volume lưu trữ file PDF (Cổng 5432).

### 2.2. Công cụ sử dụng
- **API Testing:** Postman / Postman Collection Runner.
- **Performance / Database Test:** `EXPLAIN (ANALYZE, BUFFERS)` trên PostgreSQL.
- **Automation / Scripting:** Python scripts (giả lập 2 kết nối tranh chấp đồng thời - Concurrency test).
- **UI & Regression Test:** Chrome DevTools, Manual Testing trên các trình duyệt Chrome, Edge, Firefox.

---

## 3. TIÊU CHÍ ĐẠT / KHÔNG ĐẠT (PASS / FAIL CRITERIA)

### 3.1. Tiêu chí Đạt (Pass Criteria)
- 100% các Test Case mức độ **Critical** (Đăng nhập, Tải CV, Matching, Duyệt bài) đều chạy thành công.
- Không còn lỗi mức **Blocker** hoặc **Critical** mở trước khi đóng Sprint.
- Tốc độ phản hồi API truy vấn trên bảng lớn ($\ge 100.000$ bản ghi) đạt yêu cầu sau khi đánh Index ($< 200\text{ms}$).
- Kịch bản Transaction Rollback và Backup/Restore dữ liệu hoạt động chính xác 100%.

### 3.2. Tiêu chí Tạm dừng / Hủy bỏ (Suspension Criteria)
- Môi trường 3 VMs hoặc Docker không thể kết nối mạng nội bộ giữa BE và DB.
- Lỗi ngắt chừng (Crash) ở luồng Auth làm chặn toàn bộ các chức năng kiểm thử phía sau.

---

## 4. MA TRẬN KỊCH BẢN KIỂM THỬ BAN ĐẦU (AUTH & RBAC - SPRINT 1)

| Test ID | Chức năng | Kịch bản kiểm thử (Test Scenario) | Kết quả kỳ vọng | Mức độ |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH_01** | Đăng ký Ứng viên | Đăng ký tài khoản mới với email chưa tồn tại và mật khẩu hợp lệ. | Tạo tài khoản thành công (`role = CANDIDATE`), lưu `candidate_profiles`. | Critical |
| **AUTH_02** | Đăng ký Ứng viên | Đăng ký với email đã tồn tại trong CSDL. | Trả về lỗi `400 Bad Request` - "Email đã được sử dụng". | High |
| **AUTH_03** | Đăng nhập NTD | Đăng nhập từ cổng Tuyển dụng với vai trò `RECRUITER`. | Trả về JWT Access Token & Refresh Token, cấp quyền chuyển vào UI NTD. | Critical |
| **AUTH_04** | Phân quyền (RBAC) | Dùng Token của Ứng viên gọi API Duyệt bài tuyển dụng của Admin. | Trả về lỗi `403 Forbidden` - "Không có quyền truy cập". | Critical |
| **AUTH_05** | Quản lý Session | Đăng xuất hoặc thu hồi Refresh Token trên bảng `sessions`. | Token bị vô hiệu hóa, không thể gọi các API yêu cầu xác thực. | High |