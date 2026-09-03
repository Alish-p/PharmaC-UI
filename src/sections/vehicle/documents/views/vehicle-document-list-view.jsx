import { useNavigate } from 'react-router';
import { useState, useCallback } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import { Stack } from '@mui/material';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';

import { useFilters } from 'src/hooks/use-filters';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import GenericListPdf from 'src/pdfs/generic-list-pdf';
import { DashboardContent } from 'src/layouts/dashboard';
import { usePaginatedDocuments, useDeleteVehicleDocument } from 'src/query/use-documents';

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

import { TABLE_COLUMNS } from '../vehicle-document-table-config';
import VehicleDocumentTableRow from '../vehicle-document-table-row';
import VehicleDocumentTableToolbar from '../vehicle-document-table-toolbar';
import { VehicleDocumentGridContent } from '../components/vehicle-document-grid-view';
import VehicleDocumentTableFiltersResult from '../vehicle-document-table-filters-result';

const STORAGE_KEY = 'vehicle-documents-table-columns';

const defaultFilters = {
  status: 'all', // expiring | missing | expired | valid | all
  vehicleId: '',
  docType: '',
  docNumber: '',
  issuer: '',
  issueFrom: null,
  issueTo: null,
  expiryFrom: null,
  expiryTo: null,
  days: '', // expiring window (optional)
  hasAttachment: '',
};

export function VehicleDocumentListView() {
  const theme = useTheme();
  const tenant = useTenantContext();
  const navigate = useNavigate();
  const table = useTable({
    defaultOrderBy: 'expiryDate',
    defaultOrder: 'asc',
    syncToUrl: true,
  });
  const [view, setView] = useState('list');

  const { filters, setFilters, handleFilters, handleResetFilters, canReset } = useFilters(defaultFilters, {
    onResetPage: table.onResetPage,
  });

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const del = useDeleteVehicleDocument();

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

  const { data, isLoading } = usePaginatedDocuments(
    {
      page: table.page + 1,
      rowsPerPage: table.rowsPerPage,
      status: filters.status !== 'all' ? filters.status : undefined,
      vehicleId: filters.vehicleId || undefined,
      docType: filters.docType || undefined,
      docNumber: filters.docNumber || undefined,
      issuer: filters.issuer || undefined,
      issueFrom: filters.issueFrom || undefined,
      issueTo: filters.issueTo || undefined,
      expiryFrom: filters.expiryFrom || undefined,
      expiryTo: filters.expiryTo || undefined,
      days: filters.days || undefined,
      hasAttachment: filters.hasAttachment || undefined,
      orderBy: table.orderBy || undefined,
      order: table.order || undefined,
    },
    { enabled: view === 'list' }
  );

  const tableData = data?.results || [];
  const totalCount = data?.total ?? data?.docsTotal ?? 0;

  const handleFilterStatus = useCallback(
    (event, newValue) => handleFilters('status', newValue),
    [handleFilters]
  );

  const handleSelectVehicle = useCallback(
    (vehicle) => {
      setSelectedVehicle(vehicle);
      handleFilters('vehicleId', vehicle?._id || '');
    },
    [handleFilters]
  );

  const handleClearVehicle = useCallback(() => {
    setSelectedVehicle(null);
    handleFilters('vehicleId', '');
  }, [handleFilters]);

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length ? columnOrder : TABLE_COLUMNS.map((c) => c.id)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  const handleUploadClick = () => {
    const qs = selectedVehicle?._id ? `?vehicleId=${selectedVehicle._id}` : '';
    navigate(`${paths.dashboard.vehicle.newDocument}${qs}`);
  };

  const handleDeleteRow = useCallback(
    async (row) => {
      const vehicleId = row?.vehicleId || row?.vehicle?._id || row?.vehicle;
      if (vehicleId && row?._id) {
        await del({ vehicleId, docId: row._id });
      }
    },
    [del]
  );

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: totalCount },
    { value: 'valid', label: 'Valid', color: 'success', count: data?.totalValid || 0 },
    { value: 'expiring', label: 'Expiring', color: 'warning', count: data?.totalExpiring || 0 },
    { value: 'expired', label: 'Expired', color: 'error', count: data?.totalExpired || 0 },
    { value: 'missing', label: 'Missing', color: 'info', count: data?.totalMissing || 0 },
  ];

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Vehicle Documents"
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
            <Button
              variant="contained"
              startIcon={<Iconify icon="bytesize:upload" />}
              onClick={handleUploadClick}
              size="small"
            >
              Upload
            </Button>

            <ToggleButtonGroup
              exclusive
              size="small"
              value={view}
              onChange={(_e, v) => v && setView(v)}
            >
              <ToggleButton value="list" aria-label="List view">
                <Iconify icon="material-symbols:list-rounded" />
              </ToggleButton>
              <ToggleButton value="grid" aria-label="Grid view">
                <Iconify icon="ph:dots-nine-bold" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        }
        sx={{ mb: { xs: 1, md: 1 } }}
      />

      {view === 'list' ? (
        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{ px: 2.5, boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}` }}
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

          <VehicleDocumentTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onApplyIssueDateRange={(start, end) => setFilters({ issueFrom: start, issueTo: end })}
            onApplyExpiryDateRange={(start, end) => setFilters({ expiryFrom: start, expiryTo: end })}
            visibleColumns={visibleColumns}
            disabledColumns={disabledColumns}
            onToggleColumn={toggleColumnVisibility}
            onToggleAllColumns={toggleAllColumnsVisibility}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={handleSelectVehicle}
            onResetColumns={resetColumns}
            canResetColumns={canResetColumns}
          />

          {canReset && (
            <VehicleDocumentTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={() => {
                handleResetFilters();
                setSelectedVehicle(null);
              }}
              selectedVehicleNo={selectedVehicle?.vehicleNo}
              onRemoveVehicle={handleClearVehicle}
              results={totalCount}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row._id)
                )
              }
              action={
                <Stack direction="row">
                  <Tooltip title="Download Excel">
                    <IconButton
                      color="primary"
                      onClick={() => {
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
                          'Documents-selected-list'
                        );
                      }}
                    >
                      <Iconify icon="file-icons:microsoft-excel" />
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
                          <GenericListPdf
                            title="Vehicle Documents"
                            rows={selectedRows}
                            columns={TABLE_COLUMNS}
                            orientation="landscape"
                            tenant={tenant}
                            visibleColumns={visibleCols}
                          />
                        );
                      })()}
                      fileName="Vehicle-documents-list.pdf"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {({ loading }) => (
                        <IconButton color="primary">
                          <Iconify icon={loading ? 'line-md:loading-loop' : 'fa:file-pdf-o'} />
                        </IconButton>
                      )}
                    </PDFDownloadLink>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={[...visibleHeaders, { id: 'actions', label: 'Actions', align: 'right' }]}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
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
                    ? Array.from({ length: table.rowsPerPage }).map((_, i) => (
                      <TableSkeleton key={i} />
                    ))
                    : tableData.map((row) => (
                      <VehicleDocumentTableRow
                        key={row._id || `${row.vehicle?._id || row.vehicle}-${row.docType}`}
                        row={row}
                        selected={row._id ? table.selected.includes(row._id) : false}
                        onSelectRow={() => row._id && table.onSelectRow(row._id)}
                        onDeleteRow={handleDeleteRow}
                        visibleColumns={visibleColumns}
                        disabledColumns={disabledColumns}
                        columnOrder={columnOrder}
                      />
                    ))}
                  <TableNoData notFound={!tableData.length && canReset} />
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
      ) : (
        <VehicleDocumentGridContent />
      )}
    </DashboardContent>
  );
}
