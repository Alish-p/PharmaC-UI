import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useMemo, useState, useEffect, useCallback } from 'react';

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
// @mui
import useMediaQuery from '@mui/material/useMediaQuery';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useFilters } from 'src/hooks/use-filters';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSystemFeatures } from 'src/hooks/use-system-features';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import axios from 'src/utils/axios';
import { paramCase } from 'src/utils/change-case';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import { ICONS } from 'src/assets/data/icons';
import VehicleListPdf from 'src/pdfs/vehicle-list-pdf';
import { DashboardContent } from 'src/layouts/dashboard';
import { VEHICLE_MODES } from 'src/constants/vehicle-mode';
import { useDeleteVehicle, useUpdateVehicle, usePaginatedVehicles } from 'src/query/use-vehicle';

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

import VehicleLearn from '../vehicle-learn';
import VehicleTableRow from '../vehicle-table-row';
import { TABLE_COLUMNS } from '../vehicle-table-config';
import VehicleTableToolbar from '../vehicle-table-toolbar';
import VehicleCleanupDialog from '../cleanup/vehicle-cleanup-dialog';
import VehicleTableFiltersResult from '../vehicle-table-filters-result';

const STORAGE_KEY = 'vehicle-table-columns';

const defaultFilters = {
  vehicleNo: '',
  transporter: '',
  vehicleType: '',
  noOfTyres: '',
  isOwn: 'all',
  isActive: '',
};

export function VehicleListView() {
  const tenant = useTenantContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const navigate = useNavigate();
  const deleteVehicle = useDeleteVehicle();
  const updateVehicle = useUpdateVehicle();
  const table = useTable({ syncToUrl: true });
  const cleanupDialog = useBoolean();
  const learn = useBoolean();

  // Use custom filters hook
  const {
    filters,
    handleFilters,
    handleResetFilters: resetFilters,
    canReset,
  } = useFilters(defaultFilters);

  const [selectedTransporter, setSelectedTransporter] = useState(null);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { vehicleMode } = useSystemFeatures();
  const managesMarketVehicles = vehicleMode !== VEHICLE_MODES.OWN_ONLY;

  const tableColumns = useMemo(() => {
    if (vehicleMode !== VEHICLE_MODES.OWN_ONLY) return TABLE_COLUMNS;
    return TABLE_COLUMNS.filter((c) => c.id !== 'transporter' && c.id !== 'isOwn');
  }, [vehicleMode]);

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
  } = useColumnVisibility(tableColumns, STORAGE_KEY);

  const { data, isLoading } = usePaginatedVehicles({
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    vehicleNo: filters.vehicleNo || undefined,
    vehicleType: filters.vehicleType || undefined,
    noOfTyres: filters.noOfTyres || undefined,
    transporter: filters.transporter || undefined,
    isOwn: filters.isOwn === 'all' ? undefined : filters.isOwn === 'own',
    isActive: filters.isActive || undefined,
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (data?.results) setTableData(data.results);
  }, [data]);

  const totalCount = data?.total || 0;

  // Handlers
  const handleFilterOwnership = useCallback(
    (event, newValue) => handleFilters('isOwn', newValue),
    [handleFilters]
  );

  const handleSelectTransporter = useCallback(
    (transporter) => {
      setSelectedTransporter(transporter);
      handleFilters('transporter', transporter._id);
    },
    [handleFilters]
  );

  const handleClearTransporter = useCallback(() => {
    setSelectedTransporter(null);
    handleFilters('transporter', '');
  }, [handleFilters]);

  const handleResetAll = useCallback(() => {
    resetFilters();
    setSelectedTransporter(null);
  }, [resetFilters]);

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length ? columnOrder : tableColumns.map((c) => c.id)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  // Render tabs
  const renderTabs = () => {
    const TABS = [
      { value: 'all', label: 'All', color: 'default', count: data?.total },
      { value: 'own', label: 'Own', color: 'primary', count: data?.totalOwnVehicle },
    ];
    if (managesMarketVehicles) {
      TABS.push({
        value: 'market',
        label: 'Market',
        color: 'secondary',
        count: data?.totalMarketVehicle,
      });
    }

    return (
      <Tabs
        value={filters.isOwn}
        onChange={handleFilterOwnership}
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
                <Label variant={tab.value === filters.isOwn ? 'filled' : 'soft'} color={tab.color}>
                  {tab.count}
                </Label>
              )
            }
          />
        ))}
      </Tabs>
    );
  };

  return (
    <DashboardContent>
      <VehicleLearn open={learn.value} onClose={learn.onFalse} />

      <CustomBreadcrumbs
        heading={
          <Stack direction="row" alignItems="center" spacing={1} component="span">
            <span>Vehicle List</span>
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
          { name: 'Vehicle', href: paths.dashboard.vehicle.root },
          { name: 'Vehicle List' },
        ]}
        action={
          <Stack
            direction="row"
            spacing={isMobile ? 0.5 : 1}
            flexWrap="wrap"
            useFlexGap
            justifyContent={{ xs: 'flex-end', sm: 'flex-start' }}
          >
            {isMobile ? (
              /* ── Mobile: icon-only buttons with tooltips ── */
              <>
                <Tooltip title="Cleanup">
                  <IconButton
                    color="warning"
                    onClick={cleanupDialog.onTrue}
                    sx={{
                      border: 1,
                      borderColor: 'warning.main',
                      borderRadius: 1,
                      p: 0.75,
                    }}
                  >
                    <Iconify icon="mdi:broom" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Import KM">
                  <IconButton
                    component={RouterLink}
                    href={paths.dashboard.vehicle.bulkKmImport}
                    color="primary"
                    sx={{
                      border: 1,
                      borderColor: 'primary.main',
                      borderRadius: 1,
                      p: 0.75,
                    }}
                  >
                    <Iconify icon={ICONS.common.import} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="New Vehicle">
                  <IconButton
                    component={RouterLink}
                    href={paths.dashboard.vehicle.new}
                    color="primary"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: 1,
                      p: 0.75,
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    <Iconify icon="mingcute:add-line" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              /* ── Desktop: full text buttons ── */
              <>
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
                  href={paths.dashboard.vehicle.bulkKmImport}
                  variant="outlined"
                  color="primary"
                  startIcon={<Iconify icon={ICONS.common.import} />}
                >
                  Import KM
                </Button>

                <Button
                  component={RouterLink}
                  href={paths.dashboard.vehicle.new}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  New Vehicle
                </Button>
              </>
            )}
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        {renderTabs()}

        <VehicleTableToolbar
          filters={filters}
          onFilters={handleFilters}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={toggleColumnVisibility}
          onToggleAllColumns={toggleAllColumnsVisibility}
          selectedTransporter={selectedTransporter}
          onSelectTransporter={handleSelectTransporter}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
          tableColumns={tableColumns}
          managesMarketVehicles={managesMarketVehicles}
        />

        {canReset && (
          <VehicleTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetAll}
            selectedTransporterName={selectedTransporter?.transportName}
            onRemoveTransporter={handleClearTransporter}
            results={data?.total}
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
                      Select all {totalCount} vehicles
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

                          const response = await axios.get('/api/vehicles/export', {
                            params: {
                              vehicleNo: filters.vehicleNo || undefined,
                              vehicleType: filters.vehicleType || undefined,
                              noOfTyres: filters.noOfTyres || undefined,
                              transporter: filters.transporter || undefined,
                              isOwn: filters.isOwn === 'all' ? undefined : filters.isOwn === 'own',
                              isActive: filters.isActive || undefined,
                              columns: orderedIds.join(','),
                            },
                            responseType: 'blob',
                          });
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'Vehicles.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setIsDownloading(false);
                          toast.success('Export completed!');
                        } catch (error) {
                          console.error('Failed to download excel', error);
                          setIsDownloading(false);
                          toast.error('Failed to export vehicles.');
                        }
                      } else {
                        const selectedRows = tableData.filter((r) =>
                          table.selected.includes(r._id)
                        );
                        const visibleCols = getVisibleColumnsForExport();

                        exportToExcel(
                          prepareDataForExport(
                            selectedRows,
                            tableColumns,
                            visibleCols,
                            columnOrder
                          ),
                          'Vehicles-selected-list'
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
                          <VehicleListPdf
                            vehicles={selectedRows}
                            visibleColumns={visibleCols}
                            tenant={tenant}
                          />
                        );
                      })()}
                      fileName="Vehicle-list.pdf"
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
                {isLoading
                  ? Array.from({ length: table.rowsPerPage }).map((_, i) => (
                      <TableSkeleton key={i} />
                    ))
                  : tableData.map((row) => (
                      <VehicleTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onViewRow={() => router.push(paths.dashboard.vehicle.details(row._id))}
                        onEditRow={() => navigate(paths.dashboard.vehicle.edit(paramCase(row._id)))}
                        onDeleteRow={() => deleteVehicle(row._id)}
                        onToggleActive={(id, newStatus) =>
                          updateVehicle({ id, data: { isActive: newStatus } })
                        }
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

      <VehicleCleanupDialog open={cleanupDialog.value} onClose={cleanupDialog.onFalse} />
    </DashboardContent>
  );
}
