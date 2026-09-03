import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { SUBTRIP_STATUS } from 'src/sections/subtrip/constants';
import { KanbanPumpDialog } from 'src/sections/kanban/components/kanban-pump-dialog';
import { KanbanSubtripDialog } from 'src/sections/kanban/components/kanban-subtrip-dialog';
import { KanbanVehicleDialog } from 'src/sections/kanban/components/kanban-vehicle-dialog';
import { KanbanTransporterDialog } from 'src/sections/kanban/components/kanban-transporter-dialog';
import {
  DEFAULT_SUBTRIP_EXPENSE_TYPES,
  DEFAULT_VEHICLE_EXPENSE_TYPES,
} from 'src/sections/expense/expense-config';

import { TABLE_COLUMNS } from '../transporter-advance-table-config';

const ADVANCE_TYPE_OPTIONS = Array.from(
  new Map(
    [...DEFAULT_SUBTRIP_EXPENSE_TYPES, ...DEFAULT_VEHICLE_EXPENSE_TYPES].map((type) => [
      type.label,
      type.label,
    ])
  ).values()
);

export default function TransporterAdvanceTableToolbar({
  filters,
  onFilters,
  onApplyDateRange,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  onResetColumns,
  canResetColumns,
  selectedTransporter,
  onSelectTransporter,
  selectedVehicle,
  onSelectVehicle,
  selectedSubtrip,
  onSelectSubtrip,
  selectedPump,
  onSelectPump,
}) {
  const columnsPopover = usePopover();
  const dateDialog = useBoolean();
  const transporterDialog = useBoolean();
  const vehicleDialog = useBoolean();
  const subtripDialog = useBoolean();
  const pumpDialog = useBoolean();

  const handleSelectTransporter = useCallback(
    (transporter) => {
      if (onSelectTransporter) onSelectTransporter(transporter);
      onFilters('transporterId', transporter?._id || '');
    },
    [onFilters, onSelectTransporter]
  );

  const handleSelectVehicle = useCallback(
    (vehicle) => {
      if (onSelectVehicle) onSelectVehicle(vehicle);
      onFilters('vehicleId', vehicle?._id || '');
    },
    [onFilters, onSelectVehicle]
  );

  const handleSelectSubtrip = useCallback(
    (subtrip) => {
      if (onSelectSubtrip) onSelectSubtrip(subtrip);
      onFilters('subtripId', subtrip?._id || '');
    },
    [onFilters, onSelectSubtrip]
  );

  const handleSelectPump = useCallback(
    (pump) => {
      if (onSelectPump) onSelectPump(pump);
      onFilters('pumpId', pump?._id || '');
    },
    [onFilters, onSelectPump]
  );

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

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
      >
        <DialogSelectButton
          onClick={transporterDialog.onTrue}
          selected={selectedTransporter?.transportName}
          placeholder="Transporter"
          iconName={APP_ICONS.transporter}
          sx={{ maxWidth: { md: 240 } }}
        />

        <DialogSelectButton
          onClick={vehicleDialog.onTrue}
          selected={selectedVehicle?.vehicleNo}
          placeholder="Vehicle"
          iconName={APP_ICONS.vehicle}
          sx={{ maxWidth: { md: 220 } }}
        />

        <DialogSelectButton
          onClick={subtripDialog.onTrue}
          selected={selectedSubtrip?.subtripNo}
          placeholder="Job"
          iconName={APP_ICONS.job}
          sx={{ maxWidth: { md: 220 } }}
        />

        <DialogSelectButton
          onClick={pumpDialog.onTrue}
          selected={selectedPump?.name}
          placeholder="Pump"
          iconName={APP_ICONS.pump}
          sx={{ maxWidth: { md: 220 } }}
        />

        <Autocomplete
          multiple
          disableCloseOnSelect
          options={ADVANCE_TYPE_OPTIONS}
          value={filters.advanceType || []}
          onChange={(event, newValue) => onFilters('advanceType', newValue)}
          renderInput={(params) => <TextField {...params} placeholder="Advance Type" />}
          renderOption={(props, option, { selected }) => (
            <li {...props} key={option}>
              <Checkbox size="small" disableRipple checked={selected} />
              {option}
            </li>
          )}
          sx={{ width: { xs: 1, md: 280 }, minWidth: { sm: 240 } }}
        />

        <DialogSelectButton
          sx={{ maxWidth: { md: 240 } }}
          placeholder="Date Range"
          selected={
            filters.fromDate && filters.endDate
              ? fDateRangeShortLabel(filters.fromDate, filters.endDate)
              : undefined
          }
          onClick={dateDialog.onTrue}
          iconName={APP_ICONS.calendar}
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
        </Stack>
      </Stack>

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

      <KanbanTransporterDialog
        open={transporterDialog.value}
        onClose={transporterDialog.onFalse}
        selectedTransporter={selectedTransporter}
        onTransporterChange={handleSelectTransporter}
      />

      <KanbanVehicleDialog
        open={vehicleDialog.value}
        onClose={vehicleDialog.onFalse}
        selectedVehicle={selectedVehicle}
        onVehicleChange={handleSelectVehicle}
        onlyMarket
      />

      <KanbanSubtripDialog
        open={subtripDialog.value}
        onClose={subtripDialog.onFalse}
        selectedSubtrip={selectedSubtrip}
        onSubtripChange={handleSelectSubtrip}
        excludeIsOwn
        statusList={[
          SUBTRIP_STATUS.IN_QUEUE,
          SUBTRIP_STATUS.LOADED,
          SUBTRIP_STATUS.RECEIVED,
          SUBTRIP_STATUS.BILLED,
          SUBTRIP_STATUS.ERROR,
        ]}
      />

      <KanbanPumpDialog
        open={pumpDialog.value}
        onClose={pumpDialog.onFalse}
        selectedPump={selectedPump}
        onPumpChange={handleSelectPump}
      />
    </>
  );
}
