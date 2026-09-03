import React from 'react';

import Link from '@mui/material/Link';
import { Avatar } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate, fTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { ACTIVITY_TYPES } from '../part-constant';

const getDateValue = (activity) => activity.activityDate || activity.date || activity.createdAt;

const getQtyChange = (activity) =>
  activity.quantityChange ?? activity.delta ?? activity.change ?? activity.quantityDelta;

const getQtyAfter = (activity) =>
  activity.quantityAfter ?? activity.newQuantity ?? activity.currentQuantity;

function QuantityChangeVisual({ activity }) {
  const qtyChange = getQtyChange(activity);
  const qtyAfter = getQtyAfter(activity);

  const previousQty =
    typeof qtyChange === 'number' && typeof qtyAfter === 'number' ? qtyAfter - qtyChange : null;

  if (typeof previousQty !== 'number' || typeof qtyAfter !== 'number') {
    return '-';
  }

  const isIncrease = qtyChange > 0;
  const color = isIncrease ? 'success' : qtyChange < 0 ? 'error' : 'grey';

  return (
    <Stack spacing={0.5} alignItems="flex-end">
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textDecoration: 'line-through',
            opacity: 0.7,
          }}
        >
          {previousQty}
        </Typography>
        <Iconify icon="mdi:arrow-right" width={14} sx={{ color: 'text.disabled' }} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontSize: '0.9375rem',
          }}
        >
          {qtyAfter}
        </Typography>
      </Stack>
      <Typography
        variant="caption"
        sx={{
          color: `${color}.main`,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
        }}
      >
        <Iconify
          icon={isIncrease ? 'mdi:triangle-small-up' : 'mdi:triangle-small-down'}
          width={16}
        />
        {isIncrease ? '+' : ''}
        {qtyChange}
      </Typography>
    </Stack>
  );
}

export const INVENTORY_ACTIVITY_TABLE_COLUMNS = [
  {
    id: 'activityDate',
    label: 'Date',
    defaultVisible: true,
    disabled: false,
    getter: (row) => {
      const value = getDateValue(row);
      return value ? fDate(new Date(value)) : '';
    },
    render: (row) => {
      const value = getDateValue(row);
      if (!value) return '-';
      const date = new Date(value);
      return (
        <ListItemText
          primary={fDate(date)}
          secondary={fTime(date)}
          primaryTypographyProps={{
            typography: 'body2',
            noWrap: true,
          }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      );
    },
  },
  {
    id: 'locationName',
    label: 'Part Location',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.inventoryLocation?.name || row.locationName || '',
  },
  {
    id: 'type',
    label: 'Adjustment Type',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.type || '',
    render: (row) => {
      const { type, sourceDocumentType, sourceDocumentId, sourceDocumentNumber } = row;

      const activityType = ACTIVITY_TYPES.find((t) => t.value === type);
      const color = activityType ? activityType.color : 'default';

      let docLink = null;
      if (sourceDocumentType === 'PURCHASE_ORDER' && sourceDocumentId && sourceDocumentNumber) {
        docLink = (
          <Link
            component={RouterLink}
            href={paths.dashboard.purchaseOrder.details(sourceDocumentId)}
            sx={{
              typography: 'caption',
              fontWeight: 'fontWeightMedium',
              display: 'block',
              mt: 0.5,
            }}
          >
            {sourceDocumentNumber}
          </Link>
        );
      } else if (sourceDocumentType === 'WORK_ORDER' && sourceDocumentId && sourceDocumentNumber) {
        docLink = (
          <Link
            component={RouterLink}
            href={paths.dashboard.workOrder.details(sourceDocumentId)}
            sx={{
              typography: 'caption',
              fontWeight: 'fontWeightMedium',
              display: 'block',
              mt: 0.5,
            }}
          >
            {sourceDocumentNumber}
          </Link>
        );
      }

      return (
        <Stack spacing={0} alignItems="flex-start">
          <Label variant="soft" color={color}>
            {activityType ? activityType.label : type || '-'}
          </Label>
          {docLink}
        </Stack>
      );
    },
  },
  {
    id: 'reason',
    label: 'Adjustment Reason',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.reason || '',
  },
  {
    id: 'qtyChange',
    label: 'Qty',
    defaultVisible: true,
    disabled: false,
    align: 'right',
    getter: (row) => getQtyChange(row),
    render: (row) => <QuantityChangeVisual activity={row} />,
    showTotal: true,
  },
  {
    id: 'averageUnitCost',
    label: 'Avg Unit Cost',
    defaultVisible: true,
    disabled: false,
    align: 'right',
    getter: (row) => row.averageUnitCost,
    render: (row) =>
      row.averageUnitCost != null ? `₹ ${Number(row.averageUnitCost).toFixed(2)}` : '-',
  },
  {
    id: 'totalCost',
    label: 'Total Cost',
    defaultVisible: true,
    disabled: false,
    align: 'right',
    getter: (row) => row.totalCost,
    render: (row) => (row.totalCost != null ? `₹ ${Number(row.totalCost).toFixed(2)}` : '-'),
    showTotal: true,
  },
  {
    id: 'performedBy',
    label: 'Performed By',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.performedBy?.name || '',
    render: (row) => {
      const performer = row.performedBy;
      if (!performer) {
        return '-';
      }
      return (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar alt={performer.name} src={performer.avatarUrl} sx={{ width: 32, height: 32 }} />
          <Typography variant="body2">{performer.name}</Typography>
        </Stack>
      );
    },
  },
];
