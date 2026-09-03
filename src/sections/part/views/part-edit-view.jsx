import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PartForm from '../part-form';

export function PartEditView({ part }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Part"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Parts List', href: paths.dashboard.part.list },
          { name: part?.name || 'Part' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PartForm currentPart={part} />
    </DashboardContent>
  );
}
