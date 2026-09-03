import { useCallback } from 'react';

import { DashboardContent } from 'src/layouts/dashboard';
import { useUpdateDriverPayrollStatus } from 'src/query/use-driver-payroll';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import DriverSalaryView from '../driver-salary-view';
import DriverSalaryToolbar from '../driver-salary-toolbar';

export const PAYSLIP_STATUS_OPTIONS = [
  { value: 'generated', label: 'Generated' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function DriverPayrollDetailView({ driverPayroll }) {
  const driverPayrollStatus = useUpdateDriverPayrollStatus();

  const { status, _id, paymentId } = driverPayroll;

  const handleChangeStatus = useCallback(
    (event) => {
      const newStatus = event.target.value;

      driverPayrollStatus({ id: _id, status: newStatus });
    },
    [_id, driverPayrollStatus]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={paymentId}
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Payslip', href: '/dashboard/payslip' },
          { name: paymentId },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <DriverSalaryToolbar
        payslip={driverPayroll}
        currentStatus={status || ''}
        onChangeStatus={handleChangeStatus}
        statusOptions={PAYSLIP_STATUS_OPTIONS}
      />

      <DriverSalaryView driverSalary={driverPayroll} />
    </DashboardContent>
  );
}
