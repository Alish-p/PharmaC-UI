import { useNavigate } from 'react-router';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useState, useEffect, useCallback } from 'react';

// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useFilters } from 'src/hooks/use-filters';
import { useColumnVisibility } from 'src/hooks/use-column-visibility';

import { paramCase } from 'src/utils/change-case';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import { DashboardContent } from 'src/layouts/dashboard';
import CustomerListPdf from 'src/pdfs/customer-list-pdf';
import { useDeleteCustomer, usePaginatedCustomers } from 'src/query/use-customer';

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

import CustomerTableRow from '../customer-table-row';
import { TABLE_COLUMNS } from '../customer-table-config';
import CustomerTableToolbar from '../customer-table-toolbar';
import CustomerTableFiltersResult from '../customer-table-filters-result';

const STORAGE_KEY = 'customer-table-columns';

// ----------------------------------------------------------------------

const defaultFilters = {
  customerName: '',
  cellNo: '',
  gstIn: '',
  gstEnabled: '',
};

// ----------------------------------------------------------------------

export function CustomerListView() {
  const tenant = useTenantContext();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'createDate', syncToUrl: true });
  const confirm = useBoolean();

  const navigate = useNavigate();
  const deleteCustomer = useDeleteCustomer();

  const { filters, handleFilters, handleResetFilters, canReset } = useFilters(defaultFilters, {
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
  } = useColumnVisibility(TABLE_COLUMNS, STORAGE_KEY);

  const { data, isLoading } = usePaginatedCustomers({
    customerName: filters.customerName || undefined,
    cellNo: filters.cellNo || undefined,
    gstIn: filters.gstIn || undefined,
    gstEnabled: filters.gstEnabled ? filters.gstEnabled === 'true' : undefined,
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (data?.customers) {
      setTableData(data.customers);
    }
  }, [data]);

  const totalCount = data?.total || 0;

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const getVisibleColumnsForExport = () => {
    const orderedIds = (
      columnOrder && columnOrder.length ? columnOrder : TABLE_COLUMNS.map((c) => c.id)
    ).filter((id) => visibleColumns[id]);
    return orderedIds;
  };

  const handleEditRow = (id) => {
    navigate(paths.dashboard.customer.edit(paramCase(id)));
  };

  const handleDeleteRows = useCallback(() => {}, []);

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.customer.details(id));
    },
    [router]
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Customers List"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Customers',
              href: paths.dashboard.customer.root,
            },
            {
              name: 'Customers List',
            },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.customer.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Customer
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Table Section */}
        <Card>
          <CustomerTableToolbar
            filters={filters}
            onFilters={handleFilters}
            visibleColumns={visibleColumns}
            disabledColumns={disabledColumns}
            onToggleColumn={toggleColumnVisibility}
            onToggleAllColumns={toggleAllColumnsVisibility}
            onResetColumns={resetColumns}
            canResetColumns={canResetColumns}
          />

          {canReset && (
            <CustomerTableFiltersResult
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
                          'Customers-selected'
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
                          <CustomerListPdf
                            customers={selectedRows}
                            visibleColumns={visibleCols}
                            tenant={tenant}
                          />
                        );
                      })()}
                      fileName="Customer-list.pdf"
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
                        <CustomerTableRow
                          key={row._id}
                          row={row}
                          selected={table.selected.includes(row._id)}
                          onSelectRow={() => table.onSelectRow(row._id)}
                          onViewRow={() => handleViewRow(row._id)}
                          onEditRow={() => handleEditRow(row._id)}
                          onDeleteRow={() => deleteCustomer(row._id)}
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

      {/* Delete Confirmations dialogue */}
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong>
            items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}
