import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import DriverForm from '../driver-form';

export function DriverCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Driver"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Drivers List', href: paths.dashboard.driver.list },
          { name: 'Add New Driver' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <DriverForm />
    </DashboardContent>
  );
}
