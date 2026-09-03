import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useGps } from 'src/query/use-gps';

export default function TyreUnmountDialog({ open, onClose, onUnmount, vehicleName }) {
  const [odometer, setOdometer] = useState('');

  const { data: gpsData } = useGps(vehicleName, { enabled: open && !!vehicleName });

  useEffect(() => {
    if (open) {
      setOdometer(gpsData?.totalOdometer || '');
    }
  }, [open, gpsData]);

  const handleSubmit = () => {
    if (!odometer) return;
    onUnmount({
      odometer: Number(odometer),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Unmount Tyre</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Please enter the current odometer reading of <b>{vehicleName}</b> to unmount this tyre.
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
        <Button
          variant="contained"
          color="error" // Red color since it's an unmount/destructive-like action
          onClick={handleSubmit}
          disabled={!odometer}
        >
          Unmount
        </Button>
      </DialogActions>
    </Dialog>
  );
}
