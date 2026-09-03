import React from 'react';

import { GenericTableRow } from 'src/components/table';

import { TABLE_COLUMNS } from './part-location-table-config';

export default function PartLocationTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  visibleColumns,
  disabledColumns,
  columnOrder,
  hideSelection,
}) {
  const handleView = onViewRow ? () => onViewRow(row._id) : undefined;
  const handleEdit = onEditRow ? () => onEditRow(row._id) : undefined;
  const handleDelete = onDeleteRow ? () => onDeleteRow(row._id) : undefined;

  return (
    <GenericTableRow
      row={row}
      columns={TABLE_COLUMNS}
      selected={selected}
      onSelectRow={onSelectRow}
      onViewRow={handleView}
      onEditRow={handleEdit}
      onDeleteRow={handleDelete}
      visibleColumns={visibleColumns}
      disabledColumns={disabledColumns}
      columnOrder={columnOrder}
      hideSelection={hideSelection}
    />
  );
}
