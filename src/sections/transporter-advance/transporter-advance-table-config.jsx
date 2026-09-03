import { Link, Stack, Typography, ListItemText } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fNumber } from 'src/utils/format-number';
import { fDate, fTime, fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import {
  useSubtripExpenseTypes,
  useVehicleExpenseTypes,
  DEFAULT_SUBTRIP_EXPENSE_TYPES,
  DEFAULT_VEHICLE_EXPENSE_TYPES,
} from '../expense/expense-config';

const STATUS_COLORS = {
  Pending: 'warning',
  Recovered: 'success',
};

function getAdvanceTypeMeta(label) {
  const all = [...DEFAULT_SUBTRIP_EXPENSE_TYPES, ...DEFAULT_VEHICLE_EXPENSE_TYPES];
  return all.find((t) => t.label === label);
}

function AdvanceTypeCell({ advanceType = '-' }) {
  const types = [...useSubtripExpenseTypes(), ...useVehicleExpenseTypes()];
  const matched = types.find((t) => t.label === advanceType);
  const icon = matched?.icon;
  const label = matched?.label || advanceType;
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {icon ? <Iconify icon={icon} sx={{ color: 'primary.main' }} /> : null}
      <Typography variant="body2" noWrap>
        {label}
      </Typography>
    </Stack>
  );
}

export const TABLE_COLUMNS = [
  {
    id: 'subtripId',
    label: 'LR No',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row?.subtripId?.subtripNo || '-',
    align: 'left',
    render: ({ subtripId = '-' }) => (
      <Link
        component={RouterLink}
        to={paths.dashboard.subtrip.details(subtripId?._id)}
        variant="body2"
        noWrap
        sx={{ color: 'primary.main' }}
      >
        {subtripId?.subtripNo || '-'}
      </Link>
    ),
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row?.status || '-',
    align: 'left',
    render: ({ status = '-' }) => (
      <Label variant="soft" color={STATUS_COLORS[status] || 'default'}>
        {status}
      </Label>
    ),
  },
  {
    id: 'vehicleNo',
    label: 'Vehicle No',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row?.vehicleId?.vehicleNo || row?.vehicleNo || '-',
    align: 'left',
  },
  {
    id: 'transporter',
    label: 'Transporter',
    defaultVisible: true,
    disabled: false,
    align: 'left',
    getter: (row) => row?.vehicleId?.transporter?.transportName || '-',
    render: ({ vehicleId }) => {
      const transporter = vehicleId?.transporter;
      if (transporter?._id) {
        return (
          <Link
            component={RouterLink}
            to={paths.dashboard.transporter.details(transporter._id)}
            variant="body2"
            noWrap
            sx={{ color: 'primary.main' }}
          >
            {transporter.transportName || '-'}
          </Link>
        );
      }
      return '-';
    },
  },
  {
    id: 'transporterBankName',
    label: 'Transporter Bank Name',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row?.vehicleId?.transporter?.bankDetails?.name || '-',
  },
  {
    id: 'transporterAccNo',
    label: 'Transporter Account Number',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row?.vehicleId?.transporter?.bankDetails?.accNo || '-',
  },
  {
    id: 'transporterIFSC',
    label: 'Transporter IFSC Code',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row?.vehicleId?.transporter?.bankDetails?.ifsc || '-',
  },
  {
    id: 'advanceType',
    label: 'Advance Type',
    defaultVisible: true,
    disabled: true,
    getter: (row) => getAdvanceTypeMeta(row?.advanceType)?.label || row?.advanceType || '-',
    render: ({ advanceType = '-' }) => <AdvanceTypeCell advanceType={advanceType} />,
  },
  {
    id: 'date',
    label: 'Date',
    defaultVisible: true,
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
    disabled: false,
    getter: (row) => row?.dieselPrice || '-',
    align: 'right',
  },
  {
    id: 'dieselLtr',
    label: 'Diesel (Ltr)',
    defaultVisible: false,
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
    id: 'pumpCd',
    label: 'Pump Name',
    defaultVisible: false,
    disabled: false,
    align: 'left',
    getter: (row) => row?.pumpCd?.name || '-',
  },
  {
    id: 'paymentReceiptId',
    label: 'Payment Receipt',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row?.subtripId?.transporterPaymentReceiptId?.paymentId || '-',
    align: 'left',
    render: ({ subtripId }) => {
      const receipt = subtripId?.transporterPaymentReceiptId;

      if (receipt?._id) {
        return (
          <Link
            component={RouterLink}
            to={paths.dashboard.transporterPayment.details(receipt._id)}
            variant="body2"
            noWrap
            sx={{ color: 'primary.main' }}
          >
            {receipt.paymentId || '-'}
          </Link>
        );
      }
      return '-';
    },
  },
  {
    id: 'amount',
    label: 'Amount',
    defaultVisible: true,
    type: 'number',
    disabled: true,
    getter: (row) => fNumber(row?.amount),
    align: 'right',
    showTotal: true,
  },
];
