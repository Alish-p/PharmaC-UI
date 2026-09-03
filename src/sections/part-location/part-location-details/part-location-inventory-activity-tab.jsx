import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useBoolean } from 'src/hooks/use-boolean';
import { useFilters } from 'src/hooks/use-filters';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import axios from 'src/utils/axios';
import { fDateRangeShortLabel } from 'src/utils/format-time';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import { usePaginatedInventoryActivities } from 'src/query/use-inventory-activity';
import PartInventoryActivityListPdf from 'src/pdfs/part-inventory-activity-list-pdf';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DATE_RANGE_PRESETS, CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { KanbanPartsDialog } from 'src/sections/kanban/components/kanban-parts-dialog';
import { KanbanContactsDialog } from 'src/sections/kanban/components/kanban-contacts-dialog';

import { useTenantContext } from 'src/auth/tenant';

import PartLocationInventoryActivityTableRow from './part-location-inventory-activity-table-row';
import PartLocationInventoryActivityTableToolbar from './part-location-inventory-activity-table-toolbar';
import { PART_LOCATION_INVENTORY_ACTIVITY_TABLE_COLUMNS } from './part-location-inventory-activity-table-config';
import PartLocationInventoryActivityTableFiltersResult from './part-location-inventory-activity-table-filters-result';

const STORAGE_KEY = 'part-location-inventory-activity-table-columns';

export function PartLocationInventoryActivityTab({ locationId, locationName }) {
  const tenant = useTenantContext();

  const defaultFilters = useMemo(
    () => ({
      fromDate: null,
      toDate: null,
      type: '',
      performedBy: '',
      part: '',
    }),
    []
  );

  const table = useTable({
    defaultOrderBy: 'activityDate',
    defaultRowsPerPage: 10,
  });

  const { filters, setFilters, handleFilters, handleResetFilters, canReset } = useFilters(defaultFilters, {
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
  } = useColumnVisibility(PART_LOCATION_INVENTORY_ACTIVITY_TABLE_COLUMNS, STORAGE_KEY);

  const dateDialog = useBoolean();
  const contactsDialog = useBoolean();
  const partsDialog = useBoolean();

  const [performedByAssignees, setPerformedByAssignees] = useState([]);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  const { data, isLoading } = usePaginatedInventoryActivities({
    inventoryLocation: locationId,
    fromDate: filters.fromDate ? filters.fromDate.toISOString() : undefined,
    toDate: filters.toDate ? filters.toDate.toISOString() : undefined,
    type: filters.type || undefined,
    performedBy: filters.performedBy || undefined,
    part: filters.part || undefined,
    limit: table.rowsPerPage,
    skip: table.page * table.rowsPerPage,
  });

  const activities = data?.activities || data?.results || data?.rows || [];
  const totalCount =
    data?.total || data?.count || data?.pagination?.total || (isLoading ? 0 : activities.length);

  const tableData = activities;

  const handleChangeStartDate = (date) => {
    handleFilters('fromDate', date);
  };

  const handleChangeEndDate = (date) => {
    handleFilters('toDate', date);
  };

  const handleResetAllFilters = () => {
    handleResetFilters();
    setPerformedByAssignees([]);
    setSelectedPart(null);
  };

  const performedByLabel =
    performedByAssignees[0]?.name || performedByAssignees[0]?.email || 'All users';

  const dateRangeLabel =
    filters.fromDate && filters.toDate
      ? fDateRangeShortLabel(filters.fromDate, filters.toDate)
      : 'Date range';

  const selectedPerformedByLabel =
    filters.performedBy && performedByAssignees[0] ? performedByLabel : '';

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length
        ? columnOrder
        : PART_LOCATION_INVENTORY_ACTIVITY_TABLE_COLUMNS.map((c) => c.id)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  return (
    <Card>
      <CardHeader title={`Inventory Activity - ${locationName}`} />
      <Box sx={{ p: 3 }}>
        <PartLocationInventoryActivityTableToolbar
          filters={filters}
          onFilters={handleFilters}
          dateRangeLabel={dateRangeLabel}
          onOpenDateDialog={dateDialog.onTrue}
          performedByLabel={performedByLabel}
          onOpenContactsDialog={contactsDialog.onTrue}
          onOpenPartsDialog={partsDialog.onTrue}
          selectedPart={selectedPart}
          onResetFilters={handleResetAllFilters}
          canReset={canReset}
          visibleColumns={visibleColumns}
          disabledColumns={disabledColumns}
          onToggleColumn={toggleColumnVisibility}
          onToggleAllColumns={toggleAllColumnsVisibility}
          onResetColumns={resetColumns}
          canResetColumns={canResetColumns}
        />

        {canReset && (
          <PartLocationInventoryActivityTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetAllFilters}
            selectedPerformedByLabel={selectedPerformedByLabel}
            onClearPerformedBy={() => setPerformedByAssignees([])}
            selectedPart={selectedPart}
            onClearPart={() => setSelectedPart(null)}
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
                      Select all {totalCount} activities
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

                          const response = await axios.get('/api/maintenance/part-stock/export', {
                            params: {
                              inventoryLocation: locationId,
                              fromDate: filters.fromDate
                                ? filters.fromDate.toISOString()
                                : undefined,
                              toDate: filters.toDate ? filters.toDate.toISOString() : undefined,
                              type: filters.type || undefined,
                              performedBy: filters.performedBy || undefined,
                              part: filters.part || undefined,
                              columns: orderedIds.join(','),
                            },
                            responseType: 'blob',
                          });
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'InventoryActivities.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setIsDownloading(false);
                          toast.success('Export completed!');
                        } catch (error) {
                          console.error('Failed to download excel', error);
                          setIsDownloading(false);
                          toast.error('Failed to export inventory activities.');
                        }
                      } else {
                        const selectedRows = tableData.filter((r) =>
                          table.selected.includes(r._id)
                        );
                        const visibleCols = getVisibleColumnsForExport();

                        exportToExcel(
                          prepareDataForExport(
                            selectedRows,
                            PART_LOCATION_INVENTORY_ACTIVITY_TABLE_COLUMNS,
                            visibleCols,
                            columnOrder
                          ),
                          'part-location-inventory-activity-list'
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
                          <PartInventoryActivityListPdf
                            activities={selectedRows}
                            visibleColumns={visibleCols}
                            tenant={tenant}
                          />
                        );
                      })()}
                      fileName="part-location-inventory-activity-list.pdf"
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
                headLabel={visibleHeaders}
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
                      <PartLocationInventoryActivityTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        visibleColumns={visibleColumns}
                        disabledColumns={disabledColumns}
                        columnOrder={columnOrder}
                      />
                    ))}
                <TableNoData notFound={!tableData.length && !isLoading} />
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

        <CustomDateRangePicker
          open={dateDialog.value}
          presets={DATE_RANGE_PRESETS}
          variant="calendar"
          onClose={dateDialog.onFalse}
          startDate={filters.fromDate}
          endDate={filters.toDate}
          onChangeStartDate={handleChangeStartDate}
          onChangeEndDate={handleChangeEndDate}
          onApplyRange={(start, end) => setFilters({ fromDate: start, toDate: end })}
        />

        <KanbanContactsDialog
          open={contactsDialog.value}
          onClose={contactsDialog.onFalse}
          assignees={performedByAssignees}
          onAssigneeChange={(newAssignees) => {
            setPerformedByAssignees(newAssignees);
            const selected = newAssignees[0];
            handleFilters('performedBy', selected?._id || '');
            if (contactsDialog.value) {
              contactsDialog.onFalse();
            }
          }}
          single
        />

        <KanbanPartsDialog
          open={partsDialog.value}
          onClose={partsDialog.onFalse}
          selectedPart={selectedPart}
          onPartChange={(part) => {
            setSelectedPart(part);
            handleFilters('part', part?._id || '');
          }}
          hideQuantity
          hideCustomItem
        />
      </Box>
    </Card>
  );
}
