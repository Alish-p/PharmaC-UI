import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Alert, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { useUpdateTrip } from 'src/query/use-trip';

import { toast } from 'src/components/snackbar';
import { APP_ICONS } from 'src/components/iconify/icons';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { DialogSelectButton } from 'src/components/dialog-select-button';

import { KanbanVehicleDialog } from '../kanban/components/kanban-vehicle-dialog';
import { KanbanCustomerDialog } from '../kanban/components/kanban-customer-dialog';

// --------------------------------------------------------------------------------------
// 1) Extend the Zod schema to include the new boolean flag “closePreviousTrips”
//    – Default to true.
//    – We don’t need a refine here, since it’s just a toggle.
// --------------------------------------------------------------------------------------
const NewTripSchema = zod
  .object({
    vehicleId: zod
      .any()
      .nullable()
      .refine((val) => val !== null, { message: 'Vehicle is required' }),
    fromDate: schemaHelper.date({ message: { required_error: 'From date is required!' } }),
    toDate: zod.any().nullable().optional(),
    startKm: zod.union([zod.number(), zod.string()]).nullable().optional(),
    endKm: zod.union([zod.number(), zod.string()]).nullable().optional(),
    remarks: zod.string().optional(),
    closePreviousTrips: zod.boolean().default(true),
    addFirstSubtrip: zod.boolean().optional().default(false),
    customerId: zod.any().nullable(),
    diNumber: zod.string().optional(),
    subtripRemarks: zod.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.addFirstSubtrip) {
      if (!data.customerId) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: 'Customer is required',
          path: ['customerId'],
        });
      }
      if (!data.diNumber) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: 'DI/DO No is required',
          path: ['diNumber'],
        });
      }
    }

    if (data.toDate && data.fromDate) {
      if (dayjs(data.toDate).isBefore(dayjs(data.fromDate))) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: 'To Date must be equal to or after From Date',
          path: ['toDate'],
        });
      }
    }

    const sKm =
      data.startKm !== '' && data.startKm !== null && data.startKm !== undefined
        ? Number(data.startKm)
        : null;
    const eKm =
      data.endKm !== '' && data.endKm !== null && data.endKm !== undefined
        ? Number(data.endKm)
        : null;

    if (sKm !== null && eKm !== null && eKm < sKm) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'End KM must be greater than or equal to Start KM',
        path: ['endKm'],
      });
    }
  });

export default function TripForm({ currentTrip }) {
  const navigate = useNavigate();

  const updateTrip = useUpdateTrip();

  const vehicleDialog = useBoolean(false);

  // ------------------------------------------------------------------------------------
  // 2) Build defaultValues including `closePreviousTrips: true`
  //    – If editing (`currentTrip` exists), we’ll pick up any existing value (or default to true).
  // ------------------------------------------------------------------------------------
  const defaultValues = useMemo(
    () => ({
      vehicleId: currentTrip?.vehicleId || null,
      fromDate: currentTrip?.fromDate ? new Date(currentTrip.fromDate) : new Date(),
      toDate: currentTrip?.toDate ? new Date(currentTrip.toDate) : null,
      startKm: currentTrip?.startKm ?? '',
      endKm: currentTrip?.endKm ?? '',
      remarks: currentTrip?.remarks || '',
      closePreviousTrips: true,
      addFirstSubtrip: false,
      customerId: null,
      diNumber: '',
      subtripRemarks: '',
    }),
    [currentTrip]
  );

  // Keep local copies of “selected” driver/vehicle so we can disable/enable the toggle
  const [selectedVehicle, setSelectedVehicle] = useState(currentTrip?.vehicleId || null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const customerDialog = useBoolean(false);

  const methods = useForm({
    resolver: zodResolver(NewTripSchema),
    defaultValues,
    mode: 'all',
  });

  const {
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
    clearErrors,
  } = methods;

  const watchStartKm = watch('startKm');
  const watchEndKm = watch('endKm');

  const totalKm = useMemo(() => {
    const sKm =
      watchStartKm !== '' && watchStartKm !== null && watchStartKm !== undefined
        ? Number(watchStartKm)
        : null;
    const eKm =
      watchEndKm !== '' && watchEndKm !== null && watchEndKm !== undefined
        ? Number(watchEndKm)
        : null;

    if (sKm !== null && eKm !== null && !Number.isNaN(sKm) && !Number.isNaN(eKm) && eKm >= sKm) {
      return eKm - sKm;
    }
    return null;
  }, [watchStartKm, watchEndKm]);

  // Whenever defaultValues change (e.g. when switching from “create” to “edit”),
  // reset the form to those defaultValues
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // ------------------------------------------------------------------------------------
  // 3) When the vehicle changes, we must:
  //      • Save it into React-Hook-Form via setValue('vehicleId', vehicle._id)
  //      • Update our local `selectedVehicle` (so we can know .isOwn)
  //      • Clear any validation errors that might have been on vehicleId
  //      • AND: If this is a market vehicle (isOwn === false),
  //            force “closePreviousTrips” ⇒ true (and leave it disabled).
  // ------------------------------------------------------------------------------------
  const handleVehicleChange = (vehicle) => {
    setSelectedVehicle(vehicle);
    setValue('vehicleId', vehicle._id);
    clearErrors('vehicleId');

    // If it’s a market/transporter vehicle (isOwn === false),
    // force closePreviousTrips = true
    if (vehicle.isOwn === false) {
      setValue('closePreviousTrips', true);
    }
  };

  const handleCustomerChange = (customer) => {
    setSelectedCustomer(customer);
    setValue('customerId', { label: customer.customerName, value: customer._id });
    clearErrors('customerId');
  };

  // ------------------------------------------------------------------------------------
  // 4) onSubmit
  // ------------------------------------------------------------------------------------
  const onSubmit = async (data) => {
    try {
      if (!currentTrip) {
        toast.error('Trip creation is not supported from this form. Use the Job Create flow.');
        return;
      }

      const updateData = {
        ...data,
      };
      if (updateData.startKm === '') updateData.startKm = null;
      if (updateData.endKm === '') updateData.endKm = null;
      if (updateData.startKm !== null) updateData.startKm = Number(updateData.startKm);
      if (updateData.endKm !== null) updateData.endKm = Number(updateData.endKm);

      await updateTrip({
        id: currentTrip._id,
        data: updateData,
      });
      navigate(paths.dashboard.trip.details(currentTrip._id));
      reset();
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again.', { variant: 'error' });
    }
  };

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3} sx={{ pt: 10 }}>
        <Grid item xs={12} md={3}>
          <Box sx={{ pt: 2, pb: 5, px: 3 }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              Vehicle & Driver
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
              Please Select the Vehicle and the Driver for the trip.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
              {/* Vehicle Selection */}
              <Box>
                <DialogSelectButton
                  onClick={vehicleDialog.onTrue}
                  placeholder="Select Vehicle"
                  selected={selectedVehicle?.vehicleNo}
                  error={!!errors.vehicleId?.message}
                  iconName={APP_ICONS.vehicle}
                  disabled={!!currentTrip} // disable if in edit mode
                />
              </Box>

              <Field.DatePicker
                name="fromDate"
                label="From Date"
                maxDate={dayjs()}
                disabled={!!currentTrip}
              />
              {!!currentTrip && (
                <Field.DatePicker
                  name="toDate"
                  label="To Date"
                  maxDate={dayjs()}
                  disabled={!!currentTrip}
                />
              )}
              {!!currentTrip && <Field.Text name="startKm" label="Start KM" type="number" />}
              {!!currentTrip && <Field.Text name="endKm" label="End KM" type="number" />}

              {!!currentTrip && totalKm !== null && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Alert severity="info" sx={{ py: 1 }}>
                    Total Distance: <strong>{totalKm} km</strong>
                  </Alert>
                </Box>
              )}
              <Field.Text name="remarks" label="Remarks (Optional)" />
            </Box>

            {/* Close Previous Trips */}
            {!currentTrip && selectedVehicle && selectedVehicle.isOwn && (
              <Box sx={{ mt: 3 }}>
                <Field.Checkbox name="closePreviousTrips" label="Close Previous Trip ?" />
              </Box>
            )}

            {/* Add First Subtrip Toggle */}
            {!currentTrip && (
              <Box sx={{ mt: 3 }}>
                <Field.Checkbox name="addFirstSubtrip" label="Add First Job?" />
              </Box>
            )}

            {watch('addFirstSubtrip') && (
              <Box sx={{ mt: 3 }} display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                <Box>
                  <DialogSelectButton
                    onClick={customerDialog.onTrue}
                    placeholder="Select Customer *"
                    selected={selectedCustomer?.customerName}
                    error={!!errors.customerId?.message}
                    iconName={APP_ICONS.customer}
                  />
                </Box>
                <Field.Text name="diNumber" label="DI/DO No" required />
                <Field.Text
                  name="subtripRemarks"
                  label="Job Remarks (Optional)"
                  fullWidth
                  sx={{ gridColumn: '1 / -1' }}
                />
              </Box>
            )}
          </Card>

          {selectedVehicle && <VehicleInfoDetails vehicle={selectedVehicle} />}
        </Grid>
      </Grid>

      <Stack alignItems="flex-end" sx={{ mt: 3, mb: 5 }}>
        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {!currentTrip ? 'Create Trip' : 'Save Changes'}
        </LoadingButton>
      </Stack>

      {/* Dialogs */}
      <KanbanVehicleDialog
        open={vehicleDialog.value}
        onClose={vehicleDialog.onFalse}
        selectedVehicle={selectedVehicle}
        onVehicleChange={handleVehicleChange}
        onlyActive
      />

      <KanbanCustomerDialog
        open={customerDialog.value}
        onClose={customerDialog.onFalse}
        selectedCustomer={selectedCustomer}
        onCustomerChange={handleCustomerChange}
      />
    </Form>
  );
}

const VehicleInfoDetails = ({ vehicle }) => (
  <Box sx={{ mt: 3 }}>
    {/* Vehicle Information Alert */}
    <Alert severity="success" variant="outlined">
      <strong>Vehicle Information: </strong>
      This is a <strong>{vehicle?.vehicleType}</strong> vehicle with{' '}
      <strong>{vehicle?.noOfTyres}</strong> tyres.
    </Alert>

    {/* Ownership Details Alert */}
    <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
      <strong>Ownership Details: </strong>
      {vehicle?.isOwn ? (
        <span>
          This is a <strong>company-owned vehicle.</strong>
        </span>
      ) : (
        <span>
          This is a <strong>market / transporter’s vehicle</strong> managed by{' '}
          {vehicle?.transporter?.transportName ? (
            <strong>{vehicle.transporter.transportName}</strong>
          ) : (
            <em>an unknown transporter.</em>
          )}
        </span>
      )}
    </Alert>
  </Box>
);
