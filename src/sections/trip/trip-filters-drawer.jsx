import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { APP_ICONS } from 'src/components/iconify/icons';
import { DialogSelectButton } from 'src/components/dialog-select-button';

// ----------------------------------------------------------------------

export default function TripFiltersDrawer({
  open,
  onClose,
  filters,
  onFilters,
  //
  driverDialog,
  vehicleDialog,
  subtripDialog,
  dateDialog,
  //
  selectedDriver,
  selectedVehicle,
  selectedSubtrip,
}) {
  const handleFilterTripNo = (event) => {
    onFilters('tripNo', event.target.value);
  };

  const handleFilterTripSheetReady = (event) => {
    onFilters('isTripSheetReady', event.target.checked);
  };

  const handleFilterNumberOfSubtrips = (event, newValue) => {
    onFilters('numberOfSubtrips', newValue);
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
            value={filters.tripNo || ''}
            onChange={handleFilterTripNo}
            placeholder="Search Trip No..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <DialogSelectButton
            onClick={driverDialog.onTrue}
            placeholder="Driver"
            selected={selectedDriver?.driverName}
            iconName={APP_ICONS.driver}
          />

          <DialogSelectButton
            onClick={vehicleDialog.onTrue}
            placeholder="Vehicle"
            selected={selectedVehicle?.vehicleNo}
            iconName={APP_ICONS.vehicle}
          />

          <DialogSelectButton
            onClick={subtripDialog.onTrue}
            placeholder="Job"
            selected={selectedSubtrip?.subtripNo}
            iconName={APP_ICONS.job}
          />

          <DialogSelectButton
            onClick={dateDialog.onTrue}
            placeholder="Date Range"
            selected={
              filters.fromDate && filters.toDate
                ? fDateRangeShortLabel(filters.fromDate, filters.toDate)
                : undefined
            }
            iconName={APP_ICONS.calendar}
          />

          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Number of Jobs: {filters.numberOfSubtrips || 0}
            </Typography>
            <Slider
              value={filters.numberOfSubtrips || 0}
              onChange={handleFilterNumberOfSubtrips}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={10}
            />
          </Stack>

          <FormControlLabel
            control={
              <Switch checked={!!filters.isTripSheetReady} onChange={handleFilterTripSheetReady} />
            }
            label="Trip Sheet Ready"
          />
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
