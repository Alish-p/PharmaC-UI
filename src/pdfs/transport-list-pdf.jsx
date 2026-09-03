import { TABLE_COLUMNS } from 'src/sections/transporter/transporter-table-config';

import GenericListPdf from './generic-list-pdf';

export default function TransporterListPdf({ transporters, tenant, visibleColumns = [] }) {
  const columnsToShow =
    (visibleColumns && visibleColumns.length
      ? visibleColumns.map((id) => TABLE_COLUMNS.find((c) => c.id === id)).filter(Boolean)
      : TABLE_COLUMNS.filter((c) => c.defaultVisible)) || [];

  return (
    <GenericListPdf
      title="Transporter List"
      rows={transporters}
      columns={columnsToShow}
      orientation="landscape"
      tenant={tenant}
      visibleColumns={visibleColumns}
    />
  );
}
