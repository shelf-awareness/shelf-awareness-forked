export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'ShelfAwareness/1.0 cadekane@hawaii.edu)', // ← use a real identifier
      },
    });

    if (!res.ok) return null; // gracefully handle non-200 responses

    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null; // don't crash if geocoding fails
  }
}