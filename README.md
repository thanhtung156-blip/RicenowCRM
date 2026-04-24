# 🍱 Catering CRM — Hệ thống quản lý suất ăn

## Mục đích
Website CRM nội bộ cho đơn vị cung cấp suất ăn công nghiệp. Kết nối Google Sheets làm database, hỗ trợ 3 role: Quản lý / Bếp / Kế toán.

## Stack công nghệ
| Thành phần | Công nghệ |
|---|---|
| Frontend | Next.js 16 (App Router) + Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | Google Sheets (qua Google Sheets API v4) |
| Auth | NextAuth.js + Google OAuth |
| Deploy | Vercel (free tier) |
| In nhãn nhiệt | Browser Print API / QZ Tray (80mm thermal printer) |

## Cài đặt

```bash
# 1. Clone repo
git clone <repo-url>
cd catering-crm

# 2. Cài dependencies
npm install

# 3. Tạo file .env.local
cp .env.example .env.local
# Điền GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SPREADSHEET_ID, NEXTAUTH_SECRET

# 4. Chạy dev
npm run dev
```

## Biến môi trường (.env.local)
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=...
SPREADSHEET_ID=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

## Deploy lên Vercel
1. Push code lên GitHub
2. Import repo vào vercel.com
3. Thêm tất cả biến môi trường vào Vercel dashboard
4. Deploy

## Cấu trúc thư mục
```
/app
  /api          ← API Routes (CRUD Sheets)
  /dashboard    ← Trang Quản lý
  /kitchen      ← Trang Bếp
  /accounting   ← Trang Kế toán
/components     ← UI components tái sử dụng
/lib
  /sheets.ts    ← Google Sheets client
  /auth.ts      ← NextAuth config
/types          ← TypeScript interfaces
```

## Tài liệu liên quan
- `SPEC.md` — Kiến trúc đầy đủ + Coding prompt
- `SOP.md` — Hướng dẫn vận hành cho team
- `CLAUDE.md` — Context tối ưu cho AI developer
