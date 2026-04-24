import { describe, it, expect } from "vitest";
import { calcBuffer, formatVND, formatDate, formatISODate } from "@/lib/utils";

describe("calcBuffer", () => {
  it("applies buffer and rounds up", () => {
    expect(calcBuffer(100, 10)).toBe(110);
    expect(calcBuffer(100, 0)).toBe(100);
    expect(calcBuffer(0, 10)).toBe(0);
  });

  it("always rounds up (ceiling), never down", () => {
    // 91 * 1.1 = 100.1 → ceil = 101
    expect(calcBuffer(91, 10)).toBe(101);
    // 10 * 1.15 = 11.5 → ceil = 12
    expect(calcBuffer(10, 15)).toBe(12);
    // 3 * 1.1 = 3.3 → ceil = 4
    expect(calcBuffer(3, 10)).toBe(4);
  });

  it("handles fractional percentages", () => {
    // 1000 * 1.075 = 1075 (exact)
    expect(calcBuffer(1000, 7.5)).toBe(1075);
    // 7 * 1.1 = 7.7 → ceil = 8
    expect(calcBuffer(7, 10)).toBe(8);
  });
});

describe("formatVND", () => {
  it("formats positive amounts with ₫ symbol", () => {
    const result = formatVND(35000);
    expect(result).toContain("35.000");
    expect(result).toContain("₫");
  });

  it("formats zero", () => {
    const result = formatVND(0);
    expect(result).toContain("0");
    expect(result).toContain("₫");
  });

  it("formats large amounts", () => {
    const result = formatVND(1500000);
    expect(result).toContain("1.500.000");
    expect(result).toContain("₫");
  });
});

describe("formatDate", () => {
  it("formats ISO date string to DD/MM/YYYY", () => {
    // Use noon UTC to avoid timezone edge cases
    expect(formatDate("2024-04-20T12:00:00Z")).toBe("20/04/2024");
    expect(formatDate("2024-01-01T12:00:00Z")).toBe("01/01/2024");
    expect(formatDate("2024-12-31T12:00:00Z")).toBe("31/12/2024");
  });

  it("accepts Date objects", () => {
    const d = new Date("2024-04-20T12:00:00Z");
    expect(formatDate(d)).toBe("20/04/2024");
  });
});

describe("formatISODate", () => {
  it("formats to YYYY-MM-DD", () => {
    const d = new Date("2024-04-20T12:00:00Z");
    expect(formatISODate(d)).toBe("2024-04-20");
  });

  it("re-formats ISO string to YYYY-MM-DD", () => {
    expect(formatISODate("2024-04-20T12:00:00Z")).toBe("2024-04-20");
  });
});
