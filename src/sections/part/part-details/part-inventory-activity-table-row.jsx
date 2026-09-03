import React from 'react';

import { GenericTableRow } from 'src/components/table';

import { INVENTORY_ACTIVITY_TABLE_COLUMNS } from './part-inventory-activity-table-config';

export default function PartInventoryActivityTableRow({
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
      columns={INVENTORY_ACTIVITY_TABLE_COLUMNS}
      selected={selected}
      onSelectRow={onSelectRow}
      visibleColumns={visibleColumns}
      disabledColumns={disabledColumns}
      columnOrder={columnOrder}
    />
  );
}
