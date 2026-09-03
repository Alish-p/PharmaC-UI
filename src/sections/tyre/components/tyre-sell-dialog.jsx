import { z } from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { NAV_ICONS } from 'src/assets/data/icons';

import { Form, Field } from 'src/components/hook-form';
import { usePopover } from 'src/components/custom-popover';
import { DialogSelectButton } from 'src/components/dialog-select-button/dialog-select-button';

import { KanbanTransporterDialog } from 'src/sections/kanban/components/kanban-transporter-dialog';

// ----------------------------------------------------------------------

export default function TyreSellDialog({ open, onClose, onSell, tyreStatus, tyreCost = 0 }) {
  const isInstock = tyreStatus === 'In_Stock';
  const transporterPopover = usePopover();

  const SellTyreSchema = z.object({
    sellDate: z.date(),
    sellAmount: z.coerce.number().min(0, 'Amount must be 0 or greater'),
    transporterId: isInstock
      ? z.string().min(1, 'Transporter is required')
      : z.string().optional().nullable(),
    soldToTransporterName: z.string().optional().nullable(),
  });

  const methods = useForm({
    resolver: zodResolver(SellTyreSchema),
    defaultValues: {
      sellDate: new Date(),
      sellAmount: isInstock ? tyreCost : 1000,
      transporterId: '',
      soldToTransporterName: '',
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        sellDate: new Date(),
        sellAmount: isInstock ? tyreCost : 1000,
        transporterId: '',
        soldToTransporterName: '',
      });
    }
  }, [open, isInstock, tyreCost, methods]);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  const selectedTransporterName = watch('soldToTransporterName');

  const onSubmit = handleSubmit(async (data) => {
    await onSell(data);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isInstock ? 'Sell In-Stock Tyre' : 'Sell Scrapped Tyre'}</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Field.DatePicker name="sellDate" label="Sell Date" sx={{ mt: 2, width: '100%' }} />
          <Field.Text
            name="sellAmount"
            label="Selling Amount (INR)"
            type="number"
            sx={{ mt: 2 }}
            helperText="Enter the amount for which tyre was sold"
          />
          {isInstock && (
            <>
              <DialogSelectButton
                fullWidth
                onClick={transporterPopover.onOpen}
                startIcon={NAV_ICONS.transporter}
                placeholder="Select Transporter"
                selected={selectedTransporterName}
                onClear={() => {
                  setValue('transporterId', '', { shouldValidate: true });
                  setValue('soldToTransporterName', '');
                }}
                error={!!errors.transporterId}
                helperText={errors.transporterId?.message}
                sx={{ mt: 2 }}
              />
              <KanbanTransporterDialog
                open={transporterPopover.open}
                onClose={transporterPopover.onClose}
                onTransporterChange={(transporter) => {
                  setValue('transporterId', transporter?._id, { shouldValidate: true });
                  setValue('soldToTransporterName', transporter?.transportName);
                }}
              />
            </>
          )}
        </Form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" color="primary" loading={isSubmitting}>
          Sell
        </Button>
      </DialogActions>
    </Dialog>
  );
}
