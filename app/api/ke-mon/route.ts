import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { BUOI } from "@/lib/constants";

const VALID_BUOI = Object.values(BUOI);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const ngay = searchParams.get("ngay") || "";
    const buoi = searchParams.get("buoi") || "";

    const data = await db.keMon.get(ngay, buoi);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API_KE_MON] GET Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const body = await req.json();
    const { ngay, buoi } = body;

    if (!ngay || !buoi) {
      return NextResponse.json({ error: "Thiếu ngày hoặc buổi" }, { status: 400 });
    }
    if (!VALID_BUOI.includes(buoi)) {
      return NextResponse.json({ error: `Buổi không hợp lệ. Chấp nhận: ${VALID_BUOI.join(", ")}` }, { status: 400 });
    }

    await db.keMon.save(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API_KE_MON] POST Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}
