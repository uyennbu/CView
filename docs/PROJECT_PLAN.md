# Kế Hoạch Triển Khai Đồ Án CView (8 Tuần - Mô Hình Scrum)

**Đề tài:** CView - Doanh nghiệp nào cần bạn?  
**Công nghệ:** PostgreSQL, Python/FastAPI, React, Git/GitHub, Docker (Kiến trúc 3 VMs)  
**Nhóm nhân sự (4 thành viên):**
1. **Nguyễn Bích Uyên (Thành viên 1):** Trưởng nhóm (Scrum Master / Product Owner); Backend chính; Tích hợp và phát hành (Release/Integration Owner).
2. **Lê Thị Hoài Thương (Thành viên 2):** Chuyên trách Cơ sở dữ liệu (Database Architect), Backend, Nghiệp vụ dữ liệu.
3. **Trần Tiến Đạt (Thành viên 3):** Frontend Người dùng (Ứng viên & Nhà tuyển dụng); Thiết kế giao diện (UI/UX).
4. **Nguyễn Thị Thu Uyên (Thành viên 4):** Frontend Quản trị & Thống kê; Kiểm thử (QA/Testing); Đầu mối triển khai hạ tầng (DevOps - 3 VMs).

---

## 📌 Ghi chú
- **Yêu cầu**
  - Yêu cầu cho project xem ở `docs/REQUIREMENT.md`
- **Tài liệu**
  - Cấu trúc database: `docs/DESIGN.md`
  - Cấu trúc backend: ``docs/BACKEND.md``
- **Quản lý Mã nguồn:** Đã khởi tạo Repository chung, cấu hình nhánh `main`, `develop`, và quy tắc làm việc (`Issue -> Branch feature/* -> Commit -> Pull Request -> Review chéo -> Merge`).
  - Phân công review: Bích Uyên - Hoài Thương, Thu Uyên - Tiến Đạt
---

## 📅 Kế Hoạch Chi Tiết Theo Từng Sprint (8 Tuần)

> **Lưu ý về tính năng cộng điểm (Chatbot):** Cuối **Tuần 6 (Sprint 6 Review)** là cột mốc đánh giá tiến độ (Decision Gate). Nếu toàn bộ nghiệp vụ cốt lõi, 5 phần trong `docs/DESIGN.md` và hạ tầng 3 VMs đã ổn thỏa, nhóm sẽ kích hoạt **Phương án A (Triển khai Chatbot AI tư vấn CV & gợi ý việc làm)** ở Tuần 7. Nếu cần thêm thời gian củng cố hệ thống lõi, nhóm theo **Phương án B (Tối ưu hóa & Kiểm thử chuyên sâu)**.

---

### 🏃 Sprint 1 (Tuần 1): Khởi tạo CSDL 29 Bảng, Kiến trúc Backend Auth/RBAC, Dựng Homepage & Quy trình Kiểm thử

#### 🎯 1. Mục tiêu của sprint
* Chuyển hóa 29 bảng từ `docs/DESIGN.md` thành DDL SQL thực tế có đầy đủ ràng buộc toàn vẹn.
* Xây dựng hệ thống Backend Auth & Granular RBAC tách biệt 2 cổng (Ứng viên & Nhà tuyển dụng/Admin), cơ chế xoay vòng Refresh Token trên bảng `sessions` và ghi nhận `auth_logs`.
* Dựng chuẩn Navigation Bar & Homepage bám sát bản thiết kế Canva; khởi tạo môi trường kiểm thử Postman và hạ tầng Docker local.
* **Sự kiện Scrum:**
  * *Sprint Planning:* Tạo GitHub Issues tuần 1 theo 29 bảng & luồng UI Navbar.
  * *Daily Standup:* Đồng bộ kiểu dữ liệu PK/FK và API Auth cho 2 cổng đăng nhập (Candidate vs Recruiter).
  * *Sprint Review & Retro:* Nghiệm thu 29 bảng trên PostgreSQL, API Auth và giao diện Navbar + Homepage + luồng Auth.

#### 👥 2. Phân công chi tiết
| Thành viên 1: Nguyễn Bích Uyên<br>*(Leader / Backend Chính / Integration)* | Thành viên 2: Lê Thị Hoài Thương<br>*(CSDL / Backend / Nghiệp vụ dữ liệu)* | Thành viên 3: Trần Tiến Đạt<br>*(Frontend Người dùng / Thiết kế UI)* | Thành viên 4: Nguyễn Thị Thu Uyên<br>*(Frontend Admin & Thống kê / QA / Hạ tầng 3 VMs)* |
| :--- | :--- | :--- | :--- |
| - Thiết lập GitHub Project Board (Scrum), tạo Issue Template, PR Template và giao Issue Tuần 1 cho 4 thành viên.<br>- Khởi tạo kiến trúc thư mục `backend/` (FastAPI: `core`, `models`, `schemas`, `routers`, `services`, `middlewares`).<br>- Xây dựng hệ thống **Auth & Granular RBAC** khớp với 7 bảng hệ thống đầu tiên trong `DESIGN.md` và phục vụ đúng 2 luồng đăng nhập trên UI:<br>  - API Đăng ký/Đăng nhập cho **Ứng viên** (`role_name = 'CANDIDATE'`) từ nút *Đăng nhập / Đăng ký* trên Navbar.<br>  - API Đăng ký/Đăng nhập dành riêng cho **Nhà tuyển dụng** (`role_name = 'RECRUITER'`, khởi tạo kèm thông tin `companies` & `recruiter_profiles`) từ nút *Tuyển dụng* trên Navbar, và cổng đăng nhập cho **Admin** (`'ADMIN'`).<br>  - Quản lý phiên đăng nhập & Refresh Token (SHA-256) trên bảng `sessions` (`is_revoked`, `expires_at`, `ip_address`, `user_agent`) và tự động ghi bảng `auth_logs`. | - Rà soát và chuẩn hóa các chi tiết kỹ thuật trong Mục 1 `docs/DESIGN.md` khi viết script DDL `database/01_init_schema.sql` cho **29 bảng**:<br>  - Chuẩn hóa các khóa chính kiểu `INTEGER`/`BIGINT` (ở các bảng `roles`, `permissions`, `domains`, `skills`, `certificates`, `auth_logs`, `activity_logs`, `system_error_logs`, `matched_results`, `search_history`, `job_notifications`, `other_notifications`) từ ghi chú `gen_random_uuid()` sang `GENERATED ALWAYS AS IDENTITY` / `SERIAL` / `BIGSERIAL` chuẩn PostgreSQL.<br>  - Thống nhất kiểu dữ liệu trường vị trí công việc (`position VARCHAR(100)` hoặc bảng `positions`) giữa bảng `job_posts` và `cv_analyses`.<br>- Hiện thực hóa toàn bộ ràng buộc `PRIMARY KEY`, `FOREIGN KEY` (`ON DELETE CASCADE / RESTRICT / SET NULL`), `UNIQUE`, `CHECK` (regex email/SĐT/mã số thuế, tuổi $\ge 16$, lương `salary_max >= salary_min`, điểm `0.00 - 100.00`, file $\le 10\text{MB}$).<br>- Cấu hình công cụ quản lý phiên bản schema (**Alembic** / SQL migrations). | - Xây dựng bộ UI Kit / Design System trên React (TailwindCSS) bám sát bản thiết kế **Canva Homepage** (bảng màu xanh CView `#1E5631`/`#4CAF50`, đỏ hồng `#FF4B6E`, đen `#1A241E`, bo góc pill button).<br>- Code hoàn thiện **Navigation Bar** chuẩn theo đúng thiết kế:<br>  - Menu trái/giữa: Logo `CVIEW` + **Trang chủ** + **Phân tích CV** + **Tìm việc** (có gạch chân xanh lá ở tab đang active).<br>  - Cụm phải (khi chưa login): Nút `Đăng nhập` (viền), nút `Đăng ký` (đỏ hồng), nút `Tuyển dụng` (đen).<br>  - Cụm phải (khi Ứng viên đã login): Hiển thị **Hình/Icon Account** để bấm vào trang quản lý tài khoản ứng viên.<br>- Code hoàn thiện trang **Trang chủ (Homepage)** giới thiệu toàn bộ dự án (Hero banner linh vật tắc kè hoa, nút CTA *"BẮT ĐẦU PHÂN TÍCH CV $\rightarrow$"* điều hướng sang `/cv-analysis`, các section giới thiệu *Chấm điểm - Góp ý - Đề xuất việc làm*).<br>- Code giao diện **Đăng nhập / Đăng ký Ứng viên** và trang **Đăng nhập / Đăng ký Nhà tuyển dụng** (mở ra khi bấm nút `Tuyển dụng`). | - Thiết kế wireframe cho **Admin Portal** (Quản lý người dùng, Kiểm duyệt bài đăng, Thống kê hệ thống) và khung giao diện **Theo dõi thống kê** trong UI Nhà tuyển dụng.<br>- Viết `Dockerfile` và `docker-compose.dev.yml` dựng môi trường local gồm 3 containers: `cview-frontend`, `cview-backend`, `cview-postgres`.<br>- Khởi tạo kế hoạch kiểm thử (**Master Test Plan**) và bộ Postman Collection kiểm thử luồng Auth/Session cho cả 3 vai trò (`CANDIDATE`, `RECRUITER`, `ADMIN`).<br>- Thiết lập môi trường **03 Máy ảo (VM1: Frontend, VM2: Backend, VM3: DB + Storage)** và cấu hình kết nối mạng nội bộ giữa 3 VMs. |

#### ✅ 3. Kết quả đạt được
- [x] Khởi tạo kiến trúc thư mục chuẩn `backend/` (FastAPI: `core`, `models`, `schemas`, `routers`, `services`, `middlewares`).
- [x] Hoàn thiện hệ thống Auth & Granular RBAC (`auth_service.py`, `routers/auth.py`) với đầy đủ logic cho Ứng viên, Nhà tuyển dụng và Admin.
- [x] Quản lý phiên làm việc bảng `sessions` (băm SHA-256 token, kiểm tra hết hạn, xoay vòng Refresh Token) và ghi nhật ký tự động vào `auth_logs`.
- [x] Hoàn thành DDL script `database/01_init_schema.sql` khởi tạo đủ **29 bảng CSDL** với **87 ràng buộc toàn vẹn** (`PK`, `FK`, `CHECK`, `UNIQUE`, `ON DELETE CASCADE / RESTRICT / SET NULL`).
- [x] Viết 4 script nạp dữ liệu mẫu mini trong `database/demomini/` phục vụ kiểm thử cục bộ.
- [x] Dựng hoàn thiện giao diện Trang chủ (`Homepage`) bằng React + TailwindCSS theo bản Canva (Hero Section, linh vật tắc kè hoa, các trụ cột tính năng).
- [x] Dựng Navigation Bar chuẩn có nhận diện phiên đăng nhập: hiển thị Avatar + Tên thật từ CSDL khi đã login, nút Đăng xuất hoạt động thật.
- [x] Xây dựng khung giao diện Đăng nhập / Đăng ký cho Ứng viên (`/login`, `/register`) và Nhà tuyển dụng (`/recruiter/login`, `/recruiter/register`) kết nối trực tiếp với Backend API và PostgreSQL.
- [x] Cấu hình điều hướng React Router DOM (`/`, `/cv-analysis`, `/jobs`, `/login`, `/register`, `/recruiter/login`, `/recruiter/register`, `/recruiter/dashboard`, `/candidate/account`).
- [x] Hoàn thiện tài liệu Kế hoạch kiểm thử tổng thể (`docs/TEST_PLAN.md`) và Thiết kế giao diện quản trị (`docs/WIREFRAMES.md`).
- [x] Xây dựng bộ kịch bản kiểm thử tự động Postman/Newman gồm 18 requests và 34 assertions (`postman/CView_Auth_RBAC_Session.postman_collection.json`).
- [x] Cấu hình Docker Compose môi trường dev (`docker-compose.dev.yml`) cho PostgreSQL và FastAPI Backend.
- [ ] Cấu hình công cụ quản lý phiên bản CSDL Alembic (chuyển sang Sprint 2).
- [ ] Ghép nối container `cview-frontend` vào `docker-compose.dev.yml` và hoàn thiện mạng nội bộ 3 VMs (chuyển sang Sprint 2).

#### 📝 4. Review
- Cần check lại cách handle lỗi và báo lại với người dùng (phần login/ register)

---

### 🏃 Sprint 2 (Tuần 2): Tập Trung 2 Nhiệm Vụ Chính: Trang Tìm Việc & Đăng Bài Tuyển Dụng

#### 🎯 1. Mục tiêu của sprint
* **Tập trung vào 02 nghiệp vụ cốt lõi:**
  1. **Nghiệp vụ Tìm việc (`/jobs`):** Hoàn thiện trải nghiệm tìm kiếm, bộ lọc đa tiêu chí trên CSDL PostgreSQL và giao diện Job Cards.
  2. **Nghiệp vụ Đăng bài tuyển dụng & Kiểm duyệt:** Xây dựng luồng tạo tin tuyển dụng từ Nhà tuyển dụng và màn hình kiểm duyệt tin của Admin.
* Sinh 2 bộ dữ liệu: Bộ dữ liệu Demo nghiệp vụ và Bộ dữ liệu Lớn ($\ge 100.000$ dòng ở `matched_results` và `activity_logs`).
* Trau chuốt lại giao diện Homepage cho đẹp mắt, cấu hình Responsive co giãn tự động phù hợp với mọi kích thước màn hình (đặc biệt tối ưu trên điện thoại / mobile).
* Bổ sung container Frontend vào Docker Compose (`docker-compose.dev.yml`).
* **Sự kiện Scrum:**
  * *Sprint Planning:* Giao Issue cho trang Tìm việc, UI Đăng bài của Nhà tuyển dụng & Script Seed Data.
  * *Daily Standup:* Thống nhất format dữ liệu API tìm việc và quy chuẩn duyệt tin (`PENDING` $\rightarrow$ `APPROVED` / `REJECTED`).
  * *Sprint Review:* Demo bấm nút *Tuyển dụng* $\rightarrow$ Đăng nhập NTD $\rightarrow$ Đăng bài mới $\rightarrow$ Admin duyệt bài $\rightarrow$ Ứng viên vào tab *Tìm việc* tìm kiếm theo từ khóa; Chạy kiểm thử tự động Postman/Newman cho các API mới của Sprint 2.

#### 👥 2. Phân công chi tiết
| Thành viên 1: Nguyễn Bích Uyên<br>*(Leader / Backend Chính / Integration)* | Thành viên 2: Lê Thị Hoài Thương<br>*(CSDL / Backend / Nghiệp vụ dữ liệu)* | Thành viên 3: Trần Tiến Đạt<br>*(Frontend Người dùng / Thiết kế UI)* | Thành viên 4: Nguyễn Thị Thu Uyên<br>*(Frontend Admin & Thống kê / QA / Hạ tầng 3 VMs)* |
| :--- | :--- | :--- | :--- |
| - Xây dựng Middleware ghi nhận tự động hành vi người dùng vào bảng `activity_logs` (`action_type`, `target_entity`, `target_id`, `details JSONB` gắn với `sessions_id`) và ghi lỗi vào `system_error_logs`.<br>- Xây dựng API cho trang **Account Ứng viên** (`GET/PUT /candidate/profile` cập nhật `candidate_profiles`, `addresses`) và **Hồ sơ Nhà tuyển dụng** (`companies`, `recruiter_profiles`).<br>- Xây dựng API cho phân hệ **Đăng bài của Nhà tuyển dụng (`job_posts`)**: Tạo bài tuyển dụng mới, gắn kỹ năng (`job_skills`: `'MANDATORY'`/`'PREFERRED'`), chứng chỉ (`job_certificates`), lĩnh vực (`job_domains`), xem danh sách bài đã đăng và trạng thái duyệt (`'PENDING'`, `'APPROVED'`, `'REJECTED'`).<br>- Xây dựng API **Kiểm duyệt và Đăng tuyển** cho Admin: Duyệt hoặc từ chối bài đăng (`approval_status`, `approved_by`, `approved_at`, `rejection_reason`) và gửi thông báo vào `other_notifications`. | - Viết script sinh dữ liệu tự động có thể tái tạo (`database/02_seed_data.py`) bám sát đúng quy mô trong `DESIGN.md`:<br>  1. **Bộ dữ liệu Demo gọn:** ~100 `accounts`, 20 `companies`, 60 `recruiter_profiles`, 50 `candidate_profiles`, 20 `domains`, 100 `skills`, 30 `certificates`, 50 `resumes`, 50 `job_posts`, 1.000 `matched_results`, 2.000 `activity_logs`.<br>  2. **Bộ dữ liệu Lớn (Đánh giá hiệu năng):**<br>     - **Các bảng $\ge 10.000$ bản ghi:** `accounts` (15k), `addresses` (15k), `candidate_profiles` (10k), `resumes` (10k), `resume_skills` (40k), `job_posts` (10k), `job_skills` (40k), `search_history` (30k), `job_notifications` (30k), `job_applications` (15k).<br>     - **02 bảng siêu lớn $\ge 100.000$ bản ghi:** `matched_results` (200.000 - 500.000 bản ghi) và `activity_logs` ($\ge 100.000$ bản ghi).<br>- Xây dựng API **Danh mục** (`domains`, `skills`, `certificates`) và API cho trang **Tìm việc theo từ khóa** (`GET /jobs/search` lọc theo `keyword`, `city`, `domain_id`, `job_type`, `workplace_type`, `salary_min`, phân trang) đồng thời tự động ghi vết vào bảng `search_history`.<br>- **Cấu hình Quản lý phiên bản CSDL (Alembic Database Migration) - Giải pháp quản lý & giảm thiểu rủi ro (Mitigation):**<br>  - Khởi tạo môi trường Alembic, cấu hình kết nối trực tiếp với các model SQLAlchemy trong `backend/app/models/`.<br>  - Tạo bản ghi migration đầu tiên (baseline migration cho 29 bảng) và thiết lập lệnh `alembic upgrade head` để đảm bảo việc nâng cấp schema trên các máy và VM3 đồng bộ, an toàn, không bị mất dữ liệu hay lỗi xung đột cấu trúc bảng khi phát triển song song. | - **Tập trung vào nghiệp vụ Tìm việc (`/jobs`):**<br>  - Thanh nhập từ khóa tìm kiếm công việc trực tiếp trên CSDL kèm bộ lọc nhanh (Địa điểm `city`, Lĩnh vực `domain`, Hình thức `FULL_TIME`/`PART_TIME`, `ON_SITE`/`REMOTE`, Mức lương).<br>  - Danh sách thẻ công việc (Job Cards), phân trang và Modal/Trang xem chi tiết JD, nút Lưu việc làm (`saved_jobs`).<br>- **Trau chuốt lại trang Homepage:**<br>  - Sửa lại giao diện Homepage cho đẹp mắt, căn chỉnh typography, hình ảnh linh vật tắc kè hoa.<br>  - **Tối ưu Responsive:** Thay đổi để xem được web trên cả điện thoại (tự động tinh chỉnh phù hợp kích thước cửa sổ màn hình Mobile / Tablet / Desktop).<br>- *(Nếu kịp tiến độ)*: Làm thêm giao diện trang **Account Ứng viên** (`/candidate/account`) để quản lý thông tin cá nhân và danh sách CV đã tải lên. | - **Bổ sung container cho Frontend vào Docker:** Thêm service `cview-frontend` vào `docker-compose.dev.yml` để hoàn thiện bộ 3 container local (`cview-frontend`, `cview-backend`, `cview-postgres`).<br>- **Tập trung vào nghiệp vụ Đăng bài tuyển dụng:**<br>  - **Phân hệ Nhà tuyển dụng:**<br>    - Giao diện cơ bản sau khi đăng nhập (chính là **Dashboard thống kê**: tạo khung template hiển thị các chỉ số tuyển dụng tổng quan).<br>    - Nút **"Đăng tuyển"** rõ ràng, trực quan.<br>    - Giao diện **Đăng bài tuyển dụng (Form)**: Nhập thông tin việc làm, gắn kỹ năng, chứng chỉ, ngành nghề, mức lương, địa điểm.<br>    - Bảng **Theo dõi trạng thái các bài đăng tuyển**: Danh sách tin đã đăng, ngày đăng, trạng thái (`Chờ duyệt - PENDING`, `Đã duyệt - APPROVED`, `Bị từ chối - REJECTED`).<br>  - **Phân hệ Admin:**<br>    - Giao diện cơ bản của Admin cho phép **Kiểm duyệt bài tuyển dụng** (duyệt sang `APPROVED` hoặc từ chối kèm lý do `REJECTED`).<br>    - Các phần thống kê, báo cáo khác của Admin chưa cần làm đến ở tuần này (chỉ cần tạo template khung hoặc để trống).<br>- Dựng **VM3 (DB + Storage)**: Triển khai PostgreSQL container với persistent volume, khởi tạo 29 bảng và nạp thử dữ liệu từ script của Thương.<br>- Viết bổ sung kịch bản kiểm thử Postman cho các API mới của Sprint 2: Luồng Đăng bài tuyển dụng (NTD), Kiểm duyệt bài đăng (Admin), và Tìm kiếm việc làm theo từ khóa/bộ lọc (Ứng viên). |

#### ✅ 3. Kết quả đạt được
- [ ] Bổ sung container `cview-frontend` vào `docker-compose.dev.yml` và khởi chạy thành công bộ 3 containers local.
- [ ] Script sinh dữ liệu tự động `database/02_seed_data.py` (Bộ Demo & Bộ Lớn $\ge 100.000$ dòng `matched_results`, `activity_logs`).
- [ ] Cấu hình môi trường Alembic Migration và tạo bản ghi migration baseline cho 29 bảng CSDL.
- [ ] API Danh mục (`domains`, `skills`, `certificates`) và API Tìm việc `GET /jobs/search` tự động ghi bảng `search_history`.
- [ ] Giao diện hoàn chỉnh trang **Tìm việc** (`/jobs`): Thanh search, bộ lọc, thẻ Job Cards, phân trang, Modal xem chi tiết JD.
- [ ] Tối ưu giao diện Homepage đẹp mắt và Responsive mượt mà trên cả điện thoại di động (Mobile) lẫn Desktop.
- [ ] Giao diện cơ bản Nhà tuyển dụng: Dashboard thống kê mẫu, nút Đăng tuyển, Form tạo tin đa tiêu chí và Bảng theo dõi trạng thái tin đăng.
- [ ] Giao diện cơ bản Admin: Màn hình kiểm duyệt duyệt/từ chối bài đăng tuyển dụng (các mục thống kê khác để dạng template/placeholder).
- [ ] Giao diện trang **Account Ứng viên** (`/candidate/account`) hiển thị thông tin cá nhân (nếu Đạt hoàn thành sớm).
- [ ] Middleware tự động ghi vết `activity_logs` và bắt ngoại lệ ghi `system_error_logs`.
- [ ] Triển khai VM3 (DB + Storage) trên hạ tầng máy ảo thực tế và bộ test Postman Sprint 2.

#### 📝 4. Review
- *Ghi chú / Lưu ý điều chỉnh:* Giao diện Frontend do Thu Uyên phụ trách ở Sprint 2 (Đăng bài tuyển dụng của NTD & Duyệt bài của Admin) chỉ cần thiết kế ở mức cơ bản mục tiêu là có khung template và phục vụ việc kết nối với backend để kiểm thử. Tiến Đạt sẽ tiếp nhận để trau chuốt lại thẩm mỹ, căn chỉnh màu sắc và responsive ở các sprint tiếp theo.
- *(Đánh giá chi tiết để trống - Trưởng nhóm ghi nhận sau buổi họp Sprint 2 Retrospective)*

---

### 🏃 Sprint 3 (Tuần 3): Module Phân Tích CV PDF, Matching Engine, Transaction Nghiệp Vụ & Triển Khai VM2

#### 🎯 1. Mục tiêu của sprint
* Hoàn thiện trang **Phân tích CV** (`/cv-analysis`) trên Navbar: Tải file PDF $\le 10\text{MB}$ + chọn bộ lọc $\rightarrow$ Bóc tách `resume_skills` $\rightarrow$ Chấm điểm, Góp ý & Đề xuất việc làm trong `matched_results`.
* Xây dựng Matching Engine tính điểm so khớp chi tiết (`overall_score`, `skill_score`, `experience_score`, `education_score`, `missing_skills`, `ai_feedback`).
* Hiện thực hóa Transaction ACID có Rollback tự động khi gặp sự cố; tạo ít nhất 01 Database View và điền **Mục 3 (`docs/DESIGN.md`)**.
* Dựng **VM2 (Backend)** chạy FastAPI qua Docker, kết nối sang PostgreSQL trên VM3.
* **Sự kiện Scrum:**
  * *Sprint Planning:* Phân công module PDF Parser, Matching Engine & UI trang Phân tích CV.
  * *Daily Standup:* Tinh chỉnh trọng số chấm điểm và format trả lời của thuật toán Matching.
  * *Sprint Review:* Demo bấm tab *Phân tích CV* $\rightarrow$ tải PDF & chọn bộ lọc $\rightarrow$ nhận kết quả Chấm điểm, Góp ý AI và Đề xuất việc làm.

#### 👥 2. Phân công chi tiết
| Thành viên 1: Nguyễn Bích Uyên<br>*(Leader / Backend Chính / Integration)* | Thành viên 2: Lê Thị Hoài Thương<br>*(CSDL / Backend / Nghiệp vụ dữ liệu)* | Thành viên 3: Trần Tiến Đạt<br>*(Frontend Người dùng / Thiết kế UI)* | Thành viên 4: Nguyễn Thị Thu Uyên<br>*(Frontend Admin & Thống kê / QA / Hạ tầng 3 VMs)* |
| :--- | :--- | :--- | :--- |
| - Xây dựng API **Upload & Bóc tách CV PDF (`resumes` & `resume_skills`)**:<br>  - Kiểm tra file `.pdf` dung lượng $\le 10\text{MB}$ (`file_size_bytes <= 10485760`), lưu trữ file và ghi bảng `resumes`.<br>  - Trích xuất văn bản PDF, đối sánh với bảng `skills` để lưu danh sách kỹ năng vào `resume_skills` (`years_experience`, `proficiency_level`, `confidence_score`).<br>- Xây dựng **Engine Phân tích độ phù hợp CV (`cv_analyses` & `matched_results`)**:<br>  - Nhận file PDF CV và đầy đủ các tiêu chí bộ lọc ứng viên chọn trên trang *Phân tích CV* (`target_position_id`, `target_city`, `target_domain_id`, `target_job_type`, `target_workplace_type`, `target_min_salary`, `target_experience_years`, `target_job_level`).<br>  - Lọc danh sách công việc trong CSDL và tính điểm so khớp chi tiết cho từng công việc: `overall_score`, `skill_score`, `experience_score`, `education_score`, phát hiện kỹ năng còn thiếu `missing_skills` (JSONB) và sinh nhận xét/góp ý `ai_feedback`. | - Viết truy vấn SQL tiền lọc (Pre-filtering SQL) thu hẹp nhanh các bản ghi `job_posts` (`approval_status = 'APPROVED'`) thỏa mãn các tiêu chí bộ lọc trong `cv_analyses`, lấy kèm `job_skills`, `companies`, `addresses`.<br>- Thiết kế và hiện thực hóa **Transaction Nghiệp vụ** (phục vụ luôn Mục 3 trong `docs/DESIGN.md`):<br>  - Đảm bảo tính nguyên tử (ACID) khi tạo phiên phân tích: Ghi `resumes` $\rightarrow$ `resume_skills` $\rightarrow$ `cv_analyses` $\rightarrow$ `matched_results` $\rightarrow$ `activity_logs` trong Transaction; kiểm tra **Rollback tự động** khi xảy ra lỗi giữa chừng.<br>  - Tài liệu hóa kịch bản Transaction & Rollback vào **Mục 3 (`## 3. Transaction & Đồng thời`)** của `docs/DESIGN.md`.<br>- Tạo ít nhất **01 Database View** (VD: `v_job_post_details` hoặc `v_candidate_analysis_summary`) và tích hợp vào API. | - Code hoàn chỉnh trang **Phân tích CV** (truy cập từ tab *Phân tích CV* trên Navbar `/cv-analysis` hoặc nút *"BẮT ĐẦU PHÂN TÍCH CV $\rightarrow$"* ở Trang chủ):<br>  - **Bước 1 - Tải CV & Chọn tiêu chí lọc:** Khu vực kéo thả file PDF (hoặc chọn CV có sẵn trong tài khoản) + Form chọn các bộ lọc tìm việc (Địa điểm, Lĩnh vực/Domain, Full-time/Part-time, Lương kỳ vọng, Online/Offline, Số năm kinh nghiệm, Vị trí/Cấp bậc).<br>  - **Bước 2 - Hiển thị Kết quả Phân tích (đúng 3 trụ cột trên Homepage):**<br>    1. *Chấm điểm:* Hiển thị `overall_score` và 3 điểm thành phần (`skill_score`, `experience_score`, `education_score`) cùng các kỹ năng bóc tách được (`resume_skills`).<br>    2. *Góp ý:* Hiển thị danh sách kỹ năng còn thiếu (`missing_skills`) và lời khuyên cải thiện CV (`ai_feedback`).<br>    3. *Đề xuất việc làm:* Danh sách các công việc trong CSDL có độ phù hợp cao nhất xếp hạng từ trên xuống, bấm vào xem so sánh chi tiết hoặc nộp đơn ứng tuyển (`job_applications`).<br>- *(Nếu chưa hoàn tất ở Sprint 2)*: Hoàn thiện nốt trang **Account Ứng viên** (`/candidate/account`). | - Dựng **VM2 (Backend)** chạy FastAPI qua Docker, cấu hình kết nối mạng từ VM2 sang PostgreSQL trên VM3 và cấu hình volume lưu trữ file PDF tải lên.<br>- Xây dựng các Component biểu đồ trực quan (Radial Progress / Radar Chart) hiển thị điểm số Matching trên trang *Phân tích CV*.<br>- Kiểm thử chuyên sâu chức năng *Phân tích CV*: Kiểm thử file PDF hợp lệ/lỗi/quá 10MB, kiểm thử kết quả lọc với các tổ hợp tiêu chí khác nhau và kiểm tra dữ liệu ghi vào `cv_analyses`, `matched_results`. |

#### ✅ 3. Kết quả đạt được
- [ ] API Upload & Parser file PDF CV $\le 10\text{MB}$, trích xuất kỹ năng vào `resume_skills`.
- [ ] Matching Engine tính toán điểm thành phần và điểm tổng (`overall_score`, `missing_skills`, `ai_feedback`).
- [ ] Kịch bản Transaction nghiệp vụ đa bảng có Rollback tự động khi lỗi và hoàn thiện Mục 3 trong `docs/DESIGN.md`.
- [ ] Tạo Database View phục vụ chi tiết công việc hoặc tóm tắt phân tích ứng viên.
- [ ] Giao diện trang **Phân tích CV** (`/cv-analysis`) 2 bước: Tải CV & Bộ lọc $\rightarrow$ Hiển thị kết quả 3 trụ cột (Chấm điểm - Góp ý - Đề xuất việc làm).
- [ ] Component biểu đồ Radar / Radial Chart điểm số matching.
- [ ] Triển khai VM2 (FastAPI Backend) kết nối thông suốt sang VM3 (PostgreSQL).
- [ ] Bộ kịch bản kiểm thử Postman cho toàn bộ luồng Phân tích CV.

#### 📝 4. Review
*(Để trống - Trưởng nhóm ghi nhận sau buổi họp Sprint 3 Retrospective)*

---

### 🏃 Sprint 4 (Tuần 4): Hệ Thống Thông Báo Job Mới Tự Động, Báo Cáo Thống Kê & 08 Truy Vấn SQL Nâng Cao

#### 🎯 1. Mục tiêu của sprint
* Hoàn thiện **Hệ thống thông báo Job mới tự động (`job_notifications`)**: Khi Admin duyệt bài mới, tự động quét `search_history` và `resumes` để gửi thông báo cho ứng viên phù hợp.
* Xây dựng API và giao diện **Báo cáo thống kê** cho 3 vai trò: Account Ứng viên, UI Nhà tuyển dụng và Admin Portal.
* Viết đủ **tối thiểu 08 truy vấn SQL nâng cao + View** và hoàn thành **Mục 2 (`## 2. Truy vấn SQL, View`)** trong `docs/DESIGN.md`.
* Dựng **VM1 (Frontend)** chạy React + Nginx Reverse Proxy, thông mạng toàn bộ VM1 $\leftrightarrow$ VM2 $\leftrightarrow$ VM3.
* **Sự kiện Scrum:**
  * *Sprint Planning:* Giao task Notification Trigger & 3 phân hệ Thống kê.
  * *Daily Standup:* Kiểm tra hiệu năng câu lệnh SQL thống kê phức tạp (Window Functions, CTE).
  * *Sprint Review:* Demo luồng có Job mới được duyệt $\rightarrow$ tự động gửi thông báo kèm gợi ý matching cho ứng viên từng tìm kiếm việc tương tự; Demo thống kê ở cả 3 vai trò.

#### 👥 2. Phân công chi tiết
| Thành viên 1: Nguyễn Bích Uyên<br>*(Leader / Backend Chính / Integration)* | Thành viên 2: Lê Thị Hoài Thương<br>*(CSDL / Backend / Nghiệp vụ dữ liệu)* | Thành viên 3: Trần Tiến Đạt<br>*(Frontend Người dùng / Thiết kế UI)* | Thành viên 4: Nguyễn Thị Thu Uyên<br>*(Frontend Admin & Thống kê / QA / Hạ tầng 3 VMs)* |
| :--- | :--- | :--- | :--- |
| - Xây dựng nghiệp vụ **Hệ thống thông báo Job mới tự động (`job_notifications`)**:<br>  - Khi Admin duyệt một bài tuyển dụng mới (`approval_status = 'APPROVED'`), kích hoạt Background Task quét bảng `search_history` và `resumes` để tìm những ứng viên từng tìm kiếm công việc tương tự $\rightarrow$ tự động tạo thông báo trong `job_notifications` kèm gợi ý phân tích độ phù hợp.<br>- Xây dựng API Quản lý đơn ứng tuyển (`job_applications`) và API chuông thông báo trên Navbar (`GET /notifications`, đánh dấu đã đọc).<br>- Xây dựng các API trả dữ liệu **Báo cáo thống kê** cho: (1) Trang Account của Ứng viên, (2) Mục Theo dõi thống kê trong UI Nhà tuyển dụng, và (3) Trang Admin. | - Hoàn thiện đủ **tối thiểu 08 truy vấn SQL nâng cao + View** vào `database/03_queries_and_views.sql` và điền đầy đủ **Mục 2 (`## 2. Truy vấn SQL, View`)** trong `docs/DESIGN.md`:<br>  1. **Truy vấn quét user từng tìm kiếm công việc tương tự:** Dùng `EXISTS`, `JOIN` trên `search_history`, `job_posts`, `job_domains`, `candidate_profiles` để sinh `job_notifications`.<br>  2. **Truy vấn Thống kê cho Ứng viên:** Dùng `CTE`, `JOIN` thống kê lịch sử sử dụng hệ thống (`activity_logs`, `search_history`) và kết quả matching các công việc đã phân tích/ứng tuyển (`cv_analyses`, `matched_results`, `job_applications`).<br>  3. **Truy vấn Thống kê cho Nhà tuyển dụng:** Dùng `GROUP BY`, `CASE WHEN`, `Window Functions` (`RANK()`, `DENSE_RANK()`) thống kê độ phổ biến của từng bài đăng (lượt xem, lượt lưu `saved_jobs`, số đơn ứng tuyển), lịch sử tiếp cận ứng viên và phân phối kết quả matching (`<50%`, `50-70%`, `70-85%`, `>85%`).<br>  4. **Truy vấn Thống kê cho Admin:** Thống kê lịch sử hoạt động và tương tác của người dùng trên toàn hệ thống (`activity_logs`, `auth_logs`, `system_error_logs`). | - Hoàn thiện giao diện **Account Ứng viên & Thông báo** trên Navbar:<br>  - Tích hợp **Chuông thông báo** cạnh hình Account khi ứng viên đã đăng nhập: Hiển thị thông báo việc làm mới phù hợp (`job_notifications`) kèm nút bấm dẫn thẳng sang trang *Phân tích CV* với công việc đó, và thông báo hệ thống (`other_notifications`).<br>  - Trong trang **Account Ứng viên**: Bổ sung tab **Thống kê & Lịch sử** (theo dõi lịch sử tải CV, lịch sử tìm kiếm, biểu đồ kết quả matching các công việc đã phân tích và trạng thái các công việc đã ứng tuyển/lưu).<br>- Phối hợp với Thu Uyên hoàn thiện điều hướng và quản lý danh sách ứng viên tiếp cận trong **UI Nhà tuyển dụng**. | - Xây dựng hoàn chỉnh giao diện **Theo dõi thống kê trong UI Nhà tuyển dụng** (đổ dữ liệu biểu đồ từ CSDL vào Dashboard đã dựng khung từ Sprint 2):<br>  - Biểu đồ độ phổ biến của các bài đăng tuyển dụng (lượt xem, lượt lưu, lượt nộp CV).<br>  - Bảng lịch sử tiếp cận ứng viên và biểu đồ phân phối kết quả matching (`overall_score`, `skill_score`) của các ứng viên đã so khớp với bài đăng của doanh nghiệp.<br>- Xây dựng hoàn chỉnh giao diện **Thống kê dành cho Admin** (hoàn thiện chi tiết từ khung template đã dựng ở Sprint 2): Biểu đồ lịch sử hoạt động và tương tác của người dùng trên toàn hệ thống theo thời gian.<br>- Dựng **VM1 (Frontend)**: Đóng gói React + Nginx Reverse Proxy trên Docker, kết nối xuyên suốt VM1 $\leftrightarrow$ VM2 $\leftrightarrow$ VM3. |

#### ✅ 3. Kết quả đạt được
- [ ] Background task tự động gửi thông báo `job_notifications` khi có tin tuyển dụng mới được duyệt.
- [ ] API chuông thông báo (`GET /notifications`) và API nộp đơn ứng tuyển (`job_applications`).
- [ ] Hoàn thành 08 truy vấn SQL nâng cao (CTE, Window Functions, EXISTS, Subqueries) và Mục 2 trong `docs/DESIGN.md`.
- [ ] Chuông thông báo trên Navbar kèm danh sách thông báo thả xuống.
- [ ] Giao diện tab Thống kê & Lịch sử trong trang Account Ứng viên.
- [ ] Giao diện biểu đồ Thống kê tuyển dụng trong Recruiter Dashboard (`/recruiter/dashboard`).
- [ ] Giao diện biểu đồ Thống kê hoạt động toàn hệ thống cho Admin.
- [ ] Đóng gói VM1 (Frontend Nginx) và thông luồng mạng 3 VMs (`VM1 <-> VM2 <-> VM3`).

#### 📝 4. Review
*(Để trống - Trưởng nhóm ghi nhận sau buổi họp Sprint 4 Retrospective)*

---

### 🏃 Sprint 5 (Tuần 5): Xử Lý Tranh Chấp Đồng Thời, Tối Ưu Chỉ Mục Bảng Lớn, Migration & Sao Lưu CSDL

#### 🎯 1. Mục tiêu của sprint
* Thực nghiệm kịch bản **Tranh chấp đồng thời (Concurrency)** với 2 kết nối chồng lấn, áp dụng cơ chế khóa và điền **Mục 3 (`docs/DESIGN.md`)**.
* Thiết kế ít nhất **04 chỉ mục chuyên sâu**, đo đạc `EXPLAIN (ANALYZE, BUFFERS)` trước/sau Index trên bảng $\ge 100.000$ dòng và điền **Mục 4 (`docs/DESIGN.md`)**.
* Thực hiện **01 thay đổi schema có quản lý phiên bản (Migration)** không làm mất dữ liệu; viết script `backup.sh` / `restore.sh` và nghiệm thu trên VM3 để điền **Mục 5 (`docs/DESIGN.md`)**.
* Tinh chỉnh toàn diện trải nghiệm người dùng (UI/UX Polish) trên bộ dữ liệu lớn.
* **Sự kiện Scrum:**
  * *Sprint Planning:* Phân công bài toán Tranh chấp đồng thời, Tối ưu Index trên bảng $\ge 100.000$ dòng, Migration & Backup.
  * *Daily Standup:* Rà soát số liệu đo đạc `Execution Time` và `Buffers` trước/sau khi đánh Index.
  * *Sprint Review:* Trình diễn kết quả đo Index, demo 2 kết nối tranh chấp đồng thời và demo Backup/Restore thực tế trên VM3.

#### 👥 2. Phân công chi tiết
| Thành viên 1: Nguyễn Bích Uyên<br>*(Leader / Backend Chính / Integration)* | Thành viên 2: Lê Thị Hoài Thương<br>*(CSDL / Backend / Nghiệp vụ dữ liệu)* | Thành viên 3: Trần Tiến Đạt<br>*(Frontend Người dùng / Thiết kế UI)* | Thành viên 4: Nguyễn Thị Thu Uyên<br>*(Frontend Admin & Thống kê / QA / Hạ tầng 3 VMs)* |
| :--- | :--- | :--- | :--- |
| - Phối hợp với Thương xây dựng kịch bản thực nghiệm **Tình huống Tranh chấp đồng thời (Concurrency)** với 2 kết nối chạy chồng lấn và hoàn thiện **Mục 3 (`## 3. Transaction & Đồng thời`)** trong `docs/DESIGN.md`:<br>  - *Kịch bản:* 2 Admin cùng lúc bấm duyệt/từ chối cùng 1 bài đăng `job_posts` đang `'PENDING'`, hoặc Ứng viên rút đơn ứng tuyển (`'WITHDRAWN'`) đúng lúc Nhà tuyển dụng cập nhật trạng thái đơn đó sang `'OFFERED'` trong `job_applications`.<br>  - Viết script Python đa luồng chạy 2 kết nối chồng lấn, chứng minh lỗi khi chưa khóa và áp dụng cơ chế khóa (`SELECT ... FOR UPDATE`) / Isolation Level để bảo vệ.<br>- Tối ưu hóa thời gian phản hồi API Tìm việc và Phân tích CV trên bộ dữ liệu lớn ($\ge 100.000$ bản ghi). | - **Thiết kế Chỉ mục (Index) & Phân tích Hiệu năng** (Hoàn thiện **Mục 4 `## 4. Chỉ mục (Index) & Hiệu năng`** trong `docs/DESIGN.md`):<br>  - Thiết kế ít nhất **04 chỉ mục chuyên sâu** ngoài PK/UNIQUE trên các bảng lớn: `matched_results(analysis_id, overall_score DESC)`, `activity_logs(action_type, created_at DESC)`, `job_posts(approval_status, job_type, workplace_type, salary_min)`, `search_history(domain_id, city, created_at DESC)`.<br>  - Chạy `EXPLAIN (ANALYZE, BUFFERS)` **trước và sau** khi đánh Index trên bảng $\ge 100.000$ dòng (`matched_results` & `activity_logs`), lập bảng so sánh chi tiết.<br>- **Schema Migration & Sao lưu** (Hoàn thiện **Mục 5 `## 5. Migration & Sao lưu`** trong `docs/DESIGN.md`):<br>  - Thực hiện **01 thay đổi schema có quản lý phiên bản** trên CSDL đã có sẵn dữ liệu mà không làm mất dữ liệu.<br>  - Viết script chuẩn `database/backup.sh` (`pg_dump`) và `database/restore.sh` (`pg_restore`). | - Tinh chỉnh trải nghiệm người dùng (UI/UX Polish) trên toàn bộ luồng điều hướng:<br>  - Kiểm tra tính mượt mà khi chuyển đổi giữa **Trang chủ** $\leftrightarrow$ **Phân tích CV** $\leftrightarrow$ **Tìm việc** $\leftrightarrow$ **Account Ứng viên** và cổng **Tuyển dụng**.<br>  - Tối ưu hiển thị phân trang, Skeleton Loading, Empty States và thông báo Toast khi truy vấn trên bộ dữ liệu lớn hàng trăm nghìn bản ghi.<br>- Đồng bộ hoàn toàn màu sắc, hình minh họa và font chữ trên mọi trang theo đúng phong cách bản Canva Homepage. | - Thực thi và nghiệm thu kịch bản **Backup & Restore thực tế trên VM3**:<br>  - Sao lưu CSDL đang hoạt động ra file dump, giả lập sự cố mất dữ liệu, sau đó chạy kịch bản Restore khôi phục thành công và kiểm tra lại trên giao diện VM1.<br>  - Ghi nhận log và ảnh chụp màn hình đưa vào Mục 5 của `docs/DESIGN.md`.<br>- Thực hiện kiểm thử hiệu năng (Performance Test) trên kiến trúc 3 VMs trước và sau khi đánh Index. |

#### ✅ 3. Kết quả đạt được
- [ ] Script Python thực nghiệm 2 kết nối tranh chấp đồng thời và cơ chế khóa `SELECT FOR UPDATE`.
- [ ] Hoàn thành Mục 3 (Transaction & Concurrency) trong `docs/DESIGN.md`.
- [ ] Thiết kế 04 chỉ mục chuyên sâu, chạy `EXPLAIN (ANALYZE, BUFFERS)` trước/sau Index trên bảng lớn $\ge 100.000$ dòng và hoàn thành Mục 4 `docs/DESIGN.md`.
- [ ] Thực hiện 01 schema migration có bảo toàn dữ liệu và hoàn thành Mục 5 `docs/DESIGN.md`.
- [ ] Script `backup.sh` và `restore.sh` chạy thành công trên VM3.
- [ ] Tối ưu hóa UI/UX: Skeleton Loading, phân trang mượt mà trên tập dữ liệu lớn.
- [ ] Báo cáo kiểm thử hiệu năng API trước/sau khi tối ưu CSDL.

#### 📝 4. Review
*(Để trống - Trưởng nhóm ghi nhận sau buổi họp Sprint 5 Retrospective)*

---

### 🏃 Sprint 6 (Tuần 6): Đóng Băng Tính Năng Cốt Lõi, Kiểm Thử Hồi Quy 3 VMs & Họp Decision Gate Chatbot

#### 🎯 1. Mục tiêu của sprint
* **Đóng băng tính năng cốt lõi (Core Feature Freeze):** Rà soát mã nguồn Backend, Frontend, CSDL đảm bảo hoàn thành 100% yêu cầu trong `docs/REQUIREMENTS.md`.
* Hoàn thiện 100% tài liệu `docs/DESIGN.md` (cả 5 mục lớn) và rà soát lịch sử Git/GitHub (Issues, Branches, PRs, Reviews).
* Thực hiện **Kiểm thử hồi quy toàn diện (Full Regression Testing)** trên môi trường 03 Máy ảo (VM1, VM2, VM3).
* **Họp chốt quyết định làm Chatbot cộng điểm (Decision Gate):** Đánh giá mức độ ổn định để kích hoạt Phương án A (làm Chatbot ở Tuần 7) hoặc Phương án B (Hardening).
* **Sự kiện Scrum:**
  * *Sprint Planning:* Lên danh sách kiểm tra đóng băng tính năng và kịch bản test hồi quy.
  * *Sprint Review:* Nghiệm thu toàn bộ tính năng và tài liệu đồ án.
  * *Decision Gate:* Bỏ phiếu thống nhất kế hoạch Sprint 7.

#### 👥 2. Phân công chi tiết
| Thành viên 1: Nguyễn Bích Uyên<br>*(Leader / Backend Chính / Integration)* | Thành viên 2: Lê Thị Hoài Thương<br>*(CSDL / Backend / Nghiệp vụ dữ liệu)* | Thành viên 3: Trần Tiến Đạt<br>*(Frontend Người dùng / Thiết kế UI)* | Thành viên 4: Nguyễn Thị Thu Uyên<br>*(Frontend Admin & Thống kê / QA / Hạ tầng 3 VMs)* |
| :--- | :--- | :--- | :--- |
| - Rà soát toàn bộ mã nguồn Backend: Chuẩn hóa HTTP status codes, CORS giữa VM1 và VM2, kiểm tra cơ chế tự động ghi `auth_logs`, `activity_logs` và `system_error_logs`.<br>- Kiểm tra toàn bộ lịch sử Git trên GitHub: Đảm bảo mọi đầu việc từ Tuần 1 đến Tuần 6 đều tuân thủ đúng quy trình **Issue $\rightarrow$ Nhánh `feature/*` $\rightarrow$ Commit $\rightarrow$ Pull Request $\rightarrow$ Review chéo $\rightarrow$ Merge**.<br>- **Chủ trì cuộc họp Decision Gate cuối Tuần 6:** Đánh giá mức độ ổn định của hệ thống. Nếu mọi yêu cầu bắt buộc đã ổn thỏa, chốt thiết kế API cho **Chatbot AI CView** để triển khai trong Tuần 7. | - Tổng duyệt toàn bộ file `docs/DESIGN.md` (đảm bảo cả 5 mục lớn: *1. Thiết kế 29 bảng & ERD*, *2. Truy vấn SQL & View*, *3. Transaction & Đồng thời*, *4. Chỉ mục & Hiệu năng*, *5. Migration & Sao lưu* đều hoàn chỉnh).<br>- Đối chiếu schema thực tế đang chạy trên PostgreSQL (VM3) khớp 100% với tài liệu thiết kế.<br>- Chuẩn bị sẵn câu truy vấn gom ngữ cảnh (Context Query lấy thông tin `resume_skills`, `matched_results` gồm `missing_skills`, `ai_feedback` và `job_posts`) phục vụ cho Chatbot nếu nhóm triển khai ở Tuần 7. | - Hoàn thiện Responsive UI cho toàn bộ các trang trên Navbar (*Trang chủ, Phân tích CV, Tìm việc, Đăng nhập/Đăng ký, Account Ứng viên*) và *UI Nhà tuyển dụng*.<br>- Phối hợp với Thu Uyên xử lý dứt điểm toàn bộ các lỗi giao diện (UI bugs) phát hiện trong quá trình kiểm thử tích hợp.<br>- Thiết kế sẵn khung giao diện **Floating Chatbot Widget** (mang hình ảnh linh vật tắc kè hoa CView ở góc dưới bên phải màn hình) để sẵn sàng ghép nối API ở Tuần 7. | - Thực hiện **Kiểm thử Hồi quy Toàn diện (Full Regression Testing)** cho cả 3 vai trò (`CANDIDATE`, `RECRUITER`, `ADMIN`) trực tiếp trên môi trường **03 Máy ảo (VM1, VM2, VM3)**.<br>- Đóng băng cấu hình Docker Compose, Nginx Reverse Proxy và Firewall giữa 3 VMs; viết tài liệu hướng dẫn triển khai hạ tầng (`docs/DEPLOYMENT_3VMS.md`).<br>- Tổng hợp báo cáo kết quả kiểm thử (Test Summary Report) trình bày tại buổi họp Sprint 6 Review. |

#### ✅ 3. Kết quả đạt được
- [ ] Đóng băng mã nguồn cốt lõi Backend & Frontend (không phát sinh bug nghiêm trọng).
- [ ] Hoàn thành 100% nội dung 5 mục trong `docs/DESIGN.md`.
- [ ] Kiểm tra 100% quy trình Git: Các PR đều có review chéo và liên kết Issue.
- [ ] Khung giao diện Floating Chatbot Widget sẵn sàng cho Sprint 7.
- [ ] Báo cáo kiểm thử hồi quy toàn diện trên hệ thống 3 VMs (`docs/DEPLOYMENT_3VMS.md`).
- [ ] Biên bản họp Decision Gate thống nhất phương án triển khai Sprint 7.

#### 📝 4. Review
*(Để trống - Trưởng nhóm ghi nhận sau buổi họp Sprint 6 Retrospective)*

---

### 🏃 Sprint 7 (Tuần 7): Triển Khai Tính Năng Cộng Điểm (Chatbot AI Tư Vấn CV & Gợi Ý Việc Làm)

#### 🎯 1. Mục tiêu của sprint
* **Phương án A (Khuyến nghị lấy điểm cộng):** Triển khai **Chatbot AI Trợ lý CView** hỗ trợ ứng viên giải thích điểm matching, tư vấn bổ sung kỹ năng còn thiếu và gợi ý việc làm phù hợp dựa trên dữ liệu thật trong CSDL.
* **Phương án B (Dự phòng nếu hệ thống lõi cần củng cố):** Tối ưu hóa sâu hiệu năng, viết thêm Unit Test và trau chuốt bộ kịch bản demo bảo vệ.
* **Sự kiện Scrum:**
  * *Sprint Planning:* Mở Sprint Backlog cho tính năng Chatbot (PA A) hoặc Hardening (PA B).
  * *Daily Standup:* Tinh chỉnh prompt AI và độ trễ phản hồi của Chatbot Context Query.
  * *Sprint Review:* Demo hỏi đáp trực tiếp với Chatbot dựa trên kết quả phân tích CV vừa tải lên.

#### 👥 2. Phân công chi tiết
| Thành viên 1: Nguyễn Bích Uyên<br>*(Leader / Backend Chính / Integration)* | Thành viên 2: Lê Thị Hoài Thương<br>*(CSDL / Backend / Nghiệp vụ dữ liệu)* | Thành viên 3: Trần Tiến Đạt<br>*(Frontend Người dùng / Thiết kế UI)* | Thành viên 4: Nguyễn Thị Thu Uyên<br>*(Frontend Admin & Thống kê / QA / Hạ tầng 3 VMs)* |
| :--- | :--- | :--- | :--- |
| **[Phương án A - Làm Chatbot cộng điểm]:**<br>- Xây dựng API Backend cho Chatbot (`POST /api/v1/chatbot/ask`):<br>  - Tích hợp mô hình AI kết hợp ngữ cảnh thực tế từ CSDL (`resume_skills`, `matched_results.missing_skills`, `ai_feedback` và danh sách `job_posts` đang tuyển).<br>  - Hỗ trợ ứng viên hỏi đáp trực tiếp ngay sau khi phân tích CV hoặc khi đang tìm việc: giải thích điểm số, tư vấn bổ sung kỹ năng còn thiếu và gợi ý công việc phù hợp.<br><br>**[Phương án B - Củng cố Core]:**<br>- Refactor code Backend, bổ sung Unit Test & xử lý ngoại lệ chuyên sâu cho Matching Engine. | **[Phương án A - Làm Chatbot cộng điểm]:**<br>- Xây dựng tầng truy vấn ngữ cảnh tốc độ cao (**Chatbot Context Retriever SQL**) giúp trích xuất nhanh hồ sơ kỹ năng của ứng viên trong `resume_skills`, các kỹ năng thiếu trong `matched_results` và Top 5 bài tuyển dụng `job_posts` phù hợp nhất để cung cấp dữ liệu chính xác cho Chatbot trả lời.<br>- Ghi nhận tương tác vào `activity_logs`.<br><br>**[Phương án B - Củng cố Core]:**<br>- Tinh chỉnh bộ dữ liệu Demo tiếng Việt phong phú, sát thực tế để chuẩn bị cho buổi bảo vệ đồ án. | **[Phương án A - Làm Chatbot cộng điểm]:**<br>- Xây dựng hoàn chỉnh giao diện **CView AI Chatbot** tích hợp trên hệ thống:<br>  - Nút mở Chatbot nổi (biểu tượng chú tắc kè hoa CView) hiển thị xuyên suốt trên *Trang chủ*, *Phân tích CV* và *Tìm việc*.<br>  - Tích hợp nút *"Hỏi Trợ lý CView cách nâng điểm CV"* ngay tại màn hình kết quả *Phân tích CV*, hiển thị câu trả lời Markdown và thẻ công việc (Job Card) bấm vào xem ngay.<br><br>**[Phương án B - Củng cố Core]:**<br>- Nâng cấp UX, bổ sung tính năng xuất báo cáo kết quả phân tích CV ra file PDF/In ấn. | **[Phương án A - Làm Chatbot cộng điểm]:**<br>- Kiểm thử toàn diện tính năng Chatbot (độ chính xác câu trả lời so với dữ liệu DB, tốc độ phản hồi, xử lý timeout và ghi log vào `system_error_logs`), cập nhật container mới lên **VM1 & VM2**.<br><br>**[Phương án B - Củng cố Core]:**<br>- Kiểm thử chịu tải (Stress Test) trên 3 VMs và hoàn thiện bộ tự động hóa kiểm thử Postman. |

#### ✅ 3. Kết quả đạt được
- [ ] API Chatbot AI (`POST /api/v1/chatbot/ask`) kết nối ngữ cảnh dữ liệu từ CSDL.
- [ ] Tầng truy vấn ngữ cảnh tốc độ cao (Context Retriever SQL) lấy kỹ năng thiếu và việc làm gợi ý.
- [ ] Giao diện Floating Chatbot Widget linh vật CView và Markdown renderer.
- [ ] Tích hợp nút gợi ý nâng điểm CV ngay trên màn hình kết quả Phân tích CV.
- [ ] Kiểm thử tự động tính năng Chatbot và ghi nhận log vào hệ thống.

#### 📝 4. Review
*(Để trống - Trưởng nhóm ghi nhận sau buổi họp Sprint 7 Retrospective)*

---

### 🏃 Sprint 8 (Tuần 8): Đóng Gói Phát Hành v1.0, Báo Cáo Tổng Hợp & Diễn Tập Bảo Vệ Trên 3 VMs

#### 🎯 1. Mục tiêu của sprint
* Đóng gói sản phẩm phát hành chính thức (`Release v1.0.0`), merge nhánh `develop` vào `main`.
* Hoàn thiện Báo cáo Đồ án cuối kỳ, Slide thuyết trình và rà soát 100% minh chứng làm việc nhóm trên GitHub.
* Diễn tập chạy thử buổi bảo vệ (Dry-run) trên hệ thống 3 VMs, quay video demo backup phòng sự cố mạng.
* **Sự kiện Scrum:**
  * *Sprint Review (Final):* Nghiệm thu toàn diện đồ án và kịch bản thuyết trình.
  * *Sprint Retrospective:* Đánh giá tổng kết dự án, đóng góp của 4 thành viên.

#### 👥 2. Phân công chi tiết
| Thành viên 1: Nguyễn Bích Uyên<br>*(Leader / Backend Chính / Integration)* | Thành viên 2: Lê Thị Hoài Thương<br>*(CSDL / Backend / Nghiệp vụ dữ liệu)* | Thành viên 3: Trần Tiến Đạt<br>*(Frontend Người dùng / Thiết kế UI)* | Thành viên 4: Nguyễn Thị Thu Uyên<br>*(Frontend Admin & Thống kê / QA / Hạ tầng 3 VMs)* |
| :--- | :--- | :--- | :--- |
| - Thực hiện Merge nhánh `develop` vào `main`, tạo tag phát hành chính thức (`v1.0.0`) trên GitHub.<br>- Rà soát lần cuối toàn bộ minh chứng làm việc nhóm trên GitHub (Issues, Branches, Commits, Pull Requests, Cross-review comments) đảm bảo tuân thủ 100% yêu cầu quy trình của giảng viên.<br>- Biên tập tổng thể **Báo cáo Đồ án Cuối kỳ** và **Slide thuyết trình**.<br>- Điều phối buổi **Dry-run (Chạy thử bảo vệ)**, bấm giờ và chuẩn bị câu hỏi phản biện về kiến trúc Backend, thuật toán Matching & Chatbot. | - Kiểm tra lần cuối cả **02 bộ dữ liệu** trên **VM3** (Bộ dữ liệu Demo gọn để trình diễn luồng nghiệp vụ & Bộ dữ liệu Lớn $\ge 100.000$ bản ghi ở `matched_results` và `activity_logs` để chứng minh hiệu năng).<br>- Chuẩn bị sẵn các file script SQL mở sẵn khi bảo vệ:<br>  1. Sơ đồ ERD 29 bảng & kiểm tra ràng buộc (`CHECK`, `UNIQUE`, `FK`).<br>  2. Demo chạy trực tiếp 08 truy vấn SQL nâng cao & View.<br>  3. Demo `EXPLAIN (ANALYZE, BUFFERS)` trước/sau Index trên bảng $\ge 100.000$ dòng.<br>  4. Demo Transaction Rollback & Concurrency 2 kết nối.<br>  5. Demo lịch sử Migration. | - Kiểm tra toàn bộ luồng giao diện phục vụ Live Demo trên **VM1** theo đúng cấu trúc Navbar:<br>  1. Mở **Trang chủ** (giới thiệu dự án) $\rightarrow$ bấm *Đăng nhập* $\rightarrow$ hiện **Hình Account** trên Navbar.<br>  2. Bấm vào tab **Phân tích CV** (hoặc nút *"BẮT ĐẦU PHÂN TÍCH CV $\rightarrow$"*) $\rightarrow$ tải PDF & chọn bộ lọc $\rightarrow$ xem *Chấm điểm, Góp ý, Đề xuất việc làm*.<br>  3. Bấm vào tab **Tìm việc** $\rightarrow$ tìm kiếm nhanh theo từ khóa; bấm vào **Hình Account** xem lịch sử & thống kê ứng viên.<br>  4. Bấm vào nút **Tuyển dụng** $\rightarrow$ Đăng nhập NTD $\rightarrow$ vào UI Nhà tuyển dụng demo **Đăng bài** & **Theo dõi thống kê**.<br>- Quay video backup toàn bộ luồng demo phòng sự cố mạng. | - Kiểm tra trạng thái hoạt động ổn định của cả **03 Máy ảo (VM1: Frontend React, VM2: Backend FastAPI, VM3: PostgreSQL + Storage)** trước ngày bảo vệ, cấu hình Docker tự khởi động (`restart: unless-stopped`).<br>- Chuẩn bị sẵn cửa sổ terminal trên 3 VMs để trình diễn trực tiếp kiến trúc phân tán 3 VMs, giao diện **Admin** và chạy demo **Backup & Restore CSDL** ngay tại buổi bảo vệ.<br>- Hoàn thiện phần báo cáo Kiểm thử và Hạ tầng trong cuốn báo cáo chung. |

#### ✅ 3. Kết quả đạt được
- [ ] Merge nhánh `develop` vào `main` và gắn tag phát hành `v1.0.0` trên GitHub.
- [ ] Hoàn thành Báo cáo Đồ án Cuối kỳ và Slide thuyết trình.
- [ ] Chuẩn bị sẵn sàng 5 kịch bản demo CSDL (ERD, 8 Queries, Index $\ge 100k$, Concurrency, Migration).
- [ ] Kịch bản Live Demo giao diện thông suốt trên VM1 theo 4 luồng chính và video backup.
- [ ] Hệ thống 3 VMs sẵn sàng, cấu hình tự khởi động ổn định trước ngày bảo vệ.
- [ ] Biên bản họp Sprint Retrospective tổng kết toàn khóa đồ án.

#### 📝 4. Review
*(Để trống - Trưởng nhóm ghi nhận sau buổi họp Sprint 8 Retrospective)*

---

## 🔄 Quy trình Phối hợp Scrum & Git Hàng Tuần
1. **Đầu mỗi Sprint (Thứ Hai):** Trưởng nhóm (**Bích Uyên**) tạo các **GitHub Issues** tương ứng với từng đầu việc của 4 thành viên trong bảng kế hoạch tuần đó, gán nhãn (`backend`, `database`, `frontend`, `infra`, `testing`) và gán người phụ trách (`Assignee`).
2. **Triển khai trong tuần:**
   - Mỗi thành viên từ Issue được giao tạo nhánh làm việc riêng từ `develop` theo cú pháp: `feature/<ten-ngan-gon>` (VD: `feature/fe-navbar-homepage`, `feature/fe-recruiter-portal`, `feature/fe-cv-analysis-page`, `feature/be-auth-candidate-recruiter`).
   - Thực hiện code, commit rõ ràng và tạo **Pull Request (PR)** về nhánh `develop`.
3. **Review chéo (Cross-Review):**
   - **Bích Uyên** và **Thương** review chéo code Backend, câu lệnh SQL, Transaction, Index và tài liệu `DESIGN.md` của nhau.
   - **Đạt** và **Thu Uyên** review chéo code Frontend React, Postman Tests và cấu hình Docker/VM của nhau.
   - **Bích Uyên** kiểm tra tích hợp tổng thể và thực hiện Merge khi PR đã được duyệt.
4. **Cuối mỗi Sprint (Chủ Nhật):** Cả nhóm họp **Sprint Review** (kiểm tra sản phẩm chạy thực tế trên nhánh `develop` / 3 VMs) và **Sprint Retrospective** để đánh giá kết quả đạt được, ghi nhận vào mục **Review** và điều chỉnh khối lượng công việc cho sprint kế tiếp.
