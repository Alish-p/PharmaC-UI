import { TABLE_COLUMNS } from 'src/sections/customer/customer-table-config';

import GenericListPdf from './generic-list-pdf';

export default function CustomerListPdf({ customers, tenant, visibleColumns = [] }) {
  const columnsToShow =
    (visibleColumns && visibleColumns.length
      ? visibleColumns.map((id) => TABLE_COLUMNS.find((c) => c.id === id)).filter(Boolean)
      : TABLE_COLUMNS.filter((c) => c.defaultVisible)) || [];

  return (
    <GenericListPdf
      title="Customer List"
      rows={customers}
      columns={columnsToShow}
      orientation="landscape"
      tenant={tenant}
      visibleColumns={visibleColumns}
    />
  );
}
