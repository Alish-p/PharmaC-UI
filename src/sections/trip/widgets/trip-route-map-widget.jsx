import 'leaflet/dist/leaflet.css';

import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';

import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Divider,
  Skeleton,
  CardHeader,
  Typography,
} from '@mui/material';

import axios from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';
import MapWithMultiRoute from 'src/components/map/map-with-multi-route';

// -----------------------------------------------------------------------

const ROUTE_COLORS = [
  '#1976d2',
  '#9c27b0',
  '#e65100',
  '#00838f',
  '#c62828',
  '#558b2f',
  '#6a1b9a',
  '#00695c',
];

// -----------------------------------------------------------------------
// Data fetching helpers
// -----------------------------------------------------------------------

async function geocodePincode(pincode) {
  if (!pincode) return null;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`
  );
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

async function fetchRouteForSubtrip(ewayBill) {
  const { data: ewb } = await axios.get(`/api/ewaybill/${ewayBill}`);
  const [from, to] = await Promise.all([
    geocodePincode(ewb?.pincode_of_consignor),
    geocodePincode(ewb?.pincode_of_consignee),
  ]);
  return { ewb, from, to };
}

// -----------------------------------------------------------------------
// Hook — returns an entry for EVERY subtrip, with a status field
// -----------------------------------------------------------------------

// status: 'ok' | 'no-ewaybill' | 'geocode-failed' | 'loading'
function useSubtripRoutes(subtrips = []) {
  // Build metadata for every subtrip so we can show them all in order
  const allMeta = subtrips.map((st) => ({
    id: st._id,
    ewayBill: st.ewayBill || null,
    subtripNo: st.subtripNo,
    loadingPoint: st.loadingPoint,
    unloadingPoint: st.unloadingPoint,
  }));

  // Only fire queries for subtrips that have an ewayBill
  const queries = useQueries({
    queries: allMeta.map((meta) => ({
      queryKey: ['trip-route', meta.ewayBill],
      queryFn: () => fetchRouteForSubtrip(meta.ewayBill),
      staleTime: Infinity,
      enabled: Boolean(meta.ewayBill),
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);

  // Build a unified list for every subtrip
  const entries = allMeta.map((meta, i) => {
    // No e-waybill at all
    if (!meta.ewayBill) {
      return {
        ...meta,
        status: 'no-ewaybill',
        from: null,
        to: null,
      };
    }

    const q = queries[i];
    if (q.isLoading) {
      return { ...meta, status: 'loading', from: null, to: null };
    }

    const result = q.data;
    if (!result || (!result.from && !result.to)) {
      return { ...meta, status: 'geocode-failed', from: null, to: null };
    }

    const { from, to, ewb } = result;
    return {
      ...meta,
      status: 'ok',
      from,
      to,
      loadingPoint: meta.loadingPoint || ewb?.place_of_consignor || '—',
      unloadingPoint: meta.unloadingPoint || ewb?.place_of_consignee || '—',
      fromPopup: (
        <>
          <strong>Job #{meta.subtripNo}</strong>
          <br />
          Origin: {meta.loadingPoint || ewb?.place_of_consignor || 'N/A'}
        </>
      ),
      toPopup: (
        <>
          <strong>Job #{meta.subtripNo}</strong>
          <br />
          Destination: {meta.unloadingPoint || ewb?.place_of_consignee || 'N/A'}
        </>
      ),
    };
  });

  // Only 'ok' entries go to the map
  const mapRoutes = entries.filter((e) => e.status === 'ok');

  return { entries, mapRoutes, isLoading };
}

// -----------------------------------------------------------------------
// Chip label & style per status
// -----------------------------------------------------------------------

function getChipProps(entry, index, isVisible) {
  const color = ROUTE_COLORS[index % ROUTE_COLORS.length];

  if (entry.status === 'no-ewaybill') {
    return {
      label: `${index + 1}. #${entry.subtripNo}: no e-waybill`,
      disabled: true,
      variant: 'outlined',
      sx: { fontSize: 11, borderColor: 'divider', color: 'text.disabled' },
    };
  }

  if (entry.status === 'geocode-failed') {
    return {
      label: `${index + 1}. #${entry.subtripNo}: could not geocode`,
      disabled: true,
      variant: 'outlined',
      sx: { fontSize: 11, borderColor: 'warning.main', color: 'warning.main' },
    };
  }

  if (entry.status === 'loading') {
    return {
      label: `${index + 1}. #${entry.subtripNo}: loading…`,
      disabled: true,
      variant: 'outlined',
      sx: { fontSize: 11, borderColor: 'divider', color: 'text.disabled' },
    };
  }

  // status === 'ok'
  return {
    label: `${index + 1}. #${entry.subtripNo}: ${entry.loadingPoint} → ${entry.unloadingPoint}`,
    variant: isVisible ? 'filled' : 'outlined',
    sx: {
      fontSize: 11,
      cursor: 'pointer',
      bgcolor: isVisible ? color : 'transparent',
      color: isVisible ? '#fff' : 'text.secondary',
      borderColor: color,
      '&:hover': { bgcolor: isVisible ? color : `${color}22` },
    },
  };
}

// -----------------------------------------------------------------------
// Widget
// -----------------------------------------------------------------------

export function TripRouteMapWidget({ subtrips = [] }) {
  const { entries, mapRoutes, isLoading } = useSubtripRoutes(subtrips);

  // Track hidden routes by their index inside mapRoutes
  const [hiddenSet, setHiddenSet] = useState(new Set());

  const toggleRoute = (mapIndex) => {
    setHiddenSet((prev) => {
      const next = new Set(prev);
      if (next.has(mapIndex)) {
        next.delete(mapIndex);
      } else {
        next.add(mapIndex);
      }
      return next;
    });
  };

  const routesWithVisibility = mapRoutes.map((r, i) => ({
    ...r,
    visible: !hiddenSet.has(i),
  }));

  // Build a mapping: for each 'ok' entry, which mapRoutes index does it correspond to?
  let mapIdx = 0;
  const entryToMapIndex = entries.map((e) => {
    if (e.status === 'ok') {
      const idx = mapIdx;
      mapIdx += 1;
      return idx;
    }
    return -1;
  });

  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:map-marker-path" width={22} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1">Trip Route Map</Typography>
          </Stack>
        }
        subheader={
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Click a job to show / hide it on the map
            </Typography>

            {/* Ordered list of ALL jobs */}
            {entries.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {entries.map((entry, i) => {
                  const mi = entryToMapIndex[i];
                  const isVisible = mi >= 0 ? !hiddenSet.has(mi) : false;
                  const chipProps = getChipProps(entry, i, isVisible);

                  return (
                    <Chip
                      key={entry.id || i}
                      size="small"
                      onClick={mi >= 0 ? () => toggleRoute(mi) : undefined}
                      {...chipProps}
                    />
                  );
                })}
              </Stack>
            )}
          </Stack>
        }
      />

      <Divider sx={{ mt: 2 }} />

      <Box sx={{ p: 2, height: 400 }}>
        {isLoading ? (
          <Skeleton variant="rounded" width="100%" height="100%" />
        ) : mapRoutes.length === 0 ? (
          <Alert severity="info" variant="outlined">
            No map locations available for this trip&apos;s jobs
          </Alert>
        ) : (
          <Box
            sx={{
              height: '100%',
              borderRadius: 1,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <MapWithMultiRoute routes={routesWithVisibility} />
          </Box>
        )}
      </Box>
    </Card>
  );
}
