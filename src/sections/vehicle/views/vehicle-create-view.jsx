import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import VehicleNewForm from '../vehicle-form';

export function VehicleCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Vehicle"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vehicles List', href: paths.dashboard.vehicle.list },
          { name: 'Add New Vehicle' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VehicleNewForm />
    </DashboardContent>
  );
}
