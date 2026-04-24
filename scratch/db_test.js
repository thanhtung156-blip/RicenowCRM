const { db } = require('../lib/db');
const { SHEETS } = require('../lib/constants');

// Mock sheets functions if needed, but since we are in Node and want to test local-db fallback
// we can just run it. 

async function testDB() {
  console.log('--- Testing DB Logic Directly ---');
  
  try {
    // 1. Test KhachHang
    const customersRes = await db.khachHang.getAll();
    console.log(`KhachHang count: ${customersRes.data?.length} (Total: ${customersRes.total})`);
    
    // 2. Test DonHang
    const ordersRes = await db.donHang.getByDate('2024-04-20');
    console.log(`DonHang count for 2024-04-20: ${ordersRes.data?.length} (Total: ${ordersRes.total})`);
    
    // 3. Test ThanhToan (The new feature)
    console.log('Testing ThanhToan create...');
    const ttId = await db.thanhToan.create({
      khachHangID: 'KH001',
      tenKhachHang: 'Công ty May 10',
      kyThanhToan: 'Tháng 04/2024',
      tongTienPhatSinh: 5000000,
      soTienDaThanhToan: 2000000,
      conNo: 3000000,
      ngayThanhToan: new Date().toISOString(),
      hinhThuc: 'chuyen_khoan',
      ghiChu: 'Test payment'
    });
    console.log(`Created ThanhToan with ID: ${ttId}`);
    
    const payments = await db.thanhToan.listByCustomer('KH001');
    console.log(`Payments for KH001: ${payments.length}`);
    const latest = payments.find(p => p.id === ttId);
    if (latest) {
      console.log('✅ ThanhToan retrieved successfully');
      console.log(`   Amount: ${latest.tongTienPhatSinh}, Paid: ${latest.soTienDaThanhToan}, Balance: ${latest.conNo}`);
    } else {
      console.log('❌ Failed to retrieve the created payment');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDB();
