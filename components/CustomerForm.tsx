"use client";

import React, { useState } from "react";
import { X, Save, User, Phone, MapPin, Wallet } from "lucide-react";
import { KhachHang } from "@/lib/db";
import { BUOI, BUOI_LABELS, LOAI_HOP_DONG_LABELS } from "@/lib/constants";

interface CustomerFormProps {
  customer?: KhachHang;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomerForm({ customer, onClose, onSuccess }: CustomerFormProps) {
  const parseAnThuMeta = (value?: string) => {
    if (!value?.startsWith("an_thu|")) return { ngayAnThu: "", giaiDoanAnThu: "" };
    const parts = value.split("|");
    return {
      ngayAnThu: parts[1] || "",
      giaiDoanAnThu: parts.slice(2).join("|") || "",
    };
  };

  const anThuMeta = parseAnThuMeta(customer?.ngaySuKien);

  const [formData, setFormData] = useState({
    tenCongTy: customer?.tenCongTy || "",
    nguoiLienHe: customer?.nguoiLienHe || "",
    soDienThoai: customer?.soDienThoai || "",
    diaChi: customer?.diaChi || "",
    loaiHopDong: customer?.loaiHopDong || "thang",
    donGiaSuat: customer?.donGiaSuat || 35000,
    buoiMacDinh: customer?.buoiMacDinh || "trua",
    ghiChu: customer?.ghiChu || "",
    thoiGianShip: customer?.thoiGianShip || "",
    phiShip: customer?.phiShip || 0,
    phanLoai: customer?.phanLoai || "",
    diKem: customer?.diKem || "",
    loaiKhay: customer?.loaiKhay || "",
    ngaySuKien: customer?.ngaySuKien?.startsWith("an_thu|") ? "" : customer?.ngaySuKien || "",
    ngayAnThu: anThuMeta.ngayAnThu,
    giaiDoanAnThu: anThuMeta.giaiDoanAnThu,
    nhomKhachHang: customer?.nhomKhachHang || "",
    trangThai: customer?.trangThai || "active",
  });

  const toggleBuoi = (b: string) => {
    const current = formData.buoiMacDinh.split(',').filter(Boolean);
    if (current.includes(b)) {
      setFormData({ ...formData, buoiMacDinh: current.filter(x => x !== b).join(',') });
    } else {
      setFormData({ ...formData, buoiMacDinh: [...current, b].join(',') });
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = "/api/khach-hang";
      const method = customer ? "PUT" : "POST";
      const payload = { ...formData };
      if (payload.loaiHopDong === "an_thu") {
        payload.ngaySuKien = `an_thu|${payload.ngayAnThu}|${payload.giaiDoanAnThu}`;
      }
      if (payload.loaiHopDong !== "an_thu") {
        payload.ngayAnThu = "";
        payload.giaiDoanAnThu = "";
      }
      const body = customer ? { id: customer.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">{customer ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[78vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên công ty / Đơn vị</label>
              <input
                required
                value={formData.tenCongTy}
                onChange={(e) => setFormData({ ...formData, tenCongTy: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                placeholder="VD: Công ty ABC"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Người liên hệ</label>
              <input
                required
                value={formData.nguoiLienHe}
                onChange={(e) => setFormData({ ...formData, nguoiLienHe: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                placeholder="Họ và tên"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  value={formData.soDienThoai}
                  onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                  className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  placeholder="09xx..."
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loại hợp đồng</label>
              <select
                value={formData.loaiHopDong}
                onChange={(e) => setFormData({ ...formData, loaiHopDong: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none text-sm"
              >
                {Object.entries(LOAI_HOP_DONG_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>{val}</option>
                ))}
              </select>
            </div>
            {formData.loaiHopDong === "su_kien" && (
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày sự kiện</label>
                <textarea
                  value={formData.ngaySuKien}
                  onChange={(e) => setFormData({ ...formData, ngaySuKien: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  placeholder="Ví dụ: 12/05, 14/05; 20/05 - 22/05; 25/05"
                />
                <p className="text-[11px] text-slate-500">Cho phép nhập ngày rời rạc, khoảng ngày, hoặc kết hợp nhiều kiểu.</p>
              </div>
            )}
            {formData.loaiHopDong === "an_thu" && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày ăn thử</label>
                  <input
                    type="date"
                    value={formData.ngayAnThu}
                    onChange={(e) => setFormData({ ...formData, ngayAnThu: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giai đoạn ăn thử</label>
                  <input
                    type="text"
                    value={formData.giaiDoanAnThu}
                    onChange={(e) => setFormData({ ...formData, giaiDoanAnThu: e.target.value })}
                    placeholder="VD: 3 ngày đầu tháng, tuần 1..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
              </>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhóm khách / Công ty mẹ</label>
              <input
                type="text"
                value={formData.nhomKhachHang}
                onChange={(e) => setFormData({ ...formData, nhomKhachHang: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                placeholder="Để trống nếu không gộp"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</label>
              <select
                value={formData.trangThai}
                onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              >
                <option value="active">Đang dùng</option>
                <option value="inactive">Dừng hoạt động</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ giao hàng</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  required
                  rows={2}
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                  className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  placeholder="Số nhà, tên đường, quận/huyện..."
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đơn giá suất (VNĐ)</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  required
                  value={formData.donGiaSuat}
                  onChange={(e) => setFormData({ ...formData, donGiaSuat: Number(e.target.value) })}
                  className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ca mặc định</label>
              <div className="flex flex-wrap gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {Object.values(BUOI).filter((b) => b !== BUOI.TRAI_CAY).map((b) => (
                  <label key={b} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.buoiMacDinh.includes(b)}
                      onChange={() => toggleBuoi(b)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium">{BUOI_LABELS[b]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian ship</label>
              <input type="time" value={formData.thoiGianShip} onChange={(e) => setFormData({ ...formData, thoiGianShip: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phí ship</label>
              <input type="number" value={formData.phiShip} onChange={(e) => setFormData({ ...formData, phiShip: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phân loại</label>
              <input type="text" placeholder="Sự kiện, hợp đồng..." value={formData.phanLoai} onChange={(e) => setFormData({ ...formData, phanLoai: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đi kèm</label>
              <input type="text" placeholder="Đũa, giấy..." value={formData.diKem} onChange={(e) => setFormData({ ...formData, diKem: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loại khay</label>
              <input type="text" placeholder="VD: 5 ngăn" value={formData.loaiKhay} onChange={(e) => setFormData({ ...formData, loaiKhay: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ghi chú</label>
              <textarea rows={2} value={formData.ghiChu} onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
            </div>
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-all active:scale-95 text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Đang lưu..." : "Lưu thông tin"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
