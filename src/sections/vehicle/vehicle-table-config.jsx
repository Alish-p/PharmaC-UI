import React from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';

import { titleCase } from '../../utils/change-case';
import MiniTyreLayout from './components/mini-tyre-layout';

export const TABLE_COLUMNS = [
  {
    id: 'vehicleNo',
    label: 'Vehicle No',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row.vehicleNo,
    render: (row) => {
      const value = row.vehicleNo;
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
                to={paths.dashboard.vehicle.details(row._id)}
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
    id: 'vehicleType',
    label: 'Vehicle Type',
    defaultVisible: true,
    disabled: true,
    align: 'center',
    getter: (row) => titleCase(row.vehicleType),
  },
  {
    id: 'isOwn',
    label: 'Ownership',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => (row.isOwn ? 'Own' : 'Market'),
    render: (row) => {
      const value = row.isOwn ? 'Own' : 'Market';
      return (
        <Label variant="soft" color={value === 'Own' ? 'primary' : 'secondary'}>
          {value}
        </Label>
      );
    },
  },
  {
    id: 'transporter',
    label: 'Transport Company',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.transporter?.transportName || '-',
  },
  {
    id: 'noOfTyres',
    label: 'No Of Tyres',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.noOfTyres,
  },
  {
    id: 'tyreLayout',
    label: 'Tyre Layout',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.tyreLayoutId || '-',
    render: (row) => {
      const layoutId = row.tyreLayoutId;
      if (!layoutId) return '-';

      return (
        <Tooltip
          title={
            <Box sx={{ p: 1 }}>
              <MiniTyreLayout layoutId={layoutId} disableTooltip />
            </Box>
          }
          arrow
          placement="top"
        >
          <span
            style={{
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dashed',
            }}
          >
            {layoutId}
          </span>
        </Tooltip>
      );
    },
  },
  {
    id: 'manufacturingYear',
    label: 'Manufacturing Year',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.manufacturingYear || '-',
  },
  {
    id: 'loadingCapacity',
    label: 'Loading Capacity',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.loadingCapacity,
    render: (row) => {
      const value = row.loadingCapacity;
      return (
        <Label variant="soft" color={value >= 20 ? 'success' : 'error'}>
          {value || '-'}
        </Label>
      );
    },
  },
  {
    id: 'fuelTankCapacity',
    label: 'Fuel Tank Capacity',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.fuelTankCapacity || '-',
  },
  {
    id: 'isActive',
    label: 'Status',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => (row.isActive ? 'Active' : 'Inactive'),
    render: (row) => (
      <Label variant="soft" color={row.isActive ? 'success' : 'error'}>
        {row.isActive ? 'Active' : 'Inactive'}
      </Label>
    ),
  },
  {
    id: 'vehicleCompany',
    label: 'Vehicle Company',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.vehicleCompany || '-',
  },
  {
    id: 'modelType',
    label: 'Vehicle Model',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.modelType || '-',
  },
  {
    id: 'chasisNo',
    label: 'Chasis No',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.chasisNo || '-',
  },
  {
    id: 'engineNo',
    label: 'Engine No',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.engineNo || '-',
  },
  {
    id: 'engineType',
    label: 'Engine Type',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.engineType || '-',
  },
];
