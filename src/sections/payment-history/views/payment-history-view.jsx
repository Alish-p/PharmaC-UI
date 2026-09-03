/* eslint-disable react/no-unstable-nested-components */
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { PDFDownloadButton } from 'src/pdfs/common';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export function PaymentHistoryView({ payments = [], tenant }) {
  const getDocument = (payment) => async () => {
    const { default: PaymentReceiptPdf } = await import('src/pdfs/payment-receipt-pdf');
    return () => <PaymentReceiptPdf payment={payment} tenant={tenant} />;
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Payment History"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Payments' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Receipt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{fCurrency(row.amount)}</TableCell>
                <TableCell>{fDate(row.paymentDate)}</TableCell>
                <TableCell>{row.paymentMethod}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.notes || '-'}</TableCell>
                <TableCell>
                  <PDFDownloadButton
                    buttonText="PDF"
                    fileName={`payment-${index + 1}.pdf`}
                    getDocument={getDocument(row)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardContent>
  );
}
