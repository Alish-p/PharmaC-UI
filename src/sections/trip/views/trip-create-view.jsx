import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TripNewForm from '../trip-form';

export function TripCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Trip"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Trips List', href: paths.dashboard.trip.list },
          { name: 'Add New Trip' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TripNewForm />
    </DashboardContent>
  );
}
