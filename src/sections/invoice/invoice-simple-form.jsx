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
  Dialog,
  Divider,
  Tooltip,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fNumber, fCurrency } from 'src/utils/format-number';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';
import { fDate, fDateRangeShortLabel } from 'src/utils/format-time';

import { useCreateInvoice } from 'src/query/use-invoice';
import { useClosedTripsByCustomerAndDate } from 'src/query/use-subtrip';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import {
  fFreightRate,
  getWeightUnit,
  calculateTotalWeight,
  getFreightExplanation,
} from 'src/sections/subtrip/utils';

import { useTenantContext } from 'src/auth/tenant';

import { TableSkeleton } from '../../components/table';
import { Form, Field, schemaHelper } from '../../components/hook-form';
import { KanbanCustomerDialog } from '../kanban/components/kanban-customer-dialog';
import {
  calculateTaxBreakup,
  calculateInvoiceSummary,
  calculateInvoicePerSubtrip,
} from './utills/invoice-calculation';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': { borderBottom: 'none', paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1) },
}));

const StyledTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

const InvoiceSchema = zod.object({
  customerId: zod.string().min(1, 'Customer is required'),
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
  issueDate: schemaHelper
    .date({ required_error: 'Issue date is required' })
    .refine((date) => !dayjs(date).isAfter(dayjs(), 'day'), {
      message: 'Issue date cannot be in the future',
    }),
  subtrips: zod.array(zod.any()).min(1, 'Select at least one job'),
  additionalItems: zod
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

export default function SimplerNewInvoiceForm() {
  const customerDialog = useBoolean();
  const dateDialog = useBoolean();
  const issueDateDialog = useBoolean();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const tenant = useTenantContext();

  const methods = useForm({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: {
      customerId: '',
      billingPeriod: { start: dayjs().startOf('month'), end: dayjs() },
      issueDate: dayjs(),
      subtrips: [],
      additionalItems: [],
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

  const { replace } = useFieldArray({
    control,
    name: 'subtrips',
  });

  const {
    fields: additionalFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ name: 'additionalItems', control });

  const { customerId, billingPeriod, issueDate, subtrips, additionalItems } = watch();

  const {
    data: fetchedSubtrips,
    isSuccess,
    isLoading,
    refetch,
  } = useClosedTripsByCustomerAndDate(customerId, billingPeriod?.start, billingPeriod?.end);

  const createInvoice = useCreateInvoice();
  const navigate = useNavigate();

  useEffect(() => {
    if (customerId && billingPeriod?.start && billingPeriod?.end) {
      refetch();
    }
  }, [customerId, billingPeriod?.start, billingPeriod?.end, refetch]);

  useEffect(() => {
    if (isSuccess && fetchedSubtrips) {
      const withSelection = fetchedSubtrips.map((st) => ({ ...st, selected: false }));
      replace(withSelection);
    }
  }, [isSuccess, fetchedSubtrips, replace]);

  const handleAddItem = () => {
    appendItem({ label: '', amount: '' });
  };

  const handleToggleSelect = (index, value) => {
    setValue(`subtrips.${index}.selected`, value);
  };

  const handleRemoveItem = (index) => {
    removeItem(index);
  };

  const handleReset = () => {
    reset({
      customerId: '',
      billingPeriod: { start: dayjs().startOf('month'), end: dayjs() },
      issueDate: dayjs(),
      subtrips: [],
      additionalItems: [],
    });
    // Also clear any locally selected customer and subtrips state
    setSelectedCustomer(null);
    replace([]);
  };

  const onSubmit = async (data) => {
    const {
      customerId: custId,
      billingPeriod: period,
      issueDate: selectedIssueDate,
      subtrips: subtripData,
      additionalItems: addItems,
    } = data;
    const selected = subtripData.filter((st) => st.selected);
    try {
      const invoice = await createInvoice({
        customerId: custId,
        billingPeriod: period,
        issueDate: selectedIssueDate,
        subtripIds: selected.map((st) => st._id),
        additionalCharges: addItems.map((it) => ({
          label: it.label,
          amount: Number(it.amount) || 0,
        })),
      });
      navigate(paths.dashboard.invoice.details(invoice._id));
    } catch (error) {
      console.error('Failed to create invoice', error);
    }
  };

  const { cgst, sgst, igst } = calculateTaxBreakup(selectedCustomer);
  const selectedSubtrips = subtrips.filter((st) => st.selected);
  const summary = calculateInvoiceSummary({
    subtripIds: selectedSubtrips,
    customer: selectedCustomer,
    additionalItems,
  });

  const totalWeightLabel = calculateTotalWeight(selectedSubtrips);

  const nextInvoiceNumber = selectedCustomer
    ? `${selectedCustomer.invoicePrefix || ''}${
        typeof selectedCustomer.currentInvoiceSerialNumber === 'number'
          ? selectedCustomer.currentInvoiceSerialNumber + 1
          : ''
      }${selectedCustomer.invoiceSuffix || ''}`
    : 'INV - XXX';

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
            <Typography variant="h6">{nextInvoiceNumber}</Typography>
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
              <IconButton onClick={customerDialog.onTrue}>
                <Iconify
                  icon={selectedCustomer ? 'solar:pen-bold' : 'mingcute:add-line'}
                  color="green"
                />
              </IconButton>
            </Stack>
            {selectedCustomer ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">{selectedCustomer.customerName}</Typography>
                <Typography variant="body2">{selectedCustomer.address}</Typography>
                <Typography variant="body2">{selectedCustomer.cellNo}</Typography>
              </Stack>
            ) : (
              <Typography typography="caption" sx={{ color: 'error.main' }}>
                Select a customer
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
              <IconButton onClick={issueDateDialog.onTrue}>
                <Iconify icon="solar:pen-bold" color="green" />
              </IconButton>
            </Stack>
            {issueDate ? (
              <Typography variant="body2">{fDate(issueDate)}</Typography>
            ) : (
              <Typography typography="caption" sx={{ color: 'error.main' }}>
                Select issue date
              </Typography>
            )}
          </Stack>
        </Stack>

        <KanbanCustomerDialog
          open={customerDialog.value}
          onClose={customerDialog.onFalse}
          selectedCustomer={selectedCustomer}
          onCustomerChange={(customer) => {
            setSelectedCustomer(customer);
            setValue('customerId', customer?._id);
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

        <Dialog open={issueDateDialog.value} onClose={issueDateDialog.onFalse} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ pb: 2 }}>Select Issue Date</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Field.DatePicker
                name="issueDate"
                label="Issue Date"
                disableFuture
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" color="inherit" onClick={issueDateDialog.onFalse}>
              Cancel
            </Button>
            <Button variant="contained" onClick={issueDateDialog.onFalse}>
              Apply
            </Button>
          </DialogActions>
        </Dialog>

        <TableContainer sx={{ overflowX: 'auto', mt: 4 }}>
          <Table sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                <StyledTableCell>Select</StyledTableCell>
                <StyledTableCell>#</StyledTableCell>
                <StyledTableCell>Consignee</StyledTableCell>
                <StyledTableCell>Destination</StyledTableCell>
                <StyledTableCell>Invoice No</StyledTableCell>
                <StyledTableCell>Dispatch Date</StyledTableCell>
                <StyledTableCell>LR No</StyledTableCell>
                <StyledTableCell>DI/DC No</StyledTableCell>
                <StyledTableCell>Vehicle No</StyledTableCell>
                <StyledTableCell>Material</StyledTableCell>
                <StyledTableCell>Freight Rate</StyledTableCell>
                <StyledTableCell>Weight</StyledTableCell>
                <StyledTableCell>Total Amount</StyledTableCell>
                <StyledTableCell>Shortage Weight</StyledTableCell>
              </TableRow>
            </TableHead>

            {isLoading ? (
              <TableSkeleton />
            ) : (
              <TableBody>
                {subtrips.map((st, idx) => {
                  const { totalAmount } = calculateInvoicePerSubtrip(st);
                  return (
                    <TableRow key={st._id}>
                      <TableCell width={40}>
                        <Checkbox
                          checked={st.selected || false}
                          onChange={(e) => handleToggleSelect(idx, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{st.consignee}</TableCell>
                      <TableCell>{st.unloadingPoint}</TableCell>
                      <TableCell>{st.invoiceNo || '-'}</TableCell>
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
                      <TableCell>{st.diNumber || '-'}</TableCell>
                      <TableCell>{st.vehicleNo || st.vehicleId?.vehicleNo || '-'}</TableCell>
                      <TableCell>{st.materialType || '-'}</TableCell>
                      <TableCell>
                        {fFreightRate(
                          st.freightDetails?.rate || st.rate,
                          st.freightDetails?.freightModel,
                          st.freightDetails?.freightAmount
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {st.loadingWeight
                          ? `${fNumber(st.loadingWeight)} ${getWeightUnit(st)}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <span>{fCurrency(totalAmount)}</span>
                          <Tooltip title={getFreightExplanation(st, false)} arrow placement="top">
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
                      <TableCell sx={{ color: st.shortageWeight > 0 ? '#FF5630' : 'inherit' }}>
                        {st.shortageWeight ? `${fNumber(st.shortageWeight)} Kg` : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}

                <StyledTableRow>
                  <TableCell colSpan={10} />
                  <StyledTableCell sx={{ color: 'text.secondary' }} align="right">
                    Subtotal
                  </StyledTableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {totalWeightLabel}
                  </TableCell>
                  <TableCell align="right">{fCurrency(summary.totalAmountBeforeTax)}</TableCell>
                  <TableCell />
                </StyledTableRow>

                {cgst > 0 && (
                  <StyledTableRow>
                    <TableCell colSpan={11} />
                    <StyledTableCell sx={{ color: 'text.secondary' }} colSpan={1} align="center">
                      CGST ({cgst}%)
                    </StyledTableCell>
                    <TableCell> {fCurrency((summary.totalAmountBeforeTax * cgst) / 100)}</TableCell>
                    <TableCell colSpan={1} />
                  </StyledTableRow>
                )}

                {sgst > 0 && (
                  <StyledTableRow>
                    <TableCell colSpan={11} />
                    <StyledTableCell sx={{ color: 'text.secondary' }} colSpan={1} align="center">
                      SGST ({sgst}%)
                    </StyledTableCell>
                    <TableCell>{fCurrency((summary.totalAmountBeforeTax * sgst) / 100)}</TableCell>
                    <TableCell colSpan={1} />
                  </StyledTableRow>
                )}

                {igst > 0 && (
                  <StyledTableRow>
                    <TableCell colSpan={11} />
                    <StyledTableCell sx={{ color: 'text.secondary' }} colSpan={1} align="center">
                      IGST ({igst}%)
                    </StyledTableCell>
                    <TableCell>{fCurrency((summary.totalAmountBeforeTax * igst) / 100)}</TableCell>
                    <TableCell colSpan={1} />
                  </StyledTableRow>
                )}

                {additionalFields.map((item, idx) => (
                  <StyledTableRow key={idx}>
                    <TableCell colSpan={11} />
                    <TableCell colSpan={1} align="center">
                      <Field.Text
                        size="small"
                        name={`additionalItems[${idx}].label`}
                        label="Label"
                        placeholder="Credit Note, Additional Payment..."
                        required
                        variant="filled"
                        sx={{ width: 150 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Field.Text
                        size="small"
                        name={`additionalItems[${idx}].amount`}
                        label="Amount"
                        required
                        placeholder="+100, -200"
                        sx={{ width: 100 }}
                        variant="filled"
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton color="error" onClick={() => handleRemoveItem(idx)}>
                        <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                ))}

                <StyledTableRow>
                  <TableCell colSpan={14}>
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={handleAddItem}
                      sx={{ width: { sm: 'auto', xs: 1 } }}
                    >
                      Add Extra Payment
                    </Button>
                  </TableCell>
                </StyledTableRow>

                <StyledTableRow>
                  <TableCell colSpan={11} />
                  <StyledTableCell colSpan={1} sx={{ color: 'text.secondary' }} align="center">
                    Net Total
                  </StyledTableCell>
                  <TableCell sx={{ color: 'error.main' }}>
                    {fCurrency(summary.totalAfterTax)}
                  </TableCell>
                  <TableCell colSpan={1} />
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
          Create Invoice
        </LoadingButton>
      </Stack>
    </Form>
  );
}
