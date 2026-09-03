import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
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

import { useTransferPartStock } from 'src/query/use-part';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

const TransferSchema = zod
  .object({
    quantity: zod
      .number({ required_error: 'Quantity to transfer is required' })
      .positive({ message: 'Quantity must be greater than 0' }),
    toLocationId: zod.string().min(1, { message: 'New location is required' }),
    reason: zod.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fromLocationId && data.toLocationId && data.fromLocationId === data.toLocationId) {
      ctx.addIssue({
        path: ['toLocationId'],
        code: zod.ZodIssueCode.custom,
        message: 'New location must be different from current location',
      });
    }
  });

export function PartStockTransferDialog({
  open,
  onClose,
  part,
  fromLocation,
  locations = [],
  partId,
}) {
  const transferPartStock = useTransferPartStock();

  const fromLocationId = useMemo(() => {
    if (!fromLocation) return '';
    return (
      fromLocation.inventoryLocationId ||
      fromLocation.id ||
      fromLocation._id ||
      fromLocation.name ||
      ''
    );
  }, [fromLocation]);

  const currentQty = useMemo(
    () => (typeof fromLocation?.currentQty === 'number' ? fromLocation.currentQty : 0),
    [fromLocation]
  );

  const measurementUnit = part?.measurementUnit || '';

  const destinationOptions = useMemo(() => {
    if (!locations?.length || !fromLocationId) return locations || [];
    return locations.filter((loc) => {
      const locId =
        loc.inventoryLocationId || loc.id || loc._id || loc.inventoryLocation || loc.name;
      return locId && locId !== fromLocationId;
    });
  }, [locations, fromLocationId]);

  const methods = useForm({
    resolver: zodResolver(TransferSchema),
    defaultValues: {
      quantity: 0,
      toLocationId: '',
      reason: '',
      fromLocationId,
    },
    mode: 'all',
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const handleClose = () => {
    reset({
      quantity: 0,
      toLocationId: '',
      reason: '',
      fromLocationId,
    });
    onClose?.();
  };

  const onSubmit = async (values) => {
    if (!partId || !fromLocationId) return;

    const payload = {
      fromLocationId,
      toLocationId: values.toLocationId,
      quantity: values.quantity,
    };

    if (values.reason) {
      payload.reason = values.reason;
    }

    await transferPartStock({ id: partId, data: payload });
    handleClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 1 }}>Transfer Inventory</DialogTitle>

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
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: theme.palette.grey[900],
              color: 'common.white',
              flexShrink: 0,
            })}
          >
            <Iconify icon="mdi:cog-outline" width={24} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Part
            </Typography>
            <Typography variant="subtitle1" noWrap>
              {part?.name || part?.partNumber || 'Part'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Current Location
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fromLocation?.name || 'Unknown location'}
          </Typography>
        </Box>

        <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Current Quantity"
              value={currentQty}
              disabled
              InputProps={{
                sx: { bgcolor: 'action.disabledBackground' },
                endAdornment: measurementUnit ? (
                  <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    {measurementUnit}
                  </Typography>
                ) : undefined,
              }}
            />

            <Field.Text
              name="quantity"
              label="Quantity to Transfer"
              type="number"
              required
              InputProps={{
                endAdornment: measurementUnit ? (
                  <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    {measurementUnit}
                  </Typography>
                ) : undefined,
              }}
              helperText={`Available: ${currentQty} ${measurementUnit || ''}`}
            />

            <Field.Select name="toLocationId" label="New Location" required>
              <MenuItem value="">
                <em>Please select</em>
              </MenuItem>
              {destinationOptions.map((loc) => {
                const locId =
                  loc.inventoryLocationId || loc.id || loc._id || loc.inventoryLocation || loc.name;
                return (
                  <MenuItem key={locId} value={locId}>
                    {loc.name || 'Unnamed location'}
                  </MenuItem>
                );
              })}
            </Field.Select>

            <Field.Text
              name="reason"
              label="Reason"
              placeholder="Add an optional reason (e.g., Restocking)"
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
