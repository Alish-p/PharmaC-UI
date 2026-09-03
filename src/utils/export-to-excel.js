/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { fNumber } from './format-number';

// ===== ExcelJS version (professional styling) =====
export const exportToExcel = async (data, fileName) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tranzit';
  workbook.created = new Date();

  const sheetName = 'Job Report';
  const ws = workbook.addWorksheet(sheetName, {
    properties: { defaultRowHeight: 18 },
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // Global default font
  ws.properties.defaultRowHeight = 18;
  ws.eachRow((row) => {
    row.font = { name: 'Calibri', size: 11 };
  });

  if (!Array.isArray(data) || data.length === 0) {
    // Still create an empty sheet
    const bufferEmpty = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([bufferEmpty]), `${fileName}.xlsx`);
    return;
  }

  // Palette (subtle, professional)
  const C = {
    headerBg: 'FFF2F3F5', // light grey
    headerFont: 'FF333333', // dark grey
    grid: 'FFE6E7EA', // very light grid
    zebra: 'FFF9FAFB', // soft zebra
    white: 'FFFFFFFF',
    totalLine: 'FFBFC5CC', // slightly stronger rule
  };

  const headers = Object.keys(data[0]);

  // Widths
  const computeWidth = (v) => {
    if (v == null) return 0;
    // simple width heuristic
    return String(v).length;
  };

  const colWidths = headers.map((h, idx) => {
    let maxLen = computeWidth(h);
    for (let r = 0; r < data.length; r++) {
      const val = data[r][headers[idx]];
      const len = computeWidth(val);
      if (len > maxLen) maxLen = len;
    }
    // padding and sane bounds
    return Math.min(Math.max(maxLen + 4, 10), 50);
  });

  ws.columns = headers.map((header, i) => ({
    header,
    key: header,
    width: colWidths[i],
    style: { font: { name: 'Calibri', size: 11 } },
  }));

  // Add rows
  ws.addRows(data);

  // Header styling (row 1)
  const headerRow = ws.getRow(1);
  headerRow.height = 18;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.headerFont } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    cell.border = {
      bottom: { style: 'thin', color: { argb: C.grid } },
    };
  });

  const isNumericLike = (val) =>
    typeof val === 'number' ||
    (typeof val === 'string' && val.trim() !== '' && !Number.isNaN(Number(val)));

  const shouldWrap = (val) => {
    if (val == null) return false;
    const s = String(val);
    return s.includes('\n') || s.length > 40;
  };

  // Body styling
  for (let r = 2; r <= ws.rowCount; r++) {
    const zebra = r % 2 === 0 ? C.white : C.zebra;
    const row = ws.getRow(r);
    row.height = 18;

    row.eachCell((cell) => {
      const raw = cell.value;

      // Alignment: numbers right, text left
      const align = isNumericLike(raw) ? 'right' : 'left';
      cell.alignment = {
        vertical: 'middle',
        horizontal: align,
        wrapText: shouldWrap(raw),
      };

      // Fill (zebra)
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebra } };

      // Subtle grid
      cell.border = {
        top: { style: 'thin', color: { argb: C.grid } },
        left: { style: 'thin', color: { argb: C.grid } },
        bottom: { style: 'thin', color: { argb: C.grid } },
        right: { style: 'thin', color: { argb: C.grid } },
      };

      // Optional: numeric formatting (don’t force commas if you already pass formatted strings)
      if (typeof raw === 'number') {
        cell.numFmt = '#,##0.00'; // tweak if you prefer integers: '#,##0'
      }
    });
  }

  // TOTAL row (if present)
  const last = ws.getRow(ws.lastRow.number);
  const firstKey = headers[0];
  const totalCell = last.getCell(firstKey);
  if (String(totalCell.value).toUpperCase() === 'TOTAL') {
    last.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true };
      // subtle top rule to separate totals from data
      cell.border = {
        top: { style: 'thin', color: { argb: C.totalLine } },
        left: { style: 'thin', color: { argb: C.grid } },
        bottom: { style: 'thin', color: { argb: C.grid } },
        right: { style: 'thin', color: { argb: C.grid } },
      };
    });
  }

  // Download (browser)
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};

// ===== Unchanged: your formatter/aggregator =====
export function prepareDataForExport(data, columnConfig, visibleColumns = [], columnOrder = []) {
  let columns = columnConfig.filter((col) => visibleColumns.includes(col.id));
  if (columnOrder.length) {
    columns = columnOrder.map((id) => columns.find((col) => col.id === id)).filter(Boolean);
  }

  const parseNumber = (value) => {
    if (typeof value === 'number') return value;
    if (value == null) return 0;
    const cleaned = `${value}`.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const totals = {};

  const formattedRows = data.map((item) => {
    const row = {};
    columns.forEach((col) => {
      const value = col.getter(item);
      row[col.label] = value;

      if (col.showTotal) {
        const num = parseNumber(value);
        totals[col.id] = (totals[col.id] || 0) + num;
      }
    });
    return row;
  });

  if (Object.keys(totals).length > 0) {
    const totalRow = {};
    columns.forEach((col, index) => {
      if (index === 0) {
        totalRow[col.label] = 'TOTAL';
      } else if (col.showTotal) {
        totalRow[col.label] = fNumber(totals[col.id] || 0);
      } else {
        totalRow[col.label] = '';
      }
    });
    formattedRows.push(totalRow);
  }

  return formattedRows;
}
