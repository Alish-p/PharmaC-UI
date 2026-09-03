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
import { PDFDownloadLink } from '@react-pdf/renderer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components/router-link';

import { useFilters } from 'src/hooks/use-filters';
import { useBoolean } from 'src/hooks/use-boolean';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import { paramCase } from 'src/utils/change-case';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import { DashboardContent } from 'src/layouts/dashboard';
import TransporterListPdf from 'src/pdfs/transport-list-pdf';
import { useDeleteTransporter, usePaginatedTransporters } from 'src/query/use-transporter';

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

import TransporterTableRow from '../transport-table-row';
import { TABLE_COLUMNS } from '../transporter-table-config';
import TransporterTableToolbar from '../transport-table-toolbar';
import TransporterCleanupDialog from '../cleanup/transporter-cleanup-dialog';
import TransporterTableFiltersResult from '../transporter-table-filters-result';

const STORAGE_KEY = 'transporter-table-columns';

// ----------------------------------------------------------------------

const defaultFilters = {
  search: '',
  vehicleCountMin: '',
  vehicleCountMax: '',
  state: '',
  paymentMode: '',
  gstEnabled: '',
  status: 'all',
  gstNo: '',
  panNo: '',
  vehicleId: '',
  inactiveDays: '',
};

// ----------------------------------------------------------------------

export function TransporterListView() {
  const tenant = useTenantContext();
  const theme = useTheme();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'createDate', syncToUrl: true });
  const cleanupDialog = useBoolean();
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const navigate = useNavigate();
  const deleteTransporter = useDeleteTransporter();

  const {
    filters,
    handleFilters,
    handleResetFilters: baseHandleResetFilters,
    canReset,
    setFilters,
  } = useFilters(defaultFilters, {
    onResetPage: table.onResetPage,
  });

  const handleResetFilters = useCallback(() => {
    baseHandleResetFilters();
    setSelectedVehicle(null);
  }, [baseHandleResetFilters]);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

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

  const handleToggleColumn = useCallback(
    (columnName) => {
      toggleColumnVisibility(columnName);
    },
    [toggleColumnVisibility]
  );

  const { data, isLoading } = usePaginatedTransporters({
    search: filters.search || undefined,
    vehicleCountMin: filters.vehicleCountMin || undefined,
    vehicleCountMax: filters.vehicleCountMax || undefined,
    state: filters.state || undefined,
    paymentMode: filters.paymentMode || undefined,
    gstEnabled: filters.gstEnabled ? filters.gstEnabled === 'true' : undefined,
    status: filters.status,
    gstNo: filters.gstNo || undefined,
    panNo: filters.panNo || undefined,
    vehicleId: filters.vehicleId || undefined,
    inactiveDays: filters.inactiveDays || undefined,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
  });

  useEffect(() => {
    if (data?.transporters) {
      setTableData(data.transporters);
    }
  }, [data]);

  const [tableData, setTableData] = useState([]);

  const totalCount = data?.total || 0;

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: data?.totals?.all?.count || totalCount },
    {
      value: 'active',
      label: 'Active',
      color: 'success',
      count: data?.totals?.active?.count || tableData.filter((i) => i.isActive === true).length,
    },
    {
      value: 'inactive',
      label: 'Inactive',
      color: 'error',
      count: data?.totals?.inactive?.count || tableData.filter((i) => i.isActive === false).length,
    },
  ];

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length ? columnOrder : TABLE_COLUMNS.map((c) => c.id)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  const handleEditRow = (id) => {
    navigate(paths.dashboard.transporter.edit(paramCase(id)));
  };

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.transporter.details(id));
    },
    [router]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Transporters List"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Transporters',
            href: paths.dashboard.transporter.root,
          },
          {
            name: 'Transporters List',
          },
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
              href={paths.dashboard.transporter.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Transporter
            </Button>
          </Stack>
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
        <TransporterTableToolbar
          filters={filters}
          onFilters={handleFilters}
          setFilters={setFilters}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={handleToggleColumn}
          onToggleAllColumns={toggleAllColumnsVisibility}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={setSelectedVehicle}
        />

        {canReset && (
          <TransporterTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={totalCount}
            selectedVehicleNo={selectedVehicle?.vehicleNo}
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
                      Select all {totalCount} transporters
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

                          const response = await axios.get('/api/transporters/export', {
                            params: {
                              search: filters.search || undefined,
                              vehicleCountMin: filters.vehicleCountMin || undefined,
                              vehicleCountMax: filters.vehicleCountMax || undefined,
                              state: filters.state || undefined,
                              paymentMode: filters.paymentMode || undefined,
                              gstEnabled: filters.gstEnabled
                                ? filters.gstEnabled === 'true'
                                : undefined,
                              status: filters.status,
                              gstNo: filters.gstNo || undefined,
                              panNo: filters.panNo || undefined,
                              vehicleId: filters.vehicleId || undefined,
                              inactiveDays: filters.inactiveDays || undefined,
                              columns: visibleCols.join(','),
                              order: table.order,
                              orderBy: table.orderBy,
                            },
                            responseType: 'blob',
                          });
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'Transporters.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setIsDownloading(false);
                          toast.success('Export completed!');
                        } catch (error) {
                          console.error('Failed to download excel', error);
                          setIsDownloading(false);
                          toast.error('Failed to export transporters.');
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
                          'Transporters-selected'
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
                          <TransporterListPdf
                            transporters={selectedRows}
                            visibleColumns={visibleCols}
                            tenant={tenant}
                          />
                        );
                      })()}
                      fileName="Transporter-list.pdf"
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
                {isLoading ? (
                  Array.from({ length: table.rowsPerPage }).map((_, index) => (
                    <TableSkeleton key={index} />
                  ))
                ) : (
                  <>
                    {tableData.map((row) => (
                      <TransporterTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onViewRow={() => handleViewRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onDeleteRow={() => deleteTransporter(row._id)}
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

      <TransporterCleanupDialog open={cleanupDialog.value} onClose={cleanupDialog.onFalse} />
    </DashboardContent>
  );
}
