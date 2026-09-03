import { fDateTime } from 'src/utils/format-time';

import { exportToExcel } from './export-multi-sheet-to-excel';

const mapPayments = (payments) =>
  (payments || []).map((p, idx) => ({
    'S.No': idx + 1,
    'Payment ID': p.paymentId,
    'Transporter Name': p.transporterName,
    'Issue Date': fDateTime(p.issueDate),
    Status: p.status,
    'Net Payment': p.netIncome,
  }));

const mapSubtrips = (subtrips) =>
  (subtrips || []).map((st, idx) => ({
    'S.No': idx + 1,
    'Job No': st.subtripNo,
    'Customer Name': st.customerName,
    'Loading Point': st.loadingPoint,
    'Unloading Point': st.unloadingPoint,
    'Start Date': fDateTime(st.startDate),
    'End Date': fDateTime(st.endDate),
    'Loading Weight': st.loadingWeight,
    Rate: st.rate,
    Transporter: st.transporter,
    'Vehicle No': st.vehicleNo,
    Driver: st.driver,
    'Total Freight Amount': st.totalFreightAmount,
    'Total Expense': st.totalExpense,
    'Total Shortage Amount': st.totalShortageAmount,
    'Total Transporter Payment': st.totalTransporterPayment,
  }));

export const exportTransporterPaymentSummaryToExcel = async (
  summary,
  fileName = 'transporter-payment-summary'
) => {
  const pendingTransporterPayments = mapSubtrips(summary?.pendingTransporterPayments);
  const payablePayments = mapPayments(summary?.payablePayments);
  const paidPayments = mapPayments(summary?.paidPayments);

  if (pendingTransporterPayments.length) {
    const totals = (summary?.pendingTransporterPayments || []).reduce(
      (acc, st) => ({
        freight: acc.freight + (st.totalFreightAmount || 0),
        expense: acc.expense + (st.totalExpense || 0),
        shortage: acc.shortage + (st.totalShortageAmount || 0),
        payment: acc.payment + (st.totalTransporterPayment || 0),
      }),
      { freight: 0, expense: 0, shortage: 0, payment: 0 }
    );

    pendingTransporterPayments.push({
      'S.No': '',
      'Job No': 'Total',
      'Customer Name': '',
      'Loading Point': '',
      'Unloading Point': '',
      'Start Date': '',
      'End Date': '',
      'Loading Weight': '',
      Rate: '',
      Transporter: '',
      'Vehicle No': '',
      Driver: '',
      'Total Freight Amount': totals.freight,
      'Total Expense': totals.expense,
      'Total Shortage Amount': totals.shortage,
      'Total Transporter Payment': totals.payment,
    });
  }

  const calcNetTotal = (payments) =>
    (payments || []).reduce((sum, p) => sum + (p.netIncome || 0), 0);

  if (payablePayments.length) {
    payablePayments.push({
      'S.No': '',
      'Payment ID': 'Total',
      'Transporter Name': '',
      'Issue Date': '',
      Status: '',
      'Net Payment': calcNetTotal(summary?.payablePayments),
    });
  }

  if (paidPayments.length) {
    paidPayments.push({
      'S.No': '',
      'Payment ID': 'Total',
      'Transporter Name': '',
      'Issue Date': '',
      Status: '',
      'Net Payment': calcNetTotal(summary?.paidPayments),
    });
  }

  await exportToExcel(
    [
      { name: 'Pending Jobs', data: pendingTransporterPayments },
      { name: 'Payable Payments', data: payablePayments },
      { name: 'Paid Payments', data: paidPayments },
    ],
    fileName
  );
};

export default exportTransporterPaymentSummaryToExcel;
