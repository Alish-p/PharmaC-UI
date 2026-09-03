import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency, fShortenNumber } from 'src/utils/format-number';

import { useVehicleAnalytics } from 'src/query/use-vehicle';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

const CATEGORIES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// ----------------------------------------------------------------------

export function VehicleMonthlyAnalyticsWidget({ vehicleId, ...other }) {
  const theme = useTheme();

  const currentYear = dayjs().year();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) =>
    String(y)
  );

  const { data: analyticsData, isLoading } = useVehicleAnalytics(vehicleId, selectedYear);

  const { jobsData, incomeData, jobExpenseData, vehicleExpenseData, profitData, totals } =
    useMemo(() => {
      const empty12 = Array(12).fill(0);
      if (!analyticsData) {
        return {
          jobsData: empty12,
          incomeData: empty12,
          jobExpenseData: empty12,
          vehicleExpenseData: empty12,
          profitData: empty12,
          totals: { jobs: 0, income: 0, expense: 0, profit: 0 },
        };
      }
      return analyticsData;
    }, [analyticsData]);

  // Chart
  const chartColors = [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const series = [
    { name: 'Income', data: incomeData },
    { name: 'Job Expense', data: jobExpenseData },
    { name: 'Vehicle Expense', data: vehicleExpenseData },
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { categories: CATEGORIES },
    yaxis: {
      labels: {
        formatter: (value) => fShortenNumber(value),
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ dataPointIndex }) =>
        renderAnalyticsTooltip({
          dataPointIndex,
          categories: CATEGORIES,
          jobsData,
          incomeData,
          jobExpenseData,
          vehicleExpenseData,
          profitData,
          theme,
        }),
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 4,
      },
    },
    legend: { show: false },
  });

  // Build year-scoped date range for audit links
  const yearFromDate = dayjs(`${selectedYear}-01-01`).startOf('year').toISOString();
  const yearToDate = dayjs(`${selectedYear}-12-31`).endOf('year').toISOString();

  const jobsLink = `${paths.dashboard.subtrip.list}?vehicleNo=${vehicleId}&fromDate=${yearFromDate}&toDate=${yearToDate}`;
  const expenseLink = `${paths.dashboard.expense.list}?vehicleId=${vehicleId}&startDate=${yearFromDate}&endDate=${yearToDate}`;

  // Summary cards data
  const summaryItems = [
    { label: 'Jobs', value: totals.jobs, color: 'primary.main', isCurrency: false, link: jobsLink },
    { label: 'Income', value: totals.income, color: 'primary.main', isCurrency: true, link: null },
    {
      label: 'Expense',
      value: totals.expense,
      color: 'error.main',
      isCurrency: true,
      link: expenseLink,
    },
    {
      label: 'Profit',
      value: totals.profit,
      color: totals.profit >= 0 ? 'success.main' : 'error.main',
      isCurrency: true,
      link: null,
    },
  ];

  return (
    <Card {...other}>
      <CardHeader
        title="Monthly Analytics"
        subheader="Yearly performance"
        sx={{ mb: 1 }}
        action={
          <ChartSelect
            options={years}
            value={String(selectedYear)}
            onChange={(newValue) => setSelectedYear(Number(newValue))}
          />
        }
      />

      {/* Summary Strip */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          px: 3,
          mt: 1,
        }}
      >
        {summaryItems.map((item) => (
          <Stack
            key={item.label}
            spacing={0.5}
            sx={{
              p: 1.5,
              bgcolor: 'background.neutral',
              borderRadius: 1.5,
            }}
          >
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              {item.label}
            </Typography>
            {isLoading ? (
              <Skeleton variant="text" width={80} />
            ) : item.link ? (
              <Link
                component={RouterLink}
                to={item.link}
                underline="hover"
                sx={{
                  color: item.color,
                  typography: 'subtitle1',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                {item.isCurrency ? fCurrency(item.value) : item.value}
              </Link>
            ) : (
              <Typography variant="subtitle1" sx={{ color: item.color }}>
                {item.isCurrency ? fCurrency(item.value) : item.value}
              </Typography>
            )}
          </Stack>
        ))}
      </Box>

      {isLoading ? (
        <Box sx={{ px: 3, py: 5, display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rectangular" width="100%" height={280} sx={{ borderRadius: 2 }} />
        </Box>
      ) : (
        <>
          <ChartLegends
            colors={chartColors}
            labels={series.map((s) => s.name)}
            values={series.map((s) => fShortenNumber(s.data.reduce((a, b) => a + b, 0)))}
            sx={{ px: 3, gap: 3, pt: 2 }}
          />

          <Chart
            key={selectedYear}
            type="bar"
            series={series}
            options={chartOptions}
            height={280}
            sx={{ py: 2, pl: 1, pr: 2.5 }}
          />
        </>
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

function renderAnalyticsTooltip({
  dataPointIndex,
  categories,
  jobsData,
  incomeData,
  jobExpenseData,
  vehicleExpenseData,
  profitData,
  theme,
}) {
  if (dataPointIndex == null || dataPointIndex < 0) return '';

  const surfaceColor = theme.palette.background.paper;
  const borderColor = theme.vars?.palette?.divider || theme.palette.divider;
  const titleColor = theme.palette.text.secondary;
  const textColor = theme.palette.text.primary;
  const successColor = theme.palette.success.main;
  const errorColor = theme.palette.error.main;

  const profit = profitData[dataPointIndex];
  const profitColor = profit >= 0 ? successColor : errorColor;

  const formatCurrency = (v) => `₹ ${fShortenNumber(v || 0)}`;

  const buildRow = (label, value, valueColor = textColor) => `
    <div style="display:flex;justify-content:space-between;gap:16px;font-size:12px;line-height:1.8;">
      <span style="color:${titleColor};">${label}</span>
      <span style="color:${valueColor};font-weight:600;text-align:right;">${value}</span>
    </div>
  `;

  return `
    <div style="min-width:220px;padding:12px 14px;background:${surfaceColor};border:1px solid ${borderColor};border-radius:12px;color:${textColor};">
      <div style="font-size:13px;font-weight:700;color:${textColor};margin-bottom:8px;">
        ${categories[dataPointIndex]}
      </div>
      ${buildRow('Jobs', jobsData[dataPointIndex])}
      ${buildRow('Income', formatCurrency(incomeData[dataPointIndex]))}
      ${buildRow('Job Expense', formatCurrency(jobExpenseData[dataPointIndex]))}
      ${buildRow('Vehicle Expense', formatCurrency(vehicleExpenseData[dataPointIndex]))}
      <div style="border-top:1px solid ${borderColor};margin:6px 0;"></div>
      ${buildRow('Profit', formatCurrency(profit), profitColor)}
    </div>
  `;
}
