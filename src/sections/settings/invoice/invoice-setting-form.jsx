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

const InvoiceSettingSchema = zod.object({
  config: zod.object({
    invoice: zod
      .object({
        defaultTaxRates: zod.object({
          cgst: zod.number().min(0).max(100),
          sgst: zod.number().min(0).max(100),
          igst: zod.number().min(0).max(100),
        }),
        termsAndConditions: zod.string().optional(),
      })
      .optional(),
  }),
});

export default function InvoiceSettingForm({ currentTenant }) {
  const updateTenant = useUpdateTenant();

  const defaultValues = useMemo(
    () => ({
      config: {
        invoice: {
          defaultTaxRates: {
            cgst: currentTenant?.config?.invoice?.defaultTaxRates?.cgst ?? 0,
            sgst: currentTenant?.config?.invoice?.defaultTaxRates?.sgst ?? 0,
            igst: currentTenant?.config?.invoice?.defaultTaxRates?.igst ?? 0,
          },
          termsAndConditions: currentTenant?.config?.invoice?.termsAndConditions ?? '',
        },
      },
    }),
    [currentTenant]
  );

  const methods = useForm({
    resolver: zodResolver(InvoiceSettingSchema),
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
            title="Invoice & Taxation Settings"
            subheader="Configure tax percentages and default billing declarations printed on customer PDF invoices."
            sx={{ mb: 3 }}
          />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Field.Text
                  name="config.invoice.defaultTaxRates.cgst"
                  label="Default CGST (%)"
                  type="number"
                  onChange={(event) =>
                    methods.setValue(
                      'config.invoice.defaultTaxRates.cgst',
                      Number(event.target.value)
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Field.Text
                  name="config.invoice.defaultTaxRates.sgst"
                  label="Default SGST (%)"
                  type="number"
                  onChange={(event) =>
                    methods.setValue(
                      'config.invoice.defaultTaxRates.sgst',
                      Number(event.target.value)
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Field.Text
                  name="config.invoice.defaultTaxRates.igst"
                  label="Default IGST (%)"
                  type="number"
                  onChange={(event) =>
                    methods.setValue(
                      'config.invoice.defaultTaxRates.igst',
                      Number(event.target.value)
                    )
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Field.Text
                  name="config.invoice.termsAndConditions"
                  label="Invoice Terms & Conditions"
                  placeholder="Enter invoice terms, bank details for payment, or print notes..."
                  multiline
                  rows={4}
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
