import { INVENTORY_ACTIVITY_TABLE_COLUMNS } from 'src/sections/part/part-details/part-inventory-activity-table-config';

import GenericListPdf from './generic-list-pdf';

export default function PartInventoryActivityListPdf({ activities, tenant, visibleColumns = [] }) {
  const defaultIds = INVENTORY_ACTIVITY_TABLE_COLUMNS.map((c) => c.id);

  const ids = visibleColumns.length ? visibleColumns : defaultIds;
  const columnsToShow = ids
    .map((id) => INVENTORY_ACTIVITY_TABLE_COLUMNS.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <GenericListPdf
      title="Part Inventory Activity"
      rows={activities}
      columns={columnsToShow}
      orientation="landscape"
      tenant={tenant}
      visibleColumns={ids}
    />
  );
}
