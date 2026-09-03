import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { useDeleteTenant, usePaginatedTenants } from 'src/query/use-tenant-admin';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import TenantAdminTableRow from './tenant-admin-table-row';
import { TENANT_TABLE_HEADERS } from './tenant-admin-table-config';

export default function TenantAdminListView() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const params = useMemo(
    () => ({ search: search || undefined, page: page + 1, limit: rowsPerPage }),
    [search, page, rowsPerPage]
  );

  const { data, isLoading } = usePaginatedTenants(params);
  const { deleteTenant } = useDeleteTenant();

  const tenants = data?.tenants || [];
  const total = data?.total || 0;

  const [confirm, setConfirm] = useState({ open: false, id: null });
  const handleDelete = (id) => setConfirm({ open: true, id });
  const closeConfirm = () => setConfirm({ open: false, id: null });
  const confirmDelete = async () => {
    await deleteTenant(confirm.id);
    closeConfirm();
  };

  // Reset to first page when search changes
  useEffect(() => {
    setPage(0);
  }, [search]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Tenants"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Tenants' }]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => navigate(paths.dashboard.tenants.new)}
          >
            New Tenant
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 1 }}>
          <TextField
            fullWidth
            label="Search tenants"
            placeholder="Name, slug, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Stack>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHeadCustom headLabel={TENANT_TABLE_HEADERS} />

              <TableBody>
                {isLoading
                  ? Array.from({ length: rowsPerPage }).map((_, idx) => <TableSkeleton key={idx} />)
                  : tenants.map((t) => (
                      <TenantAdminTableRow
                        key={t._id}
                        row={t}
                        onViewRow={() => navigate(paths.dashboard.tenants.details(t._id))}
                        onEditRow={() => navigate(paths.dashboard.tenants.edit(t._id))}
                        onDeleteRow={() => handleDelete(t._id)}
                      />
                    ))}
                <TableNoData notFound={!isLoading && tenants.length === 0} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          sx={{ mt: 1 }}
        />
      </Card>

      <ConfirmDialog
        open={confirm.open}
        onClose={closeConfirm}
        title="Delete Tenant?"
        content="This will remove the tenant. This action does not cascade to related records."
        action={
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}
