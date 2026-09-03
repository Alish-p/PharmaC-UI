import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fToNow, fDaysDuration } from 'src/utils/format-time';

import { useGps } from 'src/query/use-gps';
import { ICONS } from 'src/assets/data/icons';
import { useTenant } from 'src/query/use-tenant';
import { DashboardContent } from 'src/layouts/dashboard';
import { useVehicle, useUpdateVehicle, useGetTyreLayouts } from 'src/query/use-vehicle';
import {
  useGetTyre,
  useSellTyre,
  useMountTyre,
  useScrapTyre,
  useUpdateTyre,
  useUnmountTyre,
} from 'src/query/use-tyre';

import { useSettingsContext } from 'src/components/settings';
import { HeroHeader } from 'src/components/hero-header-card';
import { LoadingScreen } from 'src/components/loading-screen';

import { TyreLayoutDiagram } from 'src/sections/vehicle/components/tyre-layout-diagram';

import TyreHistory from './tyre-history-widget';
import { TYRE_STATUS } from '../tyre-constants';
import TyreGeneralInfo from './tyre-general-info';
import { Iconify } from '../../../components/iconify';
import OverviewWidget from '../components/overview-widget';
import TyreSellDialog from '../components/tyre-sell-dialog';
import TyreMountWizard from '../components/tyre-mount-wizard';
import TyreScrapDialog from '../components/tyre-scrap-dialog';
import TyreRemoldDialog from '../components/tyre-remold-dialog';
import TyreUnmountDialog from '../components/tyre-unmount-dialog';
import TyreThreadUpdateDialog from '../components/tyre-thread-update-dialog';

// ----------------------------------------------------------------------

export default function TyreDetailsView() {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: tyre, isLoading, error } = useGetTyre(id);
  const { mutateAsync: mountTyre } = useMountTyre();
  const { mutateAsync: unmountTyre } = useUnmountTyre();
  const { mutateAsync: scrapTyre } = useScrapTyre();
  const { mutateAsync: sellTyre } = useSellTyre();
  const { mutateAsync: updateTyre } = useUpdateTyre();
  const updateVehicle = useUpdateVehicle();

  const [openThreadDialog, setOpenThreadDialog] = useState(false);
  const [openMountWizard, setOpenMountWizard] = useState(false);
  const [openUnmountDialog, setOpenUnmountDialog] = useState(false);
  const [openScrapDialog, setOpenScrapDialog] = useState(false);
  const [openSellDialog, setOpenSellDialog] = useState(false);
  const [openRemoldDialog, setOpenRemoldDialog] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [vehicleOdometer, setVehicleOdometer] = useState('');
  const isEditingOdometer = Boolean(anchorEl);

  // Fetch current vehicle details if mounted (for display in Info and Unmount dialog)
  const { data: currentVehicle } = useVehicle(tyre?.currentVehicleId);

  const { data: tenant } = useTenant();
  const gpsEnabled = !!tenant?.integrations?.vehicleGPS?.enabled;

  const { data: gpsData, isLoading: isLoadingGps } = useGps(currentVehicle?.vehicleNo || '', {
    enabled: gpsEnabled && !!currentVehicle?.vehicleNo,
  });

  useEffect(() => {
    if (currentVehicle?.currentOdometer != null) {
      setVehicleOdometer(currentVehicle.currentOdometer);
    } else if (gpsData?.totalOdometer) {
      setVehicleOdometer(gpsData.totalOdometer);
    }
  }, [gpsData, currentVehicle]);

  const lastOdometer = currentVehicle?.currentOdometer || 0;
  const diff = vehicleOdometer !== '' ? Number(vehicleOdometer) - lastOdometer : 0;
  const isGpsSuspicious = gpsData?.totalOdometer != null && gpsData.totalOdometer < lastOdometer;

  const handleSaveOdometer = async () => {
    if (currentVehicle && vehicleOdometer !== '') {
      try {
        await updateVehicle({
          id: currentVehicle._id,
          data: { currentOdometer: Number(vehicleOdometer) },
        });
        toast.success('Odometer updated successfully');
        setAnchorEl(null);
      } catch (e) {
        console.error(e);
        toast.error(e?.message || 'Failed to update odometer');
      }
    }
  };

  // For layout display on details page
  const { data: layoutsData } = useGetTyreLayouts();
  const layouts = layoutsData?.data || [];
  const currentMountingLayout = layouts.find((l) => l.id === currentVehicle?.tyreLayoutId);
  const mountingPositions = currentMountingLayout?.tyres || [];

  const handleMount = async ({ vehicleId, position, odometer }) => {
    try {
      await mountTyre({
        id: tyre._id,
        data: {
          vehicleId,
          position,
          odometer,
          mountDate: new Date(),
        },
      });
      toast.success(`Tyre mounted successfully`);
      setOpenMountWizard(false);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to mount tyre');
    }
  };

  const handleUnmount = async ({ odometer }) => {
    try {
      await unmountTyre({
        id: tyre._id,
        data: {
          odometer,
          unmountDate: new Date(),
        },
      });
      toast.success('Tyre unmounted successfully');
      setOpenUnmountDialog(false);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to unmount tyre');
    }
  };

  const handleScrap = async ({ odometer, scrapDate }) => {
    try {
      await scrapTyre({
        id: tyre._id,
        data: {
          odometer,
          scrapDate,
        },
      });
      toast.success('Tyre moved to scrap successfully');
      setOpenScrapDialog(false);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to scrap tyre');
    }
  };

  const handleSell = async ({ sellAmount, sellDate, transporterId, soldToTransporterName }) => {
    try {
      await sellTyre({
        id: tyre._id,
        data: {
          sellAmount,
          sellDate,
          transporterId,
          soldToTransporterName,
        },
      });
      setOpenSellDialog(false);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to sell tyre');
    }
  };

  const handleMarkAsRejected = async () => {
    try {
      await updateTyre({
        id: tyre._id,
        data: {
          type: 'Rejected',
        },
      });
      toast.success('Tyre marked as rejected successfully');
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to mark tyre as rejected');
    }
  };

  if (isLoading) return <LoadingScreen />;

  if (error) return <div>Error loading tyre details</div>;
  if (!tyre) return <div>Tyre not found</div>;

  const meta = [
    { icon: ICONS.tyre.code, label: tyre.serialNumber },
    { icon: ICONS.tyre.ruler, label: tyre.size },
  ];

  let liveKm = tyre.currentKm || 0;
  let liveKmSubtitle = '';
  let liveKmSubtitleColor = 'text.disabled';
  let infoTooltipContent = null;

  if (
    tyre.status === TYRE_STATUS.MOUNTED &&
    currentVehicle?.currentOdometer != null &&
    tyre.mountOdometer != null
  ) {
    const liveDiff = currentVehicle.currentOdometer - tyre.mountOdometer;
    if (liveDiff > 0) liveKm += liveDiff;

    const updatedAt = currentVehicle?.currentOdometerUpdatedAt;
    let subtitleText = 'Capture time unknown';

    if (updatedAt) {
      subtitleText = `Captured ${fToNow(updatedAt)} ago`;
      const daysOld = fDaysDuration(updatedAt, new Date());
      if (daysOld < 3) liveKmSubtitleColor = 'success.light';
      else if (daysOld <= 10) liveKmSubtitleColor = 'warning.light';
      else liveKmSubtitleColor = 'error.light';
    }

    liveKmSubtitle = (
      <Stack component="span" direction="row" alignItems="center" spacing={0.5}>
        <Box component="span">{subtitleText}</Box>
        <Tooltip title="Update Vehicle Odometer">
          <IconButton
            component="span"
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ p: 0.5, color: 'inherit' }}
          >
            <Iconify icon="solar:pen-bold" width={14} />
          </IconButton>
        </Tooltip>
      </Stack>
    );

    infoTooltipContent = (
      <Stack spacing={1}>
        <Typography variant="subtitle2">Live KM Calculation</Typography>
        <Divider />
        <Stack direction="row" justifyContent="space-between" spacing={3}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Last Recorded KM
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {tyre.currentKm || 0} km
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" spacing={3}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Current Vehicle Odo
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {currentVehicle.currentOdometer} km
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" spacing={3}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Mounted Odo
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {tyre.mountOdometer} km
          </Typography>
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between" spacing={3}>
          <Typography variant="subtitle2">Total (Live KM)</Typography>
          <Typography variant="subtitle2">{liveKm} km</Typography>
        </Stack>
      </Stack>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <HeroHeader
          title={`${tyre.brand} ${tyre.serialNumber}`}
          status={tyre.status}
          icon={ICONS.tyre.tyre}
          meta={meta}
          actions={[
            {
              label: 'Edit',
              icon: ICONS.common.edit,
              onClick: () => navigate(paths.dashboard.tyre.edit(tyre._id)),
            },
          ]}
          menus={[
            {
              label: 'Actions',
              icon: ICONS.tyre.settings,
              items: [
                {
                  label: 'Change Thread',
                  icon: ICONS.tyre.measure,
                  onClick: () => setOpenThreadDialog(true),
                  disabled: tyre.status === TYRE_STATUS.SCRAPPED,
                },
                {
                  label: 'Mount',
                  icon: ICONS.tyre.tyre,
                  onClick: () => setOpenMountWizard(true),
                  disabled:
                    tyre.status === TYRE_STATUS.MOUNTED || tyre.status === TYRE_STATUS.SCRAPPED,
                },
                {
                  label: 'Unmount',
                  icon: ICONS.tyre.remove,
                  onClick: () => setOpenUnmountDialog(true),
                  disabled: tyre.status !== TYRE_STATUS.MOUNTED,
                },
                {
                  label: 'Move to Scrap',
                  icon: ICONS.tyre.trashFilled,
                  onClick: () => setOpenScrapDialog(true),
                  disabled:
                    tyre.status === TYRE_STATUS.SCRAPPED || tyre.status === TYRE_STATUS.SOLD,
                  sx: { color: 'error.main' },
                },
                {
                  label: 'Sell',
                  icon: ICONS.tyre.bill,
                  onClick: () => setOpenSellDialog(true),
                  disabled:
                    tyre.status !== TYRE_STATUS.SCRAPPED && tyre.status !== TYRE_STATUS.IN_STOCK,
                  sx: { color: 'success.main' },
                },
                {
                  label: 'Mark as Rejected',
                  icon: ICONS.common.close,
                  onClick: () => handleMarkAsRejected(),
                  disabled:
                    tyre.type === 'Rejected' ||
                    tyre.status === TYRE_STATUS.SCRAPPED ||
                    tyre.status === TYRE_STATUS.SOLD,
                  sx: { color: 'error.main' },
                },
                {
                  label: 'Remold',
                  icon: ICONS.tyre.remold,
                  onClick: () => setOpenRemoldDialog(true),
                  disabled: tyre.status !== TYRE_STATUS.IN_STOCK,
                },
              ],
            },
          ]}
        />

        <Grid container spacing={3} mt={3}>
          {/* <Grid item xs={12} md={4}>
                        <TyreThreadWidget
                            title="Thread Depth"
                            current={tyre?.threadDepth?.current || 0}
                            original={tyre?.threadDepth?.original || 0}
                        />
                    </Grid> */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <OverviewWidget
                  title="Total Distance"
                  total={liveKm}
                  icon={ICONS.tyre.road}
                  color="info"
                  unit="km"
                  subtitle={liveKmSubtitle}
                  subtitleColor={liveKmSubtitleColor}
                  infoTooltip={infoTooltipContent}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <OverviewWidget
                  title="Remaining Thread"
                  total={`${tyre?.threadDepth?.current || 0}/${tyre?.threadDepth?.original || 0}`}
                  icon={ICONS.tyre.rulerLine}
                  color="warning"
                  unit="mm"
                />
              </Grid>
              {tyre.metadata?.remoldCount > 0 && (
                <Grid item xs={12} md={6}>
                  <OverviewWidget
                    title="Remold Distance"
                    total={(tyre.currentKm || 0) - (tyre.metadata?.totalKmAtLastRemold || 0)}
                    icon={ICONS.tyre.road}
                    color="success"
                    unit="km"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TyreGeneralInfo tyre={tyre} />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title="Mounting Position"
                subheader={
                  tyre.status === TYRE_STATUS.MOUNTED ? (
                    <Box component="span">
                      <Link
                        component={RouterLink}
                        href={paths.dashboard.vehicle.details(currentVehicle?._id)}
                        color="primary"
                        variant="subtitle2"
                      >
                        {currentVehicle?.vehicleNo}
                      </Link>
                      {' - '}
                      <Box component="span" sx={{ color: 'text.secondary' }}>
                        {tyre.currentPosition}
                        <br />
                        {tyre.mountOdometer != null && `Mounted at: ${tyre.mountOdometer} km`}
                      </Box>
                    </Box>
                  ) : (
                    'Not Mounted'
                  )
                }
              />
              <CardContent>
                {tyre.status === TYRE_STATUS.MOUNTED && mountingPositions.length > 0 ? (
                  <TyreLayoutDiagram
                    positions={mountingPositions}
                    selectedPosition={tyre.currentPosition}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 200,
                      color: 'primary.main',
                    }}
                  >
                    <Iconify icon={ICONS.tyre.tyre} sx={{ mr: 2 }} />
                    <Typography variant="h6">
                      {tyre.status === TYRE_STATUS.IN_STOCK ? 'In Stock' : 'Currently Not Mounted'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={12}>
            <TyreHistory tyreId={tyre._id} />
          </Grid>
        </Grid>

        <Popover
          open={isEditingOdometer}
          anchorEl={anchorEl}
          onClose={() => {
            setAnchorEl(null);
            setVehicleOdometer(lastOdometer);
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          slotProps={{ paper: { sx: { p: 2, width: 280 } } }}
        >
          <Stack spacing={2}>
            <Typography variant="subtitle2">Update Odometer</Typography>

            <TextField
              size="small"
              label={`Last Reading: ${lastOdometer} km`}
              type="number"
              value={vehicleOdometer}
              onChange={(e) => setVehicleOdometer(e.target.value)}
              error={diff < 0}
              InputProps={{
                endAdornment: <InputAdornment position="end">km</InputAdornment>,
              }}
              helperText={
                vehicleOdometer !== '' && diff !== 0 ? (
                  <Box component="span" sx={{ color: diff > 0 ? 'success.main' : 'error.main' }}>
                    {diff > 0 ? `+${diff}` : diff} km
                  </Box>
                ) : (
                  ''
                )
              }
              fullWidth
            />

            {gpsEnabled && (
              <Box>
                {isLoadingGps ? (
                  <Typography variant="caption" color="text.secondary">
                    Fetching GPS Data...
                  </Typography>
                ) : gpsData?.totalOdometer != null ? (
                  <Button
                    size="small"
                    variant="soft"
                    color={isGpsSuspicious ? 'error' : 'primary'}
                    onClick={() => setVehicleOdometer(gpsData.totalOdometer)}
                    startIcon={
                      <Iconify icon={isGpsSuspicious ? 'mdi:alert-circle' : 'solar:gps-bold'} />
                    }
                    fullWidth
                  >
                    Use GPS: {gpsData.totalOdometer} km
                  </Button>
                ) : (
                  <Typography variant="caption" color="error">
                    GPS unavailable
                  </Typography>
                )}
              </Box>
            )}

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  setAnchorEl(null);
                  setVehicleOdometer(lastOdometer);
                }}
              >
                Cancel
              </Button>
              <Button size="small" variant="contained" color="primary" onClick={handleSaveOdometer}>
                Save
              </Button>
            </Stack>
          </Stack>
        </Popover>

        <TyreThreadUpdateDialog
          open={openThreadDialog}
          onClose={() => setOpenThreadDialog(false)}
          tyreId={tyre._id}
          currentDepth={tyre?.threadDepth?.current}
          isMounted={tyre.status === TYRE_STATUS.MOUNTED}
        />

        <TyreMountWizard
          open={openMountWizard}
          onClose={() => setOpenMountWizard(false)}
          onMount={handleMount}
        />

        <TyreUnmountDialog
          open={openUnmountDialog}
          onClose={() => setOpenUnmountDialog(false)}
          onUnmount={handleUnmount}
          vehicleName={currentVehicle?.vehicleNo}
        />

        <TyreScrapDialog
          open={openScrapDialog}
          onClose={() => setOpenScrapDialog(false)}
          onScrap={handleScrap}
          currentStatus={tyre.status}
          vehicleNo={currentVehicle?.vehicleNo}
        />

        <TyreSellDialog
          open={openSellDialog}
          onClose={() => setOpenSellDialog(false)}
          onSell={handleSell}
          tyreStatus={tyre.status}
          tyreCost={tyre.cost}
        />

        <TyreRemoldDialog
          open={openRemoldDialog}
          onClose={() => setOpenRemoldDialog(false)}
          tyreId={tyre._id}
          currentDepth={tyre?.threadDepth?.current}
        />
      </Container>
    </DashboardContent>
  );
}
