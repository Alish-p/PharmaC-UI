import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';

import { useUpdateTenant } from 'src/query/use-tenant';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const CustomerSettingSchema = zod.object({
  config: zod.object({
    invoice: zod
      .object({
        defaultDueInDays: zod.number().min(0),
      })
      .optional(),
  }),
});

export default function CustomerSettingForm({ currentTenant }) {
  const updateTenant = useUpdateTenant();

  const defaultValues = useMemo(
    () => ({
      config: {
        invoice: {
          defaultDueInDays: currentTenant?.config?.invoice?.defaultDueInDays ?? 10,
        },
      },
    }),
    [currentTenant]
  );

  const methods = useForm({
    resolver: zodResolver(CustomerSettingSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const sanitized = {
        ...currentTenant,
        config: {
          ...currentTenant?.config,
          ...data.config,
        },
      };
      await updateTenant(sanitized);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        <Card>
          <CardHeader
            title="Customer Defaults"
            subheader="Configure global billing defaults. These apply to new customers unless overridden directly on the customer record."
            sx={{ mb: 3 }}
          />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Field.Text
                  name="config.invoice.defaultDueInDays"
                  label="Default Payment Due Days"
                  type="number"
                  onChange={(event) =>
                    methods.setValue('config.invoice.defaultDueInDays', Number(event.target.value))
                  }
                />
              </Grid>
            </Grid>
          </Stack>
        </Card>

        <Stack alignItems="flex-end">
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Save Changes
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
