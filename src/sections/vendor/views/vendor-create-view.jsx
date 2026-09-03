import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import VendorForm from '../vendor-form';

export function VendorCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Vendor"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vendors List', href: paths.dashboard.vendor.list },
          { name: 'Add New Vendor' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VendorForm />
    </DashboardContent>
  );
}
