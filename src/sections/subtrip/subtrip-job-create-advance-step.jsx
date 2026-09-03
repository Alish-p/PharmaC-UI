import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import StepContent from '@mui/material/StepContent';
import InputAdornment from '@mui/material/InputAdornment';

import { Field } from 'src/components/hook-form';
import { APP_ICONS } from 'src/components/iconify/icons';
import { DialogSelectButton } from 'src/components/dialog-select-button';

import { DRIVER_ADVANCE_GIVEN_BY_OPTIONS } from 'src/sections/subtrip/constants';

import { getMaterialStepError } from './subtrip-job-create-material-step';

export function SubtripJobCreateAdvanceStep({
  isLoadedJob,
  managesPumps,
  initialAdvanceDieselUnit,
  onSelectPumpClick,
  requiresPumpSelection,
  selectedPump,
  errors,
  isSubmitting,
  canSubmit,
  onPrevStep,
}) {
  if (!isLoadedJob) {
    return null;
  }

  return (
    <StepContent>
      <Stack spacing={2.5}>
        <Box
          sx={{
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.5,
            bgcolor: 'background.default',
          }}
        >
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '2fr 1fr' }} gap={1.5}>
            <Field.Text
              name="driverAdvance"
              label="Driver Advance (Amount)"
              type="number"
              placeholder="0"
              InputProps={{
                endAdornment: <InputAdornment position="end">₹</InputAdornment>,
              }}
            />
            <Field.Select name="driverAdvanceGivenBy" label="Given By">
              {Object.values(DRIVER_ADVANCE_GIVEN_BY_OPTIONS)
                .filter(
                  (option) => managesPumps || option !== DRIVER_ADVANCE_GIVEN_BY_OPTIONS.FUEL_PUMP
                )
                .map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </Field.Select>
          </Box>
        </Box>

        {managesPumps && (
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              bgcolor: 'background.default',
            }}
          >
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '2fr 1fr' }} gap={1.5}>
              <Field.InputWithUnit
                name="initialAdvanceDiesel"
                unitName="initialAdvanceDieselUnit"
                label="Diesel Intent"
                placeholder="0"
                textFieldProps={{}}
                unitOptions={[
                  { label: 'Litre', value: 'litre' },
                  { label: 'Amount', value: 'amount' },
                ]}
                defaultUnit="litre"
              />
              <Box>
                <DialogSelectButton
                  onClick={onSelectPumpClick}
                  placeholder={`Select Pump${requiresPumpSelection ? ' *' : ''}`}
                  selected={selectedPump?.name}
                  iconName={APP_ICONS.pump}
                  error={Boolean(errors.pumpCd)}
                />
                {errors.pumpCd && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block' }}>
                    {errors.pumpCd.message}
                  </Typography>
                )}
              </Box>
            </Box>
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              {initialAdvanceDieselUnit === 'litre' && (
                <Alert variant="outlined" severity="info">
                  In case of Litre Diesel Intent, expense will not be added automatically. Actuals
                  need to be added.
                </Alert>
              )}
            </Stack>
          </Box>
        )}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
        <Button onClick={onPrevStep}>Back</Button>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={!canSubmit}
        >
          Create Job
        </LoadingButton>
      </Stack>
    </StepContent>
  );
}

const toNumber = (val) => {
  if (val === null || val === undefined || val === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
};

export function getAdvanceStepError(
  form,
  { selectedVehicle, fetchingActiveTrip, activeTrip, selectedDriver, selectedCustomer, fields }
) {
  const materialStageError = getMaterialStepError(form, {
    selectedVehicle,
    fetchingActiveTrip,
    activeTrip,
    selectedDriver,
    selectedCustomer,
    fields,
  });
  if (materialStageError) return materialStageError;

  const isOwnVehicle = !!selectedVehicle?.isOwn;
  const isLoaded = form.loadType === 'loaded' || !isOwnVehicle;
  if (!isLoaded) return null;

  const dieselAdvance = toNumber(form.initialAdvanceDiesel);
  const pumpRequired =
    form.driverAdvanceGivenBy === DRIVER_ADVANCE_GIVEN_BY_OPTIONS.FUEL_PUMP ||
    (dieselAdvance !== undefined && dieselAdvance > 0);

  if (pumpRequired && !form.pumpCd) {
    return 'Please select a pump for driver advance or diesel intent';
  }

  return null;
}
