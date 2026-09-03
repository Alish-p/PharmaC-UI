import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useBoolean } from 'src/hooks/use-boolean';

import { DashboardContent } from 'src/layouts/dashboard';
import { useUpdateTransporterPaymentStatus } from 'src/query/use-transporter-payment';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TRANSPORTER_PAYMENT_OPTIONS } from '../utils/constant';
import TransporterPaymentView from '../transporter-payment-view';
import TransporterPaymentToolbar from '../transporter-payment-toolbar';

export function TransporterPaymentDetailView({ transporterPayment, publicMode = false }) {
  const { _id, status, paymentId } = transporterPayment;

  const markPaidModal = useBoolean();
  const [paidDate, setPaidDate] = useState(dayjs());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTransporterPaymentStatus = useUpdateTransporterPaymentStatus();

  const handleChangeStatus = useCallback(
    (event) => {
      const newStatus = event.target.value;
      if (newStatus === 'paid') {
        setPaidDate(dayjs());
        markPaidModal.onTrue();
      } else {
        updateTransporterPaymentStatus({ id: _id, status: newStatus });
      }
    },
    [_id, markPaidModal, updateTransporterPaymentStatus]
  );

  const handleConfirmPaid = async () => {
    try {
      setIsSubmitting(true);
      await updateTransporterPaymentStatus({
        id: _id,
        status: 'paid',
        paidDate: paidDate ? paidDate.toDate() : new Date(),
      });
      markPaidModal.onFalse();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardContent>
      {!publicMode && (
        <CustomBreadcrumbs
          heading={paymentId}
          links={[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Transporter Payment', href: '/dashboard/transporterPayment' },
            { name: paymentId },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
      )}
      <TransporterPaymentToolbar
        transporterPayment={transporterPayment}
        currentStatus={status || ''}
        onChangeStatus={handleChangeStatus}
        statusOptions={TRANSPORTER_PAYMENT_OPTIONS}
        publicMode={publicMode}
      />

      <TransporterPaymentView transporterPayment={transporterPayment} />

      <Dialog
        open={markPaidModal.value}
        onClose={markPaidModal.onFalse}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Mark Payment as Paid</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2">
              Mark payment <strong>{paymentId}</strong> as paid. Please select the payment date:
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
          <Button color="inherit" onClick={markPaidModal.onFalse} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmPaid}
            disabled={isSubmitting || !paidDate}
          >
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
