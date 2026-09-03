import { z as zod } from 'zod';
// form
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

// @mui
import { LoadingButton } from '@mui/lab';
import {
  Card,
  Stack,
  Alert,
  Button,
  Divider,
  MenuItem,
  Collapse,
  TextField,
  CardHeader,
  Typography,
  InputAdornment,
} from '@mui/material';

// routes
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTenant } from 'src/query/use-tenant';
import { useCustomerGstLookup } from 'src/query/use-customer';
import { useCreateTransporter, useUpdateTransporter } from 'src/query/use-transporter';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { BankDetailsWidget } from 'src/components/bank/bank-details-widget';

import { STATES } from '../customer/config';

// ----------------------------------------------------------------------

export const NewTransporterSchema = zod
  .object({
    transportName: zod.string().min(1, { message: 'Transport Name is required' }),
    address: zod.string().min(1, { message: 'Address is required' }),
    state: zod.string().min(1, { message: 'State is required' }),

    pinNo: schemaHelper.pinCodeOptional({
      message: { invalid_error: 'Pin Code must be exactly 6 digits' },
    }),

    cellNo: schemaHelper.phoneNumber({
      message: {
        required_error: 'Mobile No is required',
        invalid_error: 'Mobile No must be exactly 10 digits',
      },
    }),
    ownerName: zod.string().min(1, { message: 'Owner Name is required' }),
    emailId: zod.string().email({ message: 'Email ID must be a valid email' }).or(zod.literal('')),
    paymentMode: zod.string().optional(),
    panNo: zod.string(),
    gstEnabled: zod.boolean(),
    gstNo: zod.string().optional(),
    tdsPercentage: zod.number().min(0, { message: 'TDS Percentage is required' }),
    podCharges: zod.number().min(0, { message: 'POD Charges is required' }),
    isActive: zod.boolean().optional(),

    bankDetails: zod.object({
      name: zod.string().min(1, { message: 'Bank name is required' }),
      branch: zod.string().min(1, { message: 'Branch is required' }),
      ifsc: zod.string().min(1, { message: 'IFSC is required' }),
      place: zod.string().min(1, { message: 'Place is required' }),
      accNo: schemaHelper.accountNumber({
        message: {
          required_error: 'Account number is required',
          invalid_error: 'Account number must be between 9 and 18 digits',
        },
      }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.gstEnabled && !data.gstNo) {
      ctx.addIssue({
        path: ['gstNo'],
        code: zod.ZodIssueCode.custom,
        message: 'GST No is required when GST is enabled',
      });
    }
  });

// ----------------------------------------------------------------------

export default function TransporterForm({ currentTransporter }) {
  const navigate = useNavigate();

  const createTransporter = useCreateTransporter();
  const updateTransporter = useUpdateTransporter();
  const { data: tenant } = useTenant();
  const integrationEnabled = !!tenant?.integrations?.gstApi?.enabled;
  const { lookupGst, isLookingUpGst } = useCustomerGstLookup();
  const [appliedFields, setAppliedFields] = useState(0);
  const [gstInput, setGstInput] = useState('');
  const isEditMode = Boolean(currentTransporter);

  const paymentModes = useMemo(() => {
    if (
      tenant?.config?.transporterPaymentModes &&
      tenant.config.transporterPaymentModes.length > 0
    ) {
      return tenant.config.transporterPaymentModes;
    }
    return [
      { label: 'UPI', value: 'UPI' },
      { label: 'Card', value: 'Card' },
      { label: 'Bank Transfer', value: 'BankTransfer' },
      { label: 'Cash', value: 'Cash' },
      { label: 'Fuel', value: 'Fuel' },
    ];
  }, [tenant]);

  const defaultValues = useMemo(
    () => ({
      transportName: currentTransporter?.transportName || '',
      address: currentTransporter?.address || '',
      state: currentTransporter?.state || '',
      pinNo: currentTransporter?.pinNo || '',
      cellNo: currentTransporter?.cellNo || '',
      ownerName: currentTransporter?.ownerName || '',
      emailId: currentTransporter?.emailId || '',
      bankDetails: {
        name: currentTransporter?.bankDetails?.name || '',
        ifsc: currentTransporter?.bankDetails?.ifsc || '',
        place: currentTransporter?.bankDetails?.place || '',
        branch: currentTransporter?.bankDetails?.branch || '',
        accNo: currentTransporter?.bankDetails?.accNo || '',
      },
      paymentMode: currentTransporter?.paymentMode || '',
      panNo: currentTransporter?.panNo || '',
      gstNo: currentTransporter?.gstNo || '',
      gstEnabled: currentTransporter?.gstEnabled ?? false,
      transportType: currentTransporter?.transportType || '',
      agreementNo: currentTransporter?.agreementNo || '',
      tdsPercentage:
        currentTransporter?.tdsPercentage ??
        tenant?.config?.transporterPayment?.defaultTdsPercentage ??
        2,
      podCharges:
        currentTransporter?.podCharges ??
        tenant?.config?.transporterPayment?.defaultPodCharges ??
        0,
      isActive: currentTransporter?.isActive ?? true,
    }),
    [currentTransporter, tenant]
  );

  const methods = useForm({
    resolver: zodResolver(NewTransporterSchema),
    defaultValues,
    mode: 'all',
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;
  const bankDialog = useBoolean();

  const values = watch();

  useEffect(() => {
    if (!gstInput && values.gstNo) setGstInput(values.gstNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.gstNo]);

  useEffect(() => {
    if (tenant && !currentTransporter) {
      reset(defaultValues);
    }
  }, [tenant, currentTransporter, reset, defaultValues]);

  const onSubmit = async (data) => {
    try {
      const sanitized = sanitizeTransporterBeforeSubmit(data);
      if (!currentTransporter) {
        await createTransporter(sanitized);
      } else {
        await updateTransporter({ id: currentTransporter._id, data: sanitized });
      }
      reset();
      navigate(paths.dashboard.transporter.list);
    } catch (error) {
      console.error(error);
    }
  };

  // Separate Render Methods

  const renderTransporterDetails = () => (
    <Card sx={{ position: 'relative' }}>
      <CardHeader title="Transporter Details" sx={{ mb: 3 }} />
      {currentTransporter && (
        <Label
          color={values.isActive ? 'success' : 'error'}
          sx={{ position: 'absolute', top: 24, right: 24, cursor: 'pointer' }}
          onClick={() => setValue('isActive', !values.isActive, { shouldValidate: true })}
        >
          {values.isActive ? 'Active' : 'Disabled'}
        </Label>
      )}
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="transportName" label="Transport Name" />
        <Field.Text
          name="address"
          label="Address"
          multiline
          rows={4}
          placeholder="123 MG Road, Bengaluru, Karnataka 560001"
        />
        <Field.Select name="state" label="State">
          <MenuItem value="">None</MenuItem>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {STATES.map((state) => (
            <MenuItem key={state.value} value={state.value}>
              {state.label}
            </MenuItem>
          ))}
        </Field.Select>
        <Field.Text name="pinNo" label="Pin Code (Optional) " placeholder="400001" />
        <Field.Text
          name="cellNo"
          label="Phone Number"
          InputProps={{
            startAdornment: <InputAdornment position="start">+91 - </InputAdornment>,
          }}
        />
        <Field.Text name="ownerName" label="Owner Name" />
        <Field.Text name="emailId" label="Email ID (Optional)" />
      </Stack>
    </Card>
  );

  const renderBankDetails = () => {
    const bd = values?.bankDetails || {};
    const summary = bd?.name
      ? `${bd.name}${bd.branch ? ` • ${bd.branch}` : ''}${bd.place ? ` • ${bd.place}` : ''}${bd.accNo ? ` • A/C ${bd.accNo}` : ''}`
      : 'Add bank details';

    const hasError = Boolean(errors?.bankDetails);

    return (
      <Card>
        <CardHeader title="Bank Details" sx={{ mb: 3 }} />
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
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
        </Stack>
      </Card>
    );
  };

  const renderAdditionalDetails = () => (
    <Card>
      <CardHeader title="Additional Details" sx={{ mb: 3 }} />
      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Select name="paymentMode" label="Payment Mode (Optional)">
          <MenuItem value="">None</MenuItem>
          {paymentModes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Field.Select>
        <Field.Text name="panNo" label="PAN No (Optional)" placeholder="ABCDE1234F" />

        <Field.Text
          name="tdsPercentage"
          label="TDS Percentage"
          type="number"
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
        />
        <Field.Text
          name="podCharges"
          label="POD Charges"
          type="number"
          InputProps={{
            endAdornment: <InputAdornment position="end">₹ / Subtrip</InputAdornment>,
          }}
        />
        <Field.Switch name="gstEnabled" label="GST Enabled" />
        <Field.Text name="gstNo" label="GST No" placeholder="22ABCDE1234F1Z5" />
      </Stack>
    </Card>
  );

  const renderActions = () => (
    <Stack alignItems="flex-end" sx={{ mt: 3 }}>
      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
        {!currentTransporter ? 'Create Transporter' : 'Save Changes'}
      </LoadingButton>
    </Stack>
  );

  const renderDialogues = () => null; // Bank list dialog removed

  // GST Quick Lookup banner (like customer form)
  const renderGstLookup =
    integrationEnabled && !isEditMode ? (
      <Card variant="outlined">
        <CardHeader
          sx={{ mb: 1 }}
          title={
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="mdi:clipboard-text-search-outline" width={22} />
              <Typography variant="subtitle1">Quick Start with GST Lookup</Typography>
              <Label color="success" variant="soft">
                Recommended
              </Label>
            </Stack>
          }
          subheader={
            <Typography variant="body2" sx={{ color: 'text.secondary' }} my={1}>
              Enter a GST number to automatically prefill transporter details and save time
            </Typography>
          }
        />
        <Divider />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ sm: 'center' }}
          sx={{ p: 3 }}
        >
          <TextField
            fullWidth
            label="GST Number"
            placeholder="e.g., 27ABCDE1234F1Z5"
            value={gstInput}
            onChange={(e) => setGstInput(e.target.value.toUpperCase())}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!gstInput || gstInput.trim().length !== 15 || isLookingUpGst) return;
                const resp = await lookupGst({ gstin: gstInput.trim() });
                if (!resp?.canonical) return;
                const applied = applyGstLookupToTransporterForm({
                  canonical: resp.canonical,
                  setValue,
                  values,
                });
                setAppliedFields(applied);
              }
            }}
          />
          <LoadingButton
            variant="contained"
            color="primary"
            loading={isLookingUpGst}
            disabled={!gstInput || gstInput.trim().length !== 15}
            onClick={async () => {
              const resp = await lookupGst({ gstin: gstInput.trim() });
              if (!resp?.canonical) return;
              const applied = applyGstLookupToTransporterForm({
                canonical: resp.canonical,
                setValue,
                values,
              });
              setAppliedFields(applied);
            }}
            startIcon={<Iconify icon="mdi:magnify-scan" />}
          >
            Lookup & Prefill
          </LoadingButton>
        </Stack>

        <Collapse in={appliedFields > 0}>
          <Alert
            severity="success"
            iconMapping={{ success: <Iconify icon="mdi:check-circle" /> }}
            sx={{ mx: 3, mb: 3 }}
            onClose={() => setAppliedFields(0)}
          >
            Prefilled {appliedFields} field{appliedFields > 1 ? 's' : ''} from GST records.
          </Alert>
        </Collapse>
      </Card>
    ) : null;

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderGstLookup}
        {renderTransporterDetails()}
        {renderBankDetails()}
        {renderAdditionalDetails()}
        {renderActions()}
      </Stack>
      {renderDialogues()}
    </Form>
  );
}

// Prefill helper from GST lookup (canonical)
function applyGstLookupToTransporterForm({ canonical, setValue, values }) {
  if (!canonical || typeof canonical !== 'object') return 0;
  let applied = 0;
  const assignIfEmpty = (name, value) => {
    const current = values[name];
    const isEmpty = current === '' || current === 0 || current === undefined || current === null;
    if (isEmpty && value !== undefined && value !== null && value !== '') {
      setValue(name, value, { shouldValidate: true });
      applied += 1;
    }
  };

  // Prefer tradeName else legalName
  const name = canonical.tradeName || canonical.legalName || '';
  assignIfEmpty('transportName', name);
  assignIfEmpty('gstNo', canonical.gstin);
  // On successful lookup, enable GST
  if (values.gstEnabled !== true) {
    setValue('gstEnabled', true, { shouldValidate: true });
    applied += 1;
  }

  // PAN
  const panFromGst = (gst) => (gst && gst.length >= 12 ? gst.substring(2, 12) : '');
  assignIfEmpty('panNo', canonical.pan || panFromGst(canonical.gstin || values.gstNo));

  // Address
  const a = canonical.address || {};
  const addrLine = [a.buildingNumber, a.line1, a.streetName, a.location, a.city, a.district]
    .filter(Boolean)
    .join(', ');
  assignIfEmpty('address', addrLine);
  assignIfEmpty('state', a.state);
  assignIfEmpty('pinNo', a.pincode);

  return applied;
}

// Strip empty strings in bankDetails to undefined
function sanitizeTransporterBeforeSubmit(data) {
  const out = { ...data };
  const bd = out?.bankDetails;
  if (bd && typeof bd === 'object') {
    const cleaned = { ...bd };
    ['name', 'branch', 'ifsc', 'place', 'accNo'].forEach((k) => {
      if (cleaned[k] === '') cleaned[k] = undefined;
    });
    out.bankDetails = cleaned;
  }
  return out;
}
