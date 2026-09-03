import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import { ListItemText } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useTabs } from 'src/hooks/use-tabs';
import { useSystemFeatures } from 'src/hooks/use-system-features';

import { fDate, fTime } from 'src/utils/format-time';
import { fNumber, fCurrency, fShortenNumber } from 'src/utils/format-number';

import { useDailySummary } from 'src/query/use-dashboard';
import { VEHICLE_MODES } from 'src/constants/vehicle-mode';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { TableNoData, TableSkeleton, TableHeadCustom } from 'src/components/table';

import {
  DEFAULT_SUBTRIP_EXPENSE_TYPES,
  DEFAULT_VEHICLE_EXPENSE_TYPES,
} from 'src/sections/expense/expense-config';

// ----------------------------------------------------------------------

export function AppDailySummaryWidget({ sx, ...other }) {
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useState(dayjs());

  const tabs = useTabs('created');
  const { vehicleMode } = useSystemFeatures();
  const managesMarketVehicles = vehicleMode !== VEHICLE_MODES.OWN_ONLY;

  const dateParam = useMemo(() => selectedDate?.format('YYYY-MM-DD'), [selectedDate]);

  const { data, isLoading } = useDailySummary(dateParam);

  const tabsConfig = useMemo(() => {
    const created = data?.subtrips?.created || { count: 0, list: [] };
    const received = data?.subtrips?.received || { count: 0, list: [] };
    const invoices = data?.invoices || { count: 0, amount: 0, list: [] };
    const transporterPayments = data?.transporterPayments || { count: 0, amount: 0, list: [] };
    const expenses = data?.expenses || { count: 0, amount: 0, list: [] };
    const advances = data?.advances || { count: 0, amount: 0, list: [] };
    const materials = data?.materials || { count: 0, weight: 0, list: [] };

    const baseTabs = [
      {
        value: 'created',
        label: 'Jobs Created',
        icon: 'solar:document-add-bold-duotone',
        count: created.count || 0,
        amount: 0,
      },
      {
        value: 'received',
        label: 'POD Received',
        icon: 'solar:inbox-bold-duotone',
        count: received.count || 0,
        amount: 0,
      },
      {
        value: 'expenses',
        label: 'Expenses Added',
        icon: 'solar:bill-list-bold-duotone',
        count: expenses.count || 0,
        amount: expenses.amount || 0,
      },
      {
        value: 'advances',
        label: 'Advances Added',
        icon: 'solar:wallet-money-bold-duotone',
        count: advances.count || 0,
        amount: advances.amount || 0,
      },
      {
        value: 'invoices',
        label: 'Invoices Generated',
        icon: 'mdi:file-document-edit-outline',
        count: invoices.count || 0,
        amount: invoices.amount || 0,
      },
      {
        value: 'transporterPayments',
        label: 'TPayments Generated',
        icon: 'ri:money-rupee-circle-line',
        count: transporterPayments.count || 0,
        amount: transporterPayments.amount || 0,
      },
      {
        value: 'materials',
        label: 'Materials',
        icon: 'mdi:package-variant-closed',
        count: `${parseInt(materials.amount, 10) || 0}  Ton`,
      },
    ];

    if (!managesMarketVehicles) {
      return baseTabs.filter((t) => t.value !== 'advances' && t.value !== 'transporterPayments');
    }

    return baseTabs;
  }, [data, managesMarketVehicles]);

  const renderHeader = (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            mb: 1,
            gap: 0.5,
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            typography: 'subtitle2',
          }}
        >
          Daily summary
          <Tooltip title="Pick a date to view daily activity">
            <Iconify width={16} icon="eva:info-outline" sx={{ color: 'text.disabled' }} />
          </Tooltip>
        </Box>
        <Box sx={{ typography: 'h4' }}>{fDate(dateParam, 'DD MMM YYYY')}</Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <DatePicker
          label="Select date"
          value={selectedDate}
          onChange={(value) => value && setSelectedDate(value)}
          disableFuture
        />
      </Box>
    </Box>
  );

  const renderTabs = (
    <CustomTabs
      value={tabs.value}
      onChange={tabs.onChange}
      variant="scrollable"
      allowScrollButtonsMobile
      sx={{ my: 3, borderRadius: 2 }}
      slotProps={{
        indicator: { borderRadius: 1.5, boxShadow: theme.customShadows.z4 },
        tab: { p: 2.5 },
      }}
    >
      {tabsConfig.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={
            <Box
              sx={{
                width: 1,
                display: 'flex',
                gap: { xs: 1, md: 2 },
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  display: { xs: 'none', md: 'inline-flex' },
                }}
              >
                <Iconify width={36} icon={tab.icon} />
              </Box>

              <div>
                <Box
                  sx={{
                    mb: 0.5,
                    gap: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    typography: 'subtitle2',
                  }}
                >
                  {tab.label}
                </Box>

                <Box sx={{ typography: 'h6' }}>
                  {['invoices', 'transporterPayments', 'expenses', 'advances'].includes(tab.value)
                    ? fShortenNumber(tab.amount || 0)
                    : tab.count || 0}
                </Box>
              </div>
            </Box>
          }
        />
      ))}
    </CustomTabs>
  );

  const currentList = useMemo(() => {
    if (!data) return [];
    switch (tabs.value) {
      case 'created':
        return data?.subtrips?.created?.list || [];
      case 'received':
        return data?.subtrips?.received?.list || [];
      case 'expenses':
        return data?.expenses?.list || [];
      case 'advances':
        return data?.advances?.list || [];
      case 'invoices':
        return data?.invoices?.list || [];
      case 'transporterPayments':
        return data?.transporterPayments?.list || [];
      case 'materials':
        return data?.materials?.list || [];
      default:
        return [];
    }
  }, [data, tabs.value]);

  const headLabel = useMemo(() => {
    switch (tabs.value) {
      case 'created':
      case 'received':
        return [
          { id: 'index', label: 'No.' },
          { id: 'subtripNo', label: 'Job No' },
          { id: 'vehicleNo', label: 'Vehicle' },
          { id: 'driver', label: 'Driver' },
          { id: 'isOwn', label: 'Market/Own' },
          { id: 'customer', label: 'Customer' },
          { id: 'route', label: 'Route' },
          { id: 'date', label: 'Dispatch Date' },
          { id: 'weight', label: 'Weight (T)' },
          { id: 'rate', label: 'Rate' },
        ];
      case 'invoices':
        return [
          { id: 'index', label: 'No.' },
          { id: 'invoiceNo', label: 'Invoice' },
          { id: 'customer', label: 'Customer' },
          { id: 'issueDate', label: 'Issue Date' },
          { id: 'status', label: 'Status' },
          { id: 'total', label: 'Net Total' },
        ];
      case 'expenses':
        return [
          { id: 'index', label: 'No.' },
          { id: 'expenseType', label: 'Expense Type' },
          { id: 'vehicleNo', label: 'Vehicle' },
          { id: 'subtripNo', label: 'LR No' },
          { id: 'date', label: 'Date' },
          { id: 'amount', label: 'Amount' },
        ];
      case 'advances':
        return [
          { id: 'index', label: 'No.' },
          { id: 'advanceType', label: 'Advance Type' },
          { id: 'vehicleNo', label: 'Vehicle' },
          { id: 'subtripNo', label: 'LR No' },
          { id: 'date', label: 'Date' },
          { id: 'amount', label: 'Amount' },
        ];
      case 'transporterPayments':
        return [
          { id: 'index', label: 'No.' },
          { id: 'paymentId', label: 'Payment Id' },
          { id: 'transporter', label: 'Transporter' },
          { id: 'issueDate', label: 'Issue Date' },
          { id: 'status', label: 'Status' },
          { id: 'amount', label: 'Net Income' },
        ];
      case 'materials':
        return [
          { id: 'index', label: 'No.' },
          { id: 'material', label: 'Material' },
          { id: 'weight', label: 'Total Weight (Ton)' },
        ];
      default:
        return [];
    }
  }, [tabs.value]);

  const allExpenseTypes = useMemo(
    () => [...DEFAULT_SUBTRIP_EXPENSE_TYPES, ...DEFAULT_VEHICLE_EXPENSE_TYPES],
    []
  );

  const renderExpenseTypeCell = (label) => {
    const matched = allExpenseTypes.find((t) => t.label === label);
    const icon = matched?.icon;
    const display = matched?.label || label || '-';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon ? <Iconify icon={icon} sx={{ color: 'primary.main' }} /> : null}
        <span>{display}</span>
      </Box>
    );
  };

  const renderTable = (
    <Scrollbar sx={{ minHeight: 340, maxHeight: 420 }}>
      <Table size="small" sx={{ minWidth: 960 }}>
        <TableHeadCustom headLabel={headLabel} />
        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : currentList && currentList.length ? (
            <>
              {currentList.map((row, idx) => {
                if (['created', 'received'].includes(tabs.value)) {
                  const subtripId = row?._id;
                  const vehicleNo = row?.vehicleId?.vehicleNo || '-';
                  const driverName = row?.driverId?.driverName || '-';
                  const customerName = row?.customerId?.customerName || '-';
                  const route = `${row?.loadingPoint || '-'} → ${row?.unloadingPoint || '-'}`;
                  return (
                    <TableRow key={subtripId}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.subtrip.details(subtripId)}
                          variant="body2"
                          noWrap
                          sx={{ color: 'primary.main' }}
                        >
                          {row?.subtripNo}
                        </Link>
                      </TableCell>

                      <TableCell>{vehicleNo}</TableCell>
                      <TableCell>{driverName}</TableCell>
                      <TableCell>
                        <Label variant="soft" color={row?.vehicleId?.isOwn ? 'success' : 'info'}>
                          {row?.vehicleId?.isOwn ? 'Own' : 'Market'}
                        </Label>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 170 }}>
                        <Tooltip title={customerName} placement="top-start">
                          <Typography variant="body2" noWrap>
                            {customerName}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Tooltip title={route} placement="top-start">
                          <Typography variant="body2" noWrap>
                            {route}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <ListItemText
                          primary={fDate(row?.startDate)}
                          secondary={fTime(row?.startDate)}
                          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
                          secondaryTypographyProps={{
                            mt: 0.5,
                            component: 'span',
                            typography: 'caption',
                          }}
                        />
                      </TableCell>
                      <TableCell>{row?.loadingWeight ?? '-'}</TableCell>
                      <TableCell>
                        {row?.freightDetails?.rate ? fCurrency(row.freightDetails.rate) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                }

                if (tabs.value === 'expenses') {
                  const vehicleNo = row?.vehicleId?.vehicleNo || row?.vehicleNo || '-';
                  const subtripId = row?.subtripId?._id;
                  const subtripNo = row?.subtripId?.subtripNo || '-';
                  return (
                    <TableRow key={row?._id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{renderExpenseTypeCell(row?.expenseType)}</TableCell>
                      <TableCell>{vehicleNo}</TableCell>
                      <TableCell>
                        {subtripId ? (
                          <Link
                            component={RouterLink}
                            to={paths.dashboard.subtrip.details(subtripId)}
                            variant="body2"
                            noWrap
                            sx={{ color: 'primary.main' }}
                          >
                            {subtripNo}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{fDate(row?.date)}</TableCell>
                      <TableCell>{row?.amount ? fCurrency(row.amount) : '-'}</TableCell>
                    </TableRow>
                  );
                }

                if (tabs.value === 'advances') {
                  const vehicleNo = row?.vehicleId?.vehicleNo || row?.vehicleNo || '-';
                  const subtripId = row?.subtripId?._id;
                  const subtripNo = row?.subtripId?.subtripNo || '-';
                  return (
                    <TableRow key={row?._id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{renderExpenseTypeCell(row?.advanceType)}</TableCell>
                      <TableCell>{vehicleNo}</TableCell>
                      <TableCell>
                        {subtripId ? (
                          <Link
                            component={RouterLink}
                            to={paths.dashboard.subtrip.details(subtripId)}
                            variant="body2"
                            noWrap
                            sx={{ color: 'primary.main' }}
                          >
                            {subtripNo}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{fDate(row?.date)}</TableCell>
                      <TableCell>{row?.amount ? fCurrency(row.amount) : '-'}</TableCell>
                    </TableRow>
                  );
                }

                if (tabs.value === 'invoices') {
                  return (
                    <TableRow key={row?._id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.invoice.details(row?._id)}
                          variant="body2"
                          noWrap
                          sx={{ color: 'primary.main' }}
                        >
                          {row?.invoiceNo}
                        </Link>
                      </TableCell>
                      <TableCell>{row?.customerName}</TableCell>
                      <TableCell>{fDate(row?.issueDate)}</TableCell>
                      <TableCell>{row?.status}</TableCell>
                      <TableCell>{row?.netTotal ? fCurrency(row.netTotal) : '-'}</TableCell>
                    </TableRow>
                  );
                }

                if (tabs.value === 'transporterPayments') {
                  return (
                    <TableRow key={row?._id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.transporterPayment.details(row?._id)}
                          variant="body2"
                          noWrap
                          sx={{ color: 'primary.main' }}
                        >
                          {row?.paymentId}
                        </Link>
                      </TableCell>
                      <TableCell>{row?.transporterName}</TableCell>
                      <TableCell>{fDate(row?.issueDate)}</TableCell>
                      <TableCell>{row?.status}</TableCell>
                      <TableCell>{row?.netIncome ? fCurrency(row.netIncome) : '-'}</TableCell>
                    </TableRow>
                  );
                }

                if (tabs.value === 'materials') {
                  return (
                    <TableRow key={row?.materialType || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{row?.materialType || '-'}</TableCell>
                      <TableCell>{fNumber(row?.totalLoadingWeight) || '-'}</TableCell>
                    </TableRow>
                  );
                }

                return null;
              })}
            </>
          ) : (
            <TableNoData notFound />
          )}
        </TableBody>
      </Table>
    </Scrollbar>
  );

  return (
    <Card sx={{ p: 3, ...sx }} {...other}>
      {renderHeader}

      {renderTabs}

      {renderTable}
    </Card>
  );
}
