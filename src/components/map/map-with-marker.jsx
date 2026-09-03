/* eslint-disable import/no-unresolved */
import L from 'leaflet';
import React from 'react';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';
import { Popup, Marker, TileLayer, MapContainer } from 'react-leaflet';

const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapWithMarker({ lat, lng, zoom = 13 }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>{`Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`}</Popup>
      </Marker>
    </MapContainer>
  );
}
