/* eslint-disable react/prop-types */
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { useCustomersSummary } from 'src/query/use-customer';

import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button';
// @mui
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { SUBTRIP_STATUS } from 'src/sections/subtrip/constants';
import { KanbanSubtripDialog } from 'src/sections/kanban/components/kanban-subtrip-dialog';
import { KanbanCustomerDialog } from 'src/sections/kanban/components/kanban-customer-dialog';

import { TABLE_COLUMNS } from '../invoice-table-config';

// ----------------------------------------------------------------------

export default function InvoiceTableToolbar({
  filters,
  onFilters,
  onApplyDateRange,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  selectedSubtrip,
  onSelectSubtrip,
  onResetColumns,
  canResetColumns,
}) {
  const columnsPopover = usePopover();
  const customerDialog = useBoolean();
  const subtripDialog = useBoolean();
  const dateDialog = useBoolean();
  const { data: customers = [] } = useCustomersSummary();

  const selectedCustomer = customers.find((c) => c._id === filters.customerId);

  const handleSelectCustomer = useCallback(
    (customer) => {
      onFilters('customerId', customer._id);
    },
    [onFilters]
  );

  const handleSelectSubtrip = useCallback(
    (subtrip) => {
      if (onSelectSubtrip) onSelectSubtrip(subtrip);
      onFilters('subtripId', subtrip ? subtrip._id : '');
    },
    [onFilters, onSelectSubtrip]
  );

  const handleFilterInvoiceNo = useCallback(
    (event) => {
      onFilters('invoiceNo', event.target.value);
    },
    [onFilters]
  );

  const handleChangeStartDate = useCallback(
    (date) => {
      onFilters('fromDate', date);
    },
    [onFilters]
  );

  const handleChangeEndDate = useCallback(
    (date) => {
      onFilters('endDate', date);
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
          value={filters.invoiceNo}
          onChange={handleFilterInvoiceNo}
          placeholder="Invoice No"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <DialogSelectButton
          onClick={customerDialog.onTrue}
          placeholder="Search customer"
          selected={selectedCustomer?.customerName}
          iconName={APP_ICONS.customer}
        />

        <DialogSelectButton
          onClick={subtripDialog.onTrue}
          placeholder="Search job"
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

      <KanbanCustomerDialog
        open={customerDialog.value}
        onClose={customerDialog.onFalse}
        selectedCustomer={selectedCustomer}
        onCustomerChange={handleSelectCustomer}
      />

      <KanbanSubtripDialog
        open={subtripDialog.value}
        onClose={subtripDialog.onFalse}
        selectedSubtrip={selectedSubtrip}
        onSubtripChange={handleSelectSubtrip}
        statusList={[SUBTRIP_STATUS.BILLED]}
      />

      <CustomDateRangePicker
        variant="calendar"
        presets={DATE_RANGE_PRESETS}
        open={dateDialog.value}
        onClose={dateDialog.onFalse}
        startDate={filters.fromDate}
        endDate={filters.endDate}
        onChangeStartDate={handleChangeStartDate}
        onChangeEndDate={handleChangeEndDate}
        onApplyRange={onApplyDateRange}
      />
    </>
  );
}
