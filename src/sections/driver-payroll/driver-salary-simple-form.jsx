/* eslint-disable no-shadow */
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

import { fCurrency } from 'src/utils/format-number';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';
import { fDate, fDateRangeShortLabel } from 'src/utils/format-time';

import { usePendingLoans } from 'src/query/use-loan';
import { useCreateDriverPayroll } from 'src/query/use-driver-payroll';
import { useTripsCompletedByDriverAndDate } from 'src/query/use-subtrip';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { TableSkeleton } from 'src/components/table';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { useTenantContext } from 'src/auth/tenant';

import LoanDeductionCard from '../loans/loan-deduction-card';
import { KanbanDriverDialog } from '../kanban/components/kanban-driver-dialog';
import {
  calculateDriverSalary,
  calculateDriverSalarySummary,
} from './utils/driver-salary-calculations';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': { borderBottom: 'none', paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1) },
}));

const StyledTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

const SalarySchema = zod.object({
  driver: zod
    .any()
    .nullable()
    .refine((val) => val !== null, { message: 'Driver is required' }),
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
  associatedSubtrips: zod.array(zod.any()).min(1, 'Select at least one job'),
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

export default function DriverSalarySimpleForm() {
  const driverDialog = useBoolean();
  const dateDialog = useBoolean();
  const tenant = useTenantContext();
  const [loanDeductions, setLoanDeductions] = useState([]);

  const methods = useForm({
    resolver: zodResolver(SalarySchema),
    defaultValues: {
      driver: null,
      billingPeriod: { start: dayjs().startOf('month'), end: dayjs() },
      associatedSubtrips: [],
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

  const { replace } = useFieldArray({ control, name: 'associatedSubtrips' });

  const {
    fields: additionalFields,
    append: appendCharge,
    remove: removeCharge,
  } = useFieldArray({ name: 'additionalCharges', control });

  const { driver, billingPeriod, associatedSubtrips, additionalCharges } = watch();

  const {
    data: fetchedSubtrips,
    isSuccess,
    isLoading,
    refetch,
  } = useTripsCompletedByDriverAndDate(driver?._id, billingPeriod?.start, billingPeriod?.end);

  const createSalary = useCreateDriverPayroll();
  const navigate = useNavigate();

  // Fetch pending loans for selected driver
  const { data: pendingLoans = [], isLoading: loansLoading } = usePendingLoans(
    'Driver',
    driver?._id
  );

  useEffect(() => {
    if (driver?._id && billingPeriod?.start && billingPeriod?.end) {
      refetch();
    }
  }, [driver?._id, billingPeriod?.start, billingPeriod?.end, refetch]);

  useEffect(() => {
    if (isSuccess && fetchedSubtrips) {
      const withSelection = fetchedSubtrips.map((st) => ({ ...st, selected: false }));
      replace(withSelection);
    }
  }, [isSuccess, fetchedSubtrips, replace]);

  const handleToggleSelect = (index, value) => {
    setValue(`associatedSubtrips.${index}.selected`, value);
  };

  const handleAddCharge = () => {
    appendCharge({ label: '', amount: '' });
  };

  const handleRemoveCharge = (index) => {
    removeCharge(index);
  };

  const handleReset = () => {
    reset({
      driver: null,
      billingPeriod: { start: dayjs().startOf('month'), end: dayjs() },
      associatedSubtrips: [],
      additionalCharges: [],
    });
  };

  const onSubmit = async (data) => {
    const selected = data.associatedSubtrips.filter((st) => st.selected);
    if (selected.length === 0) return;

    await submitSalary(data, loanDeductions);
  };

  const submitSalary = async (data, submittedDeductions = []) => {
    const {
      driver: { _id: did } = {},
      billingPeriod: period,
      associatedSubtrips: subtripData,
      additionalCharges: charges,
    } = data;
    const selected = subtripData.filter((st) => st.selected);
    try {
      const payments = charges
        .filter((c) => Number(c.amount) > 0)
        .map((c) => ({ label: c.label, amount: Number(c.amount) }));
      const deductions = charges
        .filter((c) => Number(c.amount) < 0)
        .map((c) => ({ label: c.label, amount: Math.abs(Number(c.amount)) }));

      // Add loan deductions as additional deductions for the summary
      submittedDeductions.forEach((ld) => {
        deductions.push({ label: 'Loan Repayment', amount: ld.amount });
      });

      const payroll = await createSalary({
        driverId: did,
        billingPeriod: period,
        associatedSubtrips: selected.map((st) => st._id),
        additionalPayments: payments,
        additionalDeductions: deductions,
        loanDeductions: submittedDeductions,
      });
      navigate(paths.dashboard.driverSalary.details(payroll._id));
    } catch (error) {
      console.error('Failed to create driver salary', error);
    }
  };

  const selectedSubtrips = associatedSubtrips.filter((st) => st.selected);

  const summary = calculateDriverSalarySummary(
    { associatedSubtrips: selectedSubtrips },
    driver,
    additionalCharges
      .filter((c) => Number(c.amount) > 0)
      .map((c) => ({ label: c.label, amount: Number(c.amount) })),
    additionalCharges
      .filter((c) => Number(c.amount) < 0)
      .map((c) => ({ label: c.label, amount: Math.abs(Number(c.amount)) }))
      .concat(
        selectedSubtrips.length > 0
          ? loanDeductions.map((ld) => ({ label: 'Loan Repayment', amount: ld.amount }))
          : []
      )
  );

  const { totalTripWiseIncome, netIncome } = summary;

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
            <Typography variant="h6">DSR - XXX</Typography>
          </Stack>
        </Box>

        <Stack
          spacing={{ xs: 3, md: 5 }}
          direction={{ xs: 'column', md: 'row' }}
          divider={<Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed' }} />}
          sx={{ mb: 3 }}
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
              <IconButton onClick={driverDialog.onTrue}>
                <Iconify icon={driver ? 'solar:pen-bold' : 'mingcute:add-line'} color="green" />
              </IconButton>
            </Stack>
            {driver ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">{driver.driverName}</Typography>
                <Typography variant="body2">{driver.driverPresentAddress}</Typography>
                <Typography variant="body2">{driver.driverCellNo}</Typography>
              </Stack>
            ) : (
              <Typography typography="caption" sx={{ color: 'error.main' }}>
                Select a driver
              </Typography>
            )}
          </Stack>
        </Stack>

        <Stack
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

        <KanbanDriverDialog
          open={driverDialog.value}
          onClose={driverDialog.onFalse}
          selectedDriver={driver}
          onDriverChange={(driver) => {
            setValue('driver', driver);
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
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                {['Select', '#', 'Date', 'Job No', 'From', 'Destination', 'Trip Salary'].map(
                  (h) => (
                    <StyledTableCell key={h}>{h}</StyledTableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <TableBody>
                {associatedSubtrips.map((st, idx) => {
                  const tripSalary = calculateDriverSalary(st);
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
                      <TableCell>{st.loadingPoint}</TableCell>
                      <TableCell>{st.unloadingPoint}</TableCell>
                      <TableCell align="right">{fCurrency(tripSalary)}</TableCell>
                    </TableRow>
                  );
                })}

                <StyledTableRow>
                  <TableCell colSpan={6} align="right">
                    Trips Total
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'info.main' }}>
                    {fCurrency(totalTripWiseIncome)}
                  </TableCell>
                  <TableCell />
                </StyledTableRow>

                {additionalFields.map((item, idx) => (
                  <StyledTableRow key={idx}>
                    <TableCell colSpan={6} align="right">
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
                      <Field.Text
                        size="small"
                        name={`additionalCharges[${idx}].amount`}
                        label="Amount"
                        required
                        placeholder="100, -50"
                        sx={{ width: 100 }}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleRemoveCharge(idx)}>
                        <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                ))}

                <StyledTableRow>
                  <TableCell colSpan={6}>
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
                    <TableCell colSpan={6} align="right">
                      Loan Repayment (LN-{ld.loanNo})
                    </TableCell>
                    <TableCell sx={{ color: 'error.main' }} align="right">
                      -{fCurrency(ld.amount)}
                    </TableCell>
                    <TableCell />
                  </StyledTableRow>
                ))}

                <StyledTableRow>
                  <TableCell colSpan={6} align="right">
                    <strong>Net Total</strong>
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {fCurrency(netIncome)}
                  </TableCell>
                  <TableCell />
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
          Create Salary
        </LoadingButton>
      </Stack>
    </Form>
  );
}
