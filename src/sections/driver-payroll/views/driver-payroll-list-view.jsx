import { toast } from 'sonner';
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
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/utils/axios';

// _mock

import { useNavigate } from 'react-router';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components/router-link';

import { useFilters } from 'src/hooks/use-filters';
import { useBoolean } from 'src/hooks/use-boolean';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import { paramCase } from 'src/utils/change-case';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import { DashboardContent } from 'src/layouts/dashboard';
import { useDeleteDriverPayroll, usePaginatedDriverPayrolls } from 'src/query/use-driver-payroll';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import DriverSalaryLearn from '../driver-salary-learn';
import { TABLE_COLUMNS } from '../driver-payroll-list/driver-payroll-table-config';
import DriverPayrollTableRow from '../driver-payroll-list/driver-payroll-table-row';
import DriverPayrollTableToolbar from '../driver-payroll-list/driver-payroll-table-toolbar';
import DriverPayrollTableFiltersResult from '../driver-payroll-list/driver-payroll-table-filters-result';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'driver-payroll-table-columns';

const defaultFilters = {
  driverId: '',
  subtripId: '',
  paymentId: '',
  status: 'all',
  fromDate: null,
  endDate: null,
  billingFromDate: null,
  billingToDate: null,
};

// ----------------------------------------------------------------------

export function DriverPayrollListView() {
  const theme = useTheme();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'issueDate', defaultOrder: 'desc', syncToUrl: true });
  const learn = useBoolean();

  const navigate = useNavigate();

  const deleteDriverPayroll = useDeleteDriverPayroll();

  const { filters, setFilters, handleFilters, handleResetFilters, canReset } = useFilters(defaultFilters, {
    onResetPage: table.onResetPage,
  });

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedSubtrip, setSelectedSubtrip] = useState(null);

  // Clear local selected driver/subtrip when filter is removed via chips/reset
  useEffect(() => {
    if (!filters.driverId) {
      setSelectedDriver(null);
    }
  }, [filters.driverId]);

  useEffect(() => {
    if (!filters.subtripId) {
      setSelectedSubtrip(null);
    }
  }, [filters.subtripId]);

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

  const [tableData, setTableData] = useState([]);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data, isLoading } = usePaginatedDriverPayrolls({
    driverId: filters.driverId || undefined,
    subtripId: filters.subtripId || undefined,
    paymentId: filters.paymentId || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    issueFromDate: filters.fromDate || undefined,
    issueToDate: filters.endDate || undefined,
    billingFromDate: filters.billingFromDate || undefined,
    billingToDate: filters.billingToDate || undefined,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
  });

  useEffect(() => {
    // If we have selected filter objects from kanban dialogs, use their IDs for the API request.
    // The query object is handled above, but here we update tableData.
    if (data?.driverPayrolls) {
      setTableData(data.driverPayrolls);
    }
  }, [data]);

  const notFound = !isLoading && !tableData.length;

  const totals = data?.totals || {};
  const totalCount = totals.all?.count || 0;

  const getStatusLength = (status) => totals[status]?.count || 0;

  const handleEditRow = (id) => {
    navigate(paths.dashboard.driverSalary.edit(paramCase(id)));
  };

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.driverSalary.details(id));
    },
    [router]
  );

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length ? columnOrder : TABLE_COLUMNS.map((c) => c.id)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: totalCount },
    { value: 'generated', label: 'Generated', color: 'info', count: getStatusLength('generated') },
    { value: 'paid', label: 'Paid', color: 'success', count: getStatusLength('paid') },
    { value: 'cancelled', label: 'Cancelled', color: 'error', count: getStatusLength('cancelled') },
  ];

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <DashboardContent>
      <DriverSalaryLearn open={learn.value} onClose={learn.onFalse} />

      <CustomBreadcrumbs
        heading={
          <Stack direction="row" alignItems="center" spacing={1} component="span">
            <span>Payslip List</span>
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
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Driver Salary',
            href: paths.dashboard.driverSalary.root,
          },
          {
            name: 'List',
          },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.driverSalary.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Payslip
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {/* Table Section */}
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

        <DriverPayrollTableToolbar
          filters={filters}
          onFilters={handleFilters}
          onApplyDateRange={(start, end) => setFilters({ fromDate: start, endDate: end })}
          onApplyBillingDateRange={(start, end) => setFilters({ billingFromDate: start, billingToDate: end })}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={toggleColumnVisibility}
          onToggleAllColumns={toggleAllColumnsVisibility}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
          selectedDriver={selectedDriver}
          onSelectDriver={setSelectedDriver}
          selectedSubtrip={selectedSubtrip}
          onSelectSubtrip={setSelectedSubtrip}
        />

        {canReset && (
          <DriverPayrollTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={totalCount}
            selectedDriverName={selectedDriver?.driverName}
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
                      Select all {totalCount} payrolls
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

                          const response = await axios.get('/api/driverPayroll/export', {
                            params: {
                              driverId: filters.driverId || undefined,
                              subtripId: filters.subtripId || undefined,
                              paymentId: filters.paymentId || undefined,
                              status: filters.status !== 'all' ? filters.status : undefined,
                              issueFromDate: filters.fromDate || undefined,
                              issueToDate: filters.endDate || undefined,
                              billingFromDate: filters.billingFromDate || undefined,
                              billingToDate: filters.billingToDate || undefined,
                              columns: orderedIds.join(','),
                              order: table.order,
                              orderBy: table.orderBy,
                            },
                            responseType: 'blob',
                          });
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'Driver-Payrolls.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setIsDownloading(false);
                          toast.success('Export completed!');
                        } catch (error) {
                          console.error('Failed to download excel', error);
                          setIsDownloading(false);
                          toast.error('Failed to export payrolls.');
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
                          'Driver-Payroll-selected-list'
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
                {tableData.map((row) => (
                  <DriverPayrollTableRow
                    key={row._id}
                    row={row}
                    selected={table.selected.includes(row._id)}
                    onSelectRow={() => table.onSelectRow(row._id)}
                    onViewRow={() => handleViewRow(row._id)}
                    onEditRow={() => handleEditRow(row._id)}
                    onDeleteRow={() => deleteDriverPayroll(row._id)}
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
          //
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </DashboardContent>
  );
}
