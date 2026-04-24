import { getRows, appendRow, updateRow, findRowById } from "./sheets";
import { SHEETS, LoaiHopDong } from "./constants";

// Interfaces
export interface KhachHang {
  id: string;
  tenCongTy: string;
  nguoiLienHe: string;
  soDienThoai: string;
  diaChi: string;
  loaiHopDong: LoaiHopDong;
  donGiaSuat: number;
  buoiMacDinh: string; // comma-separated values: sang,trua,chieu,trai_cay
  ghiChu: string;
  trangThai: "active" | "inactive";
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
  chiTietMon: string; // JSON: {"M1": 10, "M2": 5, "BUN": 2}
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
  khachHangID?: string; // If set, it's a customized menu for this customer
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

// Database Helpers
export const db = {
  khachHang: {
    async getAll(page = 1, limit = 100) {
      const rows = await getRows(SHEETS.KHACH_HANG);
      if (rows.length <= 1) return { data: [], total: 0 };
      const all = rows.slice(1).map(row => ({
        id: String(row[0] ?? ""),
        tenCongTy: String(row[1] ?? ""),
        nguoiLienHe: String(row[2] ?? ""),
        soDienThoai: String(row[3] ?? ""),
        diaChi: String(row[4] ?? ""),
        loaiHopDong: String(row[5] ?? "thang") as LoaiHopDong,
        donGiaSuat: Number(row[6]),
        buoiMacDinh: String(row[7] ?? ""),
        ghiChu: String(row[8] ?? ""),
        trangThai: String(row[9] ?? "") as "active" | "inactive",
        ngayTao: String(row[10] ?? ""),
        thoiGianShip: String(row[11] ?? ""),
        phiShip: Number(row[12] || 0),
        phanLoai: String(row[13] ?? ""),
        diKem: String(row[14] ?? ""),
        loaiKhay: String(row[15] ?? ""),
        ngaySuKien: String(row[16] ?? ""),
        nhomKhachHang: String(row[17] ?? ""),
      }));
      const total = all.length;
      const offset = (page - 1) * limit;
      return { data: all.slice(offset, offset + limit), total };
    },
    async create(data: Omit<KhachHang, 'id' | 'ngayTao'>) {
      const id = `KH${Date.now().toString().slice(-6)}`;
      const ngayTao = new Date().toISOString();
      const values = [id, data.tenCongTy, data.nguoiLienHe, data.soDienThoai, data.diaChi, data.loaiHopDong, data.donGiaSuat, data.buoiMacDinh, data.ghiChu, data.trangThai, ngayTao, data.thoiGianShip || "", data.phiShip || 0, data.phanLoai || "", data.diKem || "", data.loaiKhay || "", data.ngaySuKien || "", data.nhomKhachHang || ""];
      await appendRow(SHEETS.KHACH_HANG, values);
      return { ...data, id, ngayTao };
    },
    async existsByCompanyName(tenCongTy: string, excludeId?: string) {
      const rows = await getRows(SHEETS.KHACH_HANG);
      if (rows.length <= 1) return false;
      const normalized = tenCongTy.trim().toLowerCase();
      return rows.slice(1).some((row) => {
        const id = String(row[0] ?? "");
        const name = String(row[1] ?? "").trim().toLowerCase();
        if (excludeId && id === excludeId) return false;
        return name !== "" && name === normalized;
      });
    },
    async update(id: string, updates: Partial<KhachHang>) {
      const found = await findRowById(SHEETS.KHACH_HANG, id);
      if (!found) throw new Error("Khách hàng không tồn tại");
      
      const newRow = [...found.row];
      if (updates.tenCongTy !== undefined) newRow[1] = updates.tenCongTy;
      if (updates.nguoiLienHe !== undefined) newRow[2] = updates.nguoiLienHe;
      if (updates.soDienThoai !== undefined) newRow[3] = updates.soDienThoai;
      if (updates.diaChi !== undefined) newRow[4] = updates.diaChi;
      if (updates.loaiHopDong !== undefined) newRow[5] = updates.loaiHopDong;
      if (updates.donGiaSuat !== undefined) newRow[6] = updates.donGiaSuat;
      if (updates.buoiMacDinh !== undefined) newRow[7] = updates.buoiMacDinh;
      if (updates.ghiChu !== undefined) newRow[8] = updates.ghiChu;
      if (updates.trangThai !== undefined) newRow[9] = updates.trangThai;
      if (updates.thoiGianShip !== undefined) newRow[11] = updates.thoiGianShip;
      if (updates.phiShip !== undefined) newRow[12] = updates.phiShip;
      if (updates.phanLoai !== undefined) newRow[13] = updates.phanLoai;
      if (updates.diKem !== undefined) newRow[14] = updates.diKem;
      if (updates.loaiKhay !== undefined) newRow[15] = updates.loaiKhay;
      if (updates.ngaySuKien !== undefined) newRow[16] = updates.ngaySuKien;
      if (updates.nhomKhachHang !== undefined) newRow[17] = updates.nhomKhachHang;
      
      await updateRow(SHEETS.KHACH_HANG, found.index, newRow);
    }
  },

  donHang: {
    async getByDate(ngay: string, buoi?: string, page = 1, limit = 200) {
      const rows = await getRows(SHEETS.DON_HANG);
      if (rows.length <= 1) return { data: [], total: 0 };
      let all = rows.slice(1).map(row => ({
        id: row[0],
        khachHangID: row[1],
        tenKhachHang: row[2],
        ngayGiao: row[3],
        buoi: row[4],
        soSuat: Number(row[5]),
        soSuatThucTe: Number(row[6]),
        donGia: Number(row[7]),
        thanhTien: Number(row[8]),
        trangThai: row[9],
        nguonDon: row[10],
        ghiChu: row[11],
        chiTietMon: String(row[12] || "{}"),
        ngayTao: row[13],
        nguoiTao: row[14],
      }));

      if (ngay) all = all.filter(d => d.ngayGiao === ngay);
      if (buoi) all = all.filter(d => d.buoi === buoi);

      const total = all.length;
      const offset = (page - 1) * limit;
      return { data: all.slice(offset, offset + limit), total };
    },
    async getByCustomer(khachHangID: string, limit = 10) {
      const rows = await getRows(SHEETS.DON_HANG);
      if (rows.length <= 1) return [];
      const data = rows.slice(1).map(row => ({
        id: row[0],
        khachHangID: row[1],
        tenKhachHang: row[2],
        ngayGiao: row[3],
        buoi: row[4],
        soSuat: Number(row[5]),
        soSuatThucTe: Number(row[6]),
        donGia: Number(row[7]),
        thanhTien: Number(row[8]),
        trangThai: row[9],
        nguonDon: row[10],
        ghiChu: row[11],
        chiTietMon: String(row[12] || "{}"),
        ngayTao: row[13],
        nguoiTao: row[14],
      }));
      return data
        .filter((d) => d.khachHangID === khachHangID)
        .sort((a, b) => String(b.ngayGiao).localeCompare(String(a.ngayGiao)))
        .slice(0, limit);
    },
    async create(data: Omit<DonHang, 'id' | 'thanhTien'>) {
      const id = `DH${Date.now().toString().slice(-6)}`;
      const thanhTien = Number(data.soSuatThucTe || data.soSuat) * Number(data.donGia);
      const values = [
        id, data.khachHangID, data.tenKhachHang, data.ngayGiao, data.buoi, 
        data.soSuat, data.soSuatThucTe || data.soSuat, data.donGia, thanhTien, 
        data.trangThai, data.nguonDon, data.ghiChu, data.chiTietMon || "{}", 
        data.ngayTao || new Date().toISOString(), data.nguoiTao || "system"
      ];
      await appendRow(SHEETS.DON_HANG, values);
      return { ...data, id, thanhTien };
    },
    async update(id: string, updates: Partial<DonHang>) {
      const found = await findRowById(SHEETS.DON_HANG, id);
      if (!found) throw new Error("Order not found");
      
      const newRow = [...found.row];
      if (updates.soSuatThucTe !== undefined) newRow[6] = updates.soSuatThucTe;
      if (updates.trangThai !== undefined) newRow[9] = updates.trangThai;
      if (updates.ghiChu !== undefined) newRow[11] = updates.ghiChu;
      if (updates.chiTietMon !== undefined) newRow[12] = updates.chiTietMon;
      
      // Re-calculate thanhTien if quantity changes
      if (updates.soSuatThucTe !== undefined) {
        newRow[8] = Number(newRow[6]) * Number(newRow[7]);
      }
      
      await updateRow(SHEETS.DON_HANG, found.index, newRow);
    }
  },

  keMon: {
    async get(ngay: string, buoi: string, khachHangID?: string) {
      const rows = await getRows(SHEETS.KE_MON);
      if (rows.length <= 1) return null;
      const data = rows.slice(1).map(row => ({
        ngay: String(row[0] ?? ""),
        buoi: String(row[1] ?? ""),
        mon1: String(row[2] ?? ""),
        mon2: String(row[3] ?? ""),
        mon3: String(row[4] ?? ""),
        mon4: String(row[5] ?? ""),
        mon5: String(row[6] ?? ""),
        monPhu: String(row[7] ?? ""),
        ghiChu: String(row[8] ?? ""),
        khachHangID: String(row[9] ?? ""),
      }));
      
      return data.find(d => d.ngay === ngay && d.buoi === buoi && (khachHangID ? d.khachHangID === khachHangID : !d.khachHangID)) || null;
    },
    async save(data: KeMon) {
      const rows = await getRows(SHEETS.KE_MON);
      const index = rows.findIndex(r => r[0] === data.ngay && r[1] === data.buoi && (data.khachHangID ? r[9] === data.khachHangID : !r[9]));
      
      const values = [data.ngay, data.buoi, data.mon1, data.mon2, data.mon3, data.mon4, data.mon5, data.monPhu, data.ghiChu, data.khachHangID || ""];
      
      if (index !== -1) {
        await updateRow(SHEETS.KE_MON, index + 1, values);
      } else {
        await appendRow(SHEETS.KE_MON, values);
      }
    }
  },

  tongHop: {
    async getByDate(ngay: string, buoi: string) {
      const rows = await getRows(SHEETS.TONG_HOP);
      if (rows.length <= 1) return [];
      return rows.slice(1)
        .map(row => ({
          ngay: row[0],
          buoi: row[1],
          maMon: row[2],
          tenMon: row[3],
          soSuatBao: Number(row[4]),
          soSuatNau: Number(row[5]),
          soSuatCon: Number(row[6]),
          ghiChu: row[7],
          ngayCapNhat: row[8],
        }))
        .filter(d => d.ngay === ngay && d.buoi === buoi);
    },
    async updateBatch(items: TongHopNgay[]) {
      if (items.length === 0) return;
      const rows = await getRows(SHEETS.TONG_HOP);

      for (const item of items) {
        const index = rows.findIndex(r => r[0] === item.ngay && r[1] === item.buoi && r[2] === item.maMon);
        const values = [item.ngay, item.buoi, item.maMon, item.tenMon, item.soSuatBao, item.soSuatNau, item.soSuatCon, item.ghiChu, new Date().toISOString()];

        if (index !== -1) {
          await updateRow(SHEETS.TONG_HOP, index + 1, values);
          rows[index] = values;
        } else {
          await appendRow(SHEETS.TONG_HOP, values);
          rows.push(values);
        }
      }
    }
  },

  thanhToan: {
    async listByCustomer(khachHangId?: string) {
      const rows = await getRows(SHEETS.THANH_TOAN);
      if (rows.length <= 1) return [];
      let data = rows.slice(1).map(row => ({
        id: row[0],
        khachHangID: row[1],
        tenKhachHang: row[2],
        kyThanhToan: row[3],
        tongTienPhatSinh: Number(row[4] || 0),
        soTienDaThanhToan: Number(row[5] || 0),
        conNo: Number(row[6] || 0),
        ngayThanhToan: row[7],
        hinhThuc: row[8],
        ghiChu: row[9],
      }));
      
      if (khachHangId) {
        data = data.filter(d => d.khachHangID === khachHangId);
      }
      return data;
    },
    async create(data: Omit<ThanhToan, 'id'>) {
      const id = `TT${Date.now().toString().slice(-6)}`;
      const values = [
        id, 
        data.khachHangID, 
        data.tenKhachHang, 
        data.kyThanhToan, 
        data.tongTienPhatSinh, 
        data.soTienDaThanhToan, 
        data.conNo, 
        data.ngayThanhToan || new Date().toISOString(), 
        data.hinhThuc, 
        data.ghiChu || ""
      ];
      await appendRow(SHEETS.THANH_TOAN, values);
      return id;
    }
  }
};
