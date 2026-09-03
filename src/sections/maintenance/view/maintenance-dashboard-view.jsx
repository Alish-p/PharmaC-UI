import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fCurrency, fShortenNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMaintenanceDashboard } from 'src/query/use-dashboard';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { LoadingScreen } from 'src/components/loading-screen';

import { DashboardTotalWidget } from 'src/sections/overview/app/app-total-widget';

// ---- Reusable Widgets ----

function DonutWidget({ title, subheader, labels, data, colors }) {
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
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} />
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Chart
          type="donut"
          series={data}
          options={chartOptions}
          width={{ xs: 220, xl: 240 }}
          height={{ xs: 220, xl: 240 }}
        />
      </Box>
    </Card>
  );
}

function BarWidget({
  title,
  subheader,
  categories,
  series,
  colors,
  height = 320,
  stacked = false,
  yAxisFormatter,
}) {
  const chartOptions = useChart({
    colors,
    chart: { stacked },
    xaxis: { categories },
    yaxis: yAxisFormatter ? { labels: { formatter: yAxisFormatter } } : undefined,
    tooltip: yAxisFormatter ? { y: { formatter: yAxisFormatter } } : undefined,
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
      },
    },
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} />
      <Box sx={{ p: 3, pb: 1 }}>
        <Chart dir="ltr" type="bar" series={series} options={chartOptions} height={height} />
      </Box>
    </Card>
  );
}

function HorizontalBarWidget({
  title,
  subheader,
  categories,
  series,
  colors,
  height = 320,
  yAxisFormatter,
  tooltipYFormatter,
  action,
}) {
  const chartOptions = useChart({
    colors,
    xaxis: {
      categories,
      ...(yAxisFormatter && { labels: { formatter: yAxisFormatter } }),
    },
    tooltip: {
      y: {
        formatter: tooltipYFormatter || yAxisFormatter || undefined,
      },
    },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '60%' } },
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} action={action} />
      <Box sx={{ p: 3, pb: 1 }}>
        <Chart dir="ltr" type="bar" series={series} options={chartOptions} height={height} />
      </Box>
    </Card>
  );
}

function LineWidget({ title, subheader, categories, series, colors, height = 320 }) {
  const chartOptions = useChart({
    colors,
    xaxis: { categories },
    stroke: { width: 3, curve: 'smooth' },
    plotOptions: {},
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} />
      <Box sx={{ p: 3, pb: 1 }}>
        <Chart dir="ltr" type="line" series={series} options={chartOptions} height={height} />
      </Box>
    </Card>
  );
}

function StatCard({ title, value, icon, color, subtext }) {
  const theme = useTheme();

  return (
    <Stack
      spacing={1}
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: alpha(theme.palette[color].main, 0.08),
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: `${color}.main`,
          bgcolor: alpha(theme.palette[color].main, 0.12),
        }}
      >
        <Iconify icon={icon} width={24} />
      </Box>
      <Typography variant="h5">{value}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {subtext && (
        <Typography variant="caption" color="text.disabled">
          {subtext}
        </Typography>
      )}
    </Stack>
  );
}

const PO_STATUS_COLOR = {
  'pending-approval': 'warning',
  approved: 'info',
  purchased: 'primary',
  'partial-received': 'secondary',
  received: 'success',
  rejected: 'error',
};

const WO_STATUS_COLOR = {
  open: 'error',
  inprogress: 'warning',
  completed: 'success',
};

// ---- Main View ----

export default function MaintenanceDashboardView() {
  const theme = useTheme();
  const [months, setMonths] = useState(6);
  const [slowMovingDays, setSlowMovingDays] = useState(90);
  const { data, isLoading } = useMaintenanceDashboard({ months, slowMovingDays });

  if (isLoading || !data) return <LoadingScreen />;

  const { parts, locations, purchaseOrders, workOrders, vendors, recentActivity, analytics } = data;

  // PO donut
  const poLabels = ['Pending', 'Approved', 'Purchased', 'Partial', 'Received', 'Rejected'];
  const poData = [
    purchaseOrders.statusBreakdown.pendingApproval,
    purchaseOrders.statusBreakdown.approved,
    purchaseOrders.statusBreakdown.purchased,
    purchaseOrders.statusBreakdown.partialReceived,
    purchaseOrders.statusBreakdown.received,
    purchaseOrders.statusBreakdown.rejected,
  ];
  const poColors = [
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
  ];

  // WO donut
  const woLabels = ['Open', 'In Progress', 'Completed'];
  const woData = [
    workOrders.statusBreakdown.open,
    workOrders.statusBreakdown.inprogress,
    workOrders.statusBreakdown.completed,
  ];
  const woColors = [
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
  ];

  // WO monthly trend bar chart
  const woMonthLabels = workOrders.monthlyTrend.map((m) => m.month);
  const woMonthSeries = [
    { name: 'Labour Cost', data: workOrders.monthlyTrend.map((m) => m.labourCost) },
    { name: 'Parts Cost', data: workOrders.monthlyTrend.map((m) => m.partsCost) },
  ];

  // WO category bar chart
  const woCatLabels = workOrders.categoryBreakdown.map((c) => c.category);
  const woCatSeries = [{ name: 'Count', data: workOrders.categoryBreakdown.map((c) => c.count) }];

  // Part category bar chart
  const partCatLabels = parts.categoryBreakdown.map((c) => c.category);
  const partCatSeries = [{ name: 'Parts', data: parts.categoryBreakdown.map((c) => c.count) }];

  return (
    <DashboardContent>
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h4">Maintenance & Inventory Dashboard</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* ---- TOP STAT CARDS ---- */}
        <Grid xs={6} sm={4} md={2}>
          <DashboardTotalWidget
            title="Total Parts"
            total={parts.totalParts}
            color="primary"
            icon={<Iconify icon="mdi:cog-box" width={36} />}
          />
        </Grid>
        <Grid xs={6} sm={4} md={2}>
          <DashboardTotalWidget
            title="Locations"
            total={locations.totalLocations}
            color="secondary"
            icon={<Iconify icon="mdi:map-marker-multiple" width={36} />}
          />
        </Grid>
        <Grid xs={6} sm={4} md={2}>
          <DashboardTotalWidget
            title="Purchase Orders"
            total={purchaseOrders.total}
            color="warning"
            icon={<Iconify icon="mdi:clipboard-list" width={36} />}
          />
        </Grid>
        <Grid xs={6} sm={4} md={2}>
          <DashboardTotalWidget
            title="Work Orders"
            total={workOrders.total}
            color="error"
            icon={<Iconify icon="mdi:wrench" width={36} />}
          />
        </Grid>
        <Grid xs={6} sm={4} md={2}>
          <DashboardTotalWidget
            title="Vendors"
            total={vendors.totalVendors}
            color="success"
            icon={<Iconify icon="mdi:store" width={36} />}
          />
        </Grid>

        {/* ---- INVENTORY HEALTH ---- */}
        <Grid xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Inventory Health" subheader="Stock status overview" />
            <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
            <Stack spacing={2} sx={{ p: 3 }}>
              <StatCard
                title="Inventory Value"
                value={fCurrency(parts.totalInventoryValue)}
                icon="mdi:currency-inr"
                color="success"
              />
              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <StatCard
                    title="Low Stock"
                    value={parts.lowStockParts}
                    icon="mdi:alert-circle-outline"
                    color="warning"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <StatCard
                    title="Out of Stock"
                    value={parts.outOfStockParts}
                    icon="mdi:close-circle-outline"
                    color="error"
                  />
                </Box>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* PO Status Donut */}
        <Grid xs={12} md={6} lg={4}>
          <DonutWidget
            title="Purchase Orders"
            subheader={`Total spend: ${fCurrency(purchaseOrders.totalSpend)}`}
            labels={poLabels}
            data={poData}
            colors={poColors}
          />
        </Grid>

        {/* WO Status Donut */}
        <Grid xs={12} md={6} lg={4}>
          <DonutWidget
            title="Work Orders"
            subheader={`Maintenance cost: ${fCurrency(workOrders.totalMaintenanceCost)}`}
            labels={woLabels}
            data={woData}
            colors={woColors}
          />
        </Grid>

        {/* ---- PARTS CATEGORY ---- */}
        <Grid xs={12} md={6}>
          <BarWidget
            title="Parts by Category"
            subheader="Top categories in inventory"
            categories={partCatLabels}
            series={partCatSeries}
            colors={[theme.palette.primary.main]}
          />
        </Grid>

        {/* ---- WO MONTHLY TREND ---- */}
        <Grid xs={12} md={6}>
          <BarWidget
            title="Maintenance Cost Trend"
            subheader="Monthly breakdown — Last 6 months"
            categories={woMonthLabels}
            series={woMonthSeries}
            colors={[theme.palette.warning.main, theme.palette.primary.main]}
            stacked
            yAxisFormatter={(value) => fShortenNumber(value)}
          />
        </Grid>

        {/* ---- WO BY CATEGORY ---- */}
        <Grid xs={12} md={6}>
          <BarWidget
            title="Work Orders by Category"
            subheader="Service type distribution"
            categories={woCatLabels}
            series={woCatSeries}
            colors={[theme.palette.error.main]}
            yAxisFormatter={(value) => Math.round(value)}
          />
        </Grid>

        {/* ---- TOP VENDORS ---- */}
        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Top Vendors" subheader="By total spend" />
            <TableContainer sx={{ p: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Vendor</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Total Spend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseOrders.topVendors.map((v, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              color: 'primary.main',
                            }}
                          >
                            <Iconify icon="mdi:store-outline" width={16} />
                          </Box>
                          <Link
                            component={RouterLink}
                            to={paths.dashboard.vendor.details(v.vendorId)}
                            variant="body2"
                            noWrap
                            underline="hover"
                            sx={{ color: 'primary.main' }}
                          >
                            {v.vendor}
                          </Link>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{v.orders}</TableCell>
                      <TableCell align="right">{fCurrency(v.spend)}</TableCell>
                    </TableRow>
                  ))}
                  {purchaseOrders.topVendors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No vendors yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* ---- RECENT ACTIVITY ---- */}
        <Grid xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Inventory Movement" subheader="Last 30 days" />
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {recentActivity.map((activity) => (
                  <Stack key={activity.type} direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.info.main, 0.08),
                        color: 'info.main',
                      }}
                    >
                      <Iconify
                        icon={
                          activity.type.includes('PURCHASE')
                            ? 'mdi:package-variant-closed'
                            : activity.type.includes('WORK_ORDER')
                              ? 'mdi:wrench'
                              : activity.type.includes('TRANSFER')
                                ? 'mdi:swap-horizontal'
                                : 'mdi:history'
                        }
                        width={22}
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2">
                        {activity.type.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.count} transactions · {fShortenNumber(activity.totalQtyChange)}{' '}
                        units
                      </Typography>
                    </Box>
                  </Stack>
                ))}
                {recentActivity.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}
                  >
                    No inventory activity in the last 30 days
                  </Typography>
                )}
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* ---- RECENT PURCHASE ORDERS ---- */}
        <Grid xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Purchase Orders" />
            <TableContainer sx={{ p: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>PO#</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseOrders.recentOrders.map((po) => (
                    <TableRow key={po._id}>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.purchaseOrder.details(po._id)}
                          variant="subtitle2"
                          sx={{ color: 'primary.main' }}
                        >
                          {po.purchaseOrderNo}
                        </Link>
                      </TableCell>
                      <TableCell>{po.vendor}</TableCell>
                      <TableCell>
                        <Chip
                          label={po.status}
                          size="small"
                          color={PO_STATUS_COLOR[po.status] || 'default'}
                          variant="soft"
                        />
                      </TableCell>
                      <TableCell align="right">{fCurrency(po.total)}</TableCell>
                      <TableCell>{fDate(po.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* ---- RECENT WORK ORDERS ---- */}
        <Grid xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Work Orders" />
            <TableContainer sx={{ p: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>WO#</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workOrders.recentOrders.map((wo) => (
                    <TableRow key={wo._id}>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.workOrder.details(wo._id)}
                          variant="subtitle2"
                          sx={{ color: 'primary.main' }}
                        >
                          {wo.workOrderNo}
                        </Link>
                      </TableCell>
                      <TableCell>{wo.vehicle}</TableCell>
                      <TableCell>{wo.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={wo.status}
                          size="small"
                          color={WO_STATUS_COLOR[wo.status] || 'default'}
                          variant="soft"
                        />
                      </TableCell>
                      <TableCell align="right">{fCurrency(wo.totalCost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* ════════════════════════════════════════════════════════════════════
          ANALYTICS & INSIGHTS SECTION
          ════════════════════════════════════════════════════════════════════ */}
      {analytics && (
        <>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 6, mb: 3 }}
          >
            <Typography variant="h4">Analytics &amp; Insights</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                size="small"
                type="number"
                label="Idle Days"
                value={slowMovingDays}
                onChange={(e) => setSlowMovingDays(Number(e.target.value) || 90)}
                sx={{ width: 120 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:calendar-clock" width={18} />
                    </InputAdornment>
                  ),
                }}
              />
              <Select
                size="small"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value={3}>Last 3 Months</MenuItem>
                <MenuItem value={6}>Last 6 Months</MenuItem>
                <MenuItem value={12}>Last 12 Months</MenuItem>
              </Select>
            </Stack>
          </Stack>

          <Grid container spacing={3}>
            {/* ---- Resolution Time Stats ---- */}
            <Grid xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Work Order Resolution Time"
                  subheader={`Based on ${analytics.resolutionTime.completedCount} completed WOs`}
                />
                <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
                <Stack direction="row" spacing={2} sx={{ p: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <StatCard
                      title="Avg Resolution"
                      value={`${analytics.resolutionTime.avgHours}h`}
                      icon="mdi:timer-sand"
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <StatCard
                      title="Fastest"
                      value={`${analytics.resolutionTime.minHours}h`}
                      icon="mdi:flash"
                      color="success"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <StatCard
                      title="Slowest"
                      value={`${analytics.resolutionTime.maxHours}h`}
                      icon="mdi:clock-alert-outline"
                      color="error"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <StatCard
                      title="Completed"
                      value={analytics.resolutionTime.completedCount}
                      icon="mdi:check-circle-outline"
                      color="info"
                    />
                  </Box>
                </Stack>
              </Card>
            </Grid>

            {/* ---- Priority Distribution Donut ---- */}
            <Grid xs={12} md={4}>
              <DonutWidget
                title="WO Priority Split"
                subheader={`Last ${months} months`}
                labels={Object.keys(analytics.priorityDistribution).map((k) =>
                  k.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                )}
                data={Object.values(analytics.priorityDistribution)}
                colors={[
                  theme.palette.info.main,
                  theme.palette.warning.main,
                  theme.palette.error.main,
                ]}
              />
            </Grid>

            {/* ---- Top Parts Used ---- */}
            <Grid xs={12} md={6}>
              {(() => {
                const unitByName = Object.fromEntries(
                  analytics.topPartsUsed.map((p) => [p.partName, p.measurementUnit])
                );
                return (
                  <HorizontalBarWidget
                    title="Top Parts Used"
                    subheader="Most frequently consumed parts"
                    action={
                      <Tooltip title="Fluids and small generic items are not considered as used and part failures">
                        <IconButton color="default">
                          <Iconify icon="eva:info-outline" />
                        </IconButton>
                      </Tooltip>
                    }
                    categories={analytics.topPartsUsed.map((p) => p.partName)}
                    series={[
                      {
                        name: 'Qty Used',
                        data: analytics.topPartsUsed.map((p) => p.totalQuantity),
                      },
                    ]}
                    colors={[theme.palette.primary.main]}
                    tooltipYFormatter={(value, { dataPointIndex, w }) => {
                      const name = w?.globals?.labels?.[dataPointIndex];
                      const unit = name ? unitByName[name] : '';
                      return unit ? `${value} ${unit}` : `${value}`;
                    }}
                  />
                );
              })()}
            </Grid>

            {/* ---- Top Parts by Cost ---- */}
            <Grid xs={12} md={6}>
              <HorizontalBarWidget
                title="Top Parts by Cost"
                subheader="Highest maintenance cost contributors"
                categories={analytics.topPartsByCost.map((p) => p.partName)}
                series={[{ name: 'Cost', data: analytics.topPartsByCost.map((p) => p.totalCost) }]}
                colors={[theme.palette.error.main]}
                yAxisFormatter={(v) => fCurrency(v)}
              />
            </Grid>

            {/* ---- Vehicles with Most WOs ---- */}
            <Grid xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Vehicles — Highest Work Orders"
                  subheader="Fleet maintenance hotspots"
                />
                <TableContainer sx={{ p: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Vehicle</TableCell>
                        <TableCell align="right">Work Orders</TableCell>
                        <TableCell align="right">Total Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.vehiclesWithMostWOs.map((v, i) => (
                        <TableRow key={v.vehicleId} hover sx={{ cursor: 'pointer' }}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>
                            <Link
                              component={RouterLink}
                              to={paths.dashboard.vehicle.details(v.vehicleId)}
                              variant="subtitle2"
                              sx={{ color: 'primary.main' }}
                            >
                              {v.vehicleNo}
                            </Link>
                          </TableCell>
                          <TableCell align="right">
                            <Link
                              component={RouterLink}
                              to={`${paths.dashboard.workOrder.root}?vehicleId=${v.vehicleId}`}
                              sx={{ textDecoration: 'none' }}
                            >
                              <Chip
                                label={v.workOrderCount}
                                size="small"
                                color="error"
                                variant="soft"
                                sx={{ cursor: 'pointer' }}
                              />
                            </Link>
                          </TableCell>
                          <TableCell align="right">{fCurrency(v.totalCost)}</TableCell>
                        </TableRow>
                      ))}
                      {analytics.vehiclesWithMostWOs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="text.secondary">
                              No data
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* ---- Vehicles Consuming Most Parts ---- */}
            <Grid xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Vehicles — Parts Usage Intensity"
                  subheader="Highest parts consumption"
                />
                <TableContainer sx={{ p: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Vehicle</TableCell>
                        <TableCell align="right">Unique Parts</TableCell>
                        <TableCell align="right">Parts Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.vehiclesConsumingMostParts.map((v, i) => (
                        <TableRow key={v.vehicleId} hover sx={{ cursor: 'pointer' }}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>
                            <Link
                              component={RouterLink}
                              to={paths.dashboard.vehicle.details(v.vehicleId)}
                              variant="subtitle2"
                              sx={{ color: 'primary.main' }}
                            >
                              {v.vehicleNo}
                            </Link>
                          </TableCell>
                          <TableCell align="right">{v.uniqueParts}</TableCell>
                          <TableCell align="right">{fCurrency(v.totalPartsCost)}</TableCell>
                        </TableRow>
                      ))}
                      {analytics.vehiclesConsumingMostParts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="text.secondary">
                              No data
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* ---- Parts Consumption Trend ---- */}
            <Grid xs={12} md={6}>
              <LineWidget
                title="Parts Consumption Trend"
                subheader="Monthly parts issued via Work Orders"
                categories={analytics.partsConsumptionTrend.map((t) => t.month)}
                series={[
                  {
                    name: 'Qty Issued',
                    data: analytics.partsConsumptionTrend.map((t) => t.totalQty),
                  },
                  {
                    name: 'Transactions',
                    data: analytics.partsConsumptionTrend.map((t) => t.transactionCount),
                  },
                ]}
                colors={[theme.palette.primary.main, theme.palette.info.main]}
              />
            </Grid>

            {/* ---- Completion Rate ---- */}
            <Grid xs={12} md={6}>
              <BarWidget
                title="WO Completion Rate"
                subheader="Monthly opened vs completed"
                categories={analytics.completionRate.map((m) => m.month)}
                series={[
                  { name: 'Opened', data: analytics.completionRate.map((m) => m.opened) },
                  { name: 'Completed', data: analytics.completionRate.map((m) => m.completed) },
                ]}
                colors={[theme.palette.warning.main, theme.palette.success.main]}
              />
            </Grid>

            {/* ---- Repeat Failures ---- */}
            <Grid xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Repeat Part Failures"
                  subheader="Same part replaced on same vehicle 2+ times"
                  avatar={
                    <Iconify icon="mdi:alert-decagram" width={28} sx={{ color: 'error.main' }} />
                  }
                  action={
                    <Tooltip title="Fluids and small generic items are not considered as used and part failures">
                      <IconButton color="default">
                        <Iconify icon="eva:info-outline" />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <TableContainer sx={{ p: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Part</TableCell>
                        <TableCell align="right">Occurrences</TableCell>
                        <TableCell align="right">Total Qty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.repeatFailures.map((r, i) => (
                        <TableRow key={i} hover>
                          <TableCell>
                            <Link
                              component={RouterLink}
                              to={paths.dashboard.vehicle.details(r.vehicleId)}
                              variant="subtitle2"
                              sx={{ color: 'primary.main' }}
                            >
                              {r.vehicleNo}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{r.partName}</Typography>
                            <Typography variant="caption" color="text.disabled">
                              {r.partNumber}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={r.occurrences} size="small" color="error" variant="soft" />
                          </TableCell>
                          <TableCell align="right">{r.totalQty}</TableCell>
                        </TableRow>
                      ))}
                      {analytics.repeatFailures.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                              No repeat failures detected
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* ---- Slow-Moving / Dead Inventory ---- */}
            <Grid xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Slow-Moving Inventory"
                  subheader={`Parts idle for ${slowMovingDays}+ days — capital tied up`}
                  avatar={
                    <Iconify
                      icon="mdi:package-variant-closed-remove"
                      width={28}
                      sx={{ color: 'warning.main' }}
                    />
                  }
                />
                <TableContainer sx={{ p: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Part</TableCell>
                        <TableCell align="right">In Stock</TableCell>
                        <TableCell align="right">Capital Tied</TableCell>
                        <TableCell align="right">Days Idle</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.slowMovingParts.map((p) => (
                        <TableRow key={p.partId} hover sx={{ cursor: 'pointer' }}>
                          <TableCell>
                            <Link
                              component={RouterLink}
                              to={paths.dashboard.part.details(p.partId)}
                              variant="subtitle2"
                              sx={{ color: 'primary.main' }}
                            >
                              {p.partName}
                            </Link>
                            <Typography variant="caption" display="block" color="text.disabled">
                              {p.partNumber}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{p.totalQuantity}</TableCell>
                          <TableCell align="right">{fCurrency(p.capitalTiedUp)}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={
                                p.daysSinceLastIssue >= 9999
                                  ? 'Never used'
                                  : `${p.daysSinceLastIssue}d`
                              }
                              size="small"
                              color={
                                p.daysSinceLastIssue >= 9999
                                  ? 'error'
                                  : p.daysSinceLastIssue >= 180
                                    ? 'warning'
                                    : 'default'
                              }
                              variant="soft"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {analytics.slowMovingParts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                              No slow-moving inventory found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </DashboardContent>
  );
}
