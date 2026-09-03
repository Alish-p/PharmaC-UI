/* eslint-disable react/prop-types */
import { useCallback } from 'react';

// @mui
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button';

import { KanbanTransporterDialog } from 'src/sections/kanban/components/kanban-transporter-dialog';

import { useVehicleTypes } from './vehicle-config';

// ----------------------------------------------------------------------

export default function VehicleTableToolbar({
  filters,
  onFilters,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  selectedTransporter,
  onSelectTransporter,
  onResetColumns,
  canResetColumns,
  tableColumns,
  managesMarketVehicles,
}) {
  const columnsPopover = usePopover();
  const transporterDialog = useBoolean();
  const vehicleTypes = useVehicleTypes();

  const handleSelectTransporter = useCallback(
    (transporter) => {
      if (onSelectTransporter) {
        onSelectTransporter(transporter);
      }
      onFilters('transporter', transporter._id);
    },
    [onFilters, onSelectTransporter]
  );

  const handleFilterVehicleNo = useCallback(
    (event) => {
      onFilters('vehicleNo', event.target.value);
    },
    [onFilters]
  );

  const handleFilterVehicleType = useCallback(
    (event) => {
      onFilters('vehicleType', event.target.value);
    },
    [onFilters]
  );

  const handleFilterNoOfTyres = useCallback(
    (event) => {
      onFilters('noOfTyres', event.target.value);
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
          fullWidth
          value={filters.vehicleNo}
          onChange={handleFilterVehicleNo}
          placeholder="Search Vehicle No..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 300 } }}>
          <InputLabel id="vehicle-type-select-label">Vehicle Type</InputLabel>
          <Select
            value={filters.vehicleType || ''}
            onChange={handleFilterVehicleType}
            input={<OutlinedInput label="Vehicle Type" />}
            labelId="vehicle-type-select-label"
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          >
            <MenuItem value="">All</MenuItem>
            <Divider sx={{ borderStyle: 'dashed' }} />
            {vehicleTypes.map((option) => (
              <MenuItem key={option.key} value={option.key}>
                {option.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          type="number"
          value={filters.noOfTyres}
          onChange={handleFilterNoOfTyres}
          placeholder="Search No Of Tyres..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { xs: 1, md: 300 } }}
        />

        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel id="is-active-select-label">Status</InputLabel>
          <Select
            value={filters.isActive || ''}
            onChange={handleFilterIsActive}
            input={<OutlinedInput label="Status" />}
            labelId="is-active-select-label"
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
          </Select>
        </FormControl>

        {managesMarketVehicles && (
          <DialogSelectButton
            onClick={transporterDialog.onTrue}
            placeholder="Search transporter"
            selected={selectedTransporter?.transportName}
            iconName={APP_ICONS.vehicle}
          />
        )}

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
        TABLE_COLUMNS={tableColumns}
        visibleColumns={visibleColumns}
        disabledColumns={disabledColumns}
        handleToggleColumn={onToggleColumn}
        handleToggleAllColumns={onToggleAllColumns}
        onResetColumns={onResetColumns}
        canResetColumns={canResetColumns}
      />

      {/* Removed export popover */}

      {managesMarketVehicles && (
        <KanbanTransporterDialog
          open={transporterDialog.value}
          onClose={transporterDialog.onFalse}
          selectedTransporter={selectedTransporter}
          onTransporterChange={handleSelectTransporter}
        />
      )}
    </>
  );
}
