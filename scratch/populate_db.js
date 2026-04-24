const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

function run() {
  const excelPath = path.resolve(__dirname, '../Sample_excel_1.xlsx');
  const dbPath = path.resolve(__dirname, '../data/local_db.json');
  
  let workbook;
  try {
    workbook = xlsx.readFile(excelPath);
  } catch(e) {
    console.error("Could not read excel file");
    return;
  }
  
  const menuSheet = workbook.Sheets['Menu Sample'];
  const data = xlsx.utils.sheet_to_json(menuSheet, { header: 1 });
  
  // Parse Menu Sample
  // Row 1: Headers (Thứ 2 20/4, Thứ 3 21/4 ...)
  const headers = data[1];
  const menusByDate = [];
  
  // We'll map dates to strings like 2026-04-20, 2026-04-21
  const dates = ['2026-04-20', '2026-04-21', '2026-04-22', '2026-04-23', '2026-04-24', '2026-04-25'];
  
  for (let c = 1; c <= 6; c++) {
    if (!headers[c]) continue;
    menusByDate.push({
      Ngay: dates[c-1],
      Buoi: 'trua',
      Mon1: data[2]?.[c] || '',
      Mon2: data[3]?.[c] || '',
      Mon3: data[4]?.[c] || '',
      Mon4: data[5]?.[c] || '',
      Mon5: '',
      MonPhu: (data[6]?.[c] || '') + (data[7]?.[c] ? ' - ' + data[7][c] : '') + (data[9]?.[c] ? ' - ' + data[9][c] : '')
    });
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Generate 15 Customers
  const companies = ["Công ty May 10", "Nhà máy Canon", "Trường THPT Chu Văn An", "KCN Nam Thăng Long", "Công ty Samsung", "Viettel", "FPT Software", "Tập đoàn Vingroup", "Ngân hàng Vietcombank", "Công ty Acecook", "Honda Việt Nam", "Toyota Việt Nam", "Panasonic", "Công ty Biti's", "Vinamilk"];
  
  const khachHangRows = [db.KhachHang[0]];
  for (let i = 0; i < companies.length; i++) {
    khachHangRows.push([
      `KH00${i+1}`,
      companies[i],
      `Người liên hệ ${i+1}`,
      `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      "Hà Nội",
      "thang",
      35000 + Math.floor(Math.random() * 3) * 5000,
      "trua",
      Math.random() > 0.5 ? "Ăn nhiều cơm" : "",
      "active",
      "2026-04-20T08:00:00Z",
      Math.random() > 0.5 ? "11:30" : "11:00",
      Math.random() > 0.7 ? 30000 : 0,
      Math.random() > 0.5 ? "Hợp đồng" : "Sự kiện",
      Math.random() > 0.5 ? "Đũa, Giấy" : "",
      "Khay 5 ngăn"
    ]);
  }
  db.KhachHang = khachHangRows;
  
  // Clear KeMon, DonHang, TongHopNgay
  db.KeMon = [db.KeMon[0]];
  db.DonHang = [db.DonHang[0]];
  db.TongHopNgay = [db.TongHopNgay[0]];
  
  let donHangCounter = 1;
  
  for (const menu of menusByDate) {
    db.KeMon.push([
      menu.Ngay, menu.Buoi, menu.Mon1, menu.Mon2, menu.Mon3, menu.Mon4, menu.Mon5, menu.MonPhu, "", ""
    ]);
    
    // Generate orders for this day
    const tongHopMap = {};
    
    for (let i = 1; i < db.KhachHang.length; i++) {
      if (Math.random() > 0.8) continue; // 80% customers order each day
      
      const kh = db.KhachHang[i];
      const soSuat = 20 + Math.floor(Math.random() * 80); // 20 to 100 suat
      const thanhTien = soSuat * Number(kh[6]);
      
      // Chi tiet mon: random allocation
      let m1 = Math.floor(soSuat * 0.4);
      let m2 = Math.floor(soSuat * 0.3);
      let m3 = soSuat - m1 - m2;
      const chiTiet = `{"M1": ${m1}, "M2": ${m2}, "M3": ${m3}}`;
      
      db.DonHang.push([
        `DH${menu.Ngay.replace(/-/g, '')}-${donHangCounter++}`,
        kh[0],
        kh[1],
        menu.Ngay,
        "trua",
        soSuat,
        soSuat,
        kh[6],
        thanhTien,
        "da_xac_nhan",
        "thu_cong",
        "",
        chiTiet,
        `${menu.Ngay}T09:00:00Z`,
        "admin"
      ]);
      
      // accumulate tong hop
      tongHopMap["M1"] = (tongHopMap["M1"] || 0) + m1;
      tongHopMap["M2"] = (tongHopMap["M2"] || 0) + m2;
      tongHopMap["M3"] = (tongHopMap["M3"] || 0) + m3;
    }
    
    // generate TongHopNgay
    const mNames = {"M1": menu.Mon1, "M2": menu.Mon2, "M3": menu.Mon3, "M4": menu.Mon4};
    for (const [mCode, val] of Object.entries(tongHopMap)) {
      if (val > 0) {
        const soNau = Math.ceil(val * 1.1);
        db.TongHopNgay.push([
          menu.Ngay, "trua", mCode, mNames[mCode] || "Món khác", val, soNau, soNau - val, "", `${menu.Ngay}T10:00:00Z`
        ]);
      }
    }
  }
  
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log("Database populated successfully!");
}

run();
