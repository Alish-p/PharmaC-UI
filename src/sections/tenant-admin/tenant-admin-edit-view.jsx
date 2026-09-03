import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TenantAdminForm from './tenant-admin-form';

export default function TenantAdminEditView({ tenant, onUpdated }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={tenant?.name ? `Edit: ${tenant.name}` : 'Edit Tenant'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Tenants', href: paths.dashboard.tenants.root },
          { name: 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TenantAdminForm currentTenant={tenant} onSaved={onUpdated} />
    </DashboardContent>
  );
}
