import { Box, Card } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';

import { HeroHeader } from 'src/components/hero-header-card';

import {
  DriverBasicWidget,
  DriverFinanceWidget,
  DriverSubtripsTable,
  DriverAdditionalWidget,
} from '../widgets';

export function DriverDetailView({ driver }) {
  const { driverName, driverCellNo, driverPresentAddress, photoImage } = driver || {};

  return (
    <DashboardContent>
      <HeroHeader
        offsetTop={70}
        title={driverName}
        status="Active"
        icon="solar:user-bold"
        meta={[
          { icon: 'mdi:phone', label: driverCellNo },
          { icon: 'mdi:map-marker', label: driverPresentAddress },
        ]}
      />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          {photoImage && (
            <Grid xs={12} md={3}>
              <Card sx={{ p: 1, height: 1 }}>
                <Box
                  component="img"
                  alt={driverName}
                  src={photoImage}
                  sx={{
                    width: 1,
                    height: 1,
                    aspectRatio: '1/1',
                    borderRadius: 1,
                    objectFit: 'cover',
                  }}
                />
              </Card>
            </Grid>
          )}
          <Grid xs={12} md={photoImage ? 3 : 4}>
            <DriverBasicWidget driver={driver} />
          </Grid>
          <Grid xs={12} md={photoImage ? 3 : 4}>
            <DriverFinanceWidget driver={driver} />
          </Grid>
          <Grid xs={12} md={photoImage ? 3 : 4}>
            <DriverAdditionalWidget driver={driver} />
          </Grid>
          <Grid xs={12}>
            <DriverSubtripsTable driver={driver} />
          </Grid>
        </Grid>
      </Box>
    </DashboardContent>
  );
}
