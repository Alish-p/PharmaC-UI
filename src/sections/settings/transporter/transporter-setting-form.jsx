import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';

import { useUpdateTenant } from 'src/query/use-tenant';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const TransporterSettingSchema = zod.object({
  config: zod.object({
    transporterPayment: zod
      .object({
        defaultTdsPercentage: zod.number().min(0).max(100),
        defaultPodCharges: zod.number().min(0),
        template: zod.string().min(1),
      })
      .optional(),
  }),
});

export default function TransporterSettingForm({ currentTenant }) {
  const updateTenant = useUpdateTenant();

  const defaultValues = useMemo(
    () => ({
      config: {
        transporterPayment: {
          defaultTdsPercentage:
            currentTenant?.config?.transporterPayment?.defaultTdsPercentage ?? 2,
          defaultPodCharges: currentTenant?.config?.transporterPayment?.defaultPodCharges ?? 0,
          template: currentTenant?.config?.transporterPayment?.template ?? 'standard',
        },
      },
    }),
    [currentTenant]
  );

  const methods = useForm({
    resolver: zodResolver(TransporterSettingSchema),
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
            title="Transporter Configurations"
            subheader="Configure transporter compliance checklist, allowed settlement routes, and rate defaults."
            sx={{ mb: 3 }}
          />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Field.Text
                  name="config.transporterPayment.defaultTdsPercentage"
                  label="Default TDS Percentage (%)"
                  type="number"
                  onChange={(event) =>
                    methods.setValue(
                      'config.transporterPayment.defaultTdsPercentage',
                      Number(event.target.value)
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text
                  name="config.transporterPayment.defaultPodCharges"
                  label="Default POD Charges"
                  type="number"
                  onChange={(event) =>
                    methods.setValue(
                      'config.transporterPayment.defaultPodCharges',
                      Number(event.target.value)
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Select
                  name="config.transporterPayment.template"
                  label="Transporter Payment Template"
                >
                  <MenuItem value="standard">Standard Template</MenuItem>
                  <MenuItem value="template-1">Template 1</MenuItem>
                </Field.Select>
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
