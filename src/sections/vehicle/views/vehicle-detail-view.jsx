import { useNavigate } from 'react-router';
import { useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import { Tab, Tabs, Link, Grid, Card, Stack, CardHeader, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';

import { useGps } from 'src/query/use-gps';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { HeroHeader } from 'src/components/hero-header-card';

import { useAuthContext } from 'src/auth/hooks';

import { VehicleFuelWidget } from '../widgets/vehicle-fuel-widget';
import { VehicleTyreLayoutView } from './vehicle-tyre-layout-view';
import { VehicleLocationMap } from '../widgets/vehicle-location-map';
import { VehicleChallanWidget } from '../widgets/vehicle-challan-widget';
import { VehicleBillingSummary } from '../widgets/vehicle-billing-summary';
import { VehicleOdometerWidget } from '../widgets/vehicle-odometer-widget';
import { VehicleSubtripsWidget } from '../widgets/vehicle-subtrips-widget';
import { VehicleDocumentsWidget } from '../widgets/vehicle-documents-widget';
import { VehicleWorkOrdersWidget } from '../widgets/vehicle-work-orders-widget';
import { VehicleMonthlyAnalyticsWidget } from '../widgets/vehicle-monthly-analytics-widget';

// ----------------------------------------------------------------------

const VALID_TABS = ['overview', 'tyres', 'workOrders'];

export function VehicleDetailView({ vehicle }) {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { tenant } = useAuthContext();
  const {
    vehicleNo,
    vehicleType,
    modelType,
    vehicleCompany,
    noOfTyres,
    chasisNo,
    engineNo,
    manufacturingYear,
    loadingCapacity,
    engineType,
    fuelTankCapacity,
    transporter,
    trackingLink,
  } = vehicle;

  // Read tab from URL, fallback to 'overview'
  const currentTab = useMemo(() => {
    const tabParam = searchParams.get('tab');
    return VALID_TABS.includes(tabParam) ? tabParam : 'overview';
  }, [searchParams]);

  const handleChangeTab = useCallback(
    (_event, newValue) => {
      const next = new URLSearchParams(searchParams);
      if (newValue === 'overview') {
        next.delete('tab');
      } else {
        next.set('tab', newValue);
      }
      const qs = next.toString();
      navigate(qs ? `?${qs}` : '.', { replace: true });
    },
    [searchParams, navigate]
  );

  const { data: gpsData } = useGps(vehicleNo, { enabled: !!vehicleNo && vehicle.isOwn });
  const odometer = gpsData?.totalOdometer || 0;
  const fuelValue =
    Math.round(parseFloat(String(gpsData?.fuel || '0').replace(/[^0-9.]/g, ''))) || 0;

  // Show Work Orders tab for own vehicles OR when maintenance & inventory is enabled
  const showWorkOrdersTab = vehicle.isOwn || tenant?.integrations?.maintenanceAndInventory?.enabled;

  const renderDetails = (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:information-outline" width={24} />
            <Typography variant="h6">Details</Typography>
          </Stack>
        }
      />

      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        {/* Vehicle Number */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:road-variant" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Vehicle Number
          </Box>
          <Typography>{vehicleNo || '-'}</Typography>
        </Stack>

        {/* Vehicle Type */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:car" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Type
          </Box>
          <Typography>{vehicleType || '-'}</Typography>
        </Stack>

        {/* Model Type */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:car-estate" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Model
          </Box>
          <Typography>{modelType || '-'}</Typography>
        </Stack>

        {/* Company */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:domain" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Make
          </Box>
          <Typography>{vehicleCompany || '-'}</Typography>
        </Stack>

        {/* Number of Tyres */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:car-tire-alert" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Tyres
          </Box>
          <Typography>{noOfTyres ? `${noOfTyres} Tyres` : '-'}</Typography>
        </Stack>

        {/* Chasis No. */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:hexagon-outline" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Chasis No.
          </Box>
          <Typography>{chasisNo || '-'}</Typography>
        </Stack>

        {/* Engine No. */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:engine" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Engine No.
          </Box>
          <Typography>{engineNo || '-'}</Typography>
        </Stack>

        {/* Manufacturing Year */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:calendar-range" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Year
          </Box>
          <Typography>{manufacturingYear || '-'}</Typography>
        </Stack>

        {/* Loading Capacity */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:weight-lifter" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Loading Capacity
          </Box>
          <Typography>{loadingCapacity ? `${loadingCapacity} Ton` : '-'}</Typography>
        </Stack>

        {/* Engine Type */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:engine-outline" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Engine Type
          </Box>
          <Typography>{engineType || '-'}</Typography>
        </Stack>

        {/* Fuel Tank Capacity */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:gas-station" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Fuel Tank
          </Box>
          <Typography>{fuelTankCapacity ? `${fuelTankCapacity} L` : '-'}</Typography>
        </Stack>

        {/* Tracking Link */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:map-marker-path" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Tracking URL
          </Box>
          <Typography>
            {trackingLink ? (
              <Link href={trackingLink} target="_blank" rel="noopener">
                View Tracker
              </Link>
            ) : (
              '-'
            )}
          </Typography>
        </Stack>

        {/* Transporter */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:account" width={20} />
          <Box component="span" sx={{ color: 'text.secondary', width: 180, flexShrink: 0 }}>
            Transporter
          </Box>
          <Typography>{transporter?.transportName || '-'}</Typography>
        </Stack>
      </Stack>
    </Card>
  );

  return (
    <DashboardContent>
      <HeroHeader
        offsetTop={70}
        title={vehicleNo}
        status={vehicle.isOwn ? 'Own' : 'Market'}
        icon="mdi:truck-outline"
        meta={[
          { icon: 'mdi:car', label: vehicleType },
          // Show transporter (linked) only for non-own vehicles
          ...(!vehicle.isOwn && transporter?._id
            ? [
                {
                  icon: 'mdi:account',
                  label: transporter?.transportName,
                  href: paths.dashboard.transporter.details(transporter._id),
                },
              ]
            : []),
        ]}
        actions={[
          {
            label: 'Edit',
            icon: 'solar:pen-bold',
            onClick: () => navigate(paths.dashboard.vehicle.edit(vehicle._id)),
          },
        ]}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          my: { xs: 3, md: 2 },
        }}
      >
        <Tab value="overview" label="Overview" icon={<Iconify icon="mdi:eye" width={20} />} />
        <Tab value="tyres" label="Tyres" icon={<Iconify icon="mingcute:wheel-line" width={20} />} />
        {showWorkOrdersTab && (
          <Tab
            value="workOrders"
            label="Work Orders"
            icon={<Iconify icon="mdi:wrench" width={20} />}
          />
        )}
      </Tabs>

      {currentTab === 'overview' && (
        <Grid container spacing={3}>
          <Grid xs={12} md={7} container spacing={3} item>
            <Grid xs={12} sm={6} item>
              <VehicleOdometerWidget total={Math.round(odometer)} />
            </Grid>
            <Grid xs={12} sm={6} item>
              <VehicleFuelWidget value={fuelValue} total={400} />
            </Grid>
            {tenant?.integrations?.challanApi?.enabled && (
              <Grid xs={12} sm={6} item>
                <VehicleChallanWidget vehicleNo={vehicleNo} isOwn={vehicle.isOwn} />
              </Grid>
            )}
            <Grid xs={12} item>
              <VehicleLocationMap vehicleNo={vehicleNo} isOwn={vehicle.isOwn} />
            </Grid>
          </Grid>

          <Grid xs={12} md={5} item>
            {renderDetails}
          </Grid>

          {vehicle.isOwn && (
            <>
              <Grid xs={12} item>
                <VehicleMonthlyAnalyticsWidget vehicleId={vehicle._id} />
              </Grid>

              <Grid xs={12} item>
                <VehicleDocumentsWidget vehicleId={vehicle._id} vehicleNo={vehicleNo} />
              </Grid>

              <Grid xs={12} item>
                <VehicleBillingSummary vehicleId={vehicle._id} vehicleNo={vehicleNo} />
              </Grid>
            </>
          )}

          <Grid xs={12} item>
            <VehicleSubtripsWidget vehicleId={vehicle._id} />
          </Grid>
        </Grid>
      )}

      {currentTab === 'tyres' && <VehicleTyreLayoutView vehicle={vehicle} />}

      {currentTab === 'workOrders' && showWorkOrdersTab && (
        <VehicleWorkOrdersWidget vehicleId={vehicle._id} vehicleNo={vehicleNo} />
      )}
    </DashboardContent>
  );
}
