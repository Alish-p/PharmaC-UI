import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import VendorForm from '../vendor-form';

export function VendorEditView({ vendor }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Vendor"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vendors List', href: paths.dashboard.vendor.list },
          { name: vendor?.name || 'Vendor' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VendorForm currentVendor={vendor} />
    </DashboardContent>
  );
}
