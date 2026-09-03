import { useMemo, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { useBoolean } from 'src/hooks/use-boolean';
import { useFilters } from 'src/hooks/use-filters';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import { fDateRangeShortLabel } from 'src/utils/format-time';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import { usePaginatedPartLocations } from 'src/query/use-part-location';
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

import { KanbanContactsDialog } from 'src/sections/kanban/components/kanban-contacts-dialog';

import { useTenantContext } from 'src/auth/tenant';

import PartInventoryActivityTableRow from './part-inventory-activity-table-row';
import PartInventoryActivityTableToolbar from './part-inventory-activity-table-toolbar';
import { INVENTORY_ACTIVITY_TABLE_COLUMNS } from './part-inventory-activity-table-config';
import PartInventoryActivityTableFiltersResult from './part-inventory-activity-table-filters-result';

const STORAGE_KEY = 'part-inventory-activity-table-columns';

export function PartInventoryActivityTab({ partId }) {
  const tenant = useTenantContext();

  const defaultFilters = useMemo(
    () => ({
      fromDate: null,
      toDate: null,
      type: '',
      inventoryLocation: '',
      performedBy: '',
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
  } = useColumnVisibility(INVENTORY_ACTIVITY_TABLE_COLUMNS, STORAGE_KEY);

  const dateDialog = useBoolean();
  const contactsDialog = useBoolean();

  const [performedByAssignees, setPerformedByAssignees] = useState([]);

  const { data: locationsResponse } = usePaginatedPartLocations(
    { page: 1, rowsPerPage: 1000 },
    { staleTime: 1000 * 60 * 10 }
  );

  const locations =
    locationsResponse?.locations ||
    locationsResponse?.partLocations ||
    locationsResponse?.results ||
    [];

  const { data, isLoading } = usePaginatedInventoryActivities({
    part: partId,
    fromDate: filters.fromDate ? filters.fromDate.toISOString() : undefined,
    toDate: filters.toDate ? filters.toDate.toISOString() : undefined,
    type: filters.type || undefined,
    inventoryLocation: filters.inventoryLocation || undefined,
    performedBy: filters.performedBy || undefined,
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
  };

  const performedByLabel =
    performedByAssignees[0]?.name || performedByAssignees[0]?.email || 'All users';

  const dateRangeLabel =
    filters.fromDate && filters.toDate
      ? fDateRangeShortLabel(filters.fromDate, filters.toDate)
      : 'Date range';

  const selectedLocation = locations.find((loc) => loc._id === filters.inventoryLocation) || null;

  const selectedLocationName = selectedLocation?.name || '';

  const selectedPerformedByLabel =
    filters.performedBy && performedByAssignees[0] ? performedByLabel : '';

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length
        ? columnOrder
        : INVENTORY_ACTIVITY_TABLE_COLUMNS.map((c) => c.id)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  return (
    <Card>
      <CardHeader title="Inventory Activity" />
      <Box sx={{ p: 3 }}>
        <PartInventoryActivityTableToolbar
          filters={filters}
          onFilters={handleFilters}
          locations={locations}
          dateRangeLabel={dateRangeLabel}
          onOpenDateDialog={dateDialog.onTrue}
          performedByLabel={performedByLabel}
          onOpenContactsDialog={contactsDialog.onTrue}
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
          <PartInventoryActivityTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetAllFilters}
            selectedLocationName={selectedLocationName}
            selectedPerformedByLabel={selectedPerformedByLabel}
            onClearPerformedBy={() => setPerformedByAssignees([])}
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
                      const selectedRows = tableData.filter((r) => table.selected.includes(r._id));
                      const visibleCols = getVisibleColumnsForExport();

                      exportToExcel(
                        prepareDataForExport(
                          selectedRows,
                          INVENTORY_ACTIVITY_TABLE_COLUMNS,
                          visibleCols,
                          columnOrder
                        ),
                        'part-inventory-activity-list'
                      );
                    }}
                  >
                    <Iconify icon="file-icons:microsoft-excel" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Download PDF">
                  <PDFDownloadLink
                    document={(() => {
                      const selectedRows = tableData.filter((r) => table.selected.includes(r._id));
                      const visibleCols = getVisibleColumnsForExport();
                      return (
                        <PartInventoryActivityListPdf
                          activities={selectedRows}
                          visibleColumns={visibleCols}
                          tenant={tenant}
                        />
                      );
                    })()}
                    fileName="part-inventory-activity-list.pdf"
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
                      <PartInventoryActivityTableRow
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
      </Box>
    </Card>
  );
}
