import { TABLE_COLUMNS } from 'src/sections/driver/driver-table-config';

import GenericListPdf from './generic-list-pdf';

export default function DriverListPdf({ drivers, tenant, visibleColumns = [] }) {
  const columnsToShow =
    (visibleColumns && visibleColumns.length
      ? visibleColumns.map((id) => TABLE_COLUMNS.find((c) => c.id === id)).filter(Boolean)
      : TABLE_COLUMNS.filter((c) => c.defaultVisible)) || [];

  return (
    <GenericListPdf
      title="Driver List"
      rows={drivers}
      columns={columnsToShow}
      orientation="portrait"
      tenant={tenant}
      visibleColumns={visibleColumns}
    />
  );
}
