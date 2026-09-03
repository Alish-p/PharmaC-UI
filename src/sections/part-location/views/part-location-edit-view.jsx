import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PartLocationForm from '../part-location-form';

export function PartLocationEditView({ partLocation }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Part Location"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Part Locations List', href: paths.dashboard.partLocation.list },
          { name: partLocation?.name || 'Part Location' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PartLocationForm currentPartLocation={partLocation} />
    </DashboardContent>
  );
}
