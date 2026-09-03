/* eslint-disable react/prop-types */
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';
// components

import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { SUBTRIP_STATUS } from 'src/sections/subtrip/constants';
import { KanbanDriverDialog } from 'src/sections/kanban/components/kanban-driver-dialog';
import { KanbanSubtripDialog } from 'src/sections/kanban/components/kanban-subtrip-dialog';

import { TABLE_COLUMNS } from './driver-payroll-table-config';

// ----------------------------------------------------------------------

export default function DriverPayrollTableToolbar({
  filters,
  onFilters,
  onApplyDateRange,
  onApplyBillingDateRange,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  onResetColumns,
  canResetColumns,
  selectedDriver,
  onSelectDriver,
  selectedSubtrip,
  onSelectSubtrip,
}) {
  const columnsPopover = usePopover();
  const driverDialogOpen = useBoolean();
  const subtripDialogOpen = useBoolean();
  const dateDialog = useBoolean();
  const billingDateDialog = useBoolean();

  const handleFilterPaymentId = useCallback(
    (event) => {
      onFilters('paymentId', event.target.value);
    },
    [onFilters]
  );

  const handleFilterDriverName = useCallback(
    (driver) => {
      if (onSelectDriver) onSelectDriver(driver);
      onFilters('driverId', driver ? driver._id : '');
    },
    [onFilters, onSelectDriver]
  );

  const handleFilterSubtrip = useCallback(
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
      onFilters('endDate', newValue);
    },
    [onFilters]
  );

  const handleFilterBillingFromDate = useCallback(
    (newValue) => {
      onFilters('billingFromDate', newValue);
    },
    [onFilters]
  );

  const handleFilterBillingEndDate = useCallback(
    (newValue) => {
      onFilters('billingToDate', newValue);
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
          value={filters.paymentId || ''}
          onChange={handleFilterPaymentId}
          placeholder="Driver Salary No"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        <DialogSelectButton
          onClick={driverDialogOpen.onTrue}
          placeholder="Driver"
          selected={selectedDriver?.driverName}
          iconName={APP_ICONS.driver}
        />

        <DialogSelectButton
          onClick={subtripDialogOpen.onTrue}
          placeholder="Job"
          selected={selectedSubtrip?.subtripNo}
          iconName={APP_ICONS.job}
        />

        <DialogSelectButton
          onClick={dateDialog.onTrue}
          placeholder="Issue date range"
          selected={
            filters.fromDate && filters.endDate
              ? `${fDateRangeShortLabel(filters.fromDate, filters.endDate)}`
              : undefined
          }
          iconName={APP_ICONS.calendar}
        />

        <DialogSelectButton
          onClick={billingDateDialog.onTrue}
          placeholder="Billing period"
          selected={
            filters.billingFromDate && filters.billingToDate
              ? `${fDateRangeShortLabel(filters.billingFromDate, filters.billingToDate)}`
              : undefined
          }
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
      {driverDialogOpen.value && (
        <KanbanDriverDialog
          open={driverDialogOpen.value}
          onClose={driverDialogOpen.onFalse}
          onDriverChange={handleFilterDriverName}
          selectedDriver={selectedDriver}
        />
      )}

      {subtripDialogOpen.value && (
        <KanbanSubtripDialog
          open={subtripDialogOpen.value}
          onClose={subtripDialogOpen.onFalse}
          onSubtripChange={handleFilterSubtrip}
          selectedSubtrip={selectedSubtrip}
          statusList={Object.values(SUBTRIP_STATUS)}
          excludeIsMarket
        />
      )}

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

      <CustomDateRangePicker
        variant="calendar"
        presets={DATE_RANGE_PRESETS}
        open={billingDateDialog.value}
        onClose={billingDateDialog.onFalse}
        startDate={filters.billingFromDate}
        endDate={filters.billingToDate}
        onChangeStartDate={handleFilterBillingFromDate}
        onChangeEndDate={handleFilterBillingEndDate}
        onApplyRange={onApplyBillingDateRange}
      />
    </>
  );
}
