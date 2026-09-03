// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function DriverPayrollTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  selectedDriverName,
  selectedSubtripNo,
  ...other
}) {
  const handleRemoveDriver = () => {
    onFilters('driverId', '');
  };

  const handleRemoveSubtrip = () => {
    onFilters('subtripId', '');
  };

  const handleRemovePaymentId = () => {
    onFilters('paymentId', '');
  };

  const handleRemoveDate = () => {
    onFilters({ fromDate: null, endDate: null });
  };

  const handleRemoveBillingDate = () => {
    onFilters({ billingFromDate: null, billingToDate: null });
  };

  const shortLabel = fDateRangeShortLabel(filters.fromDate, filters.endDate);
  const billingShortLabel = fDateRangeShortLabel(filters.billingFromDate, filters.billingToDate);

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.driverId && (
          <Block label="Driver">
            <Chip
              size="small"
              label={selectedDriverName || filters.driverId}
              onDelete={handleRemoveDriver}
            />
          </Block>
        )}

        {filters.subtripId && (
          <Block label="Job:">
            <Chip
              size="small"
              label={selectedSubtripNo || filters.subtripId}
              onDelete={handleRemoveSubtrip}
            />
          </Block>
        )}

        {filters.paymentId && (
          <Block label="Driver Salary No:">
            <Chip size="small" label={filters.paymentId} onDelete={handleRemovePaymentId} />
          </Block>
        )}

        {filters.fromDate && filters.endDate && (
          <Block label="Date:">
            <Chip size="small" label={shortLabel} onDelete={handleRemoveDate} />
          </Block>
        )}

        {filters.billingFromDate && filters.billingToDate && (
          <Block label="Billing period:">
            <Chip size="small" label={billingShortLabel} onDelete={handleRemoveBillingDate} />
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
