# SOP.md — Quy trình vận hành hệ thống Catering CRM (Style MISA AMIS)

> Tài liệu này dành cho **toàn bộ team** (Quản lý, Bếp, Kế toán). Đọc tài liệu này để biết ai làm gì, lúc nào, và khi nào hệ thống.

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

### 1. Tài khoản & Đăng nhập

- Hệ thống đăng nhập bằng **tài khoản Google** (Gmail)
- Chỉ tài khoản được **Quản lý thêm vào danh sách** mới truy cập được
- Nếu bị lỗi "Không có quyền truy cập" → liên hệ quản lý để thêm tài khoản

| Vai trò | Màn hình mặc định sau login | Có thể vào trang khác? |
|---|---|---|
| Quản lý | /dashboard — tổng quan toàn bộ | ✅ Có |
| Bếp | /bep — suất ăn + in nhãn, chữ to | ✅ Có |
| Kế toán | /ke-toan — công nợ + thanh toán | ✅ Có |

> Tất cả tài khoản đều có thể xem toàn bộ dữ liệu — hệ thống tin tưởng nội bộ team.

---

### 2. Quy trình hàng ngày

#### Giai đoạn 1: Quản trị Thực đơn (Thứ 7/CN hàng tuần)
1. Quản lý tạo Menu tuần chính (4 món mặn + món phụ) trong **Thực đơn**.
2. Phân loại Menu: 
    - `Menu chính`: Cho các khách hàng văn phòng.
    - `Menu phụ/Canteen`: Menu riêng biệt (Ví dụ: khách Canteen ảo).
    - `Menu Sự kiện`: Dùng cho các đơn hàng phát sinh đột xuất.
3. Publish: Hệ thống tự cập nhật lên giao diện đặt hàng hoặc file tổng hợp.
4. **Mẹo:** Bấm "Copy từ ngày trước" nếu menu giống hôm qua.

#### Giai đoạn 2: Tiếp nhận & Chốt số lượng (Tối hôm trước - 09:00 sáng hôm sau)
1. Ghi nhận số lượng dự kiến từ tối hôm trước (tổng hợp Zalo/Sheet) vào **Đơn hàng → Hôm nay**.
2. Trước 09h00 sáng, Quản lý cập nhật số thực tế từ Google Form và tin nhắn lẻ.
3. Kiểm tra lại danh sách — đảm bảo không bỏ sót KH nào có hợp đồng active.
4. Nhập số lượng dự phòng (Ví dụ: +10 suất dự phòng).
5. Nhấn **[Chốt lệnh sản xuất]** (hoặc **"Chốt đơn & Tính buffer"**). 
   - Sau bước này, màn hình bếp tự động cập nhật.
   - Ai cũng có thể thay đổi số lượng nhưng mọi thay đổi đều sẽ được ghi log lại hệ thống (không cần quyền Admin).

#### Giai đoạn 3: Điều phối Bếp & Đóng gói (09:00 - 11:30)
1. Bếp trưởng mở Dashboard (màn hình `/bep` trên máy tính/tablet) xem "Tổng sản lượng suất cần nấu" (đã có buffer).
2. Xem danh sách từng khách hàng + số suất.
3. Bấm **"In tất cả nhãn"** → in ra máy in nhiệt → dán vào thùng/xe giao.
4. **Nếu có khách thay đổi giữa chừng:**
   - Nhân viên vào **Đơn hàng**, sửa số suất thực tế.
   - Bếp refresh màn hình để thấy cập nhật mới nhất.

#### Giai đoạn 4: Sau khi giao xong
1. Vào màn hình bếp → bấm **"Đánh dấu hoàn thành"** cho từng buổi.
2. Trạng thái đơn → "hoàn_thành".

#### Giai đoạn 5: Cuối ngày (sau 17:00)
1. Quản lý vào **Dashboard → Tổng hợp cuối ngày**.
2. Kiểm tra tổng doanh thu dự kiến.
3. Ghi nhận bất kỳ thay đổi đặc biệt vào ghi chú.
4. Bấm **"Chốt báo cáo ngày"** → dữ liệu lưu vào Sheet TongHopNgay.

---

### 3. Quản lý khách hàng

#### Thêm khách hàng mới
1. Vào **Khách hàng → Thêm mới**
2. Điền đầy đủ: tên công ty, người liên hệ, SĐT, địa chỉ, đơn giá/suất, buổi thường xuyên
3. Bấm **Lưu**

#### Tạm dừng hợp đồng
- Vào KH → **Đổi trạng thái → Inactive**
- KH inactive sẽ không xuất hiện trong danh sách đặt đơn hàng ngày

#### KHÔNG xóa khách hàng
- Hệ thống không cho phép xóa hoàn toàn — chỉ inactive
- Mục đích: giữ lại lịch sử đơn hàng

---

### 4. In phiếu giao hàng (A5)

#### In tất cả phiếu 1 lần
1. Màn hình bếp → **"In tất cả nhãn"** (hoặc phiếu)
2. Trình duyệt mở hộp thoại in
3. Kiểm tra: **Khổ giấy = A5**, dọc, tỉ lệ 100%, tắt header/footer
4. Bấm In

#### In lại phiếu 1 đơn
1. Trong danh sách đơn → bấm icon 🖨️ cạnh tên KH

#### Cài đặt máy in (lần đầu)
- Chọn máy in và đặt khổ giấy mặc định là A5.
- Trong Chrome: Ctrl+P → **Lưu cài đặt** với paper size A5.
- Lần sau: chỉ cần bấm In, không cần chỉnh lại

---

### 5. Kế toán & Công nợ

#### Xem công nợ
1. Vào **Kế toán → Công nợ**
2. Filter theo khách hàng hoặc tháng

#### Ghi nhận thanh toán
1. Chọn KH → **"Ghi thanh toán"**
2. Nhập: số tiền, ngày nhận, hình thức (chuyển khoản / tiền mặt)
3. Bấm Lưu — hệ thống tự tính còn nợ

#### Xuất báo cáo
- Bấm **"Xuất CSV"** → mở bằng Excel hoặc Google Sheets
- Hoặc vào trực tiếp Google Sheets để xem dữ liệu thô

---

### 6. Khi có sự cố

| Sự cố | Xử lý |
|---|---|
| Đăng nhập không được | Báo quản lý kiểm tra tài khoản trong Sheet NguoiDung |
| Dữ liệu không lưu được | Kiểm tra kết nối internet, thử lại, nếu vẫn lỗi → nhập thẳng vào Sheets tạm |
| In nhãn bị sai kích thước | Xem hướng dẫn cài đặt máy in mục 5 (Khổ A5) |
| Số liệu trên web khác Sheets | Bấm F5 refresh — web đọc trực tiếp từ Sheets |
| Lỗi "Lỗi hệ thống" | Chụp màn hình, báo quản lý, nhập dữ liệu vào Sheets trực tiếp |

---

### 7. Liên hệ hỗ trợ kỹ thuật

- **Quản lý hệ thống:** [Điền tên + SĐT]
- **Link Google Sheets backup:** [Điền link]
- **Link website:** [Điền URL Vercel]
