import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInView } from 'react-intersection-observer';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';

import { useDebounce } from 'src/hooks/use-debounce';
import { useSystemFeatures } from 'src/hooks/use-system-features';

import { VEHICLE_MODES } from 'src/constants/vehicle-mode';
import { useCreateVehicle, useInfiniteVehicles } from 'src/query/use-vehicle';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';
import { LoadingSpinner } from 'src/components/loading-spinner';
import { SearchNotFound } from 'src/components/search-not-found';

import { useVehicleTypes } from 'src/sections/vehicle/vehicle-config';

import { KanbanTransporterDialog } from './kanban-transporter-dialog';

const ITEM_HEIGHT = 64;

// Schema for quick vehicle creation
const QuickVehicleSchema = zod.object({
  vehicleNo: zod
    .string()
    .min(1, { message: 'Vehicle No is required' })
    .regex(/^[A-Z]{2}[0-9]{2}[A-Z]{0,2}[0-9]{4}$/, {
      message: 'Invalid Vehicle No format. Example: KA01AB0001, KA01A0001, or KA010001',
    }),
  vehicleType: zod.string().min(1, { message: 'Vehicle Type is required' }),
  noOfTyres: zod
    .number()
    .min(3, { message: 'No Of Tyres must be at least 3' })
    .max(30, { message: 'No Of Tyres cannot exceed 30' }),
  transporter: zod.string().optional(),
});

// ----------------------------------------------------------------------
// Custom hook for debounced search + infinite scroll
// ----------------------------------------------------------------------
// Custom hook for debounced search + infinite scroll
function useVehicleSearch(
  searchText,
  enabled,
  { onlyOwn = false, onlyMarket = false, onlyActive = false } = {}
) {
  const debounced = useDebounce(searchText, 500);
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });

  let isOwn;
  if (onlyOwn) isOwn = true;
  else if (onlyMarket) isOwn = false;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteVehicles(
    {
      vehicleNo: debounced || undefined,
      rowsPerPage: 50,
      isOwn,
      ...(onlyActive && { isActive: true }),
    },
    { enabled }
  );

  const vehicles = data ? data.pages.flatMap((p) => p.results || []) : [];
  const total = data?.pages?.[0]?.total || 0;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    vehicles,
    total,
    isLoading,
    isFetchingNext: isFetchingNextPage,
    loadMoreRef,
  };
}

// Form for creating a vehicle quickly
const QuickCreateForm = ({ onSubmit, onCancel, isSubmitting, searchQuery, error }) => {
  const { vehicleMode } = useSystemFeatures();
  const managesMarketVehicles = vehicleMode !== VEHICLE_MODES.OWN_ONLY;
  const vehicleTypes = useVehicleTypes();

  const methods = useForm({
    resolver: zodResolver(QuickVehicleSchema),
    defaultValues: {
      vehicleNo: searchQuery || '',
      vehicleType: '',
      noOfTyres: 6,
      transporter: '',
    },
  });

  const [transporterDialogOpen, setTransporterDialogOpen] = useState(false);
  const [selectedTransporter, setSelectedTransporter] = useState(null);

  const handleTransporterSelect = (transporter) => {
    setSelectedTransporter(transporter);
    methods.setValue('transporter', transporter._id);
  };

  return (
    <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
      <Box sx={{ mt: 2, p: 2 }}>
        <Typography variant="body2" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="material-symbols:info-outline" sx={{ color: 'primary.main' }} />
            Create a new vehicle with minimal information. You can update the full details later.
          </Box>
        </Typography>
        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Field.Text name="vehicleNo" label="Vehicle No" required sx={{ mb: 2 }} />
        <Field.Select name="vehicleType" label="Vehicle Type" required sx={{ mb: 2 }}>
          <MenuItem value="">None</MenuItem>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {vehicleTypes.map(({ key, value }) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </Field.Select>
        <Field.Text name="noOfTyres" label="No Of Tyres" type="number" required sx={{ mb: 2 }} />
        {managesMarketVehicles && (
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setTransporterDialogOpen(true)}
            sx={{ height: 56, justifyContent: 'flex-start', typography: 'body2' }}
            startIcon={<Iconify icon="mdi:truck-outline" sx={{ color: 'text.disabled' }} />}
          >
            {selectedTransporter ? selectedTransporter.transportName : 'Select Transport Company *'}
          </Button>
        )}
      </Box>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>

      {managesMarketVehicles && (
        <KanbanTransporterDialog
          selectedTransporter={selectedTransporter}
          open={transporterDialogOpen}
          onClose={() => setTransporterDialogOpen(false)}
          onTransporterChange={handleTransporterSelect}
        />
      )}
    </Form>
  );
};

// Component shown when search yields no results
const NotFoundWithQuickCreate = ({
  searchQuery,
  showQuickCreate,
  onShowQuickCreate,
  onQuickCreate,
  isSubmitting,
  error,
}) => (
  <Box sx={{ p: 3 }}>
    {!showQuickCreate ? (
      <>
        <SearchNotFound query={searchQuery} sx={{ mt: 3, mb: 3 }} />
        <Button
          fullWidth
          variant="contained"
          onClick={onShowQuickCreate}
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Create New Vehicle
        </Button>
      </>
    ) : (
      <QuickCreateForm
        onSubmit={onQuickCreate}
        onCancel={() => onShowQuickCreate(false)}
        isSubmitting={isSubmitting}
        searchQuery={searchQuery}
        error={error}
      />
    )}
  </Box>
);

// ----------------------------------------------------------------------
export function KanbanVehicleDialog({
  selectedVehicle = null,
  open,
  onClose,
  onVehicleChange,
  onlyOwn = false,
  onlyMarket = false,
  onlyActive = false,
}) {
  const [search, setSearch] = useState('');
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const hasActiveFilters = onlyOwn || onlyMarket || onlyActive;

  const createVehicle = useCreateVehicle();
  const { vehicleMode } = useSystemFeatures();
  const managesMarketVehicles = vehicleMode !== VEHICLE_MODES.OWN_ONLY;

  const { vehicles, total, isLoading, isFetchingNext, loadMoreRef } = useVehicleSearch(
    search,
    open && !showQuickCreate,
    { onlyOwn, onlyMarket, onlyActive }
  );

  useEffect(() => {
    if (open) {
      setSearch('');
      setShowQuickCreate(false);
      setError(null);
    }
  }, [open]);

  const handleSelectVehicle = (vehicle) => {
    onVehicleChange(vehicle);
    onClose();
  };

  const handleQuickCreate = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const newVehicle = {
        ...data,
        isOwn: !managesMarketVehicles || onlyOwn,
        modelType: '3118',
        vehicleCompany: 'NA',
        chasisNo: '0000000000000',
        engineNo: '0000000000000',
        manufacturingYear: new Date().getFullYear(),
        loadingCapacity: 35,
        engineType: 'bs6',
        fuelTankCapacity: 200,
        isActive: true,
      };

      const created = await createVehicle(newVehicle);
      onVehicleChange(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const noResults = !vehicles.length && search.trim().length > 0 && !isLoading;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle
        sx={{ pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box>
          {showQuickCreate ? 'Create New Vehicle' : 'Vehicles'}{' '}
          {!showQuickCreate && (
            <Typography component="span" sx={{ color: 'text.secondary' }}>
              ({total})
            </Typography>
          )}
        </Box>

        {hasActiveFilters && !showQuickCreate && (
          <Stack direction="row" spacing={0.75} alignItems="center">
            {onlyOwn && (
              <Tooltip title="Showing only own vehicles" arrow>
                <Chip
                  icon={<Iconify icon="mdi:truck-check" width={16} />}
                  label="Own only"
                  size="small"
                  color="info"
                  variant="soft"
                  sx={{ cursor: 'default' }}
                />
              </Tooltip>
            )}

            {onlyMarket && (
              <Tooltip title="Showing only market vehicles" arrow>
                <Chip
                  icon={<Iconify icon="mdi:truck-delivery" width={16} />}
                  label="Market only"
                  size="small"
                  color="warning"
                  variant="soft"
                  sx={{ cursor: 'default' }}
                />
              </Tooltip>
            )}

            {onlyActive && (
              <Tooltip title="Showing only active vehicles" arrow>
                <Chip
                  icon={<Iconify icon="mdi:check-circle" width={16} />}
                  label="Active only"
                  size="small"
                  color="success"
                  variant="soft"
                  sx={{ cursor: 'default' }}
                />
              </Tooltip>
            )}
          </Stack>
        )}
      </DialogTitle>

      {!showQuickCreate && (
        <Box sx={{ px: 3, py: 2 }}>
          <TextField
            fullWidth
            placeholder="KA01AB0001, 1234"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      <DialogContent sx={{ p: 0 }}>
        {showQuickCreate ? (
          <QuickCreateForm
            onSubmit={handleQuickCreate}
            onCancel={() => setShowQuickCreate(false)}
            isSubmitting={isSubmitting}
            searchQuery={search}
            error={error}
          />
        ) : isLoading ? (
          <LoadingSpinner sx={{ height: ITEM_HEIGHT * 6 }} />
        ) : noResults ? (
          <NotFoundWithQuickCreate
            searchQuery={search}
            showQuickCreate={showQuickCreate}
            onShowQuickCreate={() => setShowQuickCreate(true)}
            onQuickCreate={handleQuickCreate}
            isSubmitting={isSubmitting}
            error={error}
          />
        ) : (
          <Scrollbar sx={{ height: ITEM_HEIGHT * 6, px: 2.5 }}>
            <Box component="ul">
              {vehicles.map((vehicle) => {
                const isSelected = selectedVehicle?._id === vehicle._id;
                return (
                  <Box
                    component="li"
                    key={vehicle._id}
                    sx={{ display: 'flex', alignItems: 'center', gap: 2, height: ITEM_HEIGHT }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.25 }}>
                        {vehicle.vehicleNo}{' '}
                        <Label
                          color={vehicle.isOwn ? 'success' : 'warning'}
                          size="small"
                          variant="soft"
                        >
                          {vehicle.isOwn ? 'Own' : 'Market'}
                        </Label>
                        {!vehicle.isActive && (
                          <Label color="error" size="small" variant="soft" sx={{ ml: 0.5 }}>
                            Inactive
                          </Label>
                        )}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {vehicle.vehicleType} • {vehicle.modelType} • {vehicle.vehicleCompany}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color={isSelected ? 'primary' : 'inherit'}
                      onClick={() => handleSelectVehicle(vehicle)}
                      startIcon={
                        <Iconify
                          icon={isSelected ? 'eva:checkmark-fill' : 'mingcute:add-line'}
                          width={16}
                          sx={{ mr: -0.5 }}
                        />
                      }
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                  </Box>
                );
              })}
              <Box
                ref={loadMoreRef}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: ITEM_HEIGHT,
                }}
              >
                {isFetchingNext && <LoadingSpinner />}
              </Box>
            </Box>
          </Scrollbar>
        )}
      </DialogContent>
    </Dialog>
  );
}
