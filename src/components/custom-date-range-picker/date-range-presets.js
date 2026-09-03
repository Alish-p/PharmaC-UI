import dayjs from 'dayjs';

// ----------------------------------------------------------------------

/**
 * Derives the current and previous Indian financial year (Apr 1 – Mar 31)
 * based on today's date.
 *
 * @returns {{ currentFY: { label, start, end }, previousFY: { label, start, end } }}
 */
function getFinancialYears() {
  const today = dayjs();
  const month = today.month(); // 0-indexed; March = 2, April = 3

  // FY starts in April (month index 3). If we're before April, current FY started last year.
  const fyStartYear = month >= 3 ? today.year() : today.year() - 1;

  const formatFYLabel = (startYear) => {
    const short = (y) => String(y).slice(-2);
    return `FY ${short(startYear)}-${short(startYear + 1)}`;
  };

  return {
    currentFY: {
      label: formatFYLabel(fyStartYear),
      start: dayjs(`${fyStartYear}-04-01`).startOf('day'),
      end: dayjs(`${fyStartYear + 1}-03-31`).endOf('day'),
    },
    previousFY: {
      label: formatFYLabel(fyStartYear - 1),
      start: dayjs(`${fyStartYear - 1}-04-01`).startOf('day'),
      end: dayjs(`${fyStartYear}-03-31`).endOf('day'),
    },
  };
}

// ----------------------------------------------------------------------

/**
 * Returns the default array of date range presets.
 * Each preset has a `label` and a `getValue` function that returns [startDate, endDate].
 * Calling this as a function ensures FY labels are always computed from the current date.
 *
 * @returns {Array<{ label: string, getValue: () => [import('dayjs').Dayjs, import('dayjs').Dayjs] }>}
 */
export function getDateRangePresets() {
  const { currentFY, previousFY } = getFinancialYears();

  return [
    {
      label: 'Today',
      getValue: () => [dayjs().startOf('day'), dayjs().endOf('day')],
    },
    {
      label: 'This Week',
      getValue: () => [dayjs().startOf('week'), dayjs().endOf('week')],
    },
    // {
    //   label: 'This Month',
    //   getValue: () => [dayjs().startOf('month'), dayjs().endOf('month')],
    // },
    {
      label: 'Last 30 Days',
      getValue: () => [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')],
    },
    {
      label: 'Last 3 Months',
      getValue: () => [dayjs().subtract(3, 'month').startOf('day'), dayjs().endOf('day')],
    },
    {
      label: 'Last 6 Months',
      getValue: () => [dayjs().subtract(6, 'month').startOf('day'), dayjs().endOf('day')],
    },
    {
      label: currentFY.label,
      getValue: () => [currentFY.start, currentFY.end],
    },
    {
      label: previousFY.label,
      getValue: () => [previousFY.start, previousFY.end],
    },
  ];
}

/**
 * Pre-evaluated default preset list. Import and pass directly as the `presets` prop.
 *
 * @example
 * import { DATE_RANGE_PRESETS } from 'src/components/custom-date-range-picker';
 * <CustomDateRangePicker presets={DATE_RANGE_PRESETS} ... />
 */
export const DATE_RANGE_PRESETS = getDateRangePresets();
