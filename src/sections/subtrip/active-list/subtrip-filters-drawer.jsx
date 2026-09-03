import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { MenuList, Checkbox, ListItemText } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSystemFeatures } from 'src/hooks/use-system-features';
import { useMaterialOptions } from 'src/hooks/use-material-options';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { VEHICLE_MODES } from 'src/constants/vehicle-mode';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { APP_ICONS } from 'src/components/iconify/icons';
import { DialogSelectButton } from 'src/components/dialog-select-button';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { FREIGHT_MODEL_OPTIONS } from '../constants';

// ----------------------------------------------------------------------

export default function SubtripFiltersDrawer({
  open,
  onClose,
  filters,
  onFilters,
  onApplyDateRange,
  onApplyEndRange,
  //
  transporterDialog,
  customerDialog,
  vehicleDialog,
  driverDialog,
  //
  selectedTransporter,
  selectedCustomer,
  selectedVehicle,
  selectedDriver,
}) {
  const materialPopover = usePopover();
  const materialOptions = useMaterialOptions();
  const { vehicleMode } = useSystemFeatures();
  const hasMarketVehicles = vehicleMode !== VEHICLE_MODES.OWN_ONLY;

  const startRange = useBoolean();
  const endRange = useBoolean();

  const handleToggleMaterial = (value) => {
    const current = Array.isArray(filters.materials) ? [...filters.materials] : [];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilters('materials', newValues);
  };

  const handleFilterSubtripId = (event) => {
    onFilters('subtripNo', event.target.value);
  };

  const handleFilterReferenceSubtripNo = (event) => {
    onFilters('referenceSubtripNo', event.target.value);
  };

  const handleFilterVehicleOwnership = (event) => {
    onFilters('vehicleOwnership', event.target.value);
  };

  const handleFilterSubtripType = (event) => {
    onFilters('subtripType', event.target.value);
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, px: 2.5 }}
    >
      <Typography variant="h6">Filters</Typography>

      <IconButton onClick={onClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  return (
    <>
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 320 },
        }}
      >
        {renderHead}

        <Divider />

        <Scrollbar>
          <Stack spacing={3} sx={{ p: 2.5 }}>
            <TextField
              fullWidth
              value={filters.subtripNo}
              onChange={handleFilterSubtripId}
              placeholder="Job ID"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            {hasMarketVehicles && (
              <DialogSelectButton
                onClick={transporterDialog.onTrue}
                selected={selectedTransporter?.transportName}
                placeholder="Transporter"
                iconName={APP_ICONS.transporter}
              />
            )}

            <DialogSelectButton
              onClick={customerDialog.onTrue}
              selected={selectedCustomer?.customerName}
              placeholder="Customer"
              iconName={APP_ICONS.customer}
            />

            <DialogSelectButton
              onClick={vehicleDialog.onTrue}
              selected={selectedVehicle?.vehicleNo}
              placeholder="Vehicle"
              iconName={APP_ICONS.vehicle}
            />

            <DialogSelectButton
              onClick={startRange.onTrue}
              selected={
                filters.fromDate && filters.toDate
                  ? fDateRangeShortLabel(filters.fromDate, filters.toDate)
                  : undefined
              }
              placeholder="Dispatch Date Range"
              iconName={APP_ICONS.calendar}
            />

            <TextField
              fullWidth
              value={filters.referenceSubtripNo}
              onChange={handleFilterReferenceSubtripNo}
              placeholder="Refference Job No"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              value={filters.ewayBill}
              onChange={(event) => onFilters('ewayBill', event.target.value)}
              placeholder="E-way Bill No"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              value={filters.loadingPoint}
              onChange={(event) => onFilters('loadingPoint', event.target.value)}
              placeholder="Loading Point"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:pin-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              value={filters.unloadingPoint}
              onChange={(event) => onFilters('unloadingPoint', event.target.value)}
              placeholder="Unloading Point"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:pin-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            <DialogSelectButton
              onClick={driverDialog.onTrue}
              selected={selectedDriver?.driverName}
              placeholder="Driver"
              iconName={APP_ICONS.driver}
            />

            <DialogSelectButton
              onClick={endRange.onTrue}
              selected={
                filters.subtripEndFromDate && filters.subtripEndToDate
                  ? fDateRangeShortLabel(filters.subtripEndFromDate, filters.subtripEndToDate)
                  : undefined
              }
              placeholder="Receive Date Range"
              iconName={APP_ICONS.calendar}
            />

            <DialogSelectButton
              onClick={materialPopover.onOpen}
              selected={
                filters.materials.length > 0 ? `${filters.materials.length} materials` : undefined
              }
              placeholder="Materials"
              iconName="mdi:filter-variant"
            />

            <FormControl fullWidth>
              <InputLabel id="subtrip-vehicle-ownership-select-label">Vehicle Ownership</InputLabel>
              <Select
                value={filters.vehicleOwnership || ''}
                onChange={handleFilterVehicleOwnership}
                input={<OutlinedInput label="Vehicle Ownership" />}
                labelId="subtrip-vehicle-ownership-select-label"
                MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
              >
                {hasMarketVehicles && (
                  <MenuItem value="Market">
                    <Label variant="soft" color="secondary">
                      Market
                    </Label>
                  </MenuItem>
                )}
                <MenuItem value="Own">
                  <Label variant="soft" color="primary">
                    Own
                  </Label>
                </MenuItem>
              </Select>
            </FormControl>

            {hasMarketVehicles && (
              <FormControl fullWidth>
                <InputLabel id="subtrip-transporter-payment-select-label">
                  Transporter Payment
                </InputLabel>
                <Select
                  value={filters.transporterPaymentGenerated || ''}
                  onChange={(event) => onFilters('transporterPaymentGenerated', event.target.value)}
                  input={<OutlinedInput label="Transporter Payment" />}
                  labelId="subtrip-transporter-payment-select-label"
                  MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
                >
                  <MenuItem value="yes">
                    <Label variant="soft" color="success">
                      Yes
                    </Label>
                  </MenuItem>
                  <MenuItem value="no">
                    <Label variant="soft" color="error">
                      No
                    </Label>
                  </MenuItem>
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel id="subtrip-epod-signed-select-label">Epod Signed</InputLabel>
              <Select
                value={filters.epodSigned || ''}
                onChange={(event) => onFilters('epodSigned', event.target.value)}
                input={<OutlinedInput label="Epod Signed" />}
                labelId="subtrip-epod-signed-select-label"
                MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
              >
                <MenuItem value="yes">
                  <Label variant="soft" color="success">
                    Yes
                  </Label>
                </MenuItem>
                <MenuItem value="no">
                  <Label variant="soft" color="error">
                    No
                  </Label>
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="subtrip-shortage-select-label">Shortage</InputLabel>
              <Select
                value={filters.shortage || ''}
                onChange={(event) => onFilters('shortage', event.target.value)}
                input={<OutlinedInput label="Shortage" />}
                labelId="subtrip-shortage-select-label"
                MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
              >
                <MenuItem value="no">
                  <Label variant="soft" color="success">
                    No shortage
                  </Label>
                </MenuItem>
                <MenuItem value="yes">
                  <Label variant="soft" color="error">
                    Has Shortage
                  </Label>
                </MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Min Commission"
                value={filters.commissionRateMin || ''}
                onChange={(event) => onFilters('commissionRateMin', event.target.value)}
              />
              <TextField
                fullWidth
                type="number"
                label="Max Commission"
                value={filters.commissionRateMax || ''}
                onChange={(event) => onFilters('commissionRateMax', event.target.value)}
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel id="subtrip-type-select-label">Subtrip Type</InputLabel>
              <Select
                value={filters.subtripType || ''}
                onChange={handleFilterSubtripType}
                input={<OutlinedInput label="Subtrip Type" />}
                labelId="subtrip-type-select-label"
                MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
              >
                <MenuItem value="">All</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <MenuItem value="Empty">Empty</MenuItem>
                <MenuItem value="Loaded">Loaded</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="subtrip-freight-model-select-label">Freight Model</InputLabel>
              <Select
                value={filters.freightModel || ''}
                onChange={(event) => onFilters('freightModel', event.target.value)}
                input={<OutlinedInput label="Freight Model" />}
                labelId="subtrip-freight-model-select-label"
                MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
              >
                <MenuItem value="">All</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {FREIGHT_MODEL_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="subtrip-status-select-label">Job Status</InputLabel>
              <Select
                multiple
                value={filters.subtripStatus || []}
                onChange={(event) => onFilters('subtripStatus', event.target.value)}
                input={<OutlinedInput label="Job Status" />}
                labelId="subtrip-status-select-label"
                renderValue={(selected) =>
                  selected.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
                }
                MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
              >
                {['loaded', 'received', 'error', 'billed'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={(filters.subtripStatus || []).includes(status)} />
                    <ListItemText primary={status.charAt(0).toUpperCase() + status.slice(1)} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Scrollbar>
      </Drawer>

      <CustomPopover
        open={materialPopover.open}
        onClose={materialPopover.onClose}
        anchorEl={materialPopover.anchorEl}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <Scrollbar sx={{ width: 200, maxHeight: 400 }}>
          <MenuList>
            {materialOptions.map(({ value }) => (
              <MenuItem key={value} onClick={() => handleToggleMaterial(value)}>
                <Checkbox checked={filters.materials.includes(value)} />
                <ListItemText primary={value} />
              </MenuItem>
            ))}
          </MenuList>
        </Scrollbar>
      </CustomPopover>

      <CustomDateRangePicker
        variant="calendar"
        presets={DATE_RANGE_PRESETS}
        open={startRange.value}
        onClose={startRange.onFalse}
        startDate={filters.fromDate}
        endDate={filters.toDate}
        onChangeStartDate={(date) => onFilters('fromDate', date)}
        onChangeEndDate={(date) => onFilters('toDate', date)}
        onApplyRange={onApplyDateRange}
      />

      <CustomDateRangePicker
        variant="calendar"
        presets={DATE_RANGE_PRESETS}
        open={endRange.value}
        onClose={endRange.onFalse}
        startDate={filters.subtripEndFromDate}
        endDate={filters.subtripEndToDate}
        onChangeStartDate={(date) => onFilters('subtripEndFromDate', date)}
        onChangeEndDate={(date) => onFilters('subtripEndToDate', date)}
        onApplyRange={onApplyEndRange}
      />
    </>
  );
}
