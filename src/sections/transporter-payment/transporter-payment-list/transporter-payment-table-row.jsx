import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useBoolean } from 'src/hooks/use-boolean';

import { useUpdateTransporterPaymentStatus } from 'src/query/use-transporter-payment';

import { GenericTableRow } from 'src/components/table';

import { TABLE_COLUMNS } from '../transporter-payment-table-config';

export default function TransporterPaymentTableRow({
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
  const markPaidConfirm = useBoolean();
  const updateStatus = useUpdateTransporterPaymentStatus();
  const [paidDate, setPaidDate] = useState(dayjs());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canMarkPaid = row?.status === 'generated';

  const customActions = useMemo(() => {
    const actions = [];
    if (canMarkPaid) {
      actions.push({
        label: 'Mark as Paid',
        icon: 'mdi:cash-check',
        color: 'success.main',
        onClick: () => {
          setPaidDate(dayjs());
          markPaidConfirm.onTrue();
        },
      });
    }

    if (row?.status !== 'cancelled' && onDeleteRow) {
      actions.push({
        label: 'Cancel',
        icon: 'mdi:close-circle',
        color: 'error.main',
        onClick: () => onDeleteRow(row),
      });
    }

    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canMarkPaid, row?.status, onDeleteRow]);

  const handleMarkAsPaid = async () => {
    try {
      setIsSubmitting(true);
      await updateStatus({
        id: row._id,
        status: 'paid',
        paidDate: paidDate ? paidDate.toDate() : new Date(),
      });
      markPaidConfirm.onFalse();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <GenericTableRow
        row={row}
        columns={TABLE_COLUMNS}
        selected={selected}
        onSelectRow={onSelectRow}
        onViewRow={onViewRow}
        onEditRow={onEditRow}
        customActions={customActions}
        visibleColumns={visibleColumns}
        disabledColumns={disabledColumns}
        columnOrder={columnOrder}
      />

      {canMarkPaid && (
        <Dialog
          open={markPaidConfirm.value}
          onClose={markPaidConfirm.onFalse}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Mark Payment as Paid</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2">
                Mark payment <strong>{row.paymentId}</strong> as paid. Please select the payment date:
              </Typography>
              <DatePicker
                label="Paid Date"
                value={paidDate}
                onChange={(newValue) => setPaidDate(newValue || dayjs())}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={markPaidConfirm.onFalse} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleMarkAsPaid}
              disabled={isSubmitting || !paidDate}
            >
              Mark as Paid
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
