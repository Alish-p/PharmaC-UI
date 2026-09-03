import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrency, fShortenNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { useTyreDetailedDashboardSummary } from 'src/query/use-dashboard';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { LoadingScreen } from 'src/components/loading-screen';

import { DashboardTotalWidget } from 'src/sections/overview/app/app-total-widget';

// --- WIDGETS ---

function TyreDonutChart({ title, subheader, data, labels, colors }) {
  const chartOptions = useChart({
    colors,
    labels,
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

  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Chart
          type="donut"
          series={data}
          options={chartOptions}
          width={{ xs: 240, xl: 260 }}
          height={{ xs: 240, xl: 260 }}
        />
      </Box>
    </Card>
  );
}

function TyreBarChart({ title, subheader, categories, series, colors }) {
  const chartOptions = useChart({
    colors,
    xaxis: {
      categories,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '40%',
      },
    },
    stacked: true,
  });

  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />
      <Box sx={{ p: 3, pb: 1 }}>
        <Chart dir="ltr" type="bar" series={series} options={chartOptions} height={320} />
      </Box>
    </Card>
  );
}

function TyreMetricsGrid({ topStats }) {
  const theme = useTheme();

  const STATS = [
    {
      title: 'Total Value',
      value: fCurrency(topStats.totalValue),
      icon: 'mdi:currency-inr',
      color: theme.palette.success.main,
    },
    {
      title: 'Avg KM/Tyre',
      value: fShortenNumber(topStats.avgKmPerTyre),
      icon: 'mdi:speedometer',
      color: theme.palette.info.main,
    },
    {
      title: 'Remolded Configs',
      value: fShortenNumber(topStats.remoldedCount),
      icon: 'mdi:recycle',
      color: theme.palette.warning.main,
    },
    {
      title: 'Low Thread Alerts',
      value: topStats.lowThreadAlerts,
      icon: 'mdi:alert',
      color: topStats.lowThreadAlerts > 0 ? theme.palette.error.main : theme.palette.success.main,
    },
  ];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader title="Key Metrics" />
      <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="space-around"
        sx={{ px: 2, py: 2, gap: 2, flexGrow: 1, alignItems: 'center' }}
      >
        {STATS.map((stat) => (
          <Stack
            key={stat.title}
            spacing={1}
            alignItems="center"
            sx={{
              minWidth: 120,
              p: 2,
              borderRadius: 2,
              textAlign: 'center',
              bgcolor: alpha(stat.color, 0.08),
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
                bgcolor: alpha(stat.color, 0.12),
              }}
            >
              <Iconify icon={stat.icon} width={24} />
            </Box>
            <Typography variant="subtitle2" color="text.secondary">
              {stat.title}
            </Typography>
            <Typography variant="h6">{stat.value}</Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

// --- MAIN VIEW ---

export default function TyreDashboardView() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading } = useTyreDetailedDashboardSummary();

  if (isLoading || !data) {
    return <LoadingScreen />;
  }

  const {
    typeSummary,
    brandSummary,
    sizeSummary,
    attachmentSummary,
    agingSummary,
    threadHealthSummary,
    topStats,
    recentActivity,
    liveKmSummary,
  } = data;

  // Formatting for Donut Charts
  const typeData = typeSummary.map((t) => t.count);
  const typeLabels = typeSummary.map((t) => t.type);

  const threadLabels = ['Healthy', 'Warning', 'Critical', 'Unknown'];
  const threadData = [
    threadHealthSummary.healthy || 0,
    threadHealthSummary.warning || 0,
    threadHealthSummary.critical || 0,
    threadHealthSummary.unknown || 0,
  ];
  const threadColors = [
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.text.disabled,
  ];

  // Formating for Bar Charts
  const brandCategories = brandSummary.map((b) => b.brand).slice(0, 7);
  const brandSeries = [
    { name: 'Mounted', data: brandSummary.map((b) => b.mounted).slice(0, 7) },
    { name: 'In Stock', data: brandSummary.map((b) => b.inStock).slice(0, 7) },
    { name: 'Scrapped', data: brandSummary.map((b) => b.scrapped).slice(0, 7) },
  ];

  const sizeCategories = sizeSummary.map((s) => s.size).slice(0, 7);
  const sizeSeries = [
    { name: 'Mounted', data: sizeSummary.map((s) => s.mounted).slice(0, 7) },
    { name: 'In Stock', data: sizeSummary.map((s) => s.inStock).slice(0, 7) },
    { name: 'Scrapped', data: sizeSummary.map((s) => s.scrapped).slice(0, 7) },
  ];

  const ageCategories = ['< 6 Months', '6-12 Months', '1-2 Years', '> 2 Years'];
  const ageSeries = [
    {
      name: 'Tyres',
      data: [
        agingSummary.lt6Months,
        agingSummary.lt1Year,
        agingSummary.lt2Years,
        agingSummary.gt2Years,
      ],
    },
  ];

  return (
    <DashboardContent>
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h4">Tyre Dashboard</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Top Stat Cards */}
        <Grid xs={6} sm={3}>
          <DashboardTotalWidget
            title="Total Tyres"
            total={attachmentSummary.total}
            color="primary"
            icon={<Iconify icon="mingcute:tyre-line" width={36} />}
            onTotalClick={() => router.push(paths.dashboard.tyre.root)}
          />
        </Grid>

        <Grid xs={6} sm={3}>
          <DashboardTotalWidget
            title="Newly Attached"
            total={attachmentSummary.newlyAttached}
            color="success"
            icon={<Iconify icon="mdi:truck-check-outline" width={36} />}
            onTotalClick={() =>
              router.push(`${paths.dashboard.tyre.root}?attachmentStatus=newlyAttached`)
            }
          />
        </Grid>

        <Grid xs={6} sm={3}>
          <DashboardTotalWidget
            title="Re-attached"
            total={attachmentSummary.oldAttached}
            color="warning"
            icon={<Iconify icon="mdi:refresh" width={36} />}
            onTotalClick={() =>
              router.push(`${paths.dashboard.tyre.root}?attachmentStatus=oldAttached`)
            }
          />
        </Grid>

        <Grid xs={6} sm={3}>
          <DashboardTotalWidget
            title="Never Attached"
            total={attachmentSummary.neverAttached}
            color="info"
            icon={<Iconify icon="mdi:box-variant-closed" width={36} />}
            onTotalClick={() =>
              router.push(`${paths.dashboard.tyre.root}?attachmentStatus=neverAttached`)
            }
          />
        </Grid>

        {/* Brand and Size breakdown */}
        <Grid xs={12} md={6}>
          <TyreBarChart
            title="Brand-wise Summary"
            subheader="Top brands by active count"
            categories={brandCategories}
            series={brandSeries}
            colors={[theme.palette.primary.main, theme.palette.info.main, theme.palette.error.main]}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TyreBarChart
            title="Size-wise Summary"
            subheader="Top tyre sizes in fleet"
            categories={sizeCategories}
            series={sizeSeries}
            colors={[theme.palette.primary.main, theme.palette.info.main, theme.palette.error.main]}
          />
        </Grid>

        {/* Distributions */}
        <Grid xs={12} md={4}>
          <TyreDonutChart
            title="Thread Health"
            subheader="Based on remaining thread / original thread"
            labels={threadLabels}
            data={threadData}
            colors={threadColors}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <TyreDonutChart
            title="Type Distribution"
            subheader="Composition of fleet by tyre type"
            labels={typeLabels}
            data={typeData}
            colors={[
              theme.palette.primary.lighter,
              theme.palette.primary.light,
              theme.palette.primary.main,
              theme.palette.primary.dark,
            ]}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <TyreDonutChart
            title="Live KM Update Status"
            subheader="Freshness of odometer readings"
            labels={['< 3 Days', '3-10 Days', '> 10 Days', 'Unknown']}
            data={[
              liveKmSummary?.fresh || 0,
              liveKmSummary?.warning || 0,
              liveKmSummary?.stale || 0,
              liveKmSummary?.unknown || 0,
            ]}
            colors={[
              theme.palette.success.main,
              theme.palette.warning.main,
              theme.palette.error.main,
              theme.palette.text.disabled,
            ]}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader title="Recent Activity" subheader="Last 30 Days" />
            <Box sx={{ p: 3, flexGrow: 1 }}>
              <Stack spacing={3}>
                {recentActivity.map((activity) => (
                  <Stack key={activity.action} direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                      }}
                    >
                      <Iconify
                        icon={
                          activity.action === 'MOUNT'
                            ? 'mdi:arrow-up-circle'
                            : activity.action === 'UNMOUNT'
                              ? 'mdi:arrow-down-circle'
                              : activity.action === 'SCRAP'
                                ? 'mdi:trash-can'
                                : 'mdi:history'
                        }
                        width={24}
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2">{activity.action}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.count} events recorded
                      </Typography>
                    </Box>
                  </Stack>
                ))}
                {recentActivity.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', pt: 4 }}
                  >
                    No recent activity
                  </Typography>
                )}
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Additional Bar Chart and Metrics */}
        <Grid xs={12} md={6}>
          <TyreBarChart
            title="Aging Summary"
            subheader="Tyre age since purchase"
            categories={ageCategories}
            series={ageSeries}
            colors={[theme.palette.info.main]}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TyreMetricsGrid topStats={topStats} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
