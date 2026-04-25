# Ricenow CRM — Tài liệu Hệ thống

> Tài liệu kỹ thuật đầy đủ: kiến trúc, thiết kế, cách vận hành và hướng dẫn phát triển tiếp.
> Cập nhật lần cuối: v1.0.2

---

## Mục lục

1. [Hệ thống là gì](#1-hệ-thống-là-gì)
2. [Vì sao chọn công nghệ này](#2-vì-sao-chọn-công-nghệ-này)
3. [Kiến trúc tổng thể](#3-kiến-trúc-tổng-thể)
4. [Cấu trúc thư mục](#4-cấu-trúc-thư-mục)
5. [Database — Supabase / PostgreSQL](#5-database--supabase--postgresql)
6. [Xác thực & Phân quyền](#6-xác-thực--phân-quyền)
7. [API Layer](#7-api-layer)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Các màn hình chính](#9-các-màn-hình-chính)
10. [Luồng dữ liệu quan trọng](#10-luồng-dữ-liệu-quan-trọng)
11. [Quy ước code](#11-quy-ước-code)
12. [Cài đặt & Chạy local](#12-cài-đặt--chạy-local)
13. [Deploy lên Vercel](#13-deploy-lên-vercel)
14. [Development Workflow](#14-development-workflow)
15. [Roadmap phát triển](#15-roadmap-phát-triển)

---

## 1. Hệ thống là gì

**Ricenow CRM** là phần mềm quản lý nội bộ cho đơn vị cung cấp **suất ăn công nghiệp**. Quy mô vận hành điển hình: 20–40 khách hàng doanh nghiệp, khoảng 1.000–1.500 suất/ngày.

### Vấn đề cần giải quyết

Trước khi có hệ thống, quy trình thủ công gồm:
- Tổng hợp đơn hàng từ Zalo, Google Form, điện thoại vào Excel mỗi sáng
- Tính tay số suất nấu + buffer dự phòng
- In phiếu giao hàng bằng Word từng cái
- Theo dõi công nợ thủ công trên bảng tính

Hệ thống thay thế toàn bộ quy trình trên bằng giao diện web, chạy trên mọi thiết bị (máy tính, tablet bếp, điện thoại kế toán).

### Ba nhóm người dùng

| Vai trò | Màn hình mặc định | Nhiệm vụ chính |
|---|---|---|
| `quan_ly` | `/dashboard` | Tổng hợp đơn, duyệt số lượng nấu, theo dõi doanh thu |
| `bep` | `/bep` | Xem suất cần nấu, in nhãn giao hàng, đánh dấu hoàn thành |
| `ke_toan` | `/ke-toan` | Theo dõi công nợ, ghi nhận thanh toán |

---

## 2. Vì sao chọn công nghệ này

### Next.js 16 (App Router)

**Lý do chọn:** Next.js cho phép viết cả frontend lẫn backend API trong cùng một project, không cần server riêng. App Router (Next.js 13+) dùng React Server Components — load nhanh hơn, SEO tốt hơn, và cấu trúc file = cấu trúc URL (dễ hiểu).

**Thay thế khả năng:** Express.js + React riêng biệt → phức tạp hơn, cần deploy 2 service.

**Gotcha:** Next.js 16 dùng Turbopack làm bundler mặc định — build nhanh hơn Webpack đáng kể nhưng một số plugin cũ chưa tương thích.

---

### Supabase (PostgreSQL)

**Lý do chọn:** Supabase là PostgreSQL managed — đầy đủ SQL, join, index, foreign key — nhưng không cần tự quản lý server. Cung cấp thêm: auth, storage, realtime subscription miễn phí trên free tier.

**So với Google Sheets (phiên bản cũ):**
| | Google Sheets | Supabase |
|---|---|---|
| Query linh hoạt | Không (chỉ range) | Có (SQL đầy đủ) |
| Concurrent users | Giới hạn, lock file | Không vấn đề |
| Rate limit | 100 req/100s | Rộng rãi hơn |
| Backup | Manual | Auto, point-in-time |
| Join nhiều bảng | Phải tự xử lý | Native SQL |

**Tại sao không dùng Prisma/Drizzle ORM?** Quy mô nhỏ, query đơn giản — dùng Supabase JS client trực tiếp đủ. ORM thêm complexity không cần thiết.

---

### Tailwind CSS v4

**Lý do chọn:** Utility-first CSS — không cần đặt tên class, không lo specificity conflict. Tất cả style nằm trong JSX, dễ đọc và sửa. v4 dùng Lightning CSS, build nhanh hơn v3.

**Thay thế khả năng:** CSS Modules (verbose), styled-components (runtime overhead), MUI/Ant Design (quá nặng cho app internal).

---

### NextAuth.js v4

**Lý do chọn:** Thư viện auth chuẩn cho Next.js — hỗ trợ Google OAuth sẵn, JWT session, không cần tự implement token/cookie. Tích hợp `useSession()` hook phía client rất tiện.

**Hạn chế hiện tại:** v4 chưa tương thích hoàn toàn với Next.js App Router (cần wrapper). NextAuth v5 (Auth.js) sẽ là migration hợp lý khi cần.

---

### Vercel

**Lý do chọn:** Zero-config deploy cho Next.js (cùng công ty). Push git → tự build → tự deploy. Serverless functions cho API routes không cần server thường trực. Free tier đủ dùng cho quy mô nhỏ.

**Giới hạn cần lưu ý:** Serverless function timeout 10s (free) / 60s (pro). Nếu query nặng cần tối ưu.

---

## 3. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL (CDN)                         │
│                                                             │
│  ┌─────────────────────┐    ┌────────────────────────────┐  │
│  │   Next.js Frontend  │    │   Next.js API Routes       │  │
│  │  (React Components) │    │   /api/don-hang            │  │
│  │                     │◄──►│   /api/khach-hang          │  │
│  │  - dashboard        │    │   /api/ke-mon              │  │
│  │  - don-hang         │    │   /api/tong-hop            │  │
│  │  - khach-hang       │    │   /api/thanh-toan          │  │
│  │  - bep              │    │   /api/settings            │  │
│  │  - ke-toan          │    │   /api/auth/[...nextauth]  │  │
│  │  - cai-dat          │    └────────────┬───────────────┘  │
│  └─────────────────────┘                 │                  │
└──────────────────────────────────────────┼──────────────────┘
                                           │ HTTPS
                                           ▼
                              ┌────────────────────────┐
                              │   Supabase             │
                              │   (PostgreSQL)         │
                              │                        │
                              │  khach_hang            │
                              │  don_hang              │
                              │  ke_mon                │
                              │  tong_hop_ngay         │
                              │  thanh_toan            │
                              │  nguoi_dung            │
                              │  cai_dat               │
                              └────────────────────────┘
```

### Nguyên tắc kiến trúc quan trọng

**1. Server-side only cho DB:** Supabase client chỉ khởi tạo trong API routes (server), không bao giờ trong React components (client). Service Role Key bypass RLS — tuyệt đối không để lộ ra browser.

**2. lib/db.ts là cổng duy nhất:** Toàn bộ CRUD đi qua `lib/db.ts`. API routes gọi `db.khachHang.getAll()`, không gọi `supabase.from()` trực tiếp. Lý do: dễ thay đổi database sau này, centralize mapping snake_case ↔ camelCase.

**3. Stateless API:** Mỗi API request tự đủ, không dùng server-side cache hay session storage ngoài JWT cookie của NextAuth.

---

## 4. Cấu trúc thư mục

```
ricenow-crm/
│
├── app/                        # Next.js App Router (file = route)
│   ├── api/                    # Backend API (serverless functions)
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── don-hang/           # Orders CRUD
│   │   ├── ke-mon/             # Menu CRUD
│   │   ├── khach-hang/         # Customer CRUD
│   │   ├── settings/           # Business settings
│   │   ├── thanh-toan/         # Payments CRUD
│   │   ├── tong-hop/           # Daily production summary
│   │   └── config/             # App config
│   │
│   ├── auth/signin/            # Login page
│   ├── bep/                    # Kitchen screen
│   ├── cai-dat/                # Settings screen
│   ├── dashboard/              # Main dashboard (quan_ly)
│   ├── don-hang/               # Order management
│   ├── ke-mon/                 # Menu management
│   ├── ke-toan/                # Accounting & debt
│   ├── khach-hang/             # Customer management
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout (HTML shell + Providers)
│   └── page.tsx                # Root "/" → redirect by role
│
├── components/                 # Reusable React components
│   ├── AppLayout.tsx           # Sidebar + header wrapper
│   ├── CustomerForm.tsx        # Create/edit customer modal
│   ├── DefaultRedirect.tsx     # Role-based redirect after login
│   ├── DishQuantityInput.tsx   # Dish quantity input
│   ├── OrderForm.tsx           # Create/edit order modal
│   ├── Providers.tsx           # NextAuth SessionProvider wrapper
│   ├── SummaryCard.tsx         # Stat card component
│   └── ThermalLabel.tsx        # Print label template
│
├── lib/                        # Business logic & utilities
│   ├── auth.ts                 # requireAuth(), requireRole()
│   ├── config.ts               # App config reader
│   ├── constants.ts            # Enums: ROLES, BUOI, TRANG_THAI, ...
│   ├── db.ts                   # ALL database operations (single source of truth)
│   ├── settings.ts             # Business settings (buffer%, giờ chốt, ...)
│   ├── supabase.ts             # Supabase client (server-side only)
│   ├── utils.ts                # Formatting: formatVND, formatDate, calcBuffer
│   └── validation.ts           # Input validation functions
│
├── supabase/
│   ├── schema.sql              # Create tables, indexes, constraints
│   └── seed.sql                # Sample data for dev/testing
│
├── types/
│   └── next-auth.d.ts          # Extend NextAuth session with `role`
│
├── __tests__/                  # Unit tests (Vitest)
│   ├── utils.test.ts
│   └── validation.test.ts
│
├── .env.local                  # Local environment variables (git-ignored)
├── CLAUDE.md                   # AI developer context
├── README.md                   # Tài liệu này
├── SPEC.md                     # Business rules + test cases chi tiết
└── SOP.md                      # Quy trình vận hành cho team
```

### Tại sao không có middleware.ts?

Hệ thống không dùng Next.js Middleware để bảo vệ route vì:
- Quy mô nhỏ, team tin tưởng nội bộ
- Auth check trong từng page (`requireAuth()`) đủ dùng
- Middleware Edge Runtime có giới hạn — không dùng được Supabase client

Nếu cần bảo mật nghiêm ngặt hơn: thêm middleware để redirect `/auth/signin` nếu không có session cookie.

---

## 5. Database — Supabase / PostgreSQL

### Sơ đồ quan hệ

```
khach_hang (1) ──── (N) don_hang
khach_hang (1) ──── (N) thanh_toan
khach_hang (1) ──── (N) ke_mon       (menu riêng, nullable)
                    ke_mon (N) ─── (1) ke_mon global (WHERE khach_hang_id IS NULL)
                    tong_hop_ngay    (aggregate từ don_hang)
                    nguoi_dung       (standalone, lookup theo email)
                    cai_dat          (key-value config)
```

### 7 bảng chi tiết

#### `khach_hang` — Danh sách khách hàng
```sql
id              TEXT PRIMARY KEY       -- "KH" + timestamp (e.g. KH001)
ten_cong_ty     TEXT NOT NULL
nguoi_lien_he   TEXT
so_dien_thoai   TEXT
dia_chi         TEXT
loai_hop_dong   TEXT                   -- thang | ngay | su_kien | vang_lai | an_thu
don_gia_suat    INTEGER                -- VNĐ, số nguyên
buoi_mac_dinh   TEXT                   -- sang | trua | chieu | trai_cay
thoiGianShip    TEXT                   -- "11:30"
phiShip         INTEGER DEFAULT 0
phanLoai        TEXT                   -- Nhóm phân loại
diKem           TEXT                   -- Đi kèm (cơm hộp, khay, ...)
loaiKhay        TEXT
ngay_su_kien    DATE                   -- Chỉ dùng khi loai_hop_dong = su_kien
nhom_khach_hang TEXT                   -- Tên công ty mẹ nếu có
ghi_chu         TEXT
trang_thai      TEXT DEFAULT 'active'  -- active | inactive (soft delete)
ngay_tao        TIMESTAMPTZ
```

**Soft delete:** Không xóa record — chỉ đổi `trang_thai` = 'inactive'. Lý do: giữ toàn bộ lịch sử đơn hàng liên quan.

---

#### `don_hang` — Đơn đặt suất hàng ngày
```sql
id               TEXT PRIMARY KEY      -- "DH" + timestamp
khach_hang_id    TEXT REFERENCES khach_hang(id)
ten_khach_hang   TEXT                  -- Denormalized, tránh JOIN mỗi lần
ngay_giao        DATE NOT NULL
buoi             TEXT NOT NULL         -- sang | trua | chieu | trai_cay
so_suat          INTEGER               -- Số suất báo ban đầu
so_suat_thuc_te  INTEGER               -- Số suất thực tế (có thể thay đổi)
don_gia          INTEGER               -- VNĐ/suất
thanh_tien       INTEGER               -- = so_suat_thuc_te * don_gia
trang_thai       TEXT                  -- cho_xac_nhan | da_xac_nhan | dang_nau | hoan_thanh | huy
nguon_don        TEXT                  -- google_form | thu_cong | zalo | du_tru
chi_tiet_mon     JSONB                 -- {"M1": 40, "M2": 50, ...}
ghi_chu          TEXT                  -- Log thay đổi số suất
nguoi_tao        TEXT                  -- email người tạo đơn
ngay_tao         TIMESTAMPTZ
```

**Tại sao lưu `ten_khach_hang` dư?** Denormalization có chủ ý — tránh JOIN mỗi khi load danh sách đơn. Khi tên KH thay đổi, đơn cũ vẫn giữ tên tại thời điểm tạo.

**`chi_tiet_mon` là JSONB:** Lưu `{"M1": 40, "M2": 50}` — mã món và số lượng. Flexible vì mỗi KH có thể ăn tổ hợp món khác nhau mà không cần nhiều cột.

**Indexes:** `(ngay_giao)`, `(khach_hang_id)`, `(buoi)` — query theo ngày và buổi là pattern phổ biến nhất.

---

#### `ke_mon` — Thực đơn theo ngày

```sql
id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
ngay            DATE NOT NULL
buoi            TEXT NOT NULL
mon1..mon5      TEXT                   -- Tên 5 món chính
mon_phu         TEXT                   -- Món phụ (canh, rau, ...)
ghi_chu         TEXT
khach_hang_id   TEXT REFERENCES khach_hang(id)   -- NULL = menu chung
```

**Hai loại menu:**
- `khach_hang_id IS NULL` → Menu chung (áp dụng cho tất cả KH)
- `khach_hang_id = 'KH001'` → Menu riêng cho KH đó (override menu chung)

**Partial Unique Indexes:**
```sql
-- Chỉ 1 menu chung/buổi/ngày
CREATE UNIQUE INDEX ON ke_mon(ngay, buoi) WHERE khach_hang_id IS NULL;
-- Chỉ 1 menu riêng/KH/buổi/ngày
CREATE UNIQUE INDEX ON ke_mon(ngay, buoi, khach_hang_id) WHERE khach_hang_id IS NOT NULL;
```

---

#### `tong_hop_ngay` — Tổng hợp sản xuất cuối ngày

```sql
PRIMARY KEY (ngay, buoi, ma_mon)       -- Composite PK, không trùng
ngay            DATE NOT NULL
buoi            TEXT NOT NULL
ma_mon          TEXT NOT NULL          -- "M1", "M2", ... "monPhu"
ten_mon         TEXT                   -- Tên đầy đủ của món
so_suat_bao     INTEGER                -- Tổng suất đã báo (sum của don_hang)
so_suat_nau     INTEGER                -- Số suất bếp sẽ nấu (có buffer)
so_suat_con     INTEGER                -- = so_suat_nau - so_suat_bao (buffer thực)
ghi_chu         TEXT
ngay_cap_nhat   TIMESTAMPTZ
```

**Cách tính `so_suat_nau`:**
```typescript
soSuatNau = Math.ceil(soSuatBao * (1 + bufferPercent / 100))
// Math.ceil: LUÔN làm tròn lên — không bao giờ thiếu suất
```

---

#### `thanh_toan` — Công nợ & Thanh toán

```sql
id                    TEXT PRIMARY KEY   -- "TT" + timestamp
khach_hang_id         TEXT REFERENCES khach_hang(id)
ten_khach_hang        TEXT               -- Denormalized
ky_thanh_toan         TEXT               -- "12/2024", "Q1/2025"
tong_tien_phat_sinh   INTEGER            -- Tổng tiền đơn hàng trong kỳ
so_tien_da_thanh_toan INTEGER            -- Đã nhận được
con_no                INTEGER            -- = tong_tien - da_thanh_toan
ngay_thanh_toan       DATE
hinh_thuc             TEXT               -- "chuyen_khoan" | "tien_mat"
ghi_chu               TEXT
```

---

#### `nguoi_dung` — Tài khoản nội bộ

```sql
email       TEXT PRIMARY KEY            -- Google email hoặc local.test email
ho_ten      TEXT
role        TEXT                        -- quan_ly | bep | ke_toan
trang_thai  TEXT DEFAULT 'active'
```

**Không lưu password.** Auth dựa vào Google OAuth hoặc email lookup thuần túy.

---

#### `cai_dat` — Cấu hình hệ thống (Key-Value)

```sql
key     TEXT PRIMARY KEY
value   TEXT
```

| Key | Default | Ý nghĩa |
|---|---|---|
| `bufferPercent` | `10` | % buffer khi tính số suất nấu |
| `gioChotDon` | `08:30` | Giờ chốt đơn hàng buổi sáng |
| `tenDonVi` | `Bếp Ricenow` | Tên hiển thị trên phiếu in |
| `sdtLienHe` | _(trống)_ | SĐT hotline |
| `googleFormUrl` | _(trống)_ | Link Google Form đặt suất |

---

## 6. Xác thực & Phân quyền

### Luồng đăng nhập

```
User → /auth/signin
  │
  ├─ [Credentials] Nhập email → CredentialsProvider
  │     → Query nguoi_dung WHERE email = ? AND trang_thai = 'active'
  │     → Nếu tìm thấy: trả về { id, name, email, role }
  │     → Nếu không: trả về null (401)
  │
  └─ [Google OAuth] (khi đã cấu hình)
        → Google xác thực → callback
        → Kiểm tra email trong nguoi_dung
        → Nếu có: cho vào, lấy role
        → Nếu không: từ chối

JWT Token (lưu trong cookie httpOnly):
  { sub: email, name, email, role: "quan_ly"|"bep"|"ke_toan" }

Session (client-side qua useSession()):
  { user: { email, name, role } }
```

### Phân quyền hiện tại

Hệ thống **không** có route restriction nghiêm ngặt — mọi user đăng nhập đều xem được mọi trang. Sự khác biệt:

- **Màn hình mặc định sau login** theo role (qua `DefaultRedirect`)
- **Menu sidebar** filter theo role (chỉ hiện mục phù hợp)
- **API settings** yêu cầu `quan_ly` (403 nếu role khác)

### Bypass tạm thời (v1.0.2)

Signin page hiện tự động login `admin@local.test` khi load — dùng để test. Xóa `useEffect` trong `app/auth/signin/page.tsx` khi chuyển sang production thật.

---

## 7. API Layer

Tất cả API đều nằm trong `app/api/`, mỗi file export `GET`, `POST`, `PUT` (không dùng `DELETE` — soft delete).

### Pattern chuẩn của mọi route

```typescript
export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    // ... logic
    return Response.json({ data: result });
  } catch (error) {
    console.error('[MODULE_NAME]', error);
    return Response.json({ error: 'Lỗi hệ thống, vui lòng thử lại' }, { status: 500 });
  }
}
```

### Danh sách endpoints

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/don-hang?ngay=&buoi=` | Lấy đơn hàng theo ngày/buổi |
| GET | `/api/don-hang?khachHangID=&historyLimit=` | Lịch sử đơn theo KH |
| POST | `/api/don-hang` | Tạo đơn mới |
| PUT | `/api/don-hang` | Cập nhật đơn (số suất, trạng thái) |
| GET | `/api/khach-hang?page=&limit=` | Danh sách KH (phân trang) |
| POST | `/api/khach-hang` | Tạo KH mới |
| PUT | `/api/khach-hang` | Cập nhật thông tin KH |
| GET | `/api/ke-mon?ngay=&buoi=` | Lấy thực đơn |
| POST | `/api/ke-mon` | Tạo/cập nhật thực đơn |
| GET | `/api/tong-hop?ngay=&buoi=` | Lấy tổng hợp sản xuất |
| POST | `/api/tong-hop` | Tính lại tổng hợp từ đơn hàng |
| PUT | `/api/tong-hop` | Cập nhật 1 dòng tổng hợp |
| GET | `/api/thanh-toan?khachHangId=` | Danh sách thanh toán |
| POST | `/api/thanh-toan` | Ghi nhận thanh toán |
| GET | `/api/settings` | Lấy cài đặt vận hành |
| POST | `/api/settings` | Cập nhật cài đặt (chỉ quan_ly) |

---

## 8. Frontend Architecture

### Luồng render

```
URL → app/[page]/page.tsx (Server Component)
  └── Gọi requireAuth() → redirect nếu chưa login
  └── Render AppLayout (client wrapper)
        └── Sidebar + Header (useSession để lấy user info)
        └── {children} = nội dung page

Page Component (Client Component, "use client"):
  └── useState cho local state
  └── useEffect → fetch /api/... khi load
  └── Render table/form/cards
  └── Event handlers → gọi API → cập nhật state
```

### Tại sao page là Client Component?

Phần lớn các trang cần:
- `useState` cho filter, modal, loading state
- `useEffect` để fetch data sau khi render
- Event handlers cho CRUD

Server Components phù hợp hơn nếu data không thay đổi sau load. Trong CRM này, data thay đổi real-time → Client Component là lựa chọn thực tế.

### State management

Không dùng Redux hay Zustand — state đơn giản dùng `useState` local trong từng page. Dữ liệu fetch lại từ API sau mỗi mutation (không cache phức tạp). Phù hợp với quy mô team nhỏ.

---

## 9. Các màn hình chính

### `/dashboard` — Tổng quan (Quản lý)

**Mục đích:** Màn hình làm việc chính của quản lý mỗi buổi sáng.

**Thành phần:**
- Bộ chọn ngày + 3 nút buổi (Sáng / Trưa / Chiều)
- 4 thẻ thống kê: Tổng suất báo | Số suất nấu | Doanh thu | Số KH
- Hiển thị thực đơn ngày (mon1–5 + món phụ)
- **Bảng kế hoạch nấu:** Danh sách KH + số suất từng món (M1–M7), giờ ship, doanh thu. Các ô số suất inline-editable.
- **Bảng tổng hợp nấu:** Tổng số suất theo mã món, cột "Dự trù thêm" editable, tự tính buffer.
- Nút **"Tổng hợp báo suất"** → gọi `POST /api/tong-hop`

---

### `/don-hang` — Quản lý đơn hàng

**Mục đích:** Xem, tạo, sửa đơn hàng. Tất cả roles đều vào được.

**Thành phần:**
- Filter: Ngày, Buổi, Tìm kiếm theo tên KH
- Bảng đơn: Mã đơn, Khách hàng, Số suất (editable), Thành tiền, Trạng thái (dropdown)
- Modal tạo đơn (`OrderForm`): Chọn KH → tự điền đơn giá/buổi → nhập từng món
- Tổng kết cuối bảng: Tổng suất, Tổng doanh thu

---

### `/khach-hang` — Danh sách khách hàng

**Mục đích:** Quản lý hồ sơ KH, xem lịch sử đặt hàng.

**Thành phần:**
- Thanh tìm kiếm + Column picker (18 cột, lưu preference vào localStorage)
- Bảng KH active + section "Kho lưu trữ" (inactive)
- Nút sửa → modal `CustomerForm`
- Nút "Lịch sử bữa ăn" → 10 đơn gần nhất + xuất CSV

---

### `/bep` — Màn hình bếp (UX đặc biệt)

**Mục đích:** Dành cho tablet/máy tính bếp — chữ TO, thông tin cần thiết nhất.

**Thành phần:**
- Font tối thiểu 18px, số suất 48px bold
- 2 thẻ lớn: Tổng suất báo | Tổng suất nấu (có buffer)
- Danh sách đơn: Tên KH, giờ giao, badge trạng thái, số suất
- Nút "In nhãn" → `window.print()` → render `ThermalLabel` → in A5
- Nút "Hoàn thành" → đổi `trangThai` = `hoan_thanh`
- **Không hiển thị bất kỳ thông tin giá/tiền**

---

### `/ke-toan` — Tài chính & Công nợ

**Mục đích:** Theo dõi thu chi, công nợ theo khách hàng.

**Thành phần:**
- 3 thẻ tổng: Tổng dư nợ | Đã thu | Kỳ hiện tại
- Sidebar trái: Danh sách KH (search, filter)
- Bảng phải: Kỳ thanh toán, Phát sinh, Đã trả, Còn nợ (màu đỏ nếu còn nợ)
- Nút "Ghi thanh toán" → form nhập tiền + ngày + hình thức

---

### `/cai-dat` — Cài đặt hệ thống

**Mục đích:** Cấu hình vận hành và tích hợp API. Chỉ Quản lý thao tác.

**Tabs:**
- **Vận hành:** Buffer %, giờ chốt đơn, tên đơn vị, hotline, link Google Form
- **Dữ liệu & API:** Google OAuth credentials, Service Account (cho tích hợp Sheets nếu cần)

---

## 10. Luồng dữ liệu quan trọng

### Luồng tạo đơn hàng mới

```
1. Quản lý chọn ngày + buổi trên Dashboard
2. Click "Tạo đơn mới" → mở OrderForm modal
3. Chọn KH từ dropdown → auto-fill đơn giá, buổi mặc định
4. Nhập số lượng từng món (M1=40, M2=50, ...)
5. Click "Lưu đơn hàng"
   → POST /api/don-hang
   → Server: validate → tính thanhTien → insert don_hang
   → Response: { data: { id: "DH..." } }
6. Frontend: đóng modal → refresh bảng đơn hàng
```

### Luồng chốt lệnh sản xuất (tổng hợp báo suất)

```
1. Quản lý xem xong bảng kế hoạch buổi sáng
2. Click "Tổng hợp báo suất"
   → POST /api/tong-hop { ngay, buoi }
3. Server:
   a. Query ALL don_hang WHERE ngay_giao = ? AND buoi = ?
   b. Parse chi_tiet_mon JSONB → gom nhóm theo mã món
      { M1: 120, M2: 95, M3: 80, ... }
   c. Fetch ke_mon để lấy tên món
   d. Tính soSuatNau = Math.ceil(soSuatBao * 1.1)  ← buffer 10%
   e. Upsert tong_hop_ngay (ON CONFLICT ngay,buoi,ma_mon DO UPDATE)
4. Frontend: refresh bảng tổng hợp
5. Bếp thấy con số trên màn hình /bep ngay lập tức
```

### Luồng in phiếu giao hàng

```
1. Bếp mở /bep → chọn ngày + buổi
2. Click "In tất cả nhãn"
3. Frontend: render <ThermalLabel> ẩn với tất cả đơn
4. Gọi window.print()
5. Browser print dialog: A5 portrait, margin 0.5cm
6. CSS: page-break-after: always → mỗi đơn 1 tờ
7. In ra máy in thermal/laser → dán lên thùng hàng
```

---

## 11. Quy ước code

### Naming conventions

| Ngữ cảnh | Convention | Ví dụ |
|---|---|---|
| Database columns | snake_case | `khach_hang_id`, `ngay_giao` |
| TypeScript interfaces | camelCase | `khachHangId`, `ngayGiao` |
| React components | PascalCase | `OrderForm`, `AppLayout` |
| API query params | camelCase | `?khachHangID=KH001` |
| CSS classes | Tailwind utilities | `text-slate-900 font-bold` |

### Mapping snake_case ↔ camelCase

Toàn bộ mapping nằm trong `lib/db.ts`, hàm `mapRow()` và ngược lại `toDbRow()`:

```typescript
// DB trả về: { khach_hang_id: "KH001", ngay_giao: "2024-04-20" }
// Sau map:   { khachHangId: "KH001", ngayGiao: "2024-04-20" }
```

### Định dạng bắt buộc

- **Ngày lưu DB:** ISO 8601 — `YYYY-MM-DD` (e.g. `2024-04-20`)
- **Ngày hiển thị UI:** `DD/MM/YYYY` — dùng `formatDate()` từ `lib/utils.ts`
- **Tiền lưu DB:** Số nguyên VNĐ (e.g. `35000`)
- **Tiền hiển thị:** `formatVND(35000)` → `"35.000 ₫"`

---

## 12. Cài đặt & Chạy local

### Yêu cầu

- Node.js 20+
- npm 9+
- Tài khoản Supabase (free tier đủ)

### Bước cài đặt

```bash
# 1. Clone
git clone https://github.com/thanhtung156-blip/RicenowCRM.git
cd RicenowCRM

# 2. Cài dependencies
npm install

# 3. Tạo file env
cp .env.example .env.local
```

### Cấu hình `.env.local`

```env
# Supabase — lấy tại: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...   # Secret, server-only

# NextAuth
NEXTAUTH_SECRET=random-secret-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (tuỳ chọn — không cần để chạy local)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Khởi tạo database

```bash
# Vào Supabase Dashboard → SQL Editor
# Chạy theo thứ tự:
# 1. supabase/schema.sql
# 2. supabase/seed.sql   ← sample data để test
```

### Chạy dev

```bash
npm run dev
# → http://localhost:3000
# Auto-login: admin@local.test (xem phần bypass auth)
```

### Các lệnh khác

```bash
npm run build          # Build production
npm test               # Chạy unit tests
npm run test:coverage  # Coverage report
npm run lint           # ESLint check
```

---

## 13. Deploy lên Vercel

### Lần đầu deploy

```bash
# 1. Cài Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Set environment variables
echo "https://..." | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJ..." | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "your-secret" | vercel env add NEXTAUTH_SECRET production
echo "https://your-app.vercel.app" | vercel env add NEXTAUTH_URL production

# 4. Deploy
vercel --prod --yes
```

### Deploy production hiện tại

- **URL:** https://ricenow-crm.vercel.app
- **GitHub:** https://github.com/thanhtung156-blip/RicenowCRM (branch `main`)
- **Supabase project:** `inolrowsgfvrqinopnqe`

### Cấu hình Vercel hiện có

| Env Var | Môi trường | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Public, OK |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production | Public, OK |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Secret — không expose |
| `NEXTAUTH_SECRET` | Production | Secret |
| `NEXTAUTH_URL` | Production | `https://ricenow-crm.vercel.app` |

### Auto-deploy

Khi push lên `main` → Vercel tự detect → build → deploy. Không cần chạy tay.

---

## 14. Development Workflow

Quy trình chuẩn mỗi khi sửa code — theo đúng thứ tự này.

### Các bước

```
1. EDIT       → sửa code, chạy npm run dev, kiểm tra trên localhost:3000
2. VERIFY     → npm test (unit tests phải pass), test UI trên browser
3. DOCS       → cập nhật đúng file tài liệu (xem bảng bên dưới)
4. VERSION    → bump version nếu cần (xem quy tắc)
5. COMMIT     → git commit message rõ theo format
6. PUSH       → git push origin main → Vercel tự build & deploy
7. SMOKE TEST → mở https://ricenow-crm.vercel.app, kiểm tra luồng chính
```

### Cập nhật tài liệu nào?

| Thay đổi gì | File cần update |
|---|---|
| Thêm/sửa business rule | `SPEC.md` |
| Thêm bảng DB, đổi schema | `supabase/schema.sql` + `CLAUDE.md` + `README.md §5` |
| Đổi quy trình vận hành | `SOP.md` |
| Thêm API mới, đổi kiến trúc | `README.md §7` |
| Thêm env var mới | `README.md §12` + `CLAUDE.md` |
| Bug fix nhỏ, UI tweak | Không cần update docs |

### Quy tắc bump version

| Loại thay đổi | Bump | Ví dụ |
|---|---|---|
| Bug fix, UI nhỏ | patch `1.0.x` | Sửa lỗi sort, đổi màu |
| Tính năng mới hoàn chỉnh | minor `1.x.0` | Thêm màn hình báo cáo tháng |
| Đổi DB schema / breaking change | major `x.0.0` | Đổi cấu trúc bảng don_hang |

**Bump version cần sửa 3 chỗ:**
```
package.json                 → "version": "x.x.x"
components/AppLayout.tsx     → v x.x.x (hiển thị trong sidebar)
app/layout.tsx               → title metadata
```

### Commit message format

```
<type>: <mô tả ngắn gọn>

type:
  feat     → tính năng mới
  fix      → bug fix
  chore    → version bump, deps, config
  docs     → tài liệu
  refactor → refactor không đổi behavior
  test     → thêm/sửa test

Ví dụ:
  feat: thêm màn hình báo cáo doanh thu tháng
  fix: sửa lỗi tính buffer khi soSuat = 0
  chore: bump version lên 1.1.0
  docs: cập nhật schema bảng ke_mon
```

### Smoke test checklist (sau mỗi deploy)

- [ ] Truy cập https://ricenow-crm.vercel.app → tự login, vào /dashboard
- [ ] Chọn ngày hôm nay → thấy dữ liệu (hoặc bảng trống, không có lỗi đỏ)
- [ ] Vào /don-hang → danh sách load được
- [ ] Vào /khach-hang → danh sách load được
- [ ] Vào /bep → màn hình hiển thị đúng
- [ ] Mở DevTools (F12) → Console không có lỗi đỏ

---

## 15. Roadmap phát triển

### Ưu tiên cao (cần làm sớm)

- [ ] **Google OAuth thật** — thêm `GOOGLE_CLIENT_ID/SECRET`, bỏ auto-login bypass
- [ ] **Quản lý tài khoản** — màn hình thêm/sửa/xóa user trong `nguoi_dung`
- [ ] **Middleware bảo vệ route** — redirect `/auth/signin` nếu không có session

### Cải thiện UX

- [ ] Dashboard: Column config (ẩn/hiện cột), fix production table bug
- [ ] Dashboard: Dedup khách hàng cùng công ty mẹ
- [ ] Dashboard: Số suất nấu editable trực tiếp
- [ ] Notifications: Alert khi KH thay đổi số suất sau chốt

### Tính năng mở rộng

- [ ] **Google Form sync** — tự động pull đơn từ Google Form vào DB
- [ ] **Báo cáo tháng** — xuất PDF doanh thu theo tháng/quý
- [ ] **Realtime** — Supabase Realtime subscription để bếp thấy update ngay
- [ ] **Mobile app** — PWA hoặc React Native dùng lại API

### Technical debt

- [ ] Thêm Middleware.ts để bảo vệ route thay vì check trong từng page
- [ ] Migrate NextAuth v4 → Auth.js v5 (tương thích App Router tốt hơn)
- [ ] Thêm integration tests cho API routes
- [ ] Error boundary cho các trang critical

---

## Liên hệ & Hỗ trợ

- **GitHub:** https://github.com/thanhtung156-blip/RicenowCRM
- **Live:** https://ricenow-crm.vercel.app
- **Supabase Dashboard:** https://supabase.com/dashboard/project/inolrowsgfvrqinopnqe

---

*Tài liệu này được duy trì song song với code. Khi thay đổi kiến trúc, cập nhật file này trước khi merge.*
