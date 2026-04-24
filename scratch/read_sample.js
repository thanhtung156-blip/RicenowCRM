const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'Sample_excel_1.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('--- SHEETS ---');
console.log(workbook.SheetNames);

workbook.SheetNames.forEach(name => {
  console.log(`\n--- ${name} (First 10 rows) ---`);
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  data.slice(0, 10).forEach(row => {
    console.log(JSON.stringify(row));
  });
});
