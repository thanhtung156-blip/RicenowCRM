import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getConfig, isConfigured } from "@/lib/config";

export async function GET() {
  const session = await getServerSession();
  if (!session && isConfigured()) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const config = getConfig();
  return NextResponse.json({
    data: {
      ...config,
      GOOGLE_CLIENT_SECRET: config.GOOGLE_CLIENT_SECRET ? "********" : "",
      configured: isConfigured(),
    },
  });
}
