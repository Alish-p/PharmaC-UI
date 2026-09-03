import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import LoanForm from '../loans-form';

export function LoansCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create Loan"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Loans', href: paths.dashboard.loan.root },
          { name: 'Create Loan' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <LoanForm />
    </DashboardContent>
  );
}
