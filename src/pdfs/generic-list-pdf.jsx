import { Page, Font, Document } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import {
  PDFTitle,
  PDFHeader,
  PDFFooter,
  PDFStyles,
  NewPDFTable,
  PDFDeclaration,
} from 'src/pdfs/common';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

export default function GenericListPdf({
  title,
  rows = [],
  columns = [],
  orientation = 'landscape',
  includeTotals,
  tenant,
  visibleColumns = [],
}) {
  // Accepts two shapes for columns:
  // A) Table-config columns: { id, label, getter?, align?, showTotal? }
  // B) Prebuilt PDF columns: { header, accessor, align?, width?, showTotal?, formatter? }

  const isPrebuilt = columns && columns[0] && (columns[0].header || columns[0].accessor);

  const parseNumber = (value) => {
    if (typeof value === 'number') return value;
    if (value == null) return 0;
    const cleaned = `${value}`.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  // Normalize to NewPDFTable column shape
  let orderedColumns;
  if (!isPrebuilt) {
    // columns are table-config; respect visibleColumns ordering when provided
    const base =
      Array.isArray(visibleColumns) && visibleColumns.length
        ? visibleColumns.map((id) => columns.find((c) => c.id === id)).filter(Boolean)
        : columns;
    orderedColumns = base.map((c) => ({
      header: c.label,
      accessor: c.id,
      align: c.align || 'left',
      showTotal: !!c.showTotal,
      // Supply a formatter for numeric totals and numeric-looking values
      formatter: c.showTotal
        ? (v) => (v == null || v === '' ? '-' : fNumber(typeof v === 'number' ? v : parseNumber(v)))
        : undefined,
    }));
  } else {
    orderedColumns = columns.map((c) => ({
      header: c.header,
      accessor: c.accessor,
      align: c.align || 'left',
      width: c.width,
      showTotal: !!c.showTotal,
      formatter: c.formatter,
    }));
  }

  // Widths: compact S.No and distribute the rest evenly unless specified
  const serialWidth = 6; // percent
  const remaining = Math.max(0, 100 - serialWidth);
  const perCol = orderedColumns.length > 0 ? remaining / orderedColumns.length : remaining;

  const tableColumns = [
    { header: 'S.No', accessor: '__serial', align: 'center', width: `${serialWidth}%` },
    ...orderedColumns.map((c) => ({
      ...c,
      width: c.width || `${perCol}%`,
    })),
  ];

  // Build data objects keyed by accessor.
  const data = rows.map((row, index) => {
    const obj = { __serial: index + 1 };
    if (!isPrebuilt) {
      // table-config style: use getter when available
      columns.forEach((orig) => {
        const isIncluded = tableColumns.find((tc) => tc.accessor === orig.id);
        if (!isIncluded) return;
        const raw = orig.getter ? orig.getter(row) : row?.[orig.id];
        if (orig.showTotal) {
          obj[orig.id] = parseNumber(raw);
        } else {
          obj[orig.id] = raw != null ? raw : '';
        }
      });
    } else {
      // prebuilt pdf columns: read raw value by accessor
      orderedColumns.forEach((c) => {
        const raw = row?.[c.accessor];
        obj[c.accessor] = c.showTotal ? parseNumber(raw) : raw != null ? raw : '';
      });
    }
    return obj;
  });

  const showTotals =
    typeof includeTotals === 'boolean' ? includeTotals : tableColumns.some((c) => c.showTotal);

  return (
    <Document>
      <Page size="A3" style={PDFStyles.page} orientation={orientation}>
        <PDFTitle title={title} />
        <PDFHeader company={tenant} />
        <PDFDeclaration content={`Report generated on ${fDate(new Date())}.`} />

        <NewPDFTable
          columns={tableColumns}
          data={data}
          showTotals={showTotals}
          totalRowLabel="TOTAL"
        />

        <PDFFooter additionalInfo={`Total ${title}: ${rows.length}`} />
      </Page>
    </Document>
  );
}
