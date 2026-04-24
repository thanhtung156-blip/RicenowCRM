"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Info, ChefHat } from "lucide-react";
import { KhachHang, DonHang } from "@/lib/db";
import { BUOI, NGUON_DON, TRANG_THAI_DON } from "@/lib/constants";
import { formatISODate } from "@/lib/utils";

interface OrderFormProps {
  order?: DonHang;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderForm({ order, onClose, onSuccess }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<KhachHang[]>([]);
  const [formData, setFormData] = useState<Partial<DonHang>>(order || {
    khachHangID: "",
    ngayGiao: formatISODate(new Date()),
    buoi: BUOI.TRUA,
    soSuat: 0,
    soSuatThucTe: 0,
    donGia: 0,
    trangThai: TRANG_THAI_DON.DA_XAC_NHAN,
    nguonDon: NGUON_DON.THU_CONG,
    chiTietMon: "{}",
    ghiChu: ""
  });

  const [dishDetails, setDishDetails] = useState<Record<string, number>>(
    order ? JSON.parse(order.chiTietMon || "{}") : { "M1": 0 }
  );

  useEffect(() => {
    fetch("/api/khach-hang")
      .then(res => res.json())
      .then(json => setCustomers(json.data || []));
  }, []);

  const handleCustomerChange = (id: string) => {
    const cust = customers.find(c => c.id === id);
    if (cust) {
      setFormData({
        ...formData,
        khachHangID: id,
        tenKhachHang: cust.tenCongTy,
        donGia: cust.donGiaSuat,
        buoi: cust.buoiMacDinh
      });
    }
  };

  const updateDishQty = (code: string, qty: number) => {
    const newDetails = { ...dishDetails, [code]: qty };
    setDishDetails(newDetails);
    
    // Update total soSuat
    const total = Object.values(newDetails).reduce((acc, v) => acc + v, 0);
    setFormData(prev => ({ ...prev, soSuat: total, soSuatThucTe: total }));
  };

  const addDishField = () => {
    const nextIdx = Object.keys(dishDetails).length + 1;
    setDishDetails({ ...dishDetails, [`M${nextIdx}`]: 0 });
  };

  const removeDishField = (code: string) => {
    const newDetails = { ...dishDetails };
    delete newDetails[code];
    setDishDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalData = {
        ...formData,
        chiTietMon: JSON.stringify(dishDetails),
        thanhTien: (formData.soSuatThucTe || 0) * (formData.donGia || 0)
      };
      
      const res = await fetch("/api/don-hang", {
        method: order ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order ? { ...finalData, id: order.id } : finalData),
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {order ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng mới"}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Chi tiết báo suất khách hàng</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Khách hàng</label>
                <select
                  required
                  value={formData.khachHangID}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="misa-input font-bold"
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.tenCongTy}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày giao</label>
                <input
                  type="date"
                  required
                  value={formData.ngayGiao}
                  onChange={(e) => setFormData({ ...formData, ngayGiao: e.target.value })}
                  className="misa-input font-bold"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                  <ChefHat className="w-4 h-4 mr-2 text-[#0072bc]" /> Chi tiết món ăn
                </h4>
                <button 
                  type="button" 
                  onClick={addDishField}
                  className="text-[10px] font-bold text-[#0072bc] hover:underline flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" /> Thêm món/Lựa chọn
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(dishDetails).map(([code, qty]) => (
                  <div key={code} className="flex items-center space-x-2 bg-white p-3 rounded-2xl border border-slate-200">
                    <div className="flex-1">
                      <input
                        value={code}
                        onChange={(e) => {
                          const newCode = e.target.value.toUpperCase();
                          const newDetails = { ...dishDetails };
                          delete newDetails[code];
                          newDetails[newCode] = qty;
                          setDishDetails(newDetails);
                        }}
                        placeholder="Mã món (M1, BUN...)"
                        className="text-[10px] font-black text-[#0072bc] uppercase w-full outline-none"
                      />
                    </div>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => updateDishQty(code, Number(e.target.value))}
                      className="w-16 text-right font-black text-slate-900 outline-none"
                    />
                    <button type="button" onClick={() => removeDishField(code)} className="text-slate-300 hover:text-rose-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-slate-500">
                <div className="flex items-center text-[10px] font-bold">
                  <Info className="w-3 h-3 mr-1" />
                  Gợi ý: M1, M2 cho cơm; BUN, BANH_MY cho món đặc biệt.
                </div>
                <div className="text-sm font-black text-slate-900">
                  Tổng: {formData.soSuatThucTe} suất
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú đơn hàng</label>
              <textarea
                value={formData.ghiChu}
                onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                className="misa-input"
                rows={2}
                placeholder="Lưu ý về giờ giao, địa điểm..."
              />
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Thành tiền dự kiến</p>
                <p className="text-lg font-black text-[#0072bc]">
                   {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((formData.soSuatThucTe || 0) * (formData.donGia || 0))}
                </p>
             </div>
             <div className="flex space-x-3">
                <button type="button" onClick={onClose} className="misa-btn-secondary px-6">Hủy</button>
                <button type="submit" disabled={loading} className="misa-btn-primary px-10">
                   <Save className="w-4 h-4 mr-2 inline-block" />
                   {loading ? "Đang lưu..." : "LƯU ĐƠN HÀNG"}
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
