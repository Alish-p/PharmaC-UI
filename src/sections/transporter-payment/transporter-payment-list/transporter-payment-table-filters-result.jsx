// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { useSubtrip } from 'src/query/use-subtrip';
import { useVehicle } from 'src/query/use-vehicle';
import { useTransporter } from 'src/query/use-transporter';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function TransporterPayrollTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}) {
  const { data: transporter } = useTransporter(filters.transporterId);
  const { data: subtrip } = useSubtrip(filters.subtripId);
  const { data: vehicle } = useVehicle(filters.vehicleId);

  const handleRemovePaymentId = () => {
    onFilters('paymentId', '');
  };

  const handleRemoveTransporter = () => {
    onFilters('transporterId', '');
  };

  const handleRemoveSubtrip = () => {
    onFilters('subtripId', '');
  };

  const handleRemoveVehicle = () => {
    onFilters('vehicleId', '');
  };

  const handleRemoveDate = () => {
    onFilters({ issueFromDate: null, issueToDate: null });
  };

  const shortLabel = fDateRangeShortLabel(filters.issueFromDate, filters.issueToDate);

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.status !== 'all' && (
          <Block label="Status:">
            <Chip size="small" label={filters.status} onDelete={() => onFilters('status', 'all')} />
          </Block>
        )}

        {filters.transporterId && (
          <Block label="Transporter">
            <Chip
              size="small"
              label={transporter?.transportName || filters.transporterId}
              onDelete={handleRemoveTransporter}
            />
          </Block>
        )}

        {filters.subtripId && (
          <Block label="Job:">
            <Chip size="small" label={subtrip?.subtripNo} onDelete={handleRemoveSubtrip} />
          </Block>
        )}

        {filters.vehicleId && (
          <Block label="Vehicle:">
            <Chip
              size="small"
              label={vehicle?.vehicleNo || filters.vehicleId}
              onDelete={handleRemoveVehicle}
            />
          </Block>
        )}

        {filters.paymentId && (
          <Block label="Payment ID:">
            <Chip size="small" label={filters.paymentId} onDelete={handleRemovePaymentId} />
          </Block>
        )}

        {filters.issueFromDate && filters.issueToDate && (
          <Block label="Date:">
            <Chip size="small" label={shortLabel} onDelete={handleRemoveDate} />
          </Block>
        )}

        {filters.hasTds && (
          <Block label="TDS:">
            <Chip
              size="small"
              label={filters.hasTds === 'true' ? 'Yes' : 'No'}
              onDelete={() => onFilters('hasTds', '')}
            />
          </Block>
        )}

        {filters.hasGst && (
          <Block label="GST:">
            <Chip
              size="small"
              label={filters.hasGst === 'true' ? 'Yes' : 'No'}
              onDelete={() => onFilters('hasGst', '')}
            />
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
