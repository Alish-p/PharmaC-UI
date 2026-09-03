import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { useGps } from 'src/query/use-gps';
import { useTenant } from 'src/query/use-tenant';
import { useVehicle, useUpdateVehicle } from 'src/query/use-vehicle';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Dialog to update a vehicle's current odometer reading directly from the Tyre list.
 *
 * Props:
 *   open        – boolean
 *   onClose     – () => void
 *   vehicleId   – string   (row.currentVehicleId._id or row.currentVehicleId)
 *   vehicleNo   – string   (row.currentVehicleId.vehicleNo) – used for GPS + labels
 */
export default function TyreOdometerUpdateDialog({ open, onClose, vehicleId, vehicleNo }) {
  const [odometer, setOdometer] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: vehicle } = useVehicle(open ? vehicleId : null);
  const updateVehicle = useUpdateVehicle();

  const { data: tenant } = useTenant();
  const gpsEnabled = !!tenant?.integrations?.vehicleGPS?.enabled;

  const { data: gpsData, isLoading: isLoadingGps } = useGps(vehicleNo || '', {
    enabled: open && gpsEnabled && !!vehicleNo,
  });

  // Pre-fill with current odometer on open
  useEffect(() => {
    if (open) {
      const current = vehicle?.currentOdometer ?? gpsData?.totalOdometer ?? '';
      setOdometer(current);
    }
  }, [open, vehicle, gpsData]);

  const lastOdometer = vehicle?.currentOdometer || 0;
  const diff = odometer !== '' ? Number(odometer) - lastOdometer : 0;
  const isGpsSuspicious = gpsData?.totalOdometer != null && gpsData.totalOdometer < lastOdometer;
  const isInvalid = odometer === '' || diff < 0;

  const handleClose = () => {
    setOdometer('');
    onClose();
  };

  const handleSave = async () => {
    if (!vehicleId || isInvalid) return;
    setIsSaving(true);
    try {
      await updateVehicle({ id: vehicleId, data: { currentOdometer: Number(odometer) } });
      handleClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Update Odometer</DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Update the current odometer reading for vehicle <b>{vehicleNo}</b>.
        </Typography>

        <TextField
          autoFocus
          fullWidth
          size="small"
          label={`Last Reading: ${lastOdometer} km`}
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          error={diff < 0}
          InputProps={{
            endAdornment: <InputAdornment position="end">km</InputAdornment>,
          }}
          helperText={
            odometer !== '' && diff !== 0 ? (
              <Box component="span" sx={{ color: diff > 0 ? 'success.main' : 'error.main' }}>
                {diff > 0 ? `+${diff}` : diff} km from last reading
              </Box>
            ) : (
              ''
            )
          }
        />

        {gpsEnabled && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            {isLoadingGps ? (
              <Typography variant="caption" color="text.secondary">
                Fetching GPS data…
              </Typography>
            ) : gpsData?.totalOdometer != null ? (
              <Button
                size="small"
                variant="soft"
                color={isGpsSuspicious ? 'error' : 'primary'}
                onClick={() => setOdometer(gpsData.totalOdometer)}
                startIcon={
                  <Iconify icon={isGpsSuspicious ? 'mdi:alert-circle' : 'solar:gps-bold'} />
                }
                fullWidth
              >
                Use GPS: {gpsData.totalOdometer} km
                {isGpsSuspicious && ' (suspicious — lower than saved)'}
              </Button>
            ) : (
              <Typography variant="caption" color="error">
                GPS unavailable for this vehicle
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isInvalid || isSaving}
          loading={isSaving}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
