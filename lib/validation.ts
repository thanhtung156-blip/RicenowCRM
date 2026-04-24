import { BUOI } from "./constants";

const VALID_BUOI = Object.values(BUOI);

// --- Primitives ---

export function validateRequired(
  value: unknown,
  label: string
): string | null {
  if (value === undefined || value === null) return `${label} là bắt buộc`;
  if (typeof value === "string" && value.trim() === "") return `${label} là bắt buộc`;
  return null;
}

export function validateBuoi(value: unknown): string | null {
  if (typeof value !== "string" || !VALID_BUOI.includes(value as (typeof VALID_BUOI)[number])) {
    return `Buổi không hợp lệ. Chấp nhận: ${VALID_BUOI.join(", ")}`;
  }
  return null;
}

export function validatePositiveNumber(value: unknown, label: string): string | null {
  if (typeof value !== "number" || isNaN(value) || value < 0) {
    return `${label} phải là số không âm`;
  }
  return null;
}

// --- Composite validators ---

interface DonHangBody {
  khachHangID?: unknown;
  ngayGiao?: unknown;
  buoi?: unknown;
  soSuat?: unknown;
}

export function validateDonHang(body: DonHangBody): string | null {
  return (
    validateRequired(body.khachHangID, "khachHangID") ||
    validateRequired(body.ngayGiao, "ngayGiao") ||
    validateRequired(body.buoi, "buoi") ||
    validateBuoi(body.buoi) ||
    (body.soSuat === undefined ? "soSuat là bắt buộc" : null) ||
    validatePositiveNumber(body.soSuat, "Số suất")
  );
}

interface KhachHangBody {
  tenCongTy?: unknown;
  soDienThoai?: unknown;
}

export function validateKhachHang(body: KhachHangBody): string | null {
  return (
    validateRequired(body.tenCongTy, "Tên công ty") ||
    validateRequired(body.soDienThoai, "Số điện thoại")
  );
}

interface KeMonBody {
  ngay?: unknown;
  buoi?: unknown;
}

export function validateKeMon(body: KeMonBody): string | null {
  return (
    validateRequired(body.ngay, "ngay") ||
    validateRequired(body.buoi, "buoi") ||
    validateBuoi(body.buoi)
  );
}

interface ThanhToanBody {
  khachHangID?: unknown;
  kyThanhToan?: unknown;
}

export function validateThanhToan(body: ThanhToanBody): string | null {
  return (
    validateRequired(body.khachHangID, "khachHangID") ||
    validateRequired(body.kyThanhToan, "Kỳ thanh toán")
  );
}
