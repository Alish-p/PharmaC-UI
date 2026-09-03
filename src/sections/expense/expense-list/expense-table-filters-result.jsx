/* eslint-disable react/prop-types */
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

export default function ExpenseTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  selectedVehicleNo,
  selectedSubtripNo,
  selectedPumpName,
  selectedTripNo,
  ...other
}) {
  const handleRemoveExpenseType = (value) => {
    const newValues = filters.expenseType.filter((v) => v !== value);
    onFilters('expenseType', newValues);
  };

  const handleRemoveExpenseCategory = () => {
    onFilters('expenseCategory', 'all');
  };

  const handleRemovePump = () => {
    onFilters('pumpId', '');
  };

  const handleRemoveTripId = () => {
    onFilters('tripId', '');
  };

  const handleRemoveVehicleNo = () => {
    onFilters('vehicleId', '');
  };

  const handleRemoveSubtrip = () => {
    onFilters('subtripId', '');
  };

  const handleRemoveVehicleType = () => {
    onFilters('vehicleType', '');
  };

  // Route filter removed

  const handleRemoveDate = () => {
    onFilters({ fromDate: null, endDate: null });
  };

  const shortLabel = fDateRangeShortLabel(filters.fromDate, filters.endDate);

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.expenseCategory !== 'all' && (
          <Block label="Category :">
            <Chip
              size="small"
              label={filters.expenseCategory === 'subtrip' ? 'Job Expense' : 'Vehicle Expense'}
              onDelete={handleRemoveExpenseCategory}
            />
          </Block>
        )}
        {filters.expenseType && filters.expenseType.length > 0 && (
          <Block label="Expense Type :">
            {filters.expenseType.map((type) => (
              <Chip
                key={type}
                size="small"
                label={type}
                onDelete={() => handleRemoveExpenseType(type)}
              />
            ))}
          </Block>
        )}

        {filters.pumpId && (
          <Block label="Pump">
            <Chip
              size="small"
              label={selectedPumpName || filters.pumpId}
              onDelete={handleRemovePump}
            />
          </Block>
        )}

        {filters.vehicleType && (
          <Block label="Vehicle Type:">
            <Chip size="small" label={filters.vehicleType} onDelete={handleRemoveVehicleType} />
          </Block>
        )}

        {filters.tripId && (
          <Block label="Trip">
            <Chip
              size="small"
              label={selectedTripNo || filters.tripId}
              onDelete={handleRemoveTripId}
            />
          </Block>
        )}

        {filters.vehicleId && (
          <Block label="Vehicle:">
            <Chip
              size="small"
              label={selectedVehicleNo || filters.vehicleId}
              onDelete={handleRemoveVehicleNo}
            />
          </Block>
        )}

        {filters.subtripId && (
          <Block label="Job">
            <Chip
              size="small"
              label={selectedSubtripNo || filters.subtripId}
              onDelete={handleRemoveSubtrip}
            />
          </Block>
        )}

        {/* Route filter removed */}

        {filters.fromDate && filters.endDate && (
          <Block label="Date:">
            <Chip size="small" label={shortLabel} onDelete={handleRemoveDate} />
          </Block>
        )}

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
