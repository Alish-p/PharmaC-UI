import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ExpenseCoreForm from '../subtrip-expense-form';

export function SubtripExpenseCreateView({ currentSubtrip }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Expense/Advance to Job"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Add New Expense/Advance' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ExpenseCoreForm currentSubtrip={currentSubtrip} />
    </DashboardContent>
  );
}
