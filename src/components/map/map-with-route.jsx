import { useMemo } from 'react';
import { Popup, Marker, Polyline, TileLayer, MapContainer } from 'react-leaflet';

import { createCircleIcon } from './map-icons';

// -----------------------------------------------------------------------

function getBounds(from, to) {
  if (from && to)
    return [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ];
  return undefined;
}

function getSingleCenter(from, to) {
  const point = from || to;
  return point ? [point.lat, point.lng] : [0, 0];
}

// -----------------------------------------------------------------------

/**
 * Renders a Leaflet map with an origin marker, a destination marker,
 * and a dashed polyline connecting them to indicate direction of travel.
 *
 * @param {{ lat: number, lng: number }} from       – Origin coordinates
 * @param {{ lat: number, lng: number }} [to]       – Destination coordinates
 * @param {string}                       [fromLabel] – Popup HTML for the origin marker
 * @param {string}                       [toLabel]   – Popup HTML for the destination marker
 * @param {object}                       [sx]        – MUI-style height/width overrides (ignored; use CSS on parent)
 */
export default function MapWithRoute({ from, to, fromLabel, toLabel }) {
  const originIcon = useMemo(() => createCircleIcon('#16a34a', 'A'), []);
  const destIcon = useMemo(() => createCircleIcon('#dc2626', 'B'), []);

  const hasBoth = Boolean(from && to);

  return (
    <MapContainer
      bounds={getBounds(from, to)}
      boundsOptions={{ padding: [40, 40] }}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
      zoom={hasBoth ? undefined : 13}
      center={hasBoth ? undefined : getSingleCenter(from, to)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Dashed polyline from origin → destination */}
      {hasBoth && (
        <Polyline
          positions={[
            [from.lat, from.lng],
            [to.lat, to.lng],
          ]}
          pathOptions={{ color: '#1976d2', weight: 3, dashArray: '10, 8', opacity: 0.8 }}
        />
      )}

      {/* Origin marker (green A) */}
      {from && (
        <Marker position={[from.lat, from.lng]} icon={originIcon}>
          {fromLabel && <Popup>{fromLabel}</Popup>}
        </Marker>
      )}

      {/* Destination marker (red B) */}
      {to && (
        <Marker position={[to.lat, to.lng]} icon={destIcon}>
          {toLabel && <Popup>{toLabel}</Popup>}
        </Marker>
      )}
    </MapContainer>
  );
}
