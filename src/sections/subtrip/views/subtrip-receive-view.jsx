import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SubtripReceiveForm } from '../subtrip-receive-form';

export function SubtripReceiveView({ currentSubtrip }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={currentSubtrip ? `Receive Job ${currentSubtrip._id}` : 'Receive Job'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Job List', href: paths.dashboard.subtrip.list },
          { name: 'Receive Job' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <SubtripReceiveForm currentSubtrip={currentSubtrip} />
    </DashboardContent>
  );
}
