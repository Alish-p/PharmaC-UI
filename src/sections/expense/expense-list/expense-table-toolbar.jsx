/* eslint-disable react/prop-types */
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
// @mui
// components

import { MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSystemFeatures } from 'src/hooks/use-system-features';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { APP_ICONS } from 'src/components/iconify/icons';
import { ColumnSelectorList } from 'src/components/table';
import { DialogSelectButton } from 'src/components/dialog-select-button';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { KanbanPumpDialog } from 'src/sections/kanban/components/kanban-pump-dialog';
import { KanbanTripDialog } from 'src/sections/kanban/components/kanban-trip-dialog';
import { KanbanVehicleDialog } from 'src/sections/kanban/components/kanban-vehicle-dialog';
import { KanbanSubtripDialog } from 'src/sections/kanban/components/kanban-subtrip-dialog';

import { TABLE_COLUMNS } from '../expense-table-config';
import { SUBTRIP_STATUS } from '../../subtrip/constants';

// ----------------------------------------------------------------------

export default function ExpenseTableToolbar({
  filters,
  onFilters,
  onApplyDateRange,
  subtripExpenseTypes,
  vehicleExpenseTypes,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  onResetColumns,
  canResetColumns,
  selectedVehicle,
  onSelectVehicle,
  selectedSubtrip,
  onSelectSubtrip,
  selectedPump,
  onSelectPump,
  selectedTrip,
  onSelectTrip,
}) {
  const columnsPopover = usePopover();
  const dateDialog = useBoolean();

  const { pumps: managesPumps } = useSystemFeatures();
  // removed unused tenant context

  const vehicleDialog = useBoolean();
  const pumpDialog = useBoolean();
  const tripDialog = useBoolean();
  const subtripDialog = useBoolean();
  // Route dialog removed
  const typePopover = usePopover();

  const handleSelectVehicle = useCallback(
    (vehicle) => {
      if (onSelectVehicle) onSelectVehicle(vehicle);
      onFilters('vehicleId', vehicle?._id || '');
    },
    [onFilters, onSelectVehicle]
  );

  const handleSelectPump = useCallback(
    (pump) => {
      if (onSelectPump) onSelectPump(pump);
      onFilters('pumpId', pump?._id || '');
    },
    [onFilters, onSelectPump]
  );

  const handleSelectTrip = useCallback(
    (trip) => {
      if (onSelectTrip) onSelectTrip(trip);
      onFilters('tripId', trip?._id || '');
    },
    [onFilters, onSelectTrip]
  );

  const handleSelectSubtrip = useCallback(
    (subtrip) => {
      if (onSelectSubtrip) onSelectSubtrip(subtrip);
      onFilters('subtripId', subtrip?._id || '');
    },
    [onFilters, onSelectSubtrip]
  );

  // Route selection removed

  const handleFilterFromDate = useCallback(
    (newValue) => {
      onFilters('fromDate', newValue);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      onFilters('endDate', newValue);
    },
    [onFilters]
  );

  const handleToggleExpenseType = useCallback(
    (value) => {
      const current = Array.isArray(filters.expenseType) ? [...filters.expenseType] : [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onFilters('expenseType', newValues);
    },
    [filters.expenseType, onFilters]
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
        <DialogSelectButton
          onClick={vehicleDialog.onTrue}
          selected={selectedVehicle?.vehicleNo}
          placeholder="Vehicle"
          iconName={APP_ICONS.vehicle}
          sx={{ maxWidth: { md: 200 } }}
        />

        <DialogSelectButton
          onClick={subtripDialog.onTrue}
          selected={selectedSubtrip?.subtripNo}
          placeholder="Job"
          iconName={APP_ICONS.job}
          sx={{ maxWidth: { md: 200 } }}
        />

        {managesPumps && (
          <DialogSelectButton
            onClick={pumpDialog.onTrue}
            selected={selectedPump?.name}
            placeholder="Pump"
            iconName={APP_ICONS.pump}
            sx={{ maxWidth: { md: 200 } }}
          />
        )}

        <DialogSelectButton
          onClick={tripDialog.onTrue}
          selected={selectedTrip?.tripNo}
          placeholder="Trip"
          iconName={APP_ICONS.trip}
          sx={{ maxWidth: { md: 200 } }}
        />

        {/* Route filter removed */}

        <DialogSelectButton
          sx={{ maxWidth: { md: 200 } }}
          placeholder="Date Range"
          selected={
            filters.fromDate && filters.endDate
              ? fDateRangeShortLabel(filters.fromDate, filters.endDate)
              : undefined
          }
          onClick={dateDialog.onTrue}
          iconName={APP_ICONS.calendar}
        />
        <CustomDateRangePicker
          variant="calendar"
          presets={DATE_RANGE_PRESETS}
          open={dateDialog.value}
          onClose={dateDialog.onFalse}
          startDate={filters.fromDate}
          endDate={filters.endDate}
          onChangeStartDate={handleFilterFromDate}
          onChangeEndDate={handleFilterEndDate}
          onApplyRange={onApplyDateRange}
        />

        <DialogSelectButton
          onClick={typePopover.onOpen}
          selected={
            filters.expenseType.length > 0 ? `${filters.expenseType.length} types` : undefined
          }
          placeholder="Expense Type"
          iconName="mdi:filter-variant"
          sx={{ maxWidth: { md: 200 } }}
        />

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

      <CustomPopover
        open={typePopover.open}
        onClose={typePopover.onClose}
        anchorEl={typePopover.anchorEl}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <Scrollbar sx={{ width: 200, maxHeight: 400 }}>
          <MenuList>
            {[...subtripExpenseTypes, ...vehicleExpenseTypes].map((option) => (
              <MenuItem key={option.label} onClick={() => handleToggleExpenseType(option.label)}>
                <Checkbox checked={filters.expenseType.includes(option.label)} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </MenuList>
        </Scrollbar>
      </CustomPopover>

      {/* Removed export popover */}

      <KanbanVehicleDialog
        open={vehicleDialog.value}
        onClose={vehicleDialog.onFalse}
        selectedVehicle={selectedVehicle}
        onVehicleChange={handleSelectVehicle}
        onlyOwn
      />

      <KanbanSubtripDialog
        open={subtripDialog.value}
        onClose={subtripDialog.onFalse}
        selectedSubtrip={selectedSubtrip}
        onSubtripChange={handleSelectSubtrip}
        excludeIsMarket
        statusList={[
          SUBTRIP_STATUS.IN_QUEUE,
          SUBTRIP_STATUS.LOADED,
          SUBTRIP_STATUS.RECEIVED,
          SUBTRIP_STATUS.ERROR,
          SUBTRIP_STATUS.BILLED,
        ]}
      />

      {managesPumps && (
        <KanbanPumpDialog
          open={pumpDialog.value}
          onClose={pumpDialog.onFalse}
          selectedPump={selectedPump}
          onPumpChange={handleSelectPump}
        />
      )}

      {/* Route dialog removed */}

      <KanbanTripDialog
        open={tripDialog.value}
        onClose={tripDialog.onFalse}
        selectedTrip={selectedTrip}
        onTripChange={handleSelectTrip}
        status={['open', 'closed']}
      />
    </>
  );
}
