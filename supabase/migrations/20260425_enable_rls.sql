-- =============================================================
-- Migration: Enable RLS trên tất cả bảng
-- Ngày: 2026-04-25
-- Lý do: Chặn truy cập trực tiếp qua anon key.
--        App dùng service_role (server-side) nên bypass RLS — không cần thêm policy.
-- =============================================================

ALTER TABLE khach_hang    ENABLE ROW LEVEL SECURITY;
ALTER TABLE don_hang      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ke_mon        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tong_hop_ngay ENABLE ROW LEVEL SECURITY;
ALTER TABLE thanh_toan    ENABLE ROW LEVEL SECURITY;
ALTER TABLE nguoi_dung    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cai_dat       ENABLE ROW LEVEL SECURITY;

-- Verify: tất cả bảng phải có rowsecurity = true
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
