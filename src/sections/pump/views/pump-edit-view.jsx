import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PumpForm from '../pump-form';

export function PumpEditView({ pump }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Pump"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Pump List',
            href: paths.dashboard.pump.list,
          },
          { name: pump?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PumpForm isEdit currentPump={pump} />
    </DashboardContent>
  );
}
