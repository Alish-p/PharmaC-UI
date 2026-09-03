import dayjs from 'dayjs';
import { z as zod } from 'zod';
// form
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

// @mui
import { LoadingButton } from '@mui/lab';
import {
  Card,
  Stack,
  Table,
  Button,
  Divider,
  MenuItem,
  Collapse,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  CardHeader,
  InputAdornment,
} from '@mui/material';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSystemFeatures } from 'src/hooks/use-system-features';

import { fDate } from 'src/utils/format-time';

import { useGps } from 'src/query/use-gps';
import { useTenant } from 'src/query/use-tenant';
import { VEHICLE_MODES } from 'src/constants/vehicle-mode';
import { useCreateVehicle, useUpdateVehicle, useVehicleLookup } from 'src/query/use-vehicle';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
// components
import { Form, Field } from 'src/components/hook-form';
import { APP_ICONS } from 'src/components/iconify/icons';
import { DialogSelectButton } from 'src/components/dialog-select-button';

import { KanbanTransporterDialog } from '../kanban/components/kanban-transporter-dialog';
// assets
import {
  useModelTypes,
  useEngineTypes,
  useVehicleTypes,
  vehicleTypeIcon,
  useVehicleCompanies,
} from './vehicle-config';

// ----------------------------------------------------------------------

export const NewVehicleSchema = zod
  .object({
    vehicleNo: zod
      .string()
      .min(1, { message: 'Vehicle No is required' })
      .regex(/^[A-Z]{2}[0-9]{2}[A-Z]{0,2}[0-9]{4}$/, {
        message: 'Invalid Vehicle No format. Example: KA01AB0001, KA01A0001, or KA010001',
      }),
    vehicleType: zod.string().min(1, { message: 'Vehicle Type is required' }),
    modelType: zod.string().optional(),
    vehicleCompany: zod.string().optional(),
    noOfTyres: zod
      .number()
      .min(3, { message: 'No Of Tyres must be at least 3' })
      .max(30, { message: 'No Of Tyres cannot exceed 30' }),
    chasisNo: zod.string().optional(),
    engineNo: zod.string().optional(),
    manufacturingYear: zod.number().optional(),
    loadingCapacity: zod.number().optional(),
    engineType: zod.string().optional(),
    fuelTankCapacity: zod.number().optional(),
    isOwn: zod.boolean().default(true),
    transporter: zod.string().optional(),
    trackingLink: zod.string().optional(),
    isActive: zod.boolean().optional(),
    currentOdometer: zod.number().optional().default(0),
  })
  .refine((data) => data.isOwn || data.transporter, {
    message: 'Transport Company is required when the vehicle is not owned',
    path: ['transporter'],
  });

// ----------------------------------------------------------------------

export default function VehicleForm({ currentVehicle }) {
  const router = useRouter();
  const vehicleTypes = useVehicleTypes();
  const vehicleCompany = useVehicleCompanies();
  const engineType = useEngineTypes();
  const modelTypes = useModelTypes();
  const [selectedTransporter, setSelectedTransporter] = useState(
    currentVehicle?.transporter || null
  );
  const transporterDialog = useBoolean(false);
  const { data: tenant } = useTenant();
  const integrationEnabled = !!tenant?.integrations?.vehicleApi?.enabled;
  const gpsEnabled = !!tenant?.integrations?.vehicleGPS?.enabled;
  const { vehicleMode } = useSystemFeatures();
  const managesMarketVehicles = vehicleMode !== VEHICLE_MODES.OWN_ONLY;

  const { data: gpsData, isLoading: isLoadingGps } = useGps(currentVehicle?.vehicleNo || '', {
    enabled: gpsEnabled && !!currentVehicle?.vehicleNo,
  });

  const { lookup, isLookingUp } = useVehicleLookup();
  const [suggestedDocs, setSuggestedDocs] = useState([]);
  const [appliedFields, setAppliedFields] = useState(0);

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();

  const defaultValues = useMemo(
    () => ({
      vehicleNo: currentVehicle?.vehicleNo || '',
      vehicleType: currentVehicle?.vehicleType || '',
      modelType: currentVehicle?.modelType || '',
      vehicleCompany: currentVehicle?.vehicleCompany || '',
      noOfTyres: currentVehicle?.noOfTyres || 0,
      chasisNo: currentVehicle?.chasisNo || '',
      engineNo: currentVehicle?.engineNo || '',
      manufacturingYear: currentVehicle?.manufacturingYear || new Date().getFullYear(),
      loadingCapacity: currentVehicle?.loadingCapacity || 0,
      engineType: currentVehicle?.engineType || '',
      fuelTankCapacity: currentVehicle?.fuelTankCapacity || 0,
      isOwn: currentVehicle?.isOwn ?? false,
      transporter: currentVehicle?.transporter?._id || '',
      trackingLink: currentVehicle?.trackingLink || '',
      isActive: currentVehicle?.isActive ?? true,
      currentOdometer: currentVehicle?.currentOdometer || 0,
    }),
    [currentVehicle]
  );

  const methods = useForm({
    resolver: zodResolver(NewVehicleSchema),
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

  const values = watch();

  // Auto-format vehicle number for UX: uppercase and trim spaces/hyphens
  useEffect(() => {
    const v = values.vehicleNo || '';
    const formatted = v.replace(/\s|-/g, '').toUpperCase();
    if (formatted !== v) {
      setValue('vehicleNo', formatted, { shouldValidate: true });
    }
  }, [values.vehicleNo, setValue]);

  const onSubmit = async (data) => {
    try {
      let newVehicle;
      if (!currentVehicle) {
        newVehicle = await createVehicle(data);
      } else {
        newVehicle = await updateVehicle({ id: currentVehicle._id, data });
      }
      reset();
      router.push(paths.dashboard.vehicle.details(newVehicle._id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleTransporterChange = (transporter) => {
    setSelectedTransporter(transporter);
    setValue('transporter', transporter._id);
  };

  // Clear transporter when the vehicle is marked as company owned
  useEffect(() => {
    if (values.isOwn) {
      setSelectedTransporter(null);
      setValue('transporter', '', { shouldValidate: true });
    }
  }, [values.isOwn, setValue]);

  // Section: Basic details (required-first)
  const renderBasicDetails = (
    <Card sx={{ position: 'relative' }}>
      <CardHeader title="Basic Details" sx={{ mb: 3 }} />
      {currentVehicle && (
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
        <Field.Text
          name="vehicleNo"
          label="Vehicle No"
          placeholder="e.g. KA01AB0001"
          InputProps={
            integrationEnabled
              ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={async () => {
                          if (!vehicleNoValid(values.vehicleNo)) return;
                          const resp = await lookup({ vehicleNo: values.vehicleNo });
                          if (!resp) return;
                          const { vehicle = {}, documentsSuggested = [] } = resp;
                          const applied = applyVehicleLookupToForm({ vehicle, setValue, values });
                          setAppliedFields(applied);
                          setSuggestedDocs(documentsSuggested || []);
                        }}
                        disabled={!vehicleNoValid(values.vehicleNo) || isLookingUp}
                      >
                        {isLookingUp ? 'Looking…' : 'Lookup'}
                      </Button>
                    </InputAdornment>
                  ),
                }
              : undefined
          }
          helperText={
            integrationEnabled
              ? appliedFields > 0
                ? `Prefilled ${appliedFields} field${appliedFields > 1 ? 's' : ''} from lookup`
                : 'Use Lookup to prefill details'
              : undefined
          }
        />
        <Field.Select name="vehicleType" label="Vehicle Type">
          <MenuItem value="">None</MenuItem>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {vehicleTypes.map(({ key, value }) => (
            <MenuItem key={key} value={key}>
              <Iconify icon={vehicleTypeIcon[key]} sx={{ mr: 1 }} />
              {value}
            </MenuItem>
          ))}
        </Field.Select>
        <Stack spacing={1}>
          <Field.Text
            name="currentOdometer"
            label="Current Odometer"
            type="number"
            InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }}
          />
          {gpsEnabled && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1 }}>
              {isLoadingGps ? (
                <Label variant="soft" color="default">
                  Fetching GPS Data...
                </Label>
              ) : gpsData?.totalOdometer != null ? (
                <>
                  <Label variant="soft" color="warning">
                    <Iconify icon="mdi:alert" sx={{ mr: 0.5 }} />
                    GPS Odometer: {gpsData.totalOdometer} km (May be inaccurate)
                  </Label>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() =>
                      setValue('currentOdometer', gpsData.totalOdometer, { shouldValidate: true })
                    }
                  >
                    Use GPS
                  </Button>
                </>
              ) : (
                <Label variant="soft" color="error">
                  <Iconify icon="mdi:alert-circle" sx={{ mr: 0.5 }} />
                  GPS Odometer unavailable
                </Label>
              )}
            </Stack>
          )}
        </Stack>
        <Field.Text name="noOfTyres" label="No Of Tyres" type="number" />
        {managesMarketVehicles && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Field.Switch
              name="isOwn"
              labelPlacement="start"
              label="Market Vehicle ?"
              slotProps={{
                switch: {
                  checked: !values.isOwn,
                  onChange: (_e, checked) => setValue('isOwn', !checked, { shouldValidate: true }),
                },
              }}
            />

            {!values.isOwn && (
              <DialogSelectButton
                onClick={transporterDialog.onTrue}
                placeholder="Select Transport Company"
                selected={selectedTransporter?.transportName}
                error={!!errors.transporter?.message}
                iconName={APP_ICONS.vehicle}
              />
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );

  // Section: Additional details (optional) with collapse to reduce clutter
  const optionalOpen = useBoolean(false);
  const renderAdditional = (
    <Card>
      <CardHeader title="Additional Details" sx={{ mb: 3 }} />
      <Divider />
      <Collapse in={optionalOpen.value} timeout="auto">
        <Stack spacing={3} sx={{ p: 3 }}>
          <Field.Select name="modelType" label="Model Type (Optional)">
            <MenuItem value="">None</MenuItem>
            <Divider sx={{ borderStyle: 'dashed' }} />
            {modelTypes.map(({ key, value }) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Field.Select>
          <Field.Select name="vehicleCompany" label="Vehicle Company (Optional)">
            <MenuItem value="">None</MenuItem>
            <Divider sx={{ borderStyle: 'dashed' }} />
            {vehicleCompany.map(({ key, value }) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Field.Select>
          <Field.Text
            name="chasisNo"
            label="Chasis No (Optional)"
            placeholder="e.g. MAT12345678901234"
          />
          <Field.Text
            name="engineNo"
            label="Engine No (Optional)"
            placeholder="e.g. 4D56UJE12345"
          />
          <Field.Text
            name="manufacturingYear"
            label="Manufacturing Year (Optional)"
            type="number"
            placeholder="e.g. 2021"
          />
          <Field.Select name="engineType" label="Engine Type (Optional)">
            <MenuItem value="">None</MenuItem>
            <Divider sx={{ borderStyle: 'dashed' }} />
            {engineType.map(({ key, value }) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Field.Select>
          <Field.Text
            name="loadingCapacity"
            label="Loading Capacity (Optional)"
            type="number"
            placeholder="30 Ton"
            InputProps={{ endAdornment: <InputAdornment position="end">Ton</InputAdornment> }}
          />
          <Field.Text
            name="fuelTankCapacity"
            label="Fuel Tank Capacity (Optional)"
            type="number"
            placeholder="e.g. 200 Ltr"
            InputProps={{ endAdornment: <InputAdornment position="end">Ltr</InputAdornment> }}
          />
          <Field.Text
            name="trackingLink"
            label="Tracking Link (Optional)"
            placeholder="Paste GPS tracking URL"
          />
        </Stack>
      </Collapse>
    </Card>
  );

  const renderSuggestedDocs = suggestedDocs?.length ? (
    <Card>
      <CardHeader title="Suggested Documents" sx={{ mb: 3 }} />
      <Divider />
      <Stack sx={{ p: 3 }}>
        <Table size="small" aria-label="suggested-documents">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Number</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Issuer</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 160 }}>Issue Date</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 160 }}>Expiry Date</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 120 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suggestedDocs.map((d, idx) => {
              const issue = d.issueDate ? fDate(d.issueDate) : '-';
              const expiry = d.expiryDate ? fDate(d.expiryDate) : '-';
              const isExpired = d.expiryDate ? dayjs(d.expiryDate).isBefore(dayjs(), 'day') : false;
              return (
                <TableRow key={`${d.docType}-${idx}`}>
                  <TableCell>{d.docType}</TableCell>
                  <TableCell>{d.docNumber || '-'}</TableCell>
                  <TableCell>{d.issuer || '-'}</TableCell>
                  <TableCell>{issue}</TableCell>
                  <TableCell>{expiry}</TableCell>
                  <TableCell>
                    <Label variant="soft" color={isExpired ? 'error' : 'success'}>
                      {isExpired ? 'Expired' : 'Valid'}
                    </Label>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Stack>
    </Card>
  ) : null;

  const renderActions = (
    <Stack alignItems="flex-end">
      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
        {!currentVehicle ? 'Create Vehicle' : 'Save Changes'}
      </LoadingButton>
    </Stack>
  );

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={{ xs: 2 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderBasicDetails}

        <Button
          size="small"
          variant="text"
          color="primary"
          onClick={optionalOpen.onToggle}
          sx={{ alignSelf: 'flex-start' }}
          startIcon={<Iconify icon={optionalOpen.value ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
          aria-expanded={optionalOpen.value}
        >
          {optionalOpen.value ? 'Hide Additional Fields' : 'Show Additional Fields'}
        </Button>

        {optionalOpen.value && renderAdditional}
        {integrationEnabled && renderSuggestedDocs}
        {renderActions}
      </Stack>

      <KanbanTransporterDialog
        open={transporterDialog.value}
        onClose={transporterDialog.onFalse}
        selectedTransporter={selectedTransporter}
        onTransporterChange={handleTransporterChange}
      />
    </Form>
  );
}

// Helpers
function vehicleNoValid(v) {
  if (!v) return false;
  const re = /^[A-Z]{2}[0-9]{2}[A-Z]{0,2}[0-9]{4}$/;
  return re.test(v);
}

function applyVehicleLookupToForm({ vehicle, setValue, values }) {
  if (!vehicle) return 0;
  let applied = 0;
  const assignIfEmpty = (name, value) => {
    const current = values[name];
    const isEmpty = current === '' || current === 0 || current === undefined || current === null;
    if (isEmpty && value !== undefined && value !== null && value !== '') {
      setValue(name, value, { shouldValidate: true });
      applied += 1;
    }
  };

  const mapCompany = (label) => {
    if (!label) return undefined;
    const map = {
      'bharat benz': 'bharatBenz',
      'ashok leyland': 'ashokLeyland',
      tata: 'tata',
      ace: 'ace',
    };
    const key = map[String(label).toLowerCase()];
    return key || undefined;
  };

  assignIfEmpty('modelType', vehicle.modelType);
  assignIfEmpty('vehicleCompany', mapCompany(vehicle.vehicleCompany) ?? vehicle.vehicleCompany);
  assignIfEmpty('noOfTyres', Number(vehicle.noOfTyres));
  assignIfEmpty('chasisNo', vehicle.chasisNo);
  assignIfEmpty('engineNo', vehicle.engineNo);
  assignIfEmpty('manufacturingYear', Number(vehicle.manufacturingYear));
  assignIfEmpty('loadingCapacity', Number(vehicle.loadingCapacity));
  assignIfEmpty('engineType', vehicle.engineType);

  return applied;
}
