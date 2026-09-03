// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function LoansTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}) {
  const handleRemoveLoanStatus = () => {
    onFilters('loanStatus', 'all');
  };

  const handleRemoveDriver = () => {
    onFilters('driverId', '');
    onFilters('driverName', '');
  };

  const handleRemoveTransporter = () => {
    onFilters('transporterId', '');
    onFilters('transporterName', '');
  };

  const handleRemoveLoanNo = () => {
    onFilters('loanNo', '');
  };

  const handleRemoveLoanReason = () => {
    onFilters('loanReason', '');
  };

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
        {filters.loanStatus !== 'all' && (
          <Block label="Status:">
            <Chip size="small" label={filters.loanStatus} onDelete={handleRemoveLoanStatus} />
          </Block>
        )}

        {filters.loanNo && (
          <Block label="Loan No:">
            <Chip size="small" label={filters.loanNo} onDelete={handleRemoveLoanNo} />
          </Block>
        )}

        {filters.driverName && (
          <Block label="Driver:">
            <Chip size="small" label={filters.driverName} onDelete={handleRemoveDriver} />
          </Block>
        )}

        {filters.transporterName && (
          <Block label="Transporter:">
            <Chip size="small" label={filters.transporterName} onDelete={handleRemoveTransporter} />
          </Block>
        )}

        {filters.loanReason && (
          <Block label="Reason:">
            <Chip size="small" label={filters.loanReason} onDelete={handleRemoveLoanReason} />
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
