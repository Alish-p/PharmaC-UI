/* eslint-disable react/prop-types */
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

import { STATES } from '../customer/config';
// types

// ----------------------------------------------------------------------

export default function TransportTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  selectedVehicleNo,
  ...other
}) {
  const handleRemoveSearch = () => {
    onFilters('search', '');
  };

  const handleRemoveVehicleId = () => {
    onFilters('vehicleId', '');
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.search && (
          <Block label="Search:">
            <Chip size="small" label={filters.search} onDelete={handleRemoveSearch} />
          </Block>
        )}

        {filters.status && filters.status !== 'all' && (
          <Block label="Status:">
            <Chip size="small" label={filters.status} onDelete={() => onFilters('status', 'all')} />
          </Block>
        )}

        {(filters.vehicleCountMin || filters.vehicleCountMax) && (
          <Block label="Vehicles:">
            <Chip
              size="small"
              label={
                filters.vehicleCountMin && filters.vehicleCountMax
                  ? `${filters.vehicleCountMin} – ${filters.vehicleCountMax}`
                  : filters.vehicleCountMin
                    ? `≥ ${filters.vehicleCountMin}`
                    : `≤ ${filters.vehicleCountMax}`
              }
              onDelete={() => {
                onFilters('vehicleCountMin', '');
                onFilters('vehicleCountMax', '');
              }}
            />
          </Block>
        )}

        {filters.state && (
          <Block label="State:">
            <Chip
              size="small"
              label={STATES.find((s) => s.value === filters.state)?.label || filters.state}
              onDelete={() => onFilters('state', '')}
            />
          </Block>
        )}

        {filters.paymentMode && (
          <Block label="Payment Mode:">
            <Chip
              size="small"
              label={filters.paymentMode}
              onDelete={() => onFilters('paymentMode', '')}
            />
          </Block>
        )}

        {filters.gstEnabled && (
          <Block label="GST Enabled:">
            <Chip
              size="small"
              label={filters.gstEnabled === 'true' ? 'Yes' : 'No'}
              onDelete={() => onFilters('gstEnabled', '')}
            />
          </Block>
        )}

        {filters.gstNo && (
          <Block label="GST No:">
            <Chip size="small" label={filters.gstNo} onDelete={() => onFilters('gstNo', '')} />
          </Block>
        )}

        {filters.panNo && (
          <Block label="PAN No:">
            <Chip size="small" label={filters.panNo} onDelete={() => onFilters('panNo', '')} />
          </Block>
        )}

        {filters.vehicleId && (
          <Block label="Vehicle:">
            <Chip
              size="small"
              label={selectedVehicleNo || filters.vehicleId}
              onDelete={handleRemoveVehicleId}
            />
          </Block>
        )}

        {filters.inactiveDays && (
          <Block label="No trips in:">
            <Chip
              size="small"
              label={`${filters.inactiveDays} days`}
              onDelete={() => onFilters('inactiveDays', '')}
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
