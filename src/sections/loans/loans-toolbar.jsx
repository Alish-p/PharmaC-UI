// LoansToolbar.jsx
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Stack,
  Button,
  Dialog,
  Tooltip,
  TextField,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useRepayLoan } from 'src/query/use-loan';

import { Iconify } from 'src/components/iconify';

import { useTenantContext } from 'src/auth/tenant';

import LoansPDF from './loans-pdf';

export default function LoansToolbar({ loan, onActionSuccess }) {
  const view = useBoolean();
  const tenant = useTenantContext();

  // Repay
  const repay = useRepayLoan();
  const [openRepay, setOpenRepay] = useState(false);
  const [repayForm, setRepayForm] = useState({
    amount: '',
    paidDate: dayjs(),
    remarks: '',
  });

  // Handlers
  const handleField = (setter) => (e) => setter(e.target.value);

  const startRepay = () => {
    setRepayForm({ amount: '', paidDate: dayjs(), remarks: '' });
    setOpenRepay(true);
  };

  const submitRepay = async () => {
    await repay({
      id: loan._id,
      amount: parseFloat(repayForm.amount),
      paidDate: repayForm.paidDate.toISOString(),
      remarks: repayForm.remarks,
    });
    setOpenRepay(false);
    onActionSuccess?.();
  };

  return (
    <>
      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="center" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} flexGrow={1}>
          <Tooltip title="View PDF">
            <IconButton onClick={view.onTrue}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <PDFDownloadLink
            document={<LoansPDF loan={loan} tenant={tenant} />}
            fileName={loan._id}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Tooltip title="Download PDF">
                <IconButton>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Iconify icon="eva:cloud-download-fill" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </PDFDownloadLink>

          {loan.status === 'active' && (
            <Tooltip title="Record Payment">
              <IconButton color="primary" onClick={startRepay}>
                <Iconify icon="solar:hand-money-linear" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* PDF Viewer */}
      <Dialog fullScreen open={view.value}>
        <DialogActions sx={{ p: 1 }}>
          <Button variant="contained" onClick={view.onFalse}>
            Close
          </Button>
        </DialogActions>
        <PDFViewer style={{ flex: 1, border: 'none' }}>
          <LoansPDF loan={loan} tenant={tenant} />
        </PDFViewer>
      </Dialog>

      {/* Repay Dialog */}
      <Dialog open={openRepay} onClose={() => setOpenRepay(false)} fullWidth maxWidth="xs">
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={repayForm.amount}
            onChange={handleField((v) => setRepayForm((f) => ({ ...f, amount: v })))}
            placeholder={`Max: ₹${loan.outstandingBalance}`}
            sx={{ mb: 2 }}
          />
          <DatePicker
            label="Payment Date"
            value={repayForm.paidDate}
            onChange={(d) => setRepayForm((f) => ({ ...f, paidDate: d }))}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
          />
          <TextField
            label="Remarks"
            multiline
            rows={2}
            fullWidth
            value={repayForm.remarks}
            onChange={handleField((v) => setRepayForm((f) => ({ ...f, remarks: v })))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRepay(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitRepay}
            disabled={!repayForm.amount || parseFloat(repayForm.amount) <= 0}
          >
            Submit Payment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
