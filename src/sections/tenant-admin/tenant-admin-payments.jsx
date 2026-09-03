import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';

import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { usePaymentMethods } from 'src/sections/expense/expense-config';

const PaymentSchema = zod.object({
  amount: zod
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  paymentDate: schemaHelper.date({}),
  paymentMethod: zod.string().min(1, { message: 'Method is required' }),
  status: zod.preprocess((v) => (v === '' ? undefined : v), zod.string().optional()),
  notes: zod.preprocess((v) => (v === '' ? undefined : v), zod.string().optional()),
});

export function PaymentFormDialog({ open, onClose, initial, onSubmit }) {
  const paymentMethods = usePaymentMethods();

  const defaultValues = useMemo(
    () => ({
      amount: initial?.amount ?? 0,
      paymentDate: initial?.paymentDate ? new Date(initial.paymentDate) : new Date(),
      paymentMethod: initial?.paymentMethod ?? '',
      status: initial?.status ?? 'Completed',
      notes: initial?.notes ?? '',
    }),
    [initial]
  );

  const methods = useForm({
    resolver: zodResolver(PaymentSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset, defaultValues]);

  const submit = handleSubmit((values) => {
    onSubmit(values);
  });

  const isEdit = Boolean(initial?._id);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
      <Form methods={methods} onSubmit={submit}>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Field.Number
              name="amount"
              label="Amount"
              InputProps={{ endAdornment: <InputAdornment position="end">₹</InputAdornment> }}
            />
            <Field.DatePicker name="paymentDate" label="Payment Date" />
            <Field.Select name="paymentMethod" label="Payment Method">
              <MenuItem value="">None</MenuItem>
              {paymentMethods.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Field.Select>
            <Field.Select name="status" label="Status (Optional)">
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </Field.Select>
            <Field.Text name="notes" label="Notes (Optional)" multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={!isValid}
          >
            {isEdit ? 'Save' : 'Add'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

export default PaymentFormDialog;
