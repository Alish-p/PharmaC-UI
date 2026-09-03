/* eslint-disable react/prop-types */
import { useCallback } from 'react';

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

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { KanbanVehicleDialog } from 'src/sections/kanban/components/kanban-vehicle-dialog';

import { DOC_TYPES } from './vehicle-document-config';
import { TABLE_COLUMNS } from './vehicle-document-table-config';

export default function VehicleDocumentTableToolbar({
  filters,
  onFilters,
  onApplyIssueDateRange,
  onApplyExpiryDateRange,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  selectedVehicle,
  onSelectVehicle,
  onResetColumns,
  canResetColumns,
}) {
  const columnsPopover = usePopover();
  const issueDateDialog = useBoolean();
  const expiryDateDialog = useBoolean();
  const vehicleDialog = useBoolean();

  const handleFilterDocNumber = useCallback(
    (event) => {
      onFilters('docNumber', event.target.value);
    },
    [onFilters]
  );

  const handleFilterIssuer = useCallback(
    (event) => {
      onFilters('issuer', event.target.value);
    },
    [onFilters]
  );

  const handleFilterDocType = useCallback(
    (event) => {
      onFilters('docType', event.target.value);
    },
    [onFilters]
  );

  const handleChangeIssueFromDate = useCallback(
    (date) => {
      onFilters('issueFrom', date);
    },
    [onFilters]
  );

  const handleChangeIssueToDate = useCallback(
    (date) => {
      onFilters('issueTo', date);
    },
    [onFilters]
  );

  const handleChangeExpiryFromDate = useCallback(
    (date) => {
      onFilters('expiryFrom', date);
    },
    [onFilters]
  );

  const handleChangeExpiryToDate = useCallback(
    (date) => {
      onFilters('expiryTo', date);
    },
    [onFilters]
  );

  const handleSelectVehicle = useCallback(
    (vehicle) => {
      if (onSelectVehicle) onSelectVehicle(vehicle);
      onFilters('vehicleId', vehicle?._id || '');
    },
    [onFilters, onSelectVehicle]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
      >
        <TextField
          fullWidth
          value={filters.docNumber}
          onChange={handleFilterDocNumber}
          placeholder="Document No"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          value={filters.issuer}
          onChange={handleFilterIssuer}
          placeholder="Issuer"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { xs: 1, md: 240 } }}
        />

        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 220 } }}>
          <InputLabel id="doc-type-select-label">Doc Type</InputLabel>
          <Select
            value={filters.docType || ''}
            onChange={handleFilterDocType}
            input={<OutlinedInput label="Doc Type" />}
            labelId="doc-type-select-label"
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          >
            <MenuItem value="">All</MenuItem>
            <Divider sx={{ borderStyle: 'dashed' }} />
            {DOC_TYPES.map((type) => (
              <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 180 } }}>
          <InputLabel id="attachment-select-label">Attachment</InputLabel>
          <Select
            value={filters.hasAttachment || ''}
            onChange={(event) => onFilters('hasAttachment', event.target.value)}
            input={<OutlinedInput label="Attachment" />}
            labelId="attachment-select-label"
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          >
            <MenuItem value="">All</MenuItem>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <MenuItem value="yes">
              <Label variant="soft" color="success">
                Yes
              </Label>
            </MenuItem>
            <MenuItem value="no">
              <Label variant="soft" color="error">
                No
              </Label>
            </MenuItem>
          </Select>
        </FormControl>

        <DialogSelectButton
          onClick={vehicleDialog.onTrue}
          placeholder="Search vehicle"
          selected={selectedVehicle?.vehicleNo}
          iconName={APP_ICONS.vehicle}
        />

        <DialogSelectButton
          onClick={issueDateDialog.onTrue}
          placeholder="Issue date range"
          selected={
            filters.issueFrom && filters.issueTo
              ? `${fDateRangeShortLabel(filters.issueFrom, filters.issueTo)}`
              : undefined
          }
          iconName={APP_ICONS.calendar}
        />

        <DialogSelectButton
          onClick={expiryDateDialog.onTrue}
          placeholder="Expiry date range"
          selected={
            filters.expiryFrom && filters.expiryTo
              ? `${fDateRangeShortLabel(filters.expiryFrom, filters.expiryTo)}`
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

      <KanbanVehicleDialog
        open={vehicleDialog.value}
        onClose={vehicleDialog.onFalse}
        selectedVehicle={selectedVehicle}
        onVehicleChange={handleSelectVehicle}
        onlyOwn
      />

      <CustomDateRangePicker
        variant="calendar"
        presets={DATE_RANGE_PRESETS}
        open={issueDateDialog.value}
        onClose={issueDateDialog.onFalse}
        startDate={filters.issueFrom}
        endDate={filters.issueTo}
        onChangeStartDate={handleChangeIssueFromDate}
        onChangeEndDate={handleChangeIssueToDate}
        onApplyRange={onApplyIssueDateRange}
      />

      <CustomDateRangePicker
        variant="calendar"
        presets={DATE_RANGE_PRESETS}
        open={expiryDateDialog.value}
        onClose={expiryDateDialog.onFalse}
        startDate={filters.expiryFrom}
        endDate={filters.expiryTo}
        onChangeStartDate={handleChangeExpiryFromDate}
        onChangeEndDate={handleChangeExpiryToDate}
        onApplyRange={onApplyExpiryDateRange}
      />
    </>
  );
}
