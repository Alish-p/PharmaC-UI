import { Box, Link, Stack, Tooltip, Typography, ListItemText } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { wrapText } from 'src/utils/change-case';
import { fNumber, fCurrency } from 'src/utils/format-number';
import { fDate, fTime, fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { SUBTRIP_STATUS_COLORS } from '../constants';
import { fFreightRate, getFreightExplanation } from '../utils';

export const TABLE_COLUMNS = [
  {
    id: '_id',
    label: 'LR No',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row?.subtripNo,
    align: 'center',
    render: ({ _id, subtripNo }) => (
      <Link
        component={RouterLink}
        to={paths.dashboard.subtrip.details(_id)}
        variant="body2"
        noWrap
        sx={{ color: 'primary.main' }}
      >
        {subtripNo}
      </Link>
    ),
  },
  {
    id: 'tripId',
    label: 'Trip No',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.tripId?.tripNo,
    align: 'center',
    render: (row) => {
      const value = row?.tripId?._id || '-';
      return (
        <Link
          component={RouterLink}
          to={paths.dashboard.trip.details(value)}
          variant="body2"
          noWrap
          sx={{ color: 'primary.main' }}
        >
          {row?.tripId?.tripNo || '-'}
        </Link>
      );
    },
  },
  {
    id: 'vehicleNo',
    label: 'Vehicle No',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row?.vehicleId?.vehicleNo || '-',
    align: 'center',
    render: (row) => {
      const value = row?.vehicleId?._id;
      if (!value) return row?.vehicleId?.vehicleNo || '-';
      return (
        <Link
          component={RouterLink}
          to={paths.dashboard.vehicle.details(value)}
          variant="body2"
          noWrap
          sx={{ color: 'primary.main' }}
        >
          {row?.vehicleId?.vehicleNo}
        </Link>
      );
    },
  },
  {
    id: 'vehicleOwnership',
    label: 'Vehicle Ownership',
    defaultVisible: false,
    disabled: false,
    getter: (row) => (row?.vehicleId?.isOwn ? 'Own' : 'Market'),
    align: 'center',
    render: (row) => (
      <Label variant="soft" color={row?.vehicleId?.isOwn ? 'primary' : 'secondary'}>
        {row?.vehicleId?.isOwn ? 'Own' : 'Market'}
      </Label>
    ),
  },
  {
    id: 'driver',
    label: 'Driver',
    defaultVisible: false,
    disabled: false,
    getter: (row) => {
      const name = row?.driverId?.driverName || '-';
      const cell = row?.driverId?.driverCellNo;
      return cell ? `${name} - ${cell}` : name;
    },
    align: 'center',
    render: (row) => {
      const value = row?.driverId?._id;
      return (
        <ListItemText
          primary={
            value ? (
              <Link
                component={RouterLink}
                to={paths.dashboard.driver.details(value)}
                variant="body2"
                noWrap
                sx={{ color: 'primary.main' }}
              >
                {row?.driverId?.driverName || '-'}
              </Link>
            ) : (
              row?.driverId?.driverName || '-'
            )
          }
          secondary={row?.driverId?.driverCellNo || ''}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            component: 'span',
            typography: 'caption',
          }}
        />
      );
    },
  },
  {
    id: 'customerId',
    label: 'Customer',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row?.customerId?.customerName || '-',
    align: 'center',
    render: (row) => {
      const value = row?.customerId?._id;
      if (!value) return row?.customerId?.customerName || '-';
      return (
        <Link
          component={RouterLink}
          to={paths.dashboard.customer.details(value)}
          variant="body2"
          noWrap
          sx={{ color: 'primary.main' }}
        >
          {row?.customerId?.customerName}
        </Link>
      );
    },
  },
  {
    id: 'route',
    label: 'Route',
    defaultVisible: true,
    disabled: false,
    getter: (row) =>
      row?.loadingPoint && row?.unloadingPoint
        ? `${row.loadingPoint} → ${row.unloadingPoint}`
        : '-',
    align: 'center',
    render: (row) => {
      const routeText =
        row?.loadingPoint && row?.unloadingPoint
          ? `${row.loadingPoint} → ${row.unloadingPoint}`
          : '-';

      if (routeText === '-') return routeText;

      return (
        <Tooltip title={routeText} arrow placement="top">
          <Typography variant="body2" noWrap sx={{ maxWidth: 230, display: 'inline-block' }}>
            {wrapText(routeText, 40)}
          </Typography>
        </Tooltip>
      );
    },
  },
  {
    id: 'ewayBill',
    label: 'E-way Bill No',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.ewayBill || '-',
    align: 'center',
  },
  {
    id: 'invoiceNo',
    label: 'Invoice No',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.invoiceNo || '-',
    align: 'center',
  },
  {
    id: 'shipmentNo',
    label: 'Shipment No',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.shipmentNo || '-',
    align: 'center',
  },
  {
    id: 'orderNo',
    label: 'Order No',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.orderNo || '-',
  },
  {
    id: 'referenceSubtripNo',
    label: 'Reference Job No',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.referenceSubtripNo || '-',
    align: 'center',
  },
  {
    id: 'consignee',
    label: 'Consignee',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.consignee || '-',
    align: 'center',
  },
  {
    id: 'materialType',
    label: 'Material',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.materialType || '-',
    align: 'center',
  },
  {
    id: 'quantity',
    label: 'Quantity',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.quantity || '-',
    align: 'center',
    showTotal: true,
  },
  {
    id: 'grade',
    label: 'Grade',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.grade || '-',
    align: 'center',
  },
  {
    id: 'startDate',
    label: 'Dispatch Date',
    defaultVisible: true,
    disabled: false,
    getter: (row) => fDateTime(row?.startDate) || '-',
    type: 'date',
    align: 'center',
    render: ({ startDate }) => (
      <ListItemText
        primary={fDate(new Date(startDate))}
        secondary={fTime(new Date(startDate))}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        secondaryTypographyProps={{
          mt: 0.5,
          component: 'span',
          typography: 'caption',
        }}
      />
    ),
  },
  {
    id: 'endDate',
    label: 'Received Date',
    defaultVisible: false,
    disabled: false,
    getter: (row) => fDate(row?.endDate) || '-',
    type: 'date',
    align: 'center',
    render: (row) => (
      <ListItemText
        primary={row?.endDate ? fDate(new Date(row?.endDate)) : '-'}
        secondary={row?.endDate ? fTime(new Date(row?.endDate)) : '-'}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        secondaryTypographyProps={{
          mt: 0.5,
          component: 'span',
          typography: 'caption',
        }}
      />
    ),
  },
  {
    id: 'ewayExpiryDate',
    label: 'E-Way Bill Expiry Date',
    defaultVisible: false,
    disabled: false,
    getter: (row) => fDate(row?.ewayExpiryDate) || '-',
    type: 'date',
    align: 'center',
    render: (row) => (
      <ListItemText
        primary={row?.ewayExpiryDate ? fDate(new Date(row?.ewayExpiryDate)) : '-'}
        secondary={row?.ewayExpiryDate ? fTime(new Date(row?.ewayExpiryDate)) : '-'}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        secondaryTypographyProps={{
          mt: 0.5,
          component: 'span',
          typography: 'caption',
        }}
      />
    ),
  },
  {
    id: 'loadingPoint',
    label: 'Loading Point',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.loadingPoint || '-',
  },
  {
    id: 'unloadingPoint',
    label: 'Unloading Point',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.unloadingPoint || '-',
    align: 'center',
  },
  {
    id: 'loadingWeight',
    label: 'Loading Weight',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.loadingWeight || '-',
    align: 'center',
    showTotal: true,
  },
  {
    id: 'unloadingWeight',
    label: 'Unloading Weight',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.unloadingWeight || '-',
    align: 'center',
    showTotal: true,
  },
  {
    id: 'shortageWeight',
    label: 'Shortage Weight (Ton)',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.shortageWeight || '-',
    align: 'center',
    showTotal: true,
  },
  {
    id: 'shortageAmount',
    label: 'Shortage Amount (₹)',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.shortageAmount || '-',
    align: 'center',
    showTotal: true,
  },
  {
    id: 'rate',
    label: 'Rate',
    defaultVisible: false,
    disabled: false,
    getter: (row) => {
      const { rate, freightModel, freightAmount } = row?.freightDetails || {};
      return fFreightRate(rate || 0, freightModel, freightAmount);
    },
    align: 'center',
  },
  {
    id: 'freightAmount',
    label: 'Freight Amount',
    defaultVisible: false,
    disabled: false,
    getter: (row) => {
      const freightAmount = row?.freightDetails?.freightAmount;
      if (typeof freightAmount === 'number') {
        return fCurrency(freightAmount);
      }
      return '-';
    },
    align: 'center',
    showTotal: true,
    render: (row) => {
      let amount = 0;
      const freightAmount = row?.freightDetails?.freightAmount;
      if (typeof freightAmount === 'number') {
        amount = freightAmount;
      } else {
        const rate = row?.freightDetails?.rate;
        if (rate && row?.loadingWeight) {
          amount = rate * row.loadingWeight;
        }
      }

      if (amount === 0 && typeof freightAmount !== 'number') return '-';

      return (
        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center">
          <span>{fCurrency(amount)}</span>
          <Tooltip title={getFreightExplanation(row, false)} arrow placement="top">
            <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
              <Iconify icon="eva:info-outline" width={16} sx={{ color: 'text.disabled' }} />
            </Box>
          </Tooltip>
        </Stack>
      );
    },
  },
  {
    id: 'commissionRate',
    label: 'Commission Rate',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.commissionDetails?.commissionRate ?? '-',
    align: 'center',
  },
  {
    id: 'commissionAmount',
    label: 'Commission Amount',
    defaultVisible: false,
    disabled: false,
    getter: (row) => {
      if (row?.vehicleId?.isOwn === true) return 'N.A.';
      const amount = row?.commissionDetails?.commissionAmount;
      if (typeof amount === 'number') {
        return fCurrency(amount);
      }
      return '-';
    },
    align: 'center',
    showTotal: true,
    render: (row) => {
      if (row?.vehicleId?.isOwn === true) {
        return (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            N.A.
          </Typography>
        );
      }
      const amount = row?.commissionDetails?.commissionAmount;
      if (typeof amount === 'number') {
        return fCurrency(amount);
      }
      return '-';
    },
  },
  {
    id: 'expenses',
    label: 'Expenses',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => {
      if (row?.vehicleId?.isOwn === false) return 'N.A.';
      if (!row?.expenses || row.expenses.length === 0) return fNumber(0);
      const total = row.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      return fNumber(total);
    },
    render: (row) => {
      if (row?.vehicleId?.isOwn === false) {
        return (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            N.A.
          </Typography>
        );
      }
      if (!row?.expenses || row.expenses.length === 0) return fNumber(0);
      const total = row.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      return (
        <Label variant="soft" color="warning">
          {fNumber(total)}
        </Label>
      );
    },
  },
  {
    id: 'advances',
    label: 'Advances',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => {
      if (row?.vehicleId?.isOwn === true) return 'N.A.';
      if (!row?.advances || row.advances.length === 0) return fNumber(0);
      const total = row.advances.reduce((sum, adv) => sum + (adv.amount || 0), 0);
      return fNumber(total);
    },
    render: (row) => {
      if (row?.vehicleId?.isOwn === true) {
        return (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            N.A.
          </Typography>
        );
      }
      if (!row?.advances || row.advances.length === 0) return fNumber(0);
      const total = row.advances.reduce((sum, adv) => sum + (adv.amount || 0), 0);
      return (
        <Label variant="soft" color="info">
          {fNumber(total)}
        </Label>
      );
    },
  },
  {
    id: 'profitAndLoss',
    label: 'Profit & Loss',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => {
      if (row?.vehicleId?.isOwn === false) {
        return fNumber(row?.commissionDetails?.commissionAmount || 0);
      }

      const freight = row?.freightDetails?.freightAmount || 0;
      const expenses = row?.expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
      return fNumber(freight - expenses);
    },
    render: (row) => {
      let pnl = 0;
      if (row?.vehicleId?.isOwn === false) {
        pnl = row?.commissionDetails?.commissionAmount || 0;
      } else {
        const freight = row?.freightDetails?.freightAmount || 0;
        const expenses = row?.expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
        pnl = freight - expenses;
      }

      return (
        <Label variant="soft" color={pnl >= 0 ? 'success' : 'error'}>
          {fNumber(pnl)}
        </Label>
      );
    },
  },
  {
    id: 'transport',
    label: 'Transporter',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.vehicleId?.transporter?.transportName || '-',
    align: 'center',
  },
  {
    id: 'createdAt',
    label: 'Created At',
    defaultVisible: false,
    disabled: false,
    getter: (row) => fDateTime(row?.createdAt) || '-',
    type: 'date',
    align: 'center',
    render: (row) => (
      <ListItemText
        primary={row?.createdAt ? fDate(new Date(row?.createdAt)) : '-'}
        secondary={row?.createdAt ? fTime(new Date(row?.createdAt)) : '-'}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        secondaryTypographyProps={{
          mt: 0.5,
          component: 'span',
          typography: 'caption',
        }}
      />
    ),
  },
  {
    id: 'epod',
    label: 'EPOD',
    defaultVisible: false,
    disabled: false,
    getter: (row) => (row?.podSignature ? 'Signed' : '-'),
    align: 'center',
    render: (row) => {
      if (!row?.podSignature) return '-';
      return (
        <Tooltip title={`Signed by ${row.podSignedBy || 'N/A'}`} arrow>
          <Label variant="soft" color="success">
            ✍️ Signed
          </Label>
        </Tooltip>
      );
    },
  },
  {
    id: 'subtripStatus',
    label: 'Job Status',
    tooltip: 'Track lifecycle: In-Queue (created), Loaded (in transit), Received (delivered), Billed (invoiced), Error (issue)',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row?.subtripStatus || '-',
    align: 'center',
    render: (row) => {
      const value = row?.subtripStatus || '-';
      return (
        <Label variant="soft" color={SUBTRIP_STATUS_COLORS[value] || 'default'}>
          {value}
        </Label>
      );
    },
  },
  {
    id: 'errorRemarks',
    label: 'Error Remarks',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.errorRemarks || '-',
    align: 'center',
    render: (row) => {
      const value = row?.errorRemarks;
      if (!value) return '-';
      return (
        <Tooltip title={value} arrow>
          <ListItemText
            primary={wrapText(value, 25)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </Tooltip>
      );
    },
  },
];
