import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import { useSubtripMonthlyData } from 'src/query/use-dashboard';

import { AppSubtripCompletedChart } from './app-subtrips-completed-chart';

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

export function DashboardSubtripCompletedWidget({ ...other }) {
  const currentYear = dayjs().year();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: subtripMonthlyData } = useSubtripMonthlyData(selectedYear);

  // You can adjust the range of years as needed
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  const series = years.map((year) => {
    const isSelected = year === selectedYear;

    return {
      name: String(year),
      data:
        isSelected && subtripMonthlyData
          ? [
              { name: 'Own', data: subtripMonthlyData.own },
              { name: 'Market', data: subtripMonthlyData.market },
            ]
          : [
              { name: 'Own', data: Array(12).fill(0) },
              { name: 'Market', data: Array(12).fill(0) },
            ],
    };
  });

  const handleChangeYear = useCallback((newValue) => {
    setSelectedYear(Number(newValue));
  }, []);

  return (
    <AppSubtripCompletedChart
      title="Jobs Completed"
      subheader="(+23%) than last year"
      selectedSeries={String(selectedYear)}
      onChangeSeries={handleChangeYear}
      chart={{
        categories: CATEGORIES,
        series,
        tooltipDetails: subtripMonthlyData?.monthlyMetrics,
      }}
      {...other}
    />
  );
}
