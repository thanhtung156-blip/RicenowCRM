export const APP_LANGUAGE = "vi";
export const UI_THEME = "light";

export const SHEETS = {
  KHACH_HANG: "KhachHang",
  DON_HANG: "DonHang",     // ID, KhachHangID, TenKH, Ngay, Buoi, SoSuat, ChiTietMon(JSON), ThanhTien, TrangThai, ...
  KE_MON: "KeMon",       // Ngay, Buoi, Mon1, Mon2, Mon3, Mon4, Mon5, MonPhu, GhiChu, KhachHangID
  TONG_HOP: "TongHopNgay", // Ngay, Buoi, MaMon, TenMon, SoSuatBao, SoSuatNau, SoSuatCon, GhiChu
  THANH_TOAN: "ThanhToan",
  NGUOI_DUNG: "NguoiDung",
  CAI_DAT: "CaiDat",
} as const;

export const ROLES = {
  QUAN_LY: "quan_ly",
  BEP: "bep",
  KE_TOAN: "ke_toan",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const BUOI = {
  SANG: "sang",
  TRUA: "trua",
  CHIEU: "chieu",
  TRAI_CAY: "trai_cay",
} as const;

export type Buoi = typeof BUOI[keyof typeof BUOI];

export const TRANG_THAI_DON = {
  CHO_XAC_NHAN: "cho_xac_nhan",
  DA_XAC_NHAN: "da_xac_nhan",
  DANG_NAU: "dang_nau",
  HOAN_THANH: "hoan_thanh",
  HUY: "huy",
} as const;

export type TrangThaiDon = typeof TRANG_THAI_DON[keyof typeof TRANG_THAI_DON];

export const NGUON_DON = {
  GOOGLE_FORM: "google_form",
  THU_CONG: "thu_cong",
  ZALO: "zalo",
  DU_TRU: "du_tru",
} as const;

export type NguonDon = typeof NGUON_DON[keyof typeof NGUON_DON];

export const TRANG_THAI_KH = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const LOAI_HOP_DONG = {
  THANG: "thang",
  NGAY: "ngay",
  SU_KIEN: "su_kien",
  VANG_LAI: "vang_lai",
  AN_THU: "an_thu",
} as const;

export type LoaiHopDong = typeof LOAI_HOP_DONG[keyof typeof LOAI_HOP_DONG];

export const BUOI_LABELS: Record<string, string> = {
  [BUOI.SANG]: "Sáng",
  [BUOI.TRUA]: "Trưa",
  [BUOI.CHIEU]: "Chiều",
  [BUOI.TRAI_CAY]: "Trái cây / Khuya",
};

export const LOAI_HOP_DONG_LABELS: Record<string, string> = {
  thang: "Theo tháng",
  ngay: "Theo ngày",
  su_kien: "Sự kiện",
  vang_lai: "Vãng lai",
  an_thu: "Ăn thử",
};
