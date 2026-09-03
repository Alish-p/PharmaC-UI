import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import { Card, Stack, Button, Divider, MenuItem, CardHeader } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import COLORS from 'src/theme/core/colors.json';
import { useUpdateTenant } from 'src/query/use-tenant';
import PRIMARY_COLOR from 'src/theme/with-settings/primary-color.json';

import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { BankDetailsWidget } from 'src/components/bank/bank-details-widget';
import { PresetsOptions } from 'src/components/settings/drawer/presets-options';

import { STATES } from '../customer/config';
import TenantLogoCard from './tenant-logo-card';

export const TenantSchema = zod
  .object({
    name: zod.string().min(1, { message: 'Name is required' }),
    slug: zod.string().min(1, { message: 'Slug is required' }),
    tagline: zod.string().optional(),
    theme: zod.string().optional(),
    address: zod.object({
      line1: zod.string().min(1, { message: 'Address is required' }),
      city: zod.string().min(1, { message: 'City is required' }),
      state: zod.string().min(1, { message: 'State is required' }),
      pincode: schemaHelper.pinCode({}),
    }),
    contactDetails: zod.object({
      email: zod.string().email({ message: 'Email must be valid' }),
      phone: schemaHelper.phoneNumber({}),
      website: zod.string().optional(),
    }),
    legalInfo: zod.object({
      panNumber: schemaHelper.panNumberOptional({}),
      gstNumber: schemaHelper.gstNumberOptional({}),
      registeredState: zod.string().optional(),
    }),
    bankDetails: zod
      .object({
        name: zod.string().optional(),
        branch: zod.string().optional(),
        ifsc: zod.string().optional(),
        place: zod.string().optional(),
        accNo: schemaHelper.accountNumberOptional({}),
      })
      .optional(),
    config: zod
      .object({
        vehicle: zod.object({}).optional(),
        pump: zod
          .object({
            enabled: zod.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
    integrations: zod
      .object({
        whatsapp: zod
          .object({
            enabled: zod.boolean().optional(),
          })
          .optional(),
        ewayBill: zod
          .object({
            enabled: zod.boolean().optional(),
            username: zod.string().optional(),
            password: zod.string().optional(),
          })
          .optional(),
        vehicleApi: zod
          .object({
            enabled: zod.boolean().optional(),
          })
          .optional(),
        challanApi: zod
          .object({
            enabled: zod.boolean().optional(),
          })
          .optional(),
        gstApi: zod
          .object({
            enabled: zod.boolean().optional(),
          })
          .optional(),
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
            config: zod
              .object({
                invoiceLedgerNames: zod
                  .object({
                    enabled: zod.boolean().optional(),
                    cgst: zod.string().optional(),
                    igst: zod.string().optional(),
                    sgst: zod.string().optional(),
                    transport_pay: zod.string().optional(),
                    shortage: zod.string().optional(),
                  })
                  .optional(),
                transporterLedgerNames: zod
                  .object({
                    enabled: zod.boolean().optional(),
                    cgst: zod.string().optional(),
                    igst: zod.string().optional(),
                    sgst: zod.string().optional(),
                    tds: zod.string().optional(),
                    diesel: zod.string().optional(),
                    trip_advance: zod.string().optional(),
                    shortage: zod.string().optional(),
                  })
                  .optional(),
              })
              .optional(),
          })
          .optional(),
        maintenanceAndInventory: zod
          .object({
            enabled: zod.boolean().optional(),
          })
          .optional(),
        tyre: zod
          .object({
            enabled: zod.boolean().optional(),
          })
          .optional(),
        epod: zod
          .object({
            enabled: zod.boolean().optional(),
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

    // If invoice ledger group is enabled, all its ledger names are mandatory
    const invoice = data.integrations?.accounting?.config?.invoiceLedgerNames;
    if (invoice?.enabled) {
      const invRequired = ['cgst', 'igst', 'sgst', 'transport_pay', 'shortage'];
      invRequired.forEach((key) => {
        const val = invoice?.[key];
        if (typeof val !== 'string' || val.trim() === '') {
          ctx.addIssue({
            path: ['integrations', 'accounting', 'config', 'invoiceLedgerNames', key],
            code: zod.ZodIssueCode.custom,
            message: 'This field is required when Invoice Ledgers are enabled',
          });
        }
      });
    }

    // If transporter ledger group is enabled, all its ledger names are mandatory
    const transporter = data.integrations?.accounting?.config?.transporterLedgerNames;
    if (transporter?.enabled) {
      const trRequired = ['cgst', 'igst', 'sgst', 'tds', 'diesel', 'trip_advance', 'shortage'];
      trRequired.forEach((key) => {
        const val = transporter?.[key];
        if (typeof val !== 'string' || val.trim() === '') {
          ctx.addIssue({
            path: ['integrations', 'accounting', 'config', 'transporterLedgerNames', key],
            code: zod.ZodIssueCode.custom,
            message: 'This field is required when Transport Payment Ledgers are enabled',
          });
        }
      });
    }
  });

export default function TenantForm({ currentTenant }) {
  const updateTenant = useUpdateTenant();
  const bankDialog = useBoolean();

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
        name: currentTenant?.bankDetails?.name || '',
        branch: currentTenant?.bankDetails?.branch || '',
        ifsc: currentTenant?.bankDetails?.ifsc || '',
        place: currentTenant?.bankDetails?.place || '',
        accNo: currentTenant?.bankDetails?.accNo || '',
      },
      config: {
        vehicle: {},
        pump: {
          enabled: currentTenant?.config?.pump?.enabled ?? true,
        },
      },
      integrations: {
        whatsapp: {
          enabled: currentTenant?.integrations?.whatsapp?.enabled || false,
        },
        ewayBill: {
          enabled: currentTenant?.integrations?.ewayBill?.enabled || false,
          username: currentTenant?.integrations?.ewayBill?.username || '',
          password: currentTenant?.integrations?.ewayBill?.password || '',
        },
        vehicleApi: {
          enabled: currentTenant?.integrations?.vehicleApi?.enabled || false,
        },
        challanApi: {
          enabled: currentTenant?.integrations?.challanApi?.enabled || false,
        },
        gstApi: {
          enabled: currentTenant?.integrations?.gstApi?.enabled || false,
        },
        vehicleGPS: {
          enabled: currentTenant?.integrations?.vehicleGPS?.enabled || false,
          provider: currentTenant?.integrations?.vehicleGPS?.provider ?? null,
        },
        accounting: {
          enabled: currentTenant?.integrations?.accounting?.enabled || false,
          provider: currentTenant?.integrations?.accounting?.provider ?? null,
          config: {
            invoiceLedgerNames: {
              enabled:
                currentTenant?.integrations?.accounting?.config?.invoiceLedgerNames?.enabled ??
                false,
              cgst: currentTenant?.integrations?.accounting?.config?.invoiceLedgerNames?.cgst || '',
              igst: currentTenant?.integrations?.accounting?.config?.invoiceLedgerNames?.igst || '',
              sgst: currentTenant?.integrations?.accounting?.config?.invoiceLedgerNames?.sgst || '',
              transport_pay:
                currentTenant?.integrations?.accounting?.config?.invoiceLedgerNames
                  ?.transport_pay || '',
              shortage:
                currentTenant?.integrations?.accounting?.config?.invoiceLedgerNames?.shortage || '',
            },
            transporterLedgerNames: {
              enabled:
                currentTenant?.integrations?.accounting?.config?.transporterLedgerNames?.enabled ??
                false,
              cgst:
                currentTenant?.integrations?.accounting?.config?.transporterLedgerNames?.cgst || '',
              igst:
                currentTenant?.integrations?.accounting?.config?.transporterLedgerNames?.igst || '',
              sgst:
                currentTenant?.integrations?.accounting?.config?.transporterLedgerNames?.sgst || '',
              tds:
                currentTenant?.integrations?.accounting?.config?.transporterLedgerNames?.tds || '',
              diesel:
                currentTenant?.integrations?.accounting?.config?.transporterLedgerNames?.diesel ||
                '',
              trip_advance:
                currentTenant?.integrations?.accounting?.config?.transporterLedgerNames
                  ?.trip_advance || '',
              shortage:
                currentTenant?.integrations?.accounting?.config?.transporterLedgerNames?.shortage ||
                '',
            },
          },
        },
        maintenanceAndInventory: {
          enabled: currentTenant?.integrations?.maintenanceAndInventory?.enabled || false,
        },
        tyre: {
          enabled: currentTenant?.integrations?.tyre?.enabled || false,
        },
        epod: {
          enabled: currentTenant?.integrations?.epod?.enabled || false,
        },
      },
    }),
    [currentTenant]
  );

  const methods = useForm({ resolver: zodResolver(TenantSchema), defaultValues });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  console.log({ errors });

  const values = watch();

  const onSubmit = async (data) => {
    try {
      const sanitized = {
        ...data,
        integrations: {
          ...data.integrations,
          whatsapp: data.integrations?.whatsapp
            ? {
                ...data.integrations.whatsapp,
              }
            : undefined,
          ewayBill: data.integrations?.ewayBill
            ? {
                ...data.integrations.ewayBill,
              }
            : undefined,
          vehicleApi: data.integrations?.vehicleApi
            ? {
                ...data.integrations.vehicleApi,
              }
            : undefined,
          challanApi: data.integrations?.challanApi
            ? {
                ...data.integrations.challanApi,
              }
            : undefined,
          gstApi: data.integrations?.gstApi
            ? {
                ...data.integrations.gstApi,
              }
            : undefined,
          vehicleGPS: data.integrations?.vehicleGPS
            ? {
                ...data.integrations.vehicleGPS,
                provider: data.integrations.vehicleGPS.provider || null,
              }
            : undefined,
          accounting: data.integrations?.accounting
            ? (() => {
                const acc = data.integrations.accounting;
                const inv = acc?.config?.invoiceLedgerNames || {};
                const tr = acc?.config?.transporterLedgerNames || {};
                const invEnabled = !!inv.enabled;
                const trEnabled = !!tr.enabled;

                const pickNames = (obj) =>
                  Object.fromEntries(
                    Object.entries(obj).filter(
                      ([k, v]) => k !== 'enabled' && typeof v === 'string' && v.trim() !== ''
                    )
                  );

                const cleaned = {
                  invoiceLedgerNames: invEnabled
                    ? { enabled: true, ...pickNames(inv) }
                    : { enabled: false },
                  transporterLedgerNames: trEnabled
                    ? { enabled: true, ...pickNames(tr) }
                    : { enabled: false },
                };
                return {
                  enabled: !!acc.enabled,
                  provider: acc.provider || null,
                  config: cleaned,
                };
              })()
            : undefined,
          maintenanceAndInventory: data.integrations?.maintenanceAndInventory
            ? {
                ...data.integrations.maintenanceAndInventory,
              }
            : undefined,
          tyre: data.integrations?.tyre
            ? {
                ...data.integrations.tyre,
              }
            : undefined,
          epod: data.integrations?.epod
            ? {
                ...data.integrations.epod,
              }
            : undefined,
        },
      };

      // Clean bankDetails: strip empty strings; drop object if all empty
      if (sanitized.bankDetails && typeof sanitized.bankDetails === 'object') {
        const bd = { ...sanitized.bankDetails };
        ['name', 'branch', 'ifsc', 'place', 'accNo'].forEach((k) => {
          if (bd[k] === '') bd[k] = undefined;
        });
        const allEmpty = ['name', 'branch', 'ifsc', 'place', 'accNo'].every(
          (k) => bd[k] === undefined || bd[k] === null
        );
        sanitized.bankDetails = allEmpty ? undefined : bd;
      }

      await updateTenant(sanitized);
    } catch (error) {
      console.error(error);
    }
  };

  const renderBasic = () => (
    <Card>
      <CardHeader title="Basic Details" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="name" label="Name" />
        <Field.Text name="slug" label="Slug" disabled />
        <Field.Text name="tagline" label="Tagline" />
      </Stack>
    </Card>
  );

  const renderAddress = () => (
    <Card>
      <CardHeader title="Address & Contact" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="address.line1" label="Address" />
        <Field.Text name="address.city" label="City" />
        <Field.Select name="address.state" label="State">
          <MenuItem value="">None</MenuItem>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {STATES.map((state) => (
            <MenuItem key={state.value} value={state.value}>
              {state.label}
            </MenuItem>
          ))}
        </Field.Select>
        <Field.Text name="address.pincode" label="Pincode" />
        <Field.Text name="contactDetails.email" label="Email" />
        <Field.Text name="contactDetails.phone" label="Phone" />
        <Field.Text name="contactDetails.website" label="Website" />
      </Stack>
    </Card>
  );

  const renderTheme = () => (
    <Card>
      <CardHeader title="Theme" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <PresetsOptions
          value={values.theme}
          onClickOption={(newValue) => setValue('theme', newValue)}
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
  );

  const renderBank = () => (
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
  );

  const renderBranding = () => <TenantLogoCard tenant={currentTenant} />;

  const renderIntegrations = () => (
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
                placeholder="Enter E-Waybill API username from EwayBill portal."
              />
              <Field.Text
                name="integrations.ewayBill.password"
                label="API Password"
                type="password"
                placeholder="Enter E-Waybill API password from EwayBill portal."
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
            <Stack spacing={2}>
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

              <Field.Switch
                name="integrations.accounting.config.invoiceLedgerNames.enabled"
                labelPlacement="start"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    Invoice Ledgers
                  </Stack>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />

              {values.integrations?.accounting?.config?.invoiceLedgerNames?.enabled && (
                <Stack spacing={1}>
                  <Field.Text
                    name="integrations.accounting.config.invoiceLedgerNames.cgst"
                    label="CGST Ledger Name"
                    placeholder="e.g. CGST @9% Output, cgst9, cgst-9%"
                  />
                  <Field.Text
                    name="integrations.accounting.config.invoiceLedgerNames.igst"
                    label="IGST Ledger Name"
                    placeholder="e.g. IGST @18% Output"
                  />
                  <Field.Text
                    name="integrations.accounting.config.invoiceLedgerNames.sgst"
                    label="SGST Ledger Name"
                    placeholder="e.g. SGST @9% Output"
                  />
                  <Field.Text
                    name="integrations.accounting.config.invoiceLedgerNames.transport_pay"
                    label="Transport Pay Ledger Name"
                  />
                  <Field.Text
                    name="integrations.accounting.config.invoiceLedgerNames.shortage"
                    label="Shortage Ledger Name"
                  />
                </Stack>
              )}

              <Field.Switch
                name="integrations.accounting.config.transporterLedgerNames.enabled"
                labelPlacement="start"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    Transport Payment Ledgers
                  </Stack>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />

              {values.integrations?.accounting?.config?.transporterLedgerNames?.enabled && (
                <Stack spacing={1}>
                  <Field.Text
                    name="integrations.accounting.config.transporterLedgerNames.cgst"
                    label="CGST Ledger Name"
                  />
                  <Field.Text
                    name="integrations.accounting.config.transporterLedgerNames.igst"
                    label="IGST Ledger Name"
                  />
                  <Field.Text
                    name="integrations.accounting.config.transporterLedgerNames.sgst"
                    label="SGST Ledger Name"
                  />
                  <Field.Text
                    name="integrations.accounting.config.transporterLedgerNames.tds"
                    label="TDS Ledger Name"
                  />
                  <Field.Text
                    name="integrations.accounting.config.transporterLedgerNames.diesel"
                    label="Diesel Ledger Name"
                  />
                  <Field.Text
                    name="integrations.accounting.config.transporterLedgerNames.trip_advance"
                    label="Trip Advance Ledger Name"
                  />
                  <Field.Text
                    name="integrations.accounting.config.transporterLedgerNames.shortage"
                    label="Shortage Ledger Name"
                  />
                </Stack>
              )}
            </Stack>
          )}
        </Stack>

        <Stack spacing={1}>
          <Field.Switch
            name="integrations.maintenanceAndInventory.enabled"
            labelPlacement="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="mdi:tools" />
                Maintenance & Inventory
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
                <Iconify icon="mdi:tire" />
                Tyre
              </Stack>
            }
            sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
          />
        </Stack>

        <Stack spacing={1}>
          <Field.Switch
            name="integrations.epod.enabled"
            labelPlacement="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="mdi:signature-freehand" />
                Electronic POD (EPOD)
              </Stack>
            }
            sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
          />
        </Stack>
      </Stack>
    </Card>
  );

  const renderActions = () => (
    <Stack alignItems="flex-end" sx={{ mt: 3 }}>
      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
        Save Changes
      </LoadingButton>
    </Stack>
  );

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderBasic()}
        {renderBranding()}
        {renderAddress()}
        {renderTheme()}
        {renderBank()}
        {renderIntegrations()}
        {renderActions()}
      </Stack>
    </Form>
  );
}
