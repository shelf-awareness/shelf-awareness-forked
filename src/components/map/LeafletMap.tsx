'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationMarker, GroceryStore } from '@/types/map';

// House icon for pantry locations
const houseIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(1px 1px 1px rgba(0,0,0,0.4))">🏠</div>`,
  iconAnchor: [14, 24],
  popupAnchor: [0, -24],
});

// Cart icon for grocery stores
const cartIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(1px 1px 1px rgba(0,0,0,0.4))">🛒</div>`,
  iconAnchor: [14, 24],
  popupAnchor: [0, -24],
});

interface Props {
  markers: LocationMarker[];
  focusedMarker: LocationMarker | null;
  groceryStores: GroceryStore[];
}

const MapController: React.FC<{
  markers: LocationMarker[];
  focused: LocationMarker | null;
}> = ({ markers, focused }) => {
  const map = useMap();

  useEffect(() => {
    if (focused) {
      map.setView([focused.latitude, focused.longitude], 15, { animate: true });
      return;
    }
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].latitude, markers[0].longitude], 14, { animate: true });
    } else {
      const bounds = L.latLngBounds(markers.map((m) => [m.latitude, m.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  }, [focused, markers, map]);

  return null;
};

const LeafletMap: React.FC<Props> = ({ markers, focusedMarker, groceryStores }) => (
  <MapContainer
    center={[20.7967, -156.3319]}
    zoom={12}
    style={{ height: '70vh', minHeight: '400px', width: '100%' }}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {/* Pantry location markers */}
    {markers.map((m) => (
      <Marker key={`location-${m.id}`} position={[m.latitude, m.longitude]} icon={houseIcon}>
        <Popup>
          <strong>{m.name}</strong>
          <br />
          {m.address}
        </Popup>
      </Marker>
    ))}

    {/* Grocery store markers */}
    {groceryStores.map((s) => (
      <Marker key={`store-${s.id}`} position={[s.lat, s.lng]} icon={cartIcon}>
        <Popup>
          <strong>{s.name}</strong>
          <br />
          <span className="text-muted" style={{ fontSize: '0.85em' }}>Grocery Store</span>
        </Popup>
      </Marker>
    ))}

    <MapController markers={markers} focused={focusedMarker} />
  </MapContainer>
);

export default LeafletMap;