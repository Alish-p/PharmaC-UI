import axios from 'axios';
import { useFormContext } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';

import {
  Box,
  Stack,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { Field } from 'src/components/hook-form';

// A lightweight, reusable widget to capture bank details within any form.
// Features:
// - IFSC lookup via Razorpay API
// - Auto-populates bank name/branch/place; allows manual override
// - Configurable field name mapping to fit different forms
//
// Usage examples:
//  - Standard (customer/transporter/driver):
//    <BankDetailsWidget fieldNames={{
//       ifsc: 'bankDetails.ifsc', name: 'bankDetails.name', branch: 'bankDetails.branch',
//       place: 'bankDetails.place', accNo: 'bankDetails.accNo'
//    }} />
//  - Pump form (bankAccount prefix):
//    <BankDetailsWidget fieldNames={{
//       ifsc: 'bankAccount.ifsc', name: 'bankAccount.name', branch: 'bankAccount.branch',
//       place: 'bankAccount.place', accNo: 'bankAccount.accNo'
//    }} />
//  - Tenant form (unified schema):
//    <BankDetailsWidget fieldNames={{
//       ifsc: 'bankDetails.ifsc', name: 'bankDetails.name', branch: 'bankDetails.branch',
//       place: 'bankDetails.place', accNo: 'bankDetails.accNo'
//    }} />

const ifscClient = axios.create({
  baseURL: 'https://ifsc.razorpay.com',
  withCredentials: false,
  headers: {},
});

export function BankDetailsWidget({ title, fieldNames, variant = 'inline', open, onClose }) {
  const requiredKeys = useMemo(() => ['ifsc', 'name'], []);
  if (!fieldNames || !requiredKeys.every((k) => fieldNames[k])) {
    // eslint-disable-next-line no-console
    console.warn('BankDetailsWidget: fieldNames.ifsc and fieldNames.name are required');
  }

  const { watch, setValue, setError, clearErrors } = useFormContext();

  const ifscField = fieldNames?.ifsc;
  const nameField = fieldNames?.name;
  const branchField = fieldNames?.branch; // optional
  const placeField = fieldNames?.place; // optional
  const accNoField = fieldNames?.accNo; // optional

  const ifscValue = watch(ifscField);
  // Note: fields are controlled by React Hook Form; no need to watch other values here

  const [ifscLoading, setIfscLoading] = useState(false);

  useEffect(() => {
    const code = typeof ifscValue === 'string' ? ifscValue.trim().toUpperCase() : '';
    if (!ifscField || !code || code.length !== 11) return;

    setIfscLoading(true);
    ifscClient
      .get(`/${code}`)
      .then(({ data }) => {
        if (nameField) setValue(nameField, data.BANK || '');
        if (branchField) setValue(branchField, data.BRANCH || '');
        if (placeField) setValue(placeField, data.CENTRE || '');
        clearErrors(ifscField);
      })
      .catch((err) => {
        setError(ifscField, {
          type: 'manual',
          message:
            err?.response?.status === 404 ? 'Invalid IFSC code' : 'Network error, please try again',
        });
        // eslint-disable-next-line no-console
        console.error('IFSC lookup failed:', err);
      })
      .finally(() => setIfscLoading(false));
  }, [ifscValue, ifscField, nameField, branchField, placeField, setValue, setError, clearErrors]);

  const Content = (
    <Stack spacing={2} sx={{ pt: variant === 'dialog' ? 1 : 0 }}>
      {/* IFSC input with auto-lookup */}
      {ifscField && (
        <Field.Text
          name={ifscField}
          label="IFSC"
          placeholder="e.g. HDFC0001234"
          InputProps={{ endAdornment: ifscLoading && <CircularProgress size={20} /> }}
        />
      )}

      {/* Details grid (manual override) */}
      <Box
        display="grid"
        rowGap={2}
        columnGap={2}
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
        sx={{ mt: 1 }}
      >
        {accNoField && (
          <Field.Text name={accNoField} label="Account No" placeholder="Enter account number" />
        )}
        {nameField && <Field.Text name={nameField} label="Bank Name" />}
        {branchField && <Field.Text name={branchField} label="Branch" />}
        {placeField && <Field.Text name={placeField} label="Place" />}
      </Box>

      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Tip: IFSC lookup auto-fills details. You can still edit manually.
      </Typography>
    </Stack>
  );

  if (variant === 'dialog') {
    return (
      <Dialog fullWidth maxWidth="sm" open={!!open} onClose={onClose}>
        <DialogTitle>{title || 'Bank Details'}</DialogTitle>
        <DialogContent dividers>{Content}</DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={onClose}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return Content;
}
