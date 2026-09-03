import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import { Card, Stack, Divider, CardHeader } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useCreatePartLocation, useUpdatePartLocation } from 'src/query/use-part-location';

import { Form, Field } from 'src/components/hook-form';

export const PartLocationSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  address: zod.string().min(1, { message: 'Address is required' }),
});

export default function PartLocationForm({ currentPartLocation }) {
  const navigate = useNavigate();

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
    mode: 'all',
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      let saved;
      if (!currentPartLocation) {
        saved = await createPartLocation(data);
      } else {
        saved = await updatePartLocation({ id: currentPartLocation._id, data });
      }

      reset();
      navigate(paths.dashboard.partLocation.details(saved._id));
    } catch (error) {
      console.error(error);
    }
  };

  const renderDetails = (
    <Card>
      <CardHeader title="Part Location Details" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="name" label="Location Name" />
        <Field.Text name="address" label="Address" multiline rows={3} />
      </Stack>
    </Card>
  );

  const renderActions = (
    <Stack alignItems="flex-end" sx={{ mt: 3 }}>
      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
        {!currentPartLocation ? 'Create Location' : 'Save Changes'}
      </LoadingButton>
    </Stack>
  );

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails}
        {renderActions}
      </Stack>
    </Form>
  );
}
