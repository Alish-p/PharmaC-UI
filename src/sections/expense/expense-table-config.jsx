import { Link, Stack, Typography, ListItemText } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fNumber } from 'src/utils/format-number';
import { fDate, fTime, fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { EXPENSE_CATEGORY_COLORS } from './config/constants';
import {
  useSubtripExpenseTypes,
  useVehicleExpenseTypes,
  DEFAULT_SUBTRIP_EXPENSE_TYPES,
  DEFAULT_VEHICLE_EXPENSE_TYPES,
} from './expense-config';

function getExpenseTypeMeta(label) {
  const all = [...DEFAULT_SUBTRIP_EXPENSE_TYPES, ...DEFAULT_VEHICLE_EXPENSE_TYPES];
  return all.find((t) => t.label === label);
}

function ExpenseTypeCell({ expenseType = '-' }) {
  const types = [...useSubtripExpenseTypes(), ...useVehicleExpenseTypes()];
  const matched = types.find((t) => t.label === expenseType);
  const icon = matched?.icon;
  const label = matched?.label || expenseType;
  return (
    <Stack direction="row" alignItems="left" spacing={1}>
      {icon ? <Iconify icon={icon} sx={{ color: 'primary.main' }} /> : null}
      <Typography variant="body2" noWrap>
        {label}
      </Typography>
    </Stack>
  );
}

export const TABLE_COLUMNS = [

  {
    id: 'vehicleNo',
    label: 'Vehicle No',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row?.vehicleId?.vehicleNo || row?.vehicleNo || '-',
    align: 'left',
    render: (row) => {
      const value = row?.vehicleId?._id;
      const vehicleNo = row?.vehicleId?.vehicleNo || row?.vehicleNo || '-';
      if (!value) return vehicleNo;
      return (
        <Link
          component={RouterLink}
          to={paths.dashboard.vehicle.details(value)}
          variant="body2"
          noWrap
          sx={{ color: 'primary.main' }}
        >
          {vehicleNo}
        </Link>
      );
    },
  },
  {
    id: 'subtripId',
    label: 'LR No',
    defaultVisible: true,
    sortable: true,
    disabled: true,
    getter: (row) => row?.subtripId?.subtripNo || '-',
    align: 'left',
    render: ({ subtripId }) => {
      if (!subtripId?._id || !subtripId?.subtripNo) {
        return (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            -
          </Typography>
        );
      }
      return (
        <Link
          component={RouterLink}
          to={paths.dashboard.subtrip.details(subtripId._id)}
          variant="body2"
          noWrap
          sx={{ color: 'primary.main' }}
        >
          {subtripId.subtripNo}
        </Link>
      );
    },
  },
  {
    id: 'expenseType',
    label: 'Expense Type',
    defaultVisible: true,
    disabled: true,
    getter: (row) => getExpenseTypeMeta(row?.expenseType)?.label || row?.expenseType || '-',
    render: ({ expenseType = '-' }) => <ExpenseTypeCell expenseType={expenseType} />,
  },
  {
    id: 'date',
    label: 'Date',
    defaultVisible: true,
    sortable: true,
    disabled: false,
    getter: (row) => fDateTime(row?.date) || '-',
    type: 'date',
    align: 'left',
    render: ({ date = '-' }) => (
      <ListItemText
        primary={fDate(new Date(date))}
        secondary={fTime(new Date(date))}
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
    id: 'remarks',
    label: 'Remarks',
    defaultVisible: false,
    disabled: false,
    align: 'left',
    getter: (row) => row?.remarks || '-',
  },
  {
    id: 'dieselRate',
    label: 'Diesel Rate (₹/Ltr)',
    defaultVisible: false,
    sortable: true,
    disabled: false,
    getter: (row) => row?.dieselPrice || '-',
    align: 'right',
  },
  {
    id: 'dieselLtr',
    label: 'Diesel (Ltr)',
    defaultVisible: false,
    sortable: true,
    disabled: false,
    getter: (row) => row?.dieselLtr || '-',
    align: 'center',
    showTotal: true,
  },
  {
    id: 'paidThrough',
    label: 'Paid Through',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row?.paidThrough || '-',
    align: 'left',
  },

  {
    id: 'expenseCategory',
    label: 'Expense Category',
    defaultVisible: false,
    disabled: false,
    align: 'left',
    getter: (row) => row?.expenseCategory || '-',
    render: ({ expenseCategory = '-' }) => (
      <Label variant="soft" color={EXPENSE_CATEGORY_COLORS[expenseCategory] || 'default'}>
        {expenseCategory}
      </Label>
    ),
  },
  {
    id: 'pumpCd',
    label: 'Pump',
    defaultVisible: false,
    disabled: false,
    align: 'left',
    getter: (row) => row?.pumpCd?.name || '-',
    render: (row) => {
      const pumpId = row?.pumpCd?._id;
      const pumpName = row?.pumpCd?.name || '-';
      if (!pumpId) return pumpName;
      return (
        <Link
          component={RouterLink}
          to={paths.dashboard.pump.details(pumpId)}
          variant="body2"
          noWrap
          sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
        >
          {pumpName}
        </Link>
      );
    },
  },
  {
    id: 'createdBy',
    label: 'Created By',
    defaultVisible: false,
    disabled: false,
    align: 'left',
    getter: (row) => row?.createdBy?.name || '-',
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    sortable: true,
    disabled: false,
    align: 'center',
    getter: (row) => row?.status || 'active',
    render: (row) => {
      const isCancelled = row?.status === 'cancelled' || row?.isDeleted;
      return (
        <Label variant="soft" color={isCancelled ? 'error' : 'success'}>
          {isCancelled ? 'Cancelled' : 'Active'}
        </Label>
      );
    },
  },
  {
    id: 'amount',
    label: 'Amount',
    defaultVisible: true,
    sortable: true,
    type: 'number',
    disabled: true,
    getter: (row) => fNumber(row?.amount),
    align: 'right',
    showTotal: true,
    render: (row) => {
      const isCancelled = row?.status === 'cancelled' || row?.isDeleted;
      return (
        <Typography
          variant="body2"
          sx={{
            textDecoration: isCancelled ? 'line-through' : 'none',
            color: isCancelled ? 'text.disabled' : 'text.primary',
            fontWeight: 'medium',
          }}
        >
          {fNumber(row?.amount)}
        </Typography>
      );
    },
  },
];
