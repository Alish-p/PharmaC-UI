import { useRef, useMemo, useState, useEffect } from 'react';
import { Popup, Marker, useMap, TileLayer, MapContainer } from 'react-leaflet';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fToNow } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';
import { useAllGps } from 'src/query/use-gps';
import { useActiveTripsMap } from 'src/query/use-trip';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import {
  statusColor,
  statusLabel,
  getFuelText,
  hasFuelData,
  resolveStatus,
  getMarkerIcon,
  StatusInsight,
  getFuelIconColor,
  getFuelPercentage,
} from './utils';

// ---------------------------------------------------------------------------
// Fly-to helper – lives inside <MapContainer> so it can call useMap()
// ---------------------------------------------------------------------------

function FlyToVehicle({ vehicle, markerRefs, center, resetTrigger }) {
  const map = useMap();

  useEffect(() => {
    let timeout;

    if (vehicle) {
      map.flyTo([vehicle.latitude, vehicle.longitude], 16, { duration: 1.2 });

      // Open the marker popup after fly animation finishes
      timeout = setTimeout(() => {
        const ref = markerRefs.current?.[vehicle.vehicleNumber];
        if (ref) ref.openPopup();
      }, 1300);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [vehicle, map, markerRefs]);

  useEffect(() => {
    if (resetTrigger > 0) {
      map.flyTo(center, 5, { duration: 1.2 });
      map.closePopup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger, map]);

  return null;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LiveTrackingView() {
  const theme = useTheme();
  const { data, isLoading, isError, dataUpdatedAt } = useAllGps();
  const { data: activeTripsMap } = useActiveTripsMap();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fuelFilter, setFuelFilter] = useState('all');
  const [lastSeenFilter, setLastSeenFilter] = useState('all');
  const [resetTrigger, setResetTrigger] = useState(0);
  const markerRefs = useRef({});

  const handleReset = () => {
    setSearch('');
    setStatusFilter('all');
    setFuelFilter('all');
    setLastSeenFilter('all');
    setSelectedVehicle(null);
    setResetTrigger((prev) => prev + 1);
  };

  // Convert object map → array
  const vehicles = useMemo(() => {
    if (!data) return [];
    return Object.entries(data)
      .map(([vehicleNumber, info]) => ({ vehicleNumber, ...info, _resolved: resolveStatus(info) }))
      .filter((v) => v.latitude && v.longitude);
  }, [data]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = vehicles;
    if (statusFilter !== 'all') {
      list = list.filter((v) => v._resolved === statusFilter);
    }

    if (fuelFilter !== 'all') {
      list = list.filter((v) => {
        const p = getFuelPercentage(v);
        if (fuelFilter === 'none') return p === null;
        if (p === null) return false;

        if (fuelFilter === 'high') return p > 70;
        if (fuelFilter === 'medium') return p >= 40 && p <= 70;
        if (fuelFilter === 'low') return p < 40;
        return true;
      });
    }

    if (lastSeenFilter !== 'all') {
      const now = new Date().getTime();
      list = list.filter((v) => {
        if (!v.lastUpdatedAt) return false;
        const lastSeenTime = new Date(v.lastUpdatedAt).getTime();
        const diffHours = (now - lastSeenTime) / (1000 * 60 * 60);

        if (lastSeenFilter === '1h') return diffHours <= 1;
        if (lastSeenFilter === '12h') return diffHours <= 12;
        if (lastSeenFilter === '24h') return diffHours <= 24;
        if (lastSeenFilter === 'older') return diffHours > 24;
        return true;
      });
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((v) => v.vehicleNumber.toLowerCase().includes(q));
    }
    return list;
  }, [vehicles, search, statusFilter, fuelFilter, lastSeenFilter]);

  // Stats
  const stats = useMemo(() => {
    const s = { total: vehicles.length, running: 0, idle: 0, parked: 0, inactive: 0 };
    vehicles.forEach((v) => {
      if (v._resolved === 'running') s.running += 1;
      else if (v._resolved === 'idle') s.idle += 1;
      else if (v._resolved === 'parked') s.parked += 1;
      else s.inactive += 1;
    });
    return s;
  }, [vehicles]);

  // Center on India by default
  const center = useMemo(() => {
    if (filtered.length === 0) return [22.5, 78.9];
    const lat = filtered.reduce((sum, v) => sum + v.latitude, 0) / filtered.length;
    const lng = filtered.reduce((sum, v) => sum + v.longitude, 0) / filtered.length;
    return [lat, lng];
  }, [filtered]);

  // Timestamp of last update
  const lastUpdated = dataUpdatedAt ? fToNow(dataUpdatedAt) : '—';

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: stats.total },
    { value: 'running', label: 'Running', color: 'success', count: stats.running },
    { value: 'idle', label: 'Idle', color: 'warning', count: stats.idle },
    { value: 'parked', label: 'Parked', color: 'info', count: stats.parked },
    { value: 'inactive', label: 'Inactive', color: 'error', count: stats.inactive },
  ];

  const renderTabs = (
    <Tabs
      value={statusFilter}
      onChange={(e, newValue) => setStatusFilter(newValue)}
      sx={{
        px: 2.5,
        boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
      }}
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.label}
          iconPosition="end"
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === statusFilter) && 'filled') || 'soft'}
              color={tab.color}
            >
              {tab.count}
            </Label>
          }
        />
      ))}
    </Tabs>
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  // -------------------------------------------------------------------
  // Map content (shared between normal & fullscreen)
  // -------------------------------------------------------------------
  const mapContent = (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        '& .leaflet-layer, & .leaflet-control-zoom-in, & .leaflet-control-zoom-out, & .leaflet-control-attribution':
          {
            filter: isDarkMode
              ? 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) grayscale(60%)'
              : 'none',
          },
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.7)',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {filtered.length === 0 && !isLoading ? (
        <EmptyContent
          filled
          title="No vehicles found"
          description={
            search
              ? 'No vehicles match your search.'
              : 'No GPS data available. Make sure GPS integration is enabled.'
          }
          imgUrl={`${CONFIG.site.basePath}/assets/illustrations/illustration-dashboard.webp`}
          sx={{ py: 10 }}
        />
      ) : (
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToVehicle
            vehicle={selectedVehicle}
            markerRefs={markerRefs}
            center={center}
            resetTrigger={resetTrigger}
          />
          {filtered.map((v) => (
            <Marker
              key={v.vehicleNumber}
              ref={(ref) => {
                if (ref) markerRefs.current[v.vehicleNumber] = ref;
              }}
              position={[v.latitude, v.longitude]}
              icon={getMarkerIcon(v._resolved)}
            >
              <Popup>
                <Box sx={{ minWidth: 240, maxWidth: 300, mx: -1, my: -0.5 }}>
                  {/* ── Header ── */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ px: 1.5, pt: 1.5, pb: 1 }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {v.vehicleNumber}
                    </Typography>
                    <Chip
                      label={statusLabel(v._resolved)}
                      color={statusColor(v._resolved)}
                      size="small"
                      variant="filled"
                      sx={{ height: 22, fontSize: 11, fontWeight: 700 }}
                    />
                  </Stack>

                  <Divider />

                  {/* ── Body ── */}
                  <Stack spacing={0.75} sx={{ px: 1.5, py: 1.25 }}>
                    {activeTripsMap?.[v.vehicleNumber] && (
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Iconify
                          icon="mdi:highway"
                          width={15}
                          sx={{ color: 'info.main', flexShrink: 0 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Trip:{' '}
                          <Link
                            component={RouterLink}
                            to={paths.dashboard.trip.details(
                              activeTripsMap[v.vehicleNumber].tripId
                            )}
                            color="primary"
                            underline="hover"
                            sx={{ fontWeight: 600 }}
                          >
                            {activeTripsMap[v.vehicleNumber].tripNo}
                          </Link>
                        </Typography>
                      </Stack>
                    )}

                    {v.address && (
                      <Stack direction="row" spacing={0.75} alignItems="flex-start">
                        <Iconify
                          icon="mingcute:location-fill"
                          width={15}
                          sx={{ color: 'error.main', flexShrink: 0, mt: 0.15 }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {v.address}
                        </Typography>
                      </Stack>
                    )}

                    <StatusInsight vehicle={v} iconSize={15} />

                    <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                      {v.speed != null && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify
                            icon="solar:speedometer-bold"
                            width={15}
                            sx={{ color: 'text.disabled' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {v.speed} km/h
                          </Typography>
                        </Stack>
                      )}

                      {v.totalOdometer != null && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon="mdi:counter" width={15} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            {v.totalOdometer.toLocaleString()} km
                          </Typography>
                        </Stack>
                      )}

                      {hasFuelData(v) && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify
                            icon="solar:gas-station-bold"
                            width={15}
                            sx={{ color: getFuelIconColor(v) }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {getFuelText(v)}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>

                  {/* ── Action Buttons ── */}
                  <Divider />
                  <Stack direction="row" spacing={1} sx={{ px: 1.5, py: 1.5 }}>
                    <Button
                      component={RouterLink}
                      href={paths.dashboard.expense.new}
                      size="small"
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={(e) => e.stopPropagation()}
                    >
                      Add Expense
                    </Button>
                    <Button
                      fullWidth
                      component={RouterLink}
                      href={
                        activeTripsMap?.[v.vehicleNumber]
                          ? `${paths.dashboard.subtrip.jobCreate}?id=${activeTripsMap[v.vehicleNumber].tripId}`
                          : paths.dashboard.subtrip.jobCreate
                      }
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Add Job
                    </Button>
                  </Stack>

                  {/* ── Footer ── */}
                  {v.lastUpdatedAt && (
                    <>
                      <Divider />
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{ px: 1.5, py: 1 }}
                      >
                        <Iconify
                          icon="solar:clock-circle-bold"
                          width={13}
                          sx={{ color: 'text.disabled' }}
                        />
                        <Typography variant="caption" color="text.disabled">
                          {fToNow(v.lastUpdatedAt)} ago
                        </Typography>
                      </Stack>
                    </>
                  )}
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {/* Overlay Vehicle List */}
      {filtered.length > 0 && (
        <Card
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            width: { xs: 'calc(100% - 32px)', sm: 400 },
            maxHeight: isListExpanded ? '75%' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: theme.customShadows.z24,
            bgcolor: 'background.paper',
            transition: 'max-height 0.3s ease',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            onClick={() => setIsListExpanded(!isListExpanded)}
            sx={{
              p: 2,
              pb: isListExpanded ? 1.5 : 2,
              borderBottom: (t) => (isListExpanded ? `solid 1px ${t.palette.divider}` : 'none'),
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Vehicles List
              </Typography>
              <Chip
                label={filtered.length}
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
              />
            </Stack>
            <IconButton size="small" sx={{ mr: -1 }}>
              <Iconify
                icon={isListExpanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-upward-fill'}
              />
            </IconButton>
          </Stack>

          {isListExpanded && (
            <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1 }}>
              <Stack spacing={1}>
                {filtered.map((v) => (
                  <Box
                    key={v.vehicleNumber}
                    onClick={() => setSelectedVehicle(v)}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor:
                        selectedVehicle?.vehicleNumber === v.vehicleNumber
                          ? alpha(theme.palette.primary.main, 0.12)
                          : 'background.neutral',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border:
                        selectedVehicle?.vehicleNumber === v.vehicleNumber
                          ? `1.5px solid ${theme.palette.primary.main}`
                          : '1.5px solid transparent',
                      '&:hover': {
                        bgcolor:
                          selectedVehicle?.vehicleNumber === v.vehicleNumber
                            ? alpha(theme.palette.primary.main, 0.16)
                            : 'action.hover',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2">{v.vehicleNumber}</Typography>
                        {activeTripsMap?.[v.vehicleNumber] && (
                          <Chip
                            label={activeTripsMap[v.vehicleNumber].tripNo}
                            size="small"
                            variant="outlined"
                            color="info"
                            component={RouterLink}
                            to={paths.dashboard.trip.details(
                              activeTripsMap[v.vehicleNumber].tripId
                            )}
                            clickable
                            onClick={(e) => e.stopPropagation()}
                            sx={{ height: 20, fontSize: 10, cursor: 'pointer' }}
                          />
                        )}
                      </Stack>
                      <Chip
                        label={statusLabel(v._resolved)}
                        color={statusColor(v._resolved)}
                        size="small"
                        variant="soft"
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    </Stack>
                    {v.address && (
                      <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
                        <Iconify
                          icon="mingcute:location-fill"
                          width={14}
                          sx={{ color: 'text.disabled', flexShrink: 0, mt: 0.25 }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {v.address}
                        </Typography>
                      </Stack>
                    )}
                    {activeTripsMap?.[v.vehicleNumber]?.loadedSubtrips?.slice(-1)?.map((st, i) => (
                      <Box
                        key={i}
                        sx={{
                          mt: 1,
                          p: 1,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: (t) => `1px dashed ${t.palette.divider}`,
                        }}
                      >
                        {st.driverName && (
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mb: 0.5 }}
                          >
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Iconify
                                icon="mdi:account"
                                width={14}
                                sx={{ color: 'text.disabled' }}
                              />
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                {st.driverName}
                              </Typography>
                            </Stack>
                            {st.driverCellNo && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const num = st.driverCellNo.replace(/\D/g, '');
                                  const waNum = num.length <= 10 ? `91${num}` : num;
                                  window.open(`https://wa.me/${waNum}`, '_blank');
                                }}
                                sx={{ p: 0, '&:hover': { bgcolor: 'transparent' } }}
                              >
                                <Iconify icon="logos:whatsapp-icon" width={14} />
                              </IconButton>
                            )}
                          </Stack>
                        )}
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                          <Iconify
                            icon="mdi:truck-delivery-outline"
                            width={14}
                            sx={{ color: 'text.disabled', flexShrink: 0 }}
                          />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {st.loadingPoint || 'N/A'} ➔ {st.unloadingPoint || 'N/A'}
                          </Typography>
                        </Stack>
                        {st.customerName && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Iconify
                              icon="mdi:domain"
                              width={14}
                              sx={{ color: 'text.disabled', flexShrink: 0 }}
                            />
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {st.customerName}
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                    ))}
                    <StatusInsight vehicle={v} />
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify
                          icon="solar:speedometer-bold"
                          width={14}
                          sx={{ color: 'text.disabled' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {v.speed != null ? `${v.speed} km/h` : '—'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify
                          icon="solar:gas-station-bold"
                          width={14}
                          sx={{ color: getFuelIconColor(v) }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {getFuelText(v)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify
                          icon="solar:clock-circle-bold"
                          width={14}
                          sx={{ color: 'text.disabled' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {v.lastUpdatedAt ? `${fToNow(v.lastUpdatedAt)} ago` : '—'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Card>
      )}
    </Box>
  );

  // -------------------------------------------------------------------
  // Floating toolbar (used inside fullscreen)
  // -------------------------------------------------------------------
  const toolbar = (
    <Stack
      direction="column"
      sx={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        zIndex: 1100,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: theme.customShadows.z16,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2, pb: 0 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Live Tracking
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ width: 130, display: { xs: 'none', md: 'inline-flex' } }}>
            <InputLabel id="toolbar-fuel-label">Fuel</InputLabel>
            <Select
              labelId="toolbar-fuel-label"
              value={fuelFilter === 'all' ? '' : fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value || 'all')}
              input={<OutlinedInput label="Fuel" />}
              MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
            >
              <MenuItem value="">All</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem value="high">
                <Label variant="soft" color="success">
                  High
                </Label>
              </MenuItem>
              <MenuItem value="medium">
                <Label variant="soft" color="warning">
                  Medium
                </Label>
              </MenuItem>
              <MenuItem value="low">
                <Label variant="soft" color="error">
                  Low
                </Label>
              </MenuItem>
              <MenuItem value="none">
                <Label variant="soft" color="default">
                  No Data
                </Label>
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: 140, display: { xs: 'none', md: 'inline-flex' } }}>
            <InputLabel id="toolbar-last-seen-label">Last Seen</InputLabel>
            <Select
              labelId="toolbar-last-seen-label"
              value={lastSeenFilter === 'all' ? '' : lastSeenFilter}
              onChange={(e) => setLastSeenFilter(e.target.value || 'all')}
              input={<OutlinedInput label="Last Seen" />}
              MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
            >
              <MenuItem value="">All</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem value="1h">
                <Label variant="soft" color="success">
                  &le; 1h
                </Label>
              </MenuItem>
              <MenuItem value="12h">
                <Label variant="soft" color="info">
                  &le; 12h
                </Label>
              </MenuItem>
              <MenuItem value="24h">
                <Label variant="soft" color="warning">
                  &le; 24h
                </Label>
              </MenuItem>
              <MenuItem value="older">
                <Label variant="soft" color="error">
                  &gt; 24h
                </Label>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: 150, md: 220 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={18} />
                </InputAdornment>
              ),
            }}
          />

          <Tooltip title={isDarkMode ? 'Light map' : 'Dark map'}>
            <IconButton onClick={() => setIsDarkMode(!isDarkMode)} size="small">
              <Iconify
                icon={isDarkMode ? 'mdi:white-balance-sunny' : 'mdi:moon-waning-crescent'}
                width={22}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset map">
            <IconButton onClick={handleReset} size="small">
              <Iconify icon="mdi:refresh" width={22} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Exit fullscreen">
            <IconButton onClick={() => setIsFullscreen(false)} size="small" color="error">
              <Iconify icon="mdi:fullscreen-exit" width={22} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {renderTabs}
    </Stack>
  );

  // -------------------------------------------------------------------
  // Fullscreen mode
  // -------------------------------------------------------------------
  if (isFullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          bgcolor: 'background.default',
        }}
      >
        {toolbar}
        {mapContent}
      </Box>
    );
  }

  // -------------------------------------------------------------------
  // Normal mode
  // -------------------------------------------------------------------
  return (
    <Box sx={{ pb: { xs: 2, md: 3 }, height: '100%' }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3, px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 } }}
      >
        <Box>
          <Typography variant="h4">Live Tracking</Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="caption" color="text.disabled" sx={{ pl: 1, mr: 1 }}>
            Updated {lastUpdated} ago
          </Typography>
          <Tooltip title={isDarkMode ? 'Light map' : 'Dark map'}>
            <IconButton onClick={() => setIsDarkMode(!isDarkMode)} size="small">
              <Iconify
                icon={isDarkMode ? 'mdi:white-balance-sunny' : 'mdi:moon-waning-crescent'}
                width={22}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset map">
            <IconButton onClick={handleReset} size="small">
              <Iconify icon="mdi:refresh" width={22} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <IconButton onClick={() => setIsFullscreen(true)} size="small">
              <Iconify icon="mdi:fullscreen" width={22} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Card sx={{ mx: { xs: 2, md: 3 }, mb: 3 }}>
        {renderTabs}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ p: 2 }}
          alignItems="center"
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search vehicle number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth size="small" sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0 }}>
            <InputLabel id="live-tracking-fuel-level-label">Fuel Level</InputLabel>
            <Select
              labelId="live-tracking-fuel-level-label"
              value={fuelFilter === 'all' ? '' : fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value || 'all')}
              input={<OutlinedInput label="Fuel Level" />}
              MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
            >
              <MenuItem value="">All</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem value="high">
                <Label variant="soft" color="success">
                  High (&gt; 70%)
                </Label>
              </MenuItem>
              <MenuItem value="medium">
                <Label variant="soft" color="warning">
                  Medium (40-70%)
                </Label>
              </MenuItem>
              <MenuItem value="low">
                <Label variant="soft" color="error">
                  Low (&lt; 40%)
                </Label>
              </MenuItem>
              <MenuItem value="none">
                <Label variant="soft" color="default">
                  No Fuel Data
                </Label>
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0 }}>
            <InputLabel id="live-tracking-last-seen-label">Last Seen</InputLabel>
            <Select
              labelId="live-tracking-last-seen-label"
              value={lastSeenFilter === 'all' ? '' : lastSeenFilter}
              onChange={(e) => setLastSeenFilter(e.target.value || 'all')}
              input={<OutlinedInput label="Last Seen" />}
              MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
            >
              <MenuItem value="">All</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem value="1h">
                <Label variant="soft" color="success">
                  Last 1 Hour
                </Label>
              </MenuItem>
              <MenuItem value="12h">
                <Label variant="soft" color="info">
                  Last 12 Hours
                </Label>
              </MenuItem>
              <MenuItem value="24h">
                <Label variant="soft" color="warning">
                  Last 24 Hours
                </Label>
              </MenuItem>
              <MenuItem value="older">
                <Label variant="soft" color="error">
                  Older than 24h
                </Label>
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Error */}
      {isError && (
        <Alert severity="error" sx={{ mx: { xs: 2, md: 3 }, mb: 3 }}>
          Failed to fetch GPS data. Please check that GPS integration is enabled for your tenant.
        </Alert>
      )}

      {/* Map */}
      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          height: { xs: 500, md: 'calc(100vh - 350px)' },
          mx: { xs: 2, md: 3 },
        }}
      >
        {mapContent}
      </Card>
    </Box>
  );
}
