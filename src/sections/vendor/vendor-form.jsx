import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import { Card, Stack, Button, Divider, CardHeader } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { useCreateVendor, useUpdateVendor } from 'src/query/use-vendor';

import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { BankDetailsWidget } from 'src/components/bank/bank-details-widget';

export const VendorSchema = zod.object({
  name: zod.string().min(1, { message: 'Vendor name is required' }),
  phone: schemaHelper.phoneNumber({
    message: {
      required_error: 'Phone number is required',
      invalid_error: 'Phone number must be exactly 10 digits',
    },
  }),
  address: zod.string().min(1, { message: 'Address is required' }),
  gstNumber: schemaHelper.gstNumberOptional(),
  bankDetails: zod
    .object({
      name: zod.string().optional(),
      branch: zod.string().optional(),
      ifsc: zod.string().optional(),
      place: zod.string().optional(),
      accNo: zod.string().optional(),
    })
    .optional(),
});

export default function VendorForm({ currentVendor }) {
  const navigate = useNavigate();
  const bankDialog = useBoolean();

  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();

  const defaultValues = useMemo(
    () => ({
      name: currentVendor?.name || '',
      phone: currentVendor?.phone || '',
      address: currentVendor?.address || '',
      gstNumber: currentVendor?.gstNumber || '',
      bankDetails: {
        name: currentVendor?.bankDetails?.name || '',
        ifsc: currentVendor?.bankDetails?.ifsc || '',
        place: currentVendor?.bankDetails?.place || '',
        branch: currentVendor?.bankDetails?.branch || '',
        accNo: currentVendor?.bankDetails?.accNo || '',
      },
    }),
    [currentVendor]
  );

  const methods = useForm({
    resolver: zodResolver(VendorSchema),
    defaultValues,
    mode: 'all',
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const onSubmit = async (data) => {
    try {
      const sanitized = sanitizeVendorBeforeSubmit(data);
      let saved;
      if (!currentVendor) {
        saved = await createVendor(sanitized);
      } else {
        saved = await updateVendor({ id: currentVendor._id, data: sanitized });
      }
      reset();
      navigate(paths.dashboard.vendor.details(saved._id));
    } catch (error) {
      console.error(error);
    }
  };

  const renderVendorDetails = (
    <Card>
      <CardHeader title="Vendor Details" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="name" label="Vendor Name" />
        <Field.Text name="phone" label="Phone" />
        <Field.Text name="gstNumber" label="GST Number" />
        <Field.Text name="address" label="Address" multiline rows={3} />
      </Stack>
    </Card>
  );

  const renderBankDetails = (
    <Card>
      <CardHeader title="Bank Details" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        {(() => {
          const bd = values?.bankDetails || {};
          const summary = bd?.name
            ? `${bd.name}${bd.branch ? ` • ${bd.branch}` : ''}${bd.place ? ` • ${bd.place}` : ''}${bd.accNo ? ` • A/C ${bd.accNo}` : ''}`
            : 'Add bank details';
          const hasError = Boolean(errors?.bankDetails);
          return (
            <>
              <Button
                fullWidth
                variant="outlined"
                onClick={bankDialog.onTrue}
                startIcon={<Iconify icon={bd?.name ? 'mdi:bank' : 'mdi:bank-outline'} />}
                sx={{
                  height: 56,
                  justifyContent: 'flex-start',
                  typography: 'body2',
                  borderColor: hasError ? 'error.main' : 'text.disabled',
                  color: hasError ? 'error.main' : 'text.primary',
                }}
              >
                {summary}
              </Button>

              <BankDetailsWidget
                variant="dialog"
                title="Bank Details"
                open={bankDialog.value}
                onClose={bankDialog.onFalse}
                fieldNames={{
                  ifsc: 'bankDetails.ifsc',
                  name: 'bankDetails.name',
                  branch: 'bankDetails.branch',
                  place: 'bankDetails.place',
                  accNo: 'bankDetails.accNo',
                }}
              />
            </>
          );
        })()}
      </Stack>
    </Card>
  );

  const renderActions = (
    <Stack alignItems="flex-end" sx={{ mt: 3 }}>
      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
        {!currentVendor ? 'Create Vendor' : 'Save Changes'}
      </LoadingButton>
    </Stack>
  );

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderVendorDetails}
        {renderBankDetails}
        {renderActions}
      </Stack>
    </Form>
  );
}

// Strip empty strings in bankDetails to undefined
function sanitizeVendorBeforeSubmit(data) {
  const out = { ...data };
  const ba = out?.bankDetails;
  if (ba && typeof ba === 'object') {
    const cleaned = { ...ba };
    ['name', 'branch', 'ifsc', 'place', 'accNo'].forEach((k) => {
      if (cleaned[k] === '') cleaned[k] = undefined;
    });
    out.bankDetails = cleaned;
  }
  return out;
}
