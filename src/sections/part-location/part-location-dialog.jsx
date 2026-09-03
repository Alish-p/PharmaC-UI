import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useCreatePartLocation, useUpdatePartLocation } from 'src/query/use-part-location';

import { Form, Field } from 'src/components/hook-form';

import { PartLocationSchema } from 'src/sections/part-location/part-location-form';

// ----------------------------------------------------------------------

export function PartLocationDialog({ open, onClose, currentPartLocation }) {
  const createPartLocation = useCreatePartLocation();
  const updatePartLocation = useUpdatePartLocation();

  const defaultValues = useMemo(
    () => ({
      name: currentPartLocation?.name || '',
      address: currentPartLocation?.address || '',
    }),
    [currentPartLocation]
  );

  const methods = useForm({
    resolver: zodResolver(PartLocationSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentPartLocation) {
      reset(defaultValues);
    } else {
      reset({ name: '', address: '' });
    }
  }, [currentPartLocation, defaultValues, reset]);

  const onSubmit = async (data) => {
    try {
      if (currentPartLocation) {
        await updatePartLocation({ id: currentPartLocation._id, data });
      } else {
        await createPartLocation(data);
      }
      reset();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>{currentPartLocation ? 'Edit Location' : 'New Location'}</DialogTitle>

      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Field.Text name="name" label="Location Name" />
            <Field.Text name="address" label="Address" multiline rows={3} />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentPartLocation ? 'Save Changes' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
