import React from 'react';
import dayjs from 'dayjs';

import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate, fToNow } from 'src/utils/format-time';

import { Label } from 'src/components/label';

export const TABLE_COLUMNS = [
  {
    id: 'driverName',
    label: 'Driver',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row.driverName,
    render: ({ _id, driverName }) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Avatar alt={driverName} sx={{ mr: 2 }}>
          {driverName.charAt(0).toUpperCase()}
        </Avatar>
        <ListItemText
          disableTypography
          primary={
            <Link
              component={RouterLink}
              to={paths.dashboard.driver.details(_id)}
              variant="body2"
              noWrap
              sx={{ color: 'primary.main' }}
            >
              {driverName}
            </Link>
          }
        />
      </div>
    ),
  },
  {
    id: 'type',
    label: 'Type',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.type,
    render: ({ type }) =>
      type ? (
        <Label variant="soft" color={type.toLowerCase() === 'own' ? 'primary' : 'secondary'}>
          {type}
        </Label>
      ) : (
        '-'
      ),
  },
  {
    id: 'driverCellNo',
    label: 'Mobile',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.driverCellNo,
  },
  {
    id: 'permanentAddress',
    label: 'Address',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.permanentAddress,
  },
  {
    id: 'experience',
    label: 'Experience',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.experience,
  },
  {
    id: 'licenseTo',
    label: 'License Valid Till',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => (row.licenseTo ? fDate(row.licenseTo) : '-'),
  },
  {
    id: 'aadharNo',
    label: 'Aadhar No',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row.aadharNo,
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.status,
    render: ({ status }) => (
      <Label variant="soft" color={status === 'expired' ? 'error' : 'success'}>
        {status}
      </Label>
    ),
  },
  {
    id: 'isActive',
    label: 'Active',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => (row.isActive === false ? 'Inactive' : 'Active'),
    render: (row) => (
      <Label variant="soft" color={row.isActive === false ? 'error' : 'success'}>
        {row.isActive === false ? 'Inactive' : 'Active'}
      </Label>
    ),
  },
  {
    id: 'iitrition',
    label: 'Duration',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row.firstJobAt,
    render: ({ firstJobAt, lastJobAt }) => {
      if (!firstJobAt || !lastJobAt) return '-';

      const startDate = dayjs(firstJobAt);
      const endDate = dayjs(lastJobAt);
      const monthsDiff = dayjs().diff(endDate, 'month');

      let color = 'success';
      if (monthsDiff > 6) {
        color = 'error';
      } else if (monthsDiff > 3) {
        color = 'warning';
      }

      const text = `${startDate.format('MM-YYYY')} to ${endDate.format('MM-YYYY')}`;

      return (
        <Tooltip title={`Last job was ${fToNow(lastJobAt)} ago`} placement="top">
          <Label variant="soft" color={color}>
            {text}
          </Label>
        </Tooltip>
      );
    },
  },
];
