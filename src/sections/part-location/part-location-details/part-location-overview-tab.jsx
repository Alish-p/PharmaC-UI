import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import { usePaginatedParts } from 'src/query/use-part';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import PartLocationOverviewTableRow from './part-location-overview-table-row';
import PartLocationOverviewTableToolbar from './part-location-overview-table-toolbar';
import { PART_LOCATION_OVERVIEW_TABLE_COLUMNS } from './part-location-overview-table-config';

const STORAGE_KEY = 'part-location-overview-table-columns';

// ----------------------------------------------------------------------

export function PartLocationOverviewTab({ partLocation }) {
  const theme = useTheme();
  const table = useTable({ defaultOrderBy: 'name' });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    visibleColumns,
    visibleHeaders,
    columnOrder,
    disabledColumns,
    toggleColumnVisibility,
    toggleAllColumnsVisibility,
    moveColumn,
    resetColumns,
    canReset: canResetColumns,
  } = useColumnVisibility(PART_LOCATION_OVERVIEW_TABLE_COLUMNS, STORAGE_KEY);

  const { data, isLoading } = usePaginatedParts(
    {
      inventoryLocation: partLocation?._id,
      search: search || undefined,
      status: statusFilter,
      page: table.page + 1,
      rowsPerPage: table.rowsPerPage,
    },
    {
      enabled: !!partLocation?._id,
    }
  );

  const filteredParts = data?.parts || [];
  const paginationTotal = data?.total || 0;

  const totalParts = data?.count || 0;
  const outOfStock = data?.outOfStockItems || 0;
  const lowStock = data?.lowStockItems || 0;
  const inStock = totalParts - outOfStock - lowStock;

  const notFound = !filteredParts.length && !isLoading;

  const handleSearchChange = useCallback(
    (event) => {
      setSearch(event.target.value);
      table.onResetPage();
    },
    [table]
  );

  const handleStatusFilterTab = useCallback(
    (event, newValue) => {
      setStatusFilter(newValue);
      table.onResetPage();
    },
    [table]
  );

  return (
    <Stack spacing={3}>
      {/* Parts Table */}
      <Card>
        <Tabs
          value={statusFilter}
          onChange={handleStatusFilterTab}
          sx={{
            px: 2.5,
            boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          <Tab
            value="all"
            label="All"
            iconPosition="end"
            icon={
              <Label variant={statusFilter === 'all' ? 'filled' : 'soft'} color="info">
                {totalParts}
              </Label>
            }
          />
          <Tab
            value="inStock"
            label="In Stock"
            iconPosition="end"
            icon={
              <Label variant={statusFilter === 'inStock' ? 'filled' : 'soft'} color="success">
                {inStock}
              </Label>
            }
          />
          <Tab
            value="lowStock"
            label="Low Stock"
            iconPosition="end"
            icon={
              <Label variant={statusFilter === 'lowStock' ? 'filled' : 'soft'} color="warning">
                {lowStock}
              </Label>
            }
          />
          <Tab
            value="outOfStock"
            label="Out of Stock"
            iconPosition="end"
            icon={
              <Label variant={statusFilter === 'outOfStock' ? 'filled' : 'soft'} color="error">
                {outOfStock}
              </Label>
            }
          />
        </Tabs>

        <PartLocationOverviewTableToolbar
          search={search}
          onSearchChange={handleSearchChange}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={toggleColumnVisibility}
          onToggleAllColumns={toggleAllColumnsVisibility}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
        />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={filteredParts.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                filteredParts.map((row) => row._id)
              )
            }
            action={
              <Stack direction="row">
                <Tooltip title="Download Excel">
                  <IconButton
                    color="primary"
                    onClick={() => {
                      const selectedRows = filteredParts.filter((r) =>
                        table.selected.includes(r._id)
                      );
                      const orderedIds = (
                        columnOrder && columnOrder.length
                          ? columnOrder
                          : Object.keys(visibleColumns)
                      ).filter((id) => visibleColumns[id]);

                      exportToExcel(
                        prepareDataForExport(
                          selectedRows,
                          PART_LOCATION_OVERVIEW_TABLE_COLUMNS,
                          orderedIds,
                          columnOrder
                        ),
                        'part-location-inventory'
                      );
                    }}
                  >
                    <Iconify icon="file-icons:microsoft-excel" />
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={visibleHeaders}
                onSort={table.onSort}
                onOrderChange={moveColumn}
                rowCount={filteredParts.length}
                numSelected={table.selected.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    filteredParts.map((row) => row._id)
                  )
                }
              />

              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableSkeleton key={index} sx={{ height: 72 }} />
                    ))
                  : filteredParts.map((row) => (
                      <PartLocationOverviewTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        visibleColumns={visibleColumns}
                        disabledColumns={disabledColumns}
                        columnOrder={columnOrder}
                      />
                    ))}

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={paginationTotal}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Stack>
  );
}
