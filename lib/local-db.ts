import fs from 'fs';
import path from 'path';

type SheetRow = (string | number | boolean | null)[];
type LocalDB = Record<string, SheetRow[]>;

const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DB_PATH = path.join(DATA_DIR, 'local_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_DB: LocalDB = {
  KhachHang: [
    ["ID", "TenCongTy", "NguoiLienHe", "SoDienThoai", "DiaChi", "LoaiHopDong", "DonGiaSuat", "BuoiMacDinh", "GhiChu", "TrangThai", "NgayTao"],
    ["KH001", "Công ty May 10", "Anh Tú", "0988123456", "Sài Đồng, Long Biên", "thang", "35000", "trua", "Ăn cơm khay", "active", "2024-04-20T08:00:00Z"],
    ["KH002", "Nhà máy Canon", "Chị Lan", "0912334455", "KCN Quế Võ, Bắc Ninh", "thang", "40000", "trua", "Không cay", "active", "2024-04-20T08:00:00Z"],
    ["KH003", "Trường THPT Chu Văn An", "Thầy Hùng", "0904112233", "Thụy Khuê, Tây Hồ", "ngay", "30000", "trua", "Suất ăn học sinh", "active", "2024-04-20T08:00:00Z"]
  ],
  DonHang: [
    ["ID", "KhachHangID", "TenKhachHang", "NgayGiao", "Buoi", "SoSuat", "SoSuatThucTe", "DonGia", "ThanhTien", "TrangThai", "NguonDon", "GhiChu", "ChiTietMon", "NgayTao", "NguoiTao"],
    ["DH2004-01", "KH001", "Công ty May 10", "2024-04-20", "trua", 90, 90, 35000, 3150000, "da_xac_nhan", "thu_cong", "", '{"M1": 40, "M2": 50}', "2024-04-20T09:00:00Z", "admin"],
    ["DH2004-02", "KH002", "Nhà máy Canon", "2024-04-20", "trua", 121, 121, 40000, 4840000, "da_xac_nhan", "google_form", "", '{"M2": 71, "M3": 50}', "2024-04-20T09:00:00Z", "admin"]
  ],
  KeMon: [
    ["Ngay", "Buoi", "Mon1", "Mon2", "Mon3", "Mon4", "Mon5", "MonPhu", "GhiChu", "KhachHangID"],
    ["2024-04-20", "trua", "Thịt xào dưa cải chua", "Gà nấu cà ri", "Cá nục kho dứa", "Sườn kho măng", "Nấm xào đỗ cove", "Rau lang luộc", "Thực đơn tiêu chuẩn", ""]
  ],
  TongHopNgay: [
    ["Ngay", "Buoi", "MaMon", "TenMon", "SoSuatBao", "SoSuatNau", "SoSuatCon", "GhiChu", "NgayCapNhat"],
    ["2024-04-20", "trua", "M1", "Thịt xào dưa cải chua", 40, 50, 10, "Nấu thêm 10 suất", "2024-04-20T11:00:00Z"],
    ["2024-04-20", "trua", "M2", "Gà nấu cà ri", 121, 125, 4, "", "2024-04-20T11:00:00Z"]
  ],
  NguoiDung: [
    ["Email", "Ten", "Role", "TrangThai"],
    ["admin@local.test", "Quản trị viên", "quan_ly", "active"],
    ["bep@local.test", "Bếp trưởng", "bep", "active"]
  ],
  CaiDat: [
    ["Key", "Value"],
    ["bufferPercent", "10"],
    ["tenDonVi", "Ricenow Kitchen"],
    ["version", "1.0.0"]
  ],
  ThanhToan: [
    ["ID", "KhachHangID", "TenKhachHang", "KyThanhToan", "TongPhatSinh", "DaThanhToan", "ConNo", "NgayThanhToan", "HinhThuc", "GhiChu"]
  ]
};

function readLocalDB(): LocalDB {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
    return DEFAULT_DB;
  }
  try {
    return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8')) as LocalDB;
  } catch {
    return DEFAULT_DB;
  }
}

function writeLocalDB(data: LocalDB) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

// In-process write lock — serializes concurrent mutations to prevent lost updates.
// Does not protect against multi-process (e.g. multiple Vercel instances), but
// local-db is only used as a development fallback for a single-process dev server.
let writeLock: Promise<void> = Promise.resolve();

function withWriteLock<T>(fn: () => T): Promise<T> {
  const next = writeLock.then(fn);
  writeLock = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export async function getLocalRows(sheetName: string): Promise<SheetRow[]> {
  const db = readLocalDB();
  return db[sheetName] || [[]];
}

export async function appendLocalRow(sheetName: string, values: SheetRow): Promise<void> {
  return withWriteLock(() => {
    const db = readLocalDB();
    if (!db[sheetName]) db[sheetName] = [[]];
    db[sheetName].push(values);
    writeLocalDB(db);
  });
}

export async function updateLocalRow(sheetName: string, rowIndex: number, values: SheetRow): Promise<void> {
  return withWriteLock(() => {
    const db = readLocalDB();
    if (!db[sheetName] || rowIndex >= db[sheetName].length) return;
    db[sheetName][rowIndex] = values;
    writeLocalDB(db);
  });
}
