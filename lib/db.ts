import { supabase } from './supabase';
import { LoaiHopDong } from './constants';

// ──────────────────────────────────────────────
// Interfaces (giữ nguyên camelCase để không cần sửa API routes)
// ──────────────────────────────────────────────

export interface KhachHang {
  id: string;
  tenCongTy: string;
  nguoiLienHe: string;
  soDienThoai: string;
  diaChi: string;
  loaiHopDong: LoaiHopDong;
  donGiaSuat: number;
  buoiMacDinh: string;
  ghiChu: string;
  trangThai: 'active' | 'inactive';
  ngayTao: string;
  thoiGianShip?: string;
  phiShip?: number;
  phanLoai?: string;
  diKem?: string;
  loaiKhay?: string;
  ngaySuKien?: string;
  nhomKhachHang?: string;
}

export interface DonHang {
  id: string;
  khachHangID: string;
  tenKhachHang: string;
  ngayGiao: string;
  buoi: string;
  soSuat: number;
  soSuatThucTe: number;
  donGia: number;
  thanhTien: number;
  trangThai: string;
  nguonDon: string;
  ghiChu: string;
  chiTietMon: string; // JSON string: {"M1": 10, "M2": 5}
  ngayTao: string;
  nguoiTao: string;
}

export interface KeMon {
  ngay: string;
  buoi: string;
  mon1: string;
  mon2: string;
  mon3: string;
  mon4: string;
  mon5: string;
  monPhu: string;
  ghiChu: string;
  khachHangID?: string;
}

export interface TongHopNgay {
  ngay: string;
  buoi: string;
  maMon: string;
  tenMon: string;
  soSuatBao: number;
  soSuatNau: number;
  soSuatCon: number;
  ghiChu: string;
  ngayCapNhat: string;
}

export interface ThanhToan {
  id: string;
  khachHangID: string;
  tenKhachHang: string;
  kyThanhToan: string;
  tongTienPhatSinh: number;
  soTienDaThanhToan: number;
  conNo: number;
  ngayThanhToan: string;
  hinhThuc: string;
  ghiChu: string;
}

// ──────────────────────────────────────────────
// Row mappers: snake_case DB → camelCase TS
// ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toKhachHang(r: any): KhachHang {
  return {
    id:             String(r.id ?? ''),
    tenCongTy:      String(r.ten_cong_ty ?? ''),
    nguoiLienHe:    String(r.nguoi_lien_he ?? ''),
    soDienThoai:    String(r.so_dien_thoai ?? ''),
    diaChi:         String(r.dia_chi ?? ''),
    loaiHopDong:    String(r.loai_hop_dong ?? 'thang') as LoaiHopDong,
    donGiaSuat:     Number(r.don_gia_suat ?? 0),
    buoiMacDinh:    String(r.buoi_mac_dinh ?? ''),
    ghiChu:         String(r.ghi_chu ?? ''),
    trangThai:      (r.trang_thai ?? 'active') as 'active' | 'inactive',
    ngayTao:        String(r.ngay_tao ?? ''),
    thoiGianShip:   String(r.thoi_gian_ship ?? ''),
    phiShip:        Number(r.phi_ship ?? 0),
    phanLoai:       String(r.phan_loai ?? ''),
    diKem:          String(r.di_kem ?? ''),
    loaiKhay:       String(r.loai_khay ?? ''),
    ngaySuKien:     r.ngay_su_kien ? String(r.ngay_su_kien) : undefined,
    nhomKhachHang:  String(r.nhom_khach_hang ?? ''),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDonHang(r: any): DonHang {
  const chiTietMon = typeof r.chi_tiet_mon === 'object'
    ? JSON.stringify(r.chi_tiet_mon)
    : String(r.chi_tiet_mon ?? '{}');
  return {
    id:               String(r.id ?? ''),
    khachHangID:      String(r.khach_hang_id ?? ''),
    tenKhachHang:     String(r.ten_khach_hang ?? ''),
    ngayGiao:         String(r.ngay_giao ?? ''),
    buoi:             String(r.buoi ?? ''),
    soSuat:           Number(r.so_suat ?? 0),
    soSuatThucTe:     Number(r.so_suat_thuc_te ?? 0),
    donGia:           Number(r.don_gia ?? 0),
    thanhTien:        Number(r.thanh_tien ?? 0),
    trangThai:        String(r.trang_thai ?? ''),
    nguonDon:         String(r.nguon_don ?? ''),
    ghiChu:           String(r.ghi_chu ?? ''),
    chiTietMon,
    ngayTao:          String(r.ngay_tao ?? ''),
    nguoiTao:         String(r.nguoi_tao ?? ''),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toKeMon(r: any): KeMon {
  return {
    ngay:         String(r.ngay ?? ''),
    buoi:         String(r.buoi ?? ''),
    mon1:         String(r.mon1 ?? ''),
    mon2:         String(r.mon2 ?? ''),
    mon3:         String(r.mon3 ?? ''),
    mon4:         String(r.mon4 ?? ''),
    mon5:         String(r.mon5 ?? ''),
    monPhu:       String(r.mon_phu ?? ''),
    ghiChu:       String(r.ghi_chu ?? ''),
    khachHangID:  r.khach_hang_id ? String(r.khach_hang_id) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTongHopNgay(r: any): TongHopNgay {
  return {
    ngay:         String(r.ngay ?? ''),
    buoi:         String(r.buoi ?? ''),
    maMon:        String(r.ma_mon ?? ''),
    tenMon:       String(r.ten_mon ?? ''),
    soSuatBao:    Number(r.so_suat_bao ?? 0),
    soSuatNau:    Number(r.so_suat_nau ?? 0),
    soSuatCon:    Number(r.so_suat_con ?? 0),
    ghiChu:       String(r.ghi_chu ?? ''),
    ngayCapNhat:  String(r.ngay_cap_nhat ?? ''),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toThanhToan(r: any): ThanhToan {
  return {
    id:                   String(r.id ?? ''),
    khachHangID:          String(r.khach_hang_id ?? ''),
    tenKhachHang:         String(r.ten_khach_hang ?? ''),
    kyThanhToan:          String(r.ky_thanh_toan ?? ''),
    tongTienPhatSinh:     Number(r.tong_tien_phat_sinh ?? 0),
    soTienDaThanhToan:    Number(r.so_tien_da_thanh_toan ?? 0),
    conNo:                Number(r.con_no ?? 0),
    ngayThanhToan:        String(r.ngay_thanh_toan ?? ''),
    hinhThuc:             String(r.hinh_thuc ?? ''),
    ghiChu:               String(r.ghi_chu ?? ''),
  };
}

// ──────────────────────────────────────────────
// Database helpers
// ──────────────────────────────────────────────

export const db = {
  khachHang: {
    async getAll(page = 1, limit = 100) {
      const offset = (page - 1) * limit;
      const { data, count, error } = await supabase
        .from('khach_hang')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('ngay_tao', { ascending: false });

      if (error) throw error;
      return { data: (data ?? []).map(toKhachHang), total: count ?? 0 };
    },

    async create(data: Omit<KhachHang, 'id' | 'ngayTao'>) {
      const id = `KH${Date.now().toString().slice(-6)}`;
      const ngayTao = new Date().toISOString();
      const { error } = await supabase.from('khach_hang').insert({
        id,
        ten_cong_ty:      data.tenCongTy,
        nguoi_lien_he:    data.nguoiLienHe,
        so_dien_thoai:    data.soDienThoai,
        dia_chi:          data.diaChi,
        loai_hop_dong:    data.loaiHopDong,
        don_gia_suat:     data.donGiaSuat,
        buoi_mac_dinh:    data.buoiMacDinh,
        ghi_chu:          data.ghiChu,
        trang_thai:       data.trangThai,
        ngay_tao:         ngayTao,
        thoi_gian_ship:   data.thoiGianShip ?? '',
        phi_ship:         data.phiShip ?? 0,
        phan_loai:        data.phanLoai ?? '',
        di_kem:           data.diKem ?? '',
        loai_khay:        data.loaiKhay ?? '',
        ngay_su_kien:     data.ngaySuKien ?? null,
        nhom_khach_hang:  data.nhomKhachHang ?? '',
      });
      if (error) throw error;
      return { ...data, id, ngayTao };
    },

    async existsByCompanyName(tenCongTy: string, excludeId?: string) {
      let query = supabase
        .from('khach_hang')
        .select('id')
        .ilike('ten_cong_ty', tenCongTy.trim());
      if (excludeId) query = query.neq('id', excludeId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).length > 0;
    },

    async update(id: string, updates: Partial<KhachHang>) {
      const patch: Record<string, unknown> = {};
      if (updates.tenCongTy !== undefined)    patch.ten_cong_ty     = updates.tenCongTy;
      if (updates.nguoiLienHe !== undefined)  patch.nguoi_lien_he   = updates.nguoiLienHe;
      if (updates.soDienThoai !== undefined)  patch.so_dien_thoai   = updates.soDienThoai;
      if (updates.diaChi !== undefined)       patch.dia_chi         = updates.diaChi;
      if (updates.loaiHopDong !== undefined)  patch.loai_hop_dong   = updates.loaiHopDong;
      if (updates.donGiaSuat !== undefined)   patch.don_gia_suat    = updates.donGiaSuat;
      if (updates.buoiMacDinh !== undefined)  patch.buoi_mac_dinh   = updates.buoiMacDinh;
      if (updates.ghiChu !== undefined)       patch.ghi_chu         = updates.ghiChu;
      if (updates.trangThai !== undefined)    patch.trang_thai      = updates.trangThai;
      if (updates.thoiGianShip !== undefined) patch.thoi_gian_ship  = updates.thoiGianShip;
      if (updates.phiShip !== undefined)      patch.phi_ship        = updates.phiShip;
      if (updates.phanLoai !== undefined)     patch.phan_loai       = updates.phanLoai;
      if (updates.diKem !== undefined)        patch.di_kem          = updates.diKem;
      if (updates.loaiKhay !== undefined)     patch.loai_khay       = updates.loaiKhay;
      if (updates.ngaySuKien !== undefined)   patch.ngay_su_kien    = updates.ngaySuKien ?? null;
      if (updates.nhomKhachHang !== undefined) patch.nhom_khach_hang = updates.nhomKhachHang;

      const { error } = await supabase.from('khach_hang').update(patch).eq('id', id);
      if (error) throw error;
    },
  },

  donHang: {
    async getByDate(ngay: string, buoi?: string, page = 1, limit = 200) {
      const offset = (page - 1) * limit;
      let query = supabase
        .from('don_hang')
        .select('*', { count: 'exact' })
        .order('ngay_tao', { ascending: true });

      if (ngay)  query = query.eq('ngay_giao', ngay);
      if (buoi)  query = query.eq('buoi', buoi);

      const { data, count, error } = await query.range(offset, offset + limit - 1);
      if (error) throw error;
      return { data: (data ?? []).map(toDonHang), total: count ?? 0 };
    },

    async getByCustomer(khachHangID: string, limit = 10) {
      const { data, error } = await supabase
        .from('don_hang')
        .select('*')
        .eq('khach_hang_id', khachHangID)
        .order('ngay_giao', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map(toDonHang);
    },

    async create(data: Omit<DonHang, 'id' | 'thanhTien'>) {
      const id = `DH${Date.now().toString().slice(-6)}`;
      const thanhTien = Number(data.soSuatThucTe || data.soSuat) * Number(data.donGia);
      // Parse chiTietMon: có thể là JSON string hoặc object
      let chiTietMon: unknown = {};
      try { chiTietMon = typeof data.chiTietMon === 'string' ? JSON.parse(data.chiTietMon) : data.chiTietMon; } catch { /* keep {} */ }

      const { error } = await supabase.from('don_hang').insert({
        id,
        khach_hang_id:    data.khachHangID,
        ten_khach_hang:   data.tenKhachHang,
        ngay_giao:        data.ngayGiao,
        buoi:             data.buoi,
        so_suat:          data.soSuat,
        so_suat_thuc_te:  data.soSuatThucTe || data.soSuat,
        don_gia:          data.donGia,
        thanh_tien:       thanhTien,
        trang_thai:       data.trangThai,
        nguon_don:        data.nguonDon,
        ghi_chu:          data.ghiChu,
        chi_tiet_mon:     chiTietMon,
        ngay_tao:         data.ngayTao || new Date().toISOString(),
        nguoi_tao:        data.nguoiTao || 'system',
      });
      if (error) throw error;
      return { ...data, id, thanhTien };
    },

    async update(id: string, updates: Partial<DonHang>) {
      const patch: Record<string, unknown> = {};
      if (updates.soSuatThucTe !== undefined) {
        patch.so_suat_thuc_te = updates.soSuatThucTe;
        // Cần lấy don_gia hiện tại để tính lại thanh_tien
        const { data: current } = await supabase
          .from('don_hang').select('don_gia').eq('id', id).single();
        if (current) patch.thanh_tien = updates.soSuatThucTe * Number(current.don_gia);
      }
      if (updates.trangThai !== undefined) patch.trang_thai  = updates.trangThai;
      if (updates.ghiChu !== undefined)    patch.ghi_chu     = updates.ghiChu;
      if (updates.chiTietMon !== undefined) {
        try { patch.chi_tiet_mon = typeof updates.chiTietMon === 'string' ? JSON.parse(updates.chiTietMon) : updates.chiTietMon; }
        catch { patch.chi_tiet_mon = {}; }
      }

      const { error } = await supabase.from('don_hang').update(patch).eq('id', id);
      if (error) throw error;
    },
  },

  keMon: {
    async get(ngay: string, buoi: string, khachHangID?: string) {
      let query = supabase
        .from('ke_mon')
        .select('*')
        .eq('ngay', ngay)
        .eq('buoi', buoi);

      if (khachHangID) {
        query = query.eq('khach_hang_id', khachHangID);
      } else {
        query = query.is('khach_hang_id', null);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data ? toKeMon(data) : null;
    },

    async save(data: KeMon) {
      const existing = await db.keMon.get(data.ngay, data.buoi, data.khachHangID);
      const row = {
        ngay:           data.ngay,
        buoi:           data.buoi,
        mon1:           data.mon1,
        mon2:           data.mon2,
        mon3:           data.mon3,
        mon4:           data.mon4,
        mon5:           data.mon5,
        mon_phu:        data.monPhu,
        ghi_chu:        data.ghiChu,
        khach_hang_id:  data.khachHangID ?? null,
      };

      if (existing) {
        // Tìm id để update
        const { data: found } = await supabase
          .from('ke_mon').select('id')
          .eq('ngay', data.ngay).eq('buoi', data.buoi)
          .is('khach_hang_id', data.khachHangID ?? null)
          .single();
        if (found) {
          const { error } = await supabase.from('ke_mon').update(row).eq('id', found.id);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase.from('ke_mon').insert(row);
        if (error) throw error;
      }
    },
  },

  tongHop: {
    async getByDate(ngay: string, buoi: string) {
      const { data, error } = await supabase
        .from('tong_hop_ngay')
        .select('*')
        .eq('ngay', ngay)
        .eq('buoi', buoi);
      if (error) throw error;
      return (data ?? []).map(toTongHopNgay);
    },

    async updateBatch(items: TongHopNgay[]) {
      if (items.length === 0) return;
      const rows = items.map(item => ({
        ngay:           item.ngay,
        buoi:           item.buoi,
        ma_mon:         item.maMon,
        ten_mon:        item.tenMon,
        so_suat_bao:    item.soSuatBao,
        so_suat_nau:    item.soSuatNau,
        so_suat_con:    item.soSuatCon,
        ghi_chu:        item.ghiChu,
        ngay_cap_nhat:  new Date().toISOString(),
      }));
      // onConflict khớp với PRIMARY KEY (ngay, buoi, ma_mon)
      const { error } = await supabase
        .from('tong_hop_ngay')
        .upsert(rows, { onConflict: 'ngay,buoi,ma_mon' });
      if (error) throw error;
    },
  },

  thanhToan: {
    async listByCustomer(khachHangId?: string) {
      let query = supabase.from('thanh_toan').select('*').order('ngay_thanh_toan', { ascending: false });
      if (khachHangId) query = query.eq('khach_hang_id', khachHangId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(toThanhToan);
    },

    async create(data: Omit<ThanhToan, 'id'>) {
      const id = `TT${Date.now().toString().slice(-6)}`;
      const conNo = data.tongTienPhatSinh - data.soTienDaThanhToan;
      const { error } = await supabase.from('thanh_toan').insert({
        id,
        khach_hang_id:          data.khachHangID,
        ten_khach_hang:         data.tenKhachHang,
        ky_thanh_toan:          data.kyThanhToan,
        tong_tien_phat_sinh:    data.tongTienPhatSinh,
        so_tien_da_thanh_toan:  data.soTienDaThanhToan,
        con_no:                 conNo,
        ngay_thanh_toan:        data.ngayThanhToan || null,
        hinh_thuc:              data.hinhThuc,
        ghi_chu:                data.ghiChu ?? '',
      });
      if (error) throw error;
      return id;
    },
  },
};
