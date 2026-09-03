import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useFilters } from 'src/hooks/use-filters';
import { useBoolean } from 'src/hooks/use-boolean';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import axios from 'src/utils/axios';
import { paramCase } from 'src/utils/change-case';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import DriverListPdf from 'src/pdfs/driver-list-pdf';
import { DashboardContent } from 'src/layouts/dashboard';
import { useDeleteDriver, usePaginatedDrivers } from 'src/query/use-driver';

import { Label } from 'src/components/label';
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

import { useTenantContext } from 'src/auth/tenant';

import DriverLearn from '../driver-learn';
import DriverTableRow from '../driver-table-row';
import { TABLE_COLUMNS } from '../driver-table-config';
import DriverTableToolbar from '../driver-table-toolbar';
import DriverCleanupDialog from '../cleanup/driver-cleanup-dialog';
import DriverTableFiltersResult from '../driver-table-filters-result';

const STORAGE_KEY = 'driver-table-columns';

const defaultFilters = {
  search: '',
  status: 'all',
  driverType: '',
  isActive: '',
};

export function DriverListView() {
  const tenant = useTenantContext();
  const theme = useTheme();
  const router = useRouter();
  const navigate = useNavigate();
  const deleteDriver = useDeleteDriver();
  const table = useTable({ defaultOrderBy: 'createDate', syncToUrl: true });
  const cleanupDialog = useBoolean();
  const learn = useBoolean(); // Added learn state

  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const { data, isLoading } = usePaginatedDrivers({
    search: filters.search || undefined,
    status: filters.status,
    driverType: filters.driverType || undefined,
    isActive: filters.isActive || undefined,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (data?.drivers) {
      const statusMappedDrivers = data.drivers.map((driver) => {
        const licenseToDate = new Date(driver.licenseTo);
        const status = licenseToDate > new Date() ? 'valid' : 'expired';

        return { ...driver, status };
      });
      setTableData(statusMappedDrivers);
    }
  }, [data]);

  const totalCount = data?.total || 0;

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: data?.totals?.all?.count || 0 },
    {
      value: 'valid',
      label: 'Valid',
      color: 'success',
      count: data?.totals?.valid?.count || tableData.filter((i) => i.status === 'valid').length,
    },
    {
      value: 'expired',
      label: 'Expired',
      color: 'error',
      count: data?.totals?.expired?.count || tableData.filter((i) => i.status === 'expired').length,
    },
  ];

  const handleFilterStatus = useCallback(
    (event, newValue) => handleFilters('status', newValue),
    [handleFilters]
  );

  const handleEditRow = (id) => {
    navigate(paths.dashboard.driver.edit(paramCase(id)));
  };

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.driver.details(id));
    },
    [router]
  );

  const handleToggleColumn = useCallback(
    (columnName) => {
      toggleColumnVisibility(columnName);
    },
    [toggleColumnVisibility]
  );

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length ? columnOrder : TABLE_COLUMNS.map((c) => c.id)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  return (
    <DashboardContent>
      <DriverLearn open={learn.value} onClose={learn.onFalse} />

      <CustomBreadcrumbs
        heading={
          <Stack direction="row" alignItems="center" spacing={1} component="span">
            <span>Driver List</span>
            <IconButton
              color="default"
              onClick={learn.onTrue}
              sx={{
                color: 'warning.main',
                animation: 'pulseGlow 2s ease-in-out infinite',
                '@keyframes pulseGlow': {
                  '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 0px transparent)' },
                  '50%': {
                    transform: 'scale(1.18)',
                    filter: 'drop-shadow(0 0 6px rgba(255,171,0,0.5))',
                  },
                },
              }}
            >
              <Iconify icon="mage:light-bulb" />
            </IconButton>
          </Stack>
        }
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Driver', href: paths.dashboard.driver.root },
          { name: 'Driver List' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon="mdi:broom" />}
              onClick={cleanupDialog.onTrue}
            >
              Cleanup
            </Button>
            <Button
              component={RouterLink}
              href={paths.dashboard.driver.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Driver
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={filters.status}
          onChange={handleFilterStatus}
          sx={{
            px: 2.5,
            boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                isLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Label
                    variant={tab.value === filters.status ? 'filled' : 'soft'}
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                )
              }
            />
          ))}
        </Tabs>

        <DriverTableToolbar
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
          <DriverTableFiltersResult
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
                      Select all {totalCount} drivers
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
                          const orderedIds = getVisibleColumnsForExport();

                          const response = await axios.get('/api/drivers/export', {
                            params: {
                              search: filters.search || undefined,
                              status: filters.status,
                              driverType: filters.driverType || undefined,
                              isActive: filters.isActive || undefined,
                              columns: orderedIds.join(','),
                            },
                            responseType: 'blob',
                          });
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'Drivers.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setIsDownloading(false);
                          toast.success('Export completed!');
                        } catch (error) {
                          console.error('Failed to download excel', error);
                          setIsDownloading(false);
                          toast.error('Failed to export drivers.');
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
                          'Drivers-selected-list'
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

                {!selectAllMode && (
                  <Tooltip title="Download PDF">
                    <PDFDownloadLink
                      document={(() => {
                        const selectedRows = tableData.filter((r) =>
                          table.selected.includes(r._id)
                        );
                        const visibleCols = getVisibleColumnsForExport();
                        return (
                          <DriverListPdf
                            drivers={selectedRows}
                            visibleColumns={visibleCols}
                            tenant={tenant}
                          />
                        );
                      })()}
                      fileName="Driver-list.pdf"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {({ loading }) => (
                        <IconButton color="primary">
                          <Iconify icon={loading ? 'line-md:loading-loop' : 'fa:file-pdf-o'} />
                        </IconButton>
                      )}
                    </PDFDownloadLink>
                  </Tooltip>
                )}
              </Stack>
            }
          />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={[...visibleHeaders, { id: 'actions', align: 'right' }]}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onOrderChange={moveColumn}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row._id)
                  )
                }
              />
              <TableBody>
                {isLoading ? (
                  Array.from({ length: table.rowsPerPage }).map((_, index) => (
                    <TableSkeleton key={index} />
                  ))
                ) : (
                  <>
                    {tableData.map((row) => (
                      <DriverTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onViewRow={() => handleViewRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onDeleteRow={() => deleteDriver(row._id)}
                        visibleColumns={visibleColumns}
                        disabledColumns={disabledColumns}
                        columnOrder={columnOrder}
                      />
                    ))}

                    <TableNoData notFound={notFound} />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ px: 2 }}>
          <TablePaginationCustom
            count={totalCount}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Stack>
      </Card>

      <DriverCleanupDialog open={cleanupDialog.value} onClose={cleanupDialog.onFalse} />
    </DashboardContent>
  );
}
