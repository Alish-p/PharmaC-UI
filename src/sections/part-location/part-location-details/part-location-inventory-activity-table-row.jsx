import React from 'react';

import { GenericTableRow } from 'src/components/table';

import { PART_LOCATION_INVENTORY_ACTIVITY_TABLE_COLUMNS } from './part-location-inventory-activity-table-config';

export default function PartLocationInventoryActivityTableRow({
  row,
  selected,
  onSelectRow,
  visibleColumns,
  disabledColumns,
  columnOrder,
}) {
  return (
    <GenericTableRow
      row={row}
      columns={PART_LOCATION_INVENTORY_ACTIVITY_TABLE_COLUMNS}
      selected={selected}
      onSelectRow={onSelectRow}
      visibleColumns={visibleColumns}
      disabledColumns={disabledColumns}
      columnOrder={columnOrder}
    />
  );
}
