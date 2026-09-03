import { useState, useEffect } from 'react';

import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

export default function LoanDeductionCard({ loans = [], isLoading, onChange }) {
  const [selections, setSelections] = useState([]);

  useEffect(() => {
    if (loans.length > 0) {
      const initialSelections = loans.map((loan) => ({
        loanId: loan._id,
        checked: true,
        amount: loan.outstandingBalance || 0,
        loan,
      }));
      setSelections(initialSelections);
      onChange?.(
        initialSelections
          .filter((s) => s.checked && s.amount > 0)
          .map(({ loanId, amount, loan }) => ({ loanId, amount, loanNo: loan?.loanNo }))
      );
    } else {
      setSelections([]);
      onChange?.([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loans]);

  const handleToggle = (index) => {
    setSelections((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], checked: !copy[index].checked };
      onChange?.(
        copy
          .filter((s) => s.checked && Number(s.amount) > 0)
          .map(({ loanId, amount, loan }) => ({
            loanId,
            amount: Number(amount),
            loanNo: loan?.loanNo,
          }))
      );
      return copy;
    });
  };

  const handleAmountChange = (index, value) => {
    setSelections((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], amount: value === '' ? '' : Number(value) };
      onChange?.(
        copy
          .filter((s) => s.checked && Number(s.amount) > 0)
          .map(({ loanId, amount, loan }) => ({
            loanId,
            amount: Number(amount),
            loanNo: loan?.loanNo,
          }))
      );
      return copy;
    });
  };

  if (!isLoading && loans.length === 0) {
    return null;
  }

  const totalDeduction = selections
    .filter((s) => s.checked && Number(s.amount) > 0)
    .reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <Card sx={{ p: 3, my: 3, border: (theme) => `dashed 1px ${theme.palette.warning.main}` }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6" color="warning.dark">
          Active Loans Detected
        </Typography>
        <Chip label={`${loans.length} active`} color="warning" size="small" />
      </Stack>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && selections.length > 0 && (
        <TableContainer sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Loan No.</TableCell>
                <TableCell>Principal</TableCell>
                <TableCell>Issued On</TableCell>
                <TableCell align="right">Outstanding</TableCell>
                <TableCell align="right" sx={{ width: 220 }}>
                  Deduction Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selections.map((sel, idx) => {
                const { loan } = sel;
                const isError = Number(sel.amount) > loan.outstandingBalance;

                return (
                  <TableRow key={sel.loanId}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={sel.checked}
                        onChange={() => handleToggle(idx)}
                        color="warning"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{loan.loanNo}</Typography>
                    </TableCell>
                    <TableCell>{fCurrency(loan.principalAmount)}</TableCell>
                    <TableCell>{fDate(loan.disbursementDate)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="error.main">
                        {fCurrency(loan.outstandingBalance)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        disabled={!sel.checked}
                        value={sel.amount}
                        onChange={(e) => handleAmountChange(idx, e.target.value)}
                        inputProps={{
                          min: 0,
                          max: loan.outstandingBalance,
                        }}
                        error={isError}
                        helperText={isError ? 'Exceeds balance' : ''}
                        sx={{ width: 150 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!isLoading && totalDeduction > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Total loan deduction: <strong>{fCurrency(totalDeduction)}</strong> will be subtracted from
          the payment.
        </Alert>
      )}
    </Card>
  );
}
