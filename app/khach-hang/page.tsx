"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import CustomerForm from "@/components/CustomerForm";
import { Plus, Search, Edit2, Filter, Settings2, ArrowUpDown, Archive } from "lucide-react";
import { DonHang, KhachHang } from "@/lib/db";
import { formatVND, cn } from "@/lib/utils";
import { BUOI_LABELS, LOAI_HOP_DONG_LABELS } from "@/lib/constants";

type CustomerColumn =
  | "maKh"
  | "tenKh"
  | "nhomKhachHang"
  | "nguoiLienHe"
  | "soDienThoai"
  | "diaChi"
  | "loaiHopDong"
  | "ngaySuKien"
  | "caMacDinh"
  | "thoiGianShip"
  | "phiShip"
  | "phanLoai"
  | "diKem"
  | "loaiKhay"
  | "ghiChu"
  | "donGia"
  | "trangThai"
  | "thaoTac";

const DEFAULT_VISIBLE_COLUMNS: CustomerColumn[] = [
  "maKh",
  "tenKh",
  "nhomKhachHang",
  "nguoiLienHe",
  "soDienThoai",
  "loaiHopDong",
  "caMacDinh",
  "donGia",
  "trangThai",
  "thaoTac",
];

const ALL_COLUMNS: CustomerColumn[] = [
  "maKh",
  "tenKh",
  "nhomKhachHang",
  "nguoiLienHe",
  "soDienThoai",
  "diaChi",
  "loaiHopDong",
  "ngaySuKien",
  "caMacDinh",
  "thoiGianShip",
  "phiShip",
  "phanLoai",
  "diKem",
  "loaiKhay",
  "ghiChu",
  "donGia",
  "trangThai",
  "thaoTac",
];

const COLUMN_LABELS: Record<CustomerColumn, string> = {
  maKh: "Mã KH",
  tenKh: "Tên khách hàng",
  nhomKhachHang: "Công ty mẹ",
  nguoiLienHe: "Người liên hệ",
  soDienThoai: "Số điện thoại",
  diaChi: "Địa chỉ",
  loaiHopDong: "Loại HĐ",
  ngaySuKien: "Ngày sự kiện/ăn thử",
  caMacDinh: "Ca mặc định",
  thoiGianShip: "Giờ ship",
  phiShip: "Phí ship",
  phanLoai: "Phân loại",
  diKem: "Đi kèm",
  loaiKhay: "Loại khay",
  ghiChu: "Ghi chú",
  donGia: "Đơn giá",
  trangThai: "Trạng thái",
  thaoTac: "Thao tác",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<KhachHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<KhachHang | undefined>();
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [sortBy, setSortBy] = useState<CustomerColumn>("tenKh");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerHistory, setCustomerHistory] = useState<DonHang[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<CustomerColumn[]>(DEFAULT_VISIBLE_COLUMNS);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/khach-hang");
      const json = await res.json();
      if (json.data) setCustomers(json.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("khach-hang-visible-columns");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as CustomerColumn[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisibleColumns(parsed);
      }
    } catch (error) {
      console.error("Error loading visible columns:", error);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("khach-hang-visible-columns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const getSortValue = (customer: KhachHang, column: CustomerColumn): string | number => {
    if (column === "maKh") return customer.id;
    if (column === "tenKh") return customer.tenCongTy;
    if (column === "nhomKhachHang") return customer.nhomKhachHang || "";
    if (column === "nguoiLienHe") return customer.nguoiLienHe;
    if (column === "soDienThoai") return customer.soDienThoai;
    if (column === "diaChi") return customer.diaChi;
    if (column === "loaiHopDong") return customer.loaiHopDong;
    if (column === "ngaySuKien") return customer.ngaySuKien || "";
    if (column === "caMacDinh") return customer.buoiMacDinh;
    if (column === "thoiGianShip") return customer.thoiGianShip || "";
    if (column === "phiShip") return customer.phiShip || 0;
    if (column === "phanLoai") return customer.phanLoai || "";
    if (column === "diKem") return customer.diKem || "";
    if (column === "loaiKhay") return customer.loaiKhay || "";
    if (column === "ghiChu") return customer.ghiChu || "";
    if (column === "donGia") return customer.donGiaSuat;
    if (column === "trangThai") return customer.trangThai;
    return "";
  };

  const filteredCustomers = customers
    .filter(c =>
      c.tenCongTy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nguoiLienHe.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = getSortValue(a, sortBy);
      const bVal = getSortValue(b, sortBy);
      const factor = sortDir === "asc" ? 1 : -1;
      if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * factor;
      return String(aVal).localeCompare(String(bVal), "vi") * factor;
    });
  const activeCustomers = filteredCustomers.filter((c) => c.trangThai === "active");
  const archivedCustomers = filteredCustomers.filter((c) => c.trangThai === "inactive");

  const fetchCustomerHistory = async (customerId: string) => {
    if (!customerId) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/don-hang?khachHangID=${customerId}&historyLimit=10`);
      const json = await res.json();
      setCustomerHistory(json.data || []);
    } catch (error) {
      console.error("Error fetching customer history:", error);
      setCustomerHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEdit = (customer: KhachHang) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (customer: KhachHang) => {
    const newStatus = customer.trangThai === "active" ? "inactive" : "active";
    try {
      const res = await fetch("/api/khach-hang", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customer.id, trangThai: newStatus }),
      });
      if (res.ok) fetchCustomers();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleUpdateStatus = async (customerId: string, newStatus: "active" | "inactive") => {
    try {
      const res = await fetch("/api/khach-hang", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customerId, trangThai: newStatus }),
      });
      if (res.ok) fetchCustomers();
    } catch (error) {
      console.error("Error updating customer status:", error);
    }
  };

  const toggleColumn = (column: CustomerColumn) => {
    if (column === "thaoTac") return;
    if (visibleColumns.includes(column)) {
      const updated = visibleColumns.filter(c => c !== column);
      if (updated.length > 0) setVisibleColumns(updated);
      return;
    }
    setVisibleColumns([...visibleColumns, column]);
  };

  const handleSort = (column: CustomerColumn) => {
    if (column === "thaoTac") return;
    if (sortBy === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setSortDir("asc");
  };

  const exportHistoryCsv = () => {
    if (!selectedCustomerId || customerHistory.length === 0) return;
    const headers = ["Ngày giao", "Buổi", "Số suất thực tế", "Thành tiền", "Ghi chú"];
    const rows = customerHistory.map((item) => [item.ngayGiao, item.buoi, String(item.soSuatThucTe), String(item.thanhTien), `"${(item.ghiChu || "").replaceAll('"', '""')}"`]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lich-su-an-${selectedCustomerId}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const renderSortableHeader = (column: CustomerColumn, className?: string) => (
    <th className={className}>
      <button
        onClick={() => handleSort(column)}
        className="w-full flex items-center justify-between gap-1"
      >
        <span>{COLUMN_LABELS[column]}</span>
        <ArrowUpDown className={cn("w-3 h-3", sortBy === column ? "text-indigo-600" : "text-slate-400")} />
      </button>
    </th>
  );

  const normalizedBuoiLabel = (buoiMacDinh: string) =>
    buoiMacDinh
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((buoi) => BUOI_LABELS[buoi] || buoi)
      .join(", ");

  const displayColumns = visibleColumns.includes("thaoTac")
    ? visibleColumns
    : [...visibleColumns, "thaoTac"];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Danh mục khách hàng</h2>
            <p className="text-xs text-slate-500 mt-1">Quản lý hồ sơ, đơn giá và hợp đồng khách hàng.</p>
          </div>
          <button
            onClick={() => { setEditingCustomer(undefined); setIsFormOpen(true); }}
            className="misa-btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm khách hàng
          </button>
        </div>

        <div className="misa-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên công ty hoặc người liên hệ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="misa-input pl-10"
              />
            </div>
            <div className="relative flex items-center gap-2">
              <button className="misa-btn-secondary text-xs flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Bộ lọc
              </button>
              <button
                onClick={() => setShowColumnPicker((prev) => !prev)}
                className="misa-btn-secondary text-xs flex items-center"
              >
                <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                Cột hiển thị
              </button>
              {showColumnPicker && (
                <div className="absolute right-0 top-11 z-20 bg-white border border-slate-200 rounded-lg shadow-lg p-3 w-56 space-y-2">
                  {ALL_COLUMNS.filter((column) => column !== "thaoTac").map((column) => (
                    <label key={column} className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column)}
                        onChange={() => toggleColumn(column)}
                        className="w-3.5 h-3.5"
                      />
                      <span>{COLUMN_LABELS[column]}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="misa-table table-auto">
              <thead>
                <tr>
                  {displayColumns.includes("maKh") && renderSortableHeader("maKh", "w-[100px]")}
                  {displayColumns.includes("tenKh") && renderSortableHeader("tenKh", "min-w-[200px]")}
                  {displayColumns.includes("nhomKhachHang") && renderSortableHeader("nhomKhachHang", "min-w-[160px]")}
                  {displayColumns.includes("nguoiLienHe") && renderSortableHeader("nguoiLienHe", "min-w-[150px]")}
                  {displayColumns.includes("soDienThoai") && renderSortableHeader("soDienThoai", "w-[130px]")}
                  {displayColumns.includes("diaChi") && renderSortableHeader("diaChi", "min-w-[170px]")}
                  {displayColumns.includes("loaiHopDong") && renderSortableHeader("loaiHopDong", "w-[120px]")}
                  {displayColumns.includes("ngaySuKien") && renderSortableHeader("ngaySuKien", "min-w-[170px]")}
                  {displayColumns.includes("caMacDinh") && renderSortableHeader("caMacDinh", "min-w-[130px]")}
                  {displayColumns.includes("thoiGianShip") && renderSortableHeader("thoiGianShip", "w-[95px]")}
                  {displayColumns.includes("phiShip") && renderSortableHeader("phiShip", "text-right w-[110px]")}
                  {displayColumns.includes("phanLoai") && renderSortableHeader("phanLoai", "min-w-[100px]")}
                  {displayColumns.includes("diKem") && renderSortableHeader("diKem", "min-w-[120px]")}
                  {displayColumns.includes("loaiKhay") && renderSortableHeader("loaiKhay", "min-w-[100px]")}
                  {displayColumns.includes("ghiChu") && renderSortableHeader("ghiChu", "min-w-[170px]")}
                  {displayColumns.includes("donGia") && renderSortableHeader("donGia", "text-right w-[120px]")}
                  {displayColumns.includes("trangThai") && renderSortableHeader("trangThai", "w-[120px]")}
                  {displayColumns.includes("thaoTac") && <th className="text-center w-[110px]">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={displayColumns.length} className="py-10 text-center text-xs font-medium text-slate-400">Đang tải dữ liệu...</td></tr>
                ) : (
                  <>
                    {activeCustomers.map((customer, customerIndex) => (
                      <tr
                        key={`${customer.id}-${customerIndex}`}
                        className={cn("hover:bg-slate-50 transition-colors group", selectedCustomerId === customer.id && "bg-indigo-50/40")}
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          fetchCustomerHistory(customer.id);
                        }}
                      >
                        {displayColumns.includes("maKh") && (
                          <td className="font-mono text-[10px] font-bold text-slate-400 uppercase">{customer.id}</td>
                        )}
                        {displayColumns.includes("tenKh") && (
                          <td className="font-bold text-slate-900 max-w-[240px] truncate" title={customer.tenCongTy}>{customer.tenCongTy}</td>
                        )}
                        {displayColumns.includes("nhomKhachHang") && (
                          <td className="max-w-[170px] truncate" title={customer.nhomKhachHang || ""}>
                            {customer.nhomKhachHang || "-"}
                          </td>
                        )}
                        {displayColumns.includes("nguoiLienHe") && (
                          <td className="max-w-[170px] truncate" title={customer.nguoiLienHe}>{customer.nguoiLienHe}</td>
                        )}
                        {displayColumns.includes("soDienThoai") && <td>{customer.soDienThoai}</td>}
                        {displayColumns.includes("diaChi") && (
                          <td className="max-w-[200px] truncate" title={customer.diaChi || ""}>{customer.diaChi || "-"}</td>
                        )}
                        {displayColumns.includes("loaiHopDong") && (
                          <td>
                            <span className="text-[10px] font-bold uppercase text-blue-700">
                              {LOAI_HOP_DONG_LABELS[customer.loaiHopDong] || customer.loaiHopDong}
                            </span>
                          </td>
                        )}
                        {displayColumns.includes("ngaySuKien") && (
                          <td className="max-w-[220px] truncate" title={customer.ngaySuKien || ""}>
                            {customer.ngaySuKien?.startsWith("an_thu|")
                              ? `${customer.ngaySuKien.split("|")[1] || ""} - ${customer.ngaySuKien.split("|").slice(2).join("|") || ""}`
                              : customer.ngaySuKien || "-"}
                          </td>
                        )}
                        {displayColumns.includes("caMacDinh") && (
                          <td className="max-w-[170px] truncate" title={normalizedBuoiLabel(customer.buoiMacDinh)}>
                            {normalizedBuoiLabel(customer.buoiMacDinh)}
                          </td>
                        )}
                        {displayColumns.includes("thoiGianShip") && <td>{customer.thoiGianShip || "-"}</td>}
                        {displayColumns.includes("phiShip") && <td className="text-right">{formatVND(customer.phiShip || 0)}</td>}
                        {displayColumns.includes("phanLoai") && <td>{customer.phanLoai || "-"}</td>}
                        {displayColumns.includes("diKem") && <td>{customer.diKem || "-"}</td>}
                        {displayColumns.includes("loaiKhay") && <td>{customer.loaiKhay || "-"}</td>}
                        {displayColumns.includes("ghiChu") && (
                          <td className="max-w-[200px] truncate" title={customer.ghiChu || ""}>{customer.ghiChu || "-"}</td>
                        )}
                        {displayColumns.includes("donGia") && <td className="text-right font-bold">{formatVND(customer.donGiaSuat)}</td>}
                        {displayColumns.includes("trangThai") && (
                          <td>
                            <select
                              value={customer.trangThai}
                              onChange={(e) => handleUpdateStatus(customer.id, e.target.value as "active" | "inactive")}
                              className={cn(
                                "px-2 py-1 rounded text-[10px] font-bold border outline-none uppercase",
                                customer.trangThai === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                              )}
                            >
                              <option value="active">Đang hoạt động</option>
                              <option value="inactive">Dừng hoạt động</option>
                            </select>
                          </td>
                        )}
                        {displayColumns.includes("thaoTac") && <td className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(customer)}
                              className="p-1.5 text-slate-400 hover:text-[#0072bc] hover:bg-blue-50 rounded transition-all"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(customer)}
                              className={cn(
                                "p-1.5 rounded transition-all",
                                customer.trangThai === 'active' 
                                  ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" 
                                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                              )}
                              title={customer.trangThai === 'active' ? "Lưu trữ khách hàng" : "Khôi phục khách hàng"}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>}
                      </tr>
                    ))}
                    {/* Render empty rows to fill the grid */}
                    {Array.from({ length: Math.max(0, 10 - activeCustomers.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} className="h-10">
                        {displayColumns.map((column) => (
                          <td key={`${column}-${i}`} className="border-b border-r border-slate-50"></td>
                        ))}
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="misa-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Kho lưu trữ khách hàng</h3>
            <span className="text-xs text-slate-500">{archivedCustomers.length} khách hàng</span>
          </div>
          <div className="overflow-x-auto">
            <table className="misa-table table-auto">
              <thead>
                <tr>
                  <th>Mã KH</th>
                  <th>Tên khách hàng</th>
                  <th>Công ty mẹ</th>
                  <th>Trạng thái</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {archivedCustomers.map((customer, idx) => (
                  <tr key={`archived-${customer.id}-${idx}`} className="opacity-80">
                    <td className="font-mono text-[10px] font-bold text-slate-400 uppercase">{customer.id}</td>
                    <td className="font-bold">{customer.tenCongTy}</td>
                    <td>{customer.nhomKhachHang || "-"}</td>
                    <td>
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                        Dừng hoạt động
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleToggleStatus(customer)}
                        className="px-2 py-1 text-[10px] font-bold rounded border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      >
                        Khôi phục
                      </button>
                    </td>
                  </tr>
                ))}
                {archivedCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-slate-400">Chưa có khách hàng trong kho lưu trữ.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="misa-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Lịch sử bữa ăn khách hàng (10 lần gần nhất)</h3>
            <button
              onClick={exportHistoryCsv}
              disabled={!selectedCustomerId || customerHistory.length === 0}
              className="misa-btn-secondary text-xs disabled:opacity-50"
            >
              Xuất bảng CSV
            </button>
          </div>
          <div className="p-3 text-xs text-slate-500">
            {selectedCustomerId ? `Đang xem: ${selectedCustomerId}` : "Chọn 1 khách hàng ở bảng trên để xem lịch sử."}
          </div>
          <div className="overflow-x-auto">
            <table className="misa-table table-auto">
              <thead>
                <tr>
                  <th>Ngày giao</th>
                  <th>Buổi</th>
                  <th className="text-right">Số suất</th>
                  <th className="text-right">Thành tiền</th>
                  <th>Món ăn</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr><td colSpan={6} className="py-6 text-center text-xs text-slate-400">Đang tải lịch sử...</td></tr>
                ) : customerHistory.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-xs text-slate-400">Không có dữ liệu lịch sử.</td></tr>
                ) : (
                  customerHistory.map((item, idx) => (
                    <tr key={`history-${item.id}-${idx}`}>
                      <td>{item.ngayGiao}</td>
                      <td>{item.buoi}</td>
                      <td className="text-right font-bold">{item.soSuatThucTe}</td>
                      <td className="text-right">{formatVND(item.thanhTien)}</td>
                      <td className="max-w-[220px] truncate" title={item.chiTietMon}>{item.chiTietMon}</td>
                      <td className="max-w-[240px] truncate" title={item.ghiChu}>{item.ghiChu || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchCustomers}
        />
      )}
    </AppLayout>
  );
}
