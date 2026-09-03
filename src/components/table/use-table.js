import { useState, useEffect, useCallback } from 'react';
import { useSearchParams as _useSearchParams } from 'react-router-dom';

// ----------------------------------------------------------------------

export function useTable(props) {
  const [searchParams, setSearchParams] = _useSearchParams();

  const syncToUrl = !!props?.syncToUrl;
  const initialPageParam = syncToUrl ? Number.parseInt(searchParams.get('page') || '', 10) : NaN;
  const initialRowsParam = syncToUrl
    ? Number.parseInt(searchParams.get('rowsPerPage') || '', 10)
    : NaN;
  const initialOrderByParam = syncToUrl ? searchParams.get('orderBy') : null;
  const initialOrderParam = syncToUrl ? searchParams.get('order') : null;

  const [dense, setDense] = useState(!!props?.defaultDense || true);

  // page in state is 0-based; URL uses 1-based
  const [page, setPage] = useState(
    Number.isFinite(initialPageParam) && initialPageParam > 0
      ? initialPageParam - 1
      : props?.defaultCurrentPage || 0
  );

  const [orderBy, setOrderBy] = useState(initialOrderByParam || props?.defaultOrderBy || 'name');

  const [rowsPerPage, setRowsPerPage] = useState(
    Number.isFinite(initialRowsParam) && initialRowsParam > 0
      ? initialRowsParam
      : props?.defaultRowsPerPage || 10
  );

  const [order, setOrder] = useState(
    initialOrderParam === 'asc' || initialOrderParam === 'desc'
      ? initialOrderParam
      : props?.defaultOrder || 'asc'
  );

  const [selected, setSelected] = useState(props?.defaultSelected || []);

  const onSort = useCallback(
    (id) => {
      const isAsc = orderBy === id && order === 'asc';
      if (id !== '') {
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(id);
      }
    },
    [order, orderBy]
  );

  const onSelectRow = useCallback(
    (inputValue) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onChangeRowsPerPage = useCallback((event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  }, []);

  const onChangeDense = useCallback((event) => {
    setDense(event.target.checked);
  }, []);

  const onSelectAllRows = useCallback((checked, inputValue) => {
    if (checked) {
      setSelected(inputValue);
      return;
    }
    setSelected([]);
  }, []);

  const onChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onUpdatePageDeleteRow = useCallback(
    (totalRowsInPage) => {
      setSelected([]);
      if (page) {
        if (totalRowsInPage < 2) {
          setPage(page - 1);
        }
      }
    },
    [page]
  );

  const onUpdatePageDeleteRows = useCallback(
    ({ totalRowsInPage, totalRowsFiltered }) => {
      const totalSelected = selected.length;

      setSelected([]);

      if (page) {
        if (totalSelected === totalRowsInPage) {
          setPage(page - 1);
        } else if (totalSelected === totalRowsFiltered) {
          setPage(0);
        } else if (totalSelected > totalRowsInPage) {
          const newPage = Math.ceil((totalRowsFiltered - totalSelected) / rowsPerPage) - 1;

          setPage(newPage);
        }
      }
    },
    [page, rowsPerPage, selected.length]
  );

  // Sync table state to URL query params so list pages persist/share state
  useEffect(() => {
    if (!syncToUrl) return;
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        // Only include when meaningful to keep URLs clean
        if (page > 0) params.set('page', String(page + 1));
        else params.delete('page');

        if (rowsPerPage && rowsPerPage !== (props?.defaultRowsPerPage || 10))
          params.set('rowsPerPage', String(rowsPerPage));
        else params.delete('rowsPerPage');

        if (orderBy && orderBy !== (props?.defaultOrderBy || 'name'))
          params.set('orderBy', orderBy);
        else params.delete('orderBy');

        if (order && order !== (props?.defaultOrder || 'asc')) params.set('order', order);
        else params.delete('order');

        return params;
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, order, orderBy, syncToUrl]);

  return {
    dense,
    order,
    page,
    orderBy,
    rowsPerPage,
    //
    selected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onResetPage,
    onChangeRowsPerPage,
    onUpdatePageDeleteRow,
    onUpdatePageDeleteRows,
    //
    setPage,
    setDense,
    setOrder,
    setOrderBy,
    setSelected,
    setRowsPerPage,
  };
}
