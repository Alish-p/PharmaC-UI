import { TABLE_COLUMNS } from 'src/sections/trip/trip-table-config';

import GenericListPdf from './generic-list-pdf';

export default function TripListPdf({ trips, visibleColumns = [], tenant }) {
  const columnsToShow =
    (visibleColumns && visibleColumns.length
      ? visibleColumns.map((id) => TABLE_COLUMNS.find((c) => c.id === id)).filter(Boolean)
      : TABLE_COLUMNS.filter((c) => c.defaultVisible)) || [];

  return (
    <GenericListPdf
      title="Trip List"
      rows={trips}
      columns={columnsToShow}
      orientation="landscape"
      tenant={tenant}
      visibleColumns={visibleColumns}
    />
  );
}
