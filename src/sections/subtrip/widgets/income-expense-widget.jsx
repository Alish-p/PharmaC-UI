// @mui
import { useTheme } from '@mui/material/styles';
import { Card, Chip, Stack, Typography } from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

// components
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function IncomeWidgetSummary({
  title,
  total,
  icon,
  color = 'primary',
  chart,
  description,
  badge,
  badgeColor = 'default',
  sx,
  ...other
}) {
  const theme = useTheme();

  const { series, options } = chart;

  const chartOptions = useChart({
    colors: [theme.palette[color].main],
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    xaxis: {
      labels: { show: false },
    },
    yaxis: {
      labels: { show: false },
    },
    stroke: {
      width: 4,
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
    },
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (value) => fCurrency(value),
        title: {
          formatter: () => '',
        },
      },
    },
    fill: {
      gradient: {
        opacityFrom: 0.56,
        opacityTo: 0.56,
      },
    },
    ...options,
  });

  return (
    <Card
      sx={{
        width: 1,
        boxShadow: 0,
        color: theme.palette[color].darker,
        bgcolor: theme.palette[color].lighter,
        ...sx,
      }}
      {...other}
    >
      <Iconify
        icon={icon}
        sx={{
          p: 1.5,
          top: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          position: 'absolute',
          color: theme.palette[color].lighter,
          bgcolor: theme.palette[color].dark,
        }}
      />

      <Stack spacing={1} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2">{title}</Typography>
          {badge && (
            <Chip
              label={badge}
              size="small"
              color={badgeColor}
              sx={{ fontSize: 10, height: 18, fontWeight: 600 }}
            />
          )}
        </Stack>

        <Typography variant="h3">
          {typeof total === 'number' ? fCurrency(total) : total || 0}
        </Typography>

        {description && (
          <Typography variant="caption" sx={{ opacity: 0.72, fontStyle: 'italic' }}>
            {description}
          </Typography>
        )}
      </Stack>

      <Chart type="area" series={[{ data: series }]} options={chartOptions} height={120} />
    </Card>
  );
}
