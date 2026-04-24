const xlsx = require('xlsx');
const path = require('path');

function checkExcel() {
  try {
    const excelPath = path.resolve(__dirname, '../Sample_excel_1.xlsx');
    const workbook = xlsx.readFile(excelPath);
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      console.log(`\n=== Sheet: ${sheetName} ===`);
      for (let i = 0; i < Math.min(10, data.length); i++) {
        console.log(`Row ${i}:`, data[i]);
      }
    });
  } catch (err) {
    console.error("Error reading excel:", err);
  }
}

checkExcel();
