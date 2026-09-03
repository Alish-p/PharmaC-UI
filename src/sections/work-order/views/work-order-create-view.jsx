import { useSearchParams } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import WorkOrderForm from '../work-order-form';

export function WorkOrderCreateView() {
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicle');
  const vehicleNo = searchParams.get('vehicleNo');
  const vehicleType = searchParams.get('vehicleType');

  const currentWorkOrder = vehicleId
    ? {
        vehicle: {
          _id: vehicleId,
          vehicleNo: vehicleNo || '',
          vehicleType: vehicleType || '',
        },
      }
    : undefined;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create Work Order"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Work Orders', href: paths.dashboard.workOrder.list },
          { name: 'New Work Order' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <WorkOrderForm currentWorkOrder={currentWorkOrder} />
    </DashboardContent>
  );
}
