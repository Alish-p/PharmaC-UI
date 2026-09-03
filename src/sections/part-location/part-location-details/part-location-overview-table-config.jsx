import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';

function StockLevelIndicator({ quantity, threshold, unit }) {
  const theme = useTheme();

  const percentage = threshold > 0 ? Math.min((quantity / threshold) * 100, 100) : 100;
  const isLow = quantity < threshold && quantity > 0;
  const isOut = quantity === 0;

  let color = theme.palette.success.main;
  if (isOut) color = theme.palette.error.main;
  else if (isLow) color = theme.palette.warning.main;

  return (
    <Tooltip title={`${quantity} ${unit} / Threshold: ${threshold} ${unit}`} arrow placement="top">
      <Box sx={{ width: '100%', maxWidth: 140 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {quantity}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {unit}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 6,
            borderRadius: 1,
            bgcolor: alpha(color, 0.16),
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
              bgcolor: color,
            },
          }}
        />
      </Box>
    </Tooltip>
  );
}

export const PART_LOCATION_OVERVIEW_TABLE_COLUMNS = [
  {
    id: 'name',
    label: 'Part Name',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row.name,
    render: (row) => (
      <Link
        component={RouterLink}
        to={paths.dashboard.part.details(row._id)}
        variant="subtitle2"
        noWrap
        sx={{ color: 'primary.main', display: 'block' }}
      >
        {row.name}
      </Link>
    ),
  },
  {
    id: 'partNumber',
    label: 'Part #',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.partNumber,
    render: (row) => <Typography variant="body2">{row.partNumber}</Typography>,
  },

  {
    id: 'manufacturer',
    label: 'Manufacturer',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.manufacturer,
    render: (row) => <Typography variant="body2">{row.manufacturer || '-'}</Typography>,
  },
  {
    id: 'category',
    label: 'Category',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.category,
    render: (row) =>
      row.category ? (
        <Chip size="small" label={row.category} variant="soft" sx={{ borderRadius: 1 }} />
      ) : (
        '-'
      ),
  },
  {
    id: 'quantity',
    label: 'Stock Level',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.totalQuantity,
    render: (row) => (
      <StockLevelIndicator
        quantity={row.totalQuantity}
        threshold={row.threshold}
        unit={row.measurementUnit || 'units'}
      />
    ),
  },
  {
    id: 'unitCost',
    label: 'Unit Cost',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.unitCost,
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        ₹{row.unitCost?.toLocaleString() || 0}
      </Typography>
    ),
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => {
      const isLowStock = row.totalQuantity < row.threshold;
      const isOutOfStock = row.totalQuantity === 0;
      return isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock';
    },
    render: (row) => {
      const isLowStock = row.totalQuantity < row.threshold;
      const isOutOfStock = row.totalQuantity === 0;
      return (
        <Label variant="soft" color={isOutOfStock ? 'error' : isLowStock ? 'warning' : 'success'}>
          {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
        </Label>
      );
    },
  },
];
