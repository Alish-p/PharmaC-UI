import React from 'react';

import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { wrapText } from 'src/utils/change-case';

export const TABLE_COLUMNS = [
  {
    id: 'name',
    label: 'Location Name',
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
                to={paths.dashboard.partLocation.details(row._id)}
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
            {wrapText(value, 40)}
          </Typography>
        </Tooltip>
      );
    },
  },
];
