import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

export default function TyreHistoryUpdateDialog({ open, onClose, onSubmit, historyItem }) {
  const [odometer, setOdometer] = useState('');

  useEffect(() => {
    if (open && historyItem) {
      setOdometer(historyItem.odometer || '');
    }
  }, [open, historyItem]);

  const handleSubmit = () => {
    if (!odometer) return;
    onSubmit({
      odometer: Number(odometer),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Odometer Reading</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Update the odometer reading for this <b>{historyItem?.action}</b> event. This will
          recalculate relevant mileage.
        </Typography>

        <TextField
          autoFocus
          fullWidth
          label="Odometer Reading"
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!odometer}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
