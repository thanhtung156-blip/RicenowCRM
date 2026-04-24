import { describe, it, expect } from "vitest";
import {
  validateRequired,
  validateBuoi,
  validatePositiveNumber,
  validateDonHang,
  validateKhachHang,
  validateKeMon,
} from "@/lib/validation";

describe("validateRequired", () => {
  it("returns error for undefined", () => {
    expect(validateRequired(undefined, "Tên")).toBe("Tên là bắt buộc");
  });

  it("returns error for empty string", () => {
    expect(validateRequired("", "Email")).toBe("Email là bắt buộc");
    expect(validateRequired("   ", "Email")).toBe("Email là bắt buộc");
  });

  it("returns null for valid values", () => {
    expect(validateRequired("hello", "Field")).toBeNull();
    expect(validateRequired(0, "Number")).toBeNull();
    expect(validateRequired(false, "Bool")).toBeNull();
  });
});

describe("validateBuoi", () => {
  it("accepts valid buoi values", () => {
    expect(validateBuoi("trua")).toBeNull();
    expect(validateBuoi("sang")).toBeNull();
    expect(validateBuoi("chieu")).toBeNull();
    expect(validateBuoi("trai_cay")).toBeNull();
  });

  it("rejects invalid buoi values", () => {
    expect(validateBuoi("dinner")).not.toBeNull();
    expect(validateBuoi("")).not.toBeNull();
    expect(validateBuoi("TRUA")).not.toBeNull();
  });
});

describe("validatePositiveNumber", () => {
  it("accepts zero and positive numbers", () => {
    expect(validatePositiveNumber(0, "Số suất")).toBeNull();
    expect(validatePositiveNumber(100, "Số suất")).toBeNull();
    expect(validatePositiveNumber(1.5, "Số suất")).toBeNull();
  });

  it("rejects negative numbers", () => {
    expect(validatePositiveNumber(-1, "Số suất")).not.toBeNull();
  });

  it("rejects non-numbers", () => {
    expect(validatePositiveNumber("abc" as unknown as number, "Số suất")).not.toBeNull();
    expect(validatePositiveNumber(NaN, "Số suất")).not.toBeNull();
  });
});

describe("validateDonHang", () => {
  const validBody = {
    khachHangID: "KH001",
    ngayGiao: "2024-04-20",
    buoi: "trua",
    soSuat: 100,
  };

  it("accepts valid order data", () => {
    expect(validateDonHang(validBody)).toBeNull();
  });

  it("rejects missing khachHangID", () => {
    expect(validateDonHang({ ...validBody, khachHangID: "" })).not.toBeNull();
    expect(validateDonHang({ ...validBody, khachHangID: undefined })).not.toBeNull();
  });

  it("rejects missing ngayGiao", () => {
    expect(validateDonHang({ ...validBody, ngayGiao: "" })).not.toBeNull();
  });

  it("rejects invalid buoi", () => {
    expect(validateDonHang({ ...validBody, buoi: "evening" })).not.toBeNull();
  });

  it("rejects negative soSuat", () => {
    expect(validateDonHang({ ...validBody, soSuat: -5 })).not.toBeNull();
  });
});

describe("validateKhachHang", () => {
  const validBody = { tenCongTy: "Công ty ABC", soDienThoai: "0912345678" };

  it("accepts valid customer data", () => {
    expect(validateKhachHang(validBody)).toBeNull();
  });

  it("rejects missing tenCongTy", () => {
    expect(validateKhachHang({ ...validBody, tenCongTy: "" })).not.toBeNull();
    expect(validateKhachHang({ ...validBody, tenCongTy: "   " })).not.toBeNull();
  });

  it("rejects missing soDienThoai", () => {
    expect(validateKhachHang({ ...validBody, soDienThoai: "" })).not.toBeNull();
  });
});

describe("validateKeMon", () => {
  const validBody = { ngay: "2024-04-20", buoi: "trua" };

  it("accepts valid menu data", () => {
    expect(validateKeMon(validBody)).toBeNull();
  });

  it("rejects missing ngay", () => {
    expect(validateKeMon({ ...validBody, ngay: "" })).not.toBeNull();
  });

  it("rejects invalid buoi", () => {
    expect(validateKeMon({ ...validBody, buoi: "lunch" })).not.toBeNull();
  });
});
