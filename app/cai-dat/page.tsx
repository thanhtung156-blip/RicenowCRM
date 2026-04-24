"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { 
  Settings, 
  Save, 
  Info, 
  ShieldCheck, 
  FileText, 
  Database,
  Layout,
  RefreshCw,
  Key,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "van_hanh" | "he_thong";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("van_hanh");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Business Settings State
  const [businessData, setBusinessData] = useState({
    bufferPercent: 10,
    tenDonVi: "",
    hotline: "",
    gioChotDon: "08:30",
    googleFormLink: "",
  });

  // System Setup State
  const [systemData, setSystemData] = useState({
    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",
    GOOGLE_SERVICE_ACCOUNT_EMAIL: "",
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: "",
    GOOGLE_SHEET_ID: "",
  });

  useEffect(() => {
    // Fetch both configs
    const fetchData = async () => {
      try {
        const [bizRes, sysRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/config")
        ]);
        const bizJson = await bizRes.json();
        const sysJson = await sysRes.json();
        
        if (bizJson.data) setBusinessData(bizJson.data);
        if (sysJson.data) setSystemData(sysJson.data);
      } catch (e) {
        console.error("Fetch settings error", e);
      }
    };
    fetchData();
  }, []);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessData),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Đã cập nhật cài đặt vận hành!");
      }
    } catch (e) {
      setStatus("error");
      setMessage("Lỗi khi lưu cài đặt");
    }
  };

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(systemData),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Đã lưu cấu hình hệ thống! Vui lòng khởi động lại app nếu cần.");
      }
    } catch (e) {
      setStatus("error");
      setMessage("Lỗi khi lưu cấu hình");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cài đặt hệ thống</h2>
            <p className="text-slate-500 mt-1">Quản lý tham số vận hành và cấu hình kết nối dữ liệu.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab("van_hanh")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2",
                activeTab === "van_hanh" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Layout className="w-4 h-4" />
              <span>Vận hành</span>
            </button>
            <button
              onClick={() => setActiveTab("he_thong")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2",
                activeTab === "he_thong" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Database className="w-4 h-4" />
              <span>Dữ liệu & API</span>
            </button>
          </div>
        </div>

        {status === "success" && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center animate-in fade-in slide-in-from-top-2">
            <ShieldCheck className="w-5 h-5 mr-3" />
            <span className="font-bold">{message}</span>
          </div>
        )}

        {status === "error" && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center animate-in fade-in slide-in-from-top-2">
            <Info className="w-5 h-5 mr-3" />
            <span className="font-bold">{message}</span>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          {activeTab === "van_hanh" ? (
            <form onSubmit={handleSaveBusiness} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tỉ lệ suất dự phòng (Buffer %)</label>
                  <div className="relative">
                    <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={businessData.bufferPercent}
                      onChange={(e) => setBusinessData({ ...businessData, bufferPercent: Number(e.target.value) })}
                      className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">Số suất nấu = Tổng báo * (1 + Buffer%)</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Giờ chốt đơn (HH:mm)</label>
                  <input
                    type="time"
                    value={businessData.gioChotDon}
                    onChange={(e) => setBusinessData({ ...businessData, gioChotDon: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tên đơn vị hiển thị</label>
                  <input
                    value={businessData.tenDonVi}
                    onChange={(e) => setBusinessData({ ...businessData, tenDonVi: e.target.value })}
                    placeholder="VD: Ricenow Kitchen"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Hotline liên hệ</label>
                  <input
                    value={businessData.hotline}
                    onChange={(e) => setBusinessData({ ...businessData, hotline: e.target.value })}
                    placeholder="09xx.xxx.xxx"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Link Google Form báo suất</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={businessData.googleFormLink}
                      onChange={(e) => setBusinessData({ ...businessData, googleFormLink: e.target.value })}
                      placeholder="https://forms.gle/..."
                      className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center space-x-3 active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>LƯU CÀI ĐẶT VẬN HÀNH</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveSystem} className="p-10 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start space-x-4">
                  <Info className="w-6 h-6 text-amber-600 mt-1" />
                  <div className="text-sm text-amber-800 leading-relaxed">
                    <p className="font-bold mb-1">Chế độ kết nối dữ liệu</p>
                    Hệ thống sẽ ưu tiên Google Sheets nếu cấu hình đầy đủ. Nếu để trống, dữ liệu sẽ được lưu tại <strong>data/local_db.json</strong> trong máy của bạn.
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-indigo-500" /> Google OAuth (Đăng nhập)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Client ID</label>
                      <input
                        value={systemData.GOOGLE_CLIENT_ID}
                        onChange={(e) => setSystemData({ ...systemData, GOOGLE_CLIENT_ID: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Client Secret</label>
                      <input
                        type="password"
                        value={systemData.GOOGLE_CLIENT_SECRET}
                        onChange={(e) => setSystemData({ ...systemData, GOOGLE_CLIENT_SECRET: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <Key className="w-4 h-4 mr-2 text-amber-500" /> Service Account & Sheets
                  </h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Service Account Email</label>
                    <input
                      value={systemData.GOOGLE_SERVICE_ACCOUNT_EMAIL}
                      onChange={(e) => setSystemData({ ...systemData, GOOGLE_SERVICE_ACCOUNT_EMAIL: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Private Key (JSON format)</label>
                    <textarea
                      rows={4}
                      value={systemData.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY}
                      onChange={(e) => setSystemData({ ...systemData, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Google Sheet ID</label>
                    <input
                      value={systemData.GOOGLE_SHEET_ID}
                      onChange={(e) => setSystemData({ ...systemData, GOOGLE_SHEET_ID: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-10 py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all flex items-center space-x-3 active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>KẾT NỐI GOOGLE CLOUD</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
