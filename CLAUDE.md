# CLAUDE.md — Catering CRM (AI Context File)

> Đọc file này đầu tiên khi làm việc với dự án này trong session mới.

## Hệ thống là gì
CRM cho đơn vị cung cấp suất ăn công nghiệp (~20-40 KH doanh nghiệp, ~1000-1500 suất/ngày).
Stack: Next.js 16 App Router + Tailwind + **Supabase (PostgreSQL)** + NextAuth Google OAuth + Deploy Vercel.

## Database
**Supabase (PostgreSQL).** 7 tables, schema tại `supabase/schema.sql`, seed tại `supabase/seed.sql`:
- `khach_hang` — danh sách KH
- `don_hang` — đơn đặt suất hàng ngày (`chi_tiet_mon` lưu kiểu JSONB)
- `ke_mon` — thực đơn theo ngày (surrogate PK + 2 partial unique indexes cho global/KH-specific menu)
- `tong_hop_ngay` — tổng hợp cuối ngày (PK composite: ngay+buoi+ma_mon)
- `thanh_toan` — công nợ & thanh toán
- `nguoi_dung` — tài khoản nội bộ, lookup role sau OAuth (PK: email)
- `cai_dat` — key-value config

**DB Access Pattern:**
```typescript
// Server-side only, dùng Service Role Key (bypass RLS)
import { supabase } from '@/lib/supabase';
// Tất cả CRUD đi qua lib/db.ts — không gọi supabase trực tiếp trong API routes
```

**Column naming:** snake_case trong DB, camelCase trong TypeScript (mapping trong `lib/db.ts`).

## Auth & Roles
- NextAuth + Google OAuth login
- Sau login: lookup email trong bảng `nguoi_dung` → lấy role
- 3 roles: `quan_ly`, `bep`, `ke_toan`
- **KHÔNG có route restriction** — mọi user đăng nhập đều thấy toàn bộ dữ liệu
- Sự khác biệt duy nhất: màn hình mặc định sau login
  - quan_ly → /dashboard | bep → /bep | ke_toan → /ke-toan
- Chỉ check: session hợp lệ (đã đăng nhập) mới vào được app

## Business Rules quan trọng
1. **Buffer**: `Math.ceil(totalSuat * (1 + bufferPercent/100))` — LUÔN làm tròn lên
2. **Soft delete**: Không xóa record — chỉ đổi `trangThai` → "inactive" / "huy"
3. **1 KH có thể có nhiều đơn cùng ngày** (buổi khác nhau: sang/trua/chieu/trai_cay)
4. **Khi KH thay đổi số suất sau chốt**: cho phép edit, ghi log vào cột `ghiChu`
5. **Last-write-wins** khi 2 người sửa cùng lúc (chấp nhận được, quy mô nhỏ)

## Sheets API Pattern
```typescript
// Dùng Service Account, không phải OAuth user flow
// Batch requests để tránh 429 rate limit (100 req/100s)
import { google } from 'googleapis';
const auth = new google.auth.GoogleAuth({ credentials: serviceAccount, scopes: [...] });
const sheets = google.sheets({ version: 'v4', auth });
```

## In phiếu giao hàng (A5)
1. In trên khổ giấy A5 dọc
2. Header: STT, Giờ giao (11h30), Tên khách hàng (to, rõ)
3. Thông tin: Địa chỉ, SĐT
4. Bảng thực đơn: Mã món, Tên món, Số lượng
5. Tổng số suất (bên phải, to)
6. Thông tin phụ: Đi kèm, Loại khay, Giờ giao Shipper

CSS: `@page { size: A5 portrait; margin: 0.5cm; }`, `page-break-after: always` mỗi phiếu
Dùng `window.print()`, không thư viện ngoài

## Nguồn đơn hàng
- `google_form`: KH tự điền Google Form → sync vào Sheets (qua Apps Script)
- `thu_cong`: nhân viên nhập tay trên CRM (Zalo/điện thoại → nhập)
- `zalo`: phân biệt với thủ công nếu cần thống kê
- `du_tru`: đơn dự trù tự sinh

## Constants (tất cả trong /lib/constants.ts)
```typescript
APP_LANGUAGE = "vi"  // Toàn bộ UI tiếng Việt
UI_THEME = "light"
// SHEETS enum vẫn còn nhưng chỉ dùng làm reference tên table — không dùng trong Supabase queries
ROLES = { QUAN_LY: "quan_ly", BEP: "bep", KE_TOAN: "ke_toan" }
BUOI = { SANG, TRUA, CHIEU, TRAI_CAY }
TRANG_THAI_DON = { CHO_XAC_NHAN, DA_XAC_NHAN, DANG_NAU, HOAN_THANH, HUY }
```

## Màn hình /bep — UX đặc biệt
- Font tối thiểu 18px, số suất 48px bold
- Responsive tốt trên tablet 10 inch
- Không hiện bất kỳ thông tin giá/tiền

## API Error Pattern (bắt buộc mọi route)
```typescript
try {
  const session = await getServerSession();
  if (!session) return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  // ... logic
  return Response.json({ data: result });
} catch (error) {
  console.error('[MODULE_NAME]', error);
  return Response.json({ error: 'Lỗi hệ thống, vui lòng thử lại' }, { status: 500 });
}
```

## Files chính cần xem khi làm feature mới
- `/lib/supabase.ts` — Supabase client (server-side)
- `/lib/db.ts` — tất cả CRUD (mapper snake_case ↔ camelCase)
- `/lib/constants.ts` — enums và tên bảng
- `/app/api/don-hang/route.ts` — ví dụ API route chuẩn
- `/components/OrderTable.tsx` — bảng đơn hàng với inline edit
- `supabase/schema.sql` — schema database đầy đủ
- `SPEC.md` — business rules + test cases

## Gotchas
- ❌ Không import `supabase` trực tiếp trong API routes — luôn dùng qua `lib/db.ts`
- ❌ Không dùng `any` TypeScript (trừ row mapper nội bộ trong db.ts)
- ❌ Supabase keys chỉ ở env, không commit lên git
- ✅ Date lưu DB: ISO 8601 (YYYY-MM-DD), hiển thị UI: DD/MM/YYYY
- ✅ Tiền lưu DB: số nguyên VNĐ, hiển thị: formatVND()
- ✅ `chi_tiet_mon` trong `don_hang` là JSONB trong DB, JSON string trong TypeScript interface
- ✅ Env vars cần thiết: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET`

# General AI Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
