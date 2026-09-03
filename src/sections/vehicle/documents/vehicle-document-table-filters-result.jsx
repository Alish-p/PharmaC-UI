// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

export default function VehicleDocumentTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  selectedVehicleNo,
  onRemoveVehicle,
  ...other
}) {
  const handleRemoveStatus = () => {
    onFilters('status', 'all');
  };

  const handleRemoveDocType = () => {
    onFilters('docType', '');
  };

  const handleRemoveVehicle = () => {
    if (onRemoveVehicle) onRemoveVehicle();
    else onFilters('vehicleId', '');
  };

  const handleRemoveDocNumber = () => {
    onFilters('docNumber', '');
  };

  const handleRemoveIssuer = () => {
    onFilters('issuer', '');
  };

  const handleRemoveIssueRange = () => {
    onFilters('issueFrom', null);
    onFilters('issueTo', null);
  };

  const handleRemoveExpiryRange = () => {
    onFilters('expiryFrom', null);
    onFilters('expiryTo', null);
  };

  const handleRemoveHasAttachment = () => {
    onFilters('hasAttachment', '');
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results || 0}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.status && filters.status !== 'all' && (
          <Block label="Status:">
            <Chip
              size="small"
              label={`${filters.status.charAt(0).toUpperCase()}${filters.status.slice(1)}`}
              onDelete={handleRemoveStatus}
            />
          </Block>
        )}

        {filters.docType && (
          <Block label="Type:">
            <Chip size="small" label={filters.docType} onDelete={handleRemoveDocType} />
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

        {filters.docNumber && (
          <Block label="Doc No:">
            <Chip size="small" label={filters.docNumber} onDelete={handleRemoveDocNumber} />
          </Block>
        )}

        {filters.issuer && (
          <Block label="Issuer:">
            <Chip size="small" label={filters.issuer} onDelete={handleRemoveIssuer} />
          </Block>
        )}

        {filters.issueFrom && filters.issueTo && (
          <Block label="Issue Date:">
            <Chip
              size="small"
              label={fDateRangeShortLabel(filters.issueFrom, filters.issueTo)}
              onDelete={handleRemoveIssueRange}
            />
          </Block>
        )}

        {filters.expiryFrom && filters.expiryTo && (
          <Block label="Expiry Date:">
            <Chip
              size="small"
              label={fDateRangeShortLabel(filters.expiryFrom, filters.expiryTo)}
              onDelete={handleRemoveExpiryRange}
            />
          </Block>
        )}

        {filters.hasAttachment && (
          <Block label="Attachment:">
            <Chip
              size="small"
              label={filters.hasAttachment === 'yes' ? 'Has Attachment' : 'No Attachment'}
              onDelete={handleRemoveHasAttachment}
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

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{ p: 1, borderRadius: 1, overflow: 'hidden', borderStyle: 'dashed', ...sx }}
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
