import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

export default function TransporterAdvanceTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  selectedTransporterName,
  selectedVehicleNo,
  selectedSubtripNo,
  selectedPumpName,
  ...other
}) {
  const handleRemoveTransporter = () => {
    onFilters('transporterId', '');
  };

  const handleRemoveVehicle = () => {
    onFilters('vehicleId', '');
  };

  const handleRemoveSubtrip = () => {
    onFilters('subtripId', '');
  };

  const handleRemovePump = () => {
    onFilters('pumpId', '');
  };

  const handleRemoveDate = () => {
    onFilters({ fromDate: null, endDate: null });
  };

  const handleRemoveAdvanceType = (typeToRemove) => {
    onFilters(
      'advanceType',
      (filters.advanceType || []).filter((type) => type !== typeToRemove)
    );
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
        {filters.status !== 'all' && (
          <Block label="Status :">
            <Chip size="small" label={filters.status} onDelete={() => onFilters('status', 'all')} />
          </Block>
        )}

        {filters.transporterId && (
          <Block label="Transporter:">
            <Chip
              size="small"
              label={selectedTransporterName || filters.transporterId}
              onDelete={handleRemoveTransporter}
            />
          </Block>
        )}

        {filters.vehicleId && (
          <Block label="Vehicle:">
            <Chip
              size="small"
              label={selectedVehicleNo || filters.vehicleId}
              onDelete={handleRemoveVehicle}
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

        {filters.pumpId && (
          <Block label="Pump:">
            <Chip
              size="small"
              label={selectedPumpName || filters.pumpId}
              onDelete={handleRemovePump}
            />
          </Block>
        )}

        {!!filters.advanceType?.length && (
          <Block label="Advance Type:">
            {filters.advanceType.map((type) => (
              <Chip
                key={type}
                size="small"
                label={type}
                onDelete={() => handleRemoveAdvanceType(type)}
              />
            ))}
          </Block>
        )}

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
