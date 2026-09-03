/* eslint-disable react/prop-types */
import { useMemo } from 'react';

import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { usePaginatedPartLocations } from 'src/query/use-part-location';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { APP_ICONS } from 'src/components/iconify/icons';
import { DialogSelectButton } from 'src/components/dialog-select-button';

// ----------------------------------------------------------------------

export default function PurchaseOrderFiltersDrawer({
  open,
  onClose,
  filters,
  onFilters,
  // dialog state hooks
  vendorDialog,
  partDialog,
  dateRange,
  createdByDialog,
  approvedByDialog,
  // selected objects
  selectedVendor,
  selectedPart,
  selectedCreatedBy,
  selectedApprovedBy,
}) {
  const { data: locationsResponse } = usePaginatedPartLocations(
    { page: 1, rowsPerPage: 1000 },
    { staleTime: 1000 * 60 * 10 }
  );

  const locations = useMemo(
    () =>
      locationsResponse?.locations ||
      locationsResponse?.partLocations ||
      locationsResponse?.results ||
      [],
    [locationsResponse]
  );

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, px: 2.5 }}
    >
      <Typography variant="h6">Filters</Typography>

      <IconButton onClick={onClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { invisible: true },
      }}
      PaperProps={{
        sx: { width: 320 },
      }}
    >
      {renderHead}

      <Divider />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 2.5 }}>
          {/* 1. Purchase Order No. */}
          <TextField
            fullWidth
            value={filters.purchaseOrderNo || ''}
            onChange={(event) => onFilters('purchaseOrderNo', event.target.value)}
            placeholder="Purchase Order No."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* 2. Vendor */}
          <DialogSelectButton
            onClick={vendorDialog.onTrue}
            selected={selectedVendor?.name}
            placeholder="Vendor"
            iconName={APP_ICONS.customer}
          />

          {/* 3. Part */}
          <DialogSelectButton
            onClick={partDialog.onOpen}
            selected={selectedPart?.name}
            placeholder="Part"
            iconName={APP_ICONS.part}
          />

          {/* 4. Date Range */}
          <DialogSelectButton
            onClick={dateRange.onTrue}
            selected={
              filters.fromDate && filters.toDate
                ? fDateRangeShortLabel(filters.fromDate, filters.toDate)
                : undefined
            }
            placeholder="Date Range"
            iconName={APP_ICONS.calendar}
          />

          {/* 5. Vendor Invoice No. */}
          <TextField
            fullWidth
            value={filters.vendorInvoiceNo || ''}
            onChange={(event) => onFilters('vendorInvoiceNo', event.target.value)}
            placeholder="Vendor Invoice No."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* 6. Part Location */}
          <TextField
            select
            fullWidth
            label="Part Location"
            value={filters.partLocationId || ''}
            onChange={(event) => onFilters('partLocationId', event.target.value || '')}
          >
            <MenuItem value="">All Locations</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc._id} value={loc._id}>
                {loc.name}
              </MenuItem>
            ))}
          </TextField>

          {/* 7. Created By */}
          <DialogSelectButton
            onClick={createdByDialog.onTrue}
            selected={selectedCreatedBy?.name}
            placeholder="Created By"
            iconName={APP_ICONS.user}
          />

          {/* 8. Approved By */}
          <DialogSelectButton
            onClick={approvedByDialog.onTrue}
            selected={selectedApprovedBy?.name}
            placeholder="Approved By"
            iconName={APP_ICONS.user}
          />


        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
