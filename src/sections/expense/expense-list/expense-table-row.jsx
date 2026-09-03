import React from 'react';

import { GenericTableRow } from 'src/components/table';

import { TABLE_COLUMNS } from '../expense-table-config';

// ----------------------------------------------------------------------

export default function ExpenseTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  visibleColumns,
  disabledColumns,
  columnOrder,
}) {
  const handleView = onViewRow ? () => onViewRow(row._id) : undefined;
  const handleEdit = onEditRow ? () => onEditRow(row._id) : undefined;
  const handleDelete = onDeleteRow ? () => onDeleteRow(row._id) : undefined;

  const isCancelled = row?.status === 'cancelled' || row?.isDeleted;

  return (
    <GenericTableRow
      row={row}
      columns={TABLE_COLUMNS}
      selected={selected}
      onSelectRow={onSelectRow}
      onViewRow={handleView}
      onEditRow={handleEdit}
      editDisabled={isCancelled}
      editDisabledReason={isCancelled ? 'Disabled: Expense is cancelled' : ''}
      onDeleteRow={handleDelete}
      deleteDisabled={isCancelled}
      deleteDisabledReason={isCancelled ? 'Disabled: Expense is already cancelled' : ''}
      visibleColumns={visibleColumns}
      disabledColumns={disabledColumns}
      columnOrder={columnOrder}
    />
  );
}
