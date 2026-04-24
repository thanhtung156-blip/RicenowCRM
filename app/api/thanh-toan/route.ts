import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const khachHangId = searchParams.get("khachHangId") || "";

    const data = await db.thanhToan.listByCustomer(khachHangId);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API_THANH_TOAN] GET Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const body = await req.json();
    const { khachHangID, kyThanhToan } = body;

    if (!khachHangID || !kyThanhToan) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc: khachHangID, kyThanhToan" }, { status: 400 });
    }

    const id = await db.thanhToan.create(body);
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[API_THANH_TOAN] POST Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}
