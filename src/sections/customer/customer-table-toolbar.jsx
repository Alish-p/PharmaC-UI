/* eslint-disable react/prop-types */
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ColumnSelectorList } from 'src/components/table';
import { usePopover } from 'src/components/custom-popover';

import { TABLE_COLUMNS } from './customer-table-config';

// ----------------------------------------------------------------------

export default function CustomerTableToolbar({
  filters,
  onFilters,
  visibleColumns,
  disabledColumns = {},
  onToggleColumn,
  onToggleAllColumns,
  onResetColumns,
  canResetColumns,
}) {
  const columnsPopover = usePopover();

  const handleFilterCustomerName = useCallback(
    (event) => {
      onFilters('customerName', event.target.value);
    },
    [onFilters]
  );

  const handleFilterCellNo = useCallback(
    (event) => {
      onFilters('cellNo', event.target.value);
    },
    [onFilters]
  );

  const handleFilterGstIn = useCallback(
    (event) => {
      onFilters('gstIn', event.target.value);
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
        <TextField
          fullWidth
          value={filters.customerName}
          onChange={handleFilterCustomerName}
          placeholder="Filter by customer name..."
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
          value={filters.cellNo}
          onChange={handleFilterCellNo}
          placeholder="Filter by mobile no..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:cellphone" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          value={filters.gstIn}
          onChange={handleFilterGstIn}
          placeholder="Filter by GSTIN..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:file-document" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel id="customer-gst-enabled-select-label">GST Enabled</InputLabel>
          <Select
            value={filters.gstEnabled || ''}
            onChange={(event) => onFilters('gstEnabled', event.target.value)}
            input={<OutlinedInput label="GST Enabled" />}
            labelId="customer-gst-enabled-select-label"
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          >
            <MenuItem value="true">
              <Label variant="soft" color="success">
                Yes
              </Label>
            </MenuItem>
            <MenuItem value="false">
              <Label variant="soft" color="error">
                No
              </Label>
            </MenuItem>
          </Select>
        </FormControl>

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
    </>
  );
}
