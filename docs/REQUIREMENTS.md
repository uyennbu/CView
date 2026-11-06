# TỔNG HỢP YÊU CẦU PROJECT CUỐI KỲ

## 1. THÀNH VIÊN
- **Bích Uyên:** Trưởng nhóm; Backend chính; Tích hợp và phát hành (Release/Integration Owner).
- **Thương:** Chuyên trách CSDL, Backend, nghiệp vụ dữ liệu.
- **Đạt:** Frontend người dùng; Thiết kế giao diện.
- **Thu Uyên:** Frontend quản trị/thống kê; Kiểm thử (Testing); Đầu mối triển khai hạ tầng.

---

## 2. ĐỀ TÀI LỰA CHỌN
### 1. Tên đề tài
* **CView - Doanh nghiệp nào cần bạn?**

### 2. Phạm vi và Quy mô nghiệp vụ

#### a. Đối tượng sử dụng (Nhóm quyền)
1. **Người tìm việc:** Người trẻ có nhu cầu tìm việc làm, tải lên CV (PDF), tìm kiếm việc làm và theo dõi kết quả phân tích độ phù hợp.
2. **Người tuyển dụng:** Doanh nghiệp có nhu cầu đăng tin tuyển dụng, kiểm duyệt mô tả công việc và tiếp cận nhân sự phù hợp.
3. **Admin:** Quản trị viên hệ thống, quản lý người dùng và theo dõi thống kê tổng quát.

#### b. Các nghiệp vụ chính
1. **Phân tích độ phù hợp CV:** Nhận file PDF hồ sơ và các tiêu chí bộ lọc khi tìm việc do ứng viên lựa chọn lúc tải CV lên (địa điểm tìm kiếm việc làm, lĩnh vực/domain, hình thức toàn thời gian/part-time, mức lương kỳ vọng, hình thức làm việc online/offline, số năm kinh nghiệm) $\rightarrow$ lọc và so sánh với danh sách công việc trong CSDL $\rightarrow$ phân tích độ phù hợp và trả về kết quả so khớp chi tiết.
2. **Kiểm duyệt và Đăng tuyển:** Nhận mô tả công việc từ doanh nghiệp $\rightarrow$ kiểm duyệt nội dung $\rightarrow$ phê duyệt và đăng bài tuyển dụng lên hệ thống.
3. **Hệ thống thông báo Job mới:** Khi có bài đăng tuyển dụng mới $\rightarrow$ hệ thống tự động quét tìm những user từng tìm kiếm công việc tương tự $\rightarrow$ gửi thông báo kèm gợi ý phân tích độ phù hợp.
4. **Tìm kiếm công việc:** Hỗ trợ người dùng tìm kiếm việc làm nhanh chóng theo từ khóa trực tiếp trên cơ sở dữ liệu.

#### c. Báo cáo thống kê
* **Đối với Người tìm việc:** Thống kê lịch sử sử dụng hệ thống và kết quả matching các công việc đã ứng tuyển/phân tích.
* **Đối với Người tuyển dụng:** Thống kê độ phổ biến của bài đăng, lịch sử tiếp cận ứng viên và phân phối kết quả matching.
* **Đối với Admin:** Thống kê lịch sử hoạt động và tương tác của người dùng trên toàn hệ thống.

### 3. Công nghệ áp dụng
* **Cơ sở dữ liệu:** PostgreSQL (quản lý quan hệ, lưu trữ schema, index, view và xử lý transaction).
* **Backend:** Python / FastAPI (xây dựng các API xử lý nghiệp vụ, logic matching, phân quyền).
* **Frontend:** React (giao diện người dùng cho cả 3 nhóm quyền: Người tìm việc, Nhà tuyển dụng, Admin).
* **Quản lý mã nguồn:** Git / GitHub (quản lý repository chung, nhánh, Issue và Pull Request).

---

## 3. YÊU CẦU VỀ CƠ SỞ DỮ LIỆU (CSDL)
1. **Thiết kế & Toàn vẹn:** Tối thiểu **06 bảng nghiệp vụ** có ý nghĩa (không tính bảng auth thuần túy, session, log). Cần có ERD khớp schema, khóa chính, khóa ngoại, `NOT NULL`, `UNIQUE`, `CHECK`.
2. **Quy mô dữ liệu:** 
   - 02 bộ dữ liệu (demo gọn và dữ liệu lớn).
   - Tối thiểu **03 bảng** từ **10.000 bản ghi**.
   - Ít nhất **01 bảng** từ **100.000 bản ghi** phục vụ đánh giá hiệu năng.
   - Có script sinh dữ liệu tái tạo.
3. **Truy vấn SQL & View:** 
   - Tối thiểu **08 truy vấn** khác nhau (JOIN nhiều bảng, tổng hợp, EXISTS, CTE, hàm cửa sổ, phân trang...).
   - Tối thiểu **01 View** được sử dụng trong hệ thống.
4. **Transaction & Đồng thời:** 
   - Tối thiểu 01 nghiệp vụ ghi từ 02 bảng trong cùng transaction (có kiểm tra rollback khi lỗi).
   - 01 tình huống tranh chấp (concurrency) với 2 kết nối chạy chồng lấn kèm cách bảo vệ.
5. **Chỉ mục (Index) & Hiệu năng:** Thiết kế ít nhất **02 chỉ mục** ngoài khóa chính/UNIQUE. Phân tích trước/sau tối ưu bằng `EXPLAIN (ANALYZE, BUFFERS)`.
6. **Migration & Sao lưu:** Thực hiện 01 thay đổi schema có quản lý phiên bản trên CSDL đã có dữ liệu. Có kịch bản Backup và Restore thành công.

---

## 4. QUY TRÌNH LÀM VIỆC
### a. Yêu cầu từ giảng viên
- Sử dụng **01 Repository chung**.
- Quy trình làm việc bắt buộc: **Issue $\rightarrow$ Nhánh làm việc $\rightarrow$ Commit $\rightarrow$ Pull Request $\rightarrow$ Review chéo $\rightarrow$ Merge**.
- 
### b. Cách triển khai của nhóm
- Nhóm trưởng mỗi khi giao công việc đều tạo một issue tương ứng.
- Các nhánh làm việc như sau:
   - Nhánh chính: dev -> main
   - Nhánh phụ (dự kiến): feature/___
---

## 5. HẠ TẦNG BẮT BUỘC (KIẾN TRÚC 3 VM)
Hệ thống phải triển khai chạy được trên **03 Máy ảo (VM)** tách biệt:
- **VM1 (Frontend):** Chạy giao diện React qua Docker (+ reverse proxy nếu có).
- **VM2 (Backend):** Chạy API FastAPI qua Docker.
- **VM3 (DB + Storage):** Chạy PostgreSQL và lưu trữ bền vững (có backup/restore).