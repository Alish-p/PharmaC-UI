import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useAdjustPartStock } from 'src/query/use-part';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

const AdjustmentSchema = zod.object({
  quantityChange: zod
    .number({ required_error: 'Adjust quantity is required' })
    .refine((val) => val !== 0, { message: 'Adjustment cannot be 0' }),
  reason: zod.string().min(1, { message: 'Reason is required' }),
  comment: zod.string().max(500).optional(),
  unitCost: zod.number().optional(),
});

const ADJUSTMENT_REASONS = [
  'Broken',
  'Checked Inventory',
  'Expired',
  'Found',
  'Lost',
  'Received',
  'Sold',
  'Stolen',
  'Transferred',
  'Used',
  'Other Reason',
];

export function PartStockAdjustmentDialog({ open, onClose, part, location, partId }) {
  const adjustPartStock = useAdjustPartStock();

  const methods = useForm({
    resolver: zodResolver(AdjustmentSchema),
    defaultValues: {
      quantityChange: 0,
      reason: '',
      comment: '',
    },
    mode: 'all',
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open && location) {
      reset({
        quantityChange: 0,
        reason: '',
        comment: '',
        unitCost: location.averageUnitCost || 0,
      });
    }
  }, [open, location, reset]);

  const currentQty = useMemo(
    () => (typeof location?.currentQty === 'number' ? location.currentQty : 0),
    [location]
  );

  const quantityChange = watch('quantityChange') || 0;

  const newQuantity = useMemo(
    () => currentQty + (typeof quantityChange === 'number' ? quantityChange : 0),
    [currentQty, quantityChange]
  );

  const measurementUnit = part?.measurementUnit || '';

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const onSubmit = async (values) => {
    if (!partId || !location) {
      return;
    }

    const inventoryLocationId =
      location.inventoryLocationId || location.id || location._id || location.name;

    if (!inventoryLocationId) {
      return;
    }

    const payload = {
      inventoryLocation: inventoryLocationId,
      quantityChange: values.quantityChange,
      reason: values.reason || 'Manual Adjustment',
    };

    if (values.quantityChange > 0 && values.unitCost !== undefined) {
      payload.unitCost = values.unitCost;
    }

    if (values.comment) {
      payload.note = values.comment;
    }

    await adjustPartStock({ id: partId, data: payload });
    handleClose();
  };

  const locationLabel = location
    ? `${location.name || 'Unnamed location'}${
        typeof location.currentQty === 'number'
          ? ` • Current: ${location.currentQty} ${measurementUnit || ''}`
          : ''
      }`
    : '';

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 1 }}>
        Adjust Inventory for{' '}
        <Typography component="span" variant="subtitle1">
          {part?.name || part?.partNumber || 'Part'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box
          sx={(theme) => ({
            mb: 3,
            p: 2,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'background.neutral',
            border: `1px dashed ${theme.palette.divider}`,
          })}
        >
          <Box
            sx={(theme) => ({
              width: 48,
              height: 48,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: theme.palette.grey[900],
              color: 'common.white',
              flexShrink: 0,
            })}
          >
            <Iconify icon="mdi:cog-outline" width={28} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {part?.name || part?.partNumber || 'Part'}
            </Typography>
            {part?.description && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {part.description}
              </Typography>
            )}
          </Box>
        </Box>

        <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Location *
              </Typography>
              <TextField
                fullWidth
                value={locationLabel}
                disabled
                placeholder="Select location"
                InputProps={{
                  sx: { bgcolor: 'action.disabledBackground' },
                }}
              />
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field.Text
                  name="quantityChange"
                  label="Adjust Quantity"
                  type="number"
                  required
                  helperText="Use negative numbers to reduce stock"
                  InputProps={{
                    endAdornment: measurementUnit ? (
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        {measurementUnit}
                      </Typography>
                    ) : undefined,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="New Quantity"
                  value={Number.isFinite(newQuantity) ? newQuantity : ''}
                  InputProps={{
                    readOnly: true,
                    sx: { bgcolor: 'action.hover' },
                    endAdornment: measurementUnit ? (
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        {measurementUnit}
                      </Typography>
                    ) : undefined,
                  }}
                />
              </Grid>

              {quantityChange > 0 && (
                <Grid item xs={12} md={6}>
                  <Field.Text
                    name="unitCost"
                    label="Unit Cost"
                    type="number"
                    InputProps={{
                      startAdornment: (
                        <Typography variant="caption" sx={{ mr: 1, color: 'text.secondary' }}>
                          ₹
                        </Typography>
                      ),
                    }}
                  />
                </Grid>
              )}
            </Grid>

            <Field.Select name="reason" label="Reason" required>
              <MenuItem value="">
                <em>Please select</em>
              </MenuItem>
              {ADJUSTMENT_REASONS.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Text
              name="comment"
              label="Comment"
              placeholder="Add an optional comment"
              multiline
              rows={3}
            />

            <DialogActions sx={{ px: 0, pb: 0, pt: 2 }}>
              <Button onClick={handleClose} color="inherit">
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save
              </LoadingButton>
            </DialogActions>
          </Box>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
