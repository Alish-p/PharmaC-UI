import { fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { exportToExcel } from './export-multi-sheet-to-excel';

export const exportBillingSummaryToExcel = async (
  summary,
  fileName = 'customer-billing-summary'
) => {
  const formatPayments = (payments) =>
    (payments || [])
      .map(
        (p) =>
          `${fNumber(p.amount)} received on ${fDateTime(p.paidAt)}${p.referenceNumber ? ` against ${p.referenceNumber}` : ''}`
      )
      .join('\n');

  const mapInvoices = (invoices) =>
    (invoices || []).map((inv, idx) => ({
      'S.No': idx + 1,
      'Invoice No': inv.invoiceNo,
      'Customer Name': inv.customerName,
      Status: inv.invoiceStatus,
      'Issue Date': fDateTime(inv.issueDate),
      'Due Date': fDateTime(inv.dueDate),
      'Net Total': inv.netTotal,
      'Total Received': inv.totalReceived,
      'Pending Amount': (inv.netTotal || 0) - (inv.totalReceived || 0),
      Payments: formatPayments(inv.payments),
    }));

  const mapSubtrips = (subtrips) =>
    (subtrips || []).map((st, idx) => ({
      'S.No': idx + 1,
      'Job No': st.subtripNo,
      'Customer Name': st.customerName,
      'Vehicle No': st.vehicleNo,
      Driver: st.driver,
      'Start Date': fDateTime(st.startDate),
      'Received Date': fDateTime(st.receivedDate),
      'Job Type': st.subtripType,

      'Loading Point': st.loadingPoint,
      'Unloading Point': st.unloadingPoint,
      'Loading Weight': st.loadingWeight,
      Rate: st.rate,
      'Freight Amount': (st.rate || 0) * (st.loadingWeight || 0),
    }));

  const pendingInvoices = mapInvoices(summary?.pendingInvoices);
  const receivedInvoices = mapInvoices(summary?.receivedInvoices);
  const unbilledSubtrips = mapSubtrips(summary?.unbilledSubtrips);

  const addInvoiceTotals = (data, invoices) => {
    if (!data.length) return;
    const totals = (invoices || []).reduce(
      (acc, inv) => ({
        netTotal: acc.netTotal + (inv.netTotal || 0),
        totalReceived: acc.totalReceived + (inv.totalReceived || 0),
        pendingAmount: acc.pendingAmount + (inv.netTotal || 0) - (inv.totalReceived || 0),
      }),
      { netTotal: 0, totalReceived: 0, pendingAmount: 0 }
    );
    data.push({
      'S.No': '',
      'Invoice No': 'Total',
      'Customer Name': '',
      Status: '',
      'Issue Date': '',
      'Due Date': '',
      'Net Total': totals.netTotal,
      'Total Received': totals.totalReceived,
      'Pending Amount': totals.pendingAmount,
      Payments: '',
    });
  };

  const addSubtripTotals = (data, subtrips) => {
    if (!data.length) return;
    const totals = (subtrips || []).reduce(
      (acc, st) => ({
        loadingWeight: acc.loadingWeight + (st.loadingWeight || 0),
        freightAmount: acc.freightAmount + (st.rate || 0) * (st.loadingWeight || 0),
      }),
      { loadingWeight: 0, freightAmount: 0 }
    );
    data.push({
      'S.No': '',
      'Job No': 'Total',
      'Customer Name': '',
      'Vehicle No': '',
      Driver: '',
      'Start Date': '',
      'Received Date': '',
      'Job Type': '',
      'Loading Point': '',
      'Unloading Point': '',
      'Loading Weight': totals.loadingWeight,
      Rate: '',
      'Freight Amount': totals.freightAmount,
    });
  };

  addInvoiceTotals(pendingInvoices, summary?.pendingInvoices);
  addInvoiceTotals(receivedInvoices, summary?.receivedInvoices);
  addSubtripTotals(unbilledSubtrips, summary?.unbilledSubtrips);

  await exportToExcel(
    [
      {
        name: 'Pending Invoices',
        data: pendingInvoices,
        options: { highlightColumns: ['Pending Amount'] },
      },
      { name: 'Received Invoices', data: receivedInvoices },
      { name: 'Unbilled Jobs', data: unbilledSubtrips },
    ],
    fileName
  );
};

export default exportBillingSummaryToExcel;
