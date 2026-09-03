import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fShortenNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function AppSubtripCompletedChart({
  title,
  subheader,
  chart,
  selectedSeries: controlledSelectedSeries,
  onChangeSeries: controlledOnChangeSeries,
  ...other
}) {
  const theme = useTheme();

  const currentYear = dayjs().format('YYYY');

  const [internalSelectedSeries, setInternalSelectedSeries] = useState(currentYear);

  const isControlled = controlledSelectedSeries !== undefined;

  const selectedSeries = isControlled ? controlledSelectedSeries : internalSelectedSeries;
  const { tooltipDetails } = chart;

  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const chartOptions = useChart({
    chart: { stacked: true },
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: {
      categories: chart.categories,
      crosshairs: {
        width: 'barWidth',
      },
    },
    tooltip: tooltipDetails
      ? {
          shared: false,
          intersect: true,
          custom: ({ dataPointIndex, seriesIndex, series }) =>
            renderSubtripTooltip({
              dataPointIndex,
              seriesIndex,
              series,
              categories: chart.categories,
              tooltipDetails,
              colors: chartColors,
              theme,
            }),
        }
      : {
          y: {
            formatter: (value) => value,
          },
        },
    // Show total (own + market) labels on top of each stacked bar
    plotOptions: {
      bar: {
        columnWidth: '40%',
        dataLabels: {
          total: {
            enabled: true,
            style: {
              color: theme.vars.palette.text.primary,
            },
          },
        },
      },
    },
    ...chart.options,
  });

  const handleChangeSeries = useCallback(
    (newValue) => {
      if (controlledOnChangeSeries) {
        controlledOnChangeSeries(newValue);
      } else {
        setInternalSelectedSeries(newValue);
      }
    },
    [controlledOnChangeSeries]
  );

  const currentSeries = chart.series.find((i) => i.name === selectedSeries);

  const legendItems = currentSeries?.data || [];

  const legendTotals = legendItems.map(({ data }) => data.reduce((sum, v) => sum + v, 0));
  const legendValues = legendTotals.map((total) => fShortenNumber(total));

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <ChartSelect
            options={chart.series.map((item) => item.name)}
            value={selectedSeries}
            onChange={handleChangeSeries}
          />
        }
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={legendItems.map((item) => item.name)}
        values={legendValues}
        sx={{
          px: 3,
          gap: 3,
        }}
      />

      <Chart
        key={selectedSeries}
        type="bar"
        series={currentSeries?.data}
        options={chartOptions}
        height={320}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}

function renderSubtripTooltip({
  dataPointIndex,
  seriesIndex,
  series,
  categories,
  tooltipDetails,
  colors,
  theme,
}) {
  if (dataPointIndex == null || dataPointIndex < 0) {
    return '';
  }

  const own = tooltipDetails?.own?.[dataPointIndex] || {
    totalSubtrips: 0,
    totalIncome: 0,
    subtripExpense: 0,
    vehicleExpense: 0,
    profit: 0,
  };
  const market = tooltipDetails?.market?.[dataPointIndex] || {
    totalSubtrips: 0,
    totalCommission: 0,
  };

  const surfaceColor = theme.palette.background.paper;
  const borderColor = theme.vars?.palette?.divider || theme.palette.divider;
  const titleColor = theme.palette.text.secondary;
  const textColor = theme.palette.text.primary;
  const successColor = theme.palette.success.main;
  const errorColor = theme.palette.error.main;
  const ownColor = colors?.[0] || theme.palette.primary.main;
  const marketColor = colors?.[1] || theme.palette.warning.main;
  const profitColor = own.profit >= 0 ? successColor : errorColor;
  const commissionColor = successColor;

  const buildRow = (label, value, valueColor = textColor) => `
    <div style="display:flex;justify-content:space-between;gap:16px;font-size:12px;line-height:1.5;">
      <span style="color:${titleColor};">${label}</span>
      <span style="color:${valueColor};font-weight:600;text-align:right;">${value}</span>
    </div>
  `;
  const formatShortCurrency = (value) => `₹ ${fShortenNumber(value || 0)}`;
  const hoveredSubtripCount = series?.[seriesIndex]?.[dataPointIndex] ?? 0;

  if (seriesIndex === 0) {
    return `
    <div style="min-width:240px;padding:12px 14px;background:${surfaceColor};border:1px solid ${borderColor};border-radius:12px;color:${textColor};">
      <div style="font-size:12px;font-weight:700;color:${titleColor};margin-bottom:10px;">
        ${categories?.[dataPointIndex] || ''}
      </div>

      <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:${textColor};margin-bottom:8px;">
        <span style="width:8px;height:8px;border-radius:999px;background:${ownColor};display:inline-block;"></span>
        Own
      </div>
      ${buildRow('Total subtrips', String(hoveredSubtripCount))}
      ${buildRow('Total income', formatShortCurrency(own.totalIncome))}
      ${buildRow('Job expense', formatShortCurrency(own.subtripExpense))}
      ${buildRow('Vehicle expense', formatShortCurrency(own.vehicleExpense))}
      ${buildRow('Profit', formatShortCurrency(own.profit), profitColor)}
    </div>
  `;
  }

  return `
    <div style="min-width:240px;padding:12px 14px;background:${surfaceColor};border:1px solid ${borderColor};border-radius:12px;color:${textColor};">
      <div style="font-size:12px;font-weight:700;color:${titleColor};margin-bottom:10px;">
        ${categories?.[dataPointIndex] || ''}
      </div>

      <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:${textColor};margin-bottom:8px;">
        <span style="width:8px;height:8px;border-radius:999px;background:${marketColor};display:inline-block;"></span>
        Market
      </div>
      ${buildRow('Total subtrips', String(market.totalSubtrips || 0))}
      ${buildRow('Total commission', formatShortCurrency(market.totalCommission), commissionColor)}
    </div>
  `;
}
