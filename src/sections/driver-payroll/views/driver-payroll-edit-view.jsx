import React from 'react';

import { Alert, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export const DriverPayrollEditView = () => (
  <DashboardContent>
    <CustomBreadcrumbs
      heading="Edit Driver Payroll"
      links={[
        { name: 'Dashboard', href: paths.dashboard.root },
        { name: 'Driver Payroll', href: paths.dashboard.driverSalary.root },
        { name: 'Edit' },
      ]}
      sx={{ mb: { xs: 3, md: 5 } }}
    />

    <Stack spacing={3}>
      <Alert severity="success" variant="outlined">
        <Stack spacing={2}>
          <Typography variant="subtitle1">Driver Payroll Editing Not Available</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            For data integrity reasons, driver payroll cannot be edited once created. If you need to
            make changes, please delete the existing driver payroll and create a new one instead.
          </Typography>
        </Stack>
      </Alert>
    </Stack>
  </DashboardContent>
);
