import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PartForm from '../part-form';

export function PartCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Part"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Parts List', href: paths.dashboard.part.list },
          { name: 'Add New Part' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PartForm />
    </DashboardContent>
  );
}
