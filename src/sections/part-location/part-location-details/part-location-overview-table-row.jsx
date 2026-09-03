import React from 'react';

import { GenericTableRow } from 'src/components/table';

import { PART_LOCATION_OVERVIEW_TABLE_COLUMNS } from './part-location-overview-table-config';

export default function PartLocationOverviewTableRow({
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
      columns={PART_LOCATION_OVERVIEW_TABLE_COLUMNS}
      selected={selected}
      onSelectRow={onSelectRow}
      visibleColumns={visibleColumns}
      disabledColumns={disabledColumns}
      columnOrder={columnOrder}
    />
  );
}
