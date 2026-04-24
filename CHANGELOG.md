# CHANGELOG

## [1.0.1] - 2026-04-25
### Changed
- Cập nhật kiến trúc dữ liệu (Data Schemas) cho `KhachHang`, `DonHang`, `KeMon`, `TongHopNgay` đồng bộ với thực tế database.
- Cập nhật thông số version hệ thống thành Next.js 16.
- Đổi định dạng in từ nhãn nhiệt 80mm sang **phiếu giao hàng khổ A5 dọc**.
- Đổi giờ chốt đơn mặc định từ 08:30 sang **09:00**.
- Đơn giản hóa quy trình: cho phép bất kỳ user nào cũng có thể chỉnh sửa đơn sau giờ chốt (thay vì cần quyền Admin) dựa trên cơ chế tự động ghi log.
- Cập nhật tài liệu kỹ thuật (`SPEC.md`, `CLAUDE.md`, `SOP.md`, `SOP_2.md`) để nhất quán luồng vận hành mới.

### Fixed
- Bỏ qua check ESLint cho thư mục `scratch/` để tránh lỗi biên dịch.
- Chuyển NextAuth middleware từ `middleware.ts` sang convention mới `proxy.ts` để tránh warning.
