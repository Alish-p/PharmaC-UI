import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useFilters } from 'src/hooks/use-filters';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import axios from 'src/utils/axios';
import { paramCase } from 'src/utils/change-case';
import { fShortenNumber } from 'src/utils/format-number';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import { DashboardContent } from 'src/layouts/dashboard';
import { useDeletePart, usePaginatedParts } from 'src/query/use-part';
import { usePaginatedPartLocations } from 'src/query/use-part-location';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import PartTableRow from '../part-table-row';
import PartTableToolbar from '../part-table-toolbar';
import { TABLE_COLUMNS } from '../part-table-config';
import PartAnalytic from '../part-list/part-analytic';
import PartTableFiltersResult from '../part-table-filters-result';

const STORAGE_KEY = 'part-table-columns';

const defaultFilters = {
  search: '',
  category: 'all',
  manufacturer: 'all',
  status: '',
};

export function PartListView() {
  const theme = useTheme();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'name', syncToUrl: true });

  const navigate = useNavigate();
  const deletePart = useDeletePart();

  const { filters, handleFilters, handleResetFilters, canReset } = useFilters(defaultFilters, {
    onResetPage: table.onResetPage,
  });

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
  } = useColumnVisibility(TABLE_COLUMNS, STORAGE_KEY);

  const { data: locationsResponse, isLoading: isLoadingLocations } = usePaginatedPartLocations(
    { page: 1, rowsPerPage: 1000 },
    { staleTime: 1000 * 60 * 10 }
  );

  const locations = useMemo(
    () =>
      locationsResponse?.locations ||
      locationsResponse?.partLocations ||
      locationsResponse?.results ||
      [],
    [locationsResponse]
  );

  const [activeLocationId, setActiveLocationId] = useState('');

  useEffect(() => {
    if (locations.length > 0 && !activeLocationId) {
      setActiveLocationId(locations[0]._id);
    }
  }, [locations, activeLocationId]);

  const { data, isLoading } = usePaginatedParts({
    search: filters.search || undefined,
    inventoryLocation: activeLocationId || undefined,
    category: filters.category && filters.category !== 'all' ? filters.category : undefined,
    manufacturer:
      filters.manufacturer && filters.manufacturer !== 'all' ? filters.manufacturer : undefined,
    status: filters.status || undefined,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
  });

  const [tableData, setTableData] = useState([]);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (data?.parts) {
      setTableData(data.parts);
    } else if (data?.results) {
      setTableData(data.results);
    }
  }, [data]);

  const totalCount = data?.total || tableData.length;
  const totalInventoryValue = data?.totalInventoryValue || 0;
  const totalQuantityItems = data?.totalQuantityItems || 0;
  const outOfStockItems = data?.outOfStockItems || 0;

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleEditRow = (id) => {
    navigate(paths.dashboard.part.edit(paramCase(id)));
  };

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.part.details(id));
    },
    [router]
  );

  const handleToggleColumn = useCallback(
    (columnName) => {
      toggleColumnVisibility(columnName);
    },
    [toggleColumnVisibility]
  );

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length ? columnOrder : Object.keys(visibleColumns)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  const handleFilterLocation = useCallback(
    (event, newValue) => {
      setActiveLocationId(newValue);
      table.onResetPage();
    },
    [table]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Parts List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vehicle Maintenance', href: paths.dashboard.part.root },
          { name: 'Parts List' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              component={RouterLink}
              href={paths.dashboard.part.bulkImport}
              variant="outlined"
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            >
              Import
            </Button>
            <Button
              component={RouterLink}
              href={paths.dashboard.part.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Part
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Analytics Section */}
      <Card
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Scrollbar>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2 }}
          >
            <PartAnalytic
              title="Inventory value"
              subtitle={`₹ ${fShortenNumber(totalInventoryValue)}`}
              icon="mdi:clipboard-list-outline"
              color={theme.palette.info.main}
            />

            <PartAnalytic
              title="Total Parts Quantity"
              subtitle={`${totalQuantityItems} Units`}
              icon="mdi:package-variant-closed"
              color={theme.palette.primary.main}
            />

            <PartAnalytic
              title="Out of Stock"
              subtitle={`${fShortenNumber(outOfStockItems)} Parts`}
              icon="mdi:alert-circle-outline"
              color={theme.palette.error.main}
            />
          </Stack>
        </Scrollbar>
      </Card>

      <Card>
        {/* Location Tabs */}
        {isLoadingLocations ? (
          <Stack direction="row" justifyContent="center" sx={{ py: 3 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : locations.length > 0 ? (
          <Tabs
            value={activeLocationId}
            onChange={handleFilterLocation}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {locations.map((loc) => (
              <Tab key={loc._id} value={loc._id} label={loc.name} />
            ))}
          </Tabs>
        ) : (
          <Stack sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary">
              No part locations found. Please create a location first.
            </Typography>
          </Stack>
        )}

        <PartTableToolbar
          filters={filters}
          onFilters={handleFilters}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={handleToggleColumn}
          onToggleAllColumns={toggleAllColumnsVisibility}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
        />

        {canReset && (
          <PartTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={totalCount}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={tableData.length}
            onSelectAllRows={(checked) => {
              if (!checked) {
                setSelectAllMode(false);
              }
              table.onSelectAllRows(
                checked,
                tableData.map((row) => row._id)
              );
            }}
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2">
                  {selectAllMode
                    ? `All ${totalCount} selected`
                    : `${table.selected.length} selected`}
                </Typography>

                {!selectAllMode &&
                  table.selected.length === tableData.length &&
                  totalCount > tableData.length && (
                    <Link
                      component="button"
                      variant="subtitle2"
                      onClick={() => {
                        setSelectAllMode(true);
                      }}
                      sx={{ ml: 1, color: 'primary.main', fontWeight: 'bold' }}
                    >
                      Select all {totalCount} parts
                    </Link>
                  )}
              </Stack>
            }
            action={
              <Stack direction="row">
                <Tooltip title="Download Excel">
                  <IconButton
                    color="primary"
                    onClick={async () => {
                      if (selectAllMode) {
                        try {
                          setIsDownloading(true);
                          toast.info('Export started... Please wait.');
                          const orderedIds = (
                            columnOrder && columnOrder.length
                              ? columnOrder
                              : Object.keys(visibleColumns)
                          ).filter((id) => visibleColumns[id]);

                          const response = await axios.get('/api/maintenance/parts/export', {
                            params: {
                              search: filters.search || undefined,
                              inventoryLocation: activeLocationId || undefined,
                              category:
                                filters.category && filters.category !== 'all'
                                  ? filters.category
                                  : undefined,
                              manufacturer:
                                filters.manufacturer && filters.manufacturer !== 'all'
                                  ? filters.manufacturer
                                  : undefined,
                              status: filters.status || undefined,
                              columns: orderedIds.join(','),
                              order: table.order,
                              orderBy: table.orderBy,
                            },
                            responseType: 'blob',
                          });
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'Parts.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setIsDownloading(false);
                          toast.success('Export completed!');
                        } catch (error) {
                          console.error('Failed to download excel', error);
                          setIsDownloading(false);
                          toast.error('Failed to export parts.');
                        }
                      } else {
                        const selectedRows = tableData.filter((r) =>
                          table.selected.includes(r._id)
                        );
                        const visibleCols = getVisibleColumnsForExport();
                        exportToExcel(
                          prepareDataForExport(
                            selectedRows,
                            TABLE_COLUMNS,
                            visibleCols,
                            columnOrder
                          ),
                          'Parts-selected-list'
                        );
                      }
                    }}
                  >
                    {isDownloading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <Iconify icon="file-icons:microsoft-excel" />
                    )}
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
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onOrderChange={moveColumn}
                onSort={table.onSort}
                onSelectAllRows={(checked) => {
                  if (!checked) {
                    setSelectAllMode(false);
                  }
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row._id)
                  );
                }}
              />
              <TableBody>
                {isLoading
                  ? Array.from({ length: table.rowsPerPage }).map((_, i) => (
                      <TableSkeleton key={i} />
                    ))
                  : tableData.map((row) => (
                      <PartTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onViewRow={() => handleViewRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onDeleteRow={() => deletePart(row._id)}
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
          count={totalCount}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}
