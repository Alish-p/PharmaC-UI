import * as zod from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useRemoldTyre } from 'src/query/use-tyre';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

export default function TyreRemoldDialog({ open, onClose, tyreId, currentDepth }) {
  const remoldTyre = useRemoldTyre();

  const RemoldTyreSchema = zod.object({
    newThreadDepth: zod.coerce
      .number()
      .min(0, { message: 'Must be positive' })
      .refine((val) => val > (currentDepth || 0), {
        message: `New thread depth must be greater than current depth (${currentDepth || 0}mm)`,
      }),
    remoldDate: schemaHelper.date({ message: { required_error: 'Remold date is required' } }),
  });

  const defaultValues = {
    newThreadDepth: '',
    remoldDate: new Date(),
  };

  const methods = useForm({
    resolver: zodResolver(RemoldTyreSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await remoldTyre.mutateAsync({
        id: tyreId,
        data: {
          newThreadDepth: data.newThreadDepth,
          remoldDate: data.remoldDate,
        },
      });
      reset();
      onClose();
      toast.success('Tyre remolded successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Unable to remold tyre');
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>Remold Tyre</DialogTitle>

      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} sx={{ mt: 1 }}>
            <Field.Text
              name="newThreadDepth"
              label="New Thread Depth (mm)"
              type="number"
              helperText={`Current Thread Depth: ${currentDepth || 0} mm`}
            />
            <Field.DatePicker name="remoldDate" label="Remold Date" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Remold
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
