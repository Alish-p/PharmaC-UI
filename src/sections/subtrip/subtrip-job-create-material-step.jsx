import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import StepContent from '@mui/material/StepContent';
import InputAdornment from '@mui/material/InputAdornment';

import { Field } from 'src/components/hook-form';

import { getFreightStepError } from './subtrip-job-create-freight-step';

export function SubtripJobCreateMaterialStep({
  isLoadedJob,
  selectedCustomer,
  getLabel,
  isEwayIntegrationEnabled,
  materialOptions,
  canGoNextStep,
  onPrevStep,
  onNextStep,
}) {
  if (!isLoadedJob) {
    return (
      <StepContent>
        <Alert severity="info">Material details are only for loaded jobs.</Alert>
      </StepContent>
    );
  }

  return (
    <StepContent>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
        <Field.Configurable entity="subtrip" name="quantity" customerId={selectedCustomer?._id}>
          <Field.Text
            name="quantity"
            label={getLabel('quantity', 'Quantity')}
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">Bags</InputAdornment>,
            }}
          />
        </Field.Configurable>

        {!isEwayIntegrationEnabled && (
          <Field.Configurable entity="subtrip" name="ewayBill" customerId={selectedCustomer?._id}>
            <Field.Text name="ewayBill" label={getLabel('ewayBill', 'Eway Bill')} />
          </Field.Configurable>
        )}

        <Field.Configurable
          entity="subtrip"
          name="ewayExpiryDate"
          customerId={selectedCustomer?._id}
        >
          <Field.DatePicker
            name="ewayExpiryDate"
            label={getLabel('ewayExpiryDate', 'Eway Expiry Date')}
            minDate={dayjs()}
          />
        </Field.Configurable>
        <Field.Configurable entity="subtrip" name="invoiceNo" customerId={selectedCustomer?._id}>
          <Field.Text name="invoiceNo" label={getLabel('invoiceNo', 'Invoice No')} />
        </Field.Configurable>
        <Field.Configurable entity="subtrip" name="shipmentNo" customerId={selectedCustomer?._id}>
          <Field.Text name="shipmentNo" label={getLabel('shipmentNo', 'Shipment No')} />
        </Field.Configurable>
        <Field.Configurable entity="subtrip" name="orderNo" customerId={selectedCustomer?._id}>
          <Field.Text name="orderNo" label={getLabel('orderNo', 'Order No')} />
        </Field.Configurable>
        <Field.Configurable
          entity="subtrip"
          name="referenceSubtripNo"
          customerId={selectedCustomer?._id}
        >
          <Field.Text
            name="referenceSubtripNo"
            label={getLabel('referenceSubtripNo', 'Reference Job No')}
            placeholder="Enter original job no (if created by another transporter)"
          />
        </Field.Configurable>

        <Field.Configurable entity="subtrip" name="materialType" customerId={selectedCustomer?._id}>
          <Field.Select name="materialType" label={getLabel('materialType', 'Material Type')}>
            <MenuItem value="">None</MenuItem>
            <Divider sx={{ borderStyle: 'dashed' }} />
            {materialOptions.map(({ label, value }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Field.Select>
        </Field.Configurable>
        <Field.Configurable entity="subtrip" name="grade" customerId={selectedCustomer?._id}>
          <Field.Text name="grade" label={getLabel('grade', 'Grade')} />
        </Field.Configurable>

        {/* DI/DO No as the last field in Step 4 */}
        <Field.Configurable entity="subtrip" name="diNumber" customerId={selectedCustomer?._id}>
          <Field.Text name="diNumber" label={getLabel('diNumber', 'DI/DO No')} />
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

export function getMaterialStepError(
  form,
  {
    selectedVehicle,
    fetchingActiveTrip,
    activeTrip,
    selectedDriver,
    selectedCustomer,
    fields,
    isEwayIntegrationEnabled,
  }
) {
  const freightStageError = getFreightStepError(form, {
    selectedVehicle,
    fetchingActiveTrip,
    activeTrip,
    selectedDriver,
    selectedCustomer,
    fields,
  });
  if (freightStageError) return freightStageError;

  const isOwnVehicle = !!selectedVehicle?.isOwn;
  const isLoaded = form.loadType === 'loaded' || !isOwnVehicle;
  if (!isLoaded) return null;

  const isFieldRequired = (name) => {
    const visibility = fields?.[name]?.visibility;
    if (visibility === 'required') return true;
    if (visibility === 'optional' || visibility === 'hidden') return false;
    if (name === 'invoiceNo' || name === 'materialType') {
      return true;
    }
    return false;
  };

  if (isFieldRequired('invoiceNo') && !form.invoiceNo) {
    return 'Please enter invoice number';
  }
  if (isFieldRequired('materialType') && !form.materialType) {
    return 'Please select material type';
  }
  if (
    isFieldRequired('quantity') &&
    (form.quantity === undefined || form.quantity === null || form.quantity === '')
  ) {
    return 'Please enter quantity';
  }
  if (!isEwayIntegrationEnabled && isFieldRequired('ewayBill') && !form.ewayBill) {
    return 'Please enter eway bill';
  }
  if (form.ewayBill && !form.ewayExpiryDate) {
    return 'Please select eway expiry date';
  }
  if (isFieldRequired('ewayExpiryDate') && !form.ewayExpiryDate) {
    return 'Please select eway expiry date';
  }
  if (isFieldRequired('grade') && !form.grade) {
    return 'Please enter grade';
  }
  if (isFieldRequired('shipmentNo') && !form.shipmentNo) {
    return 'Please enter shipment number';
  }
  if (isFieldRequired('orderNo') && !form.orderNo) {
    return 'Please enter order number';
  }
  if (isFieldRequired('referenceSubtripNo') && !form.referenceSubtripNo) {
    return 'Please enter reference job number';
  }
  if (isFieldRequired('diNumber') && !form.diNumber) {
    return 'Please enter DI/DO number';
  }

  const eway = form.ewayExpiryDate ? new Date(form.ewayExpiryDate) : null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (form.ewayBill && (!eway || eway < startOfToday)) {
    return 'Eway Expiry Date must be today or later';
  }

  return null;
}
