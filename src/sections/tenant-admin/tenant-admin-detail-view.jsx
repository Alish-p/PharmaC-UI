import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Unstable_Grid2';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  useTenantPayments,
  useCreateTenantUser,
  useUpdateTenantById,
} from 'src/query/use-tenant-admin';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { HeroHeader } from 'src/components/hero-header-card';

import { DashboardTotalWidget } from 'src/sections/overview/app/app-total-widget';

import { PaymentFormDialog } from './tenant-admin-payments';
import { TenantUserFormDialog } from './tenant-admin-users';
import { TenantSubscriptionWidget } from './tenant-subscription-widget';
import { TenantSubscriptionDialog } from './tenant-subscription-dialog';

export default function TenantAdminDetailView({ tenant, users, stats }) {
  const navigate = useNavigate();
  const { addPayment, updatePayment, deletePayment } = useTenantPayments();
  const { createTenantUser } = useCreateTenantUser();
  const { updateTenantById } = useUpdateTenantById();

  const [localTenant, setLocalTenant] = useState(tenant);
  const [localUsers, setLocalUsers] = useState(users || []);
  const [formOpen, setFormOpen] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, payment: null });
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [subFormOpen, setSubFormOpen] = useState(false);

  const addr = localTenant?.address || {};
  const contact = localTenant?.contactDetails || {};
  const legal = localTenant?.legalInfo || {};
  const bank = localTenant?.bankDetails || {};

  const meta = [
    localTenant?.slug ? { icon: 'mdi:label', label: localTenant.slug } : null,
    contact?.phone ? { icon: 'mdi:phone', label: contact.phone } : null,
    contact?.email ? { icon: 'mdi:email', label: contact.email } : null,
    addr?.city || addr?.state || addr?.pincode
      ? {
          icon: 'mdi:map-marker',
          label: [addr.city, addr.state, addr.pincode].filter(Boolean).join(', '),
        }
      : null,
  ].filter(Boolean);

  const ICONS = useMemo(() => {
    const icon = (name) => (
      <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />
    );
    return {
      vehicle: icon('ic_vehicle'),
      driver: icon('ic-user'),
      customer: icon('ic_customer'),
      transporter: icon('ic_transporter'),
      subtrip: icon('ic_subtrip'),
      invoice: icon('ic-invoice'),
      users: icon('ic-user'),
    };
  }, []);

  const counts = stats?.counts || {};
  const totals = stats?.totals || {};

  return (
    <DashboardContent>
      <HeroHeader
        offsetTop={70}
        title={localTenant?.name || 'Tenant'}
        status={localTenant?.subscription?.planName || stats?.subscription?.planName || 'Active'}
        icon="solar:buildings-2-bold"
        meta={meta}
        actions={[
          {
            label: 'Edit',
            icon: 'solar:pen-bold',
            onClick: () => navigate(paths.dashboard.tenants.edit(localTenant._id)),
          },
        ]}
      />

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Subscription Widget */}
          <Grid xs={12} md={3}>
            <TenantSubscriptionWidget
              subscription={localTenant?.subscription || stats?.subscription}
              sx={{ height: 380 }}
              action={
                <IconButton onClick={() => setSubFormOpen(true)} size="small">
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
              }
            />
          </Grid>

          <Grid xs={12} md={3}>
            <Card sx={{ p: 2.5, height: 380, overflow: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Basic Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <InfoRow label="Name" value={localTenant?.name} />
              <InfoRow label="Slug" value={localTenant?.slug} />
              {localTenant?.tagline && <InfoRow label="Tagline" value={localTenant.tagline} />}
              {localTenant?.theme && <InfoRow label="Theme" value={localTenant.theme} />}
            </Card>
          </Grid>

          <Grid xs={12} md={3}>
            <Card sx={{ p: 2.5, height: 380, overflow: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Address & Contact
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <InfoRow label="Address" value={addr?.line1} />
              <InfoRow label="City" value={addr?.city} />
              <InfoRow label="State" value={addr?.state} />
              <InfoRow label="Pincode" value={addr?.pincode} />
              <InfoRow label="Email" value={contact?.email} />
              <InfoRow label="Phone" value={contact?.phone} />
              {contact?.website && <InfoRow label="Website" value={contact.website} />}
            </Card>
          </Grid>

          <Grid xs={12} md={3}>
            <Card sx={{ p: 2.5, height: 380, overflow: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Legal & Bank
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <InfoRow label="PAN" value={legal?.panNumber} />
              <InfoRow label="GSTIN" value={legal?.gstNumber} />
              <InfoRow label="Registered State" value={legal?.registeredState} />
              <Divider sx={{ my: 1.5 }} />
              <InfoRow label="Bank Name" value={bank?.bankName || bank?.name} />
              <InfoRow label="IFSC" value={bank?.ifscCode || bank?.ifsc} />
              <InfoRow label="Account No" value={bank?.accountNumber || bank?.accNo} />
            </Card>
          </Grid>

          {/* Totals (reuse DashboardTotalWidget) */}
          <Grid xs={6} sm={4} md={2}>
            <DashboardTotalWidget
              title="Drivers"
              total={counts?.drivers ?? 0}
              color="primary"
              icon={ICONS.driver}
            />
          </Grid>
          <Grid xs={6} sm={4} md={2}>
            <DashboardTotalWidget
              title="Customers"
              total={counts?.customers ?? 0}
              color="secondary"
              icon={ICONS.customer}
            />
          </Grid>
          <Grid xs={6} sm={4} md={2}>
            <DashboardTotalWidget
              title="Jobs"
              total={counts?.subtrips ?? 0}
              color="success"
              icon={ICONS.subtrip}
            />
          </Grid>
          <Grid xs={6} sm={4} md={2}>
            <DashboardTotalWidget
              title="Transporters"
              total={counts?.transporters ?? 0}
              color="warning"
              icon={ICONS.transporter}
            />
          </Grid>
          <Grid xs={6} sm={4} md={2}>
            <DashboardTotalWidget
              title="TP"
              total={counts?.transporterPayments ?? 0}
              color="error"
              icon={ICONS.invoice}
            />
          </Grid>
          <Grid xs={6} sm={4} md={2}>
            <DashboardTotalWidget
              title="Invoice Generated"
              total={totals?.invoiceGenerated ?? 0}
              color="error"
              icon={ICONS.invoice}
            />
          </Grid>

          <Grid xs={12}>
            <Card sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="h6">Payment History</Typography>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={() => {
                    setEditPayment(null);
                    setFormOpen(true);
                  }}
                >
                  Add Payment
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(localTenant?.paymentHistory || []).map((p, idx) => (
                      <TableRow key={p._id || idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{fCurrency(p.amount)}</TableCell>
                        <TableCell>{fDate(p.paymentDate)}</TableCell>
                        <TableCell>{p.paymentMethod}</TableCell>
                        <TableCell>{p.status || '-'}</TableCell>
                        <TableCell>{p.notes || '-'}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setEditPayment(p);
                              setFormOpen(true);
                            }}
                          >
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => setConfirm({ open: true, payment: p })}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!localTenant?.paymentHistory || localTenant.paymentHistory.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No payments yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* Users List */}
          <Grid xs={12}>
            <Card sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="h6">Users</Typography>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="mdi:account-plus" />}
                  onClick={() => setUserFormOpen(true)}
                >
                  Add User
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Mobile</TableCell>
                      <TableCell>Designation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(localUsers || []).map((u, idx) => (
                      <TableRow key={u._id || idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.mobile}</TableCell>
                        <TableCell>{u.designation || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {(!localUsers || localUsers.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Add/Edit Payment Dialog */}
      <PaymentFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editPayment}
        onSubmit={async (values) => {
          if (editPayment?._id) {
            const updated = await updatePayment({
              tenantId: localTenant._id,
              paymentId: editPayment._id,
              patch: values,
            });
            setLocalTenant(updated);
          } else {
            const updated = await addPayment({ tenantId: localTenant._id, payment: values });
            setLocalTenant(updated);
          }
          setFormOpen(false);
        }}
      />

      {/* Create Tenant User Dialog */}
      <TenantUserFormDialog
        open={userFormOpen}
        onClose={() => setUserFormOpen(false)}
        onSubmit={async (values) => {
          const created = await createTenantUser({ tenantId: localTenant._id, user: values });
          if (created) setLocalUsers((prev) => [...(prev || []), created]);
          setUserFormOpen(false);
        }}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, payment: null })}
        title="Delete Payment?"
        content="This will remove the payment record."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              const updated = await deletePayment({
                tenantId: localTenant._id,
                paymentId: confirm.payment._id,
              });
              setLocalTenant(updated);
              setConfirm({ open: false, payment: null });
            }}
          >
            Delete
          </Button>
        }
      />
      {/* Subscription Edit Dialog */}
      <TenantSubscriptionDialog
        open={subFormOpen}
        onClose={() => setSubFormOpen(false)}
        initial={localTenant?.subscription}
        onSubmit={async (values) => {
          const updated = await updateTenantById({
            id: localTenant._id,
            data: { subscription: values },
          });
          setLocalTenant(updated);
          setSubFormOpen(false);
        }}
      />
    </DashboardContent>
  );
}

function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <Stack direction="row" spacing={1} sx={{ py: 0.5 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 140 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {String(value)}
      </Typography>
    </Stack>
  );
}
