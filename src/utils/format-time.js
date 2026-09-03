import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import advancedFormat from 'dayjs/plugin/advancedFormat';

// ----------------------------------------------------------------------

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

/**
 * Docs: https://day.js.org/docs/en/display/format
 */
export const formatStr = {
  dateTime: 'DD MMM YYYY h:mm a', // 17 Apr 2022 12:00 am
  date: 'DD MMM YYYY', // 17 Apr 2022
  time: 'h:mm a', // 12:00 am
  split: {
    dateTime: 'DD/MM/YYYY h:mm a', // 17/04/2022 12:00 am
    date: 'DD/MM/YYYY', // 17/04/2022
  },
  paramCase: {
    dateTime: 'DD-MM-YYYY h:mm a', // 17-04-2022 12:00 am
    date: 'DD-MM-YYYY', // 17-04-2022
  },
};

export function today(format) {
  return dayjs(new Date()).startOf('day').format(format);
}

// ----------------------------------------------------------------------

/** output: 17 Apr 2022 12:00 am
 */
export function fDateTime(date, format) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).format(format ?? formatStr.dateTime) : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: 17 Apr 2022
 */
export function fDate(date, format) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).format(format ?? formatStr.date) : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: 1st Nov 2020
 */
export function fShortTime(date, format) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).format(format ?? 'Do MMM YYYY') : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: 12:00 am
 */
export function fTime(date, format) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).format(format ?? formatStr.time) : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: 1713250100
 */
export function fTimestamp(date) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).valueOf() : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: a few seconds, 2 years
 */
export function fToNow(date) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).toNow(true) : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: boolean
 */
export function fIsBetween(inputDate, startDate, endDate) {
  if (!inputDate || !startDate || !endDate) {
    return false;
  }

  const formattedInputDate = fTimestamp(inputDate);
  const formattedStartDate = fTimestamp(startDate);
  const formattedEndDate = fTimestamp(endDate);

  if (formattedInputDate && formattedStartDate && formattedEndDate) {
    return formattedInputDate >= formattedStartDate && formattedInputDate <= formattedEndDate;
  }

  return false;
}

// ----------------------------------------------------------------------

/** output: boolean
 */
export function fIsAfter(startDate, endDate) {
  return dayjs(startDate).isAfter(endDate);
}

// ----------------------------------------------------------------------

/** output: boolean
 */
export function fIsSame(startDate, endDate, units) {
  if (!startDate || !endDate) {
    return false;
  }

  const isValid = dayjs(startDate).isValid() && dayjs(endDate).isValid();

  if (!isValid) {
    return 'Invalid time value';
  }

  return dayjs(startDate).isSame(endDate, units ?? 'year');
}

// ----------------------------------------------------------------------

/** output:
 * Same day: 26 Apr 2024
 * Same month: 25 - 26 Apr 2024
 * Same month: 25 - 26 Apr 2024
 * Same year: 25 Apr - 26 May 2024
 */
export function fDateRangeShortLabel(startDate, endDate, initial) {
  const isValid = dayjs(startDate).isValid() && dayjs(endDate).isValid();

  const isAfter = fIsAfter(startDate, endDate);

  if (!isValid || isAfter) {
    return 'N/A';
  }

  let label = `${fDate(startDate)} - ${fDate(endDate)}`;

  if (initial) {
    return label;
  }

  const isSameYear = fIsSame(startDate, endDate, 'year');
  const isSameMonth = fIsSame(startDate, endDate, 'month');
  const isSameDay = fIsSame(startDate, endDate, 'day');

  if (isSameYear && !isSameMonth) {
    label = `${fDate(startDate, 'DD MMM')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && !isSameDay) {
    label = `${fDate(startDate, 'DD')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && isSameDay) {
    label = `${fDate(endDate)}`;
  }

  return label;
}

/** output: '2024-05-28T05:55:31+00:00'
 */
export function fAdd({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const result = dayjs()
    .add(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}

/** output: '2024-05-28T05:55:31+00:00'
 */
export function fSub({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const result = dayjs()
    .subtract(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}

/**
 * Returns the first day of the current month.
 *
 * @returns {Date} - A Date object representing the first day of the current month.
 */
export const getFirstDayOfCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Returns the number of full days between startDate and endDate.
 *
 * @param  {string|number|Date} startDate — start of range
 * @param  {string|number|Date} endDate   — end of range
 * @returns {number|null|'Invalid time value'}
 */
export function fDaysDuration(startDate, endDate) {
  if (!startDate || !endDate) {
    return null;
  }

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (!start.isValid() || !end.isValid()) {
    return 'Invalid time value';
  }

  // diff in days; if you want to include both endpoints, add +1
  return end.diff(start, 'day');
}

/**
 * Returns a detailed duration string between startDate and endDate.
 * Example: "2 days 5 hours", "9 hours", "3 days 1.6 hours"
 *
 * @param  {string|number|Date} startDate — start of range
 * @param  {string|number|Date} endDate   — end of range
 * @returns {string|null|'Invalid time value'}
 */
export function fDateTimeDuration(startDate, endDate) {
  if (!startDate || !endDate) {
    return null;
  }

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (!start.isValid() || !end.isValid()) {
    return 'Invalid time value';
  }

  const diffMs = end.diff(start);
  const durationObj = dayjs.duration(diffMs);

  const days = Math.floor(durationObj.asDays());
  const hours = durationObj.asHours() % 24;

  let result = '';
  if (days > 0) {
    result += `${days} ${days === 1 ? 'day' : 'days'}`;
  }

  if (hours > 0) {
    if (result) result += ' ';
    // Round to 1 decimal place if it's not an integer
    const formattedHours = Number.isInteger(hours) ? hours : hours.toFixed(1);
    result += `${formattedHours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return result || '0 hours';
}

/**
 * Returns the current fiscal year in "YY-YY" format (e.g. "25-26").
 * Assumes fiscal year = April 1 → March 31.
 */
export function getCurrentFiscalYearShort() {
  const now = dayjs();
  const year = now.year(); // e.g. 2025
  const month = now.month(); // 0 = Jan, 1 = Feb, …, 3 = Apr, …, 11 = Dec

  // If month >= 3 (April or later), startYear = current year; otherwise (Jan–Mar), startYear = previous year
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;

  // Get last two digits (e.g. 2025 → "25", 2024 → "24")
  const startShort = String(startYear).slice(-2);
  const endShort = String(endYear).slice(-2);

  return `${startShort}-${endShort}`;
}
