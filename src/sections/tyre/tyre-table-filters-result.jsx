/* eslint-disable react/prop-types */
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { ICONS } from 'src/assets/data/icons';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function TyreTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  selectedVehicleName,
  selectedTransporterName,
  ...other
}) {
  const handleRemoveSerialNumber = () => {
    onFilters('serialNumber', '');
  };

  const handleRemoveSoldTo = () => {
    onFilters('soldTo', '');
  };

  const handleRemoveBrand = () => {
    onFilters('brand', '');
  };

  const handleRemoveStatus = () => {
    onFilters('status', 'all');
  };

  const handleRemoveVehicle = () => {
    onFilters('vehicle', null);
  };

  const handleRemoveKm = () => {
    onFilters('minKm', null);
    onFilters('maxKm', null);
  };

  const handleRemoveThread = () => {
    onFilters('minThread', null);
    onFilters('maxThread', null);
  };

  const handleRemoveAttachment = () => {
    onFilters('attachmentStatus', '');
  };

  const handleRemoveLiveKmFreshness = () => {
    onFilters('liveKmFreshness', '');
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
        {filters.status !== 'all' && (
          <Block label="Status:">
            <Chip size="small" label={filters.status} onDelete={handleRemoveStatus} />
          </Block>
        )}

        {filters.serialNumber && (
          <Block label="Tyre Number:">
            <Chip size="small" label={filters.serialNumber} onDelete={handleRemoveSerialNumber} />
          </Block>
        )}

        {filters.soldTo && (
          <Block label="Sold To:">
            <Chip
              size="small"
              label={selectedTransporterName || 'Loading...'}
              onDelete={handleRemoveSoldTo}
            />
          </Block>
        )}

        {filters.brand && (
          <Block label="Brand:">
            <Chip size="small" label={filters.brand} onDelete={handleRemoveBrand} />
          </Block>
        )}

        {filters.model && (
          <Block label="Model:">
            <Chip size="small" label={filters.model} onDelete={() => onFilters('model', '')} />
          </Block>
        )}

        {filters.size && (
          <Block label="Size:">
            <Chip size="small" label={filters.size} onDelete={() => onFilters('size', '')} />
          </Block>
        )}

        {filters.category && (
          <Block label="Category:">
            <Chip
              size="small"
              label={filters.category}
              onDelete={() => onFilters('category', '')}
            />
          </Block>
        )}

        {filters.vehicle && (
          <Block label="Vehicle:">
            <Chip
              size="small"
              label={selectedVehicleName || filters.vehicle}
              onDelete={handleRemoveVehicle}
            />
          </Block>
        )}

        {filters.type.length > 0 && (
          <Block label="Type:">
            {filters.type.map((item) => (
              <Chip
                key={item}
                size="small"
                label={item}
                onDelete={() =>
                  onFilters(
                    'type',
                    filters.type.filter((v) => v !== item)
                  )
                }
              />
            ))}
          </Block>
        )}

        {(filters.minKm || filters.maxKm) && (
          <Block label="Odometer:">
            <Chip
              size="small"
              label={
                filters.minKm && filters.maxKm
                  ? `${filters.minKm} - ${filters.maxKm} km`
                  : filters.minKm
                    ? `> ${filters.minKm} km`
                    : `< ${filters.maxKm} km`
              }
              onDelete={handleRemoveKm}
            />
          </Block>
        )}
        {(filters.minThread || filters.maxThread) && (
          <Block label="Thread:">
            <Chip
              size="small"
              label={
                filters.minThread && filters.maxThread
                  ? `${filters.minThread} - ${filters.maxThread} mm`
                  : filters.minThread
                    ? `> ${filters.minThread} mm`
                    : `< ${filters.maxThread} mm`
              }
              onDelete={handleRemoveThread}
            />
          </Block>
        )}

        {filters.position && (
          <Block label="Position:">
            <Chip
              size="small"
              label={filters.position}
              onDelete={() => onFilters('position', '')}
            />
          </Block>
        )}

        {filters.attachmentStatus && (
          <Block label="Attachment:">
            <Chip
              size="small"
              label={
                filters.attachmentStatus === 'newlyAttached'
                  ? 'Newly Attached'
                  : filters.attachmentStatus === 'oldAttached'
                    ? 'Re-attached'
                    : 'Never Attached'
              }
              onDelete={handleRemoveAttachment}
            />
          </Block>
        )}

        {filters.liveKmFreshness && (
          <Block label="Live KM:">
            <Chip
              size="small"
              label={
                {
                  fresh: '< 3 Days',
                  warning: '3–10 Days',
                  stale: '> 10 Days',
                  unknown: 'Unknown',
                }[filters.liveKmFreshness] || filters.liveKmFreshness
              }
              onDelete={handleRemoveLiveKmFreshness}
            />
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon={ICONS.common.delete} />}
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
