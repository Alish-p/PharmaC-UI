/* eslint-disable react/prop-types */
import { useCallback } from 'react';

import { Badge } from '@mui/material';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { ICONS, NAV_ICONS } from 'src/assets/data/icons';

import { Iconify } from 'src/components/iconify';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button/dialog-select-button';

import { KanbanVehicleDialog } from 'src/sections/kanban/components/kanban-vehicle-dialog';

import TyreFiltersDrawer from './tyre-filters-drawer'; // Ensure correct path
import { TYRE_TABLE_COLUMNS } from './tyre-table-config';
import { TYRE_TYPE, TYRE_BRANDS } from './tyre-constants';

// ----------------------------------------------------------------------

export default function TyreTableToolbar({
  filters,
  onFilters,
  visibleColumns,
  disabledColumns,
  //
  onToggleColumn,
  onToggleAllColumns,
  onResetColumns,
  canResetColumns,
  vehicleData,
  transporterData,
  onResetFilters, // Added prop
}) {
  const columnsPopover = usePopover();
  const filtersDrawer = useBoolean();

  const vehiclePopover = usePopover();

  const handleFilterVehicle = useCallback(
    (vehicle) => {
      onFilters('vehicle', vehicle?._id || null);
    },
    [onFilters]
  );

  const handleFilterTyreNumber = useCallback(
    (event) => {
      onFilters('serialNumber', event.target.value);
    },
    [onFilters]
  );

  // const handleFilterBrand = useCallback(
  //     (event) => {
  //         onFilters('brand', event.target.value);
  //     },
  //     [onFilters]
  // );

  const handleFilterType = useCallback(
    (event, newValue) => {
      onFilters('type', newValue);
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
          value={filters.serialNumber}
          onChange={handleFilterTyreNumber}
          placeholder="Search Tyre Number..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon={ICONS.common.search} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: 1, md: 240 } }}
        />

        <Autocomplete
          freeSolo
          options={TYRE_BRANDS}
          value={filters.brand}
          onChange={(event, newValue) => {
            onFilters('brand', newValue);
          }}
          onInputChange={(event, newInputValue) => {
            onFilters('brand', newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search Brand..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon={ICONS.common.search} sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
          sx={{ width: { xs: 1, md: 200 } }}
        />

        <Autocomplete
          multiple
          disableCloseOnSelect
          options={Object.values(TYRE_TYPE)}
          getOptionLabel={(option) => option}
          value={filters.type || []}
          onChange={handleFilterType}
          renderInput={(params) => <TextField {...params} placeholder="Type" />}
          renderOption={(other, option, { selected }) => (
            <li {...other} key={option}>
              <Checkbox key={option} size="small" disableRipple checked={selected} />
              {option}
            </li>
          )}
          sx={{ width: { xs: 1, md: 200 } }}
        />

        <DialogSelectButton
          onClick={vehiclePopover.onOpen}
          disabled={false}
          startIcon={NAV_ICONS.vehicle}
          placeholder="Filter by Vehicle"
          selected={vehicleData?.vehicleNo}
          onClear={() => handleFilterVehicle(null)}
          sx={{ width: { xs: 1, md: 200 } }}
        />

        <KanbanVehicleDialog
          open={vehiclePopover.open}
          onClose={vehiclePopover.onClose}
          onVehicleChange={handleFilterVehicle}
          onlyOwn
        />

        <Stack direction="row" spacing={1} sx={{ ml: 'auto !important' }}>
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon={ICONS.common.filter} />}
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
                <Iconify icon={ICONS.common.settings} />
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
        TABLE_COLUMNS={TYRE_TABLE_COLUMNS}
        visibleColumns={visibleColumns}
        disabledColumns={disabledColumns}
        handleToggleColumn={onToggleColumn}
        handleToggleAllColumns={onToggleAllColumns}
        onResetColumns={onResetColumns}
        canResetColumns={canResetColumns}
      />

      <TyreFiltersDrawer
        open={filtersDrawer.value}
        onClose={filtersDrawer.onFalse}
        filters={filters}
        onFilters={onFilters}
        onResetFilters={onResetFilters} // Ensure this prop is passed from parent or handled
        vehicleData={vehicleData}
        transporterData={transporterData}
      />
    </>
  );
}
