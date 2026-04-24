import React from "react";
import { formatDate } from "@/lib/utils";
import { DonHang } from "@/lib/db";

interface ThermalLabelProps {
  donHang: DonHang;
  tenDonVi?: string;
  sdtLienHe?: string;
  menuItems?: string[];
}

export default function ThermalLabel({ 
  donHang, 
  tenDonVi = "BẾP RICENOW", 
  sdtLienHe = "09x.xxx.xxxx",
  menuItems = []
}: ThermalLabelProps) {
  return (
    <div className="thermal-label w-[80mm] min-h-[80mm] p-[2mm] bg-white text-black font-sans print:m-0 print:shadow-none break-after-page">
      {/* Header */}
      <div className="text-center border-b border-black pb-1 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest">{tenDonVi}</p>
        <p className="text-[8px]">{sdtLienHe}</p>
      </div>

      {/* Customer Name */}
      <div className="text-center mb-1">
        <h2 className="text-[20px] font-black leading-tight uppercase">
          {donHang.tenKhachHang}
        </h2>
      </div>

      {/* Meal Count */}
      <div className="flex flex-col items-center justify-center border-2 border-black rounded-lg py-2 my-2">
        <span className="text-[48px] font-black leading-none">
          {donHang.soSuatThucTe || donHang.soSuat}
        </span>
        <span className="text-[14px] font-bold uppercase tracking-widest mt-1">SUẤT ĂN</span>
      </div>

      {/* Session & Date */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-[16px] font-black uppercase">
          {donHang.buoi === "trua" ? "BỮA TRƯA" : donHang.buoi === "chieu" ? "BỮA CHIỀU" : "BỮA SÁNG"}
        </span>
        <span className="text-[12px] font-bold">
          {formatDate(donHang.ngayGiao)}
        </span>
      </div>

      {/* Menu / Details */}
      {menuItems.length > 0 && (
        <div className="border-t border-dotted border-black pt-2 mb-2">
          <p className="text-[10px] font-bold uppercase mb-1 underline">Thực đơn:</p>
          <p className="text-[12px] leading-tight font-medium">
            {menuItems.join(" | ")}
          </p>
        </div>
      )}

      {/* Notes */}
      {donHang.ghiChu && (
        <div className="bg-black text-white p-1 text-center mt-2">
          <p className="text-[10px] font-bold uppercase">Ghi chú:</p>
          <p className="text-[11px] font-black leading-tight">{donHang.ghiChu}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-[8px] italic">Cảm ơn quý khách đã tin tưởng Ricenow!</p>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .thermal-label, .thermal-label * {
            visibility: visible;
          }
          .thermal-label {
            position: absolute;
            left: 0;
            top: 0;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
        .break-after-page {
          page-break-after: always;
        }
      `}</style>
    </div>
  );
}
