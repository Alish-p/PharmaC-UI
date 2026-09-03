import { z as zod } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';

// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Paper, Tooltip, MenuItem, Typography } from '@mui/material';

// routes
import { paths } from 'src/routes/paths';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

import { getCurrentFiscalYearShort } from 'src/utils/format-time';

import { useTenant } from 'src/query/use-tenant';
// queries
import { useCreateCustomer, useUpdateCustomer, useCustomerGstLookup } from 'src/query/use-customer';

import { Label } from 'src/components/label';
// components
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { BankDetailsWidget } from 'src/components/bank/bank-details-widget';

import { STATES } from './config';

// ----------------------
// 1. Updated Zod schema
// ----------------------
export const NewCustomerSchema = zod
  .object({
    // Basic Details
    customerName: zod.string().min(1, { message: 'Customer Name is required' }),
    address: zod.string().min(1, { message: 'Address is required' }),
    state: zod.string().min(1, { message: 'State is required' }),

    // pinCode is optional—but if they fill something, it must be 6 digits
    pinCode: schemaHelper.pinCodeOptional({
      message: { invalid_error: 'Pin Code must be exactly 6 digits' },
    }),

    // cellNo is optional—but if they fill something, it must be 10 digits
    cellNo: schemaHelper.phoneNumberOptional({
      message: { invalid_error: 'Phone number must be exactly 10 digits' },
    }),

    // Finance Details — optional for customers
    bankDetails: zod
      .object({
        name: zod.string().optional(),
        branch: zod.string().optional(),
        ifsc: zod.string().optional(),
        place: zod.string().optional(),
        // Optional or blank, but if present must be 9-18 digits
        accNo: zod
          .string()
          .optional()
          .refine(
            (val) => {
              if (val === undefined || val === '') return true;
              return /^[0-9]{9,18}$/.test(val);
            },
            {
              message: 'Account number must be between 9 and 18 digits',
            }
          ),
      })
      .optional(),

    GSTNo: schemaHelper.gstNumberOptional({
      message: {
        invalid_error: 'GST No must be a valid 15-character GST number. example: 27ABCDE1234F1Z5',
      },
    }),
    gstEnabled: zod.boolean(),
    PANNo: schemaHelper.panNumberOptional({
      message: {
        invalid_error: 'PAN No must be a valid 10-character PAN. example: ABCDE1234F',
      },
    }),

    // Additional Details
    transporterCode: zod.string().optional(),
    invoiceDueInDays: zod.number().min(1, { message: 'Invoice Due In Days is required' }),
    invoicePrefix: zod.string().min(1, { message: 'Invoice Prefix is required' }),
    invoiceSuffix: zod.string().optional(),
    currentInvoiceSerialNumber: zod
      .number({
        invalid_type_error: 'Invoice Serial Number must be a number',
        required_error: 'Invoice Serial Number is required',
      })
      .int({ message: 'Invoice Serial Number must be an integer' })
      .min(0, { message: 'Invoice Serial Number cannot be negative' }),

    // Consignees (array of sub‐objects)
    consignees: zod.array(
      zod.object({
        name: zod.string().min(1, { message: 'Name is required' }),
        address: zod.string().min(1, { message: 'Address is required' }),
        state: zod.string().min(1, { message: 'State is required' }),
        pinCode: schemaHelper.pinCode({
          message: {
            required_error: 'Consignee Pin Code is required',
            invalid_error: 'Consignee Pin Code must be exactly 6 digits',
          },
        }),
      })
    ),
  })
  .superRefine((data, ctx) => {
    if (data.gstEnabled && !data.GSTNo) {
      ctx.addIssue({
        path: ['GSTNo'],
        code: zod.ZodIssueCode.custom,
        message: 'GST No is required when GST is enabled',
      });
    }
  });

// ----------------------
// 2. Main component
// ----------------------
export default function CustomerNewForm({ currentCustomer }) {
  const navigate = useNavigate();
  const bankDialog = useBoolean();

  const addCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const { data: tenant } = useTenant();
  const integrationEnabled = !!tenant?.integrations?.gstApi?.enabled;
  const { lookupGst, isLookingUpGst } = useCustomerGstLookup();
  const [appliedFields, setAppliedFields] = useState(0);
  const isEditMode = Boolean(currentCustomer);
  const [gstInput, setGstInput] = useState('');

  const defaultValues = useMemo(
    () => ({
      // Basic Details
      customerName: currentCustomer?.customerName || '',
      address: currentCustomer?.address || '',
      state: currentCustomer?.state || '',
      pinCode: currentCustomer?.pinCode || '',
      cellNo: currentCustomer?.cellNo || '',

      // Finance Details
      bankDetails: {
        name: currentCustomer?.bankDetails?.name || '',
        ifsc: currentCustomer?.bankDetails?.ifsc || '',
        place: currentCustomer?.bankDetails?.place || '',
        branch: currentCustomer?.bankDetails?.branch || '',
        accNo: currentCustomer?.bankDetails?.accNo || '',
      },
      gstEnabled: currentCustomer?.gstEnabled ?? false,
      GSTNo: currentCustomer?.GSTNo || '',
      PANNo: currentCustomer?.PANNo || '',

      // Additional Details
      transporterCode: currentCustomer?.transporterCode || '',
      invoiceDueInDays:
        currentCustomer?.invoiceDueInDays ?? tenant?.config?.invoice?.defaultDueInDays ?? 10,
      invoicePrefix: currentCustomer?.invoicePrefix || '',
      invoiceSuffix: currentCustomer?.invoiceSuffix ?? tenant?.config?.defaultInvoiceSuffix ?? '',
      currentInvoiceSerialNumber: currentCustomer?.currentInvoiceSerialNumber || 0,

      // Consignees
      consignees: currentCustomer?.consignees || [],
    }),
    [currentCustomer, tenant]
  );

  // 2.2 Initialize React Hook Form
  const methods = useForm({
    resolver: zodResolver(NewCustomerSchema),
    defaultValues,
    mode: 'all',
  });

  const {
    reset,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  // Watch all form values for conditional rendering
  const values = watch();
  useEffect(() => {
    // Initialize banner input from form GST if empty
    if (!gstInput && values.GSTNo) setGstInput(values.GSTNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.GSTNo]);

  useEffect(() => {
    if (tenant && !currentCustomer) {
      reset(defaultValues);
    }
  }, [tenant, currentCustomer, reset, defaultValues]);

  // 2.3 FieldArray for consignees
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'consignees',
  });

  // 2.4 Submit handler
  const onSubmit = async (data) => {
    try {
      const sanitized = sanitizeCustomerBeforeSubmit(data);
      if (!currentCustomer) {
        await addCustomer(sanitized);
      } else {
        await updateCustomer({ id: currentCustomer._id, data: sanitized });
      }
      reset();
      navigate(paths.dashboard.customer.list);
    } catch (error) {
      console.error(error);
    }
  };

  // 2.5 Helpers to add/remove consignees
  const handleAddConsignee = () => {
    append({ name: '', address: '', state: '', pinCode: '' });
  };

  const handleRemoveConsignee = (index) => {
    remove(index);
  };

  // ------------------------------------------------------
  // 3.1. Whenever customerName changes, update prefix in “create” mode
  // ------------------------------------------------------
  useEffect(() => {
    // If we're editing an existing customer, do nothing
    if (currentCustomer) return;

    // Grab whichever text is in the Customer Name field
    const nameValue = values.customerName || '';
    // Remove all spaces, take first 3 chars, uppercase
    const firstThree = nameValue.replace(/\s+/g, '').substring(0, 3).toUpperCase();

    // If there aren’t at least 3 characters yet, just set default prefix
    if (firstThree.length < 1) {
      setValue('invoicePrefix', tenant?.config?.defaultInvoicePrefix || '');
      return;
    }

    // Compute fiscal year suffix (e.g. "25-26")
    const fy = getCurrentFiscalYearShort();

    // Compose: e.g. "JKC/25-26/"
    const newPrefix = tenant?.config?.defaultInvoicePrefix
      ? `${tenant.config.defaultInvoicePrefix}${firstThree}/${fy}/`
      : `${firstThree}/${fy}/`;
    setValue('invoicePrefix', newPrefix);
  }, [values.customerName, currentCustomer, setValue, tenant]);

  // ----------------------
  // 4. Render each section as a Card
  // ----------------------
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
              Enter a GST number to automatically prefill customer details and save time
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
                const applied = applyGstLookupToForm({
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
              const applied = applyGstLookupToForm({ canonical: resp.canonical, setValue, values });
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

  const renderBasicDetails = (
    <Card>
      <CardHeader title="Basic Details" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="customerName" label="Customer Name" />
        <Field.Text name="address" label="Address" multiline rows={4} />
        <Field.Select name="state" label="State">
          <MenuItem value="">None</MenuItem>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {STATES.map((state) => (
            <MenuItem key={state.value} value={state.value}>
              {state.label}
            </MenuItem>
          ))}
        </Field.Select>
        <Field.Text name="pinCode" label="Pin Code (Optional)" />
        <Field.Text name="cellNo" label="Phone No (Optional)" />
      </Stack>
    </Card>
  );

  const renderFinanceDetails = (
    <Card>
      <CardHeader title="Finance Details" sx={{ mb: 3 }} />
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

        <Stack direction="row" spacing={2} alignItems="center">
          <Field.Switch name="gstEnabled" label="GST Enabled" />
        </Stack>

        <Field.Text name="GSTNo" label="GST No" />

        <Field.Text name="PANNo" label="PAN No (Optional)" />
      </Stack>
    </Card>
  );

  const renderAdditionalDetails = (
    <Card>
      <CardHeader title="Additional Details" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Tooltip title="Customer’s transport ID for your company (appears on LR & invoice)" arrow>
          <Field.Text
            name="transporterCode"
            label="Transporter Code (Optional)"
            placeholder="SHR321"
          />
        </Tooltip>
        <Field.Text
          name="invoiceDueInDays"
          label="Invoice Due In Days"
          type="number"
          InputProps={{
            endAdornment: <InputAdornment position="end">Days</InputAdornment>,
          }}
        />
        <Paper elevation={1} variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Field.Text name="invoicePrefix" label="Invoice Prefix" placeholder="INV/2025-26/" />

            <Field.Text
              name="currentInvoiceSerialNumber"
              label="Invoice Serial Number"
              type="number"
              placeholder="0"
              helperText={
                currentCustomer ? '⚠️ Changing this can cause Duplicate Invoice numbers.' : ''
              }
            />

            <Field.Text
              name="invoiceSuffix"
              label="Invoice Suffix (Optional)"
              placeholder="e.g. /A, -2025, etc."
            />

            {/* 3) Live preview label */}
            <Box>
              <Typography variant="body2">Preview:</Typography>
              {values.invoicePrefix !== '' && values.currentInvoiceSerialNumber !== '' && (
                <Label color="primary" variant="soft" sx={{ mt: 0.5 }}>
                  {values.invoicePrefix}
                  {values.currentInvoiceSerialNumber}
                  {values.invoiceSuffix}
                </Label>
              )}
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Card>
  );

  const renderConsignees = (
    <Card>
      <CardHeader title="Consignees" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={2} sx={{ p: 3 }}>
        {fields.map((field, index) => (
          <Stack key={field.id} spacing={2} sx={{ mt: 1 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(9, 1fr)',
              }}
            >
              <Box gridColumn="span 2">
                <Field.Text name={`consignees[${index}].name`} label="Consignee Name" required />
              </Box>
              <Box gridColumn="span 2">
                <Field.Text
                  name={`consignees[${index}].address`}
                  label="Consignee Address"
                  required
                />
              </Box>
              <Box gridColumn="span 2">
                <Field.Text name={`consignees[${index}].state`} label="Consignee State" required />
              </Box>
              <Box gridColumn="span 2">
                <Field.Text
                  name={`consignees[${index}].pinCode`}
                  label="Consignee Pin Code"
                  required
                />
              </Box>
              <Box gridColumn="span 1" display="flex" justifyContent="center" alignItems="center">
                <Button
                  size="small"
                  color="error"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={() => handleRemoveConsignee(index)}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          </Stack>
        ))}

        <Button
          size="small"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAddConsignee}
          sx={{ mt: 2 }}
        >
          Add Consignee
        </Button>
      </Stack>
    </Card>
  );

  const renderActions = (
    <Stack alignItems="flex-end" sx={{ mt: 3 }}>
      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
        {!currentCustomer ? 'Create Customer' : 'Save Changes'}
      </LoadingButton>
    </Stack>
  );

  // ----------------------
  // 5. Final return
  // ----------------------
  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderGstLookup}
        {renderBasicDetails}
        {renderFinanceDetails}
        {renderAdditionalDetails}
        {renderConsignees}
        {renderActions}
      </Stack>

      {/* Bank selection dialog removed in favor of inline bank details widget */}
    </Form>
  );
}

// Prefill helper from GST lookup
function applyGstLookupToForm({ canonical, setValue, values }) {
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
  assignIfEmpty('customerName', name);
  assignIfEmpty('GSTNo', canonical.gstin);
  // On successful lookup, enable GST
  if (values.gstEnabled !== true) {
    setValue('gstEnabled', true, { shouldValidate: true });
    applied += 1;
  }

  // PAN: derive from canonical.pan or fallback to GSTIN substring
  const panFromGst = (gst) => (gst && gst.length >= 12 ? gst.substring(2, 12) : '');
  const pan = canonical.pan || panFromGst(canonical.gstin || values.GSTNo);
  assignIfEmpty('PANNo', pan);

  // Address and location
  const a = canonical.address || {};
  const addrLine = [a.buildingNumber, a.line1, a.streetName, a.location, a.city, a.district]
    .filter(Boolean)
    .join(', ');
  assignIfEmpty('address', addrLine);
  assignIfEmpty('state', a.state);
  assignIfEmpty('pinCode', a.pincode);

  return applied;
}

// Strip empty bankDetails fields to undefined; drop bankDetails if all empty
function sanitizeCustomerBeforeSubmit(data) {
  const out = { ...data };
  const bd = out?.bankDetails;
  if (bd && typeof bd === 'object') {
    const cleaned = { ...bd };
    const keys = ['name', 'branch', 'ifsc', 'place', 'accNo'];
    keys.forEach((k) => {
      if (cleaned[k] === '') cleaned[k] = undefined;
    });
    const allEmpty = keys.every((k) => cleaned[k] === undefined || cleaned[k] === null);
    if (allEmpty) {
      // Remove bankDetails entirely
      delete out.bankDetails;
    } else {
      out.bankDetails = cleaned;
    }
  }
  return out;
}
