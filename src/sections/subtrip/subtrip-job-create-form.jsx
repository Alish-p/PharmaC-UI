import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import MuiStepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { useFieldHelpers } from 'src/hooks/use-form-config';
import { useSystemFeatures } from 'src/hooks/use-system-features';
import { useMaterialOptions } from 'src/hooks/use-material-options';

import { fNumber, fCurrency } from 'src/utils/format-number';

import { useGps } from 'src/query/use-gps';
import { useSearchCustomer } from 'src/query/use-customer';
import { useTrip, useVehicleActiveTrip } from 'src/query/use-trip';
import { useCreateJob, usePaginatedSubtrips } from 'src/query/use-subtrip';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { DRIVER_ADVANCE_GIVEN_BY_OPTIONS } from 'src/sections/subtrip/constants';

import { useTenantContext } from 'src/auth/tenant';

import { SubtripJobCreateDialogs } from './subtrip-job-create-dialogs';
import { jobCreateSchema, createJobDefaultValues } from './subtrip-schemas';
import { getRouteStepError, SubtripJobCreateRouteStep } from './subtrip-job-create-route-step';
import { getJobStepError, SubtripJobCreateDetailsStep } from './subtrip-job-create-details-step';
import {
  getVehicleStepError,
  SubtripJobCreateVehicleStep,
} from './subtrip-job-create-vehicle-step';
import {
  getFreightStepError,
  SubtripJobCreateFreightStep,
} from './subtrip-job-create-freight-step';
import {
  getAdvanceStepError,
  SubtripJobCreateAdvanceStep,
} from './subtrip-job-create-advance-step';
import {
  getMaterialStepError,
  SubtripJobCreateMaterialStep,
} from './subtrip-job-create-material-step';

// ----------------------------------------------------------------------

const toNumber = (val) => {
  if (val === null || val === undefined || val === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
};

// Stepper Steps
const STEPS = [
  { label: 'Vehicle Details' },
  { label: 'Job Details' },
  { label: 'Route Details' },
  { label: 'Freight Details' }, // Only for loaded jobs
  { label: 'Material Details' }, // Only for loaded jobs
  { label: 'Driver Advance' }, // Only for loaded jobs
];

export function SubtripJobCreateForm() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tenant = useTenantContext();

  const isEwayIntegrationEnabled = Boolean(tenant?.integrations?.ewayBill?.enabled);
  const { pumps: managesPumps } = useSystemFeatures();

  // Step state
  const [activeStep, setActiveStep] = useState(0);

  // Selections state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPump, setSelectedPump] = useState(null);

  const { getLabel, fields, freightConfig } = useFieldHelpers('subtrip', selectedCustomer?._id);
  const [searchCustomerParams, setSearchCustomerParams] = useState(null);

  // Dialogs
  const vehicleDialog = useBoolean(false);
  const driverDialog = useBoolean(false);
  const customerDialog = useBoolean(false);
  const pumpDialog = useBoolean(false);
  const materialOptions = useMaterialOptions();

  // Queries & mutations
  const { data: activeTrip, isFetching: fetchingActiveTrip } = useVehicleActiveTrip(
    selectedVehicle?._id,
    { enabled: !!selectedVehicle?._id && !!selectedVehicle?.isOwn }
  );

  // If coming from trip details, we have a specific trip ID to attach to
  const fromTripId = searchParams.get('id');
  const { data: forcedTripDetails, isFetching: fetchingForcedTrip } = useTrip(fromTripId, {
    enabled: !!fromTripId,
  });

  const { data: activeTripDetails } = useTrip(activeTrip?._id);
  const createJob = useCreateJob();

  // Helpers for display to handle both active and forced trips
  const targetTrip = fromTripId ? forcedTripDetails : activeTrip;
  const targetTripDetails = fromTripId ? forcedTripDetails : activeTripDetails;
  const isFetchingTargetTrip = fromTripId ? fetchingForcedTrip : fetchingActiveTrip;

  // Form state for job details + step selections
  const defaultFormValues = useMemo(createJobDefaultValues, []);

  const methods = useForm({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  });

  const {
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
    clearErrors,
    getValues,
  } = methods;
  const watchedForm = watch();

  const freightAmountBanner = useMemo(() => {
    const { freightModel, rate, loadingWeight, freightAmount, baseKm } = watchedForm;
    const model = freightModel || 'per_ton';
    const rateVal = Number(rate || 0);
    const weightVal = Number(loadingWeight || 0);
    const amountVal = Number(freightAmount || 0);
    const baseKmVal = Number(baseKm || 0);

    const isPendingModel = ['per_hour', 'per_km', 'hybrid'].includes(model);

    if (isPendingModel) {
      let formula = '';
      if (model === 'per_hour') {
        formula = `calculated at ${fCurrency(rateVal)}/hour once job duration is known during receive stage`;
      } else if (model === 'per_km') {
        formula = `calculated at ${fCurrency(rateVal)}/KM once total distance is known during receive stage`;
      } else if (model === 'hybrid') {
        formula = `calculated using base freight of ${fCurrency(amountVal)} (${baseKmVal} km) + extra distance at ${fCurrency(rateVal)}/km once received`;
      }
      return {
        amount: 'TBD (Calculated on Receive)',
        detail: formula,
      };
    }

    // Known beforehand
    let calculatedAmount = 0;
    let detail = '';
    if (model === 'per_ton' || model === 'per_kl') {
      calculatedAmount = rateVal * weightVal;
      detail =
        model === 'per_kl'
          ? `calculated for loading volume of ${fNumber(weightVal)} KL at ${fCurrency(rateVal)}/KL`
          : `calculated for loading weight of ${fNumber(weightVal)} MT at ${fCurrency(rateVal)}/ton`;
    } else if (model === 'fixed') {
      calculatedAmount = amountVal;
      detail = `fixed freight amount of ${fCurrency(amountVal)}`;
    }

    return {
      amount:
        typeof calculatedAmount === 'number' && !Number.isNaN(calculatedAmount)
          ? fCurrency(calculatedAmount)
          : fCurrency(0),
      detail,
    };
  }, [watchedForm]);

  const {
    tripDecision,
    loadType,
    driverAdvanceGivenBy,
    initialAdvanceDiesel,
    initialAdvanceDieselUnit,
    pumpCd,
  } = watchedForm;

  // Set default freight model from config
  useEffect(() => {
    if (freightConfig?.defaultModel && !getValues('freightModel')) {
      setValue('freightModel', freightConfig.defaultModel);
    }
  }, [freightConfig, setValue, getValues]);

  // Pre-populate eWay Bill from URL query or navigation state
  useEffect(() => {
    const fromQuery = searchParams.get('ewayBill');
    const fromState =
      location?.state && typeof location.state === 'object' ? location.state.ewayBill : undefined;
    const incoming = (fromQuery || fromState || '').toString().trim();
    if (incoming && !getValues('ewayBill')) {
      setValue('ewayBill', incoming, { shouldDirty: true, shouldValidate: true });
    }
  }, [searchParams, location?.state, setValue, getValues]);

  const dieselAdvanceValue = toNumber(initialAdvanceDiesel);
  const requiresPumpSelection =
    driverAdvanceGivenBy === DRIVER_ADVANCE_GIVEN_BY_OPTIONS.FUEL_PUMP ||
    (dieselAdvanceValue !== undefined && dieselAdvanceValue > 0);

  // Customer lookup using dedicated search API (GSTIN prioritized)
  const { data: customerLookupData } = useSearchCustomer(searchCustomerParams, {
    enabled: Boolean(
      searchCustomerParams && (searchCustomerParams.gstinNumber || searchCustomerParams.name)
    ),
  });

  useEffect(() => {
    if (!searchCustomerParams) return;
    let candidate = null;
    const arr = customerLookupData?.customers || customerLookupData?.results;
    if (Array.isArray(arr) && arr.length > 0) {
      candidate = arr[0];
    } else if (customerLookupData?.customer) {
      candidate = customerLookupData.customer;
    } else if (
      customerLookupData &&
      typeof customerLookupData === 'object' &&
      customerLookupData._id
    ) {
      candidate = customerLookupData;
    }

    if (candidate) {
      setSelectedCustomer(candidate);
      setSearchCustomerParams(null);
    }
  }, [customerLookupData, searchCustomerParams, setSelectedCustomer]);

  // Pre-fill if forced Trip ID is present
  useEffect(() => {
    if (!forcedTripDetails) return;

    if (forcedTripDetails.vehicleId && forcedTripDetails.vehicleId._id !== selectedVehicle?._id) {
      setSelectedVehicle(forcedTripDetails.vehicleId);
    }
    if (forcedTripDetails.driverId) {
      setSelectedDriver(forcedTripDetails.driverId);
    }
    setValue('tripDecision', 'attach');
    setValue('tripId', forcedTripDetails._id);
  }, [forcedTripDetails, selectedVehicle, setValue]);

  const forcedTripIsClosed = forcedTripDetails?.tripStatus === 'closed';

  const handleVehicleChange = useCallback(
    (vehicle) => {
      setSelectedVehicle(vehicle);
      setValue('tripDecision', 'attach');
      setValue('loadType', 'loaded');
      setValue('startKm', '');
      setValue('consignee', null);
      setSelectedCustomer(null);
      setSelectedDriver(null);
      setValue('loadingWeight', '');
      setValue('freightModel', freightConfig?.defaultModel || 'per_ton');
      setValue('freightAmount', '');
      setValue('baseKm', '');
      setValue('rate', '');
      setValue('invoiceNo', '');
      setValue('ewayBill', '');
      setValue('ewayExpiryDate', null);
      setValue('materialType', '');
      setValue('quantity', '');
      setValue('grade', '');
      setValue('shipmentNo', '');
      setValue('orderNo', '');
      setValue('referenceSubtripNo', '');
      setValue('driverAdvance', '');
      setValue('driverAdvanceGivenBy', DRIVER_ADVANCE_GIVEN_BY_OPTIONS.SELF);
      setValue('initialAdvanceDiesel', '');
      setValue('initialAdvanceDieselUnit', 'litre');
      setValue('pumpCd', '');
      setSelectedPump(null);
    },
    [
      setSelectedVehicle,
      setSelectedCustomer,
      setSelectedDriver,
      setSelectedPump,
      setValue,
      freightConfig?.defaultModel,
    ]
  );

  const handleDriverChange = useCallback(
    (driver) => setSelectedDriver(driver),
    [setSelectedDriver]
  );

  const handleCustomerChange = useCallback(
    (customer) => setSelectedCustomer(customer),
    [setSelectedCustomer]
  );

  const handlePumpChange = useCallback(
    (pump) => {
      setSelectedPump(pump);
      setValue('pumpCd', pump?._id || '', { shouldValidate: true });
    },
    [setSelectedPump, setValue]
  );

  // Recent drivers query
  const { data: recentSubtripsData } = usePaginatedSubtrips(
    selectedVehicle?._id
      ? {
          page: 1,
          rowsPerPage: 10,
          vehicleId: selectedVehicle._id,
        }
      : null,
    { enabled: !!selectedVehicle?._id }
  );

  const recentDrivers = useMemo(
    () =>
      (recentSubtripsData?.results || [])
        .filter((st) => st?.driverId?._id)
        .reduce((acc, st) => {
          const d = st.driverId;
          if (!acc.find((x) => x._id === d._id)) acc.push(d);
          return acc;
        }, [])
        .slice(0, 5),
    [recentSubtripsData]
  );

  const consignees = useMemo(() => selectedCustomer?.consignees || [], [selectedCustomer]);

  // GPS query for startKm
  const vehicleNo = selectedVehicle?.vehicleNo;
  const { data: gpsData } = useGps(vehicleNo, { enabled: !!selectedVehicle?.isOwn && !!vehicleNo });
  useEffect(() => {
    if (!selectedVehicle?.isOwn) return;
    if (activeTrip && tripDecision !== 'new') return;
    if (!gpsData?.totalOdometer) return;

    const current = toNumber(getValues('startKm'));
    if (current === undefined) {
      setValue('startKm', Math.round(gpsData.totalOdometer), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [gpsData, selectedVehicle, activeTrip, tripDecision, setValue, getValues]);

  // Step Error Checkers
  const validatorContext = useMemo(
    () => ({
      selectedVehicle,
      fetchingActiveTrip,
      activeTrip,
      selectedDriver,
      selectedCustomer,
      fields,
      isEwayIntegrationEnabled,
    }),
    [
      selectedVehicle,
      fetchingActiveTrip,
      activeTrip,
      selectedDriver,
      selectedCustomer,
      fields,
      isEwayIntegrationEnabled,
    ]
  );

  // Build API payload consistently
  const buildPayload = (form) => {
    const isOwn = !!selectedVehicle?.isOwn;
    const hasActive = !!activeTrip;
    const isEmpty = isOwn ? form.loadType === 'empty' : false;
    const creatingNewTrip = isOwn && (!hasActive || (hasActive && form.tripDecision === 'new'));

    const base = {
      vehicleId: selectedVehicle._id,
      driverId: selectedDriver._id,
      isEmpty,
      tripDecision: isOwn ? (hasActive ? form.tripDecision : 'new') : undefined,
      tripId: isOwn && hasActive && form.tripDecision === 'attach' ? activeTrip._id : undefined,
      fromDate: form.startDate,
      startDate: form.startDate,
      remarks: form.remarks || undefined,
      diNumber: form.diNumber || undefined,
      vehicleAssignment: form.vehicleAssignment || undefined,
    };

    const tripKm = creatingNewTrip ? toNumber(form.startKm) : undefined;

    const emptyRoute = isEmpty
      ? {
          loadingPoint: (form.loadingPoint || '').trim() || undefined,
          unloadingPoint: Array.isArray(form.unloadingPoint)
            ? form.unloadingPoint
                .map((item) => item.value || item.label)
                .filter(Boolean)
                .join(' | ') || undefined
            : (form.unloadingPoint || '').trim() || undefined,
        }
      : {};

    const loadedFields = !isEmpty
      ? {
          customerId: selectedCustomer?._id,
          consignee: form.consignee?.value || form.consignee?.label,
          loadingPoint: form.loadingPoint,
          unloadingPoint: Array.isArray(form.unloadingPoint)
            ? form.unloadingPoint
                .map((item) => item.value || item.label)
                .filter(Boolean)
                .join(' | ') || undefined
            : form.unloadingPoint,
          loadingWeight: toNumber(form.loadingWeight),
          freightDetails: {
            freightModel: form.freightModel,
            freightAmount: toNumber(form.freightAmount),
            baseKm: toNumber(form.baseKm),
            rate: toNumber(form.rate),
            startKm: toNumber(form.freightStartKm),
          },
          invoiceNo: form.invoiceNo,
          shipmentNo: form.shipmentNo || undefined,
          orderNo: form.orderNo || undefined,
          referenceSubtripNo: form.referenceSubtripNo || undefined,
          ewayBill: form.ewayBill || undefined,
          ewayExpiryDate: form.ewayExpiryDate,
          materialType: form.materialType,
          quantity: toNumber(form.quantity),
          grade: form.grade || undefined,
          driverAdvance: toNumber(form.driverAdvance),
          driverAdvanceGivenBy: form.driverAdvanceGivenBy,
          initialAdvanceDiesel: toNumber(form.initialAdvanceDiesel),
          initialAdvanceDieselUnit: form.initialAdvanceDieselUnit,
          pumpCd: form.pumpCd || undefined,
        }
      : {};

    return {
      ...base,
      tripId:
        fromTripId && form.tripDecision === 'attach'
          ? fromTripId
          : isOwn && hasActive && form.tripDecision === 'attach'
            ? activeTrip._id
            : undefined,
      ...(tripKm !== undefined ? { startKm: tripKm } : {}),
      ...emptyRoute,
      ...loadedFields,
    };
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const err = getAdvanceStepError(data, validatorContext);
      if (err) {
        toast.error(err);
        return;
      }

      const payload = buildPayload(data);
      const createdSubtrip = await createJob(payload);

      toast.success('Job created successfully');
      window.location.assign(paths.dashboard.subtrip.details(createdSubtrip._id));
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to create job');
    }
  });

  // Step gating & submit availability
  const canGoStep2 = !getVehicleStepError(watchedForm, validatorContext);
  const isLoadedJob = useMemo(
    () => (selectedVehicle ? loadType === 'loaded' || !selectedVehicle?.isOwn : false),
    [selectedVehicle, loadType]
  );

  const canGoRouteStep = !getJobStepError(watchedForm, validatorContext);
  const canGoFreightStep = isLoadedJob ? !getRouteStepError(watchedForm, validatorContext) : false;
  const canGoMaterialStep = isLoadedJob
    ? !getFreightStepError(watchedForm, validatorContext)
    : false;
  const canGoAdvanceStep = isLoadedJob
    ? !getMaterialStepError(watchedForm, validatorContext)
    : false;

  const canSubmit = isLoadedJob
    ? activeStep === 5
      ? !getAdvanceStepError(watchedForm, validatorContext)
      : false
    : activeStep === 2
      ? !getRouteStepError(watchedForm, validatorContext)
      : false;

  // Clear customer on load type change
  useEffect(() => {
    if (!selectedVehicle?.isOwn) return;
    if (loadType === 'empty') {
      setSelectedCustomer(null);
      setValue('consignee', null);
    }
  }, [loadType, selectedVehicle, setSelectedCustomer, setValue]);

  // Prepopulate driver from active trip when attaching
  useEffect(() => {
    if (fromTripId) return;
    if (!selectedVehicle?.isOwn) return;
    if (tripDecision !== 'attach') return;
    if (activeTrip?.driverId) {
      setSelectedDriver(activeTrip.driverId);
    }
  }, [tripDecision, activeTrip, selectedVehicle, setSelectedDriver, fromTripId]);

  useEffect(() => {
    if (!isLoadedJob) {
      clearErrors('pumpCd');
      return;
    }

    if (requiresPumpSelection) {
      trigger('pumpCd');
    } else {
      clearErrors('pumpCd');
    }
  }, [isLoadedJob, requiresPumpSelection, trigger, clearErrors]);

  useEffect(() => {
    if (!pumpCd) {
      setSelectedPump(null);
    }
  }, [pumpCd, setSelectedPump]);

  return (
    <Card sx={{ p: 5, width: 1, mx: 'auto', maxWidth: 720 }}>
      <Form methods={methods} onSubmit={onSubmit}>
        <MuiStepper activeStep={activeStep} orientation="vertical">
          {/* Step 1 */}
          <Step>
            <StepLabel>{STEPS[0].label}</StepLabel>
            <SubtripJobCreateVehicleStep
              onVehicleChange={handleVehicleChange}
              onCustomerSearch={setSearchCustomerParams}
              forcedTripIsClosed={forcedTripIsClosed}
              onSelectVehicleClick={vehicleDialog.onTrue}
              selectedVehicle={selectedVehicle}
              isFetchingTargetTrip={isFetchingTargetTrip}
              targetTrip={targetTrip}
              targetTripDetails={targetTripDetails}
              activeTrip={activeTrip}
              fromTripId={fromTripId}
              tripDecision={tripDecision}
              selectedCustomer={selectedCustomer}
              getLabel={getLabel}
              canGoNextStep={canGoStep2}
              onNextStep={() => setActiveStep(1)}
            />
          </Step>

          {/* Step 2 */}
          <Step>
            <StepLabel>{STEPS[1].label}</StepLabel>
            <SubtripJobCreateDetailsStep
              onSelectDriverClick={driverDialog.onTrue}
              selectedDriver={selectedDriver}
              selectedVehicle={selectedVehicle}
              recentDrivers={recentDrivers}
              handleDriverChange={handleDriverChange}
              isLoadedJob={isLoadedJob}
              onSelectCustomerClick={customerDialog.onTrue}
              selectedCustomer={selectedCustomer}
              getLabel={getLabel}
              canGoNextStep={canGoRouteStep}
              onPrevStep={() => setActiveStep(0)}
              onNextStep={() => setActiveStep(2)}
            />
          </Step>

          {/* Step 3 */}
          <Step>
            <StepLabel>{STEPS[2].label}</StepLabel>
            <SubtripJobCreateRouteStep
              isLoadedJob={isLoadedJob}
              selectedCustomer={selectedCustomer}
              getLabel={getLabel}
              consignees={consignees}
              canGoNextStep={canGoFreightStep}
              isSubmitting={isSubmitting}
              canSubmit={canSubmit}
              onPrevStep={() => setActiveStep(1)}
              onNextStep={() => setActiveStep(3)}
            />
          </Step>

          {/* Step 4 */}
          {isLoadedJob && (
            <Step>
              <StepLabel>{STEPS[3].label}</StepLabel>
              <SubtripJobCreateFreightStep
                isLoadedJob={isLoadedJob}
                watchedForm={watchedForm}
                freightConfig={freightConfig}
                freightAmountBanner={freightAmountBanner}
                canGoNextStep={canGoMaterialStep}
                onPrevStep={() => setActiveStep(2)}
                onNextStep={() => setActiveStep(4)}
                selectedCustomer={selectedCustomer}
                selectedVehicle={selectedVehicle}
                getLabel={getLabel}
              />
            </Step>
          )}

          {/* Step 5 */}
          {isLoadedJob && (
            <Step>
              <StepLabel>{STEPS[4].label}</StepLabel>
              <SubtripJobCreateMaterialStep
                isLoadedJob={isLoadedJob}
                selectedCustomer={selectedCustomer}
                getLabel={getLabel}
                isEwayIntegrationEnabled={isEwayIntegrationEnabled}
                materialOptions={materialOptions}
                canGoNextStep={canGoAdvanceStep}
                onPrevStep={() => setActiveStep(3)}
                onNextStep={() => setActiveStep(5)}
              />
            </Step>
          )}

          {/* Step 6 */}
          {isLoadedJob && (
            <Step>
              <StepLabel>{STEPS[5].label}</StepLabel>
              <SubtripJobCreateAdvanceStep
                isLoadedJob={isLoadedJob}
                managesPumps={managesPumps}
                initialAdvanceDieselUnit={initialAdvanceDieselUnit}
                onSelectPumpClick={pumpDialog.onTrue}
                requiresPumpSelection={requiresPumpSelection}
                selectedPump={selectedPump}
                errors={errors}
                isSubmitting={isSubmitting}
                canSubmit={canSubmit}
                onPrevStep={() => setActiveStep(4)}
              />
            </Step>
          )}
        </MuiStepper>

        <SubtripJobCreateDialogs
          vehicleDialog={vehicleDialog}
          driverDialog={driverDialog}
          customerDialog={customerDialog}
          pumpDialog={pumpDialog}
          managesPumps={managesPumps}
          selectedVehicle={selectedVehicle}
          handleVehicleChange={handleVehicleChange}
          selectedDriver={selectedDriver}
          handleDriverChange={handleDriverChange}
          selectedCustomer={selectedCustomer}
          handleCustomerChange={handleCustomerChange}
          selectedPump={selectedPump}
          handlePumpChange={handlePumpChange}
        />
      </Form>
    </Card>
  );
}
