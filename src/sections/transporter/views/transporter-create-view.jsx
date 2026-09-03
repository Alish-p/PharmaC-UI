import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TransporterNewForm from '../transporter-form';

export function TransporterCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Transporter"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Transporters List', href: paths.dashboard.transporter.list },
          { name: 'Add New Transporter' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TransporterNewForm />
    </DashboardContent>
  );
}
