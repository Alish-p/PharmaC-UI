import { Page, Font, Document } from '@react-pdf/renderer';

import { fNumber } from 'src/utils/format-number';
import { fDateRangeShortLabel } from 'src/utils/format-time';

import { PDFTitle, PDFHeader, PDFStyles, NewPDFTable } from 'src/pdfs/common';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

export default function VehiclePnlPdf({ vehicleNo, startDate, endDate, subtrips = [], tenant }) {
  const columns = [
    { header: 'S.No', accessor: 'sno', width: '4%' },
    { header: 'ID', accessor: 'id', width: '8%' },
    { header: 'Customer', accessor: 'customer', width: '18%' },
    { header: 'Route', accessor: 'route', width: '18%' },
    { header: 'Date', accessor: 'date', width: '10%' },
    {
      header: 'Weight',
      accessor: 'weight',
      width: '8%',
      align: 'right',
      showTotal: true,
      formatter: (v) => fNumber(v),
    },
    { header: 'Rate', accessor: 'rate', width: '8%', align: 'right', formatter: (v) => fNumber(v) },
    {
      header: 'Amount',
      accessor: 'amount',
      width: '10%',
      align: 'right',
      showTotal: true,
      formatter: (v) => fNumber(v),
    },
    {
      header: 'Expense',
      accessor: 'expense',
      width: '8%',
      align: 'right',
      showTotal: true,
      formatter: (v) => fNumber(v),
    },
    {
      header: 'Net Profit',
      accessor: 'netProfit',
      width: '8%',
      align: 'right',
      showTotal: true,
      formatter: (v) => fNumber(v),
    },
  ];

  const tableData = subtrips.map((st, idx) => ({
    sno: idx + 1,
    id: st._id || '-',
    customer: st.customerName || '-',
    route:
      (st.loadingPoint && st.unloadingPoint ? `${st.loadingPoint} → ${st.unloadingPoint}` : '-') ||
      '-',
    date: fDateRangeShortLabel(st.startDate, st.endDate),
    weight: st.loadingWeight,
    rate: st.freightDetails?.rate || 0,
    amount: st.amt || 0,
    expense: st.totalExpense || 0,
    netProfit: (st.amt || 0) - (st.totalExpense || 0),
  }));

  return (
    <Document>
      <Page size="A4" style={PDFStyles.page} orientation="landscape">
        <PDFTitle
          title={`Vehicle P&L Report ${vehicleNo}(${fDateRangeShortLabel(startDate, endDate)})`}
        />
        <PDFHeader company={tenant} />

        {/* Subtrip Table */}
        <NewPDFTable columns={columns} data={tableData} showTotals totalRowLabel="TOTAL" />
      </Page>
    </Document>
  );
}
