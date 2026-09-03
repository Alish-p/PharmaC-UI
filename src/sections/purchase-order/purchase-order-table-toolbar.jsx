/* eslint-disable react/prop-types */
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { TABLE_COLUMNS } from './purchase-order-table-config';
import PurchaseOrderFiltersDrawer from './purchase-order-filters-drawer';
import { KanbanPartsDialog } from '../kanban/components/kanban-parts-dialog';
import { KanbanVendorDialog } from '../kanban/components/kanban-vendor-dialog';
import { KanbanContactsDialog } from '../kanban/components/kanban-contacts-dialog';

export default function PurchaseOrderTableToolbar({
  filters,
  onFilters,
  onApplyDateRange,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  onResetColumns,
  canResetColumns,
  selectedPart,
  onSelectPart,
  selectedVendor,
  onSelectVendor,
  selectedCreatedBy,
  onSelectCreatedBy,
  selectedApprovedBy,
  onSelectApprovedBy,
}) {
  const columnsPopover = usePopover();
  const filtersDrawer = useBoolean();
  const partDialog = usePopover();
  const vendorDialog = useBoolean();
  const dateRange = useBoolean();
  const createdByDialog = useBoolean();
  const approvedByDialog = useBoolean();

  const handleSelectPart = useCallback(
    (part) => {
      if (onSelectPart) {
        onSelectPart(part || null);
      }
      partDialog.onClose();
    },
    [onSelectPart, partDialog]
  );

  const handleSelectVendor = useCallback(
    (vendor) => {
      onFilters('vendorId', vendor?._id || '');
      if (onSelectVendor) {
        onSelectVendor(vendor || null);
      }
    },
    [onFilters, onSelectVendor]
  );

  const handleSelectCreatedBy = useCallback(
    (assignees) => {
      const user = assignees[0];
      onFilters('createdBy', user?._id || '');
      if (onSelectCreatedBy) onSelectCreatedBy(user || null);
      createdByDialog.onFalse();
    },
    [onFilters, onSelectCreatedBy, createdByDialog]
  );

  const handleSelectApprovedBy = useCallback(
    (assignees) => {
      const user = assignees[0];
      onFilters('approvedBy', user?._id || '');
      if (onSelectApprovedBy) onSelectApprovedBy(user || null);
      approvedByDialog.onFalse();
    },
    [onFilters, onSelectApprovedBy, approvedByDialog]
  );



  const handleFilterPurchaseOrderNo = useCallback(
    (event) => {
      onFilters('purchaseOrderNo', event.target.value);
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
          value={filters.purchaseOrderNo || ''}
          onChange={handleFilterPurchaseOrderNo}
          placeholder="Purchase Order No."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <DialogSelectButton
          onClick={vendorDialog.onTrue}
          selected={selectedVendor?.name}
          placeholder="Vendor"
          iconName={APP_ICONS.customer}
          sx={{ maxWidth: 260 }}
        />

        <DialogSelectButton
          onClick={partDialog.onOpen}
          selected={selectedPart?.name}
          placeholder="Part"
          iconName={APP_ICONS.part}
          sx={{ maxWidth: 260 }}
        />

        <DialogSelectButton
          onClick={dateRange.onTrue}
          selected={
            filters.fromDate && filters.toDate
              ? fDateRangeShortLabel(filters.fromDate, filters.toDate)
              : undefined
          }
          placeholder="Date Range"
          iconName={APP_ICONS.calendar}
          sx={{ maxWidth: 260 }}
        />

        <Button
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="solar:filter-bold" />}
          onClick={filtersDrawer.onTrue}
          sx={{ flexShrink: 0 }}
        >
          Filters
        </Button>

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

      <KanbanPartsDialog
        open={Boolean(partDialog.open)}
        onClose={partDialog.onClose}
        selectedPart={selectedPart}
        onPartChange={handleSelectPart}
      />

      <KanbanVendorDialog
        open={vendorDialog.value}
        onClose={vendorDialog.onFalse}
        selectedVendor={selectedVendor}
        onVendorChange={handleSelectVendor}
      />

      <CustomDateRangePicker
        variant="calendar"
        presets={DATE_RANGE_PRESETS}
        open={dateRange.value}
        onClose={dateRange.onFalse}
        startDate={filters.fromDate}
        endDate={filters.toDate}
        onChangeStartDate={(date) => onFilters('fromDate', date)}
        onChangeEndDate={(date) => onFilters('toDate', date)}
        onApplyRange={onApplyDateRange}
      />

      <KanbanContactsDialog
        assignees={selectedCreatedBy ? [selectedCreatedBy] : []}
        open={createdByDialog.value}
        onClose={createdByDialog.onFalse}
        onAssigneeChange={handleSelectCreatedBy}
        single
      />

      <KanbanContactsDialog
        assignees={selectedApprovedBy ? [selectedApprovedBy] : []}
        open={approvedByDialog.value}
        onClose={approvedByDialog.onFalse}
        onAssigneeChange={handleSelectApprovedBy}
        single
      />



      <PurchaseOrderFiltersDrawer
        open={filtersDrawer.value}
        onClose={filtersDrawer.onFalse}
        filters={filters}
        onFilters={onFilters}
        vendorDialog={vendorDialog}
        partDialog={partDialog}
        dateRange={dateRange}
        createdByDialog={createdByDialog}
        approvedByDialog={approvedByDialog}
        selectedVendor={selectedVendor}
        selectedPart={selectedPart}
        selectedCreatedBy={selectedCreatedBy}
        selectedApprovedBy={selectedApprovedBy}
      />
    </>
  );
}
