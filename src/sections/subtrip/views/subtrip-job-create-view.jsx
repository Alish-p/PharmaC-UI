import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SubtripJobCreateForm } from '../subtrip-job-create-form';

// ----------------------------------------------------------------------

export function SubtripJobCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create New Job"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Job List', href: paths.dashboard.subtrip.list },
          { name: 'Create Job' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <SubtripJobCreateForm />
    </DashboardContent>
  );
}
