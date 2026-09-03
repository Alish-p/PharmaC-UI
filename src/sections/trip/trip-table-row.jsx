import { useNavigate } from 'react-router';
import React, { useMemo, useCallback } from 'react';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { GenericTableRow } from 'src/components/table';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { TABLE_COLUMNS } from './trip-table-config';

export default function TripTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  visibleColumns,
  disabledColumns,
  columnOrder,
}) {
  const navigate = useNavigate();
  const closedTripConfirm = useBoolean();

  const handleView = onViewRow ? () => onViewRow(row._id) : undefined;
  const handleEdit = onEditRow ? () => onEditRow(row._id) : undefined;

  const { tripStatus } = row;

  const navigateToJobCreate = useCallback(() => {
    navigate({
      pathname: paths.dashboard.subtrip.jobCreate,
      search: `?id=${row._id}`,
    });
  }, [navigate, row._id]);

  const customActions = useMemo(
    () => [
      {
        label: 'Add New Job',
        icon: 'mdi:briefcase-plus',
        color: 'primary.main',
        onClick: () => {
          if (tripStatus === 'billed' || tripStatus === 'closed') {
            closedTripConfirm.onTrue();
          } else {
            navigateToJobCreate();
          }
        },
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    [tripStatus, closedTripConfirm, navigateToJobCreate]
  );

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

      <ConfirmDialog
        open={closedTripConfirm.value}
        onClose={closedTripConfirm.onFalse}
        title="Add Job to Closed Trip?"
        content={`Trip #${row.tripNo} is already ${tripStatus}. Are you sure you want to add a new job to it?`}
        action={
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              navigateToJobCreate();
              closedTripConfirm.onFalse();
            }}
          >
            Confirmed
          </Button>
        }
      />
    </>
  );
}
