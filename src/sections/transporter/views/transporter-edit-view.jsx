import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TransporterForm from '../transporter-form';

// ----------------------------------------------------------------------

export function TransporterEditView({ transporter }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Transporter"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Transporter List',
            href: paths.dashboard.transporter.list,
          },
          { name: transporter?.transportName },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TransporterForm currentTransporter={transporter} />
    </DashboardContent>
  );
}
