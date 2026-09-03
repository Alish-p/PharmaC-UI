import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import WorkOrderForm from '../work-order-form';

export function WorkOrderEditView({ workOrder }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Work Order"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Work Orders', href: paths.dashboard.workOrder.list },
          { name: 'Edit Work Order' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <WorkOrderForm currentWorkOrder={workOrder} />
    </DashboardContent>
  );
}
