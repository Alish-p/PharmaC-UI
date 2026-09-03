import React from 'react';

import { Alert, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export const TransporterPaymentEditView = () => (
  <DashboardContent>
    <CustomBreadcrumbs
      heading="Edit Transporter Payment"
      links={[
        { name: 'Dashboard', href: paths.dashboard.root },
        { name: 'Transporter Payment', href: paths.dashboard.transporterPayment.root },
        { name: 'Edit' },
      ]}
      sx={{ mb: { xs: 3, md: 5 } }}
    />

    <Stack spacing={3}>
      <Alert severity="success" variant="outlined">
        <Stack spacing={2}>
          <Typography variant="subtitle1">Transporter Payment Editing Not Available</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            For data integrity reasons, transporter payments cannot be edited once created. If you
            need to make changes, please delete the existing transporter payment and create a new
            one instead.
          </Typography>
        </Stack>
      </Alert>
    </Stack>
  </DashboardContent>
);
