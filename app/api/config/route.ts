import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getConfig, saveConfig, isConfigured } from "@/lib/config";
import { ROLES } from "@/lib/constants";

export async function GET() {
  const configured = isConfigured();

  // Allow unauthenticated access only during initial setup (system not yet configured)
  if (configured) {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
  }

  const config = getConfig();
  return NextResponse.json({
    data: {
      ...config,
      GOOGLE_CLIENT_SECRET: config.GOOGLE_CLIENT_SECRET ? "********" : "",
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ? "********" : "",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const configured = isConfigured();

    if (configured) {
      const session = await getServerSession();
      if (!session) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
      }
      if (session.user?.role !== ROLES.QUAN_LY) {
        return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
      }
    }

    const body = await req.json();
    saveConfig(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API_CONFIG] POST Error:", error);
    return NextResponse.json({ error: "Lỗi lưu cấu hình" }, { status: 500 });
  }
}
