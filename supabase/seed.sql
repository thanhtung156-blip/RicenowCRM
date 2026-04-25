-- =============================================================
-- Ricenow CRM — Seed Data (dùng để test / dev)
-- Chạy SAU khi đã chạy schema.sql
-- =============================================================

-- Khách hàng mẫu
INSERT INTO khach_hang (id, ten_cong_ty, nguoi_lien_he, so_dien_thoai, dia_chi, loai_hop_dong, don_gia_suat, buoi_mac_dinh, ghi_chu, trang_thai, ngay_tao) VALUES
  ('KH001', 'Công ty May 10',            'Anh Tú',    '0988123456', 'Sài Đồng, Long Biên',    'thang', 35000, 'trua', 'Ăn cơm khay',          'active', '2024-04-20T08:00:00Z'),
  ('KH002', 'Nhà máy Canon',             'Chị Lan',   '0912334455', 'KCN Quế Võ, Bắc Ninh',   'thang', 40000, 'trua', 'Không cay',             'active', '2024-04-20T08:00:00Z'),
  ('KH003', 'Trường THPT Chu Văn An',    'Thầy Hùng', '0904112233', 'Thụy Khuê, Tây Hồ',      'ngay',  30000, 'trua', 'Suất ăn học sinh',      'active', '2024-04-20T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Người dùng mẫu
INSERT INTO nguoi_dung (email, ho_ten, role, trang_thai) VALUES
  ('admin@local.test', 'Quản trị viên', 'quan_ly', 'active'),
  ('bep@local.test',   'Bếp trưởng',    'bep',     'active'),
  ('kt@local.test',    'Kế toán',       'ke_toan', 'active')
ON CONFLICT (email) DO NOTHING;

-- Đơn hàng mẫu
INSERT INTO don_hang (id, khach_hang_id, ten_khach_hang, ngay_giao, buoi, so_suat, so_suat_thuc_te, don_gia, thanh_tien, trang_thai, nguon_don, chi_tiet_mon, ngay_tao, nguoi_tao) VALUES
  ('DH2004-01', 'KH001', 'Công ty May 10', '2024-04-20', 'trua', 90,  90,  35000, 3150000, 'da_xac_nhan', 'thu_cong',   '{"M1": 40, "M2": 50}',  '2024-04-20T09:00:00Z', 'admin'),
  ('DH2004-02', 'KH002', 'Nhà máy Canon',  '2024-04-20', 'trua', 121, 121, 40000, 4840000, 'da_xac_nhan', 'google_form','{"M2": 71, "M3": 50}',  '2024-04-20T09:00:00Z', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Kế món mẫu (thực đơn chung ngày 2024-04-20 bữa trưa)
INSERT INTO ke_mon (ngay, buoi, mon1, mon2, mon3, mon4, mon5, mon_phu, ghi_chu) VALUES
  ('2024-04-20', 'trua', 'Thịt xào dưa cải chua', 'Gà nấu cà ri', 'Cá nục kho dứa', 'Sườn kho măng', 'Nấm xào đỗ cove', 'Rau lang luộc', 'Thực đơn tiêu chuẩn');

-- Tổng hợp ngày mẫu
INSERT INTO tong_hop_ngay (ngay, buoi, ma_mon, ten_mon, so_suat_bao, so_suat_nau, so_suat_con, ghi_chu) VALUES
  ('2024-04-20', 'trua', 'M1', 'Thịt xào dưa cải chua', 40,  50,  10, 'Nấu thêm 10 suất'),
  ('2024-04-20', 'trua', 'M2', 'Gà nấu cà ri',           121, 125, 4,  '')
ON CONFLICT (ngay, buoi, ma_mon) DO NOTHING;
