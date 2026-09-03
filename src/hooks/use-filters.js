import dayjs from 'dayjs';
import { useRef, useEffect, useCallback } from 'react';
import { useSearchParams as _useSearchParams } from 'react-router-dom';

import { isEqual } from 'src/utils/helper';

import { useSetState } from './use-set-state';

export function useFilters(initialFilters, options = {}) {
  const { onResetPage } = options;
  const [searchParams, setSearchParams] = _useSearchParams();

  const {
    state: filters,
    setState,
    onResetState,
    canReset,
  } = useSetState(initialFilters);

  const isDateKey = useCallback((key) => /date/i.test(key), []);

  const parseFromQuery = useCallback(
    (key, value, defaultValue) => {
      if (value == null) return defaultValue;
      if (Array.isArray(defaultValue)) {
        if (typeof value === 'string') {
          return value ? value.split(',') : [];
        }
        return [];
      }
      if (typeof defaultValue === 'boolean') {
        return value === 'true' || value === '1';
      }
      if (isDateKey(key)) {
        const d = dayjs(value);
        return d.isValid() ? d : null;
      }
      return value;
    },
    [isDateKey]
  );

  const serializeForQuery = useCallback((key, value) => {
    if (value == null || value === '') return null;
    if (Array.isArray(value)) return value.length ? value.join(',') : null;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (dayjs.isDayjs(value)) return value.toISOString();
    return String(value);
  }, []);

  // Initialize from current URL params on mount and when params change (via browser nav)
  const didInitRef = useRef(false);
  useEffect(() => {
    const next = Object.keys(initialFilters).reduce((acc, key) => {
      const raw = searchParams.get(key);
      acc[key] = parseFromQuery(key, raw, initialFilters[key]);
      return acc;
    }, {});

    if (!isEqual(filters, next)) {
      setState(next);
    }

    if (!didInitRef.current) didInitRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setFilters = useCallback(
    (update) => {
      if (onResetPage) onResetPage();
      setState(update);
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          Object.keys(update || {}).forEach((key) => {
            const serialized = serializeForQuery(key, update[key]);
            if (serialized == null || isEqual(update[key], initialFilters[key])) {
              params.delete(key);
            } else {
              params.set(key, serialized);
            }
          });
          params.delete('page');
          return params;
        },
        { replace: true }
      );
    },
    [onResetPage, setState, setSearchParams, serializeForQuery, initialFilters]
  );

  const handleFilters = useCallback(
    (name, value) => {
      if (typeof name === 'object' && name !== null) {
        setFilters(name);
        return;
      }
      setFilters({ [name]: value });
    },
    [setFilters]
  );

  const handleResetFilters = useCallback(() => {
    onResetState();
    if (onResetPage) onResetPage();

    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        Object.keys(initialFilters).forEach((key) => params.delete(key));
        params.delete('page');
        return params;
      },
      { replace: true }
    );
  }, [onResetState, onResetPage, setSearchParams, initialFilters]);

  return {
    filters,
    setFilters,
    handleFilters,
    handleResetFilters,
    canReset,
  };
}
