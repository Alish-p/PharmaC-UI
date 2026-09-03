import ExcelJS from 'exceljs';

export async function parseImportFile(file, columns = []) {
  const jsonData = [];

  // Create a map of Label -> Key
  const columnMap = {};
  if (columns.length > 0) {
    columns.forEach((col) => {
      columnMap[col.label] = col.key;
    });
  }

  const mapHeaderToKey = (header) => columnMap[header] || header;

  if (file.name.endsWith('.csv')) {
    const text = await file.text();
    const rows = text.split(/\r?\n/);
    const headers = rows[0].split(',').map((h) => mapHeaderToKey(h.trim()));

    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      if (row.trim()) {
        // Handle quoted values (simple implementation)
        // For more complex CSVs, a library like papaparse is recommended
        const values = [];
        let currentVal = '';
        let inQuotes = false;

        for (let j = 0; j < row.length; j += 1) {
          const char = row[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentVal.trim());
            currentVal = '';
          } else {
            currentVal += char;
          }
        }
        values.push(currentVal.trim());

        const rowData = {};
        let hasData = false;

        headers.forEach((header, index) => {
          if (header && values[index] !== undefined) {
            // Remove quotes if present
            let val = values[index];
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1);
            }
            rowData[header] = val;
            hasData = true;
          }
        });

        if (hasData) jsonData.push(rowData);
      }
    }
  } else {
    // XLSX
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) return [];

    const headers = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = mapHeaderToKey(cell.value);
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData = {};
      let hasData = false;

      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          let { value } = cell;
          if (typeof value === 'object' && value !== null) {
            if (value.text) value = value.text;
            else if (value.result) value = value.result;
          }
          rowData[header] = value;
          hasData = true;
        }
      });

      if (hasData) jsonData.push(rowData);
    });
  }

  return jsonData;
}

export async function generateTemplate(columns) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Template');

  // Add headers
  const headers = columns.map((col) => col.label);
  worksheet.addRow(headers);

  // Add sample row (optional, based on types)
  const sampleRow = columns.map((col) => {
    if (col.type === 'number') return 0;
    return `Sample ${col.label}`;
  });
  worksheet.addRow(sampleRow);

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
