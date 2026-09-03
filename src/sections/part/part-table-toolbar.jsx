/* eslint-disable react/prop-types */
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';

import { TABLE_COLUMNS } from './part-table-config';
import { PART_CATEGORIES, PART_MANUFACTURERS } from './part-constant';

const STOCK_STATUS_OPTIONS = [
  { value: 'inStock', label: 'In stock', color: 'success' },
  { value: 'lowStock', label: 'Low stock', color: 'warning' },
  { value: 'outOfStock', label: 'Out Of Stock', color: 'error' },
];

export default function PartTableToolbar({
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

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <TextField
          value={filters.search}
          onChange={handleFilterSearch}
          placeholder="Search by name, number..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: 1, md: 220 } }}
        />

        <Autocomplete
          freeSolo
          options={PART_CATEGORIES}
          value={filters.category === 'all' ? '' : filters.category}
          onChange={(event, newValue) => {
            onFilters('category', newValue || 'all');
          }}
          onInputChange={(event, newInputValue, reason) => {
            if (reason === 'clear') {
              onFilters('category', 'all');
            } else if (newInputValue) {
              onFilters('category', newInputValue);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Category" placeholder="e.g. Brakes" />
          )}
          sx={{ width: { xs: 1, md: 220 } }}
        />

        <Autocomplete
          freeSolo
          options={PART_MANUFACTURERS}
          value={filters.manufacturer === 'all' ? '' : filters.manufacturer}
          onChange={(event, newValue) => {
            onFilters('manufacturer', newValue || 'all');
          }}
          onInputChange={(event, newInputValue, reason) => {
            if (reason === 'clear') {
              onFilters('manufacturer', 'all');
            } else if (newInputValue) {
              onFilters('manufacturer', newInputValue);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Manufacturer" placeholder="e.g. Bosch" />
          )}
          sx={{ width: { xs: 1, md: 220 } }}
        />

        <TextField
          select
          label="Stock Status"
          value={filters.status || ''}
          onChange={(event) => {
            onFilters('status', event.target.value);
          }}
          sx={{ width: { xs: 1, md: 220 } }}
        >
          {STOCK_STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Label variant="soft" color={option.color}>
                {option.label}
              </Label>
            </MenuItem>
          ))}
        </TextField>

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
    </>
  );
}
