import React from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { wrapText } from 'src/utils/change-case';

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

export const TABLE_COLUMNS = [
  {
    id: 'name',
    label: 'Part Name',
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
              <Tooltip title={value} placement="top" arrow>
                <Link
                  component={RouterLink}
                  to={paths.dashboard.part.details(row._id)}
                  variant="body2"
                  noWrap
                  sx={{ color: 'primary.main' }}
                >
                  {wrapText(value, 40)}
                </Link>
              </Tooltip>
            }
          />
        </div>
      );
    },
  },
  {
    id: 'partNumber',
    label: 'Part Number',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.partNumber,
  },
  {
    id: 'category',
    label: 'Category',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.category,
  },
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    defaultVisible: true,
    disabled: false,
    getter: (row) => row.manufacturer,
  },
  {
    id: 'quantity',
    label: 'Stock Level',
    defaultVisible: true,
    sortable: true,
    disabled: false,
    getter: (row) => row.totalQuantity,
    render: (row) => (
      <StockLevelIndicator
        quantity={row.totalQuantity || 0}
        threshold={row.threshold || 0}
        unit={row.measurementUnit || 'units'}
      />
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
  {
    id: 'measurementUnit',
    label: 'Unit',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.measurementUnit,
  },
  {
    id: 'unitCost',
    label: 'Unit Cost',
    defaultVisible: true,
    sortable: true,
    disabled: false,
    getter: (row) => row.unitCost,
    render: (row) => `₹ ${row.unitCost?.toFixed(2)}`,
  },
  {
    id: 'totalCost',
    label: 'Total Cost',
    defaultVisible: true,
    sortable: true,
    disabled: false,
    getter: (row) => {
      const cost = row.averageUnitCost || row.unitCost || 0;
      return (row.totalQuantity || 0) * cost;
    },
    render: (row) => {
      const cost = row.averageUnitCost || row.unitCost || 0;
      const total = (row.totalQuantity || 0) * cost;
      return `₹ ${total.toFixed(2)}`;
    },
  },
  {
    id: 'description',
    label: 'Description',
    defaultVisible: false,
    disabled: false,
    getter: (row) => row.description,
    render: (row) => {
      const value = row.description || '';
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
