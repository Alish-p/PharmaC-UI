import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import { LoadingButton } from '@mui/lab';
import { styled } from '@mui/material/styles';
import {
  Card,
  Link,
  Stack,
  Table,
  Button,
  Divider,
  Tooltip,
  TableRow,
  Checkbox,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  TableContainer,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fNumber, fCurrency } from 'src/utils/format-number';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';
import { fDate, fDateRangeShortLabel } from 'src/utils/format-time';

import { usePendingLoans } from 'src/query/use-loan';
import { useFetchSubtripsForTransporterBilling } from 'src/query/use-subtrip';
import { useCreateTransporterPayment } from 'src/query/use-transporter-payment';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import {
  getWeightUnit,
  calculateTotalWeight,
  getFreightExplanation,
} from 'src/sections/subtrip/utils';

import { useTenantContext } from 'src/auth/tenant';

import { TableSkeleton } from '../../components/table';
import LoanDeductionCard from '../loans/loan-deduction-card';
import { Form, Field, schemaHelper } from '../../components/hook-form';
import { KanbanTransporterDialog } from '../kanban/components/kanban-transporter-dialog';
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

const PaymentSchema = zod.object({
  transporter: zod
    .any()
    .nullable()
    .refine((val) => !!val, 'Transporter is required'),
  billingPeriod: zod
    .object({
      start: schemaHelper.date({ required_error: 'Start date is required' }),
      end: schemaHelper.date({ required_error: 'End date is required' }),
    })
    .refine(
      (data) => {
        if (!data.start || !data.end) return true;
        return (
          dayjs(data.end).isAfter(dayjs(data.start)) || dayjs(data.end).isSame(dayjs(data.start))
        );
      },
      { message: 'End date must be after or equal to start date', path: ['end'] }
    ),
  subtrips: zod.array(zod.any()).min(1, 'Select at least one subtrip'),
  additionalCharges: zod
    .array(
      zod.object({
        label: zod.string().min(1, 'Label is required'),
        amount: zod
          .preprocess((val) => Number(val), zod.number())
          .refine((val) => val !== 0, 'Amount cannot be zero'),
      })
    )
    .default([]),
});

export default function TransporterPaymentSimpleForm({ currentTransporter = null }) {
  const transporterDialog = useBoolean();
  const dateDialog = useBoolean();
  const tenant = useTenantContext();
  const [loanDeductions, setLoanDeductions] = useState([]);

  const methods = useForm({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      transporter: currentTransporter,
      billingPeriod: { start: dayjs().startOf('month'), end: dayjs() },
      subtrips: [],
      additionalCharges: [],
    },
  });

  const {
    watch,
    setValue,
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const { replace } = useFieldArray({ control, name: 'subtrips' });

  const {
    fields: additionalFields,
    append: appendCharge,
    remove: removeCharge,
  } = useFieldArray({ name: 'additionalCharges', control });

  const { transporter, billingPeriod, subtrips, additionalCharges } = watch();

  const {
    data: fetchedSubtrips,
    isSuccess,
    isLoading,
    refetch,
  } = useFetchSubtripsForTransporterBilling(
    transporter?._id,
    billingPeriod?.start,
    billingPeriod?.end
  );

  const createPayment = useCreateTransporterPayment();
  const navigate = useNavigate();

  // Fetch pending loans for selected transporter
  const { data: pendingLoans = [], isLoading: loansLoading } = usePendingLoans(
    'Transporter',
    transporter?._id
  );

  useEffect(() => {
    if (transporter?._id && billingPeriod?.start && billingPeriod?.end) {
      refetch();
    }
  }, [transporter?._id, billingPeriod?.start, billingPeriod?.end, refetch]);

  useEffect(() => {
    if (isSuccess && fetchedSubtrips) {
      const withSelection = fetchedSubtrips.map((st) => ({ ...st, selected: false }));
      replace(withSelection);
    }
  }, [isSuccess, fetchedSubtrips, replace]);

  const handleToggleSelect = (index, value) => {
    setValue(`subtrips.${index}.selected`, value);
  };

  const handleAddCharge = () => {
    appendCharge({ label: '', amount: '' });
  };

  const handleRemoveCharge = (index) => {
    removeCharge(index);
  };

  const handleReset = () => {
    reset({
      transporter: null,
      billingPeriod: { start: dayjs().startOf('month'), end: dayjs() },
      subtrips: [],
      additionalCharges: [],
    });
  };

  const onSubmit = async (data) => {
    const selected = data.subtrips.filter((st) => st.selected);
    if (selected.length === 0) return;

    await submitPayment(data, loanDeductions);
  };

  const submitPayment = async (data, submittedDeductions = []) => {
    const {
      transporter: selectedTransporter,
      billingPeriod: period,
      subtrips: subtripData,
      additionalCharges: addCharges,
    } = data;
    const selected = subtripData.filter((st) => st.selected);
    try {
      // Add loan deductions as negative additional charges
      const loanCharges = submittedDeductions.map((ld) => ({
        label: 'Loan Repayment',
        amount: -ld.amount,
      }));

      const payment = await createPayment({
        transporterId: selectedTransporter._id,
        billingPeriod: period,
        associatedSubtrips: selected.map((st) => st._id),
        additionalCharges: [
          {
            label: 'POD Charges',
            amount: selected.length * (selectedTransporter?.podCharges || 0) * -1,
          },
          ...addCharges.map((it) => ({ label: it.label, amount: Number(it.amount) || 0 })),
          ...loanCharges,
        ],
        loanDeductions: submittedDeductions,
      });
      navigate(paths.dashboard.transporterPayment.details(payment._id));
    } catch (error) {
      console.error('Failed to create transporter payment', error);
    }
  };

  const selectedSubtrips = subtrips.filter((st) => st.selected);
  const podCharge = selectedSubtrips.length * (transporter?.podCharges || 0);

  const loanChargesForSummary =
    selectedSubtrips.length > 0
      ? loanDeductions.map((ld) => ({ label: 'Loan Repayment', amount: -ld.amount }))
      : [];

  const summary = calculateTransporterPaymentSummary(selectedSubtrips, transporter, [
    { label: 'POD Charges', amount: -podCharge },
    ...additionalCharges.map((it) => ({ label: it.label, amount: Number(it.amount) || 0 })),
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

  const totalWeightLabel = calculateTotalWeight(selectedSubtrips);

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3 }}>
        <Box
          rowGap={3}
          display="grid"
          alignItems="center"
          gridTemplateColumns={{ xs: '1fr', sm: '1fr auto' }}
          sx={{ mb: 3 }}
        >
          <Box
            component="img"
            alt="logo"
            src={getTenantLogoUrl(tenant)}
            sx={{
              width: 60,
              height: 60,
              bgcolor: 'background.neutral',
              borderRadius: '10px',
            }}
          />
          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Label variant="soft" color="warning">
              Draft
            </Label>
            <Typography variant="h6">TPR - XXX</Typography>
          </Stack>
        </Box>
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
            <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
                To:
              </Typography>
              <IconButton onClick={transporterDialog.onTrue}>
                <Iconify
                  icon={transporter ? 'solar:pen-bold' : 'mingcute:add-line'}
                  color="green"
                />
              </IconButton>
            </Stack>
            {transporter ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">{transporter.transportName}</Typography>
                <Typography variant="body2">{transporter.address}</Typography>
                <Typography variant="body2">{transporter.cellNo}</Typography>
              </Stack>
            ) : (
              <Typography typography="caption" sx={{ color: 'error.main' }}>
                Select a transporter
              </Typography>
            )}
          </Stack>
        </Stack>

        <Stack
          mt={5}
          spacing={{ xs: 3, md: 5 }}
          direction={{ xs: 'column', md: 'row' }}
          divider={<Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed' }} />}
        >
          <Stack sx={{ width: 1 }}>
            <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
                Billing Period:
              </Typography>
              <IconButton onClick={dateDialog.onTrue}>
                <Iconify icon="mingcute:calendar-line" color="green" />
              </IconButton>
            </Stack>
            {billingPeriod?.start && billingPeriod?.end ? (
              <Typography variant="body2">
                {fDateRangeShortLabel(billingPeriod.start, billingPeriod.end)}
              </Typography>
            ) : (
              <Typography typography="caption" sx={{ color: 'error.main' }}>
                Select date range
              </Typography>
            )}
          </Stack>

          <Stack sx={{ width: 1 }}>
            <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
                Issue Date:
              </Typography>
            </Stack>
            <Typography variant="body2">{fDate(new Date())}</Typography>
          </Stack>
        </Stack>

        <KanbanTransporterDialog
          open={transporterDialog.value}
          onClose={transporterDialog.onFalse}
          selectedTransporter={transporter}
          onTransporterChange={(value) => {
            setValue('transporter', value);
            replace([]);
          }}
        />

        <CustomDateRangePicker
          variant="calendar"
          presets={DATE_RANGE_PRESETS}
          open={dateDialog.value}
          onClose={dateDialog.onFalse}
          startDate={billingPeriod?.start}
          endDate={billingPeriod?.end}
          onChangeStartDate={(date) => setValue('billingPeriod.start', date)}
          onChangeEndDate={(date) => setValue('billingPeriod.end', date)}
          onApplyRange={(start, end) => {
            setValue('billingPeriod.start', start);
            setValue('billingPeriod.end', end);
          }}
        />

        <LoanDeductionCard
          loans={pendingLoans}
          isLoading={loansLoading}
          onChange={setLoanDeductions}
        />

        <TableContainer sx={{ overflowX: 'auto', mt: 3 }}>
          <Table sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                {[
                  'Select',
                  '#',
                  'Dispatch Date',
                  'LR No.',
                  'VEH No',
                  'From',
                  'Destination',
                  'InvoiceNo',
                  'Loading Weight',
                  'Shortage Qty',
                  'Shortage Amt',
                  'FRT-AMT',
                  'Advances',
                  'Total Payable',
                ].map((h, idx) => (
                  <StyledTableCell key={h} align={idx < 8 ? 'center' : 'right'}>
                    {h}
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <TableBody>
                {subtrips.map((st, idx) => {
                  const {
                    totalFreightAmount: freightAmount,
                    totalExpense: expense,
                    totalTransporterPayment,
                    totalShortageAmount: shortageAmount,
                  } = calculateTransporterPayment(st);

                  return (
                    <TableRow key={st._id}>
                      <TableCell width={40}>
                        <Checkbox
                          checked={st.selected || false}
                          onChange={(e) => handleToggleSelect(idx, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{fDate(st.startDate)}</TableCell>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.subtrip.details(st._id)}
                          variant="body2"
                          sx={{ color: 'primary.main', fontWeight: 'medium' }}
                        >
                          {st.subtripNo}
                        </Link>
                      </TableCell>
                      <TableCell>{st.vehicleId?.vehicleNo}</TableCell>
                      <TableCell>{st.loadingPoint}</TableCell>
                      <TableCell>{st.unloadingPoint}</TableCell>
                      <TableCell>{st.invoiceNo}</TableCell>
                      <TableCell align="right">
                        {st.loadingWeight
                          ? `${fNumber(st.loadingWeight)} ${getWeightUnit(st)}`
                          : '-'}
                      </TableCell>
                      <TableCell align="right">{st.shortageWeight}</TableCell>
                      <TableCell align="right">{fCurrency(shortageAmount)}</TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="flex-end"
                          spacing={0.5}
                        >
                          <span>{fCurrency(freightAmount)}</span>
                          <Tooltip title={getFreightExplanation(st, true)} arrow placement="top">
                            <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
                              <Iconify
                                icon="eva:info-outline"
                                width={16}
                                sx={{ color: 'text.disabled' }}
                              />
                            </Box>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{fCurrency(expense)}</TableCell>
                      <TableCell align="right">{fCurrency(totalTransporterPayment)}</TableCell>
                    </TableRow>
                  );
                })}

                <StyledTableRow>
                  <TableCell colSpan={7} />
                  <StyledTableCell align="right" sx={{ color: 'info.main' }}>
                    Total
                  </StyledTableCell>
                  <TableCell align="right" sx={{ color: 'info.main' }}>
                    {totalWeightLabel}
                  </TableCell>
                  <TableCell />
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
                </StyledTableRow>

                {taxBreakup?.tds?.rate > 0 && (
                  <StyledTableRow>
                    <TableCell colSpan={13} align="right">
                      TDS ({taxBreakup.tds.rate}%)
                    </TableCell>
                    <TableCell sx={{ color: 'error.main' }} align="right">
                      -{fCurrency(taxBreakup.tds.amount)}
                    </TableCell>
                  </StyledTableRow>
                )}

                {[taxBreakup.cgst, taxBreakup.sgst, taxBreakup.igst].map(({ rate, amount }, idx) =>
                  rate > 0 ? (
                    <StyledTableRow key={idx}>
                      <TableCell colSpan={13} align="right">
                        {['CGST', 'SGST', 'IGST'][idx]} ({rate}%)
                      </TableCell>
                      <TableCell align="right">{fCurrency(amount)}</TableCell>
                    </StyledTableRow>
                  ) : null
                )}

                {podCharge > 0 && (
                  <StyledTableRow>
                    <TableCell colSpan={13} align="right">
                      POD Charges
                    </TableCell>
                    <TableCell sx={{ color: 'error.main' }} align="right">
                      -{fCurrency(podCharge)}
                    </TableCell>
                  </StyledTableRow>
                )}

                {additionalFields.map((item, idx) => (
                  <StyledTableRow key={idx}>
                    <TableCell colSpan={13} align="right">
                      <Field.Text
                        size="small"
                        name={`additionalCharges[${idx}].label`}
                        label="Label"
                        placeholder="Diesel Advance, Extra Payment..."
                        required
                        variant="filled"
                        sx={{ width: 150 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                        <Field.Text
                          size="small"
                          name={`additionalCharges[${idx}].amount`}
                          label="Amount"
                          required
                          placeholder="100, -50"
                          sx={{ width: 100 }}
                          variant="filled"
                        />
                        <IconButton color="error" onClick={() => handleRemoveCharge(idx)}>
                          <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </StyledTableRow>
                ))}

                <StyledTableRow>
                  <TableCell colSpan={14}>
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={handleAddCharge}
                      sx={{ width: { sm: 'auto', xs: 1 } }}
                    >
                      Add Extra Charge
                    </Button>
                  </TableCell>
                </StyledTableRow>

                {loanDeductions.map((ld, idx) => (
                  <StyledTableRow key={`loan-${idx}`}>
                    <TableCell colSpan={13} align="right">
                      Loan Repayment (LN-{ld.loanNo})
                    </TableCell>
                    <TableCell sx={{ color: 'error.main' }} align="right">
                      -{fCurrency(ld.amount)}
                    </TableCell>
                  </StyledTableRow>
                ))}

                <StyledTableRow>
                  <TableCell colSpan={13} align="right">
                    <strong>Net Total</strong>
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {fCurrency(netIncome)}
                  </TableCell>
                </StyledTableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Card>

      <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
        <Button variant="outlined" onClick={handleReset}>
          Cancel
        </Button>
        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          Create Payment
        </LoadingButton>
      </Stack>
    </Form>
  );
}
