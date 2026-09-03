import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useFilters } from 'src/hooks/use-filters';

import axios from 'src/utils/axios';
import { fDateTime } from 'src/utils/format-time';
import { exportToExcel, prepareDataForExport } from 'src/utils/export-to-excel';

import { DashboardContent } from 'src/layouts/dashboard';
import { useDeleteUser, usePaginatedUsers } from 'src/query/use-user';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { UserTableRow } from '../user-table-row';
import { UserTableToolbar } from '../user-table-toolbar';
import { UserTableFiltersResult } from '../user-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', width: 150, sortable: true },
  { id: 'email', label: 'Email', width: 200, sortable: true },
  { id: 'mobile', label: 'Mobile', width: 100 },
  { id: 'address', label: 'Address', width: 250 },
  { id: 'designation', label: 'Designation', width: 150 },
  { id: 'lastSeen', label: 'Last seen', width: 140, sortable: true },
  { id: '', width: 20 },
];

const defaultFilters = {
  name: '',
  designation: '',
  permission: [],
};

// ----------------------------------------------------------------------

export function UserListView() {
  const table = useTable({ defaultOrderBy: 'name', defaultOrder: 'asc', syncToUrl: true });

  const router = useRouter();
  const deleteUser = useDeleteUser();

  const [selectAllMode, setSelectAllMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    filters,
    handleFilters,
    handleResetFilters: resetFilters,
    canReset,
  } = useFilters(defaultFilters, { onResetPage: table.onResetPage });

  const { data, isLoading, isError } = usePaginatedUsers({
    page: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    orderBy: table.orderBy,
    order: table.order,
    name: filters.name || undefined,
    designation: filters.designation || undefined,
    permission: (filters.permission && filters.permission.length) ? filters.permission.join(',') : undefined,
  });

  const users = data?.users;
  const totalCount = data?.total || 0;

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (users) {
      setTableData(users);
    }
  }, [users]);

  const notFound = !isLoading && !tableData.length;



  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  if (isError) {
    return <EmptyContent filled title="Something went wrong!" />;
  }

  return (
    <DashboardContent>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'User', href: paths.dashboard.user.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.user.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New user
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <UserTableToolbar filters={filters} onFilters={handleFilters} />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={resetFilters}
              totalResults={totalCount}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
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
                        Select all {totalCount} users
                      </Link>
                    )}
                </Stack>
              }
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Export to Excel">
                    <IconButton
                      color="primary"
                      disabled={isDownloading}
                      onClick={async () => {
                        if (selectAllMode) {
                          try {
                            setIsDownloading(true);
                            toast.info('Export started... Please wait.');
                            const response = await axios.get('/api/users/export', {
                              params: {
                                name: filters.name || undefined,
                                designation: filters.designation || undefined,
                                permission: (filters.permission && filters.permission.length) ? filters.permission.join(',') : undefined,
                                order: table.order,
                                orderBy: table.orderBy,
                              },
                              responseType: 'blob',
                            });
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', 'Users.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            setIsDownloading(false);
                            toast.success('Export completed!');
                          } catch (error) {
                            console.error('Failed to download excel', error);
                            setIsDownloading(false);
                            toast.error('Failed to export users.');
                          }
                        } else {
                          const selectedRows = tableData.filter(
                            (r) => table.selected.includes(r._id) || table.selected.includes(r.id)
                          );
                          exportToExcel(
                            prepareDataForExport(
                              selectedRows,
                              [
                                { id: 'name', label: 'Name', getter: (r) => r.name },
                                { id: 'email', label: 'Email', getter: (r) => r.email },
                                { id: 'mobile', label: 'Mobile', getter: (r) => r.mobile },
                                { id: 'address', label: 'Address', getter: (r) => r.address },
                                {
                                  id: 'designation',
                                  label: 'Designation',
                                  getter: (r) => r.designation,
                                },
                                {
                                  id: 'lastSeen',
                                  label: 'Last Seen',
                                  getter: (r) => r.lastSeen ? fDateTime(r.lastSeen) : 'Never',
                                },
                              ],
                              ['name', 'email', 'mobile', 'address', 'designation', 'lastSeen'],
                              []
                            ),
                            'Users-selected-list'
                          );
                        }
                      }}
                    >
                      <Iconify icon="file-icons:microsoft-excel" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
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
                        <UserTableRow
                          key={row._id}
                          row={row}
                          selected={table.selected.includes(row._id)}
                          onSelectRow={() => table.onSelectRow(row._id)}
                          onDeleteRow={() => deleteUser(row._id)}
                          onEditRow={() => handleEditRow(row._id)}
                        />
                      ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, totalCount)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={totalCount}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

  );
}
