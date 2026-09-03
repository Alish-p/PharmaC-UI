import React from 'react';

import Link from '@mui/material/Link';
import { Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';

import { wrapText } from '../../utils/change-case';
import { SUBTRIP_EXPENSE_TYPES } from '../expense/expense-config';
import { getTransporterPaymentStatusColor } from './utils/constant';

export const TABLE_COLUMNS = [
  {
    id: 'paymentId',
    label: 'Payment ID',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row.paymentId,
    render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ListItemText
          disableTypography
          primary={
            <Link
              component={RouterLink}
              to={paths.dashboard.transporterPayment.details(row._id)}
              variant="body2"
              noWrap
              sx={{ color: 'primary.main' }}
            >
              {row.paymentId}
            </Link>
          }
        />
      </div>
    ),
  },
  {
    id: 'transporter',
    label: 'Transporter',
    defaultVisible: true,
    disabled: false,
    align: 'left',
    width: 160,
    getter: (row) => row.transporterId?.transportName || '-',
    render: (row) => (
      <ListItemText
        disableTypography
        primary={
          row.transporterId?._id ? (
            <Link
              component={RouterLink}
              href={paths.dashboard.transporter.details(row.transporterId._id)}
              variant="body2"
              noWrap
              sx={{ color: 'primary.main', cursor: 'pointer' }}
            >
              {row.transporterId?.transportName}
            </Link>
          ) : (
            <Typography variant="body2" noWrap>
              {row.transporterId?.transportName || '-'}
            </Typography>
          )
        }
        secondary={
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
            {row.transporterId?.cellNo}
          </Typography>
        }
      />
    ),
  },
  {
    id: 'transporterGSTNo',
    label: 'Transporter GST No',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.transporterId?.gstNo || '-',
  },
  {
    id: 'transporterPANNo',
    label: 'Transporter PAN No',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.transporterId?.panNo || '-',
  },
  {
    id: 'transporterBankName',
    label: 'Transporter Bank Name',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.transporterId?.bankDetails?.name || '-',
  },
  {
    id: 'transporterAccNo',
    label: 'Transporter Account Number',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.transporterId?.bankDetails?.accNo || '-',
  },
  {
    id: 'transporterIFSC',
    label: 'Transporter IFSC Code',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.transporterId?.bankDetails?.ifsc || '-',
  },
  {
    id: 'subtrips',
    label: 'Jobs',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.subtripSnapshot?.map((st) => st.subtripNo).join(', '),
    render: (row) => {
      const value = row.subtripSnapshot?.map((st) => st.subtripNo).join(', ');
      return (
        <Tooltip title={value}>
          <ListItemText
            primary={wrapText(value, 30)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </Tooltip>
      );
    },
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.status,
    render: (row) => {
      const { status, cancellationRemarks } = row;
      const statusLabel = (
        <Label variant="soft" color={getTransporterPaymentStatusColor(status)}>
          {status}
        </Label>
      );

      if (status === 'cancelled' && cancellationRemarks) {
        return <Tooltip title={cancellationRemarks}>{statusLabel}</Tooltip>;
      }

      return statusLabel;
    },
  },
  {
    id: 'cancellationRemarks',
    label: 'Cancellation Remarks',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.cancellationRemarks || '-',
    render: (row) => {
      const { cancellationRemarks } = row;
      if (!cancellationRemarks) return '-';
      return (
        <Tooltip title={cancellationRemarks}>
          <ListItemText
            primary={wrapText(cancellationRemarks, 25)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </Tooltip>
      );
    },
  },
  {
    id: 'issueDate',
    label: 'Issue Date',
    defaultVisible: true,
    disabled: false,
    sortable: true,
    align: 'center',
    getter: (row) => fDate(row.issueDate),
    render: (row) => (
      <ListItemText
        primary={fDate(new Date(row.issueDate))}
        secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
      />
    ),
  },
  {
    id: 'paidDate',
    label: 'Paid Date',
    defaultVisible: true,
    disabled: false,
    sortable: true,
    align: 'center',
    getter: (row) => (row.paidDate ? fDate(row.paidDate) : '-'),
    render: (row) => (
      <ListItemText
        primary={row.paidDate ? fDate(new Date(row.paidDate)) : '-'}
        secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
      />
    ),
  },
  {
    id: 'dieselTotal',
    label: 'Diesel',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    align: 'right',
    showTotal: true,
    getter: (row) =>
      fNumber(
        (row.subtripSnapshot || []).reduce(
          (sum, st) =>
            sum +
            (st.expenses || [])
              .filter((e) => e.expenseType === SUBTRIP_EXPENSE_TYPES.DIESEL)
              .reduce((s, e) => s + (e.amount || 0), 0),
          0
        )
      ),
  },
  {
    id: 'tripAdvanceTotal',
    label: 'Trip Advance',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    align: 'right',
    showTotal: true,
    getter: (row) =>
      fNumber(
        (row.subtripSnapshot || []).reduce(
          (sum, st) =>
            sum +
            (st.expenses || [])
              .filter((e) => e.expenseType === SUBTRIP_EXPENSE_TYPES.DRIVER_ADVANCE)
              .reduce((s, e) => s + (e.amount || 0), 0),
          0
        )
      ),
  },
  {
    id: 'podAmount',
    label: 'POD Amount',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    align: 'right',
    showTotal: true,
    getter: (row) =>
      fNumber(
        (row.additionalCharges || [])
          .filter((ch) => (ch.label || '').toLowerCase().includes('pod'))
          .reduce((s, ch) => s + (ch.amount || 0), 0)
      ),
  },
  {
    id: 'materialDamagesTotal',
    label: 'Material Damages',
    defaultVisible: false,
    disabled: false,
    align: 'right',
    showTotal: true,
    getter: (row) =>
      fNumber(
        (row.subtripSnapshot || []).reduce(
          (sum, st) =>
            sum +
            (st.expenses || [])
              .filter((e) => e.expenseType === SUBTRIP_EXPENSE_TYPES.MATERIAL_DAMAGES)
              .reduce((s, e) => s + (e.amount || 0), 0),
          0
        )
      ),
  },
  {
    id: 'latePouchPenaltyTotal',
    label: 'Late Pouch Penalty',
    defaultVisible: false,
    disabled: false,
    align: 'right',
    showTotal: true,
    getter: (row) =>
      fNumber(
        (row.subtripSnapshot || []).reduce(
          (sum, st) =>
            sum +
            (st.expenses || [])
              .filter((e) => e.expenseType === SUBTRIP_EXPENSE_TYPES.LATE_POUCH_PENALTY)
              .reduce((s, e) => s + (e.amount || 0), 0),
          0
        )
      ),
  },
  {
    id: 'totalShortageAmount',
    label: 'Total Shortage Amount',
    defaultVisible: false,
    disabled: false,
    showTotal: true,
    align: 'right',
    getter: (row) => fNumber(row.summary?.totalShortageAmount),
  },
  {
    id: 'cgst',
    label: 'CGST(Tax)',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    align: 'right',
    getter: (row) => fNumber(row.taxBreakup?.cgst?.amount),
    showTotal: true,
  },
  {
    id: 'sgst',
    label: 'SGST(Tax)',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    align: 'right',
    getter: (row) => fNumber(row.taxBreakup?.sgst?.amount),
    showTotal: true,
  },
  {
    id: 'igst',
    label: 'IGST(Tax)',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    align: 'right',
    getter: (row) => fNumber(row.taxBreakup?.igst?.amount),
    showTotal: true,
  },
  {
    id: 'tds',
    label: 'TDS',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    align: 'right',
    getter: (row) => fNumber(row.taxBreakup?.tds?.amount),
    showTotal: true,
  },
  {
    id: 'taxableAmount',
    label: 'Taxable amount',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    align: 'right',
    getter: (row) => fNumber(row.summary?.totalFreightAmount),
    showTotal: true,
  },
  {
    id: 'additionalCharges',
    label: 'Additional Charges',
    defaultVisible: false,
    disabled: false,
    getter: (row) =>
      row.additionalCharges
        ? row.additionalCharges.map((ch) => `${ch.label}(${fNumber(ch.amount)})`).join(', ')
        : '',
    render: (row) => {
      const value = row.additionalCharges
        ? row.additionalCharges.map((ch) => `${ch.label}(${fNumber(ch.amount)})`).join(', ')
        : '';
      return (
        <Tooltip title={value}>
          <ListItemText
            primary={wrapText(value, 30)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </Tooltip>
      );
    },
  },
  {
    id: 'amount',
    label: 'Amount',
    defaultVisible: true,
    disabled: false,
    sortable: true,
    align: 'right',
    showTotal: true,
    getter: (row) => fNumber(row.summary?.netIncome),
  },
];
