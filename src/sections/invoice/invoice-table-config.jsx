import React from 'react';

import Link from '@mui/material/Link';
import { Tooltip } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fNumber, fCurrency } from 'src/utils/format-number';
import { fDate, fTime, fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';

import { wrapText } from '../../utils/change-case';
import { INVOICE_STATUS, INVOICE_STATUS_COLOR } from './invoice-config';

export const TABLE_COLUMNS = [
  {
    id: 'invoiceNo',
    label: 'Invoice',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row.invoiceNo,
    render: ({ _id, invoiceNo }) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ListItemText
          disableTypography
          primary={
            <Link
              component={RouterLink}
              to={paths.dashboard.invoice.details(_id)}
              variant="body2"
              noWrap
              sx={{ color: 'primary.main' }}
            >
              {invoiceNo}
            </Link>
          }
        />
      </div>
    ),
  },
  {
    id: 'customerId',
    label: 'Customer',
    defaultVisible: true,
    disabled: true,
    align: 'center',
    getter: (row) => row.customerId?.customerName,
    render: (row) => {
      const customerId = row.customerId?._id;
      const customerName = row.customerId?.customerName;
      if (!customerId) return customerName || '-';
      return (
        <Link
          component={RouterLink}
          to={paths.dashboard.customer.details(customerId)}
          variant="body2"
          noWrap
          sx={{ color: 'primary.main' }}
        >
          {customerName}
        </Link>
      );
    },
  },
  {
    id: 'customerGSTNo',
    label: 'Customer GST No',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.customerId?.GSTNo || '-',
  },
  {
    id: 'customerPANNo',
    label: 'Customer PAN No',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.customerId?.PANNo || '-',
  },

  {
    id: 'subtrips',
    label: 'Jobs',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.subtripSnapshot?.map((st) => st.subtripNo).join(', '),

    render: (row) => {
      const value = row.subtripSnapshot?.map((st) => st.subtripNo).join(', ');
      return (
        <Tooltip title={value}>
          <ListItemText
            primary={wrapText(value, 20)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </Tooltip>
      );
    },
  },

  {
    id: 'invoiceStatus',
    label: 'Invoice Status',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.invoiceStatus,
    render: (row) => {
      const { invoiceStatus, cancellationRemarks } = row;

      const statusLabel = (
        <Label variant="soft" color={INVOICE_STATUS_COLOR[invoiceStatus] || 'default'}>
          {invoiceStatus}
        </Label>
      );

      if (invoiceStatus === INVOICE_STATUS.CANCELLED && cancellationRemarks) {
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
    sortable: true,
    disabled: false,
    align: 'center',
    getter: (row) => fDateTime(row.issueDate),
    render: ({ issueDate }) => (
      <ListItemText
        primary={fDate(new Date(issueDate))}
        secondary={fTime(new Date(issueDate))}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
      />
    ),
  },
  {
    id: 'dueDate',
    label: 'Due Date',
    defaultVisible: true,
    sortable: true,
    disabled: false,
    align: 'center',
    getter: (row) => fDateTime(row.dueDate),
    render: ({ dueDate }) => (
      <ListItemText
        primary={fDate(new Date(dueDate))}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
      />
    ),
  },
  {
    id: 'totalAmountBeforeTax',
    label: 'Taxable Amount',
    defaultVisible: false,
    sortable: true,
    disabled: false,
    align: 'right',
    getter: (row) => fNumber(row.totalAmountBeforeTax),
    showTotal: true,
    render: ({ totalAmountBeforeTax }) => (
      <ListItemText
        primary={fCurrency(totalAmountBeforeTax)}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
      />
    ),
  },
  {
    id: 'cgst',
    label: 'CGST (TAX)',
    defaultVisible: false,
    sortable: true,
    disabled: false,
    align: 'right',
    getter: (row) => fNumber(row.taxBreakup?.cgst?.amount || 0),
    render: (row) => {
      const value = row.taxBreakup?.cgst?.amount || 0;
      return (
        <ListItemText
          primary={fCurrency(value)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        />
      );
    },
    showTotal: true,
  },
  {
    id: 'sgst',
    label: 'SGST (TAX)',
    defaultVisible: false,
    sortable: true,
    disabled: false,
    align: 'right',
    showTotal: true,
    getter: (row) => fNumber(row.taxBreakup?.sgst?.amount || 0),
    render: (row) => {
      const value = row.taxBreakup?.sgst?.amount || 0;
      return (
        <ListItemText
          primary={fCurrency(value)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        />
      );
    },
  },
  {
    id: 'igst',
    label: 'IGST (TAX)',
    defaultVisible: false,
    sortable: true,
    disabled: false,
    align: 'right',
    showTotal: true,
    getter: (row) => fNumber(row.taxBreakup?.igst?.amount || 0),
    render: (row) => {
      const value = row.taxBreakup?.igst?.amount || 0;
      return (
        <ListItemText
          primary={fCurrency(value)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        />
      );
    },
  },
  {
    id: 'netTotal',
    label: 'Amount',
    defaultVisible: true,
    sortable: true,
    disabled: false,
    align: 'right',
    getter: (row) => fNumber(row.netTotal),
    showTotal: true,
    render: ({ netTotal }) => (
      <ListItemText
        primary={fCurrency(netTotal)}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
      />
    ),
  },
  {
    id: 'remainingAmount',
    label: 'Remaining Amount',
    defaultVisible: false,
    sortable: true,
    disabled: false,
    align: 'right',
    getter: (row) => fNumber((row.netTotal || 0) - (row.totalReceived || 0)),
    showTotal: true,
    render: (row) => {
      const remainingAmount = (row.netTotal || 0) - (row.totalReceived || 0);
      return (
        <ListItemText
          primary={fCurrency(remainingAmount)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        />
      );
    },
  },
];
