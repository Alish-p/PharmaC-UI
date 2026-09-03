import dayjs from 'dayjs';
import React, { useState, useCallback } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { useUpdateWorkOrder } from 'src/query/use-work-order';

import { Iconify } from 'src/components/iconify';

export function WorkOrderStartDialog({ open, onClose, workOrder }) {
  const updateWorkOrder = useUpdateWorkOrder();
  const [selectedStartDate, setSelectedStartDate] = useState(dayjs());
  const [isStarting, setIsStarting] = useState(false);

  const handleConfirmStartWork = useCallback(async () => {
    if (!workOrder?._id) return;
    try {
      setIsStarting(true);
      await updateWorkOrder({
        id: workOrder._id,
        data: {
          status: 'inprogress',
          actualStartDate: selectedStartDate.toDate(),
          scheduledStartDate: workOrder.scheduledStartDate,
          category: workOrder.category,
          issues: (workOrder.issues || []).map((iss) => {
            const issueText = typeof iss === 'string' ? iss : iss.issue;
            const assignedToIds = Array.isArray(iss.assignedTo)
              ? iss.assignedTo.map((u) => u._id || u)
              : undefined;
            return {
              issue: issueText,
              assignedTo: assignedToIds,
            };
          }),
        },
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  }, [workOrder, updateWorkOrder, selectedStartDate, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Start Work</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Please select the actual start date to put this work order <strong>In Progress</strong>.
        </Typography>
        <MobileDateTimePicker
          label="Actual Start Date & Time"
          value={selectedStartDate}
          onChange={(newValue) => setSelectedStartDate(newValue)}
          maxDateTime={dayjs()}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: 'outlined',
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isStarting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirmStartWork}
          disabled={isStarting}
          startIcon={
            isStarting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Iconify icon="solar:play-bold" />
            )
          }
        >
          {isStarting ? 'Starting...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

