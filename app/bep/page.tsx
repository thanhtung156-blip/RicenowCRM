"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import ThermalLabel from "@/components/ThermalLabel";
import { 
  Printer, 
  CheckCircle2,
  Clock,
  ChefHat,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { BUOI, Buoi } from "@/lib/constants";
import { formatISODate, formatDate, cn } from "@/lib/utils";
import { DonHang, KeMon, TongHopNgay } from "@/lib/db";

export default function BepPage() {
  const [selectedDate, setSelectedDate] = useState(formatISODate(new Date()));
  const [selectedBuoi, setSelectedBuoi] = useState<Buoi>(BUOI.TRUA);
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [menu, setMenu] = useState<KeMon | null>(null);
  const [summary, setSummary] = useState<TongHopNgay[]>([]);
  const [loading, setLoading] = useState(true);
  const [printingOrder, setPrintingOrder] = useState<DonHang | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderRes, menuRes, summaryRes] = await Promise.all([
        fetch(`/api/don-hang?ngay=${selectedDate}&buoi=${selectedBuoi}`),
        fetch(`/api/ke-mon?ngay=${selectedDate}&buoi=${selectedBuoi}`),
        fetch(`/api/tong-hop?ngay=${selectedDate}&buoi=${selectedBuoi}`)
      ]);
      
      const orderJson = await orderRes.json();
      const menuJson = await menuRes.json();
      const summaryJson = await summaryRes.json();
      
      if (orderJson.data) setOrders(orderJson.data);
      if (menuJson.data) setMenu(menuJson.data);
      if (summaryJson.data) setSummary(summaryJson.data);
    } catch (error) {
      console.error("Error fetching kitchen data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedBuoi]);

  const handlePrint = (order: DonHang) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
      setPrintingOrder(null);
    }, 100);
  };

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch("/api/don-hang", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, trangThai: "hoan_thanh" }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error completing order:", error);
    }
  };

  const shiftDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(formatISODate(date));
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-20">
        {/* Hidden area for printing */}
        <div className="hidden print:block">
          {printingOrder && (
            <ThermalLabel
              donHang={printingOrder}
              menuItems={menu ? [menu.mon1, menu.mon2, menu.mon3, menu.mon4, menu.mon5, menu.monPhu].filter(Boolean) : []}
            />
          )}
        </div>

        <div className="print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mr-6 shadow-sm">
                <ChefHat className="w-10 h-10 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Màn hình Bếp</h2>
                <div className="flex items-center text-slate-500 mt-1 text-lg font-medium space-x-4">
                  <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3 py-1">
                    <button onClick={() => shiftDate(-1)} className="p-1"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="mx-4 font-black">{formatDate(selectedDate)}</span>
                    <button onClick={() => shiftDate(1)} className="p-1"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {Object.values(BUOI).filter(b => b !== 'trai_cay').map(b => (
                      <button
                        key={b}
                        onClick={() => setSelectedBuoi(b as Buoi)}
                        className={cn(
                          "px-4 py-1 rounded-lg text-sm font-bold uppercase",
                          selectedBuoi === b ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <button className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all active:scale-95 group">
              <Printer className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              IN TẤT CẢ NHÃN
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl flex flex-col items-center text-center">
              <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Tổng suất chốt</p>
              <h3 className="text-4xl leading-none font-black text-slate-900">
                {summary.length > 0
                  ? summary.reduce((acc, s) => acc + s.soSuatBao, 0)
                  : orders.reduce((acc, o) => acc + o.soSuatThucTe, 0)}
              </h3>
            </div>
            <div className={cn(
              "p-6 rounded-2xl shadow-xl flex flex-col items-center text-center text-white relative overflow-hidden transition-colors",
              summary.length > 0 ? "bg-indigo-600" : "bg-slate-400"
            )}>
              <p className="text-sm font-bold text-indigo-100 mb-2 uppercase tracking-widest relative z-10">Số suất nấu (+Buffer)</p>
              <h3 className="text-4xl leading-none font-black relative z-10">
                {summary.length > 0 ? summary.reduce((acc, s) => acc + s.soSuatNau, 0) : "-"}
              </h3>
              <div className="mt-2 px-3 py-1 bg-white/20 rounded-lg text-sm font-black relative z-10 uppercase">
                {summary.length > 0 ? "Đã chốt buffer" : "Chưa chốt"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 uppercase">Danh sách đơn hàng</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{orders.length} đơn vị</span>
            </div>
            <div className="divide-y-4 divide-slate-50">
              {loading ? (
                <div className="p-20 text-center text-slate-400 font-bold uppercase">Đang tải dữ liệu...</div>
              ) : orders.length === 0 ? (
                <div className="p-20 text-center text-slate-400 font-bold uppercase">Không có đơn hàng cho ca này</div>
              ) : orders.map((order) => (
                <div key={order.id} className={cn("p-5 flex items-center justify-between hover:bg-slate-50/30 transition-colors", order.trangThai === 'hoan_thanh' && "bg-emerald-50/50")}>
                  <div className="flex-1 pr-8">
                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">{order.tenKhachHang}</h4>
                    <div className="flex items-center space-x-6">
                      <span className="flex items-center text-slate-500 font-bold text-sm uppercase tracking-tight">
                        <Clock className="w-5 h-5 mr-2" />
                        Giao: {order.buoi === 'trua' ? '11:30' : '17:30'}
                      </span>
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-xs font-black uppercase",
                        order.trangThai === 'hoan_thanh' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        {order.trangThai.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className={cn(
                        "text-3xl font-black leading-none",
                        order.trangThai === 'hoan_thanh' ? "text-emerald-500" : "text-indigo-600"
                      )}>{order.soSuatThucTe}</p>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">suất</p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handlePrint(order)}
                        className="p-3 bg-slate-100 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg transition-all active:scale-90 shadow-sm"
                      >
                        <Printer className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => handleComplete(order.id)}
                        className={cn(
                          "p-3 rounded-lg transition-all active:scale-90 shadow-sm",
                          order.trangThai === 'hoan_thanh' ? "bg-emerald-500 text-white" : "bg-slate-100 hover:bg-emerald-500 text-slate-400 hover:text-white"
                        )}
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
