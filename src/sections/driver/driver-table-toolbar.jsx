import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';

import { TABLE_COLUMNS } from './driver-table-config';

export default function DriverTableToolbar({
  filters,
  onFilters,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  onResetColumns,
  canResetColumns,
}) {
  const columnsPopover = usePopover();

  const handleFilterSearch = useCallback(
    (event) => {
      onFilters('search', event.target.value);
    },
    [onFilters]
  );

  const handleFilterDriverType = useCallback(
    (event) => {
      onFilters('driverType', event.target.value);
    },
    [onFilters]
  );

  const handleFilterIsActive = useCallback(
    (event) => {
      onFilters('isActive', event.target.value);
    },
    [onFilters]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}
          gap={2}
          sx={{ flexGrow: 1 }}
        >
          <TextField
            fullWidth
            value={filters.search}
            onChange={handleFilterSearch}
            placeholder="Search by Name or Mobile No..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            select
            label="Driver Type"
            value={filters.driverType || ''}
            onChange={handleFilterDriverType}
          >
            <MenuItem value="Own">
              <Label variant="soft" color="primary">
                Own
              </Label>
            </MenuItem>
            <MenuItem value="Market">
              <Label variant="soft" color="secondary">
                Market
              </Label>
            </MenuItem>
          </TextField>

          <TextField
            fullWidth
            select
            label="Active"
            value={filters.isActive || ''}
            onChange={handleFilterIsActive}
          >
            <MenuItem value="true">
              <Label variant="soft" color="success">
                Active
              </Label>
            </MenuItem>
            <MenuItem value="false">
              <Label variant="soft" color="error">
                In Active
              </Label>
            </MenuItem>
          </TextField>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            color="inherit"
            variant="outlined"
            onClick={columnsPopover.onOpen}
            startIcon={
              <Badge color="error" variant="dot" invisible={!canResetColumns}>
                <Iconify icon="solar:settings-bold" />
              </Badge>
            }
            sx={{ flexShrink: 0 }}
          >
            Columns
          </Button>

          {/* Removed export popover (moved to TableSelectedAction) */}
        </Stack>
      </Stack>

      <ColumnSelectorList
        open={Boolean(columnsPopover.open)}
        onClose={columnsPopover.onClose}
        TABLE_COLUMNS={TABLE_COLUMNS}
        visibleColumns={visibleColumns}
        disabledColumns={disabledColumns}
        handleToggleColumn={onToggleColumn}
        handleToggleAllColumns={onToggleAllColumns}
        onResetColumns={onResetColumns}
        canResetColumns={canResetColumns}
      />

      {/* Removed export popover */}
    </>
  );
}
