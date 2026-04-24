# TÀI LIỆU THIẾT KẾ HỆ THỐNG CRM SUẤT ĂN CÔNG NGHIỆP (STYLE MISA AMIS)
**Chủ sở hữu:** Tùng Lâm
**Phiên bản:** 1.0 (2026)
**Mục tiêu:** Chuyển đổi số vận hành Bếp trung tâm, thay thế Excel thủ công.

---

## I. TỔNG QUAN HỆ THỐNG (SYSTEM SPECS)

### 1. Kiến trúc Dữ liệu (Hybrid Model)
* **Database:** Google Sheets API (Giai đoạn 1) -> Migrate sang Supabase (Giai đoạn 2).
* **Quy tắc:** Hệ thống quản lý theo quan hệ: `Khách hàng` -> `Thực đơn` -> `Đơn hàng ngày`.

### 2. Giao diện & Trải nghiệm (UI/UX)
* **Style:** MISA AMIS (Sạch sẽ, Corporate Blue, Sidebar cố định bên trái).
* **Dashboard:** Hiển thị thẻ Card tóm tắt: Tổng suất trưa, Tổng món mặn (Thịt/Cá/Sườn...), trạng thái in ấn.

### 3. Module in ấn (Printing Engine)
* **Kích thước:** A5 (Nằm ngang hoặc dọc).
* **Công nghệ:** Mapping dữ liệu từ `Daily_Orders` vào HTML Template. 
* **Tính năng:** In hàng loạt (Bulk Print) theo Tuyến/Giờ giao hoặc in lẻ từng khách.

---

## II. QUY TRÌNH VẬN HÀNH CHUẨN (SOP)

### Giai đoạn 1: Quản trị Thực đơn (Thứ 7/CN hàng tuần)
* **Bước 1:** Quản lý tạo Menu tuần chính (4 món mặn + món phụ).
* **Bước 2:** Phân loại Menu: 
    * `Menu chính`: Cho các khách hàng văn phòng.
    * `Menu phụ/Canteen`: Menu riêng biệt (Ví dụ: khách Canteen ảo).
    * `Menu Sự kiện`: Dùng cho các đơn hàng phát sinh đột xuất.
* **Bước 3:** Publish: Hệ thống tự cập nhật lên giao diện đặt hàng hoặc file tổng hợp.

### Giai đoạn 2: Tiếp nhận & Chốt số lượng (Tối - 09:00 sáng hôm sau)
* **Bước 1:** Ghi nhận số lượng dự kiến từ tối hôm trước (tổng hợp Zalo/Sheet).
* **Bước 2:** Trước 09h00 sáng, Quản lý cập nhật số thực tế từ Google Form và tin nhắn lẻ.
* **Bước 3:** Nhập số lượng dự phòng (Ví dụ: +10 suất dự phòng).
* **Bước 4:** Nhấn **[Chốt lệnh sản xuất]**. Sau bước này, ai cũng có thể thay đổi số lượng nhưng mọi thay đổi đều sẽ được ghi log lại hệ thống (không cần quyền Admin).

### Giai đoạn 3: Điều phối Bếp & Đóng gói (09:00 - 10:30)
* **Bước 1:** Bếp trưởng mở Dashboard xem "Tổng sản