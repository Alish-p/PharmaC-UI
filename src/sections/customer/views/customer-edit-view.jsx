import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import CustomerNewForm from '../customer-form';

// ----------------------------------------------------------------------

export function CustomerEditView({ customer }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Customer"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Customer List',
            href: paths.dashboard.customer.list,
          },
          { name: customer?.customerName },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CustomerNewForm currentCustomer={customer} />
    </DashboardContent>
  );
}
