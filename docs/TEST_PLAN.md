# KẾ HOẠCH KIỂM THỬ TỔNG THỂ (MASTER TEST PLAN)
## Dự án: CView - Doanh nghiệp nào cần bạn?

* **Chịu trách nhiệm chính (QA & Infrastructure Owner):** Nguyễn Thị Thu Uyên (Thành viên 4)
* **Phối hợp kỹ thuật:**
  * Nguyễn Bích Uyên (Leader / Backend & RBAC Architecture)
  * Lê Thị Hoài Thương (Database / Transactions / Performance Benchmarking)
  * Trần Tiến Đạt (Frontend UI / Candidate & Recruiter Experience)
* **Phiên bản tài liệu:** 1.0 (Khởi tạo chuẩn hóa trong Sprint 1)
* **Môi trường mục tiêu:** Môi trường phát triển cục bộ (Docker Compose) và Môi trường phân tán thực tế (03 Máy ảo - 3 VMs).

---

## 1. MỤC TIÊU VÀ PHẠM VI KIỂM THỬ (TEST OBJECTIVES & SCOPE)

### 1.1. Mục tiêu kiểm thử
1. **Đảm bảo tính chính xác nghiệp vụ:** Xác minh 100% các luồng nghiệp vụ cốt lõi (Phân tích CV PDF $\le 10\text{MB}$, thuật toán Matching tính điểm độ phù hợp, Đăng bài & Kiểm duyệt tin tuyển dụng, Hệ thống thông báo tự động).
2. **Bảo mật và Kiểm soát quyền hạn (RBAC & Session Management):** Kiểm định nghiêm ngặt cơ chế phân quyền dựa trên vai trò cho 3 đối tượng (`CANDIDATE`, `RECRUITER`, `ADMIN`), cơ chế xoay vòng Refresh Token (Token Rotation) băm SHA-256 trên bảng `sessions`, và đảm bảo mọi hành vi đăng nhập/thao tác đều được ghi vết kiểm toán vào `auth_logs` và `activity_logs`.
3. **Đảm bảo toàn vẹn CSDL & Hiệu năng cao:** Kiểm tra 29 bảng theo thiết kế tại `docs/DESIGN.md`, đảm bảo các ràng buộc toàn vẹn (`PK`, `FK`, `CHECK`, `UNIQUE`), khả năng Rollback tự động khi gặp lỗi trong Transaction, và thời gian phản hồi truy vấn $< 200\text{ms}$ trên bảng lớn $\ge 100.000$ bản ghi (`matched_results`, `activity_logs`) sau khi đánh Index.
4. **Vận hành ổn định trên kiến trúc phân tán 3 VMs:** Đảm bảo luồng giao tiếp mạng và Reverse Proxy hoạt động thông suốt: **VM1** (React/Nginx) $\leftrightarrow$ **VM2** (FastAPI) $\leftrightarrow$ **VM3** (PostgreSQL/Storage).

---

### 1.2. Phạm vi kiểm thử chi tiết (In-Scope)

| STT | Phân hệ / Tính năng | Mô tả phạm vi kiểm thử chi tiết | Sprint phụ trách |
| :---: | :--- | :--- | :---: |
| 1 | **Xác thực & Phân quyền (Auth & RBAC)** | • Đăng ký tài khoản Ứng viên từ Navbar.<br>• Đăng ký Nhà tuyển dụng kèm tạo thông tin công ty (`companies`) và MST.<br>• Đăng nhập riêng biệt cho 3 vai trò (`CANDIDATE`, `RECRUITER`, `ADMIN`).<br>• Cấp phát và quản lý phiên làm việc (`sessions`), làm mới token (`/auth/refresh`), thu hồi phiên khi đăng xuất (`/auth/logout`).<br>• Kiểm tra ranh giới bảo mật (Negative test: ngăn chặn truy cập trái phép). | **Sprint 1** |
| 2 | **Tìm việc theo từ khóa & Đăng tin NTD** | • Tìm việc với từ khóa và bộ lọc (địa điểm, ngành nghề, mức lương, hình thức làm việc).<br>• Ghi nhận tự động lịch sử tìm kiếm vào `search_history`.<br>• NTD đăng bài tuyển dụng mới (`job_posts`, `job_skills`, `job_certificates`).<br>• Admin kiểm duyệt tin (`APPROVED` / `REJECTED` kèm lý do). | **Sprint 2** |
| 3 | **Bóc tách PDF & Matching Engine** | • Tải file PDF CV $\le 10\text{MB}$, kiểm tra từ chối file quá dung lượng hoặc sai định dạng.<br>• Bóc tách kỹ năng ứng viên vào bảng `resume_skills`.<br>• Kiểm tra tính toán điểm so khớp (`overall_score`, `skill_score`, `experience_score`) và danh sách kỹ năng thiếu (`missing_skills`).<br>• Kiểm thử Transaction ACID và tự động Rollback khi lỗi giữa chừng. | **Sprint 3** |
| 4 | **Thông báo Job mới & Thống kê** | • Kích hoạt Background Task gửi thông báo (`job_notifications`) tới user có `search_history` phù hợp khi có tin tuyển dụng mới được duyệt.<br>• Báo cáo thống kê ở cả 3 vai trò (Account Ứng viên, UI Thống kê Nhà tuyển dụng, Admin Dashboard). | **Sprint 4** |
| 5 | **Tranh chấp đồng thời, Index & Sao lưu** | • Giả lập 2 kết nối chạy đồng thời cập nhật cùng dữ liệu (Concurrency test với khóa bi quan `SELECT FOR UPDATE`).<br>• Đo đạc `EXPLAIN (ANALYZE, BUFFERS)` trước và sau khi đánh chỉ mục trên bảng lớn $\ge 100.000$ dòng.<br>• Kịch bản sao lưu (`pg_dump`) và khôi phục (`pg_restore`) thực tế trên VM3. | **Sprint 5** |
| 6 | **Kiểm thử hồi quy & Triển khai 3 VMs** | • Kiểm thử toàn trình (Regression Test) từ VM1 qua VM2 tới VM3.<br>• Kiểm tra khả năng chịu tải và tính sẵn sàng của hệ thống. | **Sprint 6 & 7** |

---

### 1.3. Ngoài phạm vi kiểm thử (Out-of-Scope)
* Tấn công từ chối dịch vụ phân tán (DDoS) cấp độ đường truyền Internet công cộng.
* Cổng thanh toán trực tuyến (hệ thống không yêu cầu thanh toán thẻ tín dụng/ví điện tử).
* Kiểm thử khả năng tương thích trên các thiết bị di động màn hình quá nhỏ ($< 360\text{px}$).

---

## 2. CHIẾN LƯỢC VÀ CÁC CẤP ĐỘ KIỂM THỬ (TEST STRATEGY & LEVELS)

```text
               +----------------------------------+
               |     End-to-End / UI Testing      |  <-- Trình duyệt, Chrome DevTools, Luồng Navbar
               +----------------------------------+
               |     API & Integration Testing    |  <-- Postman Collection Runner, Newman CLI
               +----------------------------------+
               |   Database & Performance Testing |  <-- EXPLAIN ANALYZE, Concurrency Scripts, pg_dump
               +----------------------------------+
               |           Unit Testing           |  <-- Pytest (Bcrypt, JWT, Validation schemas)
               +----------------------------------+
```

### 2.1. Cấp độ 1: Kiểm thử Đơn vị (Unit Testing)
* Kiểm tra logic băm mật khẩu `bcrypt`, sinh và giải mã JWT Access Token với Secret Key.
* Kiểm tra thuật toán sinh token ngẫu nhiên và băm SHA-256 cho Refresh Token lưu trong bảng `sessions`.
* Kiểm tra ràng buộc hợp lệ dữ liệu bằng Pydantic Schemas (regex định dạng email, mã số thuế, số điện thoại, độ dài mật khẩu $\ge 6$ ký tự).

### 2.2. Cấp độ 2: Kiểm thử Giao diện Lập trình (API & Integration Testing)
* Sử dụng **Postman Collection** tự động hóa kèm **Test Scripts JavaScript** (`pm.test()`, `pm.expect()`).
* Tự động trích xuất Token từ Response và chuyển tiếp (Chaining) sang các Request kế tiếp qua biến môi trường (`pm.environment.set()`).
* Kiểm thử đầy đủ các mã trạng thái HTTP chuẩn:
  * `200 OK`: Đăng nhập thành công, làm mới token thành công, lấy hồ sơ thành công.
  * `201 Created`: Đăng ký Ứng viên / Nhà tuyển dụng thành công, tạo tin tuyển dụng thành công.
  * `400 / 422 Bad Request / Unprocessable Entity`: Dữ liệu đầu vào sai định dạng hoặc thiếu trường bắt buộc.
  * `401 Unauthorized`: Sai mật khẩu, token hết hạn, token không hợp lệ, cố tình tái sử dụng refresh token cũ.
  * `403 Forbidden`: Tài khoản bị khóa / chờ kích hoạt (`PENDING`, `SUSPENDED`), hoặc truy cập trái quyền (RBAC check fail).
  * `409 Conflict`: Trùng lặp Email, Username, Mã số thuế doanh nghiệp.

### 2.3. Cấp độ 3: Kiểm thử Giao diện Người dùng (UI / E2E Testing)
* Kiểm tra tính đúng đắn của thanh điều hướng (Navbar) theo đúng bản thiết kế:
  * Khi chưa đăng nhập: Nút *Đăng nhập*, *Đăng ký* (cho Ứng viên), nút *Tuyển dụng* (cho Nhà tuyển dụng).
  * Khi đã đăng nhập: Hiển thị icon Account dẫn đến trang cá nhân, hiển thị chuông thông báo có badge số tin mới.
* Kiểm tra giao diện Admin Portal và UI Thống kê Nhà tuyển dụng theo đúng khung Wireframe tại `docs/WIREFRAMES.md`.

### 2.4. Cấp độ 4: Kiểm thử Cơ sở dữ liệu & Phi chức năng (Non-Functional Testing)
* **Kiểm tra Ràng buộc CSDL (Data Integrity Test):** Kiểm tra các ràng buộc `CHECK`, `NOT NULL`, `FOREIGN KEY ON DELETE CASCADE / RESTRICT / SET NULL`.
* **Kiểm thử Giao dịch (Transaction & Concurrency Test):** Chạy đồng thời 2 tiến trình bằng script Python nhằm mô phỏng 2 Admin cùng duyệt 1 bài đăng, hoặc Ứng viên rút đơn khi NTD duyệt đơn để kiểm tra cơ chế khóa (`SELECT FOR UPDATE`).
* **Kiểm thử Hiệu năng & Chỉ mục (Performance Benchmarking):** Đo lường chi phí bộ nhớ (Buffers) và thời gian thực thi (Execution Time) của 08 câu truy vấn nâng cao trước và sau khi đánh chỉ mục trên bảng lớn $\ge 100.000$ bản ghi.
* **Kiểm thử Phục hồi Thảm họa (Disaster Recovery Test):** Thực hiện sao lưu dữ liệu sang file `.dump` trên VM3, xóa giả lập bảng dữ liệu, chạy kịch bản phục hồi và kiểm tra tính toàn vẹn 100% của dữ liệu sau phục hồi.

---

## 3. MÔI TRƯỜNG VÀ DỮ LIỆU KIỂM THỬ (TEST ENVIRONMENT & DATA)

### 3.1. Các môi trường kiểm thử
1. **Môi trường Phát triển (Local Dev Environment):**
   * Docker Compose chạy 3 containers: `cview-frontend` (Port 3000), `cview-backend` (Port 8000), `cview-postgres` (Port 5432).
   * Phù hợp cho việc chạy nhanh các Test Case đơn vị và API trong từng Sprint.
2. **Môi trường Triển khai Phân tán (3 Virtual Machines Architecture):**
   * **VM1 (Frontend):** IP `192.168.1.101` - React 18 + Nginx Reverse Proxy (Port 80 / 3000).
   * **VM2 (Backend):** IP `192.168.1.102` - FastAPI / Uvicorn (Port 8000).
   * **VM3 (Database & Storage):** IP `192.168.1.103` - PostgreSQL 15 (Port 5432) + Local Volume lưu trữ file CV PDF.

### 3.2. Dữ liệu thực nghiệm (Test Data Sets)
Hệ thống sử dụng **02 bộ dữ liệu** theo đúng quy định đề tài:
* **Bộ 1: Dữ liệu Demo gọn:** Phục vụ chạy kiểm thử chức năng và demo luồng trực tiếp (~100 tài khoản, 20 doanh nghiệp, 50 tin tuyển dụng, 1.000 kết quả matching, 2.000 log hoạt động).
* **Bộ 2: Dữ liệu Lớn (Đánh giá hiệu năng):** Phục vụ kiểm thử tải và chỉ mục với $\ge 10.000$ tài khoản, $\ge 10.000$ bài tuyển dụng, $\ge 100.000$ bản ghi ở bảng `matched_results` và `activity_logs`.

### 3.3. Danh sách tài khoản kiểm thử mặc định (Seed Credentials)
*Mật khẩu mặc định cho tất cả tài khoản mẫu bên dưới là:* `Password@123`

| Vai trò (Role) | Username | Email đăng nhập | Trạng thái | Mục đích kiểm thử |
| :--- | :--- | :--- | :---: | :--- |
| **ADMIN** | `admin_root` | `admin.root@cview.vn` | `ACTIVE` | Kiểm thử đăng nhập Admin, duyệt tin, xem thống kê hệ thống |
| **ADMIN** | `admin_ops` | `admin.ops@cview.vn` | `ACTIVE` | Kiểm thử đa tài khoản Admin và tranh chấp duyệt bài |
| **RECRUITER** | `recruiter01` | `recruiter01@techcorp.vn` | `ACTIVE` | Kiểm thử đăng bài tuyển dụng, xem thống kê phễu ứng viên |
| **RECRUITER** | `recruiter02` | `recruiter02@fptsoft.vn` | `ACTIVE` | Kiểm thử phân tách dữ liệu giữa các công ty khác nhau |
| **CANDIDATE** | `candidate01` | `candidate01@gmail.com` | `ACTIVE` | Kiểm thử luồng ứng viên, tìm việc, tải CV, kiểm tra RBAC |
| **CANDIDATE** | `candidate05` | `candidate05@proton.me` | `PENDING` | Kiểm thử Negative: Chặn đăng nhập tài khoản chưa kích hoạt |

---

## 4. TIÊU CHUẨN ĐẠT / KHÔNG ĐẠT & PHÂN LOẠI LỖI (DEFECT CRITERIA & SEVERITY)

### 4.1. Tiêu chí Đạt (Pass Criteria)
* 100% các Test Case mức độ **Blocker** và **Critical** đều PASS.
* Không có lỗi rò rỉ phân quyền (tuyệt đối không để ứng viên có thể thực thi thao tác của Nhà tuyển dụng hoặc Admin).
* 100% các sự kiện Đăng nhập thành công, Thất bại, Làm mới Token và Đăng xuất đều được ghi đúng vào `auth_logs`.
* Tốc độ phản hồi API trên bảng $\ge 100.000$ dòng đạt yêu cầu sau khi tối ưu Index ($< 200\text{ms}$).

### 4.2. Tiêu chí Tạm dừng / Hủy bỏ (Suspension Criteria)
* Lỗi nghiêm trọng tại module Auth làm tê liệt việc cấp phát JWT Token khiến toàn bộ các phân hệ phụ thuộc không thể kiểm thử.
* Đứt gãy kết nối mạng nội bộ giữa 3 VMs (VM1 không gọi được VM2, hoặc VM2 không kết nối được PostgreSQL trên VM3).

### 4.3. Phân loại mức độ nghiêm trọng của lỗi (Defect Severity)
1. **Severity 1 (Blocker):** Hệ thống sập (Crash), đứt kết nối CSDL, rò rỉ dữ liệu mật khẩu, không thể đăng nhập.
2. **Severity 2 (Critical):** Tính năng nghiệp vụ chính hỏng hoàn toàn (Matching sai lệch, không thể duyệt tin, vi phạm RBAC).
3. **Severity 3 (Major):** Lỗi chức năng phụ, phân trang sai, định dạng thời gian sai lệch, không hiển thị biểu đồ thống kê.
4. **Severity 4 (Minor):** Lỗi chính tả giao diện, khoảng cách hiển thị chưa đều, giao diện chưa tối ưu trên trình duyệt phụ.

---

## 5. MA TRẬN KỊCH BẢN KIỂM THỬ CHI TIẾT - PHÂN HỆ AUTH, RBAC & SESSION (SPRINT 1)

Bộ Test Case này đã được tự động hóa hoàn toàn trong file Postman Collection `postman/CView_Auth_RBAC_Session.postman_collection.json`.

| Mã Test ID | Nhóm kiểm thử | Kịch bản kiểm thử (Test Scenario) | Dữ liệu đầu vào (Payload / Header) | Kết quả kỳ vọng (Expected Result) | Mức độ |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_AUTH_01** | Candidate Auth | Đăng ký tài khoản Ứng viên mới hợp lệ từ Navbar. | `username`, `email`, `password`, `full_name` hợp lệ | HTTP `201 Created`. Tạo bản ghi trong `accounts`, gán role `CANDIDATE` và tạo `candidate_profiles`. | **Critical** |
| **TC_AUTH_02** | Candidate Auth | Đăng ký Ứng viên với email đã tồn tại. | Email trùng `candidate01@gmail.com` | HTTP `409 Conflict`. Báo lỗi *"Username hoặc Email đã tồn tại"*. | **High** |
| **TC_AUTH_03** | Candidate Auth | Đăng ký Ứng viên dữ liệu không hợp lệ (mật khẩu quá ngắn, sai email). | `password: "123"`, `email: "sai_dinh_dang"` | HTTP `422 Unprocessable Entity`. Không tạo tài khoản rác trong DB. | **Medium** |
| **TC_AUTH_04** | Candidate Auth | Đăng nhập Ứng viên thành công từ cổng Navbar. | `candidate01@gmail.com` / `Password@123` | HTTP `200 OK`. Trả về `access_token` và `refresh_token`, tạo bản ghi trong `sessions`, ghi `LOGIN_SUCCESS` vào `auth_logs`. | **Critical** |
| **TC_AUTH_05** | Candidate Auth | Lấy thông tin tài khoản hiện tại qua API `/auth/me`. | Header `Authorization: Bearer <candidate_token>` | HTTP `200 OK`. Trả về đúng `account_id`, `candidate_id`, `roles: ["CANDIDATE"]`. | **High** |
| **TC_AUTH_06** | Recruiter Auth | Đăng ký Nhà tuyển dụng kèm thông tin Công ty và MST. | Đầy đủ thông tin cá nhân, công ty, MST hợp lệ | HTTP `201 Created`. Tạo `accounts`, `companies` (trạng thái `PENDING`), `addresses`, `recruiter_profiles` trong 1 Transaction. | **Critical** |
| **TC_AUTH_07** | Recruiter Auth | Đăng ký Nhà tuyển dụng trùng MST công ty đã có. | MST trùng với doanh nghiệp đã đăng ký | HTTP `409 Conflict`. Rollback toàn bộ dữ liệu, không tạo tài khoản đơn lẻ. | **High** |
| **TC_AUTH_08** | Recruiter Auth | Đăng nhập Nhà tuyển dụng từ cổng Tuyển dụng. | `recruiter01@techcorp.vn` / `Password@123` | HTTP `200 OK`. Cấp Access Token mang vai trò `RECRUITER`, tạo phiên trong `sessions`. | **Critical** |
| **TC_AUTH_09** | Recruiter Auth | NTD gọi API Đăng bài tuyển dụng (`POST /jobs`). | Header `Authorization: Bearer <recruiter_token>` | HTTP `201 Created`. Xác thực quyền NTD thành công. | **Critical** |
| **TC_AUTH_10** | Admin Auth | Đăng nhập Quản trị viên Admin (`POST /auth/admin/login`). | `admin.root@cview.vn` / `Password@123` | HTTP `200 OK`. Cấp token có vai trò `ADMIN`, ghi `auth_logs`. | **Critical** |
| **TC_AUTH_11** | Admin Auth | Admin gọi API kiểm duyệt bài đăng (`PATCH /jobs/{id}/moderation`). | Header `Authorization: Bearer <admin_token>` | HTTP `200 OK`. Cho phép cập nhật trạng thái duyệt tin. | **Critical** |
| **TC_AUTH_12** | RBAC Security | Ứng viên cố tình gọi API Kiểm duyệt bài của Admin. | Header mang `<candidate_token>` gọi API duyệt | HTTP `403 Forbidden`. Báo lỗi *"Yêu cầu quyền truy cập thuộc nhóm: ADMIN"*. | **Critical** |
| **TC_AUTH_13** | RBAC Security | Ứng viên cố tình gọi API Đăng tin của Nhà tuyển dụng. | Header mang `<candidate_token>` gọi `POST /jobs` | HTTP `403 Forbidden`. Báo lỗi thiếu quyền `RECRUITER`. | **Critical** |
| **TC_AUTH_14** | Auth Security | Đăng nhập với mật khẩu sai. | Mật khẩu sai ngẫu nhiên | HTTP `401 Unauthorized`. Ghi vết sự kiện `LOGIN_FAILED` với lý do `INVALID_CREDENTIALS` vào `auth_logs`. | **Critical** |
| **TC_AUTH_15** | Auth Security | Đăng nhập tài khoản ở trạng thái `PENDING` hoặc `SUSPENDED`. | `candidate05@proton.me` / `Password@123` | HTTP `403 Forbidden`. Từ chối đăng nhập và ghi `ACCOUNT_LOCKED` vào `auth_logs`. | **High** |
| **TC_AUTH_16** | Auth Security | Gọi API bảo vệ nhưng không truyền Header Authorization. | Request không có Authorization Header | HTTP `401 Unauthorized`. Báo lỗi *"Chưa đăng nhập hoặc thiếu Access Token"*. | **High** |
| **TC_AUTH_17** | Session Mgmt | Làm mới Access Token bằng Refresh Token (Token Rotation). | `POST /auth/refresh` kèm `refresh_token` hợp lệ | HTTP `200 OK`. Cấp cặp token mới, cập nhật hash mới vào `sessions`, ghi `TOKEN_REFRESH` vào `auth_logs`. | **Critical** |
| **TC_AUTH_18** | Session Mgmt | Tấn công thử dùng lại Refresh Token cũ đã bị xoay vòng. | `POST /auth/refresh` bằng token cũ | HTTP `401 Unauthorized`. Từ chối cấp token mới (Reuse Detection). | **Critical** |
| **TC_AUTH_19** | Session Mgmt | Đăng xuất và thu hồi phiên làm việc (`POST /auth/logout`). | `POST /auth/logout` kèm `refresh_token` | HTTP `200 OK`. Cập nhật `is_revoked = TRUE` trong `sessions`, ghi `LOGOUT` vào `auth_logs`. | **High** |
| **TC_AUTH_20** | Session Mgmt | Sử dụng Refresh Token đã bị thu hồi để yêu cầu cấp token. | `POST /auth/refresh` bằng token vừa logout | HTTP `401 Unauthorized`. Báo lỗi token không hợp lệ hoặc đã hết hạn. | **High** |

---

## 6. LỘ TRÌNH THỰC HIỆN KIỂM THỬ THEO 8 SPRINTS (SCRUM ALIGNMENT)

* **Sprint 1 (Tuần 1):** Thiết lập Test Plan, dựng môi trường 3 VMs, đóng gói bộ Postman Collection cho Auth, RBAC và Session Lifecycle.
* **Sprint 2 (Tuần 2):** Kiểm thử API Tìm việc, bộ lọc danh mục và quy trình Đăng bài tuyển dụng; kiểm tra nạp 2 bộ dữ liệu (Demo và Lớn).
* **Sprint 3 (Tuần 3):** Kiểm thử tích hợp module Bóc tách CV PDF, độ chính xác của Matching Engine và kiểm thử Rollback Transaction CSDL khi có lỗi.
* **Sprint 4 (Tuần 4):** Kiểm thử Background Trigger gửi thông báo tự động khi có Job mới; nghiệm thu 3 phân hệ Thống kê và 08 truy vấn SQL nâng cao.
* **Sprint 5 (Tuần 5):** Thực nghiệm kịch bản Tranh chấp đồng thời (Concurrency); đo lường hiệu năng Index trên VM3; diễn tập Backup và Restore CSDL.
* **Sprint 6 (Tuần 6):** Kiểm thử Hồi quy Toàn diện (Full Regression Testing) trên 3 VMs; kiểm tra liên thông Reverse Proxy và Firewall.
* **Sprint 7 (Tuần 7):** Kiểm thử chức năng AI Chatbot (nếu kích hoạt phương án lấy điểm cộng) hoặc kiểm thử chịu tải Stress Test.
* **Sprint 8 (Tuần 8):** Diễn tập Dry-run kịch bản bảo vệ trước hội đồng, đóng gói báo cáo kết quả kiểm thử (Test Summary Report).

---

## 7. QUY TRÌNH BÁO CÁO LỖI VÀ TÀI LIỆU BÀN GIAO (DEFECT WORKFLOW & DELIVERABLES)

### 7.1. Quy trình xử lý lỗi (Defect Lifecycle trên GitHub Issues)
```text
[Phát hiện Bug] --> [Tạo Issue (Gán nhãn bug & severity)] --> [Assign Thành viên phụ trách]
                         |
                         V
[Verified PASS] <-- [Tạo PR fix bug & Thu Uyên re-test] <-- [Đẩy code sửa lên nhánh feature]
```

### 7.2. Danh mục tài liệu bàn giao của bộ phận QA
1. **`docs/TEST_PLAN.md`:** Kế hoạch kiểm thử tổng thể xuyên suốt dự án.
2. **`postman/CView_Auth_RBAC_Session.postman_collection.json`:** Bộ sưu tập kiểm thử tự động API và Session.
3. **`postman/CView_Local_Environment.postman_environment.json`:** Cấu hình biến môi trường kiểm thử.
4. **`backend/tests/test_auth_flow.py`:** Bộ kiểm thử đơn vị tự động bằng Python.
5. **`docs/TEST_SUMMARY_REPORT.md` (Sprint 6 & 8):** Báo cáo tổng kết tỷ lệ kiểm thử thành công và biểu đồ hiệu năng.
