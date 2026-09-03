import L from 'leaflet';
import { useMemo, useEffect } from 'react';
import { Popup, useMap, Marker, Polyline, TileLayer, MapContainer } from 'react-leaflet';

import { createCircleIcon } from './map-icons';

// -----------------------------------------------------------------------

// A set of distinguishable route colours
const ROUTE_COLORS = [
  '#1976d2', // blue
  '#9c27b0', // purple
  '#e65100', // deep orange
  '#00838f', // teal
  '#c62828', // red
  '#558b2f', // green
  '#6a1b9a', // deep purple
  '#00695c', // dark teal
];

// Small lat/lng offsets so overlapping markers don't stack exactly on top of each other
const OFFSETS = [
  { lat: 0, lng: 0 },
  { lat: 0.008, lng: 0.008 },
  { lat: -0.008, lng: 0.008 },
  { lat: 0.008, lng: -0.008 },
  { lat: -0.008, lng: -0.008 },
  { lat: 0.014, lng: 0 },
  { lat: -0.014, lng: 0 },
  { lat: 0, lng: 0.014 },
];

function applyOffset(coord, index) {
  if (!coord) return coord;
  const offset = OFFSETS[index % OFFSETS.length];
  return { lat: coord.lat + offset.lat, lng: coord.lng + offset.lng };
}

// Auto-fit map bounds to visible markers
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);

  return null;
}

// -----------------------------------------------------------------------

/**
 * Renders a Leaflet map with multiple routes (origin→destination pairs).
 * Each route gets a unique colour, dashed polyline, and labelled markers.
 *
 * @param {Array<{
 *   from:      { lat: number, lng: number } | null,
 *   to:        { lat: number, lng: number } | null,
 *   label:     string,
 *   fromPopup: React.ReactNode,
 *   toPopup:   React.ReactNode,
 *   visible:   boolean,
 * }>} routes – Array of route objects
 */
export default function MapWithMultiRoute({ routes = [] }) {
  const visibleRoutes = routes.filter((r) => r.visible !== false);

  // Collect all visible points for auto-fitting
  const allPoints = useMemo(
    () => visibleRoutes.flatMap((r) => [r.from, r.to].filter(Boolean)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(visibleRoutes.map((r) => ({ f: r.from, t: r.to })))]
  );

  // Pre-build icons
  const routeIcons = useMemo(
    () =>
      routes.map((r, i) => {
        const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
        return {
          origin: createCircleIcon(color, String(i + 1)),
          dest: createCircleIcon(color, String(i + 1)),
          lineColor: color,
        };
      }),
    [routes]
  );

  if (allPoints.length === 0) return null;

  return (
    <MapContainer
      center={[allPoints[0].lat, allPoints[0].lng]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds points={allPoints} />

      {routes.map((route, i) => {
        if (route.visible === false) return null;

        const icons = routeIcons[i];
        // Apply an offset so overlapping routes don't hide each other
        const from = applyOffset(route.from, i);
        const to = applyOffset(route.to, i);
        const hasBoth = Boolean(from && to);

        return (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i}>
            {/* Route line */}
            {hasBoth && (
              <Polyline
                positions={[
                  [from.lat, from.lng],
                  [to.lat, to.lng],
                ]}
                pathOptions={{
                  color: icons.lineColor,
                  weight: 3,
                  dashArray: '10, 8',
                  opacity: 0.8,
                }}
              />
            )}

            {/* Origin marker */}
            {from && (
              <Marker position={[from.lat, from.lng]} icon={icons.origin}>
                {route.fromPopup && <Popup>{route.fromPopup}</Popup>}
              </Marker>
            )}

            {/* Destination marker */}
            {to && (
              <Marker position={[to.lat, to.lng]} icon={icons.dest}>
                {route.toPopup && <Popup>{route.toPopup}</Popup>}
              </Marker>
            )}
          </span>
        );
      })}
    </MapContainer>
  );
}
