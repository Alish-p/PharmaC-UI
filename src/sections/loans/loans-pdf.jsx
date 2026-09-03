/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { Font, Page, Document } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import PDFBillToSection from 'src/pdfs/common/PDFBillTo';
import PDFInvoiceFooter from 'src/pdfs/common/PDFInvoiceFooter';
import { PDFTitle, PDFTable, PDFHeader, PDFStyles } from 'src/pdfs/common';

// register your font
Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

export default function LoansPdf({ loan, tenant }) {
  const {
    _id,
    loanNo,
    borrowerId: b,
    createdAt,
    disbursementDate,
    principalAmount,
    outstandingBalance,
    status,
    remarks,
    payments = [],
  } = loan || {};

  // Payment history table
  const paymentHeaders = ['#', 'Date', 'Amount', 'Source', 'Remarks'];
  const paymentData = useMemo(
    () =>
      payments.map((p, idx) => [
        idx + 1,
        fDate(p.paymentDate),
        fCurrency(p.amount),
        p.source || 'Manual',
        p.remarks || '-',
      ]),
    [payments]
  );

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Summary rows
  const summaryData = [
    ['Loan Amount', fCurrency(principalAmount)],
    ['Total Paid', fCurrency(totalPaid)],
    ['Outstanding Balance', fCurrency(outstandingBalance)],
  ];

  // BillTo (borrower) details
  const billToDetails = [
    b?.driverName || b?.transportName,
    b?.driverPresentAddress || b?.address,
    (b?.driverCellNo || b?.cellNo) && `Phone: ${b?.driverCellNo || b?.cellNo}`,
    b?.driverLicenceNo && `License: ${b.driverLicenceNo}`,
    b?.bankDetails?.name && `Bank: ${b.bankDetails.name}`,
    b?.bankDetails?.branch && `Branch: ${b.bankDetails.branch}`,
    b?.bankDetails?.ifsc && `IFSC: ${b.bankDetails.ifsc}`,
    b?.bankDetails?.accNo && `A/C: ${b.bankDetails.accNo}`,
  ].filter(Boolean);

  const metaDetails = [
    ['Loan No.', loanNo || _id],
    ['Created', fDate(createdAt)],
    ['Issued', fDate(disbursementDate)],
    ['Status', status?.toUpperCase()],
  ];

  return (
    <Document>
      <Page size="A4" style={PDFStyles.page} orientation="landscape">
        <PDFTitle title="Loan / Advance Summary" />
        <PDFHeader company={tenant} />

        <PDFBillToSection
          title="Borrower Details"
          billToDetails={billToDetails}
          metaDetails={metaDetails}
        />

        {payments.length > 0 && (
          <PDFTable headers={paymentHeaders} data={paymentData} columnWidths={[1, 2, 2, 3, 3]} />
        )}

        <PDFTable headers={['', '']} data={summaryData} columnWidths={[10, 2]} hideHeader />

        <PDFInvoiceFooter declaration={remarks} signatory={`For ${tenant.name}`} />
      </Page>
    </Document>
  );
}
