'use client';

import { useState, useEffect } from 'react';
import { Container, Form, Spinner } from 'react-bootstrap';
import dynamicImport from 'next/dynamic';
import { useSession } from 'next-auth/react';
import type { LocationMarker, GroceryStore } from '@/types/map';
import { fetchNearbyGroceryStores } from '@/lib/overpass';

export const dynamic = 'force-dynamic';

const LeafletMap = dynamicImport(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '70vh',
        minHeight: '400px',
        backgroundColor: '#e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span className="text-muted">Loading map...</span>
    </div>
  ),
});

const MapPage: React.FC = () => {
  const { data: session } = useSession();
  const owner = session?.user?.email ?? '';

  const [locations, setLocations] = useState<LocationMarker[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [groceryStores, setGroceryStores] = useState<GroceryStore[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingStores, setLoadingStores] = useState(false);
  const [error, setError] = useState('');

  // Load pantry locations on mount
  useEffect(() => {
    if (!owner) return;
    fetch(`/api/locations?owner=${encodeURIComponent(owner)}`)
      .then((r) => r.json())
      .then((data: LocationMarker[]) => {
        setLocations(data.filter((l) => l.latitude !== null && l.longitude !== null));
      })
      .catch(() => setError('Failed to load locations.'))
      .finally(() => setLoadingLocations(false));
  }, [owner]);

  // Fetch nearby grocery stores when a location is selected
  useEffect(() => {
    if (selectedId === null) {
      setGroceryStores([]);
      return;
    }
    const selected = locations.find((l) => l.id === selectedId);
    if (!selected) return;

    setLoadingStores(true);
    fetchNearbyGroceryStores(selected.latitude, selected.longitude)
      .then(setGroceryStores)
      .finally(() => setLoadingStores(false));
  }, [selectedId, locations]);

  const selected = locations.find((l) => l.id === selectedId) ?? null;

  return (
    <Container fluid className="p-0">
      <div className="p-3 border-bottom bg-white sticky-top">
        <h5 className="mb-3 text-center">My Pantry Locations</h5>

        {loadingLocations ? (
          <div className="text-center py-1">
            <Spinner size="sm" /> Loading locations…
          </div>
        ) : error ? (
          <p className="text-danger small mb-0">{error}</p>
        ) : locations.length === 0 ? (
          <p className="text-muted small mb-0">No locations with addresses found.</p>
        ) : (
          <>
            <Form.Select
              value={selectedId ?? ''}
              onChange={(e) =>
                setSelectedId(e.target.value === '' ? null : parseInt(e.target.value))
              }
            >
              <option value="">— Show all locations —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id.toString()}>
                  {l.name} — {l.address}
                </option>
              ))}
            </Form.Select>
            {loadingStores && (
              <div className="text-muted small mt-2">
                <Spinner size="sm" className="me-1" />
                Finding nearby grocery stores…
              </div>
            )}
            {!loadingStores && selectedId !== null && groceryStores.length === 0 && (
              <p className="text-muted small mt-2 mb-0">No grocery stores found nearby.</p>
            )}
            {!loadingStores && groceryStores.length > 0 && (
              <p className="text-muted small mt-2 mb-0">
                {groceryStores.length} grocery store{groceryStores.length !== 1 ? 's' : ''} found nearby.
              </p>
            )}
          </>
        )}
      </div>

      <LeafletMap
        markers={locations}
        focusedMarker={selected}
        groceryStores={groceryStores}
      />
    </Container>
  );
};

export default MapPage;