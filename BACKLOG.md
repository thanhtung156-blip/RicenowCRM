# PRODUCT BACKLOG

Danh sách các công việc và tính năng cần triển khai trong các Sprint tiếp theo.

## Ưu tiên cao (High Priority)
- [ ] **Tính năng In phiếu giao hàng A5 (`/in-nhan`)**: 
  - Xây dựng UI/CSS cho trang in theo đúng khổ A5 dọc.
  - Mapping dữ liệu từ `DonHang` và `KeMon` vào template in (tên KH, địa chỉ, SĐT, danh sách món ăn, tổng suất, đồ đi kèm, loại khay).
  - Hỗ trợ in hàng loạt nhiều phiếu cùng lúc bằng `window.print()`.

- [ ] **Quản lý đa thực đơn (`/ke-mon`)**:
  - Cập nhật giao diện để cho phép tạo/xem nhiều menu trong cùng 1 buổi.
  - Xử lý logic gán menu riêng cho từng khách hàng thông qua `khachHangID`.

## Ưu tiên trung bình (Medium Priority)
- [ ] **Ghi log chỉnh sửa sau giờ chốt**: 
  - Thêm tính năng tự động ghi nhận lịch sử chỉnh sửa (ai sửa, lúc mấy giờ) vào cột `ghiChu` của đơn hàng khi có thay đổi sau 09:00 sáng.
  - Cập nhật logic giờ chốt đơn thành 09:00 thay vì 08:30 trong code.

## Ưu tiên thấp (Low Priority)
- [ ] Cải thiện validate dữ liệu đầu vào.
- [ ] Export báo cáo kế toán ra file Excel/CSV đẹp hơn.
