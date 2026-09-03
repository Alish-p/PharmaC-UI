import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
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
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useFilters } from 'src/hooks/use-filters';
import { useBoolean } from 'src/hooks/use-boolean';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import axios from 'src/utils/axios';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import { ICONS } from 'src/assets/data/icons';
import { useVehicle } from 'src/query/use-vehicle';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTransporter } from 'src/query/use-transporter';
import { useGetTyres, useDeleteTyre } from 'src/query/use-tyre';

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

import TyreLearn from '../tyre-learn';
import TyreAnalytic from '../tyre-analytic';
import TyreTableRow from '../tyre-table-row';
import { TYRE_STATUS } from '../tyre-constants';
import TyreTableToolbar from '../tyre-table-toolbar';
import { TYRE_TABLE_COLUMNS } from '../tyre-table-config';
import TyreTableFiltersResult from '../tyre-table-filters-result';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'tyre-table-columns';

const defaultFilters = {
  serialNumber: '',
  soldTo: '',
  brand: '',
  status: 'all',
  vehicle: null,
  type: [],
  model: '',
  size: '',
  category: '',
  minKm: null,
  maxKm: null,
  minThread: null,
  maxThread: null,
  position: '',
  attachmentStatus: '',
  liveKmFreshness: '',
};

export default function TyreListView() {
  const theme = useTheme();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'serialNumber', syncToUrl: true });
  const learn = useBoolean();

  const deleteTyre = useDeleteTyre();

  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { filters, handleFilters, canReset, handleResetFilters } = useFilters(defaultFilters, {
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
  } = useColumnVisibility(TYRE_TABLE_COLUMNS, STORAGE_KEY);

  const { data, isLoading } = useGetTyres({
    page: table.page + 1,
    limit: table.rowsPerPage,
    serialNumber: filters.serialNumber || undefined,
    soldTo: filters.soldTo || undefined,
    brand: filters.brand || undefined,
    vehicleId: filters.vehicle || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    type: filters.type.length ? filters.type : undefined,
    model: filters.model || undefined,
    size: filters.size || undefined,
    category: filters.category || undefined,
    minKm: filters.minKm || undefined,
    maxKm: filters.maxKm || undefined,
    minThread: filters.minThread || undefined,
    maxThread: filters.maxThread || undefined,
    position: filters.position || undefined,
    attachmentStatus: filters.attachmentStatus || undefined,
    liveKmFreshness: filters.liveKmFreshness || undefined,
    orderBy: table.orderBy,
    order: table.order,
  });

  const { data: vehicleData } = useVehicle(filters.vehicle);
  const { data: transporterData } = useTransporter(filters.soldTo);

  const tableData = data?.tyres || data?.data || [];
  const totalCount = data?.total || 0;
  const totals = data?.totals || {};

  const getTyreLength = (status) => totals[status]?.count || 0;
  const getTotalValue = (status) => totals[status]?.value || 0;
  const getPercentByStatus = (status) =>
    totalCount ? (getTyreLength(status) / totalCount) * 100 : 0;

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: totals.all?.count || 0 },
    {
      value: TYRE_STATUS.IN_STOCK,
      label: 'In Stock',
      color: 'success',
      count: getTyreLength(TYRE_STATUS.IN_STOCK),
    },
    {
      value: TYRE_STATUS.MOUNTED,
      label: 'Mounted',
      color: 'warning',
      count: getTyreLength(TYRE_STATUS.MOUNTED),
    },
    {
      value: TYRE_STATUS.SCRAPPED,
      label: 'Scrapped',
      color: 'error',
      count: getTyreLength(TYRE_STATUS.SCRAPPED),
    },
    {
      value: TYRE_STATUS.SOLD,
      label: 'Sold',
      color: 'info',
      count: getTyreLength(TYRE_STATUS.SOLD),
    },
  ];

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.tyre.edit(id));
      console.info('EDIT', id);
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.tyre.details(id));
      console.info('VIEW', id);
    },
    [router]
  );

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length ? columnOrder : Object.keys(visibleColumns)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  const handleToggleColumn = useCallback(
    (columnName) => {
      toggleColumnVisibility(columnName);
    },
    [toggleColumnVisibility]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={
          <Stack direction="row" alignItems="center" spacing={1} component="span">
            <span>Tyre List</span>
            <IconButton color="default" onClick={learn.onTrue}>
              <Iconify icon={ICONS.tyre.bulb} />
            </IconButton>
          </Stack>
        }
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Tyre', href: paths.dashboard.tyre.root },
          { name: 'List' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              component={RouterLink}
              href={paths.dashboard.tyre.bulkImport}
              variant="outlined"
              startIcon={<Iconify icon={ICONS.common.import} />}
            >
              Import
            </Button>
            <Button
              component={RouterLink}
              href={paths.dashboard.tyre.new}
              variant="contained"
              startIcon={<Iconify icon={ICONS.common.add} />}
            >
              New Tyre
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TyreLearn open={learn.value} onClose={learn.onFalse} />

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
            <TyreAnalytic
              title="All"
              total={totals.all?.count || 0}
              percent={100}
              price={totals.all?.value || 0}
              icon={ICONS.tyre.bill}
              color={theme.palette.info.main}
            />

            <TyreAnalytic
              title="In Stock"
              total={getTyreLength(TYRE_STATUS.IN_STOCK)}
              percent={getPercentByStatus(TYRE_STATUS.IN_STOCK)}
              price={getTotalValue(TYRE_STATUS.IN_STOCK)}
              icon={ICONS.tyre.box}
              color={theme.palette.success.main}
            />

            <TyreAnalytic
              title="Mounted"
              total={getTyreLength(TYRE_STATUS.MOUNTED)}
              percent={getPercentByStatus(TYRE_STATUS.MOUNTED)}
              price={getTotalValue(TYRE_STATUS.MOUNTED)}
              icon={ICONS.tyre.wheel}
              color={theme.palette.warning.main}
            />

            <TyreAnalytic
              title="Scrapped"
              total={getTyreLength(TYRE_STATUS.SCRAPPED)}
              percent={getPercentByStatus(TYRE_STATUS.SCRAPPED)}
              price={getTotalValue(TYRE_STATUS.SCRAPPED)}
              icon={ICONS.tyre.trash}
              color={theme.palette.error.main}
            />

            <TyreAnalytic
              title="Sold"
              total={getTyreLength(TYRE_STATUS.SOLD)}
              percent={getPercentByStatus(TYRE_STATUS.SOLD)}
              price={getTotalValue(TYRE_STATUS.SOLD)}
              icon={ICONS.tyre.bill}
              color={theme.palette.info.main}
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
        <TyreTableToolbar
          filters={filters}
          onFilters={handleFilters}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={handleToggleColumn}
          onToggleAllColumns={toggleAllColumnsVisibility}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
          vehicleData={vehicleData}
          transporterData={transporterData}
          onResetFilters={handleResetFilters}
        />

        {canReset && (
          <TyreTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            //
            onResetFilters={handleResetFilters}
            //
            results={totalCount}
            selectedVehicleName={vehicleData?.vehicleNo}
            selectedTransporterName={transporterData?.transportName}
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
                      Select all {totalCount} tyres
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

                          const response = await axios.get('/api/tyre/export', {
                            params: {
                              serialNumber: filters.serialNumber || undefined,
                              soldTo: filters.soldTo || undefined,
                              brand: filters.brand || undefined,
                              vehicleId: filters.vehicle || undefined,
                              status: filters.status !== 'all' ? filters.status : undefined,
                              type: filters.type.length ? filters.type : undefined,
                              model: filters.model || undefined,
                              size: filters.size || undefined,
                              category: filters.category || undefined,
                              minKm: filters.minKm || undefined,
                              maxKm: filters.maxKm || undefined,
                              minThread: filters.minThread || undefined,
                              maxThread: filters.maxThread || undefined,
                              position: filters.position || undefined,
                              attachmentStatus: filters.attachmentStatus || undefined,
                              liveKmFreshness: filters.liveKmFreshness || undefined,
                              columns: orderedIds.join(','),
                            },
                            responseType: 'blob',
                          });
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'Tyres.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setIsDownloading(false);
                          toast.success('Export completed!');
                        } catch (error) {
                          console.error('Failed to download excel', error);
                          setIsDownloading(false);
                          toast.error('Failed to export tyres.');
                        }
                      } else {
                        const selectedRows = tableData.filter((r) =>
                          table.selected.includes(r._id)
                        );
                        const visibleCols = getVisibleColumnsForExport();
                        exportToExcel(
                          prepareDataForExport(
                            selectedRows,
                            TYRE_TABLE_COLUMNS,
                            visibleCols,
                            columnOrder
                          ),
                          'Tyres-selected-list'
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
                      <TyreTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onViewRow={() => handleViewRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onDeleteRow={() => deleteTyre.mutate(row._id)}
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
