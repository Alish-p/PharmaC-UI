import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';

import { HeroHeader } from 'src/components/hero-header-card';

import {
  CustomerBasicWidget,
  CustomerFinanceWidget,
  CustomerInvoicesTable,
  CustomerAdditionalWidget,
  CustomerMaterialSummaryWidget,
  CustomerSubtripCompletedWidget,
  CustomerInvoiceAmountSummaryWidget,
} from '../widgets';

export function CustomerDetailView({ customer }) {
  const { customerName, cellNo, address, status } = customer || {};

  return (
    <DashboardContent>
      <HeroHeader
        offsetTop={70}
        title={customerName}
        status={status || 'Active'}
        icon="solar:user-bold"
        meta={[
          { icon: 'mdi:phone', label: cellNo },
          { icon: 'mdi:map-marker', label: address },
        ]}
      />
      <Box mt={2}>
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <CustomerBasicWidget customer={customer} />
          </Grid>
          <Grid xs={12} md={4}>
            <CustomerFinanceWidget customer={customer} />
          </Grid>
          <Grid xs={12} md={4}>
            <CustomerAdditionalWidget customer={customer} />
          </Grid>
          <Grid xs={12} md={4}>
            <CustomerInvoiceAmountSummaryWidget customer={customer} />
          </Grid>
          <Grid xs={12} md={8}>
            <CustomerSubtripCompletedWidget customer={customer} />
          </Grid>

          <Grid xs={12} md={6}>
            <CustomerInvoicesTable
              customer={customer}
              title="📄 Invoices"
              subheader="Invoices for this customer"
            />
          </Grid>

          <Grid xs={12} md={6}>
            <CustomerMaterialSummaryWidget customer={customer} />
          </Grid>
          {/* Top Routes table removed (backend API removed) */}
        </Grid>
      </Box>
    </DashboardContent>
  );
}
