import { useNavigate } from 'react-router';
import React, { useMemo, useState } from 'react';

import { paths } from 'src/routes/paths';

import { GenericTableRow } from 'src/components/table';

import { SUBTRIP_STATUS } from '../constants';
import { TABLE_COLUMNS } from './subtrip-table-config';
import { ResolveSubtripDialog } from '../subtrip-resolve-dialogue-form';

export default function SubtripTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  visibleColumns,
  disabledColumns = {},
  columnOrder,
}) {
  const navigate = useNavigate();
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  const handleView = onViewRow ? () => onViewRow(row._id) : undefined;
  const handleEdit = onEditRow ? () => onEditRow(row._id) : undefined;
  const handleDelete = onDeleteRow ? () => onDeleteRow(row._id) : undefined;

  const status = row?.subtripStatus;
  const isOwn = row?.vehicleId?.isOwn;
  const isCancelled = status === SUBTRIP_STATUS.CANCELLED;

  // Lock edit & delete if cancelled or any financial document has been generated for this subtrip
  const isFinanciallyLocked = !!(row?.invoiceId || row?.driverSalaryId || row?.transporterPaymentReceiptId);
  const financialLockReason = 'Disabled: financial documents have been generated for this subtrip';

  const isEditDisabled = isCancelled || isFinanciallyLocked;
  const editDisabledReason = isCancelled
    ? 'Disabled: subtrip is cancelled'
    : (isFinanciallyLocked ? financialLockReason : '');

  const isDeleteDisabled = isCancelled || isFinanciallyLocked;
  const deleteDisabledReason = isCancelled
    ? 'Disabled: subtrip is already cancelled'
    : (isFinanciallyLocked ? financialLockReason : '');

  const customActions = useMemo(() => {
    if (isCancelled) return [];
    const actions = [];

    // Receive action — only when status is "loaded"
    if (status === SUBTRIP_STATUS.LOADED) {
      actions.push({
        label: 'Receive',
        icon: 'mdi:call-received',
        color: 'primary.main',
        onClick: () =>
          navigate(
            `${paths.dashboard.subtrip.receive}?currentSubtrip=${row._id}&redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`
          ),
      });
    }

    // Bill action — only when status is "received"
    if (status === SUBTRIP_STATUS.RECEIVED) {
      actions.push({
        label: 'Create Invoice',
        icon: 'mdi:receipt-text',
        color: 'success.main',
        onClick: () => navigate(paths.dashboard.invoice.new),
      });
    }

    // Resolve action — only when status is "error"
    if (status === SUBTRIP_STATUS.ERROR) {
      actions.push({
        label: 'Resolve',
        icon: 'mdi:check-circle',
        color: 'warning.main',
        onClick: () => setShowResolveDialog(true),
      });
    }

    // Add Expense action — only for own vehicles & not billed
    if (isOwn !== false && status !== SUBTRIP_STATUS.BILLED) {
      actions.push({
        label: 'Add Expense',
        icon: 'mdi:cash-plus',
        color: 'info.main',
        onClick: () => navigate(`${paths.dashboard.expense.new}?currentSubtrip=${row._id}`),
      });
    }

    // Add Advance action — only for market vehicles & not billed
    if (isOwn === false && status !== SUBTRIP_STATUS.BILLED) {
      actions.push({
        label: 'Add Advance',
        icon: 'mdi:cash-plus',
        color: 'info.main',
        onClick: () =>
          navigate(`${paths.dashboard.transporterAdvance.new}?currentSubtrip=${row._id}`),
      });
    }

    return actions;
  }, [status, isOwn, isCancelled, row._id, navigate]);

  return (
    <>
      <GenericTableRow
        row={row}
        columns={TABLE_COLUMNS}
        selected={selected}
        onSelectRow={onSelectRow}
        onViewRow={handleView}
        onEditRow={handleEdit}
        editDisabled={isEditDisabled}
        editDisabledReason={editDisabledReason}
        onDeleteRow={handleDelete}
        deleteDisabled={isDeleteDisabled}
        deleteDisabledReason={deleteDisabledReason}
        customActions={customActions}
        visibleColumns={visibleColumns}
        disabledColumns={disabledColumns}
        columnOrder={columnOrder}
      />

      {status === SUBTRIP_STATUS.ERROR && (
        <ResolveSubtripDialog
          showDialog={showResolveDialog}
          setShowDialog={setShowResolveDialog}
          subtripId={row._id}
        />
      )}
    </>
  );
}
