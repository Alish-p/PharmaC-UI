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
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// @mui
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
import { postInvoicesToTally, downloadInvoicesXml } from 'src/utils/export-invoice-xml';

import InvoiceListPdf from 'src/pdfs/invoice-list-pdf';
import { DashboardContent } from 'src/layouts/dashboard';
import { useCancelInvoice, usePaginatedInvoices } from 'src/query/use-invoice';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { useTenantContext } from 'src/auth/tenant';

import InvoiceLearn from '../invoice-learn';
import { TABLE_COLUMNS } from '../invoice-table-config';
import InvoiceAnalytic from '../invoice-list/invoice-analytic';
import InvoiceTableRow from '../invoice-list/invoice-table-row';
import InvoiceTableToolbar from '../invoice-list/invoice-table-toolbar';
import { INVOICE_STATUS, INVOICE_STATUS_COLOR } from '../invoice-config';
import InvoiceTableFiltersResult from '../invoice-list/invoice-table-filters-result';

const STORAGE_KEY = 'invoice-table-columns';

// ----------------------------------------------------------------------

const defaultFilters = {
  customerId: '',
  subtripId: '',
  invoiceNo: '',
  invoiceStatus: 'all',
  fromDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export function InvoiceListView() {
  const theme = useTheme();
  const router = useRouter();
  const navigate = useNavigate();
  const tenant = useTenantContext();

  const cancelInvoice = useCancelInvoice();
  const table = useTable({ defaultOrderBy: 'issueDate', defaultOrder: 'desc', syncToUrl: true });
  const learn = useBoolean();

  const { filters, setFilters, handleFilters, handleResetFilters, canReset } = useFilters(defaultFilters, {
    onResetPage: table.onResetPage,
  });

  const [selectedSubtrip, setSelectedSubtrip] = useState(null);
  // Clear local selected subtrip when filter is removed via chips/reset
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
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancellationRemarks, setCancellationRemarks] = useState('');
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data, isLoading } = usePaginatedInvoices({
    customerId: filters.customerId || undefined,
    subtripId: filters.subtripId || undefined,
    invoiceStatus: filters.invoiceStatus !== 'all' ? filters.invoiceStatus : undefined,
    issueFromDate: filters.fromDate || undefined,
    issueToDate: filters.endDate || undefined,
    invoiceNo: filters.invoiceNo || undefined,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
  });

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length ? columnOrder : Object.keys(visibleColumns)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  useEffect(() => {
    if (data?.invoices) {
      setTableData(data.invoices);
    }
  }, [data]);

  const notFound = !isLoading && !tableData.length;

  const totals = data?.totals || {};
  const totalCount = totals.all?.count || 0;

  const getInvoiceLength = (invoiceStatus) => totals[invoiceStatus]?.count || 0;

  const getTotalAmount = (invoiceStatus) => totals[invoiceStatus]?.amount || 0;

  const getPercentByInvoiceStatus = (invoiceStatus) =>
    totalCount ? (getInvoiceLength(invoiceStatus) / totalCount) * 100 : 0;

  const getStatusThemeColor = (status) => theme.palette[INVOICE_STATUS_COLOR[status]]?.main;

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: totalCount },
    {
      value: INVOICE_STATUS.PENDING,
      label: INVOICE_STATUS.PENDING,
      color: INVOICE_STATUS_COLOR[INVOICE_STATUS.PENDING],
      count: getInvoiceLength(INVOICE_STATUS.PENDING),
    },
    {
      value: INVOICE_STATUS.PARTIAL_RECEIVED,
      label: INVOICE_STATUS.PARTIAL_RECEIVED,
      color: INVOICE_STATUS_COLOR[INVOICE_STATUS.PARTIAL_RECEIVED],
      count: getInvoiceLength(INVOICE_STATUS.PARTIAL_RECEIVED),
    },

    {
      value: INVOICE_STATUS.CANCELLED,
      label: INVOICE_STATUS.CANCELLED,
      color: INVOICE_STATUS_COLOR[INVOICE_STATUS.CANCELLED],
      count: getInvoiceLength(INVOICE_STATUS.CANCELLED),
    },
    {
      value: INVOICE_STATUS.RECEIVED,
      label: INVOICE_STATUS.RECEIVED,
      color: INVOICE_STATUS_COLOR[INVOICE_STATUS.RECEIVED],
      count: getInvoiceLength(INVOICE_STATUS.RECEIVED),
    },
  ];

  const handleEditRow = (id) => {
    navigate(paths.dashboard.invoice.edit(id));
  };

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.details(id));
    },
    [router]
  );

  const handleFilterInvoiceStatus = useCallback(
    (event, newValue) => {
      handleFilters('invoiceStatus', newValue);
    },
    [handleFilters]
  );

  const handleCloseCancelDialog = () => {
    setCancelTarget(null);
    setCancellationRemarks('');
  };

  const handleConfirmCancelInvoice = async () => {
    if (!cancelTarget) return;
    try {
      await cancelInvoice({ id: cancelTarget._id, cancellationRemarks });
      handleCloseCancelDialog();
    } catch (error) {
      // Error toast is handled inside useCancelInvoice
      // Keep dialog open so user can retry or adjust remarks
      console.error(error);
    }
  };

  return (
    <>
      <DashboardContent>
        <InvoiceLearn open={learn.value} onClose={learn.onFalse} />

        <CustomBreadcrumbs
          heading={
            <Stack direction="row" alignItems="center" spacing={1} component="span">
              <span>Invoice List</span>
              <IconButton
                color="default"
                onClick={learn.onTrue}
                sx={{
                  color: 'warning.main',
                  animation: 'pulseGlow 2s ease-in-out infinite',
                  '@keyframes pulseGlow': {
                    '0%, 100%': {
                      transform: 'scale(1)',
                      filter: 'drop-shadow(0 0 0px transparent)',
                    },
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
              name: 'Invoice',
              href: paths.dashboard.invoice.root,
            },
            {
              name: 'Invoice List',
            },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.invoice.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Invoice
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
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
              <InvoiceAnalytic
                title="All"
                total={totalCount}
                percent={100}
                price={totals.all?.amount || 0}
                icon="mdi:clipboard-list-outline"
                color={theme.palette.info.main}
              />

              <InvoiceAnalytic
                title={INVOICE_STATUS.PENDING}
                total={getInvoiceLength(INVOICE_STATUS.PENDING)}
                percent={getPercentByInvoiceStatus(INVOICE_STATUS.PENDING)}
                price={getTotalAmount(INVOICE_STATUS.PENDING)}
                icon="mdi:clock-outline"
                color={getStatusThemeColor(INVOICE_STATUS.PENDING)}
              />

              <InvoiceAnalytic
                title={INVOICE_STATUS.PARTIAL_RECEIVED}
                total={getInvoiceLength(INVOICE_STATUS.PARTIAL_RECEIVED)}
                percent={getPercentByInvoiceStatus(INVOICE_STATUS.PARTIAL_RECEIVED)}
                price={getTotalAmount(INVOICE_STATUS.PARTIAL_RECEIVED)}
                icon="mdi:clock-check-outline"
                color={getStatusThemeColor(INVOICE_STATUS.PARTIAL_RECEIVED)}
              />

              <InvoiceAnalytic
                title={INVOICE_STATUS.CANCELLED}
                total={getInvoiceLength(INVOICE_STATUS.CANCELLED)}
                percent={getPercentByInvoiceStatus(INVOICE_STATUS.CANCELLED)}
                price={getTotalAmount(INVOICE_STATUS.CANCELLED)}
                icon="mdi:close-circle-outline"
                color={getStatusThemeColor(INVOICE_STATUS.CANCELLED)}
              />

              <InvoiceAnalytic
                title={INVOICE_STATUS.RECEIVED}
                total={getInvoiceLength(INVOICE_STATUS.RECEIVED)}
                percent={getPercentByInvoiceStatus(INVOICE_STATUS.RECEIVED)}
                price={getTotalAmount(INVOICE_STATUS.RECEIVED)}
                icon="mdi:check-decagram-outline"
                color={getStatusThemeColor(INVOICE_STATUS.RECEIVED)}
              />
            </Stack>
          </Scrollbar>
        </Card>

        {/* Table Section */}
        <Card>
          {/* filtering Tabs */}
          <Tabs
            value={filters.invoiceStatus}
            onChange={handleFilterInvoiceStatus}
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
                      ((tab.value === 'all' || tab.value === filters.invoiceStatus) && 'filled') ||
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

          <InvoiceTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onApplyDateRange={(start, end) => setFilters({ fromDate: start, endDate: end })}
            visibleColumns={visibleColumns}
            disabledColumns={disabledColumns}
            onToggleColumn={toggleColumnVisibility}
            onToggleAllColumns={toggleAllColumnsVisibility}
            selectedSubtrip={selectedSubtrip}
            onSelectSubtrip={setSelectedSubtrip}
            onResetColumns={resetColumns}
            canResetColumns={canResetColumns}
          />

          {canReset && (
            <InvoiceTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={totalCount}
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
                        Select all {totalCount} invoices
                      </Link>
                    )}
                </Stack>
              }
              action={
                <Stack direction="row">
                  {/* Download XML of selected invoices */}
                  <Tooltip title="Download XML">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        const selectedRows = tableData.filter((r) =>
                          table.selected.includes(r._id)
                        );
                        if (selectedRows.length === 0) return;
                        const fileName =
                          selectedRows.length === 1
                            ? `${selectedRows[0].invoiceNo || 'invoice'}.xml`
                            : `invoices-${selectedRows.length}.xml`;
                        downloadInvoicesXml(selectedRows, fileName, tenant);
                      }}
                      disabled={selectAllMode} // Creating XML for ALL invoices might be too heavy/not supported yet
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
                            const orderedIds = (
                              columnOrder && columnOrder.length
                                ? columnOrder
                                : Object.keys(visibleColumns)
                            ).filter((id) => visibleColumns[id]);

                            const response = await axios.get('/api/invoices/export', {
                              params: {
                                customerId: filters.customerId || undefined,
                                subtripId: filters.subtripId || undefined,
                                invoiceStatus:
                                  filters.invoiceStatus !== 'all'
                                    ? filters.invoiceStatus
                                    : undefined,
                                issueFromDate: filters.fromDate || undefined,
                                issueToDate: filters.endDate || undefined,
                                invoiceNo: filters.invoiceNo || undefined,
                                columns: orderedIds.join(','),
                                order: table.order,
                                orderBy: table.orderBy,
                              },
                              responseType: 'blob',
                            });
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', 'Invoices.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            setIsDownloading(false);
                            toast.success('Export completed!');
                          } catch (error) {
                            console.error('Failed to download excel', error);
                            setIsDownloading(false);
                            toast.error('Failed to export invoices.');
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
                            'Invoices-selected-list'
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

                  <Tooltip title="Download PDF">
                    <PDFDownloadLink
                      document={(() => {
                        const selectedRows = tableData.filter((r) =>
                          table.selected.includes(r._id)
                        );
                        const visibleCols = getVisibleColumnsForExport();
                        return (
                          <InvoiceListPdf
                            invoices={selectedRows}
                            visibleColumns={visibleCols}
                            tenant={tenant}
                          />
                        );
                      })()}
                      fileName="Invoice-list.pdf"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {({ loading }) => (
                        <IconButton color="primary" disabled={selectAllMode}>
                          <Iconify icon={loading ? 'line-md:loading-loop' : 'fa:file-pdf-o'} />
                        </IconButton>
                      )}
                    </PDFDownloadLink>
                  </Tooltip>

                  {tenant?.integrations?.accounting?.enabled && (
                    <Tooltip title="Push to Tally (XML)">
                      <IconButton
                        color="primary"
                        disabled={selectAllMode}
                        onClick={async () => {
                          const selectedRows = tableData.filter((r) =>
                            table.selected.includes(r._id)
                          );
                          if (selectedRows.length === 0) return;

                          await toast.promise(
                            (async () => {
                              const res = await postInvoicesToTally(selectedRows, tenant, {
                                // When set in prod to 'http://localhost:9000', it targets user machine
                                tallyUrl: 'http://localhost:9000' || undefined,
                              });
                              if (!res.ok) {
                                // Try to surface useful errors from Tally response when available
                                const msg = res.text || `HTTP ${res.status}`;
                                throw new Error(
                                  `Failed to push to Tally. ${msg.includes('LINEERROR') ? msg : msg}`
                                );
                              }
                              return res.text || 'Uploaded';
                            })(),
                            {
                              loading:
                                selectedRows.length === 1
                                  ? `Sending ${selectedRows[0].invoiceNo || 'invoice'} to Tally...`
                                  : `Sending ${selectedRows.length} invoices to Tally...`,
                              success: (text) =>
                                text && /CREATED|IMPORTED|ALTERED/i.test(text)
                                  ? 'Tally: Import succeeded'
                                  : 'Sent to Tally',
                              error: (err) => err.message || 'Failed to push to Tally',
                            }
                          );
                        }}
                      >
                        <Iconify icon="mdi:cloud-upload-outline" />
                      </IconButton>
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
                    <InvoiceTableRow
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
          />
        </Card>
      </DashboardContent>

      {/* Cancel invoice dialogue (single row from list) */}
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={handleCloseCancelDialog}
        title="Cancel invoice"
        content={
          <>
            Are you sure you want to cancel invoice{' '}
            <strong>{cancelTarget?.invoiceNo || cancelTarget?._id}</strong>?
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
          <Button variant="contained" color="error" onClick={handleConfirmCancelInvoice}>
            Cancel invoice
          </Button>
        }
      />
    </>
  );
}
