import { useState, useCallback } from 'react';

import { fIsAfter, fDateRangeShortLabel } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function useDateRangePicker(start, end) {
  const [open, setOpen] = useState(false);

  const [endDate, setEndDate] = useState(end);

  const [startDate, setStartDate] = useState(start);

  const error = fIsAfter(startDate, endDate);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onChangeStartDate = useCallback((newValue) => {
    setStartDate(newValue);
  }, []);

  const onChangeEndDate = useCallback(
    (newValue) => {
      if (error) {
        setEndDate(null);
      }
      setEndDate(newValue);
    },
    [error]
  );

  const onReset = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
  }, []);

  /**
   * Atomically applies both dates in a single batch.
   * Use this instead of calling onChangeStartDate + onChangeEndDate separately
   * when you need to set both at once (e.g. preset clicks), to avoid the stale
   * error-closure bug in onChangeEndDate.
   */
  const onApplyRange = useCallback((newStart, newEnd) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  }, []);

  return {
    startDate,
    endDate,
    onChangeStartDate,
    onChangeEndDate,
    onApplyRange,
    //
    open,
    onOpen,
    onClose,
    onReset,
    //
    selected: !!startDate && !!endDate,
    error,
    //
    label: fDateRangeShortLabel(startDate, endDate, true),
    shortLabel: fDateRangeShortLabel(startDate, endDate),
    //
    setStartDate,
    setEndDate,
  };
}
