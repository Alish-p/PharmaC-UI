import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PartLocationForm from '../part-location-form';

export function PartLocationCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Part Location"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Part Locations List', href: paths.dashboard.partLocation.list },
          { name: 'Add New Part Location' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PartLocationForm />
    </DashboardContent>
  );
}
