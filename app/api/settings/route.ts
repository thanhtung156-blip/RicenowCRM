import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getBusinessSettings, updateBusinessSetting } from "@/lib/settings";
import { ROLES } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const settings = await getBusinessSettings();
    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("[API_SETTINGS] GET Error:", error);
    return NextResponse.json({ error: "Lỗi lấy cài đặt" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    if (session.user?.role !== ROLES.QUAN_LY) {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    const body = await req.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(body)) {
      await updateBusinessSetting(key, value);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API_SETTINGS] POST Error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật cài đặt" }, { status: 500 });
  }
}
