import { z } from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useGps } from 'src/query/use-gps';

import { Form, Field } from 'src/components/hook-form';

import { TYRE_STATUS } from '../tyre-constants';

// ----------------------------------------------------------------------

export default function TyreScrapDialog({ open, onClose, onScrap, currentStatus, vehicleNo }) {
  // Define schema conditionally or just make odometer nullable/optional in refinement
  // However, simplicity: require all, but handle logic in submit or schema builder

  const ScrapTyreSchema = z.object({
    scrapDate: z.date(),
    odometer:
      currentStatus === TYRE_STATUS.MOUNTED
        ? z.coerce.number().min(1, 'Odometer is required')
        : z.coerce.number().optional(),
  });

  const methods = useForm({
    resolver: zodResolver(ScrapTyreSchema),
    defaultValues: {
      scrapDate: new Date(),
      odometer: '',
    },
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { data: gpsData } = useGps(vehicleNo, {
    enabled: open && !!vehicleNo && currentStatus === TYRE_STATUS.MOUNTED,
  });

  useEffect(() => {
    if (open && gpsData?.totalOdometer) {
      setValue('odometer', gpsData.totalOdometer);
    }
  }, [open, gpsData, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    await onScrap(data);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Move Tyre to Scrap</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Field.DatePicker name="scrapDate" label="Scrap Date" sx={{ mt: 2, width: '100%' }} />

          {currentStatus === TYRE_STATUS.MOUNTED && (
            <Field.Text
              name="odometer"
              label="Odometer Reading"
              type="number"
              sx={{ mt: 2 }}
              helperText="Enter current odometer reading to calculate final distance"
            />
          )}
        </Form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" color="error" loading={isSubmitting}>
          Scrap
        </Button>
      </DialogActions>
    </Dialog>
  );
}
