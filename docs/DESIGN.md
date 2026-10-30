# DATABASE DESIGN

## 1. Thiết kế các bảng trong CSDL và Quan hệ (Database Tables & Relations)
---

### 1.1. Bảng hệ thống (System & Auth Tables)

#### Bảng 1: `accounts`
* **Vai trò của bảng:** Quản lý thông tin tài khoản xác thực đăng nhập duy nhất cho tất cả các nhóm đối tượng (Admin, Recruiter, Candidate) trên hệ thống. Đóng vai trò là gốc định danh để liên kết tới các hồ sơ nghiệp vụ tương ứng.
* **Quy mô dự tính (Scale):**
  * *Môi trường Demo:* ~100 bản ghi.
  * *Môi trường Production / Đánh giá hiệu năng:* ~15.000 bản ghi (tương ứng 10.000 ứng viên, 5.000 nhà tuyển dụng, 100 admin/quản trị viên).
* **Cấu trúc các trường và khóa:**

| Tên trường | Ý nghĩa / Vai trò | Kiểu dữ liệu | Nullable | Khóa & Ràng buộc | Miền giá trị & Danh mục (Categories) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `account_id` | Khóa chính định danh tài khoản | `UUID` | NOT NULL | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Chuẩn UUID v4 |
| `username` | Tên đăng nhập duy nhất | `VARCHAR(50)` | NOT NULL | `UNIQUE` | Độ dài 3-50 ký tự; Ký tự chữ, số, gạch dưới: `^[a-zA-Z0-9_]{3,50}$` |
| `email` | Địa chỉ email dùng để liên hệ, xác thực, khôi phục | `VARCHAR(255)` | NOT NULL | `UNIQUE` | Định dạng email chuẩn RFC 5322; Chuyển về chữ thường (lowercase) |
| `password_hash` | Mật khẩu đã được mã hóa bảo mật | `VARCHAR(255)` | NOT NULL | - | Chuỗi băm theo thuật toán bcrypt hoặc Argon2id |
| `phone_number` | Số điện thoại liên hệ | `VARCHAR(15)` | NULL | `UNIQUE` | Định dạng số điện thoại chuẩn quốc tế/Việt Nam: `^(0[3\|5\|7\|8\|9][0-9]{8}\|\\+84[3\|5\|7\|8\|9][0-9]{8})$` |
| `status` | Trạng thái hoạt động của tài khoản | `VARCHAR(20)` | NOT NULL | `DEFAULT 'PENDING'`, `CHECK (status IN (...))` | Liệt kê toàn bộ các category:<br>• `'PENDING'`: Đang chờ xác thực email kích hoạt.<br>• `'ACTIVE'`: Tài khoản đang hoạt động bình thường.<br>• `'SUSPENDED'`: Tài khoản bị tạm khóa bởi Admin do vi phạm chính sách.<br>• `'DELETED'`: Tài khoản đã yêu cầu xóa (xóa mềm). |
| `last_login_at` | Thời điểm đăng nhập thành công gần nhất | `TIMESTAMPTZ` | NULL | - | Thời gian trong quá khứ hoặc hiện tại |
| `created_at` | Thời điểm khởi tạo tài khoản | `TIMESTAMPTZ` | NOT NULL | `DEFAULT CURRENT_TIMESTAMP` | Thời gian hệ thống |


---

#### Bảng 2: `roles`
* **Vai trò của bảng:** Lưu trữ danh mục các vai trò trong hệ thống nhằm thực hiện phân quyền dựa trên vai trò (Role-Based Access Control - RBAC).
* **Quy mô dự tính (Scale):**
  * *Môi trường Demo:* 3 bản ghi cố định.
  * *Môi trường Production:* 3 - 5 bản ghi.
* **Cấu trúc các trường và khóa:**

| Tên trường | Ý nghĩa / Vai trò | Kiểu dữ liệu | Nullable | Khóa & Ràng buộc | Miền giá trị & Danh mục (Categories) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `role_id` | Khóa chính định danh vai trò | `INTEGER` | NOT NULL | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Số nguyên dương > 0 |
| `role_name` | Tên mã định danh của vai trò | `VARCHAR(30)` | NOT NULL | `UNIQUE`, `CHECK (role_name IN (...))` | Liệt kê toàn bộ các category:<br>• `'ADMIN'`: Quản trị viên tối cao của hệ thống.<br>• `'RECRUITER'`: Nhà tuyển dụng doanh nghiệp.<br>• `'CANDIDATE'`: Ứng viên tìm kiếm việc làm. |
| `description` | Mô tả phạm vi và quyền hạn vai trò | `VARCHAR(255)` |  NULL | - | Chuỗi văn bản tiếng Việt mô tả chức năng |
| `created_at` | Thời điểm tạo vai trò | `TIMESTAMPTZ` | NOT NULL | `DEFAULT CURRENT_TIMESTAMP` | Thời gian hệ thống |

---

#### Bảng 3: `permissions`
* **Vai trò của bảng:** Định nghĩa danh mục các quyền hạn chi tiết (granular permissions) trên từng tài nguyên của hệ thống (ví dụ: tạo tin tuyển dụng, duyệt tin, phân tích CV).
* **Quy mô dự tính (Scale):**
  * *Môi trường Demo:* ~20 bản ghi.
  * *Môi trường Production:* ~30 - 50 bản ghi.
* **Cấu trúc các trường và khóa:**

| Tên trường | Ý nghĩa / Vai trò | Kiểu dữ liệu | Nullable | Khóa & Ràng buộc | Miền giá trị & Danh mục (Categories) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `permission_id` | Khóa chính định danh quyền | `INTEGER` | NOT NULL | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Số nguyên dương > 0 |
| `permission_name` | Tên quyền | `VARCHAR(100)` | NOT NULL | - | Tên |
| `description` | Mô tả chi tiết hành động được phép | `VARCHAR(255)` | NULL | - | Chuỗi văn bản mô tả hành động |
| `created_at` | Thời điểm tạo quyền | `TIMESTAMPTZ` | NOT NULL | `DEFAULT CURRENT_TIMESTAMP` | Thời gian hệ thống |

---

#### Bảng 4: `account_roles`
* **Vai trò của bảng:** Bảng trung gian hiện thực hóa mối quan hệ Nhiều - Nhiều (N-N) giữa `accounts` và `roles`, hỗ trợ một tài khoản có thể có một hoặc nhiều vai trò.
* **Quy mô dự tính (Scale):**
  * *Môi trường Demo:* ~100 bản ghi.
  * *Môi trường Production:* ~15.000 bản ghi.
* **Cấu trúc các trường và khóa:**

| Tên trường | Ý nghĩa / Vai trò | Kiểu dữ liệu | Nullable | Khóa & Ràng buộc | Miền giá trị & Danh mục (Categories) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `account_id` | Khóa ngoại tham chiếu đến tài khoản | `UUID` | NOT NULL | `FOREIGN KEY REFERENCES accounts(account_id) ON DELETE CASCADE` | Thuộc bảng `accounts` |
| `role_id` | Khóa ngoại tham chiếu đến vai trò | `INTEGER` | NOT NULL | `FOREIGN KEY REFERENCES roles(role_id) ON DELETE CASCADE` | Thuộc bảng `roles` |
| `created_at` | Thời điểm gán vai trò | `TIMESTAMPTZ` | NOT NULL | `DEFAULT CURRENT_TIMESTAMP` | Thời gian hệ thống |

* **Ràng buộc khóa chính phức hợp:** `PRIMARY KEY (account_id, role_id)`.

---

#### Bảng 5: `role_permissions`
* **Vai trò của bảng:** Bảng trung gian hiện thực hóa quan hệ Nhiều - Nhiều (N-N) giữa `roles` và `permissions`, xác định một vai trò sở hữu tập quyền hạn nào.
* **Quy mô dự tính (Scale):**
  * *Môi trường Demo:* ~50 bản ghi.
  * *Môi trường Production:* ~100 bản ghi.
* **Cấu trúc các trường và khóa:**

| Tên trường | Ý nghĩa / Vai trò | Kiểu dữ liệu | Nullable | Khóa & Ràng buộc | Miền giá trị & Danh mục (Categories) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `role_id` | Khóa ngoại tham chiếu đến vai trò | `INTEGER` | NOT NULL | `FOREIGN KEY REFERENCES roles(role_id) ON DELETE CASCADE` | Thuộc bảng `roles` |
| `permission_id` | Khóa ngoại tham chiếu đến quyền hạn | `INTEGER` | NOT NULL | `FOREIGN KEY REFERENCES permissions(permission_id) ON DELETE CASCADE` | Thuộc bảng `permissions` |
| `created_at` | Thời điểm gán quyền cho vai trò | `TIMESTAMPTZ` | NOT NULL | `DEFAULT CURRENT_TIMESTAMP` | Thời gian hệ thống |

* **Ràng buộc khóa chính phức hợp:** `PRIMARY KEY (role_id, permission_id)`.
---

#### Bảng 6: `sessions`
* **Vai trò của bảng:** Quản lý phiên đăng nhập hợp lệ, lưu trữ Refresh Token mã hóa, theo dõi thiết bị đăng nhập, phục vụ thu hồi quyền truy cập (Revoke Token/Logout).
* **Quy mô dự tính (Scale):**
  * *Môi trường Demo:* ~200 bản ghi.
  * *Môi trường Production:* ~20.000 bản ghi.
* **Cấu trúc các trường và khóa:**

| Tên trường | Ý nghĩa / Vai trò | Kiểu dữ liệu | Nullable | Khóa & Ràng buộc | Miền giá trị & Danh mục (Categories) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `session_id` | Khóa chính định danh phiên làm việc | `UUID` | NOT NULL | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Chuẩn UUID v4 |
| `account_id` | Khóa ngoại tham chiếu tài khoản sở hữu phiên | `UUID` | NOT NULL | `FOREIGN KEY REFERENCES accounts(account_id) ON DELETE CASCADE` | Thuộc bảng `accounts` |
| `refresh_token_hash` | Chuỗi băm duy nhất của Refresh Token | `VARCHAR(255)` | NOT NULL | `UNIQUE` | Chuỗi SHA-256 |
| `ip_address` | Địa chỉ IP của thiết bị khi đăng nhập | `VARCHAR(45)` | NOT NULL | - | Chuẩn IPv4 hoặc IPv6 |
| `user_agent` | Thông tin trình duyệt và hệ điều hành | `TEXT` | NULL | - | Chuỗi User-Agent chuẩn |
| `is_revoked` | Trạng thái thu hồi phiên (đăng xuất) | `BOOLEAN` | NOT NULL | `DEFAULT FALSE` | `TRUE` (Đã thu hồi/vô hiệu), `FALSE` (Đang hợp lệ) |
| `expires_at` | Thời điểm phiên hết hạn | `TIMESTAMPTZ` | NOT NULL | - | `expires_at > created_at` |
| `created_at` | Thời điểm khởi tạo phiên | `TIMESTAMPTZ` | NOT NULL | `DEFAULT CURRENT_TIMESTAMP` | Thời gian hệ thống |
---

#### Bảng 7: `auth_logs`
* **Vai trò của bảng:** Ghi nhận toàn bộ lịch sử các sự kiện liên quan tới xác thực bảo mật tài khoản (đăng nhập, thất bại, đổi mật khẩu, cấp lại token).
* **Quy mô dự tính (Scale):**
  * *Môi trường Demo:* ~500 bản ghi.
  * *Môi trường Production:* ~50.000 bản ghi.
* **Cấu trúc các trường và khóa:**

| Tên trường | Ý nghĩa / Vai trò | Kiểu dữ liệu | Nullable | Khóa & Ràng buộc | Miền giá trị & Danh mục (Categories) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `log_id` | Khóa chính tự tăng | `BIGINT` | NOT NULL | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Số nguyên lớn > 0 |
| `account_id` | Khóa ngoại tài khoản liên quan (nếu xác định được) | `UUID` | NOT NULL | `FOREIGN KEY REFERENCES accounts(account_id) ON DELETE SET NULL` | Thuộc bảng `accounts` hoặc NULL nếu username không tồn tại |
| `event_type` | Loại sự kiện xác thực | `VARCHAR(30)` | NOT NULL | `CHECK (event_type IN (...))` | Liệt kê toàn bộ các category:<br>• `'LOGIN_SUCCESS'`: Đăng nhập thành công.<br>• `'LOGIN_FAILED'`: Đăng nhập thất bại (sai pass/user).<br>• `'LOGOUT'`: Đăng xuất khỏi hệ thống.<br>• `'PASSWORD_CHANGE'`: Thay đổi mật khẩu tài khoản.<br>• `'PASSWORD_RESET_REQUEST'`: Yêu cầu gửi link đổi mật khẩu.<br>• `'TOKEN_REFRESH'`: Làm mới token truy cập. |
| `ip_address` | Địa chỉ IP thực hiện sự kiện | `VARCHAR(45)` | NOT NULL | - | Chuẩn IPv4 hoặc IPv6 |
| `user_agent` | Thông tin phần mềm thực hiện | `TEXT` | NULL | - | Chuỗi User-Agent |
| `failure_reason` | Lý do thất bại (nếu có) | `VARCHAR(255)` | NULL | - | Chuỗi mô tả lý do: `'INVALID_CREDENTIALS'`, `'ACCOUNT_LOCKED'`, `'TOKEN_EXPIRED'` |
| `created_at` | Thời điểm ghi log | `TIMESTAMPTZ` | NOT NULL | `DEFAULT CURRENT_TIMESTAMP` | Thời gian hệ thống |
---

#### Bảng 8: `activity_logs`
* **Vai trò của bảng:** Ghi vết hành vi thao tác nghiệp vụ của người dùng trên toàn hệ thống (tải CV, tìm kiếm job, lưu việc làm, xem kết quả phân tích), phục vụ kiểm toán (audit trail) và yêu cầu thống kê của Admin.
* **Quy mô dự tính (Scale):**
  * *Môi trường Demo:* ~2.000 bản ghi.
  * *Môi trường Production / Đánh giá hiệu năng:* **$\ge$ 100.000 bản ghi** (bảng dữ liệu lớn dùng để test partitioned table và index phân tích).
* **Cấu trúc các trường và khóa:**

| Tên trường | Ý nghĩa / Vai trò | Kiểu dữ liệu | Nullable | Khóa & Ràng buộc | Miền giá trị & Danh mục (Categories) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `activity_id` | Khóa chính tự tăng | `BIGINT` | NOT NULL | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Số nguyên lớn > 0 |
| `sessions_id` | Khóa ngoại đến session | `UUID` | NOT NULL | `FOREIGN KEY REFERENCES sessions(sessions_id) ON DELETE CASCADE` | Thuộc bảng `sessions` |
| `action_type` | Loại hành vi thao tác | `VARCHAR(50)` | NOT NULL | `CHECK (action_type IN (...))` | Liệt kê toàn bộ các category:<br>• `'UPLOAD_RESUME'`: Tải lên hồ sơ CV.<br>• `'ANALYZE_CV'`: Thực hiện phân tích độ phù hợp CV.<br>• `'VIEW_JOB'`: Xem chi tiết bài tuyển dụng.<br>• `'SEARCH_JOB'`: Thực hiện tìm kiếm việc làm.<br>• `'SAVE_JOB'`: Lưu việc làm yêu thích.<br>• `'APPLY_JOB'`: Nộp đơn ứng tuyển việc làm.<br>• `'CREATE_JOB_POST'`: Tạo bài tuyển dụng mới.<br>• `'APPROVE_JOB_POST'`: Duyệt bài tuyển dụng.<br>• `'REJECT_JOB_POST'`: Từ chối bài tuyển dụng. |
| `target_entity` | Tên thực thể đích chịu tác động | `VARCHAR(30)` | NOT NULL | `CHECK (target_entity IN (...))` | Liệt kê toàn bộ các category:<br>• `'RESUME'`<br>• `'JOB_POST'`<br>• `'CV_ANALYSIS'`<br>• `'ACCOUNT'`<br>• `'APPLICATION'` |
| `target_id` | Định danh chuỗi hoặc UUID của thực thể đích | `VARCHAR(64)` | NULL | - | Khóa của thực thể tương ứng |
| `details` | Dữ liệu chi tiết bổ sung dạng JSON | `JSONB` | NULL | - | Cặp key-value lưu context bổ sung |
| `created_at` | Thời điểm thực hiện hành vi | `TIMESTAMPTZ` | NOT NULL | `DEFAULT CURRENT_TIMESTAMP` | Thời gian hệ thống |

---

#### Bảng 9: `system_error_logs`
* **Vai trò của bảng:** Ghi nhận các lỗi hệ thống, exception, timeout trong quá trình xử lý backend FastAPI và AI matching engine.
* **Quy mô dự tính (Scale):**
  * *Môi trường Demo:* ~50 bản ghi.
  * *Môi trường Production:* ~10.000 bản ghi.
* **Cấu trúc các trường và khóa:**

| Tên trường | Ý nghĩa / Vai trò | Kiểu dữ liệu | Nullable | Khóa & Ràng buộc | Miền giá trị & Danh mục (Categories) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `error_id` | Khóa chính tự tăng | `BIGINT` | NOT NULL | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Số nguyên lớn > 0 |
| `service_name` | Tên dịch vụ xảy ra lỗi | `VARCHAR(50)` | NOT NULL | - | Ví dụ: `'api-gateway'`, `'ai-matching-engine'`, `'pdf-parser'` |
| `severity` | Mức độ nghiêm trọng của lỗi | `VARCHAR(15)` | NOT NULL | `CHECK (severity IN (...))` | Liệt kê toàn bộ các category:<br>• `'DEBUG'`: Thông tin gỡ lỗi.<br>• `'INFO'`: Cảnh báo nhẹ thông tin.<br>• `'WARNING'`: Cảnh báo tiềm ẩn rủi ro.<br>• `'ERROR'`: Lỗi xử lý một tác vụ cụ thể.<br>• `'CRITICAL'`: Lỗi nghiêm trọng ảnh hưởng toàn dịch vụ. |
| `error_code` | Mã lỗi chuẩn hóa hệ thống | `VARCHAR(50)` | NOT NULL | - | Ví dụ: `'ERR_PDF_PARSE_TIMEOUT'`, `'ERR_DB_DEADLOCK'` |
| `message` | Thông báo ngắn về lỗi | `TEXT` | NOT NULL | - | Chuỗi mô tả lỗi |
| `stack_trace` | Chi tiết vết gọi hàm lỗi | `TEXT` | NULL | - | Nội dung stacktrace của Python/FastAPI |
| `created_at` | Thời điểm phát sinh lỗi | `TIMESTAMPTZ` | NOT NULL | `DEFAULT CURRENT_TIMESTAMP` | Thời gian hệ thống |

---