import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import { Stack } from '@mui/material';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useFilters } from 'src/hooks/use-filters';
import { useBoolean } from 'src/hooks/use-boolean';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import axios from 'src/utils/axios';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import { DashboardContent } from 'src/layouts/dashboard';
import { useDeleteWorkOrder, usePaginatedWorkOrders } from 'src/query/use-work-order';

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

import WorkOrderLearn from '../work-order-learn';
import WorkOrderTableRow from '../work-order-table-row';
import { TABLE_COLUMNS } from '../work-order-table-config';
import WorkOrderTableToolbar from '../work-order-table-toolbar';
import { WORK_ORDER_STATUS_OPTIONS } from '../work-order-config';
import WorkOrderTableFiltersResult from '../work-order-table-filters-result';

const STORAGE_KEY = 'work-order-table-columns';

const defaultFilters = {
  status: 'all',
  priority: 'all',
  category: 'all',
  vehicleId: '',
  partId: '',
  createdBy: '',
  closedBy: '',
  issueAssignee: '',
  issue: '',
  expenseAdded: '',
  workOrderNo: '',
  startDateStart: null,
  startDateEnd: null,
  endDateStart: null,
  endDateEnd: null,
};

const STATUS_TABS = [
  { value: 'all', label: 'All', color: 'default', icon: <Iconify icon="solar:list-bold" /> },
  ...WORK_ORDER_STATUS_OPTIONS.map((status) => ({
    value: status.value,
    label: status.label,
    color: status.color,
    icon: (
      <Iconify
        icon={status.icon}
        sx={{
          color: (theme) =>
            status.color === 'default' ? 'text.secondary' : theme.palette[status.color].main,
        }}
      />
    ),
  })),
];

export function WorkOrderListView() {
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc', syncToUrl: true });
  const learn = useBoolean();

  const { filters, setFilters, handleFilters, handleResetFilters, canReset } = useFilters(defaultFilters, {
    onResetPage: table.onResetPage,
  });

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedCreatedBy, setSelectedCreatedBy] = useState(null);
  const [selectedClosedBy, setSelectedClosedBy] = useState(null);
  const [selectedIssueAssignee, setSelectedIssueAssignee] = useState(null);

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

  const { data, isLoading } = usePaginatedWorkOrders({
    status: filters.status === 'all' ? undefined : filters.status,
    priority: filters.priority === 'all' ? undefined : filters.priority,
    category: filters.category === 'all' ? undefined : filters.category,
    vehicle: filters.vehicleId || undefined,
    part: filters.partId || undefined,
    createdBy: filters.createdBy || undefined,
    closedBy: filters.closedBy || undefined,
    issueAssignee: filters.issueAssignee || undefined,
    issue: filters.issue || undefined,
    expenseAdded: filters.expenseAdded || undefined,
    workOrderNo: filters.workOrderNo || undefined,
    startDateStart: filters.startDateStart
      ? dayjs(filters.startDateStart).format('YYYY-MM-DD')
      : undefined,
    startDateEnd: filters.startDateEnd
      ? dayjs(filters.startDateEnd).format('YYYY-MM-DD')
      : undefined,
    endDateStart: filters.endDateStart
      ? dayjs(filters.endDateStart).format('YYYY-MM-DD')
      : undefined,
    endDateEnd: filters.endDateEnd ? dayjs(filters.endDateEnd).format('YYYY-MM-DD') : undefined,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
  });

  const [tableData, setTableData] = useState([]);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (data?.workOrders) {
      setTableData(data.workOrders);
    } else if (data?.results) {
      setTableData(data.results);
    } else {
      setTableData([]);
    }
  }, [data]);

  const totals = data?.totals || {};
  const totalCount = totals.all?.count || data?.total || tableData.length;
  const getWorkOrderCount = (status) => totals[status]?.count || 0;

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.workOrder.details(id));
    },
    [router]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.workOrder.edit(id));
    },
    [router]
  );

  const deleteWorkOrder = useDeleteWorkOrder();

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await deleteWorkOrder(id);
      } catch (error) {
        console.error(error);
      }
    },
    [deleteWorkOrder]
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

  const handleSelectVehicle = useCallback(
    (vehicle) => {
      setSelectedVehicle(vehicle);
      handleFilters('vehicleId', vehicle?._id || '');
    },
    [handleFilters]
  );

  const handleSelectPart = useCallback(
    (part) => {
      setSelectedPart(part);
      handleFilters('partId', part?._id || '');
    },
    [handleFilters]
  );

  useEffect(() => {
    if (!filters.vehicleId) setSelectedVehicle(null);
  }, [filters.vehicleId]);

  useEffect(() => {
    if (!filters.partId) setSelectedPart(null);
  }, [filters.partId]);

  useEffect(() => {
    if (!filters.createdBy) setSelectedCreatedBy(null);
  }, [filters.createdBy]);

  useEffect(() => {
    if (!filters.closedBy) setSelectedClosedBy(null);
  }, [filters.closedBy]);

  useEffect(() => {
    if (!filters.issueAssignee) setSelectedIssueAssignee(null);
  }, [filters.issueAssignee]);

  return (
    <DashboardContent>
      <WorkOrderLearn open={learn.value} onClose={learn.onFalse} />

      <CustomBreadcrumbs
        heading={
          <Stack direction="row" alignItems="center" spacing={1} component="span">
            <span>Work Orders</span>
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
          { name: 'Vehicle Maintenance', href: paths.dashboard.workOrder.root },
          { name: 'Work Orders' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.workOrder.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Work Order
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={filters.status}
          onChange={handleFilterStatus}
          sx={{
            px: 2.5,
          }}
        >
          {STATUS_TABS.map((tab) => {
            const count = tab.value === 'all' ? totalCount : getWorkOrderCount(tab.value);
            return (
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
                    {count}
                  </Label>
                }
              />
            );
          })}
        </Tabs>

        <WorkOrderTableToolbar
          filters={filters}
          onFilters={handleFilters}
          onApplyStartDateRange={(start, end) => setFilters({ startDateStart: start, startDateEnd: end })}
          onApplyEndDateRange={(start, end) => setFilters({ endDateStart: start, endDateEnd: end })}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={handleToggleColumn}
          onToggleAllColumns={toggleAllColumnsVisibility}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={handleSelectVehicle}
          selectedPart={selectedPart}
          onSelectPart={handleSelectPart}
          selectedCreatedBy={selectedCreatedBy}
          onSelectCreatedBy={setSelectedCreatedBy}
          selectedClosedBy={selectedClosedBy}
          onSelectClosedBy={setSelectedClosedBy}
          selectedIssueAssignee={selectedIssueAssignee}
          onSelectIssueAssignee={setSelectedIssueAssignee}
        />

        {canReset && (
          <WorkOrderTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            selectedVehicle={selectedVehicle}
            selectedPart={selectedPart}
            selectedCreatedBy={selectedCreatedBy}
            selectedClosedBy={selectedClosedBy}
            selectedIssueAssignee={selectedIssueAssignee}
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
                      Select all {totalCount} work orders
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

                          const response = await axios.get('/api/maintenance/work-orders/export', {
                            params: {
                              status: filters.status === 'all' ? undefined : filters.status,
                              priority: filters.priority === 'all' ? undefined : filters.priority,
                              category: filters.category === 'all' ? undefined : filters.category,
                              vehicle: filters.vehicleId || undefined,
                              part: filters.partId || undefined,
                              createdBy: filters.createdBy || undefined,
                              closedBy: filters.closedBy || undefined,
                              issueAssignee: filters.issueAssignee || undefined,
                              issue: filters.issue || undefined,
                              expenseAdded: filters.expenseAdded || undefined,
                              workOrderNo: filters.workOrderNo || undefined,
                              startDateStart: filters.startDateStart
                                ? dayjs(filters.startDateStart).format('YYYY-MM-DD')
                                : undefined,
                              startDateEnd: filters.startDateEnd
                                ? dayjs(filters.startDateEnd).format('YYYY-MM-DD')
                                : undefined,
                              endDateStart: filters.endDateStart
                                ? dayjs(filters.endDateStart).format('YYYY-MM-DD')
                                : undefined,
                              endDateEnd: filters.endDateEnd
                                ? dayjs(filters.endDateEnd).format('YYYY-MM-DD')
                                : undefined,
                              columns: orderedIds.join(','),
                            },
                            responseType: 'blob',
                          });
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'WorkOrders.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setIsDownloading(false);
                          toast.success('Export completed!');
                        } catch (error) {
                          console.error('Failed to download excel', error);
                          setIsDownloading(false);
                          toast.error('Failed to export work orders.');
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
                          'WorkOrders-selected-list'
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
                      <WorkOrderTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onViewRow={() => handleViewRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
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
