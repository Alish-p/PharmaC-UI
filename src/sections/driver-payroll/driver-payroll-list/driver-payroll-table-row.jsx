import React, { useMemo } from 'react';

import Button from '@mui/material/Button';

import { useBoolean } from 'src/hooks/use-boolean';

import { GenericTableRow } from 'src/components/table';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { TABLE_COLUMNS } from './driver-payroll-table-config';

export default function DriverPayrollTableRow({
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
  const cancelConfirm = useBoolean();

  const handleView = onViewRow ? () => onViewRow() : undefined;
  const handleEdit = onEditRow ? () => onEditRow() : undefined;

  const customActions = useMemo(() => {
    const actions = [];
    if (row?.status !== 'cancelled' && onDeleteRow) {
      actions.push({
        label: 'Cancel',
        icon: 'mdi:close-circle',
        color: 'error.main',
        onClick: () => cancelConfirm.onTrue(),
      });
    }
    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.status, onDeleteRow]);

  return (
    <>
      <GenericTableRow
        row={row}
        columns={TABLE_COLUMNS}
        selected={selected}
        onSelectRow={onSelectRow}
        onViewRow={handleView}
        onEditRow={handleEdit}
        customActions={customActions}
        visibleColumns={visibleColumns}
        disabledColumns={disabledColumns}
        columnOrder={columnOrder}
      />

      {onDeleteRow && row?.status !== 'cancelled' && (
        <ConfirmDialog
          open={cancelConfirm.value}
          onClose={cancelConfirm.onFalse}
          title="Cancel Driver Salary"
          content={`Are you sure you want to cancel the driver salary for ${row.driverId?.driverName}?`}
          action={
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                onDeleteRow();
                cancelConfirm.onFalse();
              }}
            >
              Cancel
            </Button>
          }
        />
      )}
    </>
  );
}
