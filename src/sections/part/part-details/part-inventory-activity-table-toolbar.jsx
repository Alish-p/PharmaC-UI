/* eslint-disable react/prop-types */
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button';

import { ACTIVITY_TYPES } from '../part-constant';
import { INVENTORY_ACTIVITY_TABLE_COLUMNS } from './part-inventory-activity-table-config';

export default function PartInventoryActivityTableToolbar({
  filters,
  onFilters,
  locations,
  dateRangeLabel,
  onOpenDateDialog,
  performedByLabel,
  onOpenContactsDialog,
  onResetFilters,
  canReset,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  onResetColumns,
  canResetColumns,
}) {
  const columnsPopover = usePopover();

  const handleFilterType = useCallback(
    (event) => {
      onFilters('type', event.target.value);
    },
    [onFilters]
  );

  const handleFilterLocation = useCallback(
    (event) => {
      onFilters('inventoryLocation', event.target.value);
    },
    [onFilters]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          pb: 2.5,
          gap: 2,
        }}
      >
        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel id="type-select-label">Type</InputLabel>
          <Select
            value={filters.type || ''}
            onChange={handleFilterType}
            input={<OutlinedInput label="Type" />}
            labelId="type-select-label"
          >
            {ACTIVITY_TYPES.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Label variant="soft" color={opt.color}>
                  {opt.label}
                </Label>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Location"
          value={filters.inventoryLocation}
          onChange={handleFilterLocation}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All locations</MenuItem>
          {locations.map((loc) => (
            <MenuItem key={loc._id} value={loc._id}>
              {loc.name}
            </MenuItem>
          ))}
        </TextField>

        <DialogSelectButton
          onClick={onOpenContactsDialog}
          placeholder="Performed By"
          selected={performedByLabel !== 'All users' ? performedByLabel : null}
          iconName={APP_ICONS.users}
          sx={{ maxWidth: 200 }}
        />

        <Button
          variant="outlined"
          startIcon={<Iconify icon="mdi:calendar" />}
          onClick={onOpenDateDialog}
          sx={{ px: 2 }}
        >
          {dateRangeLabel}
        </Button>

        {canReset && (
          <Button
            variant="text"
            color="secondary"
            size="small"
            onClick={onResetFilters}
            startIcon={<Iconify icon="solar:restart-bold" />}
          >
            Reset filters
          </Button>
        )}

        <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
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
        TABLE_COLUMNS={INVENTORY_ACTIVITY_TABLE_COLUMNS}
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
