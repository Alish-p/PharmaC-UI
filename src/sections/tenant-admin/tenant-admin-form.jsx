import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

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
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import COLORS from 'src/theme/core/colors.json';
import { useTenant } from 'src/query/use-tenant';
import { useCustomerGstLookup } from 'src/query/use-customer';
import PRIMARY_COLOR from 'src/theme/with-settings/primary-color.json';
import { useCreateTenant, useUpdateTenantById } from 'src/query/use-tenant-admin';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { BankDetailsWidget } from 'src/components/bank/bank-details-widget';
import { PresetsOptions } from 'src/components/settings/drawer/presets-options';

import { STATES } from 'src/sections/customer/config';

import TenantLogoCardAdmin from './tenant-logo-card-admin';

export const TenantAdminSchema = zod
  .object({
    name: zod.string().min(1, { message: 'Name is required' }),
    slug: zod.string().min(1, { message: 'Slug is required' }),
    tagline: zod.string().optional(),
    theme: zod.string().optional(),
    address: zod
      .object({
        line1: zod.string().min(1, { message: 'Address is required' }),
        city: zod.string().min(1, { message: 'City is required' }),
        state: zod.string().min(1, { message: 'State is required' }),
        pincode: schemaHelper.pinCode({}),
      })
      .optional(),
    contactDetails: zod
      .object({
        email: zod.string().email({ message: 'Email must be valid' }).optional(),
        phone: schemaHelper.phoneNumberOptional({}),
        website: zod.string().optional(),
      })
      .optional(),
    legalInfo: zod
      .object({
        panNumber: schemaHelper.panNumberOptional({}),
        gstNumber: schemaHelper.gstNumberOptional({}),
        registeredState: zod.string().optional(),
      })
      .optional(),
    integrations: zod
      .object({
        whatsapp: zod.object({ enabled: zod.boolean().optional() }).optional(),
        ewayBill: zod
          .object({
            enabled: zod.boolean().optional(),
            username: zod.string().optional(),
            password: zod.string().optional(),
          })
          .optional(),
        vehicleApi: zod.object({ enabled: zod.boolean().optional() }).optional(),
        challanApi: zod.object({ enabled: zod.boolean().optional() }).optional(),
        gstApi: zod.object({ enabled: zod.boolean().optional() }).optional(),
        tyre: zod.object({ enabled: zod.boolean().optional() }).optional(),
        vehicleGPS: zod
          .object({
            enabled: zod.boolean().optional(),
            provider: zod
              .preprocess(
                (val) => (val === '' ? null : val),
                zod.enum(['Fleetx', 'LocoNav', 'BlackBuck', 'Other']).nullable()
              )
              .optional(),
          })
          .optional(),
        accounting: zod
          .object({
            enabled: zod.boolean().optional(),
            provider: zod
              .preprocess(
                (val) => (val === '' ? null : val),
                zod.enum(['Tally', 'Mark', 'Zoho']).nullable()
              )
              .optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.integrations?.vehicleGPS?.enabled && !data.integrations.vehicleGPS.provider) {
      ctx.addIssue({
        path: ['integrations', 'vehicleGPS', 'provider'],
        code: zod.ZodIssueCode.custom,
        message: 'Provider is required when Vehicle GPS is enabled',
      });
    }
    if (data.integrations?.accounting?.enabled && !data.integrations.accounting.provider) {
      ctx.addIssue({
        path: ['integrations', 'accounting', 'provider'],
        code: zod.ZodIssueCode.custom,
        message: 'Provider is required when Accounting is enabled',
      });
    }
  });

export default function TenantAdminForm({ currentTenant, onSaved }) {
  const isEditing = Boolean(currentTenant?._id);
  const { createTenant, creatingTenant } = useCreateTenant();
  const { updateTenantById, updatingTenant } = useUpdateTenantById();
  const { data: myTenant } = useTenant();
  const integrationEnabled = !!myTenant?.integrations?.gstApi?.enabled;
  const { lookupGst, isLookingUpGst } = useCustomerGstLookup();
  const [appliedFields, setAppliedFields] = useState(0);
  const [gstInput, setGstInput] = useState('');

  const defaultValues = useMemo(
    () => ({
      name: currentTenant?.name || '',
      slug: currentTenant?.slug || '',
      tagline: currentTenant?.tagline || '',
      theme: currentTenant?.theme || 'default',
      address: {
        line1: currentTenant?.address?.line1 || '',
        city: currentTenant?.address?.city || '',
        state: currentTenant?.address?.state || '',
        pincode: currentTenant?.address?.pincode || '',
      },
      contactDetails: {
        email: currentTenant?.contactDetails?.email || '',
        phone: currentTenant?.contactDetails?.phone || '',
        website: currentTenant?.contactDetails?.website || '',
      },
      legalInfo: {
        panNumber: currentTenant?.legalInfo?.panNumber || '',
        gstNumber: currentTenant?.legalInfo?.gstNumber || '',
        registeredState: currentTenant?.legalInfo?.registeredState || '',
      },
      bankDetails: {
        name: currentTenant?.bankDetails?.name || currentTenant?.bankDetails?.bankName || '',
        branch: currentTenant?.bankDetails?.branch || '',
        ifsc: currentTenant?.bankDetails?.ifsc || currentTenant?.bankDetails?.ifscCode || '',
        place: currentTenant?.bankDetails?.place || '',
        accNo: currentTenant?.bankDetails?.accNo || currentTenant?.bankDetails?.accountNumber || '',
      },
      integrations: {
        whatsapp: { enabled: currentTenant?.integrations?.whatsapp?.enabled || false },
        ewayBill: {
          enabled: currentTenant?.integrations?.ewayBill?.enabled || false,
          username: currentTenant?.integrations?.ewayBill?.username || '',
          password: currentTenant?.integrations?.ewayBill?.password || '',
        },
        vehicleApi: { enabled: currentTenant?.integrations?.vehicleApi?.enabled || false },
        challanApi: { enabled: currentTenant?.integrations?.challanApi?.enabled || false },
        gstApi: { enabled: currentTenant?.integrations?.gstApi?.enabled || false },
        tyre: { enabled: currentTenant?.integrations?.tyre?.enabled || false },
        vehicleGPS: {
          enabled: currentTenant?.integrations?.vehicleGPS?.enabled || false,
          provider: currentTenant?.integrations?.vehicleGPS?.provider ?? null,
        },
        accounting: {
          enabled: currentTenant?.integrations?.accounting?.enabled || false,
          provider: currentTenant?.integrations?.accounting?.provider ?? null,
        },
      },
    }),
    [currentTenant]
  );

  const methods = useForm({ resolver: zodResolver(TenantAdminSchema), defaultValues });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = methods;
  const values = watch();
  const bankDialog = useBoolean();

  // Helper to generate slug from name (lowercase and hyphenated)
  const slugify = (str) =>
    (str || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  // Auto-generate slug from name while creating (slug is immutable after creation)
  const watchName = watch('name');
  useEffect(() => {
    if (!isEditing) {
      setValue('slug', slugify(watchName), { shouldValidate: true, shouldDirty: true });
    }
  }, [watchName, isEditing, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    // Clean nested optional objects by removing empty strings
    const clean = (obj, keys) => {
      const result = { ...obj };
      keys.forEach((k) => {
        if (result[k] === '') result[k] = undefined;
      });
      return result;
    };

    const payload = {
      name: data.name,
      tagline: data.tagline || undefined,
      theme: data.theme || undefined,
      address: data.address?.line1 ? data.address : undefined,
      contactDetails:
        data.contactDetails?.email || data.contactDetails?.phone || data.contactDetails?.website
          ? clean(data.contactDetails, ['email', 'phone', 'website'])
          : undefined,
      legalInfo:
        data.legalInfo?.panNumber || data.legalInfo?.gstNumber || data.legalInfo?.registeredState
          ? clean(data.legalInfo, ['panNumber', 'gstNumber', 'registeredState'])
          : undefined,
      // bank details
      bankDetails: (() => {
        const bd = { ...(data.bankDetails || {}) };
        ['name', 'branch', 'ifsc', 'place', 'accNo'].forEach((k) => {
          if (bd[k] === '') bd[k] = undefined;
        });
        const allEmpty = ['name', 'branch', 'ifsc', 'place', 'accNo'].every(
          (k) => bd[k] === undefined || bd[k] === null
        );
        return allEmpty ? undefined : bd;
      })(),
      integrations: data.integrations
        ? {
            whatsapp: data.integrations?.whatsapp?.enabled ? { enabled: true } : { enabled: false },
            ewayBill: data.integrations?.ewayBill?.enabled
              ? {
                  enabled: true,
                  username: data.integrations.ewayBill.username || '',
                  password: data.integrations.ewayBill.password || '',
                }
              : { enabled: false },
            vehicleApi: data.integrations?.vehicleApi?.enabled
              ? { enabled: true }
              : { enabled: false },
            challanApi: data.integrations?.challanApi?.enabled
              ? { enabled: true }
              : { enabled: false },
            gstApi: data.integrations?.gstApi?.enabled ? { enabled: true } : { enabled: false },
            tyre: data.integrations?.tyre?.enabled ? { enabled: true } : { enabled: false },
            vehicleGPS: data.integrations?.vehicleGPS
              ? {
                  enabled: !!data.integrations.vehicleGPS.enabled,
                  provider: data.integrations.vehicleGPS.provider || null,
                }
              : undefined,
            accounting: data.integrations?.accounting
              ? {
                  enabled: !!data.integrations.accounting.enabled,
                  provider: data.integrations.accounting.provider || null,
                }
              : undefined,
          }
        : undefined,
    };

    // Slug is immutable. Only include during creation.
    if (!isEditing) {
      payload.slug = data.slug;
    }

    if (currentTenant?._id) {
      const updated = await updateTenantById({ id: currentTenant._id, data: payload });
      if (onSaved) onSaved(updated);
    } else {
      const created = await createTenant(payload);
      if (onSaved) onSaved(created);
    }
  });

  const pending = isSubmitting || creatingTenant || updatingTenant;

  // GST Quick Lookup banner (like customer form)
  const renderGstLookup =
    integrationEnabled && !isEditing ? (
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
              Enter a GST number to automatically prefill tenant details and save time
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
                const applied = applyGstLookupToTenantAdminForm({
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
              const applied = applyGstLookupToTenantAdminForm({
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
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderGstLookup}
        {/* Branding */}
        {currentTenant?._id && <TenantLogoCardAdmin tenant={currentTenant} onUpdated={onSaved} />}

        {/* Basic details */}
        <Card>
          <CardHeader title="Basic Details" sx={{ mb: 3 }} />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Field.Text name="name" label="Company name" />
            <Field.Text
              name="slug"
              label="Slug"
              disabled
              helperText={
                isEditing
                  ? 'Slug is locked after creation'
                  : 'Auto-generated from name; locked after creation'
              }
            />
            <Field.Text name="tagline" label="Tagline" />
          </Stack>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader title="Theme" sx={{ mb: 3 }} />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <PresetsOptions
              value={methods.watch('theme')}
              onClickOption={(newValue) => methods.setValue('theme', newValue)}
              options={[
                { name: 'default', value: COLORS.primary.main },
                { name: 'cyan', value: PRIMARY_COLOR.cyan.main },
                { name: 'purple', value: PRIMARY_COLOR.purple.main },
                { name: 'blue', value: PRIMARY_COLOR.blue.main },
                { name: 'orange', value: PRIMARY_COLOR.orange.main },
                { name: 'red', value: PRIMARY_COLOR.red.main },
              ]}
            />
          </Stack>
        </Card>

        {/* Address & Contact */}
        <Card>
          <CardHeader title="Address & Contact" sx={{ mb: 3 }} />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Field.Text name="address.line1" label="Address" />
            <Field.Text name="address.city" label="City" />
            <Field.Text name="address.state" label="State" />
            <Field.Text name="address.pincode" label="Pincode" />
            <Field.Text name="contactDetails.email" label="Email" />
            <Field.Text name="contactDetails.phone" label="Phone" />
            <Field.Text name="contactDetails.website" label="Website" />
          </Stack>
        </Card>

        {/* Integrations (styled like tenant form) */}
        <Card>
          <CardHeader title="Integrations" sx={{ mb: 3 }} />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Field.Switch
                name="integrations.whatsapp.enabled"
                labelPlacement="start"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="prime:whatsapp" />
                    WhatsApp
                  </Stack>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            </Stack>

            <Stack spacing={1}>
              <Field.Switch
                name="integrations.ewayBill.enabled"
                labelPlacement="start"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="mdi:file-document-outline" />
                    eWay Bill
                  </Stack>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              {values.integrations?.ewayBill?.enabled && (
                <Stack spacing={2} sx={{ mt: 1, pl: 4 }}>
                  <Field.Text
                    name="integrations.ewayBill.username"
                    label="API Username"
                    placeholder="Enter E-Waybill API username"
                  />
                  <Field.Text
                    name="integrations.ewayBill.password"
                    label="API Password"
                    type="password"
                    placeholder="Enter E-Waybill API password"
                  />
                </Stack>
              )}
            </Stack>

            <Stack spacing={1}>
              <Field.Switch
                name="integrations.vehicleApi.enabled"
                labelPlacement="start"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="mdi:car-search-outline" />
                    Vehicle API
                  </Stack>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            </Stack>

            <Stack spacing={1}>
              <Field.Switch
                name="integrations.challanApi.enabled"
                labelPlacement="start"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="mdi:police-badge" />
                    Traffic eChallan
                  </Stack>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            </Stack>

            <Stack spacing={1}>
              <Field.Switch
                name="integrations.gstApi.enabled"
                labelPlacement="start"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="mdi:account-search-outline" />
                    GST API
                  </Stack>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            </Stack>

            <Stack spacing={1}>
              <Field.Switch
                name="integrations.tyre.enabled"
                labelPlacement="start"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="mingcute:tyre-line" />
                    Tyre Management
                  </Stack>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            </Stack>

            <Stack spacing={1}>
              <Field.Switch
                name="integrations.vehicleGPS.enabled"
                labelPlacement="start"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="mdi:location-radius-outline" />
                    Vehicle GPS
                  </Stack>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              {values.integrations?.vehicleGPS?.enabled && (
                <Field.Select name="integrations.vehicleGPS.provider" label="Provider">
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Fleetx">Fleetx</MenuItem>
                  <MenuItem value="LocoNav">LocoNav</MenuItem>
                  <MenuItem value="BlackBuck">BlackBuck</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Field.Select>
              )}
            </Stack>

            <Stack spacing={1}>
              <Field.Switch
                name="integrations.accounting.enabled"
                labelPlacement="start"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="mdi:calculator-variant" />
                    Accounting
                  </Stack>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              {values.integrations?.accounting?.enabled && (
                <Field.Select name="integrations.accounting.provider" label="Provider">
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Tally">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="mdi:alpha-t-circle-outline" width={20} />
                      Tally
                    </Stack>
                  </MenuItem>
                  <MenuItem value="Mark">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="mdi:alpha-m-circle-outline" width={20} />
                      Mark
                    </Stack>
                  </MenuItem>
                  <MenuItem value="Zoho">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="simple-icons:zoho" width={20} />
                      Zoho
                    </Stack>
                  </MenuItem>
                </Field.Select>
              )}
            </Stack>
          </Stack>
        </Card>

        {/* Bank & Legal (parity with tenant-scoped form) */}
        <Card>
          <CardHeader title="Bank & Legal" sx={{ mb: 3 }} />
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

            <Field.Text name="legalInfo.panNumber" label="PAN Number" />
            <Field.Text name="legalInfo.gstNumber" label="GST Number" />
            <Field.Select name="legalInfo.registeredState" label="Registered State">
              <MenuItem value="">None</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              {STATES.map((state) => (
                <MenuItem key={state.value} value={state.value}>
                  {state.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Stack>
        </Card>

        <Stack direction="row" justifyContent="flex-end">
          <LoadingButton type="submit" variant="contained" loading={pending}>
            {currentTenant?._id ? 'Save Changes' : 'Create Tenant'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}

// Prefill helper from GST lookup (canonical) for Tenant Admin form
function applyGstLookupToTenantAdminForm({ canonical, setValue, values }) {
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
  assignIfEmpty('name', name);
  assignIfEmpty('legalInfo.gstNumber', canonical.gstin);

  // PAN: derive from canonical.pan or fallback to GSTIN substring
  const panFromGst = (gst) => (gst && gst.length >= 12 ? gst.substring(2, 12) : '');
  const pan = canonical.pan || panFromGst(canonical.gstin || values?.legalInfo?.gstNumber);
  assignIfEmpty('legalInfo.panNumber', pan);

  // Address & location
  const a = canonical.address || {};
  const addrLine = [a.buildingNumber, a.line1, a.streetName, a.location].filter(Boolean).join(', ');
  assignIfEmpty('address.line1', addrLine);
  assignIfEmpty('address.city', a.city || a.district);
  assignIfEmpty('address.state', a.state);
  assignIfEmpty('address.pincode', a.pincode);
  // Also set legal registered state if empty
  assignIfEmpty('legalInfo.registeredState', a.state);

  return applied;
}
