const http = require('http');

function get(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body: body.substring(0, 400) }));
    }).on('error', e => resolve({ status: 'ERR', body: e.message }));
  });
}

function post(path, data) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost', port: 3000, path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    };
    const req = http.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body: body.substring(0, 500) }));
    });
    req.on('error', e => resolve({ status: 'ERR', body: e.message }));
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('\n=== RICENOW CRM - API Test Suite ===\n');

  // TEST 1: Auth API
  console.log('--- TEST 1: Authentication ---');
  const authCheck = await get('/api/auth/session');
  console.log(`Session check: ${authCheck.status}`);

  // TEST 2: KhachHang API (via internal bypass - check if route exists)
  console.log('\n--- TEST 2: Khách hàng API ---');
  const khRes = await get('/api/khach-hang');
  console.log(`GET /api/khach-hang → ${khRes.status}`);
  if (khRes.status === 200) {
    try { const d = JSON.parse(khRes.body); console.log(`  Data count: ${d.data?.length}`); } catch(e) { console.log('  Parse error'); }
  } else {
    console.log(`  Response: ${khRes.body.substring(0,100)}`);
  }

  // TEST 3: DonHang API  
  console.log('\n--- TEST 3: Đơn hàng API ---');
  const dhRes = await get('/api/don-hang?ngay=2024-04-20');
  console.log(`GET /api/don-hang?ngay=2024-04-20 → ${dhRes.status}`);

  // TEST 4: KeMon API
  console.log('\n--- TEST 4: Thực đơn API ---');
  const kmRes = await get('/api/ke-mon?ngay=2024-04-20&buoi=trua');
  console.log(`GET /api/ke-mon → ${kmRes.status}`);

  // TEST 5: TongHop API
  console.log('\n--- TEST 5: Tổng hợp API ---');
  const thRes = await get('/api/tong-hop?ngay=2024-04-20&buoi=trua');
  console.log(`GET /api/tong-hop → ${thRes.status}: ${thRes.body.substring(0,200)}`);

  // TEST 6: Check local_db.json exists
  console.log('\n--- TEST 6: Local DB File ---');
  const fs = require('fs');
  const path = require('path');
  const dbPath = path.join('d:/Vibecode/RicenowCRM/data', 'local_db.json');
  if (fs.existsSync(dbPath)) {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    console.log('  ✅ local_db.json exists');
    console.log(`  KhachHang rows: ${db.KhachHang?.length - 1}`);
    console.log(`  DonHang rows: ${db.DonHang?.length - 1}`);
    console.log(`  KeMon rows: ${db.KeMon?.length - 1}`);
    console.log(`  TongHopNgay rows: ${db.TongHopNgay?.length - 1}`);
  } else {
    console.log('  ❌ local_db.json NOT found - DB not initialized yet');
  }

  // TEST 7: ThanhToan API
  console.log('\n--- TEST 7: Thanh Toán API ---');
  const ttRes = await get('/api/thanh-toan');
  console.log(`GET /api/thanh-toan → ${ttRes.status}: ${ttRes.body.substring(0,200)}`);

  console.log('\n=== Test Complete ===');
}

runTests();
