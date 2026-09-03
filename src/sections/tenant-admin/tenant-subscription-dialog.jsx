import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const SubscriptionSchema = zod.object({
  planName: zod.string().min(1, { message: 'Plan name is required' }),
  validTill: schemaHelper.date({}),
  isActive: zod.boolean(),
});

export function TenantSubscriptionDialog({ open, onClose, initial, onSubmit }) {
  const defaultValues = useMemo(
    () => ({
      planName: initial?.planName || initial?.plan || '',
      validTill: initial?.validTill ? new Date(initial.validTill) : new Date(),
      isActive: initial?.isActive ?? true,
    }),
    [initial]
  );

  const methods = useForm({
    resolver: zodResolver(SubscriptionSchema),
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Subscription</DialogTitle>

      <Form methods={methods} onSubmit={submit}>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Field.Text name="planName" label="Plan Name" />

            <Field.DatePicker name="validTill" label="Valid Till" />

            <Field.Switch name="isActive" label="Subscription Active?" />
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
            Save
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

export default TenantSubscriptionDialog;
