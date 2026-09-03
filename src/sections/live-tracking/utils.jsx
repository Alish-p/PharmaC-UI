import L from 'leaflet';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ---------------------------------------------------------------------------
// Marker icons by status
// ---------------------------------------------------------------------------

const TRUCK_SVG = (color) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
  <g filter="url(#shadow)">
    <path fill="${color}" stroke="#fff" stroke-width="1" d="M18 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM8.5 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
    <path fill="${color}" stroke="#fff" stroke-width="0.8" d="M3 4h10v11H3V4Zm10 2h3l3 4v5h-2.5a2 2 0 0 0-3.5 0V6Z"/>
  </g>
  <defs>
    <filter id="shadow"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.3"/></filter>
  </defs>
</svg>`;

const createStatusIcon = (color) =>
  L.divIcon({
    className: 'custom-marker',
    html: TRUCK_SVG(color),
    iconSize: [32, 32],
    iconAnchor: [16, 28],
    popupAnchor: [0, -24],
  });

const ICONS_BY_STATUS = {
  running: createStatusIcon('#16a34a'),
  idle: createStatusIcon('#d97706'),
  parked: createStatusIcon('#3b82f6'),
  inactive: createStatusIcon('#dc2626'),
  default: createStatusIcon('#6b7280'),
};

export function resolveStatus(vehicle) {
  const cs = (vehicle.currentStatus || '').toUpperCase();

  if (cs === 'RUNNING') return 'running';
  if (cs === 'IDLE') return 'idle';
  if (cs === 'PARKED') return 'parked';

  return 'inactive';
}

export function getMarkerIcon(resolved) {
  return ICONS_BY_STATUS[resolved] || ICONS_BY_STATUS.default;
}

export function statusColor(resolved) {
  if (resolved === 'running') return 'success';
  if (resolved === 'idle') return 'warning';
  if (resolved === 'parked') return 'info';
  if (resolved === 'inactive') return 'error';
  return 'default';
}

export function statusLabel(resolved) {
  if (resolved === 'running') return 'Running';
  if (resolved === 'idle') return 'Idle';
  if (resolved === 'parked') return 'Parked';
  if (resolved === 'inactive') return 'Inactive';
  return 'Unknown';
}

const STATUS_INSIGHT_MAP = {
  running: { label: 'Running', icon: 'mdi:truck-fast-outline', color: 'success.main' },
  idle: { label: 'Idle', icon: 'mdi:timer-sand', color: 'warning.main' },
  parked: { label: 'Parked', icon: 'mdi:parking', color: 'info.main' },
  inactive: { label: 'Inactive', icon: 'mdi:truck-off-road', color: 'error.main' },
};

function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 1) return 'less than a min';
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours === 0) return `~${totalMin} min`;
  if (mins === 0) return `~${hours} hr`;
  return `~${hours} hr ${mins} min`;
}

export function StatusInsight({ vehicle, iconSize = 14 }) {
  const resolved = vehicle._resolved || resolveStatus(vehicle);
  const lastStatus = vehicle.lastStatusTime;
  if (!lastStatus) return null;

  const diffMs = Date.now() - lastStatus;
  if (diffMs < 0) return null;

  const { label, icon, color } = STATUS_INSIGHT_MAP[resolved] || STATUS_INSIGHT_MAP.stopped;

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Iconify icon={icon} width={iconSize} sx={{ color, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
        {label} for {formatDuration(diffMs)}
      </Typography>
    </Stack>
  );
}

export function getFuelPercentage(v) {
  const fuelStr = v?.otherAttributes?.fuel ?? v?.fuel;
  const capacityStr = v?.otherAttributes?.fuelTankCapacity ?? v?.fuelTankCapacity;

  if (fuelStr == null || capacityStr == null) return null;

  const fuel = parseFloat(String(fuelStr).replace(/[^\d.]/g, ''));
  const capacity = parseFloat(String(capacityStr).replace(/[^\d.]/g, ''));

  if (Number.isNaN(fuel) || Number.isNaN(capacity) || capacity <= 0) return null;

  return (fuel / capacity) * 100;
}

export function getFuelIconColor(v) {
  const percentage = getFuelPercentage(v);

  if (percentage == null) return 'text.disabled';

  if (percentage > 70) return 'success.main';
  if (percentage >= 40) return 'warning.main';
  return 'error.main';
}

export function getFuelText(v) {
  const fuelStr = v?.otherAttributes?.fuel ?? v?.fuel;
  if (fuelStr == null) return '—';
  const s = String(fuelStr);
  if (s.includes(' ')) return s;
  const num = parseFloat(s.replace(/[^\d.]/g, ''));
  if (Number.isNaN(num)) return s;
  return `${Math.round(num)} L`;
}

export function hasFuelData(v) {
  return (v?.otherAttributes?.fuel ?? v?.fuel) != null;
}
