import { Page, Font, Document } from '@react-pdf/renderer';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fDateRangeShortLabel } from 'src/utils/format-time';

import PDFTable from 'src/pdfs/common/PDFTable';
import PDFBillToSection from 'src/pdfs/common/PDFBillTo';
import PDFInvoiceFooter from 'src/pdfs/common/PDFInvoiceFooter';
import { PDFTitle, PDFHeader, PDFStyles } from 'src/pdfs/common';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

export default function DriverSalaryPdf({ driverSalary, tenant }) {
  const {
    subtripSnapshot = [],
    summary = {},
    additionalPayments = [],
    additionalDeductions = [],
    driverId: driver,
    issueDate,
    billingPeriod,
    paymentId,
    status,
  } = driverSalary || {};

  const renderSalaryTable = () => {
    const headers = ['S.No', 'Date', 'Job No', 'From', 'Destination', 'Trip Salary'];
    const data = subtripSnapshot.map((st, idx) => [
      idx + 1,
      fDate(st.startDate),
      st.subtripNo,
      st.loadingPoint,
      st.unloadingPoint,
      fCurrency(st.totalDriverSalary || 0),
    ]);
    const colWidths = [2, 2, 2, 2, 2, 2];
    return <PDFTable headers={headers} data={data} columnWidths={colWidths} />;
  };

  const renderSummary = () => {
    const rows = [];
    rows.push(['', 'Trips Total', fCurrency(summary.totalTripWiseIncome)]);
    additionalPayments.forEach((p) => rows.push(['', p.label, fCurrency(p.amount)]));
    additionalDeductions.forEach((d) => rows.push(['', d.label, fCurrency(d.amount)]));
    rows.push(['', 'Net Total', fCurrency(summary.netIncome)]);
    return <PDFTable headers={['', '', '']} data={rows} columnWidths={[8, 2, 2]} hideHeader />;
  };

  return (
    <Document>
      <Page size="A4" style={PDFStyles.page} orientation="landscape">
        <PDFTitle title="Driver Salary Receipt" />
        <PDFHeader company={tenant} />

        <PDFBillToSection
          title="Driver Detail"
          billToDetails={[
            driver?.driverName,
            driver?.driverPresentAddress,
            `Phone: ${driver?.driverCellNo}`,
            driver?.bankDetails?.name &&
              `Bank: ${driver.bankDetails.name} A/C: ${driver.bankDetails.accNo || ''} IFSC: ${driver.bankDetails.ifsc || ''}`.trim(),
          ].filter(Boolean)}
          metaDetails={[
            ['Salary No.', paymentId],
            ['Date', fDate(issueDate)],
            ['Billing Period', fDateRangeShortLabel(billingPeriod.start, billingPeriod.end)],
            ['Status', status?.toUpperCase()],
          ]}
        />

        {renderSalaryTable()}
        {renderSummary()}

        <PDFInvoiceFooter
          declaration="This is a system-generated driver salary voucher."
          signatory={`For ${tenant.name}`}
        />
      </Page>
    </Document>
  );
}
