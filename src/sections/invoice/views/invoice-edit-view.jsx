import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export function InvoiceEditView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Invoice"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Invoice', href: paths.dashboard.invoice.root },
          { name: 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <Alert severity="success" variant="outlined">
          <Stack spacing={2}>
            <Typography variant="subtitle1">Invoice Editing Not Available</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              For data integrity reasons, invoices cannot be edited once created. If you need to
              make changes, please delete the existing invoice and create a new one instead.
            </Typography>
          </Stack>
        </Alert>
      </Stack>
    </DashboardContent>
  );
}
