"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import SummaryCard from "@/components/SummaryCard";
import { Users, ShoppingBag, TrendingUp, AlertCircle, ChefHat, LucideIcon } from "lucide-react";
import { formatVND, formatISODate, cn, formatDate } from "@/lib/utils";
import { BUOI } from "@/lib/constants";
import { DonHang, TongHopNgay, KhachHang, KeMon } from "@/lib/db";

interface StatItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "indigo" | "rose" | "emerald" | "blue" | "amber";
  description?: string;
  trend?: { value: string; isUp: boolean };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [customersMap, setCustomersMap] = useState<Record<string, KhachHang>>({});
  const [menu, setMenu] = useState<KeMon | null>(null);
  const [production, setProduction] = useState<TongHopNgay[]>([]);
  const [chotLoading, setChotLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatISODate(new Date()));
  const [selectedBuoi, setSelectedBuoi] = useState<string>(BUOI.TRUA);
  const [groupByParent, setGroupByParent] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderRes, summaryRes, custRes, menuRes] = await Promise.all([
        fetch(`/api/don-hang?ngay=${selectedDate}&buoi=${selectedBuoi}`),
        fetch(`/api/tong-hop?ngay=${selectedDate}&buoi=${selectedBuoi}`),
        fetch("/api/khach-hang"),
        fetch(`/api/ke-mon?ngay=${selectedDate}&buoi=${selectedBuoi}`)
      ]);

      const orderJson = await orderRes.json();
      const summaryJson = await summaryRes.json();
      const custJson = await custRes.json();
      const menuJson = await menuRes.json();

      const ordersData: DonHang[] = orderJson.data || [];
      const summary: TongHopNgay[] = summaryJson.data || [];
      const customersData: KhachHang[] = custJson.data || [];

      // Sort production summary by maMon (M1, M2... M10, MP)
      summary.sort((a,b) => {
        if (a.maMon.startsWith('M') && b.maMon.startsWith('M')) {
           const numA = parseInt(a.maMon.substring(1));
           const numB = parseInt(b.maMon.substring(1));
           if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        }
        return a.maMon.localeCompare(b.maMon);
      });

      const cmap: Record<string, KhachHang> = {};
      customersData.forEach(c => cmap[c.id] = c);

      setCustomersMap(cmap);
      setOrders(ordersData);
      setProduction(summary);
      setMenu(menuJson.data || null);

      const totalSuat = ordersData.reduce((acc, o) => acc + o.soSuatThucTe, 0);
      const finalRevenue = ordersData.reduce((acc, order) => acc + order.thanhTien + (cmap[order.khachHangID]?.phiShip || 0), 0);
      const custCount = new Set(ordersData.map(o => o.khachHangID)).size;
      const totalNau = summary.reduce((acc, s) => acc + s.soSuatNau, 0);

      const titleBuoi = selectedBuoi === BUOI.TRUA ? "ca Trưa" : selectedBuoi === BUOI.SANG ? "ca Sáng" : "ca Chiều";

      setStats([
        { title: "Tổng báo suất ăn", value: totalSuat, icon: ShoppingBag, color: "indigo", description: `Số liệu ${titleBuoi}` },
        { title: "Số suất nấu (Bếp)", value: totalNau > 0 ? totalNau : totalSuat, icon: ChefHat, color: "blue", description: totalNau > 0 ? "Sau tổng hợp" : "Chưa tổng hợp" },
        { title: "Doanh thu dự kiến", value: formatVND(finalRevenue), icon: TrendingUp, color: "emerald" },
        { title: "Khách hàng hôm nay", value: custCount, icon: Users, color: "blue", description: `Có đơn ${titleBuoi}` },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedBuoi]);

  const handleChotDon = async () => {
    setChotLoading(true);
    try {
      const res = await fetch("/api/tong-hop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ngay: selectedDate, buoi: selectedBuoi }),
      });
      if (res.ok) {
        alert("Đã tổng hợp số suất ăn theo món!");
        fetchData();
      }
    } catch (error) {
      alert("Lỗi khi tổng hợp");
      console.error(error);
    } finally {
      setChotLoading(false);
    }
  };

  const handleUpdateDuTru = async (item: TongHopNgay, duTruStr: string) => {
    const duTru = Number(duTruStr);
    const newNau = item.soSuatBao + duTru;
    if (newNau === item.soSuatNau) return;
    
    if (!window.confirm(`Xác nhận cập nhật dự trù thêm cho món [${item.maMon}] thành ${duTru} suất? (Số nấu sẽ là ${newNau})`)) {
      fetchData();
      return;
    }

    try {
      const res = await fetch("/api/tong-hop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, soSuatNau: newNau, soSuatCon: newNau - item.soSuatBao }),
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateChiTiet = async (order: DonHang, mField: string, valStr: string) => {
    const newVal = Number(valStr);
    if (newVal < 0) { fetchData(); return; }
    const chiTiet = getChiTiet(order.chiTietMon);
    const oldVal = Number(chiTiet[mField] || 0);
    if (newVal === oldVal) return;

    if (!window.confirm(`Xác nhận cập nhật số lượng ${mField} của đơn [${order.tenKhachHang}] thành ${newVal}?`)) {
      fetchData();
      return;
    }

    const newChiTiet = { ...chiTiet, [mField]: newVal };
    const newTong = Object.values(newChiTiet).reduce((sum: number, val) => sum + Number(val || 0), 0);
    
    try {
      const res = await fetch("/api/don-hang", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          chiTietMon: JSON.stringify(newChiTiet),
          soSuatThucTe: newTong
        }),
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const getChiTiet = (jsonStr: string) => {
    try { return JSON.parse(jsonStr); } catch { return {}; }
  };

  const defaultShipTime = selectedBuoi === BUOI.SANG ? '06:30' : selectedBuoi === BUOI.TRUA ? '11:30' : '17:30';
  const tenCa = selectedBuoi === BUOI.SANG ? "Ca Sáng" : selectedBuoi === BUOI.TRUA ? "Ca Trưa" : "Ca Chiều";

  const mergeChiTiet = (target: Record<string, number>, source: Record<string, number>) => {
    const next = { ...target };
    Object.entries(source).forEach(([key, value]) => {
      next[key] = (next[key] || 0) + Number(value || 0);
    });
    return next;
  };

  const groupedOrders = Object.values(
    orders.reduce<Record<string, {
      rowId: string;
      groupName: string;
      customerId: string;
      shipTime: string;
      phanLoai: string;
      ghiChu: string;
      diKem: string;
      diaChi: string;
      soDienThoai: string;
      loaiKhay: string;
      donGia: number;
      phiShip: number;
      soSuatThucTe: number;
      thanhTien: number;
      chiTiet: Record<string, number>;
      originalOrder?: DonHang;
    }>>((acc, order) => {
      const cust = customersMap[order.khachHangID];
      const groupKey = (cust?.nhomKhachHang || "").trim() || order.khachHangID;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          rowId: `group-${groupKey}`,
          groupName: (cust?.nhomKhachHang || "").trim() || order.tenKhachHang,
          customerId: order.khachHangID,
          shipTime: cust?.thoiGianShip || defaultShipTime,
          phanLoai: cust?.phanLoai || "",
          ghiChu: order.ghiChu || cust?.ghiChu || "",
          diKem: cust?.diKem || "",
          diaChi: cust?.diaChi || "",
          soDienThoai: cust?.soDienThoai || "",
          loaiKhay: cust?.loaiKhay || "",
          donGia: 0,
          phiShip: 0,
          soSuatThucTe: 0,
          thanhTien: 0,
          chiTiet: {},
          originalOrder: undefined,
        };
      }
      acc[groupKey].soSuatThucTe += order.soSuatThucTe;
      acc[groupKey].thanhTien += order.thanhTien;
      acc[groupKey].phiShip += cust?.phiShip || 0;
      acc[groupKey].donGia = acc[groupKey].soSuatThucTe > 0
        ? Math.round(acc[groupKey].thanhTien / acc[groupKey].soSuatThucTe)
        : 0;
      acc[groupKey].chiTiet = mergeChiTiet(acc[groupKey].chiTiet, getChiTiet(order.chiTietMon));
      return acc;
    }, {})
  );

  const sortRows = <T extends { shipTime: string; groupName: string }>(rows: T[]) =>
    [...rows].sort((a, b) => a.shipTime.localeCompare(b.shipTime) || a.groupName.localeCompare(b.groupName));

  const displayRows = sortRows(groupByParent
    ? groupedOrders
    : orders.map((order) => {
        const cust = customersMap[order.khachHangID] || {} as Partial<KhachHang>;
        return {
          rowId: `${order.id}-${order.khachHangID}-${order.ngayGiao}-${order.buoi}`,
          groupName: order.tenKhachHang,
          customerId: order.khachHangID,
          shipTime: cust.thoiGianShip || defaultShipTime,
          phanLoai: cust.phanLoai || "",
          ghiChu: order.ghiChu || cust.ghiChu || "",
          diKem: cust.diKem || "",
          diaChi: cust.diaChi || "",
          soDienThoai: cust.soDienThoai || "",
          loaiKhay: cust.loaiKhay || "",
          donGia: order.donGia,
          phiShip: cust.phiShip || 0,
          soSuatThucTe: order.soSuatThucTe,
          thanhTien: order.thanhTien,
          chiTiet: getChiTiet(order.chiTietMon),
          originalOrder: order,
        };
      }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Trang Chủ</h2>
            <p className="text-xs text-slate-500 mt-1">Tổng hợp báo cáo và điều phối sản xuất bếp.</p>
          </div>
          <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200">
            {[BUOI.SANG, BUOI.TRUA, BUOI.CHIEU].map(b => (
              <button
                key={b}
                onClick={() => setSelectedBuoi(b)}
                className={cn(
                  "px-4 py-1.5 rounded text-xs font-bold capitalize transition-colors",
                  selectedBuoi === b ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {b === BUOI.SANG ? "Ca Sáng" : b === BUOI.TRUA ? "Ca Trưa" : "Ca Chiều"}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="misa-input text-xs font-bold w-40"
            />
            <button
              onClick={handleChotDon}
              disabled={chotLoading}
              className="misa-btn-primary text-xs flex items-center whitespace-nowrap"
            >
              {chotLoading ? "Đang xử lý..." : "Tổng hợp báo suất"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <SummaryCard key={i} {...stat} />
          ))}
        </div>
        {/* Menu Row */}
        {menu && (
          <div className="misa-card p-5 bg-indigo-50/50 border border-indigo-100">
            <h3 className="text-base font-black text-indigo-800 mb-3 uppercase tracking-wide">Thực đơn {tenCa} — {formatDate(selectedDate)}</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {menu.mon1 && <div><span className="font-black text-slate-800">M1:</span> <span className="text-slate-700">{menu.mon1}</span></div>}
              {menu.mon2 && <div><span className="font-black text-slate-800">M2:</span> <span className="text-slate-700">{menu.mon2}</span></div>}
              {menu.mon3 && <div><span className="font-black text-slate-800">M3:</span> <span className="text-slate-700">{menu.mon3}</span></div>}
              {menu.mon4 && <div><span className="font-black text-slate-800">M4:</span> <span className="text-slate-700">{menu.mon4}</span></div>}
              {menu.mon5 && <div><span className="font-black text-slate-800">M5:</span> <span className="text-slate-700">{menu.mon5}</span></div>}
              {menu.monPhu && <div><span className="font-black text-slate-800">Món phụ:</span> <span className="text-slate-700">{menu.monPhu}</span></div>}
            </div>
          </div>
        )}

        {/* Detailed Kế hoạch nấu bếp Table */}
        <div className="misa-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Kế hoạch nấu bếp chi tiết ({tenCa})</h3>
            <button
              onClick={() => setGroupByParent((prev) => !prev)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-bold transition-colors border",
                groupByParent ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              Gộp công ty mẹ
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="misa-table min-w-max text-[11px] whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border-r border-slate-200">Ship</th>
                  <th className="border-r border-slate-200">Tên Khách hàng</th>
                  <th className="border-r border-slate-200">Phân loại</th>
                  <th className="text-center border-r border-slate-200 w-12">M1</th>
                  <th className="text-center border-r border-slate-200 w-12">M2</th>
                  <th className="text-center border-r border-slate-200 w-12">M3</th>
                  <th className="text-center border-r border-slate-200 w-12">M4</th>
                  <th className="text-center border-r border-slate-200 w-12">M5</th>
                  <th className="text-center border-r border-slate-200 w-12">M6</th>
                  <th className="text-center border-r border-slate-200 w-12">M7</th>
                  <th className="text-center border-r border-slate-200 bg-indigo-50">Tổng</th>
                  <th className="border-r border-slate-200">Ghi chú</th>
                  <th className="border-r border-slate-200">Đi kèm</th>
                  <th className="border-r border-slate-200">Địa chỉ</th>
                  <th className="border-r border-slate-200">SĐT</th>
                  <th className="border-r border-slate-200">Loại khay</th>
                  <th className="text-right border-r border-slate-200">Đơn giá</th>
                  <th className="text-right border-r border-slate-200">Phí ship</th>
                  <th className="text-right bg-emerald-50">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={19} className="text-center py-8 text-slate-400 text-xs">Đang tải dữ liệu...</td>
                  </tr>
                )}
                {!loading && displayRows.length === 0 && (
                  <tr>
                    <td colSpan={19} className="text-center py-8 text-slate-400 text-xs">Không có đơn hàng nào trong {tenCa} ngày {formatDate(selectedDate)}</td>
                  </tr>
                )}
                {!loading && displayRows.map((row, rowIndex) => {
                  const tongSuat = row.soSuatThucTe;
                  const thanhTien = row.thanhTien + row.phiShip;

                  return (
                    <tr key={`${row.rowId}-${rowIndex}`} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="font-bold border-r border-slate-100 text-indigo-600">{row.shipTime}</td>
                      <td className="font-bold border-r border-slate-100">{row.groupName}</td>
                      <td className="border-r border-slate-100"><span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] uppercase">{row.phanLoai}</span></td>
                      <td className="text-center border-r border-slate-100 p-0">
                        {groupByParent ? <span className="block py-1 font-bold text-slate-700">{row.chiTiet.M1 || ""}</span> : <input key={`${row.rowId}-M1-${row.chiTiet.M1}`} type="number" defaultValue={row.chiTiet.M1 || ''} onBlur={(e) => row.originalOrder && handleUpdateChiTiet(row.originalOrder, 'M1', e.target.value)} min="0" className="w-full text-center bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-500 py-1 font-bold text-slate-700 outline-none" />}
                      </td>
                      <td className="text-center border-r border-slate-100 p-0">
                        {groupByParent ? <span className="block py-1 font-bold text-slate-700">{row.chiTiet.M2 || ""}</span> : <input key={`${row.rowId}-M2-${row.chiTiet.M2}`} type="number" defaultValue={row.chiTiet.M2 || ''} onBlur={(e) => row.originalOrder && handleUpdateChiTiet(row.originalOrder, 'M2', e.target.value)} min="0" className="w-full text-center bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-500 py-1 font-bold text-slate-700 outline-none" />}
                      </td>
                      <td className="text-center border-r border-slate-100 p-0">
                        {groupByParent ? <span className="block py-1 font-bold text-slate-700">{row.chiTiet.M3 || ""}</span> : <input key={`${row.rowId}-M3-${row.chiTiet.M3}`} type="number" defaultValue={row.chiTiet.M3 || ''} onBlur={(e) => row.originalOrder && handleUpdateChiTiet(row.originalOrder, 'M3', e.target.value)} min="0" className="w-full text-center bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-500 py-1 font-bold text-slate-700 outline-none" />}
                      </td>
                      <td className="text-center border-r border-slate-100 p-0">
                        {groupByParent ? <span className="block py-1 font-bold text-slate-700">{row.chiTiet.M4 || ""}</span> : <input key={`${row.rowId}-M4-${row.chiTiet.M4}`} type="number" defaultValue={row.chiTiet.M4 || ''} onBlur={(e) => row.originalOrder && handleUpdateChiTiet(row.originalOrder, 'M4', e.target.value)} min="0" className="w-full text-center bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-500 py-1 font-bold text-slate-700 outline-none" />}
                      </td>
                      <td className="text-center border-r border-slate-100 p-0">
                        {groupByParent ? <span className="block py-1 font-bold text-slate-700">{row.chiTiet.M5 || ""}</span> : <input key={`${row.rowId}-M5-${row.chiTiet.M5}`} type="number" defaultValue={row.chiTiet.M5 || ''} onBlur={(e) => row.originalOrder && handleUpdateChiTiet(row.originalOrder, 'M5', e.target.value)} min="0" className="w-full text-center bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-500 py-1 font-bold text-slate-700 outline-none" />}
                      </td>
                      <td className="text-center border-r border-slate-100 p-0">
                        {groupByParent ? <span className="block py-1 font-bold text-slate-700">{row.chiTiet.M6 || ""}</span> : <input key={`${row.rowId}-M6-${row.chiTiet.M6}`} type="number" defaultValue={row.chiTiet.M6 || ''} onBlur={(e) => row.originalOrder && handleUpdateChiTiet(row.originalOrder, 'M6', e.target.value)} min="0" className="w-full text-center bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-500 py-1 font-bold text-slate-700 outline-none" />}
                      </td>
                      <td className="text-center border-r border-slate-100 p-0">
                        {groupByParent ? <span className="block py-1 font-bold text-slate-700">{row.chiTiet.M7 || ""}</span> : <input key={`${row.rowId}-M7-${row.chiTiet.M7}`} type="number" defaultValue={row.chiTiet.M7 || ''} onBlur={(e) => row.originalOrder && handleUpdateChiTiet(row.originalOrder, 'M7', e.target.value)} min="0" className="w-full text-center bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-500 py-1 font-bold text-slate-700 outline-none" />}
                      </td>
                      <td className="text-center font-black text-indigo-700 border-r border-slate-100 bg-indigo-50/50">{tongSuat}</td>
                      <td className="border-r border-slate-100 max-w-[150px] truncate" title={row.ghiChu}>{row.ghiChu}</td>
                      <td className="border-r border-slate-100 text-rose-600 font-medium">{row.diKem}</td>
                      <td className="border-r border-slate-100 max-w-[150px] truncate" title={row.diaChi}>{row.diaChi}</td>
                      <td className="border-r border-slate-100">{row.soDienThoai}</td>
                      <td className="border-r border-slate-100">{row.loaiKhay}</td>
                      <td className="text-right border-r border-slate-100">{formatVND(row.donGia)}</td>
                      <td className="text-right border-r border-slate-100">{formatVND(row.phiShip)}</td>
                      <td className="text-right font-bold text-emerald-700 bg-emerald-50/50">{formatVND(thanhTien)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-100 font-black text-slate-800">
                  <td colSpan={3} className="text-right border-r border-slate-200">TỔNG CỘNG:</td>
                  <td className="text-center border-r border-slate-200">{displayRows.reduce((acc, o) => acc + (o.chiTiet.M1 || 0), 0) || ''}</td>
                  <td className="text-center border-r border-slate-200">{displayRows.reduce((acc, o) => acc + (o.chiTiet.M2 || 0), 0) || ''}</td>
                  <td className="text-center border-r border-slate-200">{displayRows.reduce((acc, o) => acc + (o.chiTiet.M3 || 0), 0) || ''}</td>
                  <td className="text-center border-r border-slate-200">{displayRows.reduce((acc, o) => acc + (o.chiTiet.M4 || 0), 0) || ''}</td>
                  <td className="text-center border-r border-slate-200">{displayRows.reduce((acc, o) => acc + (o.chiTiet.M5 || 0), 0) || ''}</td>
                  <td className="text-center border-r border-slate-200">{displayRows.reduce((acc, o) => acc + (o.chiTiet.M6 || 0), 0) || ''}</td>
                  <td className="text-center border-r border-slate-200">{displayRows.reduce((acc, o) => acc + (o.chiTiet.M7 || 0), 0) || ''}</td>
                  <td className="text-center border-r border-slate-200 bg-indigo-100 text-indigo-700">{displayRows.reduce((acc, o) => acc + o.soSuatThucTe, 0)}</td>
                  <td colSpan={6} className="border-r border-slate-200"></td>
                  <td className="text-right border-r border-slate-200">{formatVND(displayRows.reduce((acc, o) => acc + o.phiShip, 0))}</td>
                  <td className="text-right bg-emerald-100 text-emerald-700">{formatVND(displayRows.reduce((acc, o) => acc + o.thanhTien + o.phiShip, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tổng hợp số lượng nấu Bếp */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="misa-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tổng hợp số lượng nấu Bếp ({tenCa})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="misa-table">
                  <thead>
                    <tr>
                      <th className="w-20">Mã món</th>
                      <th>Tên món ăn</th>
                      <th className="text-center">Số báo (Cust)</th>
                      <th className="text-center w-32">Dự trù thêm (+)</th>
                      <th className="text-center w-32">Số nấu (Bếp)</th>
                      <th className="text-center">Dư/Thiếu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {production.map((item, itemIndex) => {
                      const duTru = item.soSuatNau - item.soSuatBao;
                      return (
                        <tr key={`${item.ngay}-${item.buoi}-${item.maMon}-${itemIndex}`} className="hover:bg-slate-50 transition-colors">
                          <td className="font-mono text-[10px] font-bold text-slate-400">{item.maMon}</td>
                          <td className="font-bold text-slate-900">{item.tenMon}</td>
                          <td className="text-center font-bold text-slate-600">{item.soSuatBao}</td>
                          <td className="text-center">
                            <input
                              type="number"
                              defaultValue={duTru}
                              onBlur={(e) => handleUpdateDuTru(item, e.target.value)}
                              className="w-20 p-1 text-center bg-blue-50 border border-blue-100 rounded text-sm font-black text-[#0072bc] focus:ring-1 focus:ring-[#0072bc] outline-none"
                            />
                          </td>
                          <td className="text-center font-black text-indigo-700 bg-indigo-50/30">
                            {item.soSuatNau}
                          </td>
                          <td className="text-center border-r-0">
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded",
                              item.soSuatCon > 0 ? "text-emerald-600 bg-emerald-50" :
                              item.soSuatCon < 0 ? "text-rose-600 bg-rose-50" : "text-slate-400 bg-slate-50"
                            )}>
                              {item.soSuatCon > 0 ? `+${item.soSuatCon}` : item.soSuatCon}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="misa-card p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-[#0072bc]" />
                Lưu ý cho Bếp
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-1">Món phụ (Rau/Canh)</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Tổng số suất món phụ được tính tự động dựa trên tổng các món chính. Các đơn ăn Bún/Bánh mì đã được loại trừ khỏi danh sách này.
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs font-bold text-amber-800 mb-1">Cập nhật linh hoạt</p>
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    Bếp có thể chỉnh sửa cột "Dự trù thêm" để tăng/giảm số suất nấu. Hệ thống sẽ tự động tính toán tổng Số nấu và Dư/Thiếu. Mọi thay đổi đều được lưu lại.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
