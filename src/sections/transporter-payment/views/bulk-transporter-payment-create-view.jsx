// src/sections/transporter-payment/views/bulk-transporter-payment-create-view.jsx
import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import BulkTransporterPaymentSimpleForm from '../bulk-transporter-payment-simple-form';

export function BulkTransporterPaymentCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create Bulk Transporter Payment"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Transporter Payment', href: paths.dashboard.transporterPayment.root },
          { name: 'Bulk Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <BulkTransporterPaymentSimpleForm />
    </DashboardContent>
  );
}
