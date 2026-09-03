// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
// types

// ----------------------------------------------------------------------

export default function TripTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  selectedDriverName,
  selectedVehicleNo,
  selectedSubtripNo,
  ...other
}) {
  const handleRemoveTripStatus = () => {
    onFilters('tripStatus', 'all');
  };

  const handleRemoveTripId = () => {
    onFilters('tripNo', '');
  };

  const handleRemoveDriver = () => {
    onFilters('driverId', '');
  };

  const handleRemoveVehicle = () => {
    onFilters('vehicleId', '');
  };

  const handleRemoveSubtrip = () => {
    onFilters('subtripId', '');
  };

  const handleRemoveDate = () => {
    onFilters({ fromDate: null, toDate: null });
  };

  const handleRemoveTripSheetReady = () => {
    onFilters('isTripSheetReady', false);
  };

  const handleRemoveNumberOfSubtrips = () => {
    onFilters('numberOfSubtrips', 0);
  };

  // Removed Ownership filter handler as 'Own' filter is no longer used

  const shortLabel = fDateRangeShortLabel(filters.fromDate, filters.toDate);

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.tripStatus !== 'all' && (
          <Block label="Trip Type :">
            <Chip size="small" label={filters.tripStatus} onDelete={handleRemoveTripStatus} />
          </Block>
        )}

        {filters.tripNo && (
          <Block label="Trip:">
            <Chip size="small" label={filters.tripNo} onDelete={handleRemoveTripId} />
          </Block>
        )}

        {filters.driverId && (
          <Block label="driver">
            <Chip size="small" label={selectedDriverName} onDelete={handleRemoveDriver} />
          </Block>
        )}

        {filters.vehicleId && (
          <Block label="Vehicle No:">
            <Chip size="small" label={selectedVehicleNo} onDelete={handleRemoveVehicle} />
          </Block>
        )}

        {filters.subtripId && (
          <Block label="Job:">
            <Chip size="small" label={selectedSubtripNo} onDelete={handleRemoveSubtrip} />
          </Block>
        )}

        {filters.fromDate && filters.toDate && (
          <Block label="Date:">
            <Chip size="small" label={shortLabel} onDelete={handleRemoveDate} />
          </Block>
        )}

        {filters.numberOfSubtrips > 0 && (
          <Block label="Jobs:">
            <Chip
              size="small"
              label={filters.numberOfSubtrips}
              onDelete={handleRemoveNumberOfSubtrips}
            />
          </Block>
        )}

        {filters.isTripSheetReady && (
          <Block label="Status:">
            <Chip size="small" label="Trip Sheet Ready" onDelete={handleRemoveTripSheetReady} />
          </Block>
        )}

        {/* Ownership filter chip removed */}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}
