import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { useRouteAnalytics } from 'src/query/use-trip';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useTable, TableNoData, TableSkeleton, TablePaginationCustom } from 'src/components/table';

import { useVehicleTypes } from 'src/sections/vehicle/vehicle-config';

// ─── Deviation Label ──────────────────────────────────────────────────────────
function DeviationLabel({ value, invertColor = false, avgValue, currentValue, formatParams = {} }) {
  if (value === 0 || value == null) {
    return (
      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11 }}>
        Avg Match
      </Typography>
    );
  }

  const isPositive = value > 0;
  // For expense & diesel: positive deviation is bad (red); for profit & income: positive is good (green)
  let color;
  if (invertColor) {
    color = isPositive ? 'error.main' : 'success.main';
  } else {
    color = isPositive ? 'success.main' : 'error.main';
  }

  const sign = isPositive ? '+' : '';

  let tooltipText = null;
  if (avgValue != null && currentValue != null) {
    const diff = currentValue - avgValue;
    const absDiff = Math.abs(diff);
    const diffText = diff > 0 ? 'more' : 'lower';

    const isCurrency = formatParams?.type === 'currency';
    const unit = formatParams?.unit || '';
    const prefix = isCurrency ? '₹' : '';

    const formattedAvg = `${prefix}${fNumber(avgValue)}${unit ? ` ${unit}` : ''}`;
    const formattedCur = `${prefix}${fNumber(currentValue)}${unit ? ` ${unit}` : ''}`;
    const formattedDiff = `${prefix}${fNumber(absDiff)}${unit ? ` ${unit}` : ''}`;

    tooltipText = (
      <Stack spacing={0.5} sx={{ p: 0.5, typography: 'caption' }}>
        <Box>
          Average is <strong>{formattedAvg}</strong>
        </Box>
        <Box>
          This Trip value is <strong>{formattedCur}</strong>
        </Box>
        <Box sx={{ mt: 0.5 }}>
          <strong>{formattedDiff}</strong> {diffText} than Average
        </Box>
      </Stack>
    );
  }

  return (
    <Tooltip title={tooltipText || ''} placement="top" arrow>
      <Box sx={{ cursor: tooltipText ? 'help' : 'inherit', display: 'inline-flex' }}>
        <Typography variant="caption" sx={{ color, fontSize: 11, fontWeight: 600 }}>
          {sign}
          {value}%
        </Typography>
      </Box>
    </Tooltip>
  );
}

// ─── Expandable Route Row ────────────────────────────────────────────────────
function RouteRow({ route, index }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Main Route Summary Row */}
      <TableRow
        hover
        sx={{
          '& > *': { borderBottom: open ? 'none' : undefined },
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onClick={() => setOpen(!open)}
      >
        {/* Expand arrow */}
        <TableCell sx={{ width: 48, px: 1 }}>
          <IconButton size="small">
            <Iconify
              icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
              width={18}
            />
          </IconButton>
        </TableCell>

        {/* # */}
        <TableCell sx={{ width: 52 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {index + 1}
          </Typography>
        </TableCell>

        {/* Route */}
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 200 }}>
            <Iconify
              icon="mdi:map-marker-path"
              width={20}
              sx={{ color: 'primary.main', flexShrink: 0 }}
            />
            <Tooltip title={route.routeSignature} placement="top" arrow>
              <Typography variant="subtitle2" noWrap sx={{ maxWidth: 400 }}>
                {route.routeSignature}
              </Typography>
            </Tooltip>
          </Stack>
        </TableCell>

        {/* Trip Count */}
        <TableCell align="center">
          <Chip
            label={route.tripCount}
            size="small"
            color="info"
            variant="soft"
            sx={{ fontWeight: 700, minWidth: 40 }}
          />
        </TableCell>

        {/* Avg Income */}
        <TableCell align="right">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ₹{fNumber(route.avgIncome)}
          </Typography>
        </TableCell>

        {/* Avg Expense */}
        <TableCell align="right">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ₹{fNumber(route.avgExpense)}
          </Typography>
        </TableCell>

        {/* Avg Profit */}
        <TableCell align="right">
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: route.avgProfit >= 0 ? 'success.main' : 'error.main',
            }}
          >
            ₹{fNumber(route.avgProfit)}
          </Typography>
        </TableCell>

        {/* Avg Diesel */}
        <TableCell align="right">
          <Typography variant="body2">{fNumber(route.avgDieselLtr)} Ltr</Typography>
        </TableCell>

        {/* Avg KM */}
        <TableCell align="right">
          <Typography variant="body2">{fNumber(route.avgKm)} km</Typography>
        </TableCell>
      </TableRow>

      {/* Expanded Trip Details */}
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, px: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                Individual Trips ({route.trips.length})
              </Typography>
              <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.8 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ verticalAlign: 'bottom' }}>Trip No</TableCell>
                    <TableCell sx={{ verticalAlign: 'bottom' }}>Vehicle</TableCell>
                    <TableCell sx={{ verticalAlign: 'bottom' }}>Driver</TableCell>
                    <TableCell sx={{ verticalAlign: 'bottom' }}>Date</TableCell>
                    <TableCell align="center" sx={{ verticalAlign: 'bottom' }}>
                      Jobs
                    </TableCell>
                    <TableCell align="right" sx={{ verticalAlign: 'bottom' }}>
                      <Stack alignItems="flex-end">
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 'normal', lineHeight: 1.2 }}
                        >
                          Avg: ₹{fNumber(route.avgIncome)}
                        </Typography>
                        Income
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ verticalAlign: 'bottom' }}>
                      <Stack alignItems="flex-end">
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 'normal', lineHeight: 1.2 }}
                        >
                          Avg: ₹{fNumber(route.avgExpense)}
                        </Typography>
                        Expense
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ verticalAlign: 'bottom' }}>
                      <Stack alignItems="flex-end">
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 'normal', lineHeight: 1.2 }}
                        >
                          Avg: ₹{fNumber(route.avgProfit)}
                        </Typography>
                        Profit
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ verticalAlign: 'bottom' }}>
                      <Stack alignItems="flex-end">
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 'normal', lineHeight: 1.2 }}
                        >
                          Avg: {fNumber(route.avgDieselLtr)} Ltr
                        </Typography>
                        Diesel
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ verticalAlign: 'bottom' }}>
                      <Stack alignItems="flex-end">
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 'normal', lineHeight: 1.2 }}
                        >
                          Avg: {fNumber(route.avgKm)} km
                        </Typography>
                        KM
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {route.trips.map((trip) => {
                    const hasHighDeviation =
                      Math.abs(trip.deviations?.income || 0) > 50 ||
                      Math.abs(trip.deviations?.expense || 0) > 50 ||
                      Math.abs(trip.deviations?.profit || 0) > 50 ||
                      Math.abs(trip.deviations?.diesel || 0) > 50 ||
                      Math.abs(trip.deviations?.km || 0) > 50;

                    return (
                      <TableRow key={trip._id} hover>
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ minWidth: 60 }}
                          >
                            {hasHighDeviation && (
                              <Tooltip
                                title="High deviation in one or more metrics (>50%)"
                                placement="top"
                              >
                                <Box
                                  component="span"
                                  sx={{ display: 'flex', color: 'warning.main' }}
                                >
                                  <Iconify icon="eva:alert-triangle-fill" width={18} />
                                </Box>
                              </Tooltip>
                            )}
                            <Link
                              component={RouterLink}
                              to={paths.dashboard.trip.details(trip._id)}
                              variant="body2"
                              sx={{ color: 'primary.main', fontWeight: 600 }}
                            >
                              {trip.tripNo}
                            </Link>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{trip.vehicleNo || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{trip.driverName || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {trip.fromDate ? fDate(new Date(trip.fromDate)) : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{trip.subtripCount || 0}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack alignItems="flex-end">
                            <Typography variant="body2">₹{fNumber(trip.totalIncome)}</Typography>
                            <DeviationLabel
                              value={trip.deviations?.income}
                              avgValue={route.avgIncome}
                              currentValue={trip.totalIncome}
                              formatParams={{ type: 'currency' }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack alignItems="flex-end">
                            <Typography variant="body2">₹{fNumber(trip.totalExpense)}</Typography>
                            <DeviationLabel
                              value={trip.deviations?.expense}
                              invertColor
                              avgValue={route.avgExpense}
                              currentValue={trip.totalExpense}
                              formatParams={{ type: 'currency' }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack alignItems="flex-end">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: trip.profitAndLoss >= 0 ? 'success.main' : 'error.main',
                              }}
                            >
                              ₹{fNumber(trip.profitAndLoss)}
                            </Typography>
                            <DeviationLabel
                              value={trip.deviations?.profit}
                              avgValue={route.avgProfit}
                              currentValue={trip.profitAndLoss}
                              formatParams={{ type: 'currency' }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack alignItems="flex-end">
                            <Typography variant="body2">
                              {fNumber(trip.totalDieselLtr)} Ltr
                            </Typography>
                            <DeviationLabel
                              value={trip.deviations?.diesel}
                              invertColor
                              avgValue={route.avgDieselLtr}
                              currentValue={trip.totalDieselLtr}
                              formatParams={{ unit: 'Ltr' }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack alignItems="flex-end">
                            <Typography variant="body2">{fNumber(trip.totalKm)} km</Typography>
                            <DeviationLabel
                              value={trip.deviations?.km}
                              avgValue={route.avgKm}
                              currentValue={trip.totalKm}
                              formatParams={{ unit: 'km' }}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ─── Main View ───────────────────────────────────────────────────────────────
export function RouteAnalyzerView() {
  const table = useTable({ defaultRowsPerPage: 10, syncToUrl: true });
  const vehicleTypes = useVehicleTypes();
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');

  const handleFilterVehicleType = useCallback(
    (event, newValue) => {
      setVehicleTypeFilter(newValue);
      table.onResetPage();
    },
    [table]
  );

  const { data, isLoading } = useRouteAnalytics({
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    ...(vehicleTypeFilter && { vehicleType: vehicleTypeFilter }),
  });

  const routes = data?.routes || [];
  const totalCount = data?.total || 0;
  const notFound = !routes.length && !isLoading;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Route Analyzer"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Trip', href: paths.dashboard.trip.root },
          { name: 'Route Analyzer' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Stats summary */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ p: 2.5, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon="solar:route-bold-duotone" width={28} sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="h4">{totalCount}</Typography>
              <Typography variant="body2" color="text.secondary">
                Unique Routes
              </Typography>
            </Box>
          </Stack>
        </Card>
        <Card sx={{ p: 2.5, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon="solar:chart-2-bold-duotone" width={28} sx={{ color: 'info.main' }} />
            <Box>
              <Typography variant="h4">
                {routes.length ? routes.reduce((sum, r) => sum + r.tripCount, 0) : '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trips This Page
              </Typography>
            </Box>
          </Stack>
        </Card>
        <Card sx={{ p: 2.5, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon="solar:star-bold-duotone" width={28} sx={{ color: 'warning.main' }} />
            <Box>
              <Typography variant="h4">{routes.length ? routes[0]?.tripCount : '—'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Most Frequent Route
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Stack>

      {/* Route Table */}
      <Card>
        <Tabs
          value={vehicleTypeFilter}
          onChange={handleFilterVehicleType}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          <Tab key="all" value="" label="All Types" />
          {vehicleTypes.map((tab) => (
            <Tab key={tab.key} value={tab.key} label={tab.value} />
          ))}
        </Tabs>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 48 }} />
                  <TableCell sx={{ width: 52 }}>#</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell align="center">Trips</TableCell>
                  <TableCell align="right">Avg Income</TableCell>
                  <TableCell align="right">Avg Expense</TableCell>
                  <TableCell align="right">Avg Profit</TableCell>
                  <TableCell align="right">Avg Diesel</TableCell>
                  <TableCell align="right">Avg KM</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: table.rowsPerPage }).map((_, idx) => (
                      <TableSkeleton key={idx} sx={{ height: 56 }} />
                    ))
                  : routes.map((route, idx) => (
                      <RouteRow
                        key={route.routeSignature}
                        route={route}
                        index={table.page * table.rowsPerPage + idx}
                      />
                    ))}

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={totalCount}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </DashboardContent>
  );
}
