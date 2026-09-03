import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { HeroHeader } from 'src/components/hero-header-card';

import {
  PumpBasicWidget,
  PumpFinanceWidget,
  PumpExpensesWidget,
  PumpDieselPriceWidget,
  PumpDieselPricesWidget,
} from '../widgets';

export function PumpDetailView({ pump }) {
  const navigate = useNavigate();
  const { name, ownerName, phone, address } = pump || {};

  return (
    <DashboardContent>
      <HeroHeader
        offsetTop={70}
        title={name}
        status="Active"
        icon="solar:gas-station-bold"
        meta={[
          { icon: 'mdi:account', label: ownerName },
          { icon: 'mdi:phone', label: phone },
          { icon: 'mdi:map-marker', label: address },
        ]}
        actions={[
          {
            label: 'Edit',
            icon: 'solar:pen-bold',
            onClick: () => navigate(paths.dashboard.pump.edit(pump._id)),
          },
        ]}
      />
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {/* Top row: 3 columns to better use width */}
          <Grid xs={12} md={4}>
            <PumpBasicWidget pump={pump} />
          </Grid>
          <Grid xs={12} md={4}>
            <PumpFinanceWidget pump={pump} />
          </Grid>
          <Grid xs={12} md={4}>
            <PumpDieselPriceWidget pumpId={pump._id} />
          </Grid>

          <Grid xs={12}>
            <PumpDieselPricesWidget pump={pump} />
          </Grid>
          <Grid xs={12}>
            <PumpExpensesWidget pumpId={pump._id} />
          </Grid>
        </Grid>
      </Box>
    </DashboardContent>
  );
}
