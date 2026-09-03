import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Link from '@mui/material/Link';
import { Stack } from '@mui/material';
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
import { useDeletePurchaseOrder, usePaginatedPurchaseOrders } from 'src/query/use-purchase-order';

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

import PurchaseOrderLearn from '../purchase-order-learn';
import { TABLE_COLUMNS } from '../purchase-order-table-config';
import PurchaseOrderTableRow from '../purchase-order-table-row';
import PurchaseOrderTableToolbar from '../purchase-order-table-toolbar';
import PurchaseOrderTableFiltersResult from '../purchase-order-table-filters-result';

const STORAGE_KEY = 'purchase-order-table-columns';

const defaultFilters = {
  status: 'all',
  vendorId: '',
  partId: '',
  fromDate: null,
  toDate: null,
  partLocationId: '',
  createdBy: '',
  approvedBy: '',
  purchaseOrderNo: '',
  vendorInvoiceNo: '',
};

const STATUS_TABS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'pending-approval', label: 'Pending Approval', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'info' },
  { value: 'partial-received', label: 'Partially Received', color: 'warning' },
  { value: 'received', label: 'Received', color: 'success' },
  { value: 'closed', label: 'Closed', color: 'default' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
];

export function PurchaseOrderListView() {
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc', syncToUrl: true });
  const learn = useBoolean();

  const { filters, setFilters, handleFilters, handleResetFilters, canReset } = useFilters(defaultFilters, {
    onResetPage: table.onResetPage,
  });

  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [selectedCreatedBy, setSelectedCreatedBy] = useState(null);
  const [selectedApprovedBy, setSelectedApprovedBy] = useState(null);

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

  const { data, isLoading } = usePaginatedPurchaseOrders({
    status: filters.status === 'all' ? undefined : filters.status,
    vendor: filters.vendorId || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    part: filters.partId || undefined,
    partLocation: filters.partLocationId || undefined,
    createdBy: filters.createdBy || undefined,
    approvedBy: filters.approvedBy || undefined,
    purchaseOrderNo: filters.purchaseOrderNo || undefined,
    vendorInvoiceNo: filters.vendorInvoiceNo || undefined,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
  });

  const [tableData, setTableData] = useState([]);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (data?.purchaseOrders) {
      setTableData(data.purchaseOrders);
    } else if (data?.results) {
      setTableData(data.results);
    } else {
      setTableData([]);
    }
  }, [data]);

  const totalCount = data?.total || tableData.length;
  const totals = data?.totals || {};

  const statusTotalsKeyMap = {
    all: 'all',
    'pending-approval': 'pendingApproval',
    approved: 'approved',
    purchased: 'purchased',
    'partial-received': 'partialReceived',
    received: 'received',
    rejected: 'rejected',
  };

  const getStatusCount = (value) => {
    const key = statusTotalsKeyMap[value];
    if (!key) return 0;
    return totals[key]?.count || 0;
  };

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.purchaseOrder.details(id));
    },
    [router]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.purchaseOrder.edit(id));
    },
    [router]
  );

  const deletePurchaseOrder = useDeletePurchaseOrder();

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await deletePurchaseOrder(id);
      } catch (error) {
        console.error(error);
      }
    },
    [deletePurchaseOrder]
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

  const handleSelectPart = useCallback(
    (part) => {
      setSelectedPart(part);
      handleFilters('partId', part?._id || '');
    },
    [handleFilters]
  );

  useEffect(() => {
    if (!filters.partId) setSelectedPart(null);
  }, [filters.partId]);

  useEffect(() => {
    if (!filters.vendorId) setSelectedVendor(null);
  }, [filters.vendorId]);

  useEffect(() => {
    if (!filters.createdBy) setSelectedCreatedBy(null);
  }, [filters.createdBy]);

  useEffect(() => {
    if (!filters.approvedBy) setSelectedApprovedBy(null);
  }, [filters.approvedBy]);



  return (
    <DashboardContent>
      <PurchaseOrderLearn open={learn.value} onClose={learn.onFalse} />

      <CustomBreadcrumbs
        heading={
          <Stack direction="row" alignItems="center" spacing={1} component="span">
            <span>Purchase Orders</span>
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
          { name: 'Vehicle Maintenance', href: paths.dashboard.purchaseOrder.root },
          { name: 'Purchase Orders' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.purchaseOrder.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Purchase Order
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
          {STATUS_TABS.map((tab) => (
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
                  {getStatusCount(tab.value)}
                </Label>
              }
            />
          ))}
        </Tabs>

        <PurchaseOrderTableToolbar
          filters={filters}
          onFilters={handleFilters}
          onApplyDateRange={(start, end) => setFilters({ fromDate: start, toDate: end })}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={handleToggleColumn}
          onToggleAllColumns={toggleAllColumnsVisibility}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
          selectedPart={selectedPart}
          onSelectPart={handleSelectPart}
          selectedVendor={selectedVendor}
          onSelectVendor={setSelectedVendor}
          selectedCreatedBy={selectedCreatedBy}
          onSelectCreatedBy={setSelectedCreatedBy}
          selectedApprovedBy={selectedApprovedBy}
          onSelectApprovedBy={setSelectedApprovedBy}
        />

        {canReset && (
          <PurchaseOrderTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            selectedPart={selectedPart}
            selectedVendor={selectedVendor}
            selectedCreatedBy={selectedCreatedBy}
            selectedApprovedBy={selectedApprovedBy}
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
                      Select all {totalCount} purchase orders
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

                          const response = await axios.get(
                            '/api/maintenance/purchase-orders/export',
                            {
                              params: {
                                status: filters.status === 'all' ? undefined : filters.status,
                                vendor: filters.vendorId || undefined,
                                fromDate: filters.fromDate || undefined,
                                toDate: filters.toDate || undefined,
                                part: filters.partId || undefined,
                                partLocation: filters.partLocationId || undefined,
                                createdBy: filters.createdBy || undefined,
                                approvedBy: filters.approvedBy || undefined,
                                purchaseOrderNo: filters.purchaseOrderNo || undefined,
                                vendorInvoiceNo: filters.vendorInvoiceNo || undefined,
                                columns: orderedIds.join(','),
                                order: table.order,
                                orderBy: table.orderBy,
                              },
                              responseType: 'blob',
                            }
                          );
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'PurchaseOrders.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setIsDownloading(false);
                          toast.success('Export completed!');
                        } catch (error) {
                          console.error('Failed to download excel', error);
                          setIsDownloading(false);
                          toast.error('Failed to export purchase orders.');
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
                          'PurchaseOrders-selected-list'
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
                      <PurchaseOrderTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onViewRow={() => handleViewRow(row._id)}
                        onEditRow={
                          row.status === 'pending-approval'
                            ? () => handleEditRow(row._id)
                            : undefined
                        }
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
