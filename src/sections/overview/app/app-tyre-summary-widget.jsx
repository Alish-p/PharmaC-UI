import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fShortenNumber } from 'src/utils/format-number';

import { useTyreDashboardSummary } from 'src/query/use-dashboard';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

const DEFAULT_BREAKDOWN = [
  { label: 'In Stock', value: 0 },
  { label: 'Mounted', value: 0 },
  { label: 'Scrapped', value: 0 },
];

export function AppTyreSummaryWidget({ ...other }) {
  const theme = useTheme();
  const { data, isLoading } = useTyreDashboardSummary();

  const statusBreakdown = data?.statusBreakdown || DEFAULT_BREAKDOWN;
  const totalValue = data?.totalValue || 0;
  const avgKm = data?.avgKm || 0;
  const lowThreadAlerts = data?.lowThreadAlerts || 0;

  const chartColors = [
    theme.palette.primary.lighter,
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  const chartSeries = statusBreakdown.map((item) => item.value);

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: statusBreakdown.map((item) => item.label),
    stroke: { width: 0 },
    tooltip: {
      y: {
        formatter: (value) => fShortenNumber(value),
        title: { formatter: (seriesName) => `${seriesName}` },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            value: { formatter: (value) => fShortenNumber(value) },
            total: {
              formatter: (w) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return fShortenNumber(sum);
              },
            },
          },
        },
      },
    },
  });

  if (isLoading || !data) return null;

  const STATS = [
    {
      title: 'Total Value',
      value: `₹${fShortenNumber(totalValue)}`,
      icon: 'mdi:currency-inr',
      color: theme.palette.success.main,
    },
    {
      title: 'Avg KM / Tyre',
      value: fShortenNumber(avgKm),
      icon: 'mdi:speedometer',
      color: theme.palette.info.main,
    },
    {
      title: 'Low Thread Alerts',
      value: lowThreadAlerts,
      icon: 'mdi:alert-circle-outline',
      color: lowThreadAlerts > 0 ? theme.palette.error.main : theme.palette.success.main,
    },
  ];

  return (
    <Card {...other}>
      <CardHeader
        title="Tyre Overview"
        subheader="Fleet tyre status distribution and key metrics"
      />

      <Chart
        type="donut"
        series={chartSeries}
        options={chartOptions}
        width={{ xs: 240, xl: 260 }}
        height={{ xs: 240, xl: 260 }}
        sx={{ my: 3, mx: 'auto' }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <ChartLegends
        labels={chartOptions?.labels}
        colors={chartOptions?.colors}
        sx={{ p: 2, justifyContent: 'center' }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="space-around"
        sx={{ px: 2, py: 2.5, gap: 2 }}
      >
        {STATS.map((stat) => (
          <Stack
            key={stat.title}
            spacing={0.5}
            alignItems="center"
            sx={{
              minWidth: 100,
              p: 1.5,
              borderRadius: 1.5,
              textAlign: 'center',
              transition: (t) =>
                t.transitions.create(['background-color', 'transform'], {
                  duration: t.transitions.duration.shorter,
                }),
              '&:hover': {
                bgcolor: alpha(stat.color, 0.08),
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
                bgcolor: alpha(stat.color, 0.12),
              }}
            >
              <Iconify icon={stat.icon} width={20} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {stat.title}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {stat.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
