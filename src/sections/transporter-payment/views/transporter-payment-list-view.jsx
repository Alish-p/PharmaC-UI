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
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components/router-link';

import { useFilters } from 'src/hooks/use-filters';
import { useBoolean } from 'src/hooks/use-boolean';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import axios from 'src/utils/axios';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';
import { downloadTransporterPaymentsXml } from 'src/utils/export-transporter-payment-xml';

import { DashboardContent } from 'src/layouts/dashboard';
import TransporterPaymentListPdf from 'src/pdfs/transporter-payment-list-pdf';
import {
  useDeleteTransporterPayment,
  usePaginatedTransporterPayments,
} from 'src/query/use-transporter-payment';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
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

import TransporterPaymentLearn from '../transporter-payment-learn';
import { TABLE_COLUMNS } from '../transporter-payment-table-config';
import { getTransporterPaymentStatusColor } from '../utils/constant';
import TransporterPaymentTableRow from '../transporter-payment-list/transporter-payment-table-row';
import TransporterPaymentTableToolbar from '../transporter-payment-list/transporter-payment-table-toolbar';
import TransporterPaymentTableFiltersResult from '../transporter-payment-list/transporter-payment-table-filters-result';

const STORAGE_KEY = 'transporter-payment-table-columns';

const defaultFilters = {
  transporterId: '',
  subtripId: '',
  vehicleId: '',
  paymentId: '',
  status: 'all',
  issueFromDate: null,
  issueToDate: null,
  hasTds: '',
  hasGst: '',
};

export function TransporterPaymentListView() {
  const tenant = useTenantContext();
  const theme = useTheme();
  const router = useRouter();
  const navigate = useNavigate();
  const table = useTable({ defaultOrderBy: 'issueDate', defaultOrder: 'desc', syncToUrl: true });
  const learn = useBoolean();
  const deleteTransporterPayment = useDeleteTransporterPayment();

  const { filters, setFilters, handleFilters, handleResetFilters, canReset } = useFilters(defaultFilters);

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

  const { data, isLoading } = usePaginatedTransporterPayments({
    transporterId: filters.transporterId || undefined,
    subtripId: filters.subtripId || undefined,
    vehicleId: filters.vehicleId || undefined,
    paymentId: filters.paymentId || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    hasTds: filters.hasTds || undefined,
    hasGst: filters.hasGst || undefined,
    issueFromDate: filters.issueFromDate || undefined,
    issueToDate: filters.issueToDate || undefined,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
  });

  const [tableData, setTableData] = useState([]);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (data?.receipts) {
      setTableData(data.receipts);
    }
  }, [data]);

  const totals = data?.totals || {};
  const totalCount = totals.all?.count || 0;

  const TABS = [
    {
      value: 'all',
      label: 'All',
      color: getTransporterPaymentStatusColor('all'),
      count: totalCount,
    },
    {
      value: 'generated',
      label: 'Generated',
      color: getTransporterPaymentStatusColor('generated'),
      count: totals.generated?.count || 0,
    },
    {
      value: 'paid',
      label: 'Paid',
      color: getTransporterPaymentStatusColor('paid'),
      count: totals.paid?.count || 0,
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      color: getTransporterPaymentStatusColor('cancelled'),
      count: totals.cancelled?.count || 0,
    },
  ];

  const notFound = !isLoading && !tableData.length;

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancellationRemarks, setCancellationRemarks] = useState('');

  const handleCloseCancelDialog = () => {
    setCancelTarget(null);
    setCancellationRemarks('');
  };

  const handleConfirmCancelTransporterPayment = async () => {
    if (!cancelTarget) return;
    try {
      await deleteTransporterPayment({
        id: cancelTarget._id,
        cancellationRemarks: cancellationRemarks.trim() || undefined,
      });
      setTableData((prev) =>
        prev.map((row) =>
          row._id === cancelTarget._id
            ? { ...row, status: 'cancelled', cancellationRemarks: cancellationRemarks.trim() || undefined }
            : row
        )
      );
      handleCloseCancelDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditRow = (id) => {
    navigate(paths.dashboard.transporterPayment.edit(id));
  };

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.transporterPayment.details(id));
    },
    [router]
  );

  return (
    <DashboardContent>
      <TransporterPaymentLearn open={learn.value} onClose={learn.onFalse} />

      <CustomBreadcrumbs
        heading={
          <Stack direction="row" alignItems="center" spacing={1} component="span">
            <span>Transporter Payment List</span>
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
          { name: 'Transporter Payment', href: paths.dashboard.transporterPayment.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.transporterPayment.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Transport Payment
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={filters.status}
          onChange={(e, value) => handleFilters('status', value)}
          sx={{ px: 2.5, boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}` }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                <Label variant={tab.value === filters.status ? 'filled' : 'soft'} color={tab.color}>
                  {tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>

        <TransporterPaymentTableToolbar
          filters={filters}
          onFilters={handleFilters}
          onApplyDateRange={(start, end) => setFilters({ issueFromDate: start, issueToDate: end })}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={toggleColumnVisibility}
          onToggleAllColumns={toggleAllColumnsVisibility}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
        />

        {canReset && (
          <TransporterPaymentTableFiltersResult
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
                      Select all {totalCount} payments
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
                      const visibleCols = (
                        columnOrder && columnOrder.length
                          ? columnOrder
                          : Object.keys(visibleColumns)
                      ).filter((id) => visibleColumns[id]);

                      if (selectAllMode) {
                        try {
                          setIsDownloading(true);
                          const response = await axios.get('/api/transporter-payments/export', {
                            params: {
                              transporterId: filters.transporterId || undefined,
                              subtripId: filters.subtripId || undefined,
                              vehicleId: filters.vehicleId || undefined,
                              paymentId: filters.paymentId || undefined,
                              status: filters.status !== 'all' ? filters.status : undefined,
                              hasTds: filters.hasTds || undefined,
                              hasGst: filters.hasGst || undefined,
                              issueFromDate: filters.issueFromDate || undefined,
                              issueToDate: filters.issueToDate || undefined,
                              columns: visibleCols.join(','),
                              order: table.order,
                              orderBy: table.orderBy,
                            },
                            responseType: 'blob',
                          });

                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'TransporterPayments.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        } catch (error) {
                          console.error('Export failed:', error);
                        } finally {
                          setIsDownloading(false);
                        }
                      } else {
                        const selectedRows = tableData.filter((r) =>
                          table.selected.includes(r._id)
                        );
                        exportToExcel(
                          prepareDataForExport(
                            selectedRows,
                            TABLE_COLUMNS,
                            visibleCols,
                            columnOrder
                          ),
                          'Transporter-payment-selected'
                        );
                      }
                    }}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Iconify icon="file-icons:microsoft-excel" />
                    )}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Download PDF">
                  <span>
                    <PDFDownloadLink
                      document={(() => {
                        const selectedRows = tableData.filter((r) =>
                          table.selected.includes(r._id)
                        );
                        const visibleCols = (
                          columnOrder && columnOrder.length
                            ? columnOrder
                            : Object.keys(visibleColumns)
                        ).filter((id) => visibleColumns[id]);
                        return (
                          <TransporterPaymentListPdf
                            payments={selectedRows}
                            visibleColumns={visibleCols}
                            tenant={tenant}
                          />
                        );
                      })()}
                      fileName="Transporter-payment-list.pdf"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {({ loading }) => (
                        <IconButton color="primary" disabled={selectAllMode}>
                          <Iconify icon={loading ? 'line-md:loading-loop' : 'fa:file-pdf-o'} />
                        </IconButton>
                      )}
                    </PDFDownloadLink>
                  </span>
                </Tooltip>

                <Tooltip title="Export Tally XML">
                  <IconButton
                    color="primary"
                    onClick={async () => {
                      if (selectAllMode) {
                        try {
                          setIsDownloading(true);
                          const response = await axios.get('/api/transporter-payments', {
                            params: {
                              transporterId: filters.transporterId || undefined,
                              subtripId: filters.subtripId || undefined,
                              vehicleId: filters.vehicleId || undefined,
                              paymentId: filters.paymentId || undefined,
                              status: filters.status !== 'all' ? filters.status : undefined,
                              hasTds: filters.hasTds || undefined,
                              hasGst: filters.hasGst || undefined,
                              issueFromDate: filters.issueFromDate || undefined,
                              issueToDate: filters.issueToDate || undefined,
                              order: table.order,
                              orderBy: table.orderBy,
                              rowsPerPage: totalCount,
                              page: 1,
                            },
                          });
                          downloadTransporterPaymentsXml(
                            response.data?.receipts || [],
                            'transporter-payments-tally.xml',
                            tenant
                          );
                        } catch (error) {
                          console.error('Tally XML export failed:', error);
                        } finally {
                          setIsDownloading(false);
                        }
                      } else {
                        const selectedRows = tableData.filter((r) =>
                          table.selected.includes(r._id)
                        );
                        downloadTransporterPaymentsXml(
                          selectedRows,
                          'transporter-payments-tally.xml',
                          tenant
                        );
                      }
                    }}
                    disabled={isDownloading}
                  >
                    <Iconify icon="mdi:xml" />
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
                headLabel={[...visibleHeaders, { id: 'actions', align: 'right' }]}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onOrderChange={moveColumn}
                onSort={table.onSort}
                onSelectAllRows={(checked) => {
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row._id)
                  );
                  if (!checked) {
                    setSelectAllMode(false);
                  }
                }}
              />
              <TableBody>
                {isLoading
                  ? Array.from({ length: table.rowsPerPage }).map((_, i) => (
                      <TableSkeleton key={i} />
                    ))
                  : tableData.map((row) => (
                      <TransporterPaymentTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onViewRow={() => handleViewRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onDeleteRow={() => {
                          setCancelTarget(row);
                          setCancellationRemarks('');
                        }}
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

      {/* Cancel transporter payment dialogue (single row from list) */}
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={handleCloseCancelDialog}
        title="Cancel Transporter Payment"
        content={
          <>
            Are you sure you want to cancel transporter payment{' '}
            <strong>{cancelTarget?.paymentId || cancelTarget?._id}</strong>?
            <br />
            <br />
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={2}
              label="Cancellation remarks"
              value={cancellationRemarks}
              onChange={(event) => setCancellationRemarks(event.target.value)}
            />
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleConfirmCancelTransporterPayment}>
            Cancel Transporter Payment
          </Button>
        }
      />
    </DashboardContent>
  );
}
