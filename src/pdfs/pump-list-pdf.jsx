import { TABLE_COLUMNS } from 'src/sections/pump/pump-table-config';

import GenericListPdf from './generic-list-pdf';

export default function PumpListPdf({ pumps, tenant, visibleColumns = [] }) {
  const columnsToShow =
    (visibleColumns && visibleColumns.length
      ? visibleColumns.map((id) => TABLE_COLUMNS.find((c) => c.id === id)).filter(Boolean)
      : TABLE_COLUMNS.filter((c) => c.defaultVisible)) || [];

  return (
    <GenericListPdf
      title="Pump List"
      rows={pumps}
      columns={columnsToShow}
      orientation="landscape"
      tenant={tenant}
      visibleColumns={visibleColumns}
    />
  );
}
