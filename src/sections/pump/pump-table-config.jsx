import React from 'react';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { wrapText } from 'src/utils/change-case';

import { Iconify } from 'src/components/iconify';

export const TABLE_COLUMNS = [
  {
    id: 'name',
    label: 'Pump Name',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row.name,
    render: (row) => {
      const value = row.name || '';
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={value} sx={{ mr: 2 }}>
            {value.slice(0, 1).toUpperCase()}
          </Avatar>
          <ListItemText
            disableTypography
            primary={
              <Link
                component={RouterLink}
                to={paths.dashboard.pump.details(row._id)}
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
    id: 'phone',
    label: 'Phone',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.phone,
  },
  {
    id: 'ownerName',
    label: 'Owner',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.ownerName,
  },
  {
    id: 'address',
    label: 'Address',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.address,
    render: (row) => {
      const value = row.address || '';
      return (
        <Tooltip title={value}>
          <Typography variant="body2" noWrap>
            {wrapText(value, 20)}
          </Typography>
        </Tooltip>
      );
    },
  },
  {
    id: 'bankName',
    label: 'Bank Name',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.bankDetails?.name,
  },
  {
    id: 'accountNo',
    label: 'Account No',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.bankDetails?.accNo,
  },
  {
    id: 'dieselPrice',
    label: 'Diesel Price',
    defaultVisible: true,
    disabled: false,
    getter: (row) => (row.currentPrices?.Diesel ? `₹${row.currentPrices.Diesel}` : '-'),
    render: (row) => {
      const price = row.currentPrices?.Diesel;
      if (!price) return '-';
      return (
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Iconify icon="solar:gas-station-bold" width={18} sx={{ color: 'info.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
            ₹{price}
          </Typography>
        </Stack>
      );
    },
  },
  {
    id: 'petrolPrice',
    label: 'Petrol Price',
    defaultVisible: true,
    disabled: false,
    getter: (row) => (row.currentPrices?.Petrol ? `₹${row.currentPrices.Petrol}` : '-'),
    render: (row) => {
      const price = row.currentPrices?.Petrol;
      if (!price) return '-';
      return (
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Iconify icon="solar:gas-station-bold" width={18} sx={{ color: 'warning.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
            ₹{price}
          </Typography>
        </Stack>
      );
    },
  },
  {
    id: 'cngPrice',
    label: 'CNG Price',
    defaultVisible: true,
    disabled: false,
    getter: (row) => (row.currentPrices?.CNG ? `₹${row.currentPrices.CNG}` : '-'),
    render: (row) => {
      const price = row.currentPrices?.CNG;
      if (!price) return '-';
      return (
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Iconify icon="solar:gas-station-bold" width={18} sx={{ color: 'success.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
            ₹{price}
          </Typography>
        </Stack>
      );
    },
  },
];
