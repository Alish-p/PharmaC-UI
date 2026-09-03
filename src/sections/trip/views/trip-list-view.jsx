// @mui
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
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
// @mui
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useFilters } from 'src/hooks/use-filters';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import axios from 'src/utils/axios';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import TripListPdf from 'src/pdfs/trip-list-pdf';
import { DashboardContent } from 'src/layouts/dashboard';
import { useDeleteTrip, usePaginatedTrips } from 'src/query/use-trip';

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

import TripTableRow from '../trip-table-row';
import TripTableToolbar from '../trip-table-toolbar';
import { TABLE_COLUMNS } from '../trip-table-config';
import TripTableFiltersResult from '../trip-table-filters-result';

const STORAGE_KEY = 'trip-table-columns';

// ----------------------------------------------------------------------

const defaultFilters = {
  tripNo: '',
  driverId: '',
  vehicleId: '',
  subtripId: '',
  tripStatus: 'all',
  fromDate: null,
  toDate: null,
  isTripSheetReady: false,
  numberOfSubtrips: 0,
};

// ----------------------------------------------------------------------

export function TripListView() {
  const tenant = useTenantContext();
  const theme = useTheme();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'createDate', syncToUrl: true });
  const deleteTrip = useDeleteTrip();

  const navigate = useNavigate();

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedSubtrip, setSelectedSubtrip] = useState(null);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { filters, setFilters, handleFilters, handleResetFilters, canReset } = useFilters(defaultFilters, {
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

  const { data, isLoading } = usePaginatedTrips({
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    tripNo: filters.tripNo || undefined,
    driverId: filters.driverId || undefined,
    vehicleId: filters.vehicleId || undefined,
    subtripId: filters.subtripId || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    status: filters.tripStatus !== 'all' ? [filters.tripStatus] : undefined,
    isTripSheetReady: filters.isTripSheetReady ? 'true' : undefined,
    numberOfSubtrips: filters.numberOfSubtrips || undefined,
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (data?.trips) {
      setTableData(data.trips);
    }
  }, [data]);

  const totalCount = data?.total || 0;

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length ? columnOrder : TABLE_COLUMNS.map((c) => c.id)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: data?.total },
    { value: 'open', label: 'Open', color: 'warning', count: data?.totalOpen },
    { value: 'closed', label: 'Closed', color: 'success', count: data?.totalClosed },
  ];

  const handleEditRow = (id) => {
    navigate(paths.dashboard.trip.edit(id));
  };

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.trip.details(id));
    },
    [router]
  );

  const handleFilterTripStatus = useCallback(
    (event, newValue) => {
      handleFilters('tripStatus', newValue);
    },
    [handleFilters]
  );

  const handleResetAll = useCallback(() => {
    handleResetFilters();
    setSelectedVehicle(null);
    setSelectedDriver(null);
    setSelectedSubtrip(null);
  }, [handleResetFilters]);

  // Add handler for toggling column visibility
  const handleToggleColumn = useCallback(
    (columnName) => {
      toggleColumnVisibility(columnName);
    },
    [toggleColumnVisibility]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Trip List"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Trip',
            href: paths.dashboard.trip.root,
          },
          {
            name: 'Trip List',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {/* Table Section */}
      <Card>
        {/* filtering Tabs */}
        <Tabs
          value={filters.tripStatus}
          onChange={handleFilterTripStatus}
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
                <Label
                  variant={
                    ((tab.value === 'all' || tab.value === filters.vehicleType) && 'filled') ||
                    'soft'
                  }
                  color={tab.color}
                >
                  {tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>

        <TripTableToolbar
          filters={filters}
          onFilters={handleFilters}
          onApplyDateRange={(start, end) => setFilters({ fromDate: start, toDate: end })}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={handleToggleColumn}
          onToggleAllColumns={toggleAllColumnsVisibility}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={setSelectedVehicle}
          selectedDriver={selectedDriver}
          onSelectDriver={setSelectedDriver}
          selectedSubtrip={selectedSubtrip}
          onSelectSubtrip={setSelectedSubtrip}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
        />

        {canReset && (
          <TripTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetAll}
            results={totalCount}
            selectedDriverName={selectedDriver?.driverName}
            selectedVehicleNo={selectedVehicle?.vehicleNo}
            selectedSubtripNo={selectedSubtrip?.subtripNo}
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
                      Select all {totalCount} trips
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
                          const visibleCols = getVisibleColumnsForExport();

                          const response = await axios.get('/api/trips/export', {
                            params: {
                              tripNo: filters.tripNo || undefined,
                              driverId: filters.driverId || undefined,
                              vehicleId: filters.vehicleId || undefined,
                              subtripId: filters.subtripId || undefined,
                              fromDate: filters.fromDate || undefined,
                              toDate: filters.toDate || undefined,
                              status:
                                filters.tripStatus !== 'all' ? [filters.tripStatus] : undefined,
                              isTripSheetReady: filters.isTripSheetReady ? 'true' : undefined,
                              numberOfSubtrips: filters.numberOfSubtrips || undefined,
                              columns: visibleCols.join(','),
                            },
                            responseType: 'blob',
                          });

                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'Trips.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setIsDownloading(false);
                          toast.success('Export completed!');
                        } catch (error) {
                          console.error('Failed to download excel', error);
                          setIsDownloading(false);
                          toast.error('Failed to export trips.');
                        }
                      } else {
                        const selectedRows = tableData.filter(({ _id }) =>
                          table.selected.includes(_id)
                        );
                        const visibleCols = getVisibleColumnsForExport();
                        exportToExcel(
                          prepareDataForExport(
                            selectedRows,
                            TABLE_COLUMNS,
                            visibleCols,
                            columnOrder
                          ),
                          'Trips-selected'
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
                        const selectedRows = tableData.filter(({ _id }) =>
                          table.selected.includes(_id)
                        );
                        const visibleCols = getVisibleColumnsForExport();
                        return (
                          <TripListPdf
                            trips={selectedRows}
                            visibleColumns={visibleCols}
                            tenant={tenant}
                          />
                        );
                      })()}
                      fileName="Trip-list.pdf"
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
                headLabel={visibleHeaders}
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
                {isLoading
                  ? Array.from({ length: table.rowsPerPage }).map((_, index) => (
                      <TableSkeleton key={index} />
                    ))
                  : tableData.map((row) => (
                      <TripTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onViewRow={handleViewRow}
                        onEditRow={handleEditRow}
                        onDeleteRow={deleteTrip}
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
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </DashboardContent>
  );
}
