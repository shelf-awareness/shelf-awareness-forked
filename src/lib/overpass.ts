import type { GroceryStore } from '@/types/map';

export async function fetchNearbyGroceryStores(
  lat: number,
  lng: number,
  radiusMeters = 5000,
): Promise<GroceryStore[]> {
  const res = await fetch(
    `/api/grocery-stores?lat=${lat}&lng=${lng}&radius=${radiusMeters}`,
  );
  if (!res.ok) throw new Error('Failed to fetch grocery stores');
  return res.json();
}