import { useNavigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TenantAdminForm from './tenant-admin-form';

export default function TenantAdminCreateView() {
  const navigate = useNavigate();
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="New Tenant"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Tenants', href: paths.dashboard.tenants.root },
          { name: 'New' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <TenantAdminForm
        currentTenant={null}
        onSaved={(tenant) => navigate(paths.dashboard.tenants.details(tenant._id))}
      />
    </DashboardContent>
  );
}
