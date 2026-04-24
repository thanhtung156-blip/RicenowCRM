"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Save, ChefHat, ChevronLeft, ChevronRight, User, Plus, Info } from "lucide-react";
import { formatISODate, formatDate, cn } from "@/lib/utils";
import { BUOI, Buoi } from "@/lib/constants";
import { KeMon } from "@/lib/db";

type MonKey = "mon1" | "mon2" | "mon3" | "mon4" | "mon5";

const emptyMenu = (ngay: string, buoi: string): KeMon => ({
  ngay, buoi, mon1: "", mon2: "", mon3: "", mon4: "", mon5: "",
  monPhu: "", ghiChu: "", khachHangID: "",
});

export default function MenuPage() {
  const [selectedDate, setSelectedDate] = useState(formatISODate(new Date()));
  const [selectedBuoi, setSelectedBuoi] = useState<Buoi>(BUOI.TRUA);
  const [menu, setMenu] = useState<KeMon>(emptyMenu(formatISODate(new Date()), BUOI.TRUA));

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/ke-mon?ngay=${selectedDate}&buoi=${selectedBuoi}`);
      const json = await res.json();
      if (json.data) setMenu(json.data);
      else setMenu(emptyMenu(selectedDate, selectedBuoi));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedBuoi]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, data: KeMon) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/ke-mon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) alert("Đã lưu thực đơn!");
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const shiftDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(formatISODate(date));
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Lên thực đơn</h2>
            <p className="text-xs text-slate-500 mt-1">Quản lý thực đơn chung và thực đơn riêng cho khách hàng.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded border border-slate-200">
            {Object.values(BUOI).filter(b => b !== 'trai_cay').map(b => (
              <button
                key={b}
                onClick={() => setSelectedBuoi(b as Buoi)}
                className={cn(
                  "px-4 py-1.5 rounded text-xs font-bold transition-all uppercase",
                  selectedBuoi === b ? "bg-white text-[#0072bc] shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="misa-card p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4 bg-slate-50 p-2 rounded">
                <button onClick={() => shiftDate(-1)} className="p-1.5 hover:bg-white rounded transition-all"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                <p className="text-sm font-bold text-slate-900">{formatDate(selectedDate)}</p>
                <button onClick={() => shiftDate(1)} className="p-1.5 hover:bg-white rounded transition-all"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
              </div>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="misa-input text-center font-bold mb-4" />

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-2 flex items-center">
                  <Info className="w-3 h-3 mr-1" /> Ghi chú nghiệp vụ
                </h4>
                <p className="text-[10px] text-blue-700 leading-relaxed italic">
                  Món 1-5 sẽ được dùng để gộp số liệu cho Bếp. Thực đơn riêng sẽ ghi đè thực đơn chung cho khách hàng được chọn.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <form onSubmit={(e) => handleSave(e, menu)} className="misa-card overflow-hidden border-t-4 border-t-[#0072bc]">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ChefHat className="w-5 h-5 text-[#0072bc]" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thực đơn chung (General Menu)</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {([1, 2, 3, 4, 5] as const).map(i => (
                    <div key={i} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Món chính M{i}</label>
                      <input
                        value={menu[`mon${i}` as MonKey]}
                        onChange={(e) => setMenu({ ...menu, [`mon${i}`]: e.target.value })}
                        placeholder={`VD: Món ${i} của ngày`}
                        className="misa-input font-medium"
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Món phụ (Rau/Canh)</label>
                    <input
                      value={menu.monPhu}
                      onChange={(e) => setMenu({ ...menu, monPhu: e.target.value })}
                      className="misa-input"
                    />
                  </div>
                </div>
                <div className="space-y-1 pt-4 border-t border-slate-50">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ghi chú chung cho Bếp</label>
                  <textarea
                    rows={2}
                    value={menu.ghiChu}
                    onChange={(e) => setMenu({ ...menu, ghiChu: e.target.value })}
                    className="misa-input"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
                <button type="submit" className="misa-btn-primary px-8">
                  <Save className="w-4 h-4 mr-2 inline-block" />
                  LƯU THỰC ĐƠN CHUNG
                </button>
              </div>
            </form>

            <div className="misa-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thực đơn riêng cho khách hàng</h3>
                </div>
                <button className="misa-btn-secondary text-[10px] py-1">
                  <Plus className="w-3 h-3 mr-1" /> Thêm thực đơn riêng
                </button>
              </div>
              <div className="p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium italic">Chưa có thực đơn riêng nào cho ngày này.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
