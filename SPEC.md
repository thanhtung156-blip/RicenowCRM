# SPEC.md — Catering CRM System

---

## DOCUMENT 1 — DATA ARCHITECTURE

### Google Sheets Structure (1 Spreadsheet, nhiều Sheet)

---

#### SHEET: `KhachHang` (Danh sách khách hàng)
```
Col A (id):           String — Mã KH tự sinh, VD: "KH001"
Col B (tenCongTy):    String — Tên công ty / đơn vị
Col C (nguoiLienHe):  String — Tên người liên hệ chính
Col D (soDienThoai):  String — SĐT (dùng nhắn Zalo)
Col E (diaChi):       String — Địa chỉ giao hàng
Col F (loaiHopDong):  Enum ["thang","ngay","spot"] — Loại hợp đồng
Col G (donGiaSuat):   Number — Đơn giá mặc định / suất (VNĐ)
Col H (buoiMacDinh):  Enum ["sang","trua","chieu","trai_cay"] — Buổi đặt thường xuyên
Col I (ghiChu):       String — Ghi chú đặc biệt
Col J (trangThai):    Enum ["active","inactive"] — Trạng thái hợp đồng
Col K (ngayTao):      Date — Ngày tạo hồ sơ
Col L (thoiGianShip): String — Thời gian giao hàng (VD: "11:00")
Col M (phiShip):      Number — Phí vận chuyển
Col N (phanLoai):     String — Phân loại món ăn (Chay, Mặn...)
Col O (diKem):        String — Các món đi kèm (Canh, Đồ xào...)
Col P (loaiKhay):     String — Loại khay sử dụng
Key constraint: Col A là unique ID, không được trùng
```

---

#### SHEET: `DonHang` (Đơn đặt suất ăn hàng ngày)
```
Col A (id):           String — Mã đơn tự sinh, VD: "DH20241215-001"
Col B (khachHangId):  String — FK → KhachHang.id
Col C (tenKhachHang): String — Denormalized để dễ đọc
Col D (ngayGiao):     Date — Ngày giao hàng (YYYY-MM-DD)
Col E (buoi):         Enum ["sang","trua","chieu","trai_cay"]
Col F (soSuat):       Number — Số suất đặt ban đầu
Col G (soSuatThucTe): Number — Số suất sau khi điều chỉnh (có thể thay đổi)
Col H (donGia):       Number — Đơn giá áp dụng
Col I (thanhTien):    Formula =G*H — Thành tiền (tự tính)
Col J (trangThai):    Enum ["cho_xac_nhan","da_xac_nhan","dang_nau","hoan_thanh","huy"]
Col K (nguonDon):     Enum ["google_form","thu_cong","zalo","du_tru"]
Col L (ghiChu):       String — Ghi chú thay đổi, dị ứng, yêu cầu đặc biệt
Col M (chiTietMon):   String — JSON chi tiết từng món VD: {"M1": 10, "M2": 5}
Col N (ngayTao):      DateTime — Timestamp tạo đơn
Col O (nguoiTao):     String — Email người tạo/xác nhận
Key constraint: Col A unique; ngayGiao + khachHangId + buoi nên unique (1 KH 1 buổi 1 ngày)
```

---

#### SHEET: `KeMon` (Thực đơn theo ngày — để in nhãn)
```
Col A (ngay):         Date — Ngày áp dụng (YYYY-MM-DD)
Col B (buoi):         Enum ["sang","trua","chieu"]
Col C (mon1):         String — Món chính 1
Col D (mon2):         String — Món chính 2
Col E (mon3):         String — Món chính 3
Col F (mon4):         String — Món chính 4
Col G (mon5):         String — Món chính 5
Col H (monPhu):       String — Món phụ / Canh
Col I (ghiChu):       String — Lưu ý chế biến
Col J (khachHangID):  String — FK → KhachHang (Nếu có, là thực đơn riêng cho khách này)
Key constraint: ngay + buoi + khachHangID (nếu có) là unique
```

---

#### SHEET: `TongHopNgay` (Tổng hợp cuối ngày — tự động tính)
```
Col A (ngay):              Date
Col B (buoi):              Enum
Col C (maMon):             String — Mã món ăn / phân loại
Col D (tenMon):            String — Tên món ăn
Col E (soSuatBao):         Number — Số suất báo ban đầu
Col F (soSuatNau):         Number — Số suất nấu thực tế (sau khi bếp điều chỉnh)
Col G (soSuatCon):         Number — Số suất dư/thiếu (F - E)
Col H (ghiChu):            String
Col I (ngayCapNhat):       DateTime
```

---

#### SHEET: `ThanhToan` (Công nợ & thanh toán)
```
Col A (id):               String — Mã thanh toán
Col B (khachHangId):      String — FK → KhachHang
Col C (tenKhachHang):     String — Denormalized
Col D (kyThanhToan):      String — VD: "T12/2024" hoặc "15/12/2024"
Col E (tongTienPhatSinh): Number — Tổng tiền kỳ này
Col F (soTienDaThanhToan):Number — Số tiền đã nhận
Col G (conNo):            Formula =E-F
Col H (ngayThanhToan):    Date — Ngày nhận tiền (nếu đã TT)
Col I (hinhThuc):         Enum ["chuyen_khoan","tien_mat","chua_thanh_toan"]
Col J (ghiChu):           String
```

---

#### SHEET: `NguoiDung` (Tài khoản nội bộ)
```
Col A (email):    String — Google email (dùng để match OAuth)
Col B (hoTen):    String — Tên hiển thị
Col C (role):     Enum ["quan_ly","bep","ke_toan"]
Col D (trangThai):Enum ["active","inactive"]
Key constraint: email là unique, dùng để lookup role sau khi Google OAuth
```

---

#### SHEET: `CaiDat` (Config hệ thống)
```
Key-Value format:
Row 2: bufferPercent | 10       ← % buffer thêm vào tổng suất cho bếp
Row 3: gioChotDon   | 09:00    ← Giờ chốt đơn buổi trưa
Row 4: tenDonVi     | Bếp ABC  ← Tên hiển thị trên nhãn in
Row 5: sdtLienHe    | 09x...   ← SĐT trên nhãn in
```

---

## DOCUMENT 2 — SOP (xem file SOP.md)

---

## DOCUMENT 3 — CODING PROMPT

### Thông tin hệ thống

```
PROJECT: catering-crm
LANGUAGE: TypeScript
FRAMEWORK: Next.js 16 (App Router)
STYLING: Tailwind CSS
DB: Google Sheets API v4
AUTH: NextAuth.js + Google OAuth
DEPLOY: Vercel
APP_LANGUAGE: "vi"  ← Toàn bộ UI bằng tiếng Việt
UI_THEME: "light"
UI_STYLE: "clean/minimal/professional"
PRINT: Browser Print API cho máy in nhiệt 80mm
```

---

### Module Map

#### Layer 1 — Data Access (`/lib/`)
```
sheets.ts          ← Google Sheets client (Service Account auth)
  getRows(sheet, range)
  appendRow(sheet, values[])
  updateRow(sheet, rowIndex, values[])
  deleteRow(sheet, rowIndex)
  findRowById(sheet, id)
  batchGet(ranges[])

auth.ts            ← NextAuth config, role lookup từ NguoiDung sheet
  getServerSession()
  requireRole(role[])

utils.ts           ← Helpers
  generateId(prefix)     ← VD: "DH20241215-001"
  formatVND(number)
  formatDate(date)
  calcBuffer(soSuat, bufferPercent)
```

#### Layer 2 — API Routes (`/app/api/`)
```
/khach-hang
  GET    → list tất cả KH active
  POST   → tạo KH mới
  PUT    → cập nhật KH
  DELETE → deactivate KH (không xóa thật)

/don-hang
  GET    → list đơn theo ngày (query: ?ngay=2024-12-15&buoi=trua)
  POST   → tạo đơn mới
  PUT    → cập nhật số suất / trạng thái
  DELETE → hủy đơn

/ke-mon
  GET    → lấy thực đơn ngày (query: ?ngay=)
  POST   → tạo/cập nhật thực đơn

/tong-hop
  GET    → lấy tổng hợp ngày (query: ?ngay=&buoi=)
  POST   → chốt tổng hợp, tính buffer

/thanh-toan
  GET    → list công nợ (query: ?khachHangId=&kyThanhToan=)
  POST   → ghi nhận thanh toán

/in-nhan
  POST   → render HTML nhãn nhiệt để print
  Body: { donHangIds: string[], includeMenu: boolean }

/cai-dat
  GET    → lấy config
  PUT    → cập nhật config (chỉ quan_ly)
```

#### Layer 3 — UI Pages (`/app/`)

```
/dashboard (màn hình mặc định của quan_ly)
  Màn hình tổng quan hôm nay:
  - Card: Tổng suất trưa / chiều / sáng hôm nay
  - Card: Số KH chưa báo
  - Card: Doanh thu dự kiến hôm nay
  - Bảng đơn hàng hôm nay (inline edit số suất)
  - Nút "Chốt & tính buffer" → gửi xuống bếp
  - Nút "Tổng hợp cuối ngày"
  - Link / iframe Google Form để gửi cho KH (cấu hình trong Cài đặt)

/don-hang (tất cả role đều vào được)
  - Tabs: Hôm nay / Lịch sử / Tạo đơn thủ công
  - Filter: ngày, buổi, khách hàng, trạng thái
  - Inline edit: số suất thực tế, ghi chú
  - Bulk action: xác nhận nhiều đơn, hủy đơn
  - Badge nguồn đơn: 🟢 Google Form | 🔵 Thủ công | 🟡 Dự trù

/khach-hang (tất cả role đều vào được)
  - Danh sách KH + search
  - Form tạo/sửa KH
  - Xem lịch sử đơn của từng KH

/ke-mon (tất cả role đều vào được)
  - Calendar view: chọn ngày → nhập thực đơn buổi trưa/chiều
  - Có thể tạo nhiều thực đơn cho 1 buổi:
    - Thực đơn chung (khachHangID = null)
    - Thực đơn riêng (chọn khachHangID cụ thể)
  - Nhập các món: mon1 -> mon5, monPhu
  - Template: copy thực đơn từ ngày trước

/ke-toan (màn hình mặc định của ke_toan)
  - Công nợ theo KH
  - Filter theo kỳ
  - Ghi nhận thanh toán
  - Export báo cáo (Google Sheets / CSV)

/bep (màn hình mặc định của bep)
  - Màn hình đơn giản, chữ to
  - Hiển thị: buổi hôm nay, tổng suất (sau buffer), danh sách KH + số suất
  - Nút "In nhãn" → in tất cả hoặc chọn từng đơn
  - Nút "Đánh dấu hoàn thành"

/cai-dat (tất cả vào được, chỉ quan_ly mới lưu được)
  - Buffer %, giờ chốt đơn, tên đơn vị, SĐT
  - URL Google Form đặt đơn (để nhúng hoặc gửi link cho KH)
  - Webhook URL nhận data từ Google Form (nếu dùng Apps Script sync)
```

#### Layer 4 — Components (`/components/`)
```
OrderTable.tsx      ← Bảng đơn hàng với inline edit
CustomerForm.tsx    ← Form tạo/sửa KH
SummaryCard.tsx     ← Card thống kê
ThermalLabel.tsx    ← Template nhãn nhiệt 80mm (pure HTML/CSS)
PrintButton.tsx     ← Trigger window.print() với CSS @media print
DatePicker.tsx      ← Chọn ngày tiếng Việt
DefaultRedirect.tsx ← Redirect về màn hình mặc định theo role sau login
DishQuantityInput.tsx ← Bảng nhập tên món + số lượng → JSON (dùng trong /ke-mon)
```

---

### Business Logic quan trọng

#### 1. Luồng xử lý đơn hàng hàng ngày
```
06:00 – 09:00: Khách báo số suất (form web / Zalo → nhân viên nhập)
09:00         : Chốt đơn buổi trưa (có thể override thủ công)
               → Hệ thống tính: TongSuat = sum(soSuat) * (1 + buffer%)
               → Trạng thái → "da_chot"
               → Bếp thấy màn hình /bep được cập nhật
09:00 – 11:30 : Có thể điều chỉnh thêm bớt (bất kỳ ai sửa cũng được) → ghi log vào ghiChu
11:30         : In phiếu giao hàng (A5) → dán vào thùng/xe
               → Trạng thái → "dang_nau"
Buổi chiều    : Tương tự với đơn chiều
Cuối ngày     : Tổng hợp báo cáo → xuất ra Sheets TongHopNgay
```

#### 2. Tính buffer
```typescript
const calcBuffer = (totalSuat: number, bufferPercent: number): number => {
  return Math.ceil(totalSuat * (1 + bufferPercent / 100));
  // Luôn làm tròn lên (Math.ceil), không bao giờ làm tròn xuống
};
```

#### 3. In phiếu giao hàng (A5 dọc)
```
Thay vì in nhãn 80mm, hệ thống in phiếu giao hàng khổ A5 dọc.
Mỗi trang A5 chứa thông tin của 1 đơn hàng (có thể in 1 đơn hoặc in hàng loạt).
Bố cục in:
[Header]
- Góc trái: STT, Giờ giao (VD: 11h30)
- Giữa: Tên khách hàng (in đậm, to)
[Thông tin KH]
- Địa chỉ giao hàng
- SĐT người nhận
[Bảng Thực đơn]
- Cột 1: Mã món (M1, M2...)
- Cột 2: Tên món (Thịt quay, Bún vịt...)
- Cột 3: Số lượng
- Phía ngoài bảng (bên phải): Khối "TỔNG SỐ SUẤT" in to rõ
[Bảng đi kèm]
- Cột 1: Đi kèm (Canh, xào...)
- Cột 2: Loại khay
- Dưới cùng: Giờ shipper (VD: 11h30)

CSS: @page { size: A5 portrait; margin: 0.5cm; }
Sử dụng window.print() với layout tối ưu cho A5.
Hỗ trợ in nhiều phiếu (page-break-after: always).
```

#### 4. Phân quyền
```
Tất cả user đều thấy toàn bộ dữ liệu — không có ẩn thông tin giá hay module.
Sự khác biệt duy nhất là MÀN HÌNH MẶC ĐỊNH sau khi đăng nhập:

quan_ly  → redirect về /dashboard   (tổng quan + quản lý toàn bộ)
bep      → redirect về /bep         (màn hình bếp: suất + in nhãn, chữ to)
ke_toan  → redirect về /ke-toan     (công nợ + thanh toán)

Mọi role đều có thể navigate sang các trang khác nếu muốn.
Không cần RoleGuard chặn route — chỉ cần DefaultRedirect theo role.
Chỉ giữ auth check: phải đăng nhập (session hợp lệ) mới vào được bất kỳ trang nào.
```

---

### Edge Cases phải xử lý

| Tình huống | Xử lý |
|---|---|
| KH thay đổi số suất sau khi chốt | Cho phép edit, ghi log timestamp + người sửa vào ghiChu |
| KH hủy đơn giữa chừng | Trạng thái → "huy", không xóa record |
| 2 người cùng sửa 1 đơn | Last-write-wins (chấp nhận được với quy mô nhỏ) |
| Ngày không có thực đơn | In nhãn vẫn hoạt động, ô menu để trống |
| Sheets API rate limit (100 req/100s) | Dùng batchGet cho màn hình dashboard |
| Mất kết nối giữa chừng | Toast error rõ ràng, không silent fail |
| KH có đơn sáng + đơn trưa cùng ngày | Cho phép — 2 record khác nhau (buoi khác nhau) |

---

### API Error Handling Pattern
```typescript
// Mọi API route đều dùng pattern này:
try {
  const session = await getServerSession();
  if (!session) return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  
  const result = await sheetsOperation();
  return Response.json({ data: result });
} catch (error) {
  console.error('[API_NAME]', error);
  return Response.json({ error: 'Lỗi hệ thống, vui lòng thử lại' }, { status: 500 });
}
```

---

### Google Sheets API Setup
```
Auth method: Service Account (không cần OAuth user flow cho backend)
1. Tạo Service Account trong Google Cloud Console
2. Tạo key JSON → lưu GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY vào env
3. Share Spreadsheet với email Service Account (Editor)
4. Dùng googleapis npm package

Quota cần biết:
- 300 requests/minute/project
- 60 requests/minute/user
- Batch requests khi load dashboard để tránh vượt quota
```

---

### Màn hình /bep — Yêu cầu UX đặc biệt
```
- Font size tối thiểu 18px cho tất cả text
- Số suất hiển thị font-size: 48px, font-weight: bold
- Màu nền trắng, contrast cao
- Không có menu phức tạp — chỉ có tab TRƯA / CHIỀU / SÁNG
- Nút "In tất cả nhãn" và nút in từng đơn
- Responsive: hoạt động tốt trên tablet 10 inch (bếp có thể dùng tablet)
```

---

### Constants (đặt trong /lib/constants.ts)
```typescript
export const APP_LANGUAGE = "vi";
export const UI_THEME = "light";
export const SHEETS = {
  KHACH_HANG: "KhachHang",
  DON_HANG: "DonHang",
  KE_MON: "KeMon",
  TONG_HOP: "TongHopNgay",
  THANH_TOAN: "ThanhToan",
  NGUOI_DUNG: "NguoiDung",
  CAI_DAT: "CaiDat",
};
export const ROLES = {
  QUAN_LY: "quan_ly",
  BEP: "bep",
  KE_TOAN: "ke_toan",
} as const;
export const BUOI = {
  SANG: "sang",
  TRUA: "trua",
  CHIEU: "chieu",
  TRAI_CAY: "trai_cay",
} as const;
export const TRANG_THAI_DON = {
  CHO_XAC_NHAN: "cho_xac_nhan",
  DA_XAC_NHAN: "da_xac_nhan",
  DANG_NAU: "dang_nau",
  HOAN_THANH: "hoan_thanh",
  HUY: "huy",
} as const;
```

---

### Test Functions Required

```typescript
// Unit tests (Jest hoặc Vitest)

testCalcBuffer_Normal()
  // Input: soSuat=100, bufferPercent=10
  // Expected: 110

testCalcBuffer_AlwaysRoundsUp()
  // Input: soSuat=101, bufferPercent=10
  // Expected: 112 (111.1 → ceil → 112)

testGenerateId_Format()
  // Input: prefix="DH", date=2024-12-15, seq=1
  // Expected: "DH20241215-001"

testGenerateId_Unique()
  // Gọi 3 lần liên tiếp → 3 ID khác nhau

testFindRowById_Found()
  // Mock sheet data với 3 rows, tìm ID ở giữa → trả đúng row

testFindRowById_NotFound()
  // ID không tồn tại → trả null, không throw

testRoleGuard_BepCannotAccessKeToan()
  // Session với role=bep → gọi /api/thanh-toan → 403

testRoleGuard_QuanLyCanAccessAll()
  // Session với role=quan_ly → tất cả routes → 200

testCalcThanhTien()
  // soSuatThucTe=50, donGia=35000 → thanhTien=1750000

testOrderStatus_Transition()
  // cho_xac_nhan → da_xac_nhan → dang_nau → hoan_thanh (valid)
  // hoan_thanh → cho_xac_nhan (invalid → throw error)

testBufferPercent_Zero()
  // Input: soSuat=100, bufferPercent=0 → Expected: 100

testFormatVND()
  // Input: 1750000 → Expected: "1.750.000 ₫"
```

---

### Design Verification Checklist

```
ARCHITECTURE
[ ] Next.js App Router được dùng (không phải Pages Router)
[ ] Google Sheets API dùng Service Account (không phải OAuth user)
[ ] Không có database nào khác ngoài Google Sheets
[ ] Deploy Vercel, không có server riêng

DATA SCHEMAS
[ ] Sheet KhachHang có đủ 16 cột (A–P)
[ ] Sheet DonHang có đủ 15 cột (A–O)
[ ] Sheet KeMon có đủ 10 cột (A–J)
[ ] Sheet TongHopNgay có đủ 9 cột (A–I)
[ ] Sheet ThanhToan có đủ 10 cột (A–J)
[ ] Sheet NguoiDung có đủ 4 cột (A–D)

BUSINESS RULES
[ ] Buffer luôn làm tròn lên (Math.ceil), không bao giờ xuống
[ ] 1 KH có thể có nhiều buổi trong cùng 1 ngày (sang/trua/chieu)
[ ] Đơn hủy không bị xóa — chỉ đổi trạng thái thành "huy"
[ ] Chỉ quan_ly mới thay đổi được cài đặt hệ thống
[ ] Bếp KHÔNG thấy giá tiền hoặc thông tin tài chính

SECURITY
[ ] Mọi API route đều check session trước khi xử lý
[ ] Role check được thực hiện ở server-side (API route), không chỉ client
[ ] Service Account key chỉ ở biến môi trường, không hardcode

IN NHÃN
[ ] Khổ giấy A5 dọc (CSS: size: A5 portrait)
[ ] Hiển thị: tên KH, địa chỉ, SĐT, bảng thực đơn, tổng suất, đi kèm, loại khay, giờ ship
[ ] CSS @media print ẩn toàn bộ UI, chỉ hiện phiếu
[ ] In nhiều phiếu 1 lần được (danh sách đơn trong ngày)

TEST COVERAGE
[ ] Tất cả 12 test functions được implement
[ ] runAllTests() gọi tất cả và in summary
[ ] Có ít nhất 1 test case với input null/rỗng

ERROR HANDLING
[ ] Mọi API route có try/catch trả về {error: string}
[ ] UI hiển thị toast error khi API thất bại
[ ] Không có silent failure

UX BẾP
[ ] Font tối thiểu 18px trên màn hình /bep
[ ] Số suất hiển thị font-size 48px
[ ] Responsive tốt trên tablet 10 inch
[ ] Chỉ hiện thông tin cần thiết cho bếp (không có số tiền)
```

---

## DEBUG GUIDE

### 1. Google Sheets API lỗi 403
**Triệu chứng**: API trả về 403 Forbidden  
**Chẩn đoán**: `console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)` xem đúng email chưa  
**Fix**: Kiểm tra Spreadsheet đã được share với email Service Account chưa (Share → Editor)

### 2. NextAuth không redirect đúng
**Triệu chứng**: Login xong bị loop hoặc 404  
**Chẩn đoán**: Kiểm tra `NEXTAUTH_URL` trong env — phải khớp với domain thực tế  
**Fix**: Vercel → Settings → Environment Variables → cập nhật `NEXTAUTH_URL`

### 3. In nhãn bị cắt hoặc sai kích thước
**Triệu chứng**: Nhãn in ra không vừa giấy 80mm  
**Chẩn đoán**: Kiểm tra CSS `@page { size: 80mm auto; margin: 2mm; }`  
**Fix**: Trong Chrome: Ctrl+P → More settings → Paper size: Custom → 80mm x chiều cao phù hợp

---

## CODING STANDARDS

```
Naming: camelCase cho variables/functions, PascalCase cho components/types
API response: luôn { data: T } hoặc { error: string }
Logging: console.error('[ModuleName] message', error) cho mọi catch block
Date format: ISO 8601 (YYYY-MM-DD) trong Sheets, hiển thị DD/MM/YYYY trên UI
Currency: lưu số nguyên VNĐ trong Sheets, format khi hiển thị
```

## WHAT NOT TO DO

- ❌ Không dùng client-side Google Sheets API (lộ credentials)
- ❌ Không xóa row trong Sheets — chỉ đổi trạng thái (soft delete)
- ❌ Không gọi Sheets API trong vòng lặp — luôn dùng batch
- ❌ Không hardcode tên Sheet — dùng constant SHEETS.XXX
- ❌ Không bỏ qua role check ở client rồi chỉ check ở server (phải check cả 2)
- ❌ Không dùng `any` trong TypeScript — định nghĩa đầy đủ interface
