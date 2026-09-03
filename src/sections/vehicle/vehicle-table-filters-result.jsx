// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function InvoiceTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  selectedTransporterName,
  onRemoveTransporter,
  ...other
}) {
  const handleRemoveVehicleType = () => {
    onFilters('vehicleType', '');
  };

  const handleRemoveTransorter = () => {
    if (onRemoveTransporter) {
      onRemoveTransporter();
    } else {
      onFilters('transporter', '');
    }
  };

  const handleRemoveVehicleNo = () => {
    onFilters('vehicleNo', '');
  };

  const handleRemoveNoOfTyres = () => {
    onFilters('noOfTyres', '');
  };

  const handleRemoveIsOwn = () => {
    onFilters('isOwn', 'all');
  };

  const handleRemoveIsActive = () => {
    onFilters('isActive', '');
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
        {filters.vehicleType && (
          <Block label="Vehicle Type :">
            <Chip size="small" label={filters.vehicleType} onDelete={handleRemoveVehicleType} />
          </Block>
        )}

        {filters.transporter && (
          <Block label="Transporter Company:">
            <Chip
              size="small"
              label={selectedTransporterName || filters.transporter}
              onDelete={handleRemoveTransorter}
            />
          </Block>
        )}

        {filters.vehicleNo && (
          <Block label="Vehicle No:">
            <Chip size="small" label={filters.vehicleNo} onDelete={handleRemoveVehicleNo} />
          </Block>
        )}

        {filters.noOfTyres && (
          <Block label="No Of Tyres:">
            <Chip size="small" label={filters.noOfTyres} onDelete={handleRemoveNoOfTyres} />
          </Block>
        )}

        {filters.isOwn && filters.isOwn !== 'all' && (
          <Block label="Vehicle Ownership:">
            <Chip
              size="small"
              label={filters.isOwn === 'market' ? 'Market Vehicles' : 'Own Vehicles'}
              onDelete={handleRemoveIsOwn}
            />
          </Block>
        )}

        {filters.isActive && (
          <Block label="Status:">
            <Chip
              size="small"
              label={filters.isActive === 'true' ? 'Active' : 'Inactive'}
              onDelete={handleRemoveIsActive}
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
