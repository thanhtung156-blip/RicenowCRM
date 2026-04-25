-- =============================================================
-- Ricenow CRM — Supabase Schema
-- Chạy file này trong Supabase SQL Editor để khởi tạo database.
-- =============================================================

-- 1. Khách hàng
CREATE TABLE IF NOT EXISTS khach_hang (
  id                TEXT PRIMARY KEY,
  ten_cong_ty       TEXT NOT NULL,
  nguoi_lien_he     TEXT DEFAULT '',
  so_dien_thoai     TEXT DEFAULT '',
  dia_chi           TEXT DEFAULT '',
  loai_hop_dong     TEXT DEFAULT 'thang',
  don_gia_suat      INTEGER DEFAULT 0,
  buoi_mac_dinh     TEXT DEFAULT '',
  ghi_chu           TEXT DEFAULT '',
  trang_thai        TEXT DEFAULT 'active',
  ngay_tao          TIMESTAMPTZ DEFAULT NOW(),
  thoi_gian_ship    TEXT DEFAULT '',
  phi_ship          INTEGER DEFAULT 0,
  phan_loai         TEXT DEFAULT '',
  di_kem            TEXT DEFAULT '',
  loai_khay         TEXT DEFAULT '',
  ngay_su_kien      DATE,
  nhom_khach_hang   TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_khach_hang_trang_thai ON khach_hang(trang_thai);

-- 2. Đơn hàng
CREATE TABLE IF NOT EXISTS don_hang (
  id                TEXT PRIMARY KEY,
  khach_hang_id     TEXT REFERENCES khach_hang(id),
  ten_khach_hang    TEXT DEFAULT '',
  ngay_giao         DATE NOT NULL,
  buoi              TEXT NOT NULL,
  so_suat           INTEGER NOT NULL DEFAULT 0,
  so_suat_thuc_te   INTEGER DEFAULT 0,
  don_gia           INTEGER DEFAULT 0,
  thanh_tien        INTEGER DEFAULT 0,
  trang_thai        TEXT DEFAULT 'cho_xac_nhan',
  nguon_don         TEXT DEFAULT 'thu_cong',
  ghi_chu           TEXT DEFAULT '',
  chi_tiet_mon      JSONB DEFAULT '{}',
  ngay_tao          TIMESTAMPTZ DEFAULT NOW(),
  nguoi_tao         TEXT DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_don_hang_ngay_giao    ON don_hang(ngay_giao);
CREATE INDEX IF NOT EXISTS idx_don_hang_khach_hang_id ON don_hang(khach_hang_id);
CREATE INDEX IF NOT EXISTS idx_don_hang_buoi          ON don_hang(buoi);

-- 3. Kế món (thực đơn theo ngày)
-- Dùng surrogate PK + 2 partial unique index vì khach_hang_id có thể NULL
CREATE TABLE IF NOT EXISTS ke_mon (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ngay            DATE NOT NULL,
  buoi            TEXT NOT NULL,
  mon1            TEXT DEFAULT '',
  mon2            TEXT DEFAULT '',
  mon3            TEXT DEFAULT '',
  mon4            TEXT DEFAULT '',
  mon5            TEXT DEFAULT '',
  mon_phu         TEXT DEFAULT '',
  ghi_chu         TEXT DEFAULT '',
  khach_hang_id   TEXT REFERENCES khach_hang(id)
);

-- Thực đơn chung (không gắn khách hàng): 1 bản ghi / (ngay, buoi)
CREATE UNIQUE INDEX IF NOT EXISTS ke_mon_global_unique
  ON ke_mon (ngay, buoi) WHERE khach_hang_id IS NULL;

-- Thực đơn riêng cho từng KH: 1 bản ghi / (ngay, buoi, khach_hang_id)
CREATE UNIQUE INDEX IF NOT EXISTS ke_mon_customer_unique
  ON ke_mon (ngay, buoi, khach_hang_id) WHERE khach_hang_id IS NOT NULL;

-- 4. Tổng hợp ngày
CREATE TABLE IF NOT EXISTS tong_hop_ngay (
  ngay            DATE NOT NULL,
  buoi            TEXT NOT NULL,
  ma_mon          TEXT NOT NULL,
  ten_mon         TEXT DEFAULT '',
  so_suat_bao     INTEGER DEFAULT 0,
  so_suat_nau     INTEGER DEFAULT 0,
  so_suat_con     INTEGER DEFAULT 0,
  ghi_chu         TEXT DEFAULT '',
  ngay_cap_nhat   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ngay, buoi, ma_mon)
);

CREATE INDEX IF NOT EXISTS idx_tong_hop_ngay_ngay ON tong_hop_ngay(ngay);

-- 5. Thanh toán
CREATE TABLE IF NOT EXISTS thanh_toan (
  id                      TEXT PRIMARY KEY,
  khach_hang_id           TEXT REFERENCES khach_hang(id),
  ten_khach_hang          TEXT DEFAULT '',
  ky_thanh_toan           TEXT DEFAULT '',
  tong_tien_phat_sinh     INTEGER DEFAULT 0,
  so_tien_da_thanh_toan   INTEGER DEFAULT 0,
  con_no                  INTEGER DEFAULT 0,
  ngay_thanh_toan         DATE,
  hinh_thuc               TEXT DEFAULT '',
  ghi_chu                 TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_thanh_toan_khach_hang_id ON thanh_toan(khach_hang_id);

-- 6. Người dùng
CREATE TABLE IF NOT EXISTS nguoi_dung (
  email       TEXT PRIMARY KEY,
  ho_ten      TEXT DEFAULT '',
  role        TEXT NOT NULL,
  trang_thai  TEXT DEFAULT 'active'
);

-- 7. Cài đặt (key-value)
CREATE TABLE IF NOT EXISTS cai_dat (
  key   TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);

-- Giá trị mặc định cho cài đặt
INSERT INTO cai_dat (key, value) VALUES
  ('bufferPercent', '10'),
  ('gioChotDon',    '08:30'),
  ('tenDonVi',      'Bếp Ricenow'),
  ('sdtLienHe',     ''),
  ('googleFormUrl', ''),
  ('version',       '1.0.0')
ON CONFLICT (key) DO NOTHING;
