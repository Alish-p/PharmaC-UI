import React, { useMemo } from 'react';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { GenericTableRow } from 'src/components/table';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { useTenantContext } from 'src/auth/tenant';

import { TABLE_COLUMNS } from './vehicle-table-config';

export default function VehicleTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onToggleActive,
  visibleColumns,
  disabledColumns,
  columnOrder,
}) {
  const toggleConfirm = useBoolean();
  const router = useRouter();
  const tenant = useTenantContext();

  const handleView = onViewRow ? () => onViewRow(row._id) : undefined;
  const handleEdit = onEditRow ? () => onEditRow(row._id) : undefined;
  const handleDelete = onDeleteRow ? () => onDeleteRow(row._id) : undefined;

  const { isActive } = row;

  const customActions = useMemo(() => {
    const actions = [];

    if (tenant?.integrations?.maintenanceAndInventory?.enabled) {
      actions.push({
        label: 'Create Work Order',
        icon: 'mdi:tools',
        onClick: () =>
          router.push(
            `${paths.dashboard.workOrder.new}?vehicle=${row._id}&vehicleNo=${row.vehicleNo}&vehicleType=${row.vehicleType}`
          ),
      });
    }

    if (row.isOwn) {
      actions.push({
        label: 'Create Expense',
        icon: 'mdi:cash-plus',
        onClick: () =>
          router.push(
            `${paths.dashboard.expense.newVehicleExpense}?vehicle=${row._id}&vehicleNo=${row.vehicleNo}`
          ),
      });
    }

    if (onToggleActive) {
      actions.push({
        label: isActive ? 'Make Inactive' : 'Make Active',
        icon: isActive ? 'mdi:cancel' : 'mdi:check-circle-outline',
        color: isActive ? 'warning.main' : 'success.main',
        onClick: () => toggleConfirm.onTrue(),
      });
    }

    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onToggleActive, isActive, tenant, router, row]);

  return (
    <>
      <GenericTableRow
        row={row}
        columns={TABLE_COLUMNS}
        selected={selected}
        onSelectRow={onSelectRow}
        onViewRow={handleView}
        onEditRow={handleEdit}
        onDeleteRow={handleDelete}
        customActions={customActions}
        visibleColumns={visibleColumns}
        disabledColumns={disabledColumns}
        columnOrder={columnOrder}
      />

      {onToggleActive && (
        <ConfirmDialog
          open={toggleConfirm.value}
          onClose={toggleConfirm.onFalse}
          title={isActive ? 'Deactivate Vehicle' : 'Activate Vehicle'}
          content={
            isActive
              ? `Are you sure you want to deactivate vehicle "${row.vehicleNo}"? It will no longer be available for new jobs, trips, or expenses.`
              : `Are you sure you want to activate vehicle "${row.vehicleNo}"? It will become available for operations again.`
          }
          action={
            <Button
              variant="contained"
              color={isActive ? 'warning' : 'success'}
              onClick={() => {
                onToggleActive(row._id, !isActive);
                toggleConfirm.onFalse();
              }}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          }
        />
      )}
    </>
  );
}
