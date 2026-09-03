import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import StepContent from '@mui/material/StepContent';

import { Field } from 'src/components/hook-form';
import { APP_ICONS } from 'src/components/iconify/icons';
import { DialogSelectButton } from 'src/components/dialog-select-button';

import { getVehicleStepError } from './subtrip-job-create-vehicle-step';

export function SubtripJobCreateDetailsStep({
  onSelectDriverClick,
  selectedDriver,
  selectedVehicle,
  recentDrivers,
  handleDriverChange,
  isLoadedJob,
  onSelectCustomerClick,
  selectedCustomer,
  getLabel,
  canGoNextStep,
  onPrevStep,
  onNextStep,
}) {
  return (
    <StepContent>
      <Box display="grid" gridTemplateColumns="repeat(1, 1fr)" rowGap={2}>
        <DialogSelectButton
          onClick={onSelectDriverClick}
          placeholder="Select Driver *"
          selected={selectedDriver?.driverName}
          iconName={APP_ICONS.driver}
        />

        {selectedVehicle?._id && recentDrivers && recentDrivers.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Recent drivers for {selectedVehicle.vehicleNo}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {recentDrivers.map((d) => {
                const isSelected = selectedDriver?._id === d._id;
                return (
                  <Tooltip key={d._id} title={d.driverCellNo || ''} arrow>
                    <Chip
                      clickable
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      onClick={() => handleDriverChange(d)}
                      avatar={<Avatar>{(d.driverName || '?').charAt(0)}</Avatar>}
                      label={d.driverName}
                      sx={{ mb: 1 }}
                    />
                  </Tooltip>
                );
              })}
            </Stack>
          </Box>
        )}

        {isLoadedJob && (
          <DialogSelectButton
            onClick={onSelectCustomerClick}
            placeholder="Select Customer *"
            selected={selectedCustomer?.customerName}
            iconName={APP_ICONS.customer}
          />
        )}

        <Field.MobileDateTimePicker name="startDate" label="Start Date *" maxDate={dayjs()} />

        <Field.Configurable entity="subtrip" name="remarks" customerId={selectedCustomer?._id}>
          <Field.Text name="remarks" label={getLabel('remarks', 'Remarks')} />
        </Field.Configurable>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button onClick={onPrevStep}>Back</Button>
        <Button variant="contained" onClick={onNextStep} disabled={!canGoNextStep}>
          Continue
        </Button>
      </Stack>
    </StepContent>
  );
}

export function getJobStepError(
  form,
  { selectedVehicle, fetchingActiveTrip, activeTrip, selectedDriver, selectedCustomer, fields }
) {
  const vehicleStageError = getVehicleStepError(form, {
    selectedVehicle,
    fetchingActiveTrip,
    activeTrip,
  });
  if (vehicleStageError) return vehicleStageError;

  if (!selectedDriver?._id) return 'Please select a driver';
  if (!form.startDate) return 'Please select a start date';

  const isOwnVehicle = !!selectedVehicle?.isOwn;
  const isLoaded = form.loadType === 'loaded' || !isOwnVehicle;

  if (isLoaded && !selectedCustomer) return 'Please select a customer';

  const isFieldRequired = (name) => fields?.[name]?.visibility === 'required';

  if (isFieldRequired('remarks') && !form.remarks) {
    return 'Please enter remarks';
  }

  return null;
}
