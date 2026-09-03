/* eslint-disable react/prop-types */
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { APP_ICONS } from 'src/components/iconify/icons';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { KanbanDriverDialog } from 'src/sections/kanban/components/kanban-driver-dialog';
import { KanbanTransporterDialog } from 'src/sections/kanban/components/kanban-transporter-dialog';

import { LOAN_REASONS } from '../loans-config';
import { TABLE_COLUMNS } from '../loans-table-config';

// ----------------------------------------------------------------------

export default function LoansTableToolbar({
  filters,
  onFilters,
  onApplyDateRange,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  onResetColumns,
  canResetColumns,
  managesMarketVehicles,
}) {
  const columnsPopover = usePopover();
  const dateDialog = useBoolean();

  const driverDialog = useBoolean();
  const transporterDialog = useBoolean();

  const handleFilterLoanNo = useCallback(
    (event) => {
      onFilters('loanNo', event.target.value);
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

  const handleDriverChange = (driver) => {
    onFilters('driverId', driver._id);
    onFilters('driverName', driver.driverName);
    onFilters('transporterId', '');
    onFilters('transporterName', '');
  };

  const handleTransporterChange = (transporter) => {
    onFilters('transporterId', transporter._id);
    onFilters('transporterName', transporter.transportName);
    onFilters('driverId', '');
    onFilters('driverName', '');
  };

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
          value={filters.loanNo}
          onChange={handleFilterLoanNo}
          placeholder="Search Loan No..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ width: 1 }}>
          <DialogSelectButton
            onClick={driverDialog.onTrue}
            placeholder="Select Driver"
            selected={filters.driverName || undefined}
            iconName={APP_ICONS.driver}
            sx={{ width: '100%', mt: 0 }}
          />
        </Box>

        {managesMarketVehicles && (
          <Box sx={{ width: 1 }}>
            <DialogSelectButton
              onClick={transporterDialog.onTrue}
              placeholder="Select Transporter"
              selected={filters.transporterName || undefined}
              iconName={APP_ICONS.transporter}
              sx={{ width: '100%', mt: 0 }}
            />
          </Box>
        )}

        <Autocomplete
          fullWidth
          freeSolo
          options={[
            ...LOAN_REASONS.Driver,
            ...(managesMarketVehicles ? LOAN_REASONS.Transporter : []),
          ].map((opt) => opt.label)}
          getOptionLabel={(option) => option}
          value={filters.loanReason || ''}
          onChange={(event, newValue) => {
            onFilters('loanReason', newValue || '');
          }}
          onInputChange={(event, newInputValue) => {
            onFilters('loanReason', newInputValue || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search Reason..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start" sx={{ pl: 1, mr: -0.5 }}>
                      <Iconify icon="mdi:text-box-search" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <DialogSelectButton
          onClick={dateDialog.onTrue}
          placeholder="Date range"
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

      <KanbanDriverDialog
        open={driverDialog.value}
        onClose={driverDialog.onFalse}
        onDriverChange={handleDriverChange}
      />

      {managesMarketVehicles && (
        <KanbanTransporterDialog
          open={transporterDialog.value}
          onClose={transporterDialog.onFalse}
          onTransporterChange={handleTransporterChange}
        />
      )}
    </>
  );
}
