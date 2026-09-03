import { useSearchParams } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ExpenseNewForm from '../vehicle-expense-form';

export function VehicleExpenseCreateView() {
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicle');
  const vehicleNo = searchParams.get('vehicleNo');

  const currentExpense = vehicleId ? { vehicleId: { _id: vehicleId, vehicleNo } } : undefined;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add New Expense to Vehicle"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Expenses List', href: paths.dashboard.expense.list },
          { name: 'Add New Expense' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ExpenseNewForm currentExpense={currentExpense} />
    </DashboardContent>
  );
}
