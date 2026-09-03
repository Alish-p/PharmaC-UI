import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import {
  Popup,
  useMap,
  Marker,
  Polyline,
  TileLayer,
  MapContainer,
  CircleMarker,
} from 'react-leaflet';

import {
  Box,
  Card,
  Stack,
  Alert,
  Divider,
  Skeleton,
  Typography,
  CardHeader,
  CardContent,
} from '@mui/material';

import { useGpsSnapshots } from 'src/query/use-gps-snapshots';

import { Iconify } from 'src/components/iconify';

import { ScrollableTimelinePicker } from './scrollable-timeline-picker';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPEED_THRESHOLDS = [
  { max: 0, color: '#ef4444', label: 'Stopped' },
  { max: 20, color: '#f97316', label: 'Slow' },
  { max: 60, color: '#eab308', label: 'Moderate' },
  { max: Infinity, color: '#22c55e', label: 'Normal' },
];

const HALT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSpeedColor(speed) {
  const tier = SPEED_THRESHOLDS.find((t) => speed <= t.max);
  return tier ? tier.color : SPEED_THRESHOLDS[SPEED_THRESHOLDS.length - 1].color;
}

function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString([], { day: '2-digit', month: 'short' });
}

/**
 * Build polyline segments colored by speed.
 * Each segment is an array of [lat, lng] pairs with a single color.
 */
function buildSpeedSegments(snapshots) {
  if (snapshots.length < 2) return [];

  const segments = [];
  let currentColor = getSpeedColor(snapshots[0].speed || 0);
  let currentPositions = [[snapshots[0].latitude, snapshots[0].longitude]];

  for (let i = 1; i < snapshots.length; i += 1) {
    const color = getSpeedColor(snapshots[i].speed || 0);
    const pos = [snapshots[i].latitude, snapshots[i].longitude];

    if (color === currentColor) {
      currentPositions.push(pos);
    } else {
      // Close previous segment with this point to avoid gaps
      currentPositions.push(pos);
      segments.push({ color: currentColor, positions: [...currentPositions] });
      currentColor = color;
      currentPositions = [pos];
    }
  }

  if (currentPositions.length > 1) {
    segments.push({ color: currentColor, positions: currentPositions });
  }

  return segments;
}

/**
 * Detect halts: consecutive snapshots with speed === 0 (or status idle/parked)
 * for >= HALT_DURATION_MS.
 */
function detectHalts(snapshots) {
  const halts = [];
  let haltStart = null;
  let haltIdx = -1;

  for (let i = 0; i < snapshots.length; i += 1) {
    const s = snapshots[i];
    const isIdle =
      s.speed === 0 ||
      s.currentStatus?.toLowerCase() === 'idle' ||
      s.currentStatus?.toLowerCase() === 'parked';

    if (isIdle) {
      if (haltStart === null) {
        haltStart = new Date(s.timestamp).getTime();
        haltIdx = i;
      }
    } else if (haltStart !== null) {
      const duration = new Date(s.timestamp).getTime() - haltStart;
      if (duration >= HALT_DURATION_MS) {
        halts.push({
          latitude: snapshots[haltIdx].latitude,
          longitude: snapshots[haltIdx].longitude,
          address: snapshots[haltIdx].address || 'Unknown location',
          startTime: snapshots[haltIdx].timestamp,
          endTime: snapshots[i - 1].timestamp,
          duration,
        });
      }
      haltStart = null;
      haltIdx = -1;
    }
  }

  // Check trailing halt
  if (haltStart !== null) {
    const lastSnap = snapshots[snapshots.length - 1];
    const duration = new Date(lastSnap.timestamp).getTime() - haltStart;
    if (duration >= HALT_DURATION_MS) {
      halts.push({
        latitude: snapshots[haltIdx].latitude,
        longitude: snapshots[haltIdx].longitude,
        address: snapshots[haltIdx].address || 'Unknown location',
        startTime: snapshots[haltIdx].timestamp,
        endTime: lastSnap.timestamp,
        duration,
      });
    }
  }

  return halts;
}

/**
 * Detect refueling events: continuous fuel increases of at least 20 Liters.
 */
function detectRefuelings(snapshots) {
  const refuelings = [];
  if (snapshots.length < 2) return refuelings;

  let currentRefuel = null;

  const finalizeRefuel = (refuel) => {
    const totalIncrease = refuel.maxFuel - refuel.startFuel;
    if (totalIncrease >= 20) {
      refuelings.push({
        latitude: refuel.endSnapshot.latitude,
        longitude: refuel.endSnapshot.longitude,
        address: refuel.endSnapshot.address || 'Unknown location',
        timestamp: refuel.endSnapshot.timestamp,
        startTime: refuel.startSnapshot.timestamp,
        endTime: refuel.endSnapshot.timestamp,
        startFuel: Math.round(refuel.startFuel),
        endFuel: Math.round(refuel.maxFuel),
        volumeAdded: Math.round(totalIncrease),
      });
    }
  };

  for (let i = 1; i < snapshots.length; i += 1) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];

    if (prev.fuel == null || curr.fuel == null) {
      if (currentRefuel) {
        finalizeRefuel(currentRefuel);
        currentRefuel = null;
      }
    } else {
      const diff = curr.fuel - prev.fuel;

      if (diff > 0) {
        if (!currentRefuel) {
          currentRefuel = {
            startSnapshot: prev,
            endSnapshot: curr,
            startFuel: prev.fuel,
            maxFuel: curr.fuel,
          };
        } else {
          currentRefuel.endSnapshot = curr;
          currentRefuel.maxFuel = Math.max(currentRefuel.maxFuel, curr.fuel);
        }
      } else if (diff < -2) {
        if (currentRefuel) {
          finalizeRefuel(currentRefuel);
          currentRefuel = null;
        }
      } else if (currentRefuel) {
        currentRefuel.endSnapshot = curr;
      }
    }
  }

  if (currentRefuel) {
    finalizeRefuel(currentRefuel);
  }

  return refuelings;
}

/**
 * Compute trip stats from snapshots.
 */
function computeStats(snapshots) {
  if (snapshots.length === 0) {
    return { totalDistance: 0, avgSpeed: 0, maxSpeed: 0, duration: 0, fuelConsumed: null };
  }

  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];

  // Distance from odometer
  const totalDistance =
    first.odometer != null && last.odometer != null
      ? Math.max(0, last.odometer - first.odometer)
      : 0;

  // Speed stats (non-zero readings)
  const movingSpeeds = snapshots.map((s) => s.speed || 0).filter((s) => s > 0);
  const avgSpeed =
    movingSpeeds.length > 0 ? movingSpeeds.reduce((a, b) => a + b, 0) / movingSpeeds.length : 0;
  const maxSpeed = movingSpeeds.length > 0 ? Math.max(...movingSpeeds) : 0;

  // Duration
  const duration = new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime();

  // Fuel consumed
  const fuelConsumed =
    first.fuel != null && last.fuel != null ? Math.max(0, first.fuel - last.fuel) : null;

  return {
    totalDistance,
    avgSpeed: Math.round(avgSpeed),
    maxSpeed: Math.round(maxSpeed),
    duration,
    fuelConsumed,
  };
}

// ---------------------------------------------------------------------------
// Truck marker icon
// ---------------------------------------------------------------------------

function createTruckIcon(color = '#1976d2') {
  return L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:${color};
      border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:18px;
      transition: all 0.3s ease;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5m1.5-9H17V12h4.46L19.5 9.5M6 18.5A1.5 1.5 0 0 1 4.5 17 1.5 1.5 0 0 1 6 15.5 1.5 1.5 0 0 1 7.5 17 1.5 1.5 0 0 1 6 18.5M20 8l3 4v5h-2a3 3 0 0 1-3 3 3 3 0 0 1-3-3H9a3 3 0 0 1-3 3 3 3 0 0 1-3-3H1V6c0-1.11.89-2 2-2h14v4h3Z"/>
      </svg>
    </div>`,
  });
}

function createHaltIcon() {
  return L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
    html: `<div style="
      width:24px;height:24px;border-radius:50%;
      background:#ef4444;
      border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:12px;font-weight:700;
      font-family:Inter,system-ui,sans-serif;
    ">■</div>`,
  });
}

function createRefuelIcon() {
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:#0284c7;
      border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:#fff;
      transition: all 0.3s ease;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.34 0 .65-.08.94-.21v7.12c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.66-1.34-3-3-3H4c-1.66 0-3 1.34-3 3v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9.38c.81-.43 1.27-1.29 1.27-2.15 0-.85-.46-1.71-1.27-2.15zM8 12H3V5h5v7zm10-2.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
      </svg>
    </div>`,
  });
}

// ---------------------------------------------------------------------------
// Map helper components
// ---------------------------------------------------------------------------

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p[0], p[1]]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, points]);

  return null;
}

function AnimatedMarker({ position, icon }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  return <Marker ref={markerRef} position={position} icon={icon} />;
}

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------

function StatsBar({ stats, haltCount, refuels = [] }) {
  const refuelsCount = refuels.length;
  const totalRefueled = refuels.reduce((acc, r) => acc + r.volumeAdded, 0);

  const items = [
    {
      icon: 'mdi:map-marker-distance',
      label: 'Distance',
      value: `${stats.totalDistance} km`,
      color: '#3b82f6',
    },
    {
      icon: 'mdi:speedometer',
      label: 'Avg Speed',
      value: `${stats.avgSpeed} km/h`,
      color: '#22c55e',
    },
    {
      icon: 'mdi:speedometer-medium',
      label: 'Max Speed',
      value: `${stats.maxSpeed} km/h`,
      color: '#f97316',
    },
    {
      icon: 'mdi:timer-outline',
      label: 'Duration',
      value: formatDuration(stats.duration),
      color: '#8b5cf6',
    },
    {
      icon: 'mdi:pause-circle-outline',
      label: 'Stops',
      value: String(haltCount),
      color: '#ef4444',
    },
    {
      icon: 'mdi:gas-station',
      label: 'Refuels',
      value: `${refuelsCount} (${totalRefueled} L)`,
      color: '#0284c7',
    },
  ];

  if (stats.fuelConsumed != null) {
    items.push({
      icon: 'mdi:fuel',
      label: 'Fuel Used',
      value: `${stats.fuelConsumed} L`,
      color: '#eab308',
    });
  }

  return (
    <Stack
      direction="row"
      spacing={0}
      divider={<Divider orientation="vertical" flexItem />}
      sx={{
        bgcolor: 'background.neutral',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            flex: 1,
            py: 1.5,
            px: 1,
            textAlign: 'center',
            minWidth: 0,
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
            <Iconify icon={item.icon} width={16} sx={{ color: item.color, flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {item.label}
            </Typography>
          </Stack>
          <Typography variant="subtitle2" noWrap sx={{ mt: 0.25 }}>
            {item.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Speed legend
// ---------------------------------------------------------------------------

function SpeedLegend() {
  return (
    <Stack direction="row" spacing={1} sx={{ px: 2, pb: 1 }}>
      {SPEED_THRESHOLDS.map((tier) => (
        <Stack key={tier.label} direction="row" spacing={0.5} alignItems="center">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: tier.color,
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {tier.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Map component
// ---------------------------------------------------------------------------

function GpsTrailMap({ snapshots, halts, refuels = [], currentIndex }) {
  const segments = useMemo(() => buildSpeedSegments(snapshots), [snapshots]);

  const truckIcon = useMemo(() => createTruckIcon('#1976d2'), []);
  const haltIcon = useMemo(() => createHaltIcon(), []);
  const refuelIcon = useMemo(() => createRefuelIcon(), []);

  const currentSnap = snapshots[currentIndex] || snapshots[0];
  const vehiclePosition = currentSnap ? [currentSnap.latitude, currentSnap.longitude] : null;

  // All points for bounds fitting
  const allPoints = useMemo(() => snapshots.map((s) => [s.latitude, s.longitude]), [snapshots]);

  // Trail up to current index (for animation effect)
  const trailUpToCurrent = useMemo(
    () => snapshots.slice(0, currentIndex + 1).map((s) => [s.latitude, s.longitude]),
    [snapshots, currentIndex]
  );

  if (!vehiclePosition) return null;

  return (
    <MapContainer
      center={vehiclePosition}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds points={allPoints} />

      {/* Speed-colored polyline segments */}
      {segments.map((seg, i) => (
        <Polyline
          // eslint-disable-next-line react/no-array-index-key
          key={`seg-${i}`}
          positions={seg.positions}
          pathOptions={{
            color: seg.color,
            weight: 4,
            opacity: 0.85,
          }}
        />
      ))}

      {/* Animated trail highlight up to current scrubber position */}
      {trailUpToCurrent.length > 1 && (
        <Polyline
          positions={trailUpToCurrent}
          pathOptions={{
            color: '#1976d2',
            weight: 6,
            opacity: 0.25,
          }}
        />
      )}

      {/* Vehicle marker at current position */}
      <AnimatedMarker position={vehiclePosition} icon={truckIcon} />

      {/* Start marker */}
      {snapshots.length > 0 && (
        <CircleMarker
          center={[snapshots[0].latitude, snapshots[0].longitude]}
          radius={8}
          pathOptions={{ fillColor: '#22c55e', fillOpacity: 1, color: '#fff', weight: 2 }}
        >
          <Popup>
            <strong>Trip Start</strong>
            <br />
            {formatDate(snapshots[0].timestamp)} {formatTime(snapshots[0].timestamp)}
            <br />
            {snapshots[0].address || ''}
          </Popup>
        </CircleMarker>
      )}

      {/* End marker (only if not at start) */}
      {snapshots.length > 1 && (
        <CircleMarker
          center={[
            snapshots[snapshots.length - 1].latitude,
            snapshots[snapshots.length - 1].longitude,
          ]}
          radius={8}
          pathOptions={{ fillColor: '#ef4444', fillOpacity: 1, color: '#fff', weight: 2 }}
        >
          <Popup>
            <strong>Latest Position</strong>
            <br />
            {formatDate(snapshots[snapshots.length - 1].timestamp)}{' '}
            {formatTime(snapshots[snapshots.length - 1].timestamp)}
            <br />
            {snapshots[snapshots.length - 1].address || ''}
          </Popup>
        </CircleMarker>
      )}

      {/* Halt markers */}
      {halts.map((halt, i) => (
        <Marker
          // eslint-disable-next-line react/no-array-index-key
          key={`halt-${i}`}
          position={[halt.latitude, halt.longitude]}
          icon={haltIcon}
        >
          <Popup>
            <strong>Stop ({formatDuration(halt.duration)})</strong>
            <br />
            {halt.address}
            <br />
            {formatDate(halt.startTime)} {formatTime(halt.startTime)} –{' '}
            {formatDate(halt.startTime) !== formatDate(halt.endTime) &&
              `${formatDate(halt.endTime)} `}
            {formatTime(halt.endTime)}
          </Popup>
        </Marker>
      ))}

      {/* Refueling markers */}
      {refuels.map((refuel, i) => (
        <Marker
          // eslint-disable-next-line react/no-array-index-key
          key={`refuel-${i}`}
          position={[refuel.latitude, refuel.longitude]}
          icon={refuelIcon}
        >
          <Popup>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Iconify icon="mdi:gas-station" width={16} sx={{ color: '#0284c7' }} />
                <strong style={{ color: '#0284c7' }}>Refueling</strong>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                +{refuel.volumeAdded} L
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {refuel.startFuel} L → {refuel.endFuel} L
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(refuel.startTime)} {formatTime(refuel.startTime)} –{' '}
                {formatDate(refuel.startTime) !== formatDate(refuel.endTime) &&
                  `${formatDate(refuel.endTime)} `}
                {formatTime(refuel.endTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {refuel.address}
              </Typography>
            </Stack>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// ---------------------------------------------------------------------------
// Main Widget
// ---------------------------------------------------------------------------

export function TripGpsTimelineWidget({ vehicleNo, fromDate, toDate, tripStatus }) {
  const isActive = tripStatus === 'open';

  const {
    data: snapshots = [],
    isLoading,
    isError,
  } = useGpsSnapshots(vehicleNo, {
    fromDate,
    toDate: isActive ? undefined : toDate,
    isActive,
    enabled: !!vehicleNo && !!fromDate,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef(null);

  // Compute derived data
  const halts = useMemo(() => detectHalts(snapshots), [snapshots]);
  const stats = useMemo(() => computeStats(snapshots), [snapshots]);
  const refuels = useMemo(() => detectRefuelings(snapshots), [snapshots]);

  const startDate = useMemo(() => {
    if (fromDate) return new Date(fromDate);
    if (snapshots.length === 0) return new Date();
    return new Date(snapshots[0].timestamp);
  }, [snapshots, fromDate]);

  const endDate = useMemo(() => {
    if (isActive) {
      return new Date();
    }
    if (toDate) {
      return new Date(toDate);
    }
    if (snapshots.length === 0) return new Date();

    let baseEnd;
    if (snapshots.length === 1) {
      baseEnd = new Date(new Date(snapshots[0].timestamp).getTime() + 60 * 60 * 1000);
    } else {
      baseEnd = new Date(snapshots[snapshots.length - 1].timestamp);
    }
    return baseEnd;
  }, [snapshots, isActive, toDate]);

  // Keep scrubber at end for live trips when new data arrives
  useEffect(() => {
    if (isActive && snapshots.length > 0) {
      setCurrentIndex(snapshots.length - 1);
    }
  }, [isActive, snapshots.length]);

  // Playback animation
  const handlePlayToggle = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isPlaying && snapshots.length > 0) {
      playRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 300);
    } else if (playRef.current) {
      clearInterval(playRef.current);
      playRef.current = null;
    }

    return () => {
      if (playRef.current) {
        clearInterval(playRef.current);
        playRef.current = null;
      }
    };
  }, [isPlaying, snapshots.length]);

  // ------- Render -------

  // Loading state
  if (isLoading) {
    return (
      <Card variant="outlined">
        <CardHeader
          title={
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="mdi:map-marker-path" width={22} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1">GPS Journey Timeline</Typography>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          <Skeleton variant="rounded" width="100%" height={400} />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card variant="outlined">
        <CardHeader
          title={
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="mdi:map-marker-path" width={22} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1">GPS Journey Timeline</Typography>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          <Alert severity="error" variant="outlined">
            Failed to load GPS journey data. Please try again later.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (snapshots.length === 0) {
    return (
      <Card variant="outlined">
        <CardHeader
          title={
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="mdi:map-marker-path" width={22} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1">GPS Journey Timeline</Typography>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
            <Iconify icon="mdi:map-marker-off-outline" width={64} sx={{ color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary">
              GPS journey data is not available for this trip
            </Typography>
            <Typography variant="body2" color="text.disabled" textAlign="center" maxWidth={400}>
              GPS tracking data will appear here automatically for trips with GPS enabled. Data is
              recorded every 10 minutes.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Main view with data
  return (
    <Card variant="outlined">
      <CardHeader
        sx={{ mb: 2 }}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:map-marker-path" width={22} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1">GPS Journey Timeline</Typography>
          </Stack>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {snapshots.length} GPS points recorded · {formatDate(snapshots[0].timestamp)} –{' '}
            {formatDate(snapshots[snapshots.length - 1].timestamp)}
          </Typography>
        }
      />

      <Divider />

      {/* Stats Bar */}
      <Box sx={{ p: 2, pb: 1 }}>
        <StatsBar stats={stats} haltCount={halts.length} refuels={refuels} />
      </Box>

      {/* Speed Legend */}
      <SpeedLegend />

      {/* Map */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Box
          sx={{
            height: 450,
            borderRadius: 1,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <GpsTrailMap
            snapshots={snapshots}
            halts={halts}
            refuels={refuels}
            currentIndex={currentIndex}
          />
        </Box>
      </Box>

      {/* Timeline Scrubber */}
      <Box sx={{ px: 2, pb: 2.5 }}>
        <ScrollableTimelinePicker
          startDate={startDate}
          endDate={endDate}
          snapshots={snapshots}
          currentIndex={currentIndex}
          onChangeIndex={setCurrentIndex}
          isPlaying={isPlaying}
          onPlayToggle={handlePlayToggle}
        />
      </Box>
    </Card>
  );
}
