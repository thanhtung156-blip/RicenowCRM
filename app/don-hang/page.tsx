"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Filter,
  Save,
  Trash2,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { DonHang } from "@/lib/db";
import { BUOI, TRANG_THAI_DON } from "@/lib/constants";
import { formatVND, formatDate, formatISODate, cn } from "@/lib/utils";
import OrderForm from "@/components/OrderForm";

export default function OrdersPage() {
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(formatISODate(new Date()));
  const [selectedBuoi, setSelectedBuoi] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<DonHang | undefined>();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ngay: selectedDate,
        ...(selectedBuoi && { buoi: selectedBuoi })
      });
      const res = await fetch(`/api/don-hang?${query.toString()}`);
      const json = await res.json();
      if (json.data) setOrders(json.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedDate, selectedBuoi]);

  const filteredOrders = orders.filter(o => 
    o.tenKhachHang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateSuat = async (order: DonHang) => {
    try {
      const res = await fetch("/api/don-hang", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: order.id, 
          soSuatThucTe: editValue,
          ghiChu: `Cập nhật số suất từ ${order.soSuatThucTe} sang ${editValue}`
        }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/don-hang", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, trangThai: status }),
      });
      if (res.ok) fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Quản lý đơn hàng</h2>
            <p className="text-xs text-slate-500 mt-1">Theo dõi và điều chỉnh suất ăn hàng ngày.</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="misa-btn-secondary flex items-center text-xs">
              <Printer className="w-4 h-4 mr-1.5" />
              In danh sách
            </button>
            <button 
              onClick={() => { setCurrentOrder(undefined); setIsFormOpen(true); }}
              className="misa-btn-primary flex items-center text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tạo đơn mới
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="misa-card p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 border-r border-slate-200 pr-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Ngày giao:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 p-0"
            />
          </div>
          <div className="flex items-center space-x-2 border-r border-slate-200 pr-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Ca:</span>
            <select
              value={selectedBuoi}
              onChange={(e) => setSelectedBuoi(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 p-0 capitalize"
            >
              <option value="">Tất cả</option>
              {Object.values(BUOI).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="misa-input pl-10"
            />
          </div>
        </div>

        <div className="misa-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="misa-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th className="text-center">Số suất</th>
                  <th className="text-right">Thành tiền</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-xs text-slate-400 uppercase">Đang tải...</td></tr>
                ) : (
                  <>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="text-[10px] font-mono font-bold text-slate-400 uppercase">{order.id}</td>
                        <td>
                          <p className="font-bold text-slate-900">{order.tenKhachHang}</p>
                          <div className="flex items-center text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                            <span className={cn(
                              order.buoi === 'trua' ? "text-amber-600" : "text-indigo-600"
                            )}>{order.buoi}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          {editingId === order.id ? (
                            <div className="flex items-center justify-center space-x-1">
                              <input
                                type="number"
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(Number(e.target.value))}
                                className="w-16 p-1 bg-white border border-blue-400 rounded text-center text-sm font-black"
                              />
                              <button 
                                onClick={() => handleUpdateSuat(order)}
                                className="p-1 bg-[#0072bc] text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => { setEditingId(order.id); setEditValue(order.soSuatThucTe); }}
                              className="cursor-pointer group/cell inline-block"
                            >
                              <span className="text-lg font-black text-slate-900 hover:text-[#0072bc] transition-colors">
                                {order.soSuatThucTe}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="text-right font-bold">{formatVND(order.thanhTien)}</td>
                        <td className="text-center">
                          <div className="relative inline-block">
                            <select
                              value={order.trangThai}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              className={cn(
                                "px-2 py-1 rounded text-[10px] font-bold border outline-none transition-all appearance-none text-center pr-6 cursor-pointer uppercase tracking-tighter",
                                order.trangThai === 'cho_xac_nhan' ? "bg-slate-50 text-slate-600 border-slate-200" :
                                order.trangThai === 'da_xac_nhan' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                order.trangThai === 'hoan_thanh' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                "bg-rose-50 text-rose-700 border-rose-200"
                              )}
                            >
                              {Object.entries(TRANG_THAI_DON).map(([key, val]) => (
                                <option key={val} value={val}>{val.replace(/_/g, ' ').toUpperCase()}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button className="p-1.5 text-slate-400 hover:text-[#0072bc] hover:bg-blue-50 rounded">
                              <Printer className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {Array.from({ length: Math.max(0, 10 - filteredOrders.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} className="h-12">
                        <td className="border-b border-r border-slate-50"></td>
                        <td className="border-b border-r border-slate-50"></td>
                        <td className="border-b border-r border-slate-50"></td>
                        <td className="border-b border-r border-slate-50"></td>
                        <td className="border-b border-r border-slate-50"></td>
                        <td className="border-b border-r border-slate-50"></td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Summary Bar */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Tổng suất:</span>
            <span className="text-xl font-black text-[#0072bc]">{filteredOrders.reduce((acc, o) => acc + o.soSuatThucTe, 0)}</span>
          </div>
          <div className="flex items-center space-x-2 border-l border-slate-200 pl-6">
            <span className="text-xs font-bold text-slate-400 uppercase">Tổng tiền:</span>
            <span className="text-xl font-black text-slate-900">{formatVND(filteredOrders.reduce((acc, o) => acc + o.thanhTien, 0))}</span>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <OrderForm
          order={currentOrder}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchOrders}
        />
      )}
    </AppLayout>
  );
}
