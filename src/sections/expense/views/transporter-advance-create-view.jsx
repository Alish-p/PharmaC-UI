import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TransporterAdvanceCoreForm from '../transporter-advance-form';

export function TransporterAdvanceCreateView({ currentSubtrip }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Advance to Job"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Add New Advance' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TransporterAdvanceCoreForm currentSubtrip={currentSubtrip} />
    </DashboardContent>
  );
}
