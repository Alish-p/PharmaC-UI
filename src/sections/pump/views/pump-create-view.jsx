import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PumpForm from '../pump-form';

export function PumpCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Pump"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Pump List', href: paths.dashboard.pump.list },
          { name: 'Add New Pump' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PumpForm />
    </DashboardContent>
  );
}
