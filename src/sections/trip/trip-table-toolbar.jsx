/* eslint-disable react/prop-types */
import { useCallback } from 'react';
// components

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { TABLE_COLUMNS } from './trip-table-config';
import TripFiltersDrawer from './trip-filters-drawer';
import { SUBTRIP_STATUS } from '../subtrip/constants';
import { fDateRangeShortLabel } from '../../utils/format-time';
import { KanbanDriverDialog } from '../kanban/components/kanban-driver-dialog';
import { KanbanVehicleDialog } from '../kanban/components/kanban-vehicle-dialog';
import { KanbanSubtripDialog } from '../kanban/components/kanban-subtrip-dialog';

// ----------------------------------------------------------------------

export default function TripTableToolbar({
  filters,
  onFilters,
  onApplyDateRange,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  selectedVehicle,
  onSelectVehicle,
  selectedDriver,
  onSelectDriver,
  selectedSubtrip,
  onSelectSubtrip,
  onResetColumns,
  canResetColumns,
}) {
  const columnsPopover = usePopover();
  const filtersDrawer = useBoolean();
  const vehicleDialog = useBoolean();
  const driverDialog = useBoolean();
  const subtripDialog = useBoolean();
  const dateDialog = useBoolean();

  const handleFilterTripNo = useCallback(
    (event) => {
      onFilters('tripNo', event.target.value);
    },
    [onFilters]
  );

  const handleSelectDriver = useCallback(
    (driver) => {
      if (onSelectDriver) onSelectDriver(driver);
      onFilters('driverId', driver ? driver._id : '');
    },
    [onFilters, onSelectDriver]
  );

  const handleSelectVehicle = useCallback(
    (vehicle) => {
      if (onSelectVehicle) onSelectVehicle(vehicle);
      onFilters('vehicleId', vehicle ? vehicle._id : '');
    },
    [onFilters, onSelectVehicle]
  );

  const handleSelectSubtrip = useCallback(
    (subtrip) => {
      if (onSelectSubtrip) onSelectSubtrip(subtrip);
      onFilters('subtripId', subtrip ? subtrip._id : '');
    },
    [onFilters, onSelectSubtrip]
  );

  const handleFilterFromDate = useCallback(
    (newValue) => {
      onFilters('fromDate', newValue);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      onFilters('toDate', newValue);
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
          value={filters.tripNo}
          onChange={handleFilterTripNo}
          placeholder="Search Trip No..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        <DialogSelectButton
          onClick={driverDialog.onTrue}
          placeholder="Driver"
          selected={selectedDriver?.driverName}
          iconName={APP_ICONS.driver}
          sx={{ maxWidth: { md: 200 } }}
        />

        <DialogSelectButton
          onClick={vehicleDialog.onTrue}
          placeholder="Vehicle"
          selected={selectedVehicle?.vehicleNo}
          iconName={APP_ICONS.vehicle}
          sx={{ maxWidth: { md: 200 } }}
        />

        <DialogSelectButton
          onClick={subtripDialog.onTrue}
          placeholder="Job"
          selected={selectedSubtrip?.subtripNo}
          iconName={APP_ICONS.job}
          sx={{ maxWidth: { md: 200 } }}
        />

        <DialogSelectButton
          onClick={dateDialog.onTrue}
          placeholder="Date Range"
          selected={
            filters.fromDate && filters.toDate
              ? fDateRangeShortLabel(filters.fromDate, filters.toDate)
              : undefined
          }
          iconName={APP_ICONS.calendar}
          sx={{ maxWidth: { md: 200 } }}
        />

        <Button
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="solar:filter-bold" />}
          onClick={filtersDrawer.onTrue}
          sx={{ flexShrink: 0 }}
        >
          More Filters
        </Button>

        {/* Removed 'Own' filter toggle as Trips won't be created for market vehicles */}

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

      <TripFiltersDrawer
        open={filtersDrawer.value}
        onClose={filtersDrawer.onFalse}
        filters={filters}
        onFilters={onFilters}
        driverDialog={driverDialog}
        vehicleDialog={vehicleDialog}
        subtripDialog={subtripDialog}
        dateDialog={dateDialog}
        selectedDriver={selectedDriver}
        selectedVehicle={selectedVehicle}
        selectedSubtrip={selectedSubtrip}
      />

      {/* Removed export popover */}

      <KanbanDriverDialog
        open={driverDialog.value}
        onClose={driverDialog.onFalse}
        selectedDriver={selectedDriver}
        onDriverChange={handleSelectDriver}
      />

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
          SUBTRIP_STATUS.BILLED,
          SUBTRIP_STATUS.ERROR,
        ]}
      />

      <CustomDateRangePicker
        variant="calendar"
        presets={DATE_RANGE_PRESETS}
        open={dateDialog.value}
        onClose={dateDialog.onFalse}
        startDate={filters.fromDate}
        endDate={filters.toDate}
        onChangeStartDate={handleFilterFromDate}
        onChangeEndDate={handleFilterEndDate}
        onApplyRange={onApplyDateRange}
      />
    </>
  );
}
