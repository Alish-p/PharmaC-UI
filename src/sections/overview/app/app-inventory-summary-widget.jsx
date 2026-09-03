import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fShortenNumber } from 'src/utils/format-number';

import { useInventoryDashboardSummary } from 'src/query/use-dashboard';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function AppInventorySummaryWidget({ ...other }) {
  const theme = useTheme();
  const { data, isLoading } = useInventoryDashboardSummary();

  const chartColors = [
    theme.palette.primary.light,
    theme.palette.primary.lighter,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  const inStock = data?.inStockItems || 0;
  const lowStock = data?.lowStockItems || 0;
  const outOfStock = data?.outOfStockItems || 0;
  const totalParts = data?.totalParts || 0;
  const openPurchaseOrders = data?.openPurchaseOrders || 0;
  const inventoryValue = data?.totalInventoryValue || 0;

  const statusBreakdown = [
    { label: 'In Stock', value: inStock },
    { label: 'Low Stock', value: lowStock },
    { label: 'Out of Stock', value: outOfStock },
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
              formatter: () => fShortenNumber(totalParts),
            },
          },
        },
      },
    },
  });

  if (isLoading || !data) return null;

  const STATS = [
    {
      title: 'Open PO',
      value: openPurchaseOrders,
      icon: 'mdi:file-document-outline',
      color: theme.palette.info.main,
    },
    {
      title: 'Inventory Value',
      value: `₹${fShortenNumber(inventoryValue)}`,
      icon: 'mdi:wallet-bifold',
      color: theme.palette.success.main,
    },
  ];

  return (
    <Card {...other}>
      <CardHeader
        title="Parts & Inventory overview"
        subheader="Stock distribution and related documentation"
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
              minWidth: 90,
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
