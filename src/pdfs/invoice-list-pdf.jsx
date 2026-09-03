import { TABLE_COLUMNS } from 'src/sections/invoice/invoice-table-config';

import GenericListPdf from './generic-list-pdf';

export default function InvoiceListPdf({ invoices, visibleColumns = [], tenant }) {
  const columnsToShow =
    (visibleColumns && visibleColumns.length
      ? visibleColumns.map((id) => TABLE_COLUMNS.find((c) => c.id === id)).filter(Boolean)
      : TABLE_COLUMNS.filter((c) => c.defaultVisible)) || [];
  return (
    <GenericListPdf
      title="Invoice List"
      rows={invoices}
      columns={columnsToShow}
      orientation="landscape"
      tenant={tenant}
      visibleColumns={visibleColumns}
    />
  );
}
