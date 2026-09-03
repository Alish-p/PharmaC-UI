import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Box,
  Card,
  Stack,
  Button,
  Dialog,
  Divider,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { usePayInvoice } from 'src/query/use-invoice';

// ----------------------------------------------------------------------

export default function InvoicePaymentDialog({ open, onClose, invoice }) {
  const total = invoice?.netTotal || 0;
  const paid = invoice?.totalReceived || 0;
  const remaining = Math.max(0, total - paid);

  const payInvoice = usePayInvoice();

  const [amount, setAmount] = useState(remaining);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receivedDate, setReceivedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);

  const afterPayment = useMemo(() => Math.max(0, remaining - amount), [remaining, amount]);

  const isAmountInvalid = amount <= 0 || amount > remaining;

  const handleSubmit = async () => {
    if (isAmountInvalid) return;
    try {
      setLoading(true);
      await payInvoice({
        id: invoice?._id,
        amount,
        referenceNumber,
        receivedDate: receivedDate.toISOString(),
      });
      onClose();
    } catch (error) {
      // error handled by hook
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Record payment</Typography>
          <Typography variant="subtitle2" color="primary.main">
            {invoice?.invoiceNo}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Payment summary</Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Total</Typography>
                <Typography variant="body2">{fCurrency(total)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Received</Typography>
                <Typography variant="body2">{fCurrency(paid)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Remaining</Typography>
                <Typography variant="body2">{fCurrency(remaining)}</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">After payment</Typography>
                <Typography
                  variant="body2"
                  color={afterPayment === 0 ? 'success.main' : 'text.primary'}
                >
                  {fCurrency(afterPayment)}
                </Typography>
              </Stack>
            </Stack>
          </Card>

          <Stack spacing={1}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              error={isAmountInvalid}
              helperText={isAmountInvalid ? 'Enter a valid amount' : ''}
            />
            <TextField
              label="Reference Number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
            <DatePicker
              label="Received Date"
              value={receivedDate}
              onChange={(newValue) => setReceivedDate(newValue)}
              maxDate={dayjs()}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isAmountInvalid || loading}>
          {loading ? <CircularProgress size={24} /> : 'Record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
