import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import StepContent from '@mui/material/StepContent';
import InputAdornment from '@mui/material/InputAdornment';

import { Field } from 'src/components/hook-form';

import { FREIGHT_MODEL_OPTIONS } from './constants';
import { loadingWeightUnit } from '../vehicle/vehicle-config';
import { getRouteStepError } from './subtrip-job-create-route-step';

export function SubtripJobCreateFreightStep({
  isLoadedJob,
  watchedForm,
  freightConfig,
  freightAmountBanner,
  canGoNextStep,
  onPrevStep,
  onNextStep,
  selectedCustomer,
  selectedVehicle,
  getLabel,
}) {
  if (!isLoadedJob) {
    return (
      <StepContent>
        <Alert severity="info">Freight details are only for loaded jobs.</Alert>
      </StepContent>
    );
  }

  return (
    <StepContent>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
        <Field.Select name="freightModel" label="Freight Model *">
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

        {(watchedForm.freightModel === 'per_ton' ||
          watchedForm.freightModel === 'per_kl' ||
          watchedForm.freightModel === 'per_km' ||
          watchedForm.freightModel === 'per_hour') && (
          <>
            <Field.Text
              name="rate"
              label={
                watchedForm.freightModel === 'per_km'
                  ? 'Rate (Per KM) *'
                  : watchedForm.freightModel === 'per_hour'
                    ? 'Rate (Per Hour) *'
                    : watchedForm.freightModel === 'per_kl'
                      ? 'Rate (Per KL) *'
                      : 'Rate (Per Ton) *'
              }
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">₹</InputAdornment>,
              }}
            />
            {watchedForm.freightModel === 'per_km' && (
              <Field.Text
                name="freightStartKm"
                label="Billing Start KM"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">km</InputAdornment>,
                }}
              />
            )}
          </>
        )}

        {watchedForm.freightModel === 'hybrid' && (
          <>
            <Field.Text
              name="freightAmount"
              label="Base Freight Amount *"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">₹</InputAdornment>,
              }}
            />
            <Field.Text
              name="baseKm"
              label="Base KM *"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">km</InputAdornment>,
              }}
            />
            <Field.Text
              name="rate"
              label="Extra Rate (Per KM) *"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">₹</InputAdornment>,
              }}
            />
            <Field.Text
              name="freightStartKm"
              label="Billing Start KM"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">km</InputAdornment>,
              }}
            />
          </>
        )}

        {watchedForm.freightModel === 'fixed' && (
          <Field.Text
            name="freightAmount"
            label="Freight Amount *"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">₹</InputAdornment>,
            }}
          />
        )}

        {watchedForm.freightModel === 'per_ton' || watchedForm.freightModel === 'per_kl' ? (
          <Field.Text
            name="loadingWeight"
            label={getLabel(
              'loadingWeight',
              watchedForm.freightModel === 'per_kl' ? 'Volume (KL)' : 'Loading Weight'
            )}
            type="number"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {watchedForm.freightModel === 'per_kl'
                    ? 'KL'
                    : watchedForm.freightModel === 'per_ton'
                      ? 'Ton'
                      : loadingWeightUnit[(selectedVehicle?.vehicleType || '').toLowerCase()] ||
                        'Units'}
                </InputAdornment>
              ),
            }}
            inputProps={{ min: 0 }}
          />
        ) : (
          <Field.Configurable
            entity="subtrip"
            name="loadingWeight"
            customerId={selectedCustomer?._id}
          >
            <Field.Text
              name="loadingWeight"
              label={getLabel('loadingWeight', 'Loading Weight')}
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {loadingWeightUnit[(selectedVehicle?.vehicleType || '').toLowerCase()] ||
                      'Units'}
                  </InputAdornment>
                ),
              }}
              inputProps={{ min: 0 }}
            />
          </Field.Configurable>
        )}
      </Box>

      {freightAmountBanner && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ mt: 2, display: 'flex', alignItems: 'center' }}
        >
          <Typography variant="subtitle2" component="div">
            Calculated Freight Amount: <strong>{freightAmountBanner.amount}</strong>
          </Typography>
          {freightAmountBanner.detail && (
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
              ({freightAmountBanner.detail})
            </Typography>
          )}
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button onClick={onPrevStep}>Back</Button>
        <Button variant="contained" onClick={onNextStep} disabled={!canGoNextStep}>
          Continue
        </Button>
      </Stack>
    </StepContent>
  );
}

export function getFreightStepError(
  form,
  { selectedVehicle, fetchingActiveTrip, activeTrip, selectedDriver, selectedCustomer, fields }
) {
  const routeStageError = getRouteStepError(form, {
    selectedVehicle,
    fetchingActiveTrip,
    activeTrip,
    selectedDriver,
    selectedCustomer,
    fields,
  });
  if (routeStageError) return routeStageError;

  const isOwnVehicle = !!selectedVehicle?.isOwn;
  const isLoaded = form.loadType === 'loaded' || !isOwnVehicle;
  if (!isLoaded) return null;

  let isFreightValid = true;
  if (form.freightModel === 'fixed') {
    if (!form.freightAmount) isFreightValid = false;
  } else if (form.freightModel === 'hybrid') {
    if (!form.freightAmount || !form.baseKm || !form.rate) isFreightValid = false;
  } else if (!form.rate) {
    isFreightValid = false;
  }

  if (!isFreightValid) {
    return 'Please fill required freight fields';
  }

  const isFieldRequired = (name) => {
    const visibility = fields?.[name]?.visibility;
    if (visibility === 'required') return true;
    if (visibility === 'optional' || visibility === 'hidden') return false;
    if (name === 'loadingPoint' || name === 'unloadingPoint' || name === 'consignee') {
      return true;
    }
    return false;
  };

  const requiresLoadingWeight =
    form.freightModel === 'per_ton' ||
    form.freightModel === 'per_kl' ||
    isFieldRequired('loadingWeight');

  if (requiresLoadingWeight && !form.loadingWeight) {
    return 'Please enter loading weight';
  }

  return null;
}
