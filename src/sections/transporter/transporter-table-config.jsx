import React from 'react';

import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { wrapText } from 'src/utils/change-case';
import { fDate, fToNow } from 'src/utils/format-time';

import { Label } from 'src/components/label';

export const TABLE_COLUMNS = [
  {
    id: 'transportName',
    label: 'Transport Name',
    defaultVisible: true,
    sortable: true,
    disabled: true,
    getter: (row) => row.transportName,
    render: (row) => {
      const value = row.transportName;
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={value} sx={{ mr: 2 }}>
            {value.slice(0, 2).toUpperCase()}
          </Avatar>
          <ListItemText
            disableTypography
            primary={
              <Link
                component={RouterLink}
                to={paths.dashboard.transporter.details(row._id)}
                variant="body2"
                noWrap
                sx={{ color: 'primary.main' }}
              >
                {value}
              </Link>
            }
          />
        </div>
      );
    },
  },
  {
    id: 'vehicleCount',
    label: 'No. of vehicles',
    defaultVisible: true,
    sortable: true,
    disabled: false,
    getter: (row) => row.vehicleCount,
  },

  {
    id: 'address',
    label: 'Address',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.address,
    render: (row) => {
      const value = row.address;
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
    id: 'cellNo',
    label: 'Phone Number',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.cellNo,
  },
  {
    id: 'ownerName',
    label: 'Owner Name',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.ownerName,
  },
  {
    id: 'emailId',
    label: 'Email ID',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.emailId,
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.isActive,
    render: (row) => (
      <Label variant="soft" color={row.isActive ? 'success' : 'error'}>
        {row.isActive ? 'Active' : 'Inactive'}
      </Label>
    ),
  },
  {
    id: 'state',
    label: 'State',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.state,
  },
  {
    id: 'paymentMode',
    label: 'Payment Mode',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.paymentMode,
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
    id: 'lastSubtripDate',
    label: 'Last Subtrip',
    defaultVisible: false,
    sortable: true,
    disabled: false,
    getter: (row) =>
      row.lastSubtripDate ? new Date(row.lastSubtripDate).toLocaleDateString() : 'Never',
    render: (row) => {
      const value = row.lastSubtripDate;
      if (!value) return 'Never';
      return (
        <ListItemText
          primary={fDate(value)}
          secondary={fToNow(value)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{ typography: 'caption', noWrap: true }}
        />
      );
    },
  },
  {
    id: 'gstNo',
    label: 'GST Number',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.gstNo,
  },
  {
    id: 'panNo',
    label: 'PAN Number',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.panNo,
  },
  {
    id: 'tdsPercentage',
    label: 'TDS (%)',
    defaultVisible: false,
    sortable: true,
    disabled: false,
    getter: (row) => row.tdsPercentage,
    render: (row) =>
      row.tdsPercentage !== undefined && row.tdsPercentage !== null ? `${row.tdsPercentage}%` : '',
  },
  {
    id: 'podCharges',
    label: 'POD Charges',
    defaultVisible: false,
    sortable: true,
    disabled: false,
    getter: (row) => row.podCharges,
  },
];
