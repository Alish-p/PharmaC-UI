import { TABLE_COLUMNS } from 'src/sections/transporter-payment/transporter-payment-table-config';

import GenericListPdf from './generic-list-pdf';

// ----------------------------------------------------------------------

export default function TransporterPaymentListPdf({ payments, tenant, visibleColumns = [] }) {
  const defaultIds = ['paymentId', 'transporter', 'status', 'issueDate', 'amount'];
  const ids = visibleColumns.length ? visibleColumns : defaultIds;
  const columnsToShow = ids.map((id) => TABLE_COLUMNS.find((c) => c.id === id)).filter(Boolean);

  return (
    <GenericListPdf
      title="Transporter Payments"
      rows={payments}
      columns={columnsToShow}
      orientation="landscape"
      includeTotals
      tenant={tenant}
      visibleColumns={ids}
    />
  );
}
