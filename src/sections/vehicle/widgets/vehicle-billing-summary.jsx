/* eslint-disable react/no-unstable-nested-components */
import dayjs from 'dayjs';
import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { wrapText } from 'src/utils/change-case';
import { fCurrency } from 'src/utils/format-number';
import { fDateRangeShortLabel } from 'src/utils/format-time';
import { exportToExcel } from 'src/utils/export-multi-sheet-to-excel';

import { usePaginatedSubtrips } from 'src/query/use-subtrip';
import { usePaginatedExpenses } from 'src/query/use-expense';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableSkeleton } from 'src/components/table';
import { DATE_RANGE_PRESETS, useDateRangePicker, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

const TABLE_HEAD = [
  { id: 'index', label: '#' },
  { id: '_id', label: 'ID' },
  { id: 'customerName', label: 'Customer' },
  { id: 'route', label: 'Route' },
  { id: 'date', label: 'Date' },
  { id: 'loadingWeight', label: 'Weight' },
  { id: 'rate', label: 'Rate' },
  { id: 'amt', label: 'Amount' },
  { id: 'totalExpense', label: 'Expense' },
  { id: 'netProfit', label: 'Net Profit' },
];

export function VehicleBillingSummary({ vehicleId, vehicleNo }) {
  const rangePicker = useDateRangePicker(dayjs().startOf('month'), dayjs().endOf('month'));

  const start = rangePicker.startDate
    ? dayjs(rangePicker.startDate).format('YYYY-MM-DD')
    : undefined;
  const end = rangePicker.endDate ? dayjs(rangePicker.endDate).format('YYYY-MM-DD') : undefined;

  const { data, isLoading } = usePaginatedSubtrips(
    {
      page: 1,
      rowsPerPage: 500,
      vehicleId,
      subtripStatus: 'billed',
      fromDate: start,
      toDate: end,
    },
    { keepPreviousData: true }
  );

  const subtripsRaw = data?.results || [];
  const subtrips = subtripsRaw.map((row) => {
    const totalExpense = (row?.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const amount = row?.freightDetails?.freightAmount || 0;
    return {
      ...row,
      customerName: row?.customerId?.customerName,
      route:
        row?.loadingPoint && row?.unloadingPoint
          ? `${row.loadingPoint} → ${row.unloadingPoint}`
          : '-',
      totalExpense,
      amt: amount,
    };
  });

  // Vehicle expenses for Loss tab and export
  const { data: expData, isLoading: isExpLoading } = usePaginatedExpenses({
    vehicleId,
    expenseCategory: 'vehicle',
    startDate: start,
    endDate: end,
    page: 1,
    rowsPerPage: 500,
  });
  const expenses = expData?.expenses || [];

  const [currentTab, setCurrentTab] = useState('profits');
  const monthLabel = rangePicker.shortLabel;
  const infoText = `Data for vehicle ${vehicleNo || '-'} for ${monthLabel}`;

  const totalNetProfit = subtrips.reduce(
    (sum, st) => sum + (st.amt || 0) - (st.totalExpense || 0),
    0
  );
  const totalLoss = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const overall = totalNetProfit - totalLoss;

  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">P&L Report</Typography>
            <Tooltip
              arrow
              slotProps={{
                tooltip: { sx: { bgcolor: 'grey.800', p: 1.25, maxWidth: 280 } },
                arrow: { sx: { color: 'grey.800' } },
              }}
              title={
                <Typography variant="caption" sx={{ lineHeight: 1.7, display: 'block' }}>
                  Only jobs with completed billing are listed below. Jobs still in{' '}
                  <Label
                    color="warning"
                    variant="soft"
                    sx={{ fontSize: '0.6rem', height: 16, px: 0.5 }}
                  >
                    Receive
                  </Label>{' '}
                  or{' '}
                  <Label
                    color="info"
                    variant="soft"
                    sx={{ fontSize: '0.6rem', height: 16, px: 0.5 }}
                  >
                    Loaded
                  </Label>{' '}
                  status are not included.
                </Typography>
              }
            >
              <Iconify
                icon="eva:info-outline"
                width={18}
                sx={{ color: 'text.disabled', cursor: 'help' }}
              />
            </Tooltip>
          </Stack>
        }
        action={
          <Stack direction={{ sm: 'column', md: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={rangePicker.onOpen}
              startIcon={<Iconify icon="solar:calendar-date-bold" />}
            >
              {rangePicker.shortLabel}
            </Button>
            <CustomDateRangePicker
              variant="calendar"
              presets={DATE_RANGE_PRESETS}
              open={rangePicker.open}
              startDate={rangePicker.startDate}
              endDate={rangePicker.endDate}
              onChangeStartDate={rangePicker.onChangeStartDate}
              onChangeEndDate={rangePicker.onChangeEndDate}
              onApplyRange={rangePicker.onApplyRange}
              onClose={rangePicker.onClose}
              error={rangePicker.error}
            />
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:download-outline" />}
              onClick={async () => {
                const profitsData = subtrips.map((st, idx) => ({
                  'S.No': idx + 1,
                  ID: st._id,
                  Customer: st.customerName || '-',
                  Route: st.route || '-',
                  Date: fDateRangeShortLabel(st.startDate, st.endDate),
                  Weight: st.loadingWeight || 0,
                  Rate: st.freightDetails?.rate || 0,
                  Amount: st.amt || 0,
                  Expense: st.totalExpense || 0,
                  'Net Profit': (st.amt || 0) - (st.totalExpense || 0),
                }));

                const lossesData = expenses.map((e, idx) => ({
                  'S.No': idx + 1,
                  Date: e.date ? dayjs(e.date).format('DD MMM, YYYY') : '-',
                  'Expense Type': e.expenseType || '-',
                  Remarks: e.remarks || '-',
                  Amount: e.amount || 0,
                }));

                const status = overall >= 0 ? 'Profit' : 'Loss';

                const summaryData = [
                  { Metric: 'Total Net Profit (Jobs)', Value: totalNetProfit },
                  { Metric: 'Total Vehicle Expenses', Value: totalLoss },
                  { Metric: 'Overall (Profit - Loss)', Value: overall },
                  { Metric: 'Status', Value: status },
                ];

                await exportToExcel(
                  [
                    { name: 'Income', data: profitsData, options: { prependInfoRows: [infoText] } },
                    {
                      name: 'Vehicle Expenses',
                      data: lossesData,
                      options: { prependInfoRows: [infoText] },
                    },
                    { name: 'P&L', data: summaryData, options: { prependInfoRows: [infoText] } },
                  ],
                  `Vehicle-P&L-${vehicleNo}`
                );
              }}
            >
              Download
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          px: 3,
          mt: 2,
        }}
      >
        <Stack
          spacing={0.5}
          sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5, position: 'relative' }}
        >
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Net Job Profit
          </Typography>
          <Typography variant="subtitle1">{fCurrency(totalNetProfit)}</Typography>
        </Stack>
        <Stack
          spacing={0.5}
          sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5, position: 'relative' }}
        >
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Vehicle Expense
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
            {fCurrency(totalLoss)}
          </Typography>
        </Stack>
        <Stack
          spacing={0.5}
          sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5, position: 'relative' }}
        >
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Overall P&L
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: overall >= 0 ? 'success.main' : 'error.main' }}
          >
            {fCurrency(overall)}
          </Typography>
        </Stack>
      </Box>

      <Tabs
        value={currentTab}
        onChange={(_e, v) => setCurrentTab(v)}
        sx={{ px: 3, mt: 1 }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab
          value="profits"
          label="Profits"
          icon={<Iconify icon="eva:trending-up-fill" sx={{ color: 'success.main' }} />}
          iconPosition="start"
        />
        <Tab
          value="loss"
          label="Loss"
          icon={<Iconify icon="eva:trending-down-fill" sx={{ color: 'error.main' }} />}
          iconPosition="start"
        />
      </Tabs>

      {currentTab === 'profits' && <ProfitsTable subtrips={subtrips} isLoading={isLoading} />}

      {currentTab === 'loss' && <VehicleLossTable expenses={expenses} isLoading={isExpLoading} />}

      {/* Date range picker handles the calendar popover automatically */}
    </Card>
  );
}

// ----------------------------------------------------------------------
// Profits Table Component
function ProfitsTable({ subtrips, isLoading }) {
  return (
    <TableContainer sx={{ position: 'relative', overflow: 'unset', mt: 2 }}>
      <Scrollbar sx={{ minHeight: 401, maxHeight: 401 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {TABLE_HEAD.map((head) => (
                <TableCell key={head.id}>{head.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              subtrips.map((row, index) => {
                const netProfit = (row.amt || 0) - (row.totalExpense || 0);

                return (
                  <TableRow key={row._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <RouterLink
                        to={paths.dashboard.subtrip.details(row._id)}
                        style={{ color: 'green', textDecoration: 'underline' }}
                      >
                        {row.subtripNo}
                      </RouterLink>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={row.customerName}>
                        <Typography variant="body2" noWrap>
                          {wrapText(row.customerName || '-', 20)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={row.route}>
                        <Typography variant="body2" noWrap>
                          {wrapText(row.route || '-', 20)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{fDateRangeShortLabel(row.startDate, row.endDate)}</TableCell>
                    <TableCell>{row.loadingWeight}</TableCell>
                    <TableCell>{row.freightDetails?.rate || '-'}</TableCell>
                    <TableCell>{fCurrency(row.amt)}</TableCell>
                    <TableCell>{fCurrency(row.totalExpense)}</TableCell>
                    <TableCell sx={{ color: netProfit > 0 ? 'success.main' : 'error.main' }}>
                      {fCurrency(netProfit)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            {subtrips.length > 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ fontWeight: 'fontWeightBold' }}>
                  Total
                </TableCell>
                <TableCell sx={{ fontWeight: 'fontWeightBold' }}>
                  {fCurrency(subtrips.reduce((sum, r) => sum + (r.amt || 0), 0))}
                </TableCell>
                <TableCell sx={{ fontWeight: 'fontWeightBold' }}>
                  {fCurrency(subtrips.reduce((sum, r) => sum + (r.totalExpense || 0), 0))}
                </TableCell>
                {(() => {
                  const totalNet = subtrips.reduce(
                    (sum, r) => sum + (r.amt || 0) - (r.totalExpense || 0),
                    0
                  );
                  return (
                    <TableCell
                      sx={{
                        fontWeight: 'fontWeightBold',
                        color: totalNet > 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {fCurrency(totalNet)}
                    </TableCell>
                  );
                })()}
              </TableRow>
            )}
            <TableNoData notFound={!isLoading && subtrips.length === 0} />
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}

// ----------------------------------------------------------------------
// Loss Table Component
function VehicleLossTable({ expenses, isLoading }) {
  const totalAmount = (expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <TableContainer sx={{ position: 'relative', overflow: 'unset', mt: 2 }}>
      <Scrollbar sx={{ minHeight: 401, maxHeight: 401 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Expense Type</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              expenses.map((row, idx) => (
                <TableRow key={row._id || `${row.date}-${idx}`}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{row.date ? dayjs(row.date).format('DD MMM, YYYY') : '-'}</TableCell>
                  <TableCell>{row.expenseType || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title={row.remarks || '-'}>
                      <Typography variant="body2" noWrap>
                        {wrapText(row.remarks || '-', 40)}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'error.main', fontWeight: 500 }}>
                    {fCurrency(row.amount || 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
            {expenses.length > 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ fontWeight: 'fontWeightBold' }}>
                  Total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'fontWeightBold', color: 'error.main' }}>
                  {fCurrency(totalAmount)}
                </TableCell>
              </TableRow>
            )}
            <TableNoData notFound={!isLoading && expenses.length === 0} />
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}
