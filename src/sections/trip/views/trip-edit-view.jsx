import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TripForm from '../trip-form';

// ----------------------------------------------------------------------

export function TripEditView({ trip }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Trip"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Trip List',
            href: paths.dashboard.trip.list,
          },
          { name: trip?.tripNo },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TripForm currentTrip={trip} />
    </DashboardContent>
  );
}
