import React from 'react';

import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { wrapText } from 'src/utils/change-case';

import { Label } from 'src/components/label';

export const TABLE_COLUMNS = [
  {
    id: 'customerName',
    label: 'Customer Name',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row.customerName,
    render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Avatar alt={row.customerName} sx={{ mr: 2 }}>
          {row.customerName.slice(0, 2).toUpperCase()}
        </Avatar>
        <ListItemText
          disableTypography
          primary={
            <Link
              component={RouterLink}
              to={paths.dashboard.customer.details(row._id)}
              variant="body2"
              noWrap
              sx={{ color: 'primary.main' }}
            >
              {row.customerName}
            </Link>
          }
        />
      </div>
    ),
  },
  {
    id: 'GSTNo',
    label: 'GST No',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.GSTNo || '-',
  },
  {
    id: 'PANNo',
    label: 'PAN No',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.PANNo || '-',
  },
  {
    id: 'cellNo',
    label: 'Cell No',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.cellNo || '-',
  },
  {
    id: 'address',
    label: 'Address',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.address,
    render: (row) => (
      <Tooltip title={row.address}>
        <ListItemText
          primary={wrapText(row.address, 20)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        />
      </Tooltip>
    ),
  },
  {
    id: 'gstEnabled',
    label: 'GST Enabled',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => (row.gstEnabled ? 'Yes' : 'No'),
    render: (row) => (
      <Label variant="soft" color={row.gstEnabled ? 'success' : 'error'}>
        {row.gstEnabled ? 'Yes' : 'No'}
      </Label>
    ),
  },
  {
    id: 'state',
    label: 'State',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.state || '-',
  },
  {
    id: 'pinCode',
    label: 'Pin Code',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.pinCode || '-',
  },
  {
    id: 'transporterCode',
    label: 'Transporter Code',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.transporterCode || '-',
  },
  {
    id: 'invoicePrefix',
    label: 'Invoice Prefix',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.invoicePrefix || '-',
  },
  {
    id: 'invoiceSuffix',
    label: 'Invoice Suffix',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.invoiceSuffix || '-',
  },
  {
    id: 'currentInvoiceSerialNumber',
    label: 'Serial Number',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.currentInvoiceSerialNumber ?? '-',
  },
  {
    id: 'invoiceDueInDays',
    label: 'Invoice Due In Days',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.invoiceDueInDays ?? '-',
  },
];
