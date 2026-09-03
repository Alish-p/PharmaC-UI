import { z } from 'zod';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Alert,
  Button,
  Divider,
  Tooltip,
  MenuItem,
  FormLabel,
  Typography,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useFieldHelpers } from 'src/hooks/use-form-config';
import { useSystemFeatures } from 'src/hooks/use-system-features';
import { useMaterialOptions } from 'src/hooks/use-material-options';

import { paramCase } from 'src/utils/change-case';

import { useUpdateSubtrip } from 'src/query/use-subtrip';

import { APP_ICONS } from 'src/components/iconify/icons';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { DialogSelectButton } from 'src/components/dialog-select-button';

// import { FREIGHT_MODELS } removed

import { loadingWeightUnit } from '../vehicle/vehicle-config';
import { KanbanPumpDialog } from '../kanban/components/kanban-pump-dialog';
import { KanbanDriverDialog } from '../kanban/components/kanban-driver-dialog';
import { KanbanCustomerDialog } from '../kanban/components/kanban-customer-dialog';
// Route dialog removed
import { SUBTRIP_STATUS, FREIGHT_MODEL_OPTIONS, DRIVER_ADVANCE_GIVEN_BY_OPTIONS } from './constants';

// Base schema for common fields
const baseSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  driverId: z.string().min(1, 'Driver is required'),
  diNumber: z.string().max(50, 'DI/DO No is too long').optional(),
  startDate: schemaHelper.date(),
  vehicleAssignment: z.enum(['schedule', 'adhock']).optional(),
});

const numericInputSchema = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? n : undefined;
}, z.number().optional());

const freightDetailsSchema = z.object({
  freightModel: z.enum(['per_ton', 'per_kl', 'fixed', 'per_km', 'per_hour', 'hybrid']).optional(),
  freightAmount: numericInputSchema,
  baseKm: numericInputSchema,
  rate: numericInputSchema,
  startKm: numericInputSchema,
});

// Schema for Loaded status
const loadedSchemaBase = baseSchema.extend({
  consignee: z.string().max(100).nullable().optional(),
  loadingPoint: z.string().max(100).nullable().optional(),
  unloadingPoint: z
    .union([z.string(), z.array(z.object({ label: z.string(), value: z.string() }))])
    .nullable()
    .optional(),
  loadingWeight: numericInputSchema,
  quantity: numericInputSchema,
  freightDetails: freightDetailsSchema.nullable().optional(),
  ewayBill: z.string().max(100).nullable().optional(),
  ewayExpiryDate: schemaHelper.dateOptional(),
  invoiceNo: z.string().max(100).nullable().optional(),
  shipmentNo: z.string().max(100).nullable().optional(),
  orderNo: z.string().max(100).nullable().optional(),
  referenceSubtripNo: z.string().max(100).nullable().optional(),
  materialType: z.string().max(100).nullable().optional(),
  grade: z.string().max(100).nullable().optional(),
  driverAdvance: numericInputSchema,
  driverAdvanceGivenBy: z.enum(['Self', 'Fuel Pump']).nullable().optional(),
  initialAdvanceDiesel: numericInputSchema,
  intentFuelPump: z.string().nullable().optional(),
});

// Schema for Received status (extends loaded)
const receivedSchemaBase = loadedSchemaBase.extend({
  unloadingWeight: numericInputSchema,
  endDate: schemaHelper.dateOptional(),
  hasShortage: z.boolean().nullable().optional(),
  shortageWeight: numericInputSchema,
  shortageAmount: numericInputSchema,
  hasError: z.boolean().nullable().optional(),
  errorRemarks: z.string().max(500).nullable().optional(),
  remarks: z.string().max(500).nullable().optional(),
  commissionDetails: z
    .object({
      commissionRate: numericInputSchema,
      commissionAmount: numericInputSchema,
    })
    .nullable()
    .optional(),
});

const freightSuperRefine = (data, ctx) => {
  const fm = data.freightDetails?.freightModel;
  const rate = data.freightDetails?.rate;
  const baseKm = data.freightDetails?.baseKm;
  const freightAmount = data.freightDetails?.freightAmount;

  if (fm === 'fixed' && !freightAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Freight Amount is required',
      path: ['freightDetails', 'freightAmount'],
    });
  } else if (fm === 'hybrid' && (!freightAmount || !baseKm || !rate)) {
    if (!freightAmount)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Base Freight Amount is required',
        path: ['freightDetails', 'freightAmount'],
      });
    if (!baseKm)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Base KM is required',
        path: ['freightDetails', 'baseKm'],
      });
    if (!rate)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Extra Rate is required',
        path: ['freightDetails', 'rate'],
      });
  } else if (
    (fm === 'per_ton' || fm === 'per_kl' || fm === 'per_km' || fm === 'per_hour') &&
    !rate
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Rate is required',
      path: ['freightDetails', 'rate'],
    });
  }
};

const loadedSchema = loadedSchemaBase.superRefine(freightSuperRefine);
const receivedSchema = receivedSchemaBase.superRefine(freightSuperRefine);

// Get the appropriate schema based on status
const getSchemaForStatus = (status) => {
  switch (status) {
    case SUBTRIP_STATUS.LOADED:
      return loadedSchema;
    case SUBTRIP_STATUS.RECEIVED:
      return receivedSchema;
    default:
      return baseSchema;
  }
};

// ----------------------------------------------------------------------

export default function SubtripEditForm({ currentSubtrip }) {
  const navigate = useNavigate();
  const updateSubtrip = useUpdateSubtrip();
  const materialOptions = useMaterialOptions();
  const { getLabel, isRequired, freightConfig } = useFieldHelpers(
    'subtrip',
    currentSubtrip?.customerId?._id
  );
  const { pumps: hasPumps } = useSystemFeatures();

  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const customerDialog = useBoolean();
  const pumpDialog = useBoolean();
  const driverDialog = useBoolean();
  // Route dialog removed

  const [selectedPump, setSelectedPump] = useState(currentSubtrip?.intentFuelPump);
  const [selectedDriver, setSelectedDriver] = useState(currentSubtrip?.driverId);
  // Route selection removed
  const [selectedCustomer, setSelectedCustomer] = useState(currentSubtrip?.customerId);

  const defaultValues = useMemo(
    () => ({
      ...currentSubtrip,
      unloadingPoint: currentSubtrip?.unloadingPoint
        ? currentSubtrip.unloadingPoint.split(' | ').map((x) => ({ label: x, value: x }))
        : [],
      hasShortage: currentSubtrip?.shortageWeight > 0 || false,
      customerId: currentSubtrip?.customerId?._id,
      driverId: currentSubtrip?.driverId?._id,
      intentFuelPump: currentSubtrip?.intentFuelPump?._id,
      remarks: currentSubtrip?.remarks || '',
      errorRemarks: currentSubtrip?.errorRemarks || '',
      vehicleAssignment: currentSubtrip?.vehicleAssignment || 'schedule',
      freightDetails: currentSubtrip?.freightDetails || {
        freightModel: 'per_ton',
        rate: currentSubtrip?.freightDetails?.rate || 0,
      },
      commissionDetails: currentSubtrip?.commissionDetails || {
        commissionRate: currentSubtrip?.commissionDetails?.commissionRate || 0,
        commissionAmount: 0,
      },
    }),
    [currentSubtrip]
  );

  const methods = useForm({
    defaultValues,
    mode: 'all',
    resolver: (values) => {
      const schema = getSchemaForStatus(currentSubtrip.subtripStatus);
      try {
        schema.parse(values);

        const errors = {};

        // Map of form fields to their config names
        const fieldMappings = {
          consignee: 'consignee',
          loadingPoint: 'loadingPoint',
          unloadingPoint: 'unloadingPoint',
          loadingWeight: 'loadingWeight',
          quantity: 'quantity',
          ewayBill: 'ewayBill',
          ewayExpiryDate: 'ewayExpiryDate',
          invoiceNo: 'invoiceNo',
          shipmentNo: 'shipmentNo',
          orderNo: 'orderNo',
          referenceSubtripNo: 'referenceSubtripNo',
          materialType: 'materialType',
          grade: 'grade',
          diNumber: 'diNumber',
          remarks: 'remarks',
          vehicleAssignment: 'vehicleAssignment',
        };

        // Validate other fields based on configuration
        Object.entries(fieldMappings).forEach(([formField, configField]) => {
          if (isRequired(configField)) {
            const val = values[formField];
            const isEmpty =
              val === undefined ||
              val === null ||
              val === '' ||
              (Array.isArray(val) && val.length === 0);
            if (isEmpty) {
              errors[formField] = {
                message: `${getLabel(configField, formField).replace(' *', '')} is required`,
                type: 'manual',
              };
            }
          }
        });

        // For received status, unloadingWeight might be required
        if (currentSubtrip.subtripStatus === SUBTRIP_STATUS.RECEIVED) {
          const fm = values.freightDetails?.freightModel || 'per_ton';
          const isUnloadingWeightRequired =
            fm === 'per_ton' || fm === 'per_kl' || isRequired('unloadingWeight');
          if (
            isUnloadingWeightRequired &&
            (values.unloadingWeight === undefined ||
              values.unloadingWeight === null ||
              values.unloadingWeight === '')
          ) {
            errors.unloadingWeight = { message: 'Unloading weight is required', type: 'manual' };
          }
        }

        if (Object.keys(errors).length > 0) {
          return { values, errors };
        }

        return { values, errors: {} };
      } catch (error) {
        const formattedErrors = {};
        if (error.formErrors?.fieldErrors) {
          Object.entries(error.formErrors.fieldErrors).forEach(([field, msgs]) => {
            if (msgs && msgs.length > 0) {
              formattedErrors[field] = { message: msgs[0], type: 'manual' };
            }
          });
        }
        return { values, errors: formattedErrors };
      }
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, dirtyFields },
  } = methods;

  const values = watch();

  const { vehicleType, isOwn } = currentSubtrip?.vehicleId || {};

  // Build list of financial documents that block editing.
  // currentSubtrip already has these populated (invoiceNo / paymentId) from the API.
  const blockingDocuments = useMemo(() => {
    const docs = [];
    if (currentSubtrip?.transporterPaymentReceiptId) {
      const id = currentSubtrip.transporterPaymentReceiptId.paymentId
        ?? currentSubtrip.transporterPaymentReceiptId;
      docs.push(`Transporter Payment [${id}]`);
    }
    if (currentSubtrip?.invoiceId) {
      const id = currentSubtrip.invoiceId.invoiceNo ?? currentSubtrip.invoiceId;
      docs.push(`Invoice [${id}]`);
    }
    if (currentSubtrip?.driverSalaryId) {
      const id = currentSubtrip.driverSalaryId.paymentId ?? currentSubtrip.driverSalaryId;
      docs.push(`Driver Salary [${id}]`);
    }
    return docs;
  }, [currentSubtrip]);

  const isFinanciallyLocked = blockingDocuments.length > 0;

  const commissionRateInput = watch('commissionDetails.commissionRate');
  const loadingWeightInput = watch('loadingWeight');
  const freightModel = values?.freightDetails?.freightModel || 'per_ton';

  useEffect(() => {
    if (isOwn || freightModel !== 'per_ton') return;
    const rate = Number(commissionRateInput || 0);
    const weight = Number(loadingWeightInput || 0);
    setValue('commissionDetails.commissionAmount', rate * weight, { shouldDirty: true });
  }, [commissionRateInput, loadingWeightInput, freightModel, isOwn, setValue]);

  const handleDriverChange = (driver) => {
    setSelectedDriver(driver);
    setValue('driverId', driver._id, { shouldDirty: true });
  };

  const handleCustomerChange = (customer) => {
    setSelectedCustomer(customer);
    setValue('customerId', customer._id, { shouldDirty: true });
  };

  const handlePumpChange = (pump) => {
    setSelectedPump(pump);
    setValue('intentFuelPump', pump._id, { shouldDirty: true });
  };

  // Route change removed

  const onSubmit = async (data) => {
    try {
      // only send the data that has changed, excluding trip-only fields (startKm/endKm)
      const changedFields = Object.keys(dirtyFields)
        .filter(
          (key) =>
            key !== 'startKm' &&
            key !== 'endKm' &&
            key !== 'freightDetails' &&
            key !== 'commissionDetails'
        )
        .reduce((acc, key) => {
          acc[key] = data[key];
          return acc;
        }, {});

      if (changedFields.unloadingPoint !== undefined) {
        changedFields.unloadingPoint = Array.isArray(data.unloadingPoint)
          ? data.unloadingPoint
              .map((item) => item.value || item.label)
              .filter(Boolean)
              .join(' | ')
          : data.unloadingPoint;
      }

      if (dirtyFields.freightDetails) {
        changedFields.freightDetails = { ...data.freightDetails };
        // Strip freightAmount for dynamically calculated models so the backend recalculates it correctly
        const fm = changedFields.freightDetails.freightModel || 'per_ton';
        if (fm !== 'fixed' && fm !== 'hybrid') {
          delete changedFields.freightDetails.freightAmount;
        }
      }

      if (dirtyFields.commissionDetails) {
        changedFields.commissionDetails = data.commissionDetails;
      }

      await updateSubtrip({
        id: currentSubtrip._id,
        data: {
          ...changedFields,
        },
      });

      if (redirect) {
        navigate(`${redirect}?currentSubtrip=${currentSubtrip._id}`);
      } else {
        navigate(paths.dashboard.subtrip.details(paramCase(currentSubtrip._id)));
      }
    } catch (error) {
      toast.error('Failed to update job!');
      console.error(error);
    }
  };

  // Render fields based on status
  const renderFields = () => {
    const status = currentSubtrip.subtripStatus;
    const rate = values?.freightDetails?.rate || 0;
    const endDate = values?.endDate;

    // Auto-calculate expected freight amount like receive form
    let displayFreightAmount = values?.freightDetails?.freightAmount || 0;
    if (freightModel === 'per_km' && values?.freightDetails?.endKm) {
      const startKm = values?.freightDetails?.startKm || 0;
      const endKm = Number(values.freightDetails.endKm);
      if (endKm > startKm) displayFreightAmount = (endKm - startKm) * rate;
    } else if (freightModel === 'hybrid' && values?.freightDetails?.endKm) {
      const startKm = values?.freightDetails?.startKm || 0;
      const endKm = Number(values.freightDetails.endKm);
      const baseKm = values?.freightDetails?.baseKm || 0;
      const baseFreight = values?.freightDetails?.freightAmount || 0;
      const totalKm = endKm > startKm ? endKm - startKm : 0;
      if (totalKm > baseKm && rate > 0) {
        displayFreightAmount = baseFreight + (totalKm - baseKm) * rate;
      } else {
        displayFreightAmount = baseFreight;
      }
    } else if (freightModel === 'per_hour' && endDate && values?.startDate) {
      const start = dayjs(values.startDate);
      const end = dayjs(endDate);
      const diffInHours = Math.ceil(end.diff(start, 'hour', true));
      if (diffInHours > 0) displayFreightAmount = diffInHours * rate;
    } else if (freightModel === 'per_ton' || freightModel === 'per_kl') {
      const weight = values?.loadingWeight || 0;
      displayFreightAmount = weight * rate;
    }

    const getFreightExplanation = () => {
      if (freightModel === 'per_hour' && endDate && values?.startDate) {
        const start = dayjs(values.startDate);
        const end = dayjs(endDate);
        const diffInHours = Math.ceil(end.diff(start, 'hour', true));
        return `calculated for ${diffInHours} hour${diffInHours !== 1 ? 's' : ''} at ₹${rate}/hour (job dates: ${dayjs(values.startDate).format('DD MMM YYYY, hh:mm A')} to ${dayjs(endDate).format('DD MMM YYYY, hh:mm A')})`;
      }
      if (freightModel === 'per_km') {
        const startKm = values?.freightDetails?.startKm || 0;
        const endKm = Number(values?.freightDetails?.endKm || startKm);
        const diffKm = endKm > startKm ? endKm - startKm : 0;
        if (diffKm > 0)
          return `calculated for ${diffKm} km at ₹${rate}/km (KM: ${startKm} to ${endKm})`;
        return `calculated at ₹${rate}/km`;
      }
      if (freightModel === 'hybrid') {
        const startKm = values?.freightDetails?.startKm || 0;
        const endKm = Number(values?.freightDetails?.endKm || startKm);
        const totalKm = endKm > startKm ? endKm - startKm : 0;
        const baseKm = values?.freightDetails?.baseKm || 0;
        const baseFreight = values?.freightDetails?.freightAmount || 0;
        const extraKm = totalKm > baseKm ? totalKm - baseKm : 0;
        if (extraKm > 0)
          return `calculated using base freight of ₹${baseFreight} (${baseKm} km) + extra ${extraKm} km at ₹${rate}/km`;
        return `calculated using base freight of ₹${baseFreight} (${baseKm} km)`;
      }
      if (freightModel === 'per_ton' || freightModel === 'per_kl') {
        const weight = values?.loadingWeight || 0;
        const unit = freightModel === 'per_kl' ? 'KL' : loadingWeightUnit[vehicleType] || 'tons';
        const rateLabel = freightModel === 'per_kl' ? 'KL' : 'ton';
        return `calculated for loading weight of ${weight} ${unit} at ₹${rate}/${rateLabel}`;
      }
      if (freightModel === 'fixed') {
        const baseFreight = values?.freightDetails?.freightAmount || 0;
        return `fixed freight amount of ₹${baseFreight}`;
      }
      return 'rate model';
    };

    return (
      <>
        {/* Creation fields - always visible */}
        <Typography variant="h6" sx={{ my: 2 }}>
          Create Job Details
        </Typography>
        <Card sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
              <Tooltip title="Customer Edit is not allowed.">
                <DialogSelectButton
                  variant="outlined"
                  placeholder="Select Customer"
                  selected={selectedCustomer?.customerName}
                  onClick={customerDialog.onTrue}
                  iconName={APP_ICONS.customer}
                  sx={{ mb: 2 }}
                  disabled
                />
              </Tooltip>
              <DialogSelectButton
                variant="outlined"
                placeholder="Select Driver"
                selected={selectedDriver?.driverName}
                onClick={driverDialog.onTrue}
                iconName={APP_ICONS.driver}
                sx={{ mb: 2 }}
              />
              <Field.Configurable
                entity="subtrip"
                name="diNumber"
                customerId={currentSubtrip?.customerId?._id}
              >
                <Field.Text name="diNumber" label={getLabel('diNumber', 'DI/DO No')} />
              </Field.Configurable>
              <Field.MobileDateTimePicker name="startDate" label="Job Start Date" />
              <Field.Configurable
                entity="subtrip"
                name="vehicleAssignment"
                customerId={currentSubtrip?.customerId?._id}
              >
                <Field.Select
                  name="vehicleAssignment"
                  label={getLabel('vehicleAssignment', 'Vehicle Assignment')}
                >
                  <MenuItem value="schedule">Schedule Vehicle</MenuItem>
                  <MenuItem value="adhock">Adhock Vehicle</MenuItem>
                </Field.Select>
              </Field.Configurable>
              <Field.Configurable
                entity="subtrip"
                name="remarks"
                customerId={currentSubtrip?.customerId?._id}
              >
                <Field.Text
                  name="remarks"
                  label={getLabel('remarks', 'Remarks')}
                  multiline
                  rows={3}
                  sx={{ gridColumn: '1 / -1' }}
                />
              </Field.Configurable>
            </Box>
          </Box>
        </Card>

        {/* Loaded fields - visible for loaded and received status */}
        {[SUBTRIP_STATUS.LOADED, SUBTRIP_STATUS.RECEIVED].includes(status) && (
          <>
            <Typography variant="h6" sx={{ my: 2 }}>
              Loaded Job Details
            </Typography>
            <Card sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                {/* Route and Logistics Details */}
                <Typography variant="h6" sx={{ mb: 3 }} color="primary">
                  Route Details
                </Typography>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                  <Field.Configurable
                    entity="subtrip"
                    name="consignee"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.Text name="consignee" label={getLabel('consignee', 'Consignee')} />
                  </Field.Configurable>
                  <Field.Configurable
                    entity="subtrip"
                    name="loadingPoint"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.Text
                      name="loadingPoint"
                      label={getLabel('loadingPoint', 'Loading Point')}
                    />
                  </Field.Configurable>
                  <Field.Configurable
                    entity="subtrip"
                    name="unloadingPoint"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.MultiAutocompleteFreeSolo
                      name="unloadingPoint"
                      label={getLabel('unloadingPoint', 'Unloading Point')}
                      placeholder="Add unloading points..."
                      options={Array.from(
                        new Set(
                          (selectedCustomer?.consignees || [])
                            .map(({ address }) => address)
                            .filter(Boolean)
                        )
                      ).map((addr) => ({ label: addr, value: addr }))}
                      helperText="Consignee's address"
                    />
                  </Field.Configurable>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" sx={{ mb: 3 }} color="primary">
                  Weight Details
                </Typography>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                  <Field.Configurable
                    entity="subtrip"
                    name="loadingWeight"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.Text
                      name="loadingWeight"
                      label={getLabel('loadingWeight', 'Loading Weight')}
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {freightModel === 'per_kl' ? 'KL' : freightModel === 'per_ton' ? 'Ton' : vehicleType ? loadingWeightUnit[vehicleType] : 'Units'}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Field.Configurable>

                  {vehicleType !== 'tanker' && vehicleType !== 'bulker' && (
                    <Field.Configurable
                      entity="subtrip"
                      name="quantity"
                      customerId={currentSubtrip?.customerId?._id}
                    >
                      <Field.Text
                        name="quantity"
                        label={getLabel('quantity', 'Quantity')}
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Bags</InputAdornment>,
                        }}
                      />
                    </Field.Configurable>
                  )}

                  {/* Start Km moved to Trip; removed from Subtrip edit */}

                  <Field.Select name="freightDetails.freightModel" label="Freight Model *">
                    {FREIGHT_MODEL_OPTIONS.filter(
                      (fm) =>
                        !freightConfig?.allowedModels?.length ||
                        freightConfig.allowedModels.includes(fm.value)
                    ).map((fm) => (
                      <MenuItem key={fm.value} value={fm.value}>
                        {fm.label}
                      </MenuItem>
                    ))}
                  </Field.Select>

                  {(freightModel === 'per_ton' ||
                    freightModel === 'per_kl' ||
                    freightModel === 'per_km' ||
                    freightModel === 'per_hour') && (
                    <>
                      <Field.Configurable
                        entity="subtrip"
                        name="rate"
                        customerId={currentSubtrip?.customerId?._id}
                      >
                        <Field.Text
                          name="freightDetails.rate"
                          label={
                            freightModel === 'per_km'
                              ? 'Rate (Per KM) *'
                              : freightModel === 'per_hour'
                                ? 'Rate (Per Hour) *'
                                : freightModel === 'per_kl'
                                  ? 'Rate (Per KL) *'
                                  : 'Rate (Per Ton) *'
                          }
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                          }}
                        />
                      </Field.Configurable>
                      {freightModel === 'per_km' && (
                        <Field.Text
                          name="freightDetails.startKm"
                          label="Billing Start KM"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">km</InputAdornment>,
                          }}
                        />
                      )}
                    </>
                  )}

                  {freightModel === 'hybrid' && (
                    <>
                      <Field.Text
                        name="freightDetails.freightAmount"
                        label="Base Freight Amount *"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                        }}
                      />
                      <Field.Text
                        name="freightDetails.baseKm"
                        label="Base KM *"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">km</InputAdornment>,
                        }}
                      />
                      <Field.Text
                        name="freightDetails.rate"
                        label="Extra Rate (Per KM) *"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                        }}
                      />
                      <Field.Text
                        name="freightDetails.startKm"
                        label="Billing Start KM"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">km</InputAdornment>,
                        }}
                      />
                    </>
                  )}

                  {freightModel === 'fixed' && (
                    <Field.Text
                      name="freightDetails.freightAmount"
                      label="Freight Amount *"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                      }}
                    />
                  )}

                  <Field.Configurable
                    entity="subtrip"
                    name="ewayBill"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.Text name="ewayBill" label={getLabel('ewayBill', 'Eway Bill')} />
                  </Field.Configurable>
                  <Field.Configurable
                    entity="subtrip"
                    name="ewayExpiryDate"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.DatePicker
                      name="ewayExpiryDate"
                      label={getLabel('ewayExpiryDate', 'Eway Expiry Date')}
                    />
                  </Field.Configurable>

                  <Field.Configurable
                    entity="subtrip"
                    name="invoiceNo"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.Text name="invoiceNo" label={getLabel('invoiceNo', 'Invoice No')} />
                  </Field.Configurable>
                  <Field.Configurable
                    entity="subtrip"
                    name="shipmentNo"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.Text name="shipmentNo" label={getLabel('shipmentNo', 'Shipment No')} />
                  </Field.Configurable>
                  <Field.Configurable
                    entity="subtrip"
                    name="orderNo"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.Text name="orderNo" label={getLabel('orderNo', 'Order No')} />
                  </Field.Configurable>
                  <Field.Configurable
                    entity="subtrip"
                    name="referenceSubtripNo"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.Text
                      name="referenceSubtripNo"
                      label={getLabel('referenceSubtripNo', 'Reference Job No')}
                    />
                  </Field.Configurable>

                  <Field.Configurable
                    entity="subtrip"
                    name="materialType"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.Select
                      name="materialType"
                      label={getLabel('materialType', 'Material Type')}
                    >
                      <MenuItem value="">None</MenuItem>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                      {materialOptions.map(({ label, value }) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Field.Select>
                  </Field.Configurable>

                  <Field.Configurable
                    entity="subtrip"
                    name="grade"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.Text name="grade" label={getLabel('grade', 'Grade')} />
                  </Field.Configurable>

                  {displayFreightAmount > 0 && (
                    <Alert
                      severity="info"
                      variant="outlined"
                      sx={{ gridColumn: '1 / -1', mt: 1, display: 'flex', alignItems: 'center' }}
                    >
                      <Typography variant="subtitle2" component="div">
                        Calculated Freight Amount: <strong>₹{displayFreightAmount}</strong>
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="div"
                        sx={{ mt: 0.5 }}
                      >
                        ({getFreightExplanation()})
                      </Typography>
                    </Alert>
                  )}
                </Box>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" sx={{ mb: 3 }} color="primary">
                  Trip Advance
                </Typography>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                  <Field.Text
                    name="driverAdvance"
                    label="Amount"
                    type="number"
                    placeholder="0"
                    InputProps={{ endAdornment: <InputAdornment position="end">₹</InputAdornment> }}
                  />
                  <Box>
                    <FormLabel component="legend" sx={{ mb: 0.5 }}>
                      Given By:
                    </FormLabel>
                    <Field.RadioGroup
                      row
                      name="driverAdvanceGivenBy"
                      options={Object.values(DRIVER_ADVANCE_GIVEN_BY_OPTIONS)
                        .filter(
                          (opt) => hasPumps || opt !== DRIVER_ADVANCE_GIVEN_BY_OPTIONS.FUEL_PUMP
                        )
                        .map((opt) => ({ label: opt, value: opt }))}
                    />
                  </Box>

                  {hasPumps && (
                    <Field.Text
                      name="initialAdvanceDiesel"
                      label="Diesel"
                      type="number"
                      placeholder="0"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">Ltr</InputAdornment>,
                      }}
                    />
                  )}

                  {hasPumps && (
                    <DialogSelectButton
                      variant="outlined"
                      placeholder="Select Pump"
                      selected={selectedPump?.name}
                      onClick={pumpDialog.onTrue}
                      iconName={APP_ICONS.pump}
                    />
                  )}
                </Box>
              </Box>
            </Card>
          </>
        )}

        {/* Received fields - only visible for received status */}
        {status === SUBTRIP_STATUS.RECEIVED && (
          <>
            <Typography variant="h6" sx={{ my: 2 }}>
              Received Job Details
            </Typography>
            <Card sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                  <Field.Configurable
                    entity="subtrip"
                    name="unloadingWeight"
                    customerId={currentSubtrip?.customerId?._id}
                  >
                    <Field.Text
                      name="unloadingWeight"
                      label={getLabel('unloadingWeight', 'Unloading Weight')}
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <>{loadingWeightUnit[vehicleType]}</>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Field.Configurable>
                  {/* End Km moved to Trip; removed from Subtrip edit */}
                  {!isOwn &&
                    (freightModel === 'per_ton' || freightModel === 'per_kl' ? (
                      <Field.Configurable
                        entity="subtrip"
                        name="commissionRate"
                        customerId={currentSubtrip?.customerId?._id}
                      >
                        <Field.Text
                          name="commissionDetails.commissionRate"
                          label={getLabel('commissionRate', 'Transporter Commission Rate')}
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                          }}
                        />
                      </Field.Configurable>
                    ) : (
                      <Field.Configurable
                        entity="subtrip"
                        name="commissionAmount"
                        customerId={currentSubtrip?.customerId?._id}
                      >
                        <Field.Text
                          name="commissionDetails.commissionAmount"
                          label={getLabel('commissionAmount', 'Transporter Commission Amount')}
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                          }}
                        />
                      </Field.Configurable>
                    ))}
                  <Field.MobileDateTimePicker name="endDate" label="LR Receive Date *" />
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Issue Indicators */}
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                  <Field.Switch name="hasShortage" label="Has Shortage?" />
                  <Field.Switch name="hasError" label="Has Error?" />

                  {values.hasShortage && (
                    <>
                      <Field.Configurable
                        entity="subtrip"
                        name="shortageWeight"
                        customerId={currentSubtrip?.customerId?._id}
                      >
                        <Field.Text
                          name="shortageWeight"
                          label={getLabel('shortageWeight', 'Shortage Weight')}
                          type="number"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <>{loadingWeightUnit[vehicleType]}</>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Field.Configurable>
                      <Field.Configurable
                        entity="subtrip"
                        name="shortageAmount"
                        customerId={currentSubtrip?.customerId?._id}
                      >
                        <Field.Text
                          name="shortageAmount"
                          label={getLabel('shortageAmount', 'Shortage Amount')}
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                          }}
                        />
                      </Field.Configurable>
                    </>
                  )}

                  {values.hasError && (
                    <Field.Text name="errorRemarks" label="Error Remarks" multiline rows={3} />
                  )}
                </Box>
              </Box>
            </Card>
          </>
        )}
      </>
    );
  };
  console.log({ errors: methods.formState.errors });

  return (
    <>
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3} sx={{ pt: 10 }}>
          <Grid item xs={12} md={3}>
            <Box sx={{ pt: 2, pb: 5, px: 3 }}>
              <Typography variant="h6">Edit Job</Typography>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Edit job details.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8} sx={{ my: 2 }}>
            {isFinanciallyLocked && (
              <Alert
                severity="warning"
                sx={{ mb: 2 }}
              >
                <strong>Editing is not allowed.</strong> The following financial documents have
                already been generated:
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {blockingDocuments.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </Box>
              </Alert>
            )}

            {renderFields()}

            <Box sx={{ pt: 2, pb: 5, px: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                disabled={isSubmitting || !dirtyFields || Object.keys(dirtyFields).length === 0}
                onClick={() => methods.reset()}
              >
                Reset
              </Button>
              <LoadingButton
                variant="contained"
                type="submit"
                color="primary"
                loading={isSubmitting}
                disabled={isFinanciallyLocked || Object.keys(dirtyFields).length === 0}
              >
                Save
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </Form>

      {/* Dialogs */}
      <KanbanCustomerDialog
        open={customerDialog.value}
        onClose={customerDialog.onFalse}
        selectedCustomer={selectedCustomer}
        onCustomerChange={handleCustomerChange}
      />

      {/* Route dialog removed */}

      {hasPumps && (
        <KanbanPumpDialog
          open={pumpDialog.value}
          onClose={pumpDialog.onFalse}
          selectedPump={selectedPump}
          onPumpChange={handlePumpChange}
        />
      )}

      <KanbanDriverDialog
        open={driverDialog.value}
        onClose={driverDialog.onFalse}
        selectedDriver={selectedDriver}
        onDriverChange={handleDriverChange}
        allowQuickCreate
      />
    </>
  );
}
