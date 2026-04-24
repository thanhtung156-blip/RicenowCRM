import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { validateDonHang } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ngay = searchParams.get("ngay") || "";
    const buoi = searchParams.get("buoi") || "";
    const khachHangID = searchParams.get("khachHangID") || "";
    const historyLimit = Math.min(200, Math.max(1, Number(searchParams.get("historyLimit") || "10")));
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") || "200")));

    if (khachHangID) {
      const data = await db.donHang.getByCustomer(khachHangID, historyLimit);
      return NextResponse.json({ data, total: data.length });
    }

    const result = await db.donHang.getByDate(ngay, buoi, page, limit);
    return NextResponse.json({ data: result.data, total: result.total, page, limit });
  } catch (error) {
    console.error("[API_DON_HANG] GET Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const validationError = validateDonHang(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await db.donHang.create({
      ...body,
      nguoiTao: session.user?.email || "unknown",
      ngayTao: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API_DON_HANG] POST Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID đơn hàng" }, { status: 400 });
    }

    await db.donHang.update(id, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API_DON_HANG] PUT Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}

