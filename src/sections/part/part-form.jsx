import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Stack,
  Alert,
  Divider,
  MenuItem,
  CardHeader,
  Typography,
  ListSubheader,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { usePaginatedPartLocations } from 'src/query/use-part-location';
import { useCreatePart, useUpdatePart, getPartPhotoUploadUrl } from 'src/query/use-part';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { PART_CATEGORIES, PART_MANUFACTURERS, MEASUREMENT_UNIT_GROUPS } from './part-constant';

const stringOrObjectSchema = (requiredMessage) =>
  zod.preprocess(
    (val) => {
      if (typeof val === 'string') return val;
      if (val && typeof val === 'object' && 'value' in val) return val.value;
      return val;
    },
    zod.string().min(1, { message: requiredMessage }).optional()
  );

export const PartSchema = zod.object({
  partNumber: zod.string().min(1, { message: 'Part Number is required' }),
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().optional(),
  category: stringOrObjectSchema('Category is required').optional(),
  manufacturer: stringOrObjectSchema('Manufacturer is required').optional(),
  photo: zod.any().optional(),
  unitCost: zod.coerce.number().min(0, { message: 'Unit Cost cannot be negative' }),
  measurementUnit: zod.string().min(1, { message: 'Measurement Unit is required' }),
  locationQuantities: zod
    .record(
      zod.string(),
      zod.preprocess(
        (val) => (val === '' || val === undefined || val === null ? 0 : val),
        zod.coerce.number().min(0)
      )
    )
    .optional(),
  locationThresholds: zod
    .record(
      zod.string(),
      zod.preprocess(
        (val) => (val === '' || val === undefined || val === null ? 0 : val),
        zod.coerce.number().min(0)
      )
    )
    .optional(),
  quantity: zod.coerce.number().min(0).optional(),
});

export default function PartForm({ currentPart }) {
  const navigate = useNavigate();

  const createPart = useCreatePart();
  const updatePart = useUpdatePart();

  const defaultValues = useMemo(() => {
    const inventoryEntries = Array.isArray(currentPart?.inventory) ? currentPart.inventory : [];

    const locationQuantities = {};
    const locationThresholds = {};

    inventoryEntries.forEach((entry) => {
      const loc =
        entry.inventoryLocation && typeof entry.inventoryLocation === 'object'
          ? entry.inventoryLocation
          : null;
      const locId = loc?._id || entry.inventoryLocationId || entry.inventoryLocation;
      if (!locId) return;

      locationQuantities[locId] = entry.quantity ?? 0;
      locationThresholds[locId] = entry.threshold ?? 0;
    });

    return {
      partNumber: currentPart?.partNumber || '',
      name: currentPart?.name || '',
      description: currentPart?.description || '',
      category: currentPart?.category || '',
      manufacturer: currentPart?.manufacturer || '',
      photo: currentPart?.photo || '',
      unitCost: currentPart?.unitCost ?? 0,
      measurementUnit: currentPart?.measurementUnit || '',
      // Legacy single-location fields (no longer used in UI)
      inventoryLocation: currentPart?.inventoryLocation?._id || '',
      quantity: currentPart?.quantity ?? 0,
      // Multi-location fields
      inventoryLocationIds: [],
      locationQuantities,
      locationThresholds,
    };
  }, [currentPart]);

  const methods = useForm({
    resolver: zodResolver(PartSchema),
    defaultValues,
    mode: 'all',
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = methods;

  console.log({ errors });
  const measurementUnit = watch('measurementUnit');

  const { data: locationsResponse } = usePaginatedPartLocations(
    { page: 1, rowsPerPage: 1000 },
    { staleTime: 1000 * 60 * 10 }
  );

  const locations = locationsResponse?.locations || [];

  const handleUploadPhoto = async (file) => {
    try {
      const isFile = file instanceof File;
      if (!isFile) return file;

      const fileExtension = file.name.split('.').pop() || 'jpg';
      const contentType = file.type || 'image/jpeg';

      const { uploadUrl, publicUrl } = await getPartPhotoUploadUrl({
        contentType,
        fileExtension,
      });

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
      });

      if (!res.ok) throw new Error('Upload failed');

      return publicUrl;
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload part photo');
      throw err;
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue(
          'photo',
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
          { shouldValidate: true }
        );
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('photo', null, { shouldValidate: true });
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
      const existingInventoryEntries = Array.isArray(currentPart?.inventory)
        ? currentPart.inventory
        : [];

      const locationQuantities = data.locationQuantities || {};
      const locationThresholds = data.locationThresholds || {};

      // Editing an existing part: update thresholds per location (quantities are read-only)
      if (currentPart) {
        const inventory = [];

        locations.forEach((loc) => {
          const locId = loc._id;

          const rawThreshold = locationThresholds[locId];
          const rawQty = locationQuantities[locId];

          const existing = existingInventoryEntries.find((entry) => {
            const entryLoc =
              entry.inventoryLocation && typeof entry.inventoryLocation === 'object'
                ? entry.inventoryLocation
                : null;
            const entryLocId =
              entryLoc?._id || entry.inventoryLocationId || entry.inventoryLocation;
            return entryLocId === locId;
          });

          const threshold =
            rawThreshold !== undefined && rawThreshold !== ''
              ? Number(rawThreshold)
              : (existing?.threshold ?? 0);

          if (threshold < 0) {
            setError(`locationThresholds.${locId}`, {
              type: 'manual',
              message: 'Reorder point cannot be negative',
            });
            return;
          }

          const quantity =
            typeof (existing && existing.quantity) === 'number'
              ? existing.quantity
              : rawQty !== undefined && rawQty !== '' && !Number.isNaN(Number(rawQty))
                ? Number(rawQty)
                : 0;

          // Include this location if it already has inventory or the user set a threshold
          if (existing || (rawThreshold !== undefined && rawThreshold !== '')) {
            inventory.push({
              inventoryLocation: locId,
              quantity,
              threshold,
            });
          }
        });

        const {
          inventoryLocation: _inventoryLocation,
          quantity: _quantity,
          inventoryLocationIds: _,
          locationQuantities: __,
          locationThresholds: ___,
          photo,
          ...base
        } = data;

        const uploadedPhotoUrl = photo instanceof File ? await handleUploadPhoto(photo) : photo;

        const payload = {
          ...base,
          photo: uploadedPhotoUrl,
          inventory,
        };

        const saved = await updatePart({ id: currentPart._id, data: payload });
        reset();
        navigate(paths.dashboard.part.details(saved._id));
        return;
      }

      // Creating a new part:
      // Iterate over all available locations to find those with defined quantities
      const entries = [];

      locations.forEach((loc) => {
        const rawQty = locationQuantities[loc._id];
        const rawThreshold = locationThresholds[loc._id];

        // We include the location if the user has entered a quantity (including 0)
        if (rawQty !== undefined && rawQty !== '' && rawQty !== null) {
          const qty = Number(rawQty);
          const threshold =
            rawThreshold !== undefined && rawThreshold !== '' ? Number(rawThreshold) : 0;

          if (qty < 0) {
            setError(`locationQuantities.${loc._id}`, {
              type: 'manual',
              message: 'Quantity cannot be negative',
            });
            return;
          }

          if (threshold < 0) {
            setError(`locationThresholds.${loc._id}`, {
              type: 'manual',
              message: 'Reorder point cannot be negative',
            });
            return;
          }

          entries.push({
            inventoryLocation: loc._id,
            quantity: qty,
            threshold,
          });
        }
      });

      // if (entries.length === 0) {
      //   setError('root', {
      //     type: 'manual',
      //     message: 'Please enter initial quantity for at least one location',
      //   });
      //   return;
      // }

      const {
        inventoryLocation: _inventoryLocation,
        quantity: _quantity,
        inventoryLocationIds: _,
        locationQuantities: __,
        locationThresholds: ___,
        photo,
        ...base
      } = data;

      const uploadedPhotoUrl = photo instanceof File ? await handleUploadPhoto(photo) : photo;

      const payload = {
        ...base,
        photo: uploadedPhotoUrl,
        inventory: entries,
      };

      const created = await createPart(payload);

      reset();
      if (created?._id) {
        navigate(paths.dashboard.part.details(created._id));
      } else {
        navigate(paths.dashboard.part.list);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const hasActiveLocations = locations.length > 0;

  const renderDetails = (
    <Card>
      <CardHeader title="Part Details" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <Field.Text name="partNumber" label="Part Number" placeholder="e.g. P10001" />
          <Field.Text name="name" label="Name" placeholder="e.g. Oil Filter" />
          <Field.AutocompleteFreeSolo
            name="category"
            label="Category"
            placeholder="e.g. Brakes"
            options={PART_CATEGORIES.map((option) => ({ label: option, value: option }))}
          />
          <Field.AutocompleteFreeSolo
            name="manufacturer"
            label="Manufacturer"
            placeholder="e.g. Bosch"
            options={PART_MANUFACTURERS.map((option) => ({ label: option, value: option }))}
          />
        </Box>
        <Field.Text
          name="description"
          label="Description"
          placeholder="Brief description of the part"
          multiline
          rows={3}
        />
      </Stack>
    </Card>
  );

  const renderInventory = (
    <Card>
      <CardHeader title="Inventory & Pricing" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Select name="measurementUnit" label="Measurement Unit">
          {MEASUREMENT_UNIT_GROUPS.map((group) => [
            <ListSubheader key={`${group.label}-subheader`} disableSticky disableGutters>
              {group.label}
            </ListSubheader>,
            group.options.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            )),
          ])}
        </Field.Select>
        <Field.Text
          name="unitCost"
          label="Unit Cost"
          placeholder="0.00"
          type="number"
          inputProps={{ min: 0 }}
          InputProps={{
            endAdornment: measurementUnit ? (
              <InputAdornment position="end">/ {measurementUnit}</InputAdornment>
            ) : undefined,
          }}
        />
        {!currentPart && errors.root && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.root.message}
          </Alert>
        )}

        {!hasActiveLocations && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No active Part Locations found. Please create at least one Part Location before adding
            parts.
          </Alert>
        )}

        {hasActiveLocations && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              {currentPart
                ? 'View current quantities and edit reorder points per location'
                : 'Configure initial quantities and reorder points per location'}
            </Typography>

            <Stack spacing={2}>
              {locations.map((loc) => (
                <Stack
                  key={loc._id}
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ sm: 'center' }}
                  spacing={2}
                  sx={(theme) => ({
                    p: 2,
                    borderRadius: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.neutral',
                  })}
                >
                  <Box sx={{ flex: 1, minWidth: 160 }}>
                    <Typography variant="subtitle2">{loc.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {loc.address || 'No address'}
                    </Typography>
                  </Box>

                  <Field.Text
                    name={`locationQuantities.${loc._id}`}
                    label={currentPart ? 'Current Qty' : 'Initial Qty'}
                    placeholder="0"
                    type="number"
                    InputLabelProps={{ shrink: true }}
                    sx={{ maxWidth: { sm: 140 } }}
                    disabled={!!currentPart}
                  />

                  <Field.Text
                    name={`locationThresholds.${loc._id}`}
                    label="Reorder Point"
                    placeholder="0"
                    type="number"
                    InputLabelProps={{ shrink: true }}
                    sx={{ maxWidth: { sm: 140 } }}
                  />
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Card>
  );

  const renderImage = (
    <Card>
      <CardHeader title="Part Image" sx={{ mb: 3 }} />
      <Divider />
      <Box sx={{ p: 3 }}>
        <Field.Upload
          name="photo"
          maxSize={3145728}
          onDrop={handleDrop}
          onDelete={handleRemoveFile}
        />
      </Box>
    </Card>
  );

  const renderActions = (
    <Stack alignItems="flex-end" sx={{ mt: 3 }}>
      <LoadingButton
        type="submit"
        variant="contained"
        loading={isSubmitting}
        disabled={!hasActiveLocations && !currentPart}
      >
        {!currentPart ? 'Create Part' : 'Save Changes'}
      </LoadingButton>
    </Stack>
  );

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails}
        {renderInventory}
        {renderImage}
        {renderActions}
      </Stack>
    </Form>
  );
}
