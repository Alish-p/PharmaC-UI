import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fShortenNumber } from 'src/utils/format-number';

import { useFinancialMonthlyData } from 'src/query/use-dashboard';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart, ChartSelect } from 'src/components/chart';

const ALL_MONTHS = [
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

// Only show months up to and including the current month to avoid future zero-value dips
const CURRENT_MONTH_INDEX = new Date().getMonth(); // 0-based
const MONTHS = ALL_MONTHS.slice(0, CURRENT_MONTH_INDEX + 1);

const CANCELLED_EXCLUSION_NOTE =
  'Cancelled records are excluded from all figures (invoices, transporter payments & driver salaries).';

export function FinancialMonthlyChart({ title, ...other }) {
  const theme = useTheme();
  const { data } = useFinancialMonthlyData();

  const categoryOptions = useMemo(
    () => [
      { key: 'invoiceAmount', label: 'Invoice amount', color: theme.palette.primary.main },
      {
        key: 'transporterPayment',
        label: 'Transporter payment',
        color: theme.palette.warning.main,
      },
      { key: 'driverSalary', label: 'Driver salary', color: theme.palette.info.main },
      { key: 'loanDisbursed', label: 'Loan disbursed', color: theme.palette.error.main },
    ],
    [theme]
  );

  const [selected, setSelected] = useState(categoryOptions[0].label);

  const handleChange = useCallback((newValue) => {
    setSelected(newValue);
  }, []);

  const currentOption = categoryOptions.find((c) => c.label === selected);

  const chartSeries =
    data && currentOption
      ? [
          {
            name: currentOption.label,
            data: (data[currentOption.key] ?? []).slice(0, CURRENT_MONTH_INDEX + 1),
          },
        ]
      : [];

  const chartOptions = useChart({
    xaxis: { categories: MONTHS },
    colors: currentOption ? [currentOption.color] : [theme.palette.primary.main],
    yaxis: { labels: { formatter: (value) => fShortenNumber(value) } },
    tooltip: { y: { formatter: (value) => fShortenNumber(value) } },
  });

  const titleWithInfo = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      {title}
      <Tooltip title={CANCELLED_EXCLUSION_NOTE} arrow placement="top">
        <Box component="span" sx={{ display: 'flex', color: 'text.disabled', cursor: 'help' }}>
          <Iconify icon="eva:info-outline" width={16} />
        </Box>
      </Tooltip>
    </Box>
  );

  return (
    <Card {...other}>
      <CardHeader
        title={titleWithInfo}
        subheader={data ? `Year ${data.year}` : ''}
        action={
          <ChartSelect
            options={categoryOptions.map((c) => c.label)}
            value={selected}
            onChange={handleChange}
          />
        }
      />
      <Chart
        type="line"
        series={chartSeries}
        options={chartOptions}
        height={320}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
