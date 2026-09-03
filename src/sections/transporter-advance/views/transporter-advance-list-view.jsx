import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

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
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components/router-link';

import { useFilters } from 'src/hooks/use-filters';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import axios from 'src/utils/axios';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';
import { downloadTransporterAdvancesXml } from 'src/utils/export-transporter-advance-xml';

import { useVehicle } from 'src/query/use-vehicle';
import { useSubtrip } from 'src/query/use-subtrip';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  usePaginatedAdvances,
  useDeleteTransporterAdvance,
} from 'src/query/use-transporter-advance';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  GenericTableRow,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { useTenantContext } from 'src/auth/tenant';

import { TABLE_COLUMNS } from '../transporter-advance-table-config';
import ExpenseAnalytic from '../../expense/expense-list/expense-analytic';
import TransporterAdvanceTableToolbar from './transporter-advance-table-toolbar';
import TransporterAdvanceTableFiltersResult from './transporter-advance-table-filters-result';

const STORAGE_KEY = 'advance-table-columns';

const defaultFilters = {
  vehicleId: '',
  subtripId: '',
  pumpId: '',
  transporterId: '',
  tripId: '',
  vehicleType: '',
  advanceCategory: 'all',
  advanceType: [],
  fromDate: null,
  endDate: null,
  status: 'all',
};

export default function TransporterAdvanceListView() {
  const tenant = useTenantContext();
  const theme = useTheme();
  const table = useTable({ syncToUrl: true });
  const navigate = useNavigate();
  const deleteAdvance = useDeleteTransporterAdvance();

  const { filters, setFilters, handleFilters, handleResetFilters, canReset } = useFilters(defaultFilters, {
    onResetPage: table.onResetPage,
  });

  const [selectedTransporter, setSelectedTransporter] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedSubtrip, setSelectedSubtrip] = useState(null);
  const [selectedPump, setSelectedPump] = useState(null);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: vehicleData } = useVehicle(filters.vehicleId);
  const { data: subtripData } = useSubtrip(filters.subtripId);

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

  const { data, isLoading } = usePaginatedAdvances({
    vehicleId: filters.vehicleId || undefined,
    subtripId: filters.subtripId || undefined,
    pumpId: filters.pumpId || undefined,
    transporterId: filters.transporterId || undefined,
    tripId: filters.tripId || undefined,
    vehicleType: filters.vehicleType || undefined,
    advanceType: filters.advanceType.length ? filters.advanceType : undefined,
    startDate: filters.fromDate || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    endDate: filters.endDate || undefined,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (data?.advances) {
      setTableData(data.advances);
    }
  }, [data]);

  const totals = data?.totals || {};
  const totalCount = data?.total || 0;
  const notFound = (!tableData.length && canReset) || !tableData.length;

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: totals.countGiven || 0 },
    { value: 'Recovered', label: 'Recovered', color: 'success', count: totals.countRecovered || 0 },
    { value: 'Pending', label: 'Pending', color: 'warning', count: totals.countPending || 0 },
  ];

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  useEffect(() => {
    if (!filters.transporterId) setSelectedTransporter(null);
  }, [filters.transporterId]);

  useEffect(() => {
    if (!filters.vehicleId) setSelectedVehicle(null);
  }, [filters.vehicleId]);

  useEffect(() => {
    if (!filters.pumpId) setSelectedPump(null);
  }, [filters.pumpId]);

  useEffect(() => {
    if (!filters.subtripId) setSelectedSubtrip(null);
  }, [filters.subtripId]);

  useEffect(() => {
    if (vehicleData?._id) {
      setSelectedVehicle(vehicleData);
    }
  }, [vehicleData]);

  useEffect(() => {
    if (subtripData?._id) {
      setSelectedSubtrip(subtripData);
    }
  }, [subtripData]);

  const getVisibleColumnsForExport = () =>
    (columnOrder && columnOrder.length ? columnOrder : TABLE_COLUMNS.map((c) => c.id)).filter(
      (id) => visibleColumns[id]
    );

  const handleEditRow = (id) => {
    navigate(paths.dashboard.expense.edit(id)); // Assuming edit uses the same form logic
  };

  const handleDeleteRow = (row) => {
    if (row.status === 'Recovered') {
      toast.error('Cannot delete a recovered advance.');
      return;
    }
    deleteAdvance(row._id);
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Transporter Advances"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Transporter Advances' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.expense.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Advance
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: { xs: 3, md: 5 } }}>
        <Scrollbar>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2 }}
          >
            <ExpenseAnalytic
              title="Total Given"
              total={totalCount}
              percent={100}
              price={totals.totalGiven || 0}
              icon="solar:bill-list-bold-duotone"
              color={theme.palette.info.main}
              loading={isLoading}
            />
            <ExpenseAnalytic
              title="Total Recovered"
              total={tableData.filter((d) => d.status === 'Recovered').length} // Approximate count from current page
              percent={totals.totalGiven ? (totals.totalRecovered / totals.totalGiven) * 100 : 0}
              price={totals.totalRecovered || 0}
              icon="solar:check-circle-bold-duotone"
              color={theme.palette.success.main}
              loading={isLoading}
            />
            <ExpenseAnalytic
              title="Total Pending"
              total={tableData.filter((d) => d.status === 'Pending').length}
              percent={totals.totalGiven ? (totals.totalPending / totals.totalGiven) * 100 : 0}
              price={totals.totalPending || 0}
              icon="solar:clock-circle-bold-duotone"
              color={theme.palette.warning.main}
              loading={isLoading}
            />
          </Stack>
        </Scrollbar>
      </Card>

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
                <Label
                  variant={
                    ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                  }
                  color={tab.color}
                >
                  {tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>

        <TransporterAdvanceTableToolbar
          filters={filters}
          onFilters={handleFilters}
          onApplyDateRange={(start, end) => setFilters({ fromDate: start, endDate: end })}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={toggleColumnVisibility}
          onToggleAllColumns={toggleAllColumnsVisibility}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
          selectedTransporter={selectedTransporter}
          onSelectTransporter={setSelectedTransporter}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={setSelectedVehicle}
          selectedSubtrip={selectedSubtrip}
          onSelectSubtrip={setSelectedSubtrip}
          selectedPump={selectedPump}
          onSelectPump={setSelectedPump}
        />

        {canReset && (
          <TransporterAdvanceTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={() => {
              handleResetFilters();
              setSelectedTransporter(null);
              setSelectedVehicle(null);
              setSelectedSubtrip(null);
              setSelectedPump(null);
              setSelectAllMode(false);
              table.setSelected([]);
            }}
            results={totalCount}
            selectedTransporterName={selectedTransporter?.transportName}
            selectedVehicleNo={selectedVehicle?.vehicleNo}
            selectedSubtripNo={selectedSubtrip?.subtripNo}
            selectedPumpName={selectedPump?.name}
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
                      Select all {totalCount} advances
                    </Link>
                  )}
              </Stack>
            }
            action={
              <Stack direction="row">
                <Tooltip title="Download XML">
                  <IconButton
                    color="primary"
                    onClick={() => {
                      const selectedRows = tableData.filter((r) =>
                        table.selected.includes(r._id)
                      );
                      const supportedRows = selectedRows.filter((r) =>
                        ['Diesel', 'Trip Advance'].some(
                          (type) => type.toLowerCase() === (r.advanceType || '').toLowerCase()
                        )
                      );
                      if (supportedRows.length === 0) {
                        toast.error('No supported advances (Diesel, Trip Advance) selected for XML export.');
                        return;
                      }

                      const missingTransporter = supportedRows.some(
                        (r) => !r.vehicleId?.transporter?.transportName
                      );
                      if (missingTransporter) {
                        toast.error('Some selected advances are missing the Transporter Name. Please configure transporters before exporting.');
                        return;
                      }

                      if (supportedRows.length < selectedRows.length) {
                        toast.warning(
                          `Exporting ${supportedRows.length} of ${selectedRows.length} selected advances (only Diesel and Trip Advance are supported).`
                        );
                      }
                      const fileName =
                        supportedRows.length === 1
                          ? `${supportedRows[0].advanceType || 'advance'}-${supportedRows[0]._id.slice(-6)}.xml`
                          : `transporter-advances-${supportedRows.length}.xml`;
                      downloadTransporterAdvancesXml(supportedRows, fileName, tenant);
                    }}
                    disabled={selectAllMode}
                  >
                    <Iconify icon="mdi:file-xml-box" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Download Excel">
                  <IconButton
                    color="primary"
                    onClick={async () => {
                      if (selectAllMode) {
                        try {
                          setIsDownloading(true);
                          toast.info('Export started... Please wait.');

                          const orderedIds = getVisibleColumnsForExport();
                          const response = await axios.get('/api/transporter-advances/export', {
                            params: {
                              subtripId: filters.subtripId || undefined,
                              vehicleId: filters.vehicleId || undefined,
                              transporterId: filters.transporterId || undefined,
                              pumpId: filters.pumpId || undefined,
                              advanceType: filters.advanceType.length
                                ? filters.advanceType
                                : undefined,
                              startDate: filters.fromDate || undefined,
                              endDate: filters.endDate || undefined,
                              status: filters.status !== 'all' ? filters.status : undefined,
                              columns: orderedIds.join(','),
                            },
                            responseType: 'blob',
                          });

                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'TransporterAdvances.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);

                          toast.success('Export completed!');
                        } catch (error) {
                          console.error('Failed to download excel', error);
                          toast.error('Failed to export advances.');
                        } finally {
                          setIsDownloading(false);
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
                          'Advances-selected-list'
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
                headLabel={visibleHeaders}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onOrderChange={moveColumn}
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
                {isLoading ? (
                  Array.from({ length: table.rowsPerPage }).map((_, index) => (
                    <TableSkeleton key={index} />
                  ))
                ) : (
                  <>
                    {tableData.map((row) => (
                      <GenericTableRow
                        key={row._id}
                        row={row}
                        columns={TABLE_COLUMNS}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onEditRow={
                          row.status === 'Pending' ? () => handleEditRow(row._id) : undefined
                        }
                        onDeleteRow={
                          row.status === 'Pending' ? () => handleDeleteRow(row) : undefined
                        }
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
