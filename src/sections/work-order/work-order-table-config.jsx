import React from 'react';

import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fDateTimeDuration } from 'src/utils/format-time';

import { Label } from 'src/components/label';

import { WorkOrderPartsPopoverCell } from './work-order-parts-popover-cell';
import {
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_STATUS_COLORS,
  WORK_ORDER_PRIORITY_LABELS,
  WORK_ORDER_PRIORITY_COLORS,
} from './work-order-config';

export const TABLE_COLUMNS = [
  {
    id: 'workOrderNo',
    label: 'WO No.',
    defaultVisible: true,
    disabled: true,
    sortable: true,
    getter: (row) => row.workOrderNo,
    render: (row) => {
      const value = row.workOrderNo || '-';
      return (
        <ListItemText
          disableTypography
          primary={
            <Link
              component={RouterLink}
              to={paths.dashboard.workOrder.details(row._id)}
              variant="body2"
              noWrap
              sx={{ color: 'primary.main' }}
            >
              {value}
            </Link>
          }
        />
      );
    },
  },
  {
    id: 'vehicle',
    label: 'Vehicle',
    defaultVisible: true,
    disabled: true,
    sortable: true,
    getter: (row) => row.vehicle?.vehicleNo,
    render: (row) => {
      const value = row.vehicle?.vehicleNo || '';
      return (
        <ListItemText
          disableTypography
          primary={
            <Link
              component={RouterLink}
              to={paths.dashboard.workOrder.details(row._id)}
              variant="body2"
              noWrap
              sx={{ color: 'primary.main' }}
            >
              {value}
            </Link>
          }
        />
      );
    },
  },
  {
    id: 'status',
    label: 'Status',
    tooltip: 'Track lifecycle: Open (created), In Progress (servicing), and Completed (closed & finalized)',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.status,
    render: (row) => {
      const label = WORK_ORDER_STATUS_LABELS[row.status] || row.status || 'Unknown';
      const color = WORK_ORDER_STATUS_COLORS[row.status] || 'default';
      return (
        <Label variant="soft" color={color}>
          {label}
        </Label>
      );
    },
  },
  {
    id: 'priority',
    label: 'Priority',
    tooltip: 'Set urgency: Scheduled (planned), Non Scheduled (routine), and Emergency (immediate)',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.priority,
    render: (row) => {
      const label = WORK_ORDER_PRIORITY_LABELS[row.priority] || row.priority || 'Unknown';
      const color = WORK_ORDER_PRIORITY_COLORS[row.priority] || 'default';
      return (
        <Label variant="soft" color={color}>
          {label}
        </Label>
      );
    },
  },
  {
    id: 'category',
    label: 'Category',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.category,
    render: (row) => {
      const value = row.category;
      if (!value) return '-';
      return (
        <Label variant="soft" color="default">
          {value}
        </Label>
      );
    },
  },
  {
    id: 'timeTaken',
    label: 'Time Taken',
    defaultVisible: true,
    disabled: false,
    sortable: true,
    getter: (row) => {
      if (!row.actualStartDate || !row.completedDate) return '-';
      return fDateTimeDuration(row.actualStartDate, row.completedDate);
    },
    render: (row) => {
      if (!row.actualStartDate || !row.completedDate) return '-';
      return fDateTimeDuration(row.actualStartDate, row.completedDate);
    },
  },
  {
    id: 'parts',
    label: 'Parts',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => {
      if (!row.parts || row.parts.length === 0) return '-';
      return row.parts
        .map((p) => {
          const name = p.partSnapshot?.name ?? p.part?.name ?? 'Unknown Part';
          const qty = p.quantity || 0;
          const unit = p.partSnapshot?.measurementUnit ?? p.part?.measurementUnit ?? '';
          return `${name}(${qty}${unit ? ` ${unit}` : ''})`;
        })
        .join(', ');
    },
    render: (row) => <WorkOrderPartsPopoverCell row={row} />,
  },
  {
    id: 'issues',
    label: 'Issues',
    defaultVisible: false,
    disabled: false,
    getter: (row) => {
      const issues = row.issues || [];
      const values = issues
        .map((issue) => (typeof issue?.issue === 'object' ? issue.issue.value : issue.issue))
        .filter(Boolean);
      return values.join(', ') || '-';
    },
    render: (row) => {
      const issues = row.issues || [];
      const values = issues
        .map((issue) => (typeof issue?.issue === 'object' ? issue.issue.value : issue.issue))
        .filter(Boolean);
      const text = values.join(', ') || '-';
      return (
        <Tooltip title={text}>
          <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
            {text}
          </Typography>
        </Tooltip>
      );
    },
  },
  {
    id: 'issueAssignees',
    label: 'Issue Assignees',
    defaultVisible: true,
    disabled: false,
    getter: (row) => {
      const issues = row.issues || [];
      const names = issues.flatMap((issue) => {
        if (!issue || typeof issue !== 'object' || !Array.isArray(issue.assignedTo)) return [];
        return issue.assignedTo
          .map((user) => {
            if (!user) return null;
            return user.name || user.customerName || null;
          })
          .filter(Boolean);
      });
      const unique = Array.from(new Set(names));
      return unique.join(', ');
    },
  },
  {
    id: 'scheduledStartDate',
    label: 'Scheduled Start',
    defaultVisible: true,
    disabled: false,
    sortable: true,
    getter: (row) => row.scheduledStartDate,
    render: (row) => {
      const value = row.scheduledStartDate;
      if (!value) return '-';
      return (
        <Tooltip title={fDate(value)}>
          <Typography variant="body2" noWrap>
            {fDate(value)}
          </Typography>
        </Tooltip>
      );
    },
  },
  {
    id: 'completedDate',
    label: 'Completed On',
    defaultVisible: true,
    disabled: false,
    sortable: true,
    getter: (row) => row.completedDate,
    render: (row) => {
      const value = row.completedDate;
      if (!value) return '-';
      return (
        <Tooltip title={fDate(value)}>
          <Typography variant="body2" noWrap>
            {fDate(value)}
          </Typography>
        </Tooltip>
      );
    },
  },
  {
    id: 'expenseAdded',
    label: 'Expense Added',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.expenseAdded,
    render: (row) => {
      const value = row.expenseAdded;
      return (
        <Label variant="soft" color={value ? 'success' : 'error'}>
          {value ? 'Yes' : 'No'}
        </Label>
      );
    },
  },
  {
    id: 'totalCost',
    label: 'Total Cost',
    defaultVisible: true,
    disabled: false,
    sortable: true,
    align: 'right',
    getter: (row) => row.totalCost,
    render: (row) => fCurrency(row.totalCost || 0),
  },
  {
    id: 'createdAt',
    label: 'Created Date',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    getter: (row) => fDate(row.createdAt),
    render: (row) => {
      const value = row.createdAt;
      if (!value) return '-';
      return (
        <Tooltip title={fDate(value)}>
          <Typography variant="body2" noWrap>
            {fDate(value)}
          </Typography>
        </Tooltip>
      );
    },
  },
  {
    id: 'actualStartDate',
    label: 'Actual Start Date',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    getter: (row) => fDate(row.actualStartDate),
    render: (row) => {
      const value = row.actualStartDate;
      if (!value) return '-';
      return (
        <Tooltip title={fDate(value)}>
          <Typography variant="body2" noWrap>
            {fDate(value)}
          </Typography>
        </Tooltip>
      );
    },
  },
  {
    id: 'odometerReading',
    label: 'Odometer Reading',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.odometerReading,
  },
  {
    id: 'labourCharge',
    label: 'Labour Cost',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    align: 'right',
    getter: (row) => row.labourCharge,
    render: (row) => fCurrency(row.labourCharge || 0),
  },
  {
    id: 'partsCost',
    label: 'Parts Cost',
    defaultVisible: false,
    disabled: false,
    sortable: true,
    align: 'right',
    getter: (row) => row.partsCost,
    render: (row) => fCurrency(row.partsCost || 0),
  },
  {
    id: 'description',
    label: 'Description',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.description,
  },
  {
    id: 'createdBy',
    label: 'Created By',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.createdBy?.name || '-',
  },
  {
    id: 'closedBy',
    label: 'Closed By',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.closedBy?.name || '-',
  },
];
