import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db, TongHopNgay } from "@/lib/db";
import { formatISODate } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const ngay = searchParams.get("ngay") || formatISODate(new Date());
    const buoi = searchParams.get("buoi") || "trua";

    const data = await db.tongHop.getByDate(ngay, buoi);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API_TONG_HOP] GET Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const body = await req.json();
    const { ngay, buoi } = body;

    if (!ngay || !buoi) {
      return NextResponse.json({ error: "Thiếu ngày hoặc buổi" }, { status: 400 });
    }

    const { data: orders } = await db.donHang.getByDate(ngay, buoi);

    const dishAggregation: Record<string, number> = {};
    let totalSideDishes = 0;

    orders.forEach(order => {
      let details: Record<string, unknown> = {};
      try {
        details = JSON.parse(order.chiTietMon || "{}");
      } catch {
        console.warn(`[API_TONG_HOP] Invalid chiTietMon for order ${order.id}`);
      }

      Object.entries(details).forEach(([code, qty]) => {
        const quantity = Number(qty);
        dishAggregation[code] = (dishAggregation[code] || 0) + quantity;

        const upperCode = code.toUpperCase();
        if (!upperCode.includes("BUN") && !upperCode.includes("BANH_MY")) {
          totalSideDishes += quantity;
        }
      });
    });

    const menu = await db.keMon.get(ngay, buoi);
    const dishNames: Record<string, string> = {
      M1: menu?.mon1 || "Món 1",
      M2: menu?.mon2 || "Món 2",
      M3: menu?.mon3 || "Món 3",
      M4: menu?.mon4 || "Món 4",
      M5: menu?.mon5 || "Món 5",
      MON_PHU: menu?.monPhu || "Món phụ (Rau/Canh)",
    };

    const existingSummary = await db.tongHop.getByDate(ngay, buoi);
    const duTruMap: Record<string, number> = {};
    existingSummary.forEach(item => {
      const duTru = item.soSuatNau - item.soSuatBao;
      duTruMap[String(item.maMon)] = isNaN(duTru) ? 0 : duTru;
    });

    const summaryItems: TongHopNgay[] = [];

    Object.entries(dishAggregation).forEach(([code, qty]) => {
      const duTru = duTruMap[code] || 0;
      const soSuatNau = qty + duTru;
      summaryItems.push({
        ngay,
        buoi,
        maMon: code,
        tenMon: dishNames[code] || code,
        soSuatBao: qty,
        soSuatNau: soSuatNau,
        soSuatCon: soSuatNau - qty,
        ghiChu: "",
        ngayCapNhat: new Date().toISOString(),
      });
    });

    if (totalSideDishes > 0) {
      const code = "MON_PHU";
      const duTru = duTruMap[code] || 0;
      const soSuatNau = totalSideDishes + duTru;
      summaryItems.push({
        ngay,
        buoi,
        maMon: code,
        tenMon: dishNames[code],
        soSuatBao: totalSideDishes,
        soSuatNau: soSuatNau,
        soSuatCon: soSuatNau - totalSideDishes,
        ghiChu: "Tổng hợp từ các món chính",
        ngayCapNhat: new Date().toISOString(),
      });
    }

    await db.tongHop.updateBatch(summaryItems);

    return NextResponse.json({ success: true, data: summaryItems });
  } catch (error) {
    console.error("[API_TONG_HOP] POST Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const item: TongHopNgay = await req.json();

    if (!item.ngay || !item.buoi || !item.maMon) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    await db.tongHop.updateBatch([item]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API_TONG_HOP] PUT Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}
