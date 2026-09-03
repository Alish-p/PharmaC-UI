/* eslint-disable react-hooks/exhaustive-deps */
import dayjs from 'dayjs';
import { useTheme } from '@emotion/react';
import { useMemo, useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { Box, Divider, CardHeader } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { fShortenNumber } from 'src/utils/format-number';

import { useMonthlyExpenseSummary } from 'src/query/use-dashboard';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

import { useSubtripExpenseTypes } from '../../expense/expense-config';

// ----------------------------------------------------------------------

export function AppSubtripExpensesCategory({ title, subheader, ...other }) {
  const theme = useTheme();
  const subtripExpenseTypes = useSubtripExpenseTypes();

  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [showAll, setShowAll] = useState(false);

  const monthParam = useMemo(() => selectedMonth?.format('YYYY-MM'), [selectedMonth]);

  const { data: summary = [] } = useMonthlyExpenseSummary(monthParam);

  const mapped = useMemo(
    () =>
      summary.map((item) => {
        const cfg = subtripExpenseTypes.find((t) => t.label === item.expenseType);
        return {
          label: cfg?.label || item.expenseType,
          value: item.totalAmount,
          icon: cfg?.icon,
        };
      }),
    [summary]
  );

  const chartColorsAll = mapped.map(
    (_, idx) =>
      [
        theme.palette.secondary.dark,
        theme.palette.error.main,
        theme.palette.primary.main,
        theme.palette.warning.main,
        theme.palette.info.dark,
        theme.palette.info.main,
        theme.palette.success.main,
        theme.palette.warning.dark,
      ][idx % 8]
  );

  const [activeIndexes, setActiveIndexes] = useState([]);

  useEffect(() => {
    setActiveIndexes(mapped.map((_, idx) => idx));
  }, [mapped]);

  const filtered = mapped.filter((_, idx) => activeIndexes.includes(idx));
  const chartColors = chartColorsAll.filter((_, idx) => activeIndexes.includes(idx));
  const chartSeries = filtered.map((item) => item.value);

  const chartOptions = useChart({
    chart: { offsetY: 12 },
    colors: chartColors,
    labels: filtered.map((item) => item.label),
    stroke: { width: 1, colors: [theme.palette.background.paper] },
    fill: { opacity: 0.88 },
    tooltip: { y: { formatter: (value) => fShortenNumber(value) } },

    plotOptions: { pie: { donut: { labels: { show: false } } } },
  });

  const icons = mapped.map((item) => <Iconify icon={item.icon} />);

  const displayCount = showAll ? mapped.length : 6;

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <DatePicker
            label="Select month"
            views={['year', 'month']}
            openTo="month"
            value={selectedMonth}
            onChange={(value) => value && setSelectedMonth(value)}
            disableFuture
            slotProps={{
              textField: {
                sx: { minWidth: 140 },
              },
            }}
          />
        }
      />

      <Box
        sx={{
          pt: 4,
          pb: 3,
          rowGap: 3,
          columnGap: 5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Chart
          type="polarArea"
          series={chartSeries}
          options={chartOptions}
          width={{ xs: 240, md: 280 }}
          height={{ xs: 240, md: 280 }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ChartLegends
            colors={chartColorsAll.slice(0, displayCount)}
            labels={mapped.map((item) => item.label).slice(0, displayCount)}
            icons={icons.slice(0, displayCount)}
            sublabels={mapped.map((item) => fShortenNumber(item.value)).slice(0, displayCount)}
            activeIndexes={activeIndexes}
            onToggle={(idx) =>
              setActiveIndexes((prev) =>
                prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
              )
            }
            sx={{ gap: 2.5, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}
          />

          {mapped.length > 6 && (
            <Button
              size="small"
              color="inherit"
              onClick={() => setShowAll((prev) => !prev)}
              sx={{ alignSelf: 'flex-start' }}
            >
              {showAll ? '- View Less' : '+ View More'}
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box
        display="grid"
        gridTemplateColumns="repeat(2, 1fr)"
        sx={{ textAlign: 'center', typography: 'h4' }}
      >
        <Box sx={{ py: 2, borderRight: `dashed 1px ${theme.vars.palette.divider}` }}>
          <Box sx={{ mb: 1, typography: 'body2', color: 'text.secondary' }}>Categories</Box>
          {mapped.length}
        </Box>

        <Box sx={{ py: 2 }}>
          <Box sx={{ mb: 1, typography: 'body2', color: 'text.secondary' }}>Amount</Box>
          {fShortenNumber(mapped.reduce((sum, i) => sum + i.value, 0))}
        </Box>
      </Box>
    </Card>
  );
}
