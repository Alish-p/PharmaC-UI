import { useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { styled } from '@mui/material/styles';
import {
  Card,
  Table,
  Stack,
  Switch,
  Button,
  Divider,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TextField,
  Typography,
  IconButton,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { usePendingLoans } from 'src/query/use-loan';
import { useSubtripsByTransporter } from 'src/query/use-subtrip';
import { useCreateBulkTransporterPayment } from 'src/query/use-transporter-payment';

import { Iconify } from 'src/components/iconify';
import { TableSkeleton } from 'src/components/table';
import { APP_ICONS } from 'src/components/iconify/icons';
import { DialogSelectButton } from 'src/components/dialog-select-button';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { useTenantContext } from 'src/auth/tenant';

import LoanDeductionCard from '../loans/loan-deduction-card';
import {
  calculateTransporterPayment,
  calculateTransporterPaymentSummary,
} from './utils/transporter-payment-calculations';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': { borderBottom: 'none', paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1) },
}));

const StyledTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

function BulkTransporterPaymentIndividualCard({
  tenant,
  pay,
  index,
  onToggleSelect,
  onRemoveSubtrip,
  onAddCharge,
  onRemoveCharge,
  onChangeCharge,
  onLoanDeductionsChange,
}) {
  const { transporter, subtrips, additionalCharges, selected, loanDeductions = [] } = pay;

  const { data: pendingLoans = [], isLoading: loansLoading } = usePendingLoans(
    'Transporter',
    transporter._id
  );

  const podCharge = subtrips.length * (transporter.podCharges || 0);

  const loanChargesForSummary = selected
    ? loanDeductions.map((ld) => ({ label: 'Loan Repayment', amount: -ld.amount }))
    : [];

  const summary = calculateTransporterPaymentSummary(subtrips, transporter, [
    { label: 'POD Charges', amount: podCharge * -1 },
    ...additionalCharges.map((c) => ({ label: c.label, amount: Number(c.amount) || 0 })),
    ...loanChargesForSummary,
  ]);
  const {
    taxBreakup,
    totalFreightAmount,
    totalExpense,
    totalShortageAmount,
    totalTripWiseIncome,
    netIncome,
  } = summary;

  return (
    <Card sx={{ p: 3, mb: 3, opacity: selected ? 1 : 0.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">{transporter.transportName}</Typography>
        <FormControlLabel
          control={<Switch checked={selected} onChange={() => onToggleSelect(index)} />}
          label="Include"
        />
      </Stack>

      <Stack
        spacing={{ xs: 3, md: 5 }}
        direction={{ xs: 'column', md: 'row' }}
        divider={<Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed' }} />}
      >
        <Stack sx={{ width: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled', mb: 1 }}>
            From:
          </Typography>
          <Stack spacing={1}>
            <Typography variant="subtitle2">{tenant?.name}</Typography>
            <Typography variant="body2">{tenant?.address?.line1}</Typography>
            <Typography variant="body2">{tenant?.address?.line2}</Typography>
            <Typography variant="body2">{tenant?.address?.state}</Typography>
            <Typography variant="body2">Phone: {tenant?.contactDetails?.phone}</Typography>
          </Stack>
        </Stack>

        <Stack sx={{ width: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled', mb: 1 }}>
            To:
          </Typography>
          <Stack spacing={1}>
            <Typography variant="subtitle2">{transporter.transportName}</Typography>
            <Typography variant="body2">{transporter.address}</Typography>
            <Typography variant="body2">{transporter.cellNo}</Typography>
          </Stack>
        </Stack>
      </Stack>

      <LoanDeductionCard
        loans={pendingLoans}
        isLoading={loansLoading}
        onChange={(deductions) => onLoanDeductionsChange(index, deductions)}
      />

      <TableContainer sx={{ overflowX: 'auto', mt: 3 }}>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              {[
                '#',
                'Dispatch Date',
                'LR No.',
                'VEH No',
                'From',
                'Destination',
                'InvoiceNo',
                'Shortage Qty',
                'Shortage Amt',
                'FRT-AMT',
                'Expense',
                'Total Payable',
              ].map((h, idx) => (
                <StyledTableCell key={h} align={idx < 7 ? 'center' : 'right'}>
                  {h}
                </StyledTableCell>
              ))}
              <StyledTableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {subtrips.map((st, si) => {
              const {
                totalFreightAmount: freightAmount,
                totalExpense: expense,
                totalTransporterPayment,
                totalShortageAmount: shortageAmount,
              } = calculateTransporterPayment(st);
              return (
                <TableRow key={st._id}>
                  <TableCell>{si + 1}</TableCell>
                  <TableCell>{fDate(st.startDate)}</TableCell>
                  <TableCell>{st.subtripNo}</TableCell>
                  <TableCell>{st.vehicleId?.vehicleNo}</TableCell>
                  <TableCell>{st.loadingPoint}</TableCell>
                  <TableCell>{st.unloadingPoint}</TableCell>
                  <TableCell>{st.invoiceNo}</TableCell>
                  <TableCell align="right">{st.shortageWeight}</TableCell>
                  <TableCell align="right">{fCurrency(shortageAmount)}</TableCell>
                  <TableCell align="right">{fCurrency(freightAmount)}</TableCell>
                  <TableCell align="right">{fCurrency(expense)}</TableCell>
                  <TableCell align="right">{fCurrency(totalTransporterPayment)}</TableCell>
                  <TableCell width={40}>
                    <IconButton color="error" onClick={() => onRemoveSubtrip(index, si)}>
                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            <StyledTableRow>
              <TableCell colSpan={7} />
              <StyledTableCell sx={{ color: 'info.main' }}>Total</StyledTableCell>
              <TableCell align="right" sx={{ color: 'info.main' }}>
                {fCurrency(totalShortageAmount)}
              </TableCell>
              <TableCell align="right" sx={{ color: 'info.main' }}>
                {fCurrency(totalFreightAmount)}
              </TableCell>
              <TableCell align="right" sx={{ color: 'info.main' }}>
                {fCurrency(totalExpense)}
              </TableCell>
              <TableCell align="right" sx={{ color: 'info.main' }}>
                {fCurrency(totalTripWiseIncome)}
              </TableCell>
              <TableCell />
            </StyledTableRow>

            {taxBreakup?.tds?.rate > 0 && (
              <StyledTableRow>
                <TableCell colSpan={11} align="right">
                  TDS ({taxBreakup.tds.rate}%)
                </TableCell>
                <TableCell sx={{ color: 'error.main' }} align="right">
                  -{fCurrency(taxBreakup.tds.amount)}
                </TableCell>
                <TableCell />
              </StyledTableRow>
            )}

            {['cgst', 'sgst', 'igst'].map((k) => {
              const item = taxBreakup[k];
              return item?.rate > 0 ? (
                <StyledTableRow key={k}>
                  <TableCell colSpan={11} align="right">
                    {k.toUpperCase()} ({item.rate}%)
                  </TableCell>
                  <TableCell align="right">{fCurrency(item.amount)}</TableCell>
                  <TableCell />
                </StyledTableRow>
              ) : null;
            })}

            {podCharge > 0 && (
              <StyledTableRow>
                <TableCell colSpan={11} align="right">
                  POD Charges
                </TableCell>
                <TableCell sx={{ color: 'error.main' }} align="right">
                  -{fCurrency(podCharge)}
                </TableCell>
                <TableCell />
              </StyledTableRow>
            )}

            {additionalCharges.map((ch, ci) => (
              <StyledTableRow key={ci}>
                <TableCell colSpan={11} align="right">
                  <TextField
                    style={{ width: 150 }}
                    value={ch.label}
                    onChange={(e) => onChangeCharge(index, ci, 'label', e.target.value)}
                    placeholder="Label"
                    size="small"
                    variant="filled"
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                    <TextField
                      style={{ width: 100 }}
                      value={ch.amount}
                      onChange={(e) => onChangeCharge(index, ci, 'amount', e.target.value)}
                      placeholder="Amount"
                      size="small"
                      variant="filled"
                    />
                    <IconButton color="error" onClick={() => onRemoveCharge(index, ci)}>
                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell />
              </StyledTableRow>
            ))}

            <StyledTableRow>
              <TableCell colSpan={13}>
                <Button size="small" onClick={() => onAddCharge(index)}>
                  Add Extra Charge
                </Button>
              </TableCell>
            </StyledTableRow>

            <StyledTableRow>
              <TableCell colSpan={11} align="right">
                <strong>Net Total</strong>
              </TableCell>
              <TableCell align="right" sx={{ color: 'success.main' }}>
                {fCurrency(netIncome)}
              </TableCell>
              <TableCell />
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export default function BulkTransporterPaymentSimpleForm() {
  const dateRangeDialog = useBoolean();
  const navigate = useNavigate();
  const tenant = useTenantContext();
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const { data = [], isLoading } = useSubtripsByTransporter(dateRange.start, dateRange.end);
  const createBulk = useCreateBulkTransporterPayment();

  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (data?.length) {
      setPayments(
        data.map(({ transporter, subtrips }) => ({
          transporter,
          subtrips,
          additionalCharges: [],
          loanDeductions: [],
          selected: true,
        }))
      );
    } else {
      setPayments([]);
    }
  }, [data]);

  const handleRemoveSubtrip = useCallback((ti, si) => {
    setPayments((prev) => {
      const copy = [...prev];
      copy[ti].subtrips.splice(si, 1);
      return copy;
    });
  }, []);

  const handleAddCharge = useCallback((ti) => {
    setPayments((prev) => {
      const copy = [...prev];
      copy[ti].additionalCharges.push({ label: '', amount: '' });
      return copy;
    });
  }, []);

  const handleRemoveCharge = useCallback((ti, ci) => {
    setPayments((prev) => {
      const copy = [...prev];
      copy[ti].additionalCharges.splice(ci, 1);
      return copy;
    });
  }, []);

  const handleChangeCharge = useCallback((ti, ci, field, value) => {
    setPayments((prev) => {
      const copy = [...prev];
      copy[ti].additionalCharges[ci][field] = value;
      return copy;
    });
  }, []);

  const toggleSelect = useCallback((ti) => {
    setPayments((prev) => {
      const copy = [...prev];
      copy[ti].selected = !copy[ti].selected;
      return copy;
    });
  }, []);

  const handleLoanDeductionsChange = useCallback((ti, deductions) => {
    setPayments((prev) => {
      const copy = [...prev];
      copy[ti].loanDeductions = deductions;
      return copy;
    });
  }, []);

  const handleCreate = async () => {
    const selectedPayments = payments.filter((p) => p.selected && p.subtrips.length);
    if (selectedPayments.length === 0) return;

    await executeBulkCreate(selectedPayments);
  };

  const executeBulkCreate = async (payloadItems) => {
    const payload = payloadItems.map(
      ({ transporter, subtrips, additionalCharges, loanDeductions = [] }) => {
        const loanCharges = loanDeductions.map((ld) => ({
          label: 'Loan Repayment',
          amount: -ld.amount,
        }));

        return {
          transporterId: transporter._id,
          billingPeriod: dateRange,
          associatedSubtrips: subtrips.map((st) => st._id),
          additionalCharges: [
            {
              label: 'POD Charges',
              amount: subtrips.length * (transporter.podCharges || 0) * -1,
            },
            ...additionalCharges.map((c) => ({ label: c.label, amount: Number(c.amount) || 0 })),
            ...loanCharges,
          ],
          loanDeductions,
        };
      }
    );

    if (payload.length === 0) return;
    try {
      await createBulk(payload);
      navigate(paths.dashboard.transporterPayment.root);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h6">Select Date Range</Typography>
          <DialogSelectButton
            placeholder="Select Date Range"
            selected={
              dateRange.start && dateRange.end
                ? `${fDate(dateRange.start)} – ${fDate(dateRange.end)}`
                : 'Select Date Range'
            }
            onClick={dateRangeDialog.onTrue}
            iconName={APP_ICONS.calendar}
            disabled={isLoading}
          />
          <CustomDateRangePicker
            variant="calendar"
            presets={DATE_RANGE_PRESETS}
            open={dateRangeDialog.value}
            onClose={dateRangeDialog.onFalse}
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChangeStartDate={(d) => setDateRange({ ...dateRange, start: d })}
            onChangeEndDate={(d) => setDateRange({ ...dateRange, end: d })}
            onApplyRange={(start, end) => setDateRange({ start, end })}
          />
        </Stack>
      </Card>

      {isLoading && <TableSkeleton />}

      {!isLoading &&
        payments.map((pay, ti) => (
          <BulkTransporterPaymentIndividualCard
            key={pay.transporter._id}
            tenant={tenant}
            pay={pay}
            index={ti}
            onToggleSelect={toggleSelect}
            onRemoveSubtrip={handleRemoveSubtrip}
            onAddCharge={handleAddCharge}
            onRemoveCharge={handleRemoveCharge}
            onChangeCharge={handleChangeCharge}
            onLoanDeductionsChange={handleLoanDeductionsChange}
          />
        ))}

      {payments.length > 0 && (
        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
          <LoadingButton variant="contained" onClick={handleCreate} loading={false}>
            Generate Bulk Payments
          </LoadingButton>
        </Stack>
      )}
    </>
  );
}
