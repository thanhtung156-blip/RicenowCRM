import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy", { locale: vi });
}

export function formatISODate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd");
}

export function calcBuffer(totalSuat: number, bufferPercent: number): number {
  // Round to 10 decimal places before ceiling to eliminate floating-point noise
  // (e.g. 100 * 1.1 = 110.00000000000001 in IEEE 754, which would ceil to 111)
  const raw = Math.round(totalSuat * (1 + bufferPercent / 100) * 1e10) / 1e10;
  return Math.ceil(raw);
}

export function generateId(prefix: string, sequence: number = 1): string {
  const dateStr = format(new Date(), "yyyyMMdd");
  const seqStr = sequence.toString().padStart(3, "0");
  return `${prefix}${dateStr}-${seqStr}`;
}
