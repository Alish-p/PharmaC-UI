import { Link } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Unstable_Grid2';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGps } from 'src/query/use-gps';
import { useTenant } from 'src/query/use-tenant';
import { useUpdateVehicle, useGetTyreLayouts } from 'src/query/use-vehicle';
import { useGetTyres, useMountTyre, useUnmountTyre } from 'src/query/use-tyre';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { KanbanTyreDialog } from '../components/kanban-tyre-dialog';
import { TyreLayoutDiagram } from '../components/tyre-layout-diagram';
import TyreUnmountDialog from '../../tyre/components/tyre-unmount-dialog';

// ----------------------------------------------------------------------

export function CurrentTyreLayoutView({ vehicle }) {
  const { data: layoutsData, isLoading: isLoadingLayouts } = useGetTyreLayouts();

  // Fetch mounted tyres for this vehicle
  const { data: tyresData, isLoading: isLoadingTyres } = useGetTyres(
    { vehicleId: vehicle?._id, status: 'Mounted', limit: 100 },
    { enabled: !!vehicle?._id }
  );

  const { mutate: mountTyre } = useMountTyre();
  const { mutate: unmountTyre } = useUnmountTyre();
  const updateVehicle = useUpdateVehicle();

  const [mountDialogOpen, setMountDialogOpen] = useState(false);
  const [unmountDialogOpen, setUnmountDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedTyreToUnmount, setSelectedTyreToUnmount] = useState(null);
  const [vehicleOdometer, setVehicleOdometer] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const isEditingOdometer = Boolean(anchorEl);

  const { data: tenant } = useTenant();
  const gpsEnabled = !!tenant?.integrations?.vehicleGPS?.enabled;

  const { data: gpsData, isLoading: isLoadingGps } = useGps(vehicle?.vehicleNo || '', {
    enabled: gpsEnabled && !!vehicle?.vehicleNo,
  });

  useEffect(() => {
    if (vehicle?.currentOdometer != null) {
      setVehicleOdometer(vehicle.currentOdometer);
    } else if (gpsData?.totalOdometer) {
      setVehicleOdometer(gpsData.totalOdometer);
    }
  }, [gpsData, vehicle]);

  const lastOdometer = vehicle?.currentOdometer || 0;
  const diff = vehicleOdometer !== '' ? Number(vehicleOdometer) - lastOdometer : 0;
  const isGpsSuspicious = gpsData?.totalOdometer != null && gpsData.totalOdometer < lastOdometer;

  const currentLayout = useMemo(() => {
    if (!layoutsData?.data || !vehicle?.tyreLayoutId) return null;
    return layoutsData.data.find((l) => l.id === vehicle.tyreLayoutId);
  }, [layoutsData, vehicle]);

  // Create a map of position -> tyre
  const tyreMap = useMemo(() => {
    const map = {};
    if (tyresData?.tyres) {
      tyresData.tyres.forEach((t) => {
        if (t.currentPosition) {
          map[t.currentPosition] = t;
        }
      });
    }
    return map;
  }, [tyresData]);

  const handleTyreClick = (position) => {
    const mountedTyre = tyreMap[position];
    setSelectedPosition(position);

    if (mountedTyre) {
      setSelectedTyreToUnmount(mountedTyre);
      setUnmountDialogOpen(true);
    } else {
      setSelectedTyreToUnmount(null);
      setMountDialogOpen(true);
    }
  };

  const handleMountTyre = (tyre, odometer) => {
    if (!selectedPosition || !vehicle?._id) return;

    mountTyre({
      id: tyre._id,
      data: {
        position: selectedPosition,
        vehicleId: vehicle._id,
        odometer, // Use the odometer from the dialog
      },
    });
  };

  const handleUnmountTyre = (data) => {
    if (!selectedTyreToUnmount) return;

    unmountTyre(
      {
        id: selectedTyreToUnmount._id,
        data: {
          ...data,
          vehicleId: vehicle._id,
        },
      },
      {
        onSuccess: () => {
          setUnmountDialogOpen(false);
          setSelectedTyreToUnmount(null);
        },
      }
    );
  };

  const getActualKm = (tyre) => {
    if (
      !vehicleOdometer ||
      Number.isNaN(Number(vehicleOdometer)) ||
      tyre.mountOdometer === null ||
      tyre.mountOdometer === undefined
    ) {
      return tyre.currentKm;
    }
    const distance = Number(vehicleOdometer) - tyre.mountOdometer;
    return distance > 0 ? tyre.currentKm + distance : tyre.currentKm;
  };

  const handleSaveOdometer = async () => {
    if (vehicle && vehicleOdometer !== '') {
      await updateVehicle({
        id: vehicle._id,
        data: { currentOdometer: Number(vehicleOdometer) },
      });
      setAnchorEl(null);
    }
  };

  if (isLoadingLayouts || isLoadingTyres) {
    return <CircularProgress />;
  }

  if (!currentLayout) {
    return <Typography>Layout not found</Typography>;
  }

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title="Current Layout" />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {currentLayout.name}
            </Typography>
            <TyreLayoutDiagram
              positions={currentLayout.tyres}
              tyreMap={tyreMap}
              onSelect={handleTyreClick}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} md={8}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title="Mounted Tyres"
            subheader={`${Object.keys(tyreMap).length} tyres mounted`}
            sx={{ mb: 2 }}
            action={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Current Odometer:{' '}
                  <Typography component="span" variant="subtitle1" color="text.primary">
                    {vehicleOdometer || 0} km
                  </Typography>
                </Typography>
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <Iconify icon="solar:pen-bold" />
                </IconButton>

                <Popover
                  open={isEditingOdometer}
                  anchorEl={anchorEl}
                  onClose={() => {
                    setAnchorEl(null);
                    setVehicleOdometer(lastOdometer);
                  }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
                          <Box
                            component="span"
                            sx={{ color: diff > 0 ? 'success.main' : 'error.main' }}
                          >
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
                              <Iconify
                                icon={isGpsSuspicious ? 'mdi:alert-circle' : 'solar:gps-bold'}
                              />
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
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleSaveOdometer}
                      >
                        Save
                      </Button>
                    </Stack>
                  </Stack>
                </Popover>
              </Stack>
            }
          />
          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Position</TableCell>
                    <TableCell>Tyre ID</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Current Km</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tyresData?.tyres?.map((tyre) => (
                    <TableRow key={tyre._id}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{tyre.currentPosition}</TableCell>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={paths.dashboard.tyre.details(tyre._id)}
                          variant="body2"
                          noWrap
                          sx={{ color: 'primary', cursor: 'pointer' }}
                        >
                          {tyre.serialNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{tyre.brand}</TableCell>
                      <TableCell>{tyre.model}</TableCell>
                      <TableCell>{getActualKm(tyre)}</TableCell>
                      <TableCell>
                        <Label color="success">Mounted</Label>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!tyresData?.tyres || tyresData.tyres.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                        No tyres mounted
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Card>
      </Grid>

      <KanbanTyreDialog
        open={mountDialogOpen}
        onClose={() => setMountDialogOpen(false)}
        onTyreSelect={handleMountTyre}
        vehicleNo={vehicle?.vehicleNo}
      />

      <TyreUnmountDialog
        open={unmountDialogOpen}
        onClose={() => setUnmountDialogOpen(false)}
        onUnmount={handleUnmountTyre}
        vehicleName={vehicle?.vehicleNo}
      />
    </Grid>
  );
}
