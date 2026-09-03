/* eslint-disable react/prop-types */
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button';

import { TABLE_COLUMNS } from './work-order-table-config';
import WorkOrderFiltersDrawer from './work-order-filters-drawer';
import { KanbanPartsDialog } from '../kanban/components/kanban-parts-dialog';
import { KanbanVehicleDialog } from '../kanban/components/kanban-vehicle-dialog';
import { KanbanContactsDialog } from '../kanban/components/kanban-contacts-dialog';
import { WORK_ORDER_PRIORITY_OPTIONS, WORK_ORDER_CATEGORY_OPTIONS } from './work-order-config';

export default function WorkOrderTableToolbar({
  filters,
  onFilters,
  onApplyStartDateRange,
  onApplyEndDateRange,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  onResetColumns,
  canResetColumns,
  selectedVehicle,
  onSelectVehicle,
  selectedPart,
  onSelectPart,
  selectedCreatedBy,
  onSelectCreatedBy,
  selectedClosedBy,
  onSelectClosedBy,
  selectedIssueAssignee,
  onSelectIssueAssignee,
}) {
  const columnsPopover = usePopover();
  const filtersDrawer = useBoolean();

  const vehicleDialog = usePopover();
  const partDialog = usePopover();
  const createdByDialog = useBoolean();
  const closedByDialog = useBoolean();
  const issueAssigneeDialog = useBoolean();

  const handleFilterCategory = useCallback(
    (event, newValue) => {
      onFilters('category', newValue || 'all');
    },
    [onFilters]
  );

  const handleFilterWorkOrderNo = useCallback(
    (event) => {
      onFilters('workOrderNo', event.target.value);
    },
    [onFilters]
  );

  const handleSelectVehicle = useCallback(
    (vehicle) => {
      if (onSelectVehicle) {
        onSelectVehicle(vehicle || null);
      }
      vehicleDialog.onClose();
    },
    [onSelectVehicle, vehicleDialog]
  );

  const handleSelectPart = useCallback(
    (part) => {
      if (onSelectPart) {
        onSelectPart(part || null);
      }
      partDialog.onClose();
    },
    [onSelectPart, partDialog]
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

  const handleSelectClosedBy = useCallback(
    (assignees) => {
      const user = assignees[0];
      onFilters('closedBy', user?._id || '');
      if (onSelectClosedBy) onSelectClosedBy(user || null);
      closedByDialog.onFalse();
    },
    [onFilters, onSelectClosedBy, closedByDialog]
  );

  const handleSelectIssueAssignee = useCallback(
    (assignees) => {
      const user = assignees[0];
      onFilters('issueAssignee', user?._id || '');
      if (onSelectIssueAssignee) onSelectIssueAssignee(user || null);
      issueAssigneeDialog.onFalse();
    },
    [onFilters, onSelectIssueAssignee, issueAssigneeDialog]
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
        useFlexGap
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
          flexWrap: 'wrap',
        }}
      >
        <TextField
          fullWidth
          value={filters.workOrderNo}
          onChange={handleFilterWorkOrderNo}
          placeholder="WO No."
          sx={{ width: { xs: 1, md: 170 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Expense Status"
          value={filters.expenseAdded || ''}
          onChange={(event) => {
            onFilters('expenseAdded', event.target.value);
          }}
          sx={{ width: { xs: 1, md: 170 } }}
        >
          {[
            { value: 'true', label: 'Added', color: 'success' },
            { value: 'false', label: 'Not Added', color: 'error' },
          ].map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Label variant="soft" color={option.color}>
                {option.label}
              </Label>
            </MenuItem>
          ))}
        </TextField>

        <Autocomplete
          fullWidth
          options={WORK_ORDER_PRIORITY_OPTIONS}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          value={WORK_ORDER_PRIORITY_OPTIONS.find((opt) => opt.value === filters.priority) || null}
          onChange={(event, newValue) => {
            onFilters('priority', newValue?.value || 'all');
          }}
          renderInput={(params) => <TextField {...params} label="Priority" />}
          sx={{ width: { xs: 1, md: 200 } }}
        />

        <Autocomplete
          freeSolo
          options={WORK_ORDER_CATEGORY_OPTIONS}
          value={filters.category === 'all' ? '' : filters.category}
          onChange={handleFilterCategory}
          onInputChange={(event, newInputValue) => {
            handleFilterCategory(event, newInputValue);
          }}
          renderInput={(params) => <TextField {...params} label="Category" />}
          sx={{ width: { xs: 1, md: 200 } }}
        />

        <DialogSelectButton
          onClick={vehicleDialog.onOpen}
          selected={selectedVehicle?.vehicleNo}
          placeholder="Vehicle"
          iconName={APP_ICONS.vehicle}
          sx={{ width: { xs: 1, md: 150 } }}
        />

        <DialogSelectButton
          onClick={partDialog.onOpen}
          selected={selectedPart?.name}
          placeholder="Part"
          iconName={APP_ICONS.part}
          sx={{ width: { xs: 1, md: 150 } }}
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

      <WorkOrderFiltersDrawer
        open={filtersDrawer.value}
        onClose={filtersDrawer.onFalse}
        filters={filters}
        onFilters={onFilters}
        onApplyStartDateRange={onApplyStartDateRange}
        onApplyEndDateRange={onApplyEndDateRange}
        createdByDialog={createdByDialog}
        closedByDialog={closedByDialog}
        issueAssigneeDialog={issueAssigneeDialog}
        selectedCreatedBy={selectedCreatedBy}
        selectedClosedBy={selectedClosedBy}
        selectedIssueAssignee={selectedIssueAssignee}
        vehicleDialog={vehicleDialog}
        partDialog={partDialog}
        selectedVehicle={selectedVehicle}
        selectedPart={selectedPart}
      />

      <KanbanVehicleDialog
        open={Boolean(vehicleDialog.open)}
        onClose={vehicleDialog.onClose}
        selectedVehicle={selectedVehicle}
        onVehicleChange={handleSelectVehicle}
      />

      <KanbanPartsDialog
        open={Boolean(partDialog.open)}
        onClose={partDialog.onClose}
        selectedPart={selectedPart}
        onPartChange={handleSelectPart}
      />

      <KanbanContactsDialog
        assignees={selectedCreatedBy ? [selectedCreatedBy] : []}
        open={createdByDialog.value}
        onClose={createdByDialog.onFalse}
        onAssigneeChange={handleSelectCreatedBy}
        single
      />

      <KanbanContactsDialog
        assignees={selectedClosedBy ? [selectedClosedBy] : []}
        open={closedByDialog.value}
        onClose={closedByDialog.onFalse}
        onAssigneeChange={handleSelectClosedBy}
        single
      />

      <KanbanContactsDialog
        assignees={selectedIssueAssignee ? [selectedIssueAssignee] : []}
        open={issueAssigneeDialog.value}
        onClose={issueAssigneeDialog.onFalse}
        onAssigneeChange={handleSelectIssueAssignee}
        single
      />
    </>
  );
}
