import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';

import { HeroHeader } from 'src/components/hero-header-card';

import {
  TransporterBasicWidget,
  TransporterFinanceWidget,
  TransporterAdvancesWidget,
  TransporterPaymentsWidget,
  TransporterSubtripsWidget,
  TransporterVehiclesWidget,
  TransporterDocumentsWidget,
  TransporterAdditionalWidget,
} from '../widgets';

export function TransporterDetailView({ transporter }) {
  const { transportName, ownerName, cellNo, isActive } = transporter || {};

  return (
    <DashboardContent>
      <HeroHeader
        offsetTop={70}
        title={transportName}
        status={isActive ? 'Active' : 'In Active'}
        icon="mdi:truck"
        meta={[
          { icon: 'mdi:account', label: ownerName },
          { icon: 'mdi:phone', label: cellNo },
        ]}
      />
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <TransporterBasicWidget transporter={transporter} />
          </Grid>
          <Grid xs={12} md={4}>
            <TransporterFinanceWidget transporter={transporter} />
          </Grid>
          <Grid xs={12} md={4}>
            <TransporterAdditionalWidget transporter={transporter} />
          </Grid>

          <Grid xs={12} md={9}>
            <TransporterPaymentsWidget transporterId={transporter._id} />
          </Grid>
          <Grid xs={12} md={3}>
            <TransporterVehiclesWidget transporterId={transporter._id} />
          </Grid>
          <Grid xs={12}>
            <TransporterSubtripsWidget transporterId={transporter._id} />
          </Grid>
          <Grid xs={12}>
            <TransporterAdvancesWidget transporterId={transporter._id} />
          </Grid>
          <Grid xs={12}>
            <TransporterDocumentsWidget transporter={transporter} />
          </Grid>
        </Grid>
      </Box>
    </DashboardContent>
  );
}
