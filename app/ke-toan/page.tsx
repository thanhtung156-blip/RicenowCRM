"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { 
  Calculator, 
  Search, 
  Filter, 
  DollarSign, 
  CreditCard, 
  Banknote,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
  MoreVertical,
  History
} from "lucide-react";
import { formatVND, formatDate, cn } from "@/lib/utils";
import { KhachHang, ThanhToan } from "@/lib/db";

export default function AccountingPage() {
  const [customers, setCustomers] = useState<KhachHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [payments, setPayments] = useState<ThanhToan[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [custRes, payRes] = await Promise.all([
          fetch("/api/khach-hang"),
          fetch(`/api/thanh-toan${selectedCustomer ? `?khachHangId=${selectedCustomer}` : ''}`)
        ]);
        const custJson = await custRes.json();
        const payJson = await payRes.json();
        if (custJson.data) setCustomers(custJson.data);
        if (payJson.data) setPayments(payJson.data);
      } catch (error) {
        console.error("Error fetching accounting data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCustomer]);

  const filteredCustomers = customers.filter(c => 
    c.tenCongTy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDebt = payments.reduce((acc, p) => acc + p.conNo, 0);
  const totalPaid = payments.reduce((acc, p) => acc + p.soTienDaThanhToan, 0);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kế toán & Công nợ</h2>
            <p className="text-slate-500 mt-1">Theo dõi thanh toán, quản lý công nợ và báo cáo tài chính.</p>
          </div>
          <button className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95">
            <Plus className="w-5 h-5 mr-2" />
            Ghi nhận thanh toán
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <ArrowUpRight className="w-6 h-6 text-rose-600" />
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tổng công nợ</p>
            </div>
            <h3 className="text-4xl font-black text-slate-900">{formatVND(totalDebt)}</h3>
            <p className="text-xs text-rose-500 font-bold mt-2 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" /> Cần thu hồi từ {customers.length} khách hàng
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Đã thu kỳ này</p>
            </div>
            <h3 className="text-4xl font-black text-slate-900">{formatVND(totalPaid)}</h3>
            <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành 85% mục tiêu
            </p>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <History className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Kỳ báo cáo</p>
            </div>
            <h3 className="text-3xl font-black">Tháng 12 / 2024</h3>
            <div className="mt-4 flex items-center space-x-2">
               <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">Thay đổi kỳ</button>
               <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">Xuất báo cáo</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer List */}
          <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900 uppercase">Khách hàng</h3>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-50">
              <button
                onClick={() => setSelectedCustomer("")}
                className={cn(
                  "w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors",
                  selectedCustomer === "" ? "bg-indigo-50 border-r-4 border-indigo-600" : ""
                )}
              >
                <span className="font-bold text-slate-700">Tất cả khách hàng</span>
                <span className="text-xs font-bold text-slate-400">{customers.length}</span>
              </button>
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomer(c.id)}
                  className={cn(
                    "w-full p-6 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group",
                    selectedCustomer === c.id ? "bg-indigo-50 border-r-4 border-indigo-600" : ""
                  )}
                >
                  <div>
                    <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{c.tenCongTy}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-wider">{c.id}</p>
                  </div>
                  <ChevronRight className={cn("w-5 h-5 text-slate-300 transition-transform", selectedCustomer === c.id ? "translate-x-1 text-indigo-600" : "")} />
                </button>
              ))}
            </div>
          </div>

          {/* Transactions / History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">Lịch sử thanh toán & Phát sinh</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {selectedCustomer ? `Chi tiết: ${customers.find(c => c.id === selectedCustomer)?.tenCongTy}` : "Dữ liệu toàn hệ thống"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                   <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                     <Filter className="w-5 h-5 text-slate-400" />
                   </button>
                </div>
              </div>

              <div className="overflow-x-auto p-4 bg-white">
                <table className="misa-table rounded-xl overflow-hidden border-r border-b">
                  <thead>
                    <tr>
                      <th className="w-32">Ngày/Kỳ</th>
                      <th>Khách hàng</th>
                      <th className="text-right">Phát sinh</th>
                      <th className="text-right">Đã trả</th>
                      <th className="text-right">Còn nợ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="py-10 text-center text-xs text-slate-400 uppercase">Đang tải...</td></tr>
                    ) : (
                      <>
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                            <td>
                              <p className="font-black text-slate-900">{p.kyThanhToan}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{p.id}</p>
                            </td>
                            <td>
                               <p className="text-sm font-bold text-slate-600">{p.tenKhachHang}</p>
                            </td>
                            <td className="text-right font-bold text-slate-900">
                              {formatVND(p.tongTienPhatSinh)}
                            </td>
                            <td className="text-right">
                              <p className="font-bold text-emerald-600">+{formatVND(p.soTienDaThanhToan)}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{p.hinhThuc.replace(/_/g, ' ')}</p>
                            </td>
                            <td className="text-right border-r-0">
                              <span className={cn(
                                "inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter",
                                p.conNo > 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                              )}>
                                {p.conNo > 0 ? formatVND(p.conNo) : "ĐÃ XONG"}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {Array.from({ length: Math.max(0, 8 - payments.length) }).map((_, i) => (
                          <tr key={`empty-${i}`} className="h-16">
                            <td className="border-b border-r border-slate-50"></td>
                            <td className="border-b border-r border-slate-50"></td>
                            <td className="border-b border-r border-slate-50"></td>
                            <td className="border-b border-r border-slate-50"></td>
                            <td className="border-b border-slate-50"></td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2} />
      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2} />
    </svg>
  );
}
