import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import VehicleNewForm from '../vehicle-form';

// ----------------------------------------------------------------------

export function VehicleEditView({ vehicle }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit vehicle"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Vehicle List',
            href: paths.dashboard.vehicle.list,
          },
          { name: vehicle?.vehicleNo },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VehicleNewForm currentVehicle={vehicle} />
    </DashboardContent>
  );
}
