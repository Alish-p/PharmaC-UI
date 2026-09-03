import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const C = {
  headerBg: 'FFF2F3F5',
  headerFont: 'FF333333',
  grid: 'FFE6E7EA',
  zebra: 'FFF9FAFB',
  white: 'FFFFFFFF',
  highlight: 'FFFFF3CD',
};

const isNumericLike = (val) =>
  typeof val === 'number' ||
  (typeof val === 'string' && val.trim() !== '' && !Number.isNaN(Number(val)));

const shouldWrap = (val) => {
  if (val == null) return false;
  const s = String(val);
  return s.includes('\n') || s.length > 40;
};

export function addSheet(workbook, sheetName, data, options = {}) {
  const { highlightColumns = [], prependInfoRows = [] } = options;
  const ws = workbook.addWorksheet(sheetName, {
    properties: { defaultRowHeight: 18 },
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.properties.defaultRowHeight = 18;
  ws.eachRow((row) => {
    row.font = { name: 'Calibri', size: 11 };
  });

  if (!Array.isArray(data) || data.length === 0) {
    return;
  }

  const headers = Object.keys(data[0]);
  const computeWidth = (v) => {
    if (v == null) return 0;
    return String(v).length;
  };
  const colWidths = headers.map((h, idx) => {
    let maxLen = computeWidth(h);
    for (let r = 0; r < data.length; r += 1) {
      const len = computeWidth(data[r][headers[idx]]);
      if (len > maxLen) maxLen = len;
    }
    return Math.min(Math.max(maxLen + 4, 10), 50);
  });

  ws.columns = headers.map((header, i) => ({
    header,
    key: header,
    width: colWidths[i],
    style: { font: { name: 'Calibri', size: 11 } },
  }));

  ws.addRows(data);

  // If we need to prepend informational rows above the header, insert them now
  const infoCount = Array.isArray(prependInfoRows) ? prependInfoRows.length : 0;
  if (infoCount > 0) {
    // Insert rows at the top (row index 1) in reverse to keep order
    for (let i = infoCount - 1; i >= 0; i -= 1) {
      const text = prependInfoRows[i];
      ws.spliceRows(1, 0, [text]);
      // Merge info cell across all columns and style
      if (headers.length > 0) {
        ws.mergeCells(1, 1, 1, headers.length);
      }
      const infoRow = ws.getRow(1);
      infoRow.height = 20;
      const cell = infoRow.getCell(1);
      cell.font = { name: 'Calibri', size: 12, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.highlight } };
      cell.border = {
        bottom: { style: 'thin', color: { argb: C.grid } },
      };
    }
  }

  // Style header row (now shifted down by info rows, if any)
  const headerRowIndex = 1 + infoCount;
  // Ensure freeze panes keep info + header visible
  ws.views = [{ state: 'frozen', ySplit: headerRowIndex }];
  const headerRow = ws.getRow(headerRowIndex);
  headerRow.height = 18;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.headerFont } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    cell.border = {
      bottom: { style: 'thin', color: { argb: C.grid } },
    };
  });

  // Apply body styling and zebra stripes starting after header row
  for (let r = headerRowIndex + 1; r <= ws.rowCount; r += 1) {
    const zebra = r % 2 === 0 ? C.white : C.zebra;
    const row = ws.getRow(r);
    row.height = 18;
    row.eachCell((cell, colNumber) => {
      const raw = cell.value;
      const align = isNumericLike(raw) ? 'right' : 'left';
      const header = headers[colNumber - 1];
      const isHighlight = highlightColumns.includes(header);
      cell.alignment = {
        vertical: 'middle',
        horizontal: align,
        wrapText: shouldWrap(raw),
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isHighlight ? C.highlight : zebra },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: C.grid } },
        left: { style: 'thin', color: { argb: C.grid } },
        bottom: { style: 'thin', color: { argb: C.grid } },
        right: { style: 'thin', color: { argb: C.grid } },
      };
      if (typeof raw === 'number') {
        cell.numFmt = '#,##0.00';
      }
    });
  }
}

export const exportToExcel = async (sheets, fileName = 'data') => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tranzit';
  workbook.created = new Date();

  sheets.forEach(({ name, data, options }) => {
    addSheet(workbook, name, data, options);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};

export default exportToExcel;
