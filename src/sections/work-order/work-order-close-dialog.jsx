/* eslint-disable react/prop-types */
import React, { useMemo, useState, useCallback } from 'react';

import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { fCurrency } from 'src/utils/format-number';

import { useCloseWorkOrder } from 'src/query/use-work-order';

import { Iconify } from 'src/components/iconify';

export function WorkOrderCloseDialog({ open, onClose, workOrder }) {
  const closeWorkOrder = useCloseWorkOrder();
  const [isClosing, setIsClosing] = useState(false);
  const [closeMode, setCloseMode] = useState('closeOnly'); // 'closeOnly' | 'closeAndExpense'

  const computed = useMemo(
    () => ({
      totalCost: typeof workOrder?.totalCost === 'number' ? workOrder.totalCost : 0,
    }),
    [workOrder?.totalCost]
  );

  const handleConfirmClose = useCallback(async () => {
    if (!workOrder?._id) return;
    try {
      setIsClosing(true);
      await closeWorkOrder({
        id: workOrder._id,
        createExpense: closeMode === 'closeAndExpense',
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsClosing(false);
    }
  }, [workOrder?._id, closeWorkOrder, closeMode, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Close Work Order</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          This will mark the work order as <strong>Completed</strong>
          {workOrder?.category === 'External Workshop'
            ? ' without deducting inventory since it is an External Workshop work order.'
            : ' and adjust inventory for all parts used.'}
        </Typography>

        <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
          <FormLabel component="legend">Action</FormLabel>
          <RadioGroup
            aria-label="close-mode"
            name="close-mode"
            value={closeMode}
            onChange={(e) => setCloseMode(e.target.value)}
          >
            <FormControlLabel value="closeOnly" control={<Radio />} label="Close Only" />
            <FormControlLabel
              value="closeAndExpense"
              control={<Radio />}
              label="Close & Add as Vehicle Expense"
            />
          </RadioGroup>
        </FormControl>

        {closeMode === 'closeAndExpense' && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            An expense of <strong>{fCurrency(computed.totalCost)}</strong> will be added to this
            vehicle.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isClosing}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirmClose}
          disabled={isClosing}
          startIcon={
            isClosing ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Iconify icon="mdi:check-decagram-outline" />
            )
          }
        >
          {isClosing ? 'Closing...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
