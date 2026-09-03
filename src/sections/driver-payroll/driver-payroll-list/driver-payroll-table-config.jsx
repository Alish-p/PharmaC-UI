import React from 'react';

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate, fTime, fDateRangeShortLabel } from 'src/utils/format-time';

import { Label } from 'src/components/label';

export const TABLE_COLUMNS = [
  {
    id: 'paymentId',
    label: '#',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row.paymentId,
    render: ({ _id, paymentId }) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ListItemText
          disableTypography
          primary={
            <Link
              component={RouterLink}
              href={paths.dashboard.driverSalary.details(_id)}
              variant="body2"
              noWrap
              sx={{ color: 'primary.main' }}
            >
              {paymentId}
            </Link>
          }
        />
      </div>
    ),
  },
  {
    id: 'driver',
    label: 'Driver',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.driverId?.driverName,
    render: ({ driverId }) => (
      <ListItemText
        disableTypography
        primary={
          <Link
            component={RouterLink}
            href={paths.dashboard.driver.details(driverId?._id)}
            variant="body2"
            noWrap
            sx={{ color: 'primary.main', cursor: 'pointer' }}
          >
            {driverId?.driverName}
          </Link>
        }
        secondary={
          <Typography noWrap variant="body2" sx={{ color: 'text.disabled', display: 'block' }}>
            {driverId?.driverCellNo}
          </Typography>
        }
      />
    ),
  },
  {
    id: 'issueDate',
    label: 'Issue Date',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.issueDate,
    render: ({ issueDate }) => (
      <ListItemText
        primary={fDate(new Date(issueDate))}
        secondary={fTime(new Date(issueDate))}
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
    id: 'amount',
    label: 'Amount',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.summary?.netIncome,
    render: ({ summary }) => (
      <ListItemText
        primary={summary?.netIncome}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
      />
    ),
  },
  {
    id: 'billingPeriod',
    label: 'Billing Period',
    defaultVisible: true,
    disabled: false,
    getter: ({ billingPeriod }) => fDateRangeShortLabel(billingPeriod?.start, billingPeriod?.end),
    render: ({ billingPeriod }) => (
      <ListItemText
        primary={fDateRangeShortLabel(billingPeriod?.start, billingPeriod?.end)}
        primaryTypographyProps={{
          typography: 'body2',
          noWrap: true,
        }}
      />
    ),
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.status,
    render: ({ status }) => (
      <Label
        variant="soft"
        color={
          status === 'paid'
            ? 'success'
            : status === 'generated'
              ? 'info'
              : status === 'cancelled'
                ? 'error'
                : 'default'
        }
      >
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : '-'}
      </Label>
    ),
  },
  {
    id: 'bankName',
    label: 'Bank Name',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.driverId?.bankDetails?.name,
    render: ({ driverId }) => {
      const bankDetails = driverId?.bankDetails;
      if (!bankDetails || !bankDetails.name) return '-';
      return (
        <Typography variant="body2" sx={{ color: 'text.primary', noWrap: true }}>
          {bankDetails.name}
        </Typography>
      );
    },
  },
  {
    id: 'bankAccNo',
    label: 'Account Number',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.driverId?.bankDetails?.accNo,
    render: ({ driverId }) => {
      const bankDetails = driverId?.bankDetails;
      if (!bankDetails || !bankDetails.accNo) return '-';
      return (
        <Typography variant="body2" sx={{ color: 'text.primary', noWrap: true }}>
          {bankDetails.accNo}
        </Typography>
      );
    },
  },
  {
    id: 'bankIfsc',
    label: 'IFSC Code',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.driverId?.bankDetails?.ifsc,
    render: ({ driverId }) => {
      const bankDetails = driverId?.bankDetails;
      if (!bankDetails || !bankDetails.ifsc) return '-';
      return (
        <Typography variant="body2" sx={{ color: 'text.primary', noWrap: true }}>
          {bankDetails.ifsc}
        </Typography>
      );
    },
  },
];
