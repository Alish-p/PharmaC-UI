import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import StepContent from '@mui/material/StepContent';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useMaterialOptions } from 'src/hooks/use-material-options';

import axios from 'src/utils/axios';
import { fDateTime } from 'src/utils/format-time';

import { toast } from 'src/components/snackbar';
import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { DialogSelectButton } from 'src/components/dialog-select-button';

import { useTenantContext } from 'src/auth/tenant';

import { isEwayBillValid, extractEwayBillDetails } from './subtrip-job-create-eway-utils';

export function SubtripJobCreateVehicleStep({
  onVehicleChange,
  onCustomerSearch,
  forcedTripIsClosed,
  onSelectVehicleClick,
  selectedVehicle,
  isFetchingTargetTrip,
  targetTrip,
  targetTripDetails,
  activeTrip,
  fromTripId,
  tripDecision,
  selectedCustomer,
  getLabel,
  canGoNextStep,
  onNextStep,
}) {
  const { watch, setValue, getValues } = useFormContext();
  const tenant = useTenantContext();
  const materialOptions = useMaterialOptions();

  const isEwayIntegrationEnabled = Boolean(tenant?.integrations?.ewayBill?.enabled);

  const [ewayFetchLoading, setEwayFetchLoading] = useState(false);
  const [ewayFetchError, setEwayFetchError] = useState('');

  const ewayValue = watch('ewayBill');
  const isEwayValid = useMemo(() => isEwayBillValid(ewayValue), [ewayValue]);

  const [subtripAnchorEl, setSubtripAnchorEl] = useState(null);
  const openSubtripPopover = Boolean(subtripAnchorEl);
  const handleOpenSubtripPopover = (event) => setSubtripAnchorEl(event.currentTarget);
  const handleCloseSubtripPopover = () => setSubtripAnchorEl(null);

  const fetchVehicleByNo = async (vehicleNo) => {
    try {
      const { data } = await axios.get('/api/vehicles', {
        params: { vehicleNo, isActive: true, rowsPerPage: 1 },
      });
      const results = data?.results || [];
      return results[0];
    } catch (e) {
      return undefined;
    }
  };

  const handleFetchEwayDetails = async () => {
    try {
      setEwayFetchError('');
      const ewayNo = getValues('ewayBill');
      if (!ewayNo) {
        setEwayFetchError('Enter an eWay Bill number');
        return;
      }
      setEwayFetchLoading(true);
      const { data } = await axios.get(`/api/ewaybill/${encodeURIComponent(ewayNo)}`);
      let message = data?.results?.message ?? data?.message ?? null;
      if (!message && data && typeof data === 'object') {
        const looksLikeEwb =
          'eway_bill_number' in data || 'document_number' in data || 'itemList' in data;
        if (looksLikeEwb) message = data;
      }
      if (!message) throw new Error('No eWay Bill details found');

      const details = extractEwayBillDetails(message, ewayNo, materialOptions);
      if (details) {
        const {
          ewayBill,
          ewayExpiryDate,
          invoiceNo,
          loadingPoint,
          unloadingPoint,
          consignee,
          loadingWeight,
          quantity,
          materialType,
          grade,
          vehicleNumber,
          consignorGstin,
          consignorName,
        } = details;

        if (vehicleNumber && onVehicleChange) {
          const foundVehicle = await fetchVehicleByNo(vehicleNumber);
          if (foundVehicle) {
            onVehicleChange(foundVehicle);
          }
        }

        setValue('ewayBill', ewayBill, { shouldDirty: true, shouldValidate: false });
        if (ewayExpiryDate) {
          setValue('ewayExpiryDate', ewayExpiryDate, { shouldDirty: true, shouldValidate: true });
        }
        if (invoiceNo) {
          setValue('invoiceNo', invoiceNo, { shouldDirty: true, shouldValidate: true });
        }
        if (loadingPoint) {
          setValue('loadingPoint', loadingPoint, { shouldDirty: true, shouldValidate: true });
        }
        if (unloadingPoint) {
          const parsedUnloadingPoint =
            typeof unloadingPoint === 'string'
              ? unloadingPoint.split(' | ').map((p) => ({ label: p, value: p }))
              : unloadingPoint;
          setValue('unloadingPoint', parsedUnloadingPoint, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
        if (consignee) {
          setValue('consignee', consignee, { shouldDirty: true, shouldValidate: false });
        }
        if (loadingWeight !== undefined) {
          setValue('loadingWeight', loadingWeight, { shouldDirty: true, shouldValidate: true });
          setValue('quantity', quantity, { shouldDirty: true, shouldValidate: false });
        }
        if (materialType) {
          setValue('materialType', materialType, { shouldDirty: true, shouldValidate: true });
        }
        if (grade) {
          setValue('grade', grade, { shouldDirty: true, shouldValidate: false });
        }

        if ((consignorGstin || consignorName) && onCustomerSearch) {
          onCustomerSearch({
            gstinNumber: consignorGstin || undefined,
            name: consignorName || undefined,
          });
        }
      }

      toast.success('eWay Bill details fetched');
    } catch (err) {
      const msg = err?.message || 'Failed to fetch eWay Bill';
      setEwayFetchError(msg);
      toast.error(msg);
    } finally {
      setEwayFetchLoading(false);
    }
  };

  return (
    <StepContent>
      <Box display="grid" gridTemplateColumns="repeat(1, 1fr)" rowGap={2}>
        {isEwayIntegrationEnabled && (
          <Box>
            <Field.Text
              name="ewayBill"
              label="eWay Bill Number"
              placeholder="Enter eWay Bill number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {ewayFetchLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Tooltip
                        title={
                          isEwayValid
                            ? 'Fetch eWay Bill details'
                            : 'Enter 12-digit eWay Bill number'
                        }
                        arrow
                      >
                        <span>
                          <IconButton
                            size="small"
                            onClick={handleFetchEwayDetails}
                            disabled={!isEwayValid || ewayFetchLoading}
                            color={isEwayValid ? 'success' : 'default'}
                          >
                            <Iconify
                              icon={isEwayValid ? 'mdi:cloud-download' : 'mdi:cloud-outline'}
                              width={20}
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (isEwayValid && !ewayFetchLoading) {
                    handleFetchEwayDetails();
                  } else if (!isEwayValid) {
                    setEwayFetchError('Enter a 12-digit eWay Bill number');
                  }
                }
              }}
            />
            {ewayFetchError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block' }}>
                {ewayFetchError}
              </Typography>
            )}
          </Box>
        )}
        {forcedTripIsClosed && (
          <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
            U are currently trying to Add job to closed Trip.
          </Alert>
        )}
        <DialogSelectButton
          onClick={onSelectVehicleClick}
          placeholder="Select Vehicle *"
          selected={
            selectedVehicle
              ? `${selectedVehicle.vehicleNo} • ${selectedVehicle.isOwn ? 'Own' : 'Market'}`
              : undefined
          }
          iconName={APP_ICONS.vehicle}
        />

        {selectedVehicle?.isOwn && (
          <>
            {isFetchingTargetTrip && <Typography>Checking trip details…</Typography>}

            {!isFetchingTargetTrip && targetTrip && (
              <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
                <span>
                  Trip found: <strong>{targetTrip.tripNo}</strong>
                </span>
                <Tooltip title="View recent jobs" arrow>
                  <IconButton size="small" color="primary" onClick={handleOpenSubtripPopover}>
                    <Iconify icon="mdi:format-list-bulleted" width={18} />
                  </IconButton>
                </Tooltip>
                <Popover
                  open={openSubtripPopover}
                  anchorEl={subtripAnchorEl}
                  onClose={handleCloseSubtripPopover}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      width: 460,
                      maxWidth: '95vw',
                      borderRadius: 2,
                      boxShadow: (theme) => theme.customShadows?.dialog || theme.shadows[16],
                    },
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.75,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="mdi:truck-cargo-container" width={20} color="primary.main" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Jobs in Trip{' '}
                        <Box component="span" sx={{ color: 'primary.main' }}>
                          {targetTrip.tripNo}
                        </Box>
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      label={`${(targetTripDetails?.subtrips || []).length} Jobs`}
                      color="primary"
                      variant="soft"
                    />
                  </Box>

                  {/* Job list */}
                  <Box sx={{ maxHeight: 380, overflow: 'auto', px: 2, py: 1.5 }}>
                    {(targetTripDetails?.subtrips || []).length === 0 ? (
                      <Box sx={{ py: 3, textAlign: 'center' }}>
                        <Iconify
                          icon="mdi:clipboard-off-outline"
                          width={36}
                          sx={{ color: 'text.disabled', mb: 1 }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No jobs found in this trip.
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={1.25}>
                        {(targetTripDetails?.subtrips || [])
                          .slice()
                          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                          .map((st, idx, arr) => {
                            const driverName =
                              st?.driverId?.driverName ||
                              st?.driver?.driverName ||
                              st?.driverName ||
                              (typeof st?.driver === 'string' ? st.driver : undefined) ||
                              targetTrip?.driverId?.driverName ||
                              '-';

                            const statusRaw = (st.subtripStatus || '').replace(/-/g, ' ');
                            const statusColorMap = {
                              loaded: 'info',
                              'in transit': 'warning',
                              unloaded: 'success',
                              billed: 'success',
                              settled: 'default',
                              default: 'default',
                            };
                            const statusColor =
                              statusColorMap[statusRaw.toLowerCase()] || statusColorMap.default;

                            return (
                              <Box key={st._id}>
                                <Box
                                  sx={{
                                    borderRadius: 1.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    p: 1.5,
                                    bgcolor: 'background.paper',
                                    transition: 'box-shadow 0.15s',
                                    '&:hover': {
                                      boxShadow: (theme) =>
                                        theme.customShadows?.z8 || theme.shadows[4],
                                    },
                                  }}
                                >
                                  {/* Top row: LR + Status */}
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{ mb: 1 }}
                                  >
                                    <Stack direction="row" alignItems="center" spacing={0.75}>
                                      <Iconify
                                        icon="mdi:file-document-outline"
                                        width={15}
                                        sx={{ color: 'text.secondary' }}
                                      />
                                      <Typography
                                        variant="caption"
                                        sx={{ color: 'text.secondary' }}
                                      >
                                        LR
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {st.subtripNo || '-'}
                                      </Typography>
                                    </Stack>
                                    <Chip
                                      size="small"
                                      label={statusRaw || '-'}
                                      color={statusColor}
                                      variant="soft"
                                      sx={{
                                        textTransform: 'capitalize',
                                        height: 20,
                                        fontSize: '0.68rem',
                                      }}
                                    />
                                  </Stack>

                                  {/* Customer */}
                                  <Stack
                                    direction="row"
                                    alignItems="flex-start"
                                    spacing={0.75}
                                    sx={{ mb: 0.75 }}
                                  >
                                    <Iconify
                                      icon="mdi:domain"
                                      width={14}
                                      sx={{ color: 'text.disabled', mt: '2px', flexShrink: 0 }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'text.primary',
                                        fontWeight: 500,
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {st.customerId?.customerName || '-'}
                                    </Typography>
                                  </Stack>

                                  {/* Route */}
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.5}
                                    sx={{ mb: 0.75 }}
                                  >
                                    <Iconify
                                      icon="mdi:map-marker-outline"
                                      width={14}
                                      sx={{ color: 'text.disabled', flexShrink: 0 }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'text.secondary',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: 320,
                                      }}
                                    >
                                      {st.loadingPoint || '—'}
                                    </Typography>
                                    <Iconify
                                      icon="mdi:arrow-right"
                                      width={13}
                                      sx={{ color: 'text.disabled', flexShrink: 0 }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'text.secondary',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: 320,
                                      }}
                                    >
                                      {st.unloadingPoint || '—'}
                                    </Typography>
                                  </Stack>

                                  {/* Dispatch + Driver */}
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                      <Iconify
                                        icon="mdi:calendar-outline"
                                        width={13}
                                        sx={{ color: 'text.disabled' }}
                                      />
                                      <Typography
                                        variant="caption"
                                        sx={{ color: 'text.secondary' }}
                                      >
                                        {st.startDate ? fDateTime(new Date(st.startDate)) : '-'}
                                      </Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                      <Avatar
                                        sx={{
                                          width: 16,
                                          height: 16,
                                          fontSize: '0.6rem',
                                          bgcolor: 'primary.lighter',
                                          color: 'primary.dark',
                                        }}
                                      >
                                        {driverName.charAt(0).toUpperCase()}
                                      </Avatar>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: 'text.secondary' }}
                                      >
                                        {driverName}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Box>

                                {idx < arr.length - 1 && <Divider sx={{ mt: 1.25 }} />}
                              </Box>
                            );
                          })}
                      </Stack>
                    )}
                  </Box>
                </Popover>
              </Alert>
            )}

            {!isFetchingTargetTrip && !targetTrip && !activeTrip && !fromTripId && (
              <Alert severity="success" variant="outlined">
                No active trip found. A new trip will be created and the job attached to it.
              </Alert>
            )}

            {targetTrip && (
              <Field.Select
                name="tripDecision"
                label="Trip Handling"
                sx={{ mt: 1 }}
                disabled={!!fromTripId}
              >
                <MenuItem value="attach">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="mingcute:link-line" width={18} />
                    <span>Attach to Active Trip</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="new">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="mdi:refresh" width={18} />
                    <span>Create New & Close Previous</span>
                  </Stack>
                </MenuItem>
              </Field.Select>
            )}

            {selectedVehicle?.isOwn && (tripDecision === 'new' || (!activeTrip && !fromTripId)) && (
              <Field.Configurable
                entity="subtrip"
                name="startKm"
                customerId={selectedCustomer?._id}
              >
                <Field.Text
                  name="startKm"
                  label={getLabel('startKm', 'Start Km')}
                  type="number"
                  helperText="Previous trip will be closed with this starting km of current trip"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">km</InputAdornment>,
                  }}
                  inputProps={{ min: 0 }}
                  sx={{ mt: 1 }}
                />
              </Field.Configurable>
            )}

            <Field.Select name="loadType" label="Load Type" sx={{ mt: 1 }}>
              <MenuItem value="loaded">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="mdi:truck-fast" width={18} />
                  <span>Loaded</span>
                </Stack>
              </MenuItem>
              <MenuItem value="empty">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="mdi:truck-fast-outline" width={18} />
                  <span>Empty</span>
                </Stack>
              </MenuItem>
            </Field.Select>
          </>
        )}

        {selectedVehicle && !selectedVehicle.isOwn && (
          <Alert severity="info" variant="outlined">
            Market vehicle selected. This will create an independent loaded job.
          </Alert>
        )}

        {selectedVehicle && (
          <Field.Configurable
            entity="subtrip"
            name="vehicleAssignment"
            customerId={selectedCustomer?._id}
          >
            <Field.Select
              name="vehicleAssignment"
              label={getLabel('vehicleAssignment', 'Vehicle Assignment')}
              sx={{ mt: 1 }}
            >
              <MenuItem value="schedule">Schedule Vehicle</MenuItem>
              <MenuItem value="adhock">Adhock Vehicle</MenuItem>
            </Field.Select>
          </Field.Configurable>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={onNextStep} disabled={!canGoNextStep}>
          Continue
        </Button>
      </Box>
    </StepContent>
  );
}

const toNumber = (val) => {
  if (val === null || val === undefined || val === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
};

export function getVehicleStepError(form, { selectedVehicle, fetchingActiveTrip, activeTrip }) {
  if (!selectedVehicle) return 'Please select a vehicle';
  if (!selectedVehicle?.isOwn) return null;
  if (fetchingActiveTrip) return 'Validating active trip. Please wait…';

  if (activeTrip && !(form.tripDecision === 'attach' || form.tripDecision === 'new')) {
    return 'Trip decision must be attach or new';
  }
  if (!(form.loadType === 'loaded' || form.loadType === 'empty')) {
    return 'Select load type (Loaded/Empty)';
  }

  const requiresStartKm = !activeTrip || (activeTrip && form.tripDecision === 'new');
  if (requiresStartKm) {
    const startKmValue = toNumber(form.startKm);
    if (startKmValue === undefined) return 'Start Km is required to create a new trip';
    if (startKmValue < 0) return 'Start Km cannot be negative';
  }

  return null;
}
