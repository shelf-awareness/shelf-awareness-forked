import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') ?? '5000';

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
  }

  const query = `
    [out:json][timeout:25];
    (
      node["shop"="supermarket"](around:${radius},${lat},${lng});
      node["shop"="grocery"](around:${radius},${lat},${lng});
      node["shop"="convenience"](around:${radius},${lat},${lng});
      node["shop"="food"](around:${radius},${lat},${lng});
      node["amenity"="marketplace"](around:${radius},${lat},${lng});
      way["shop"="supermarket"](around:${radius},${lat},${lng});
      way["shop"="grocery"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  try {
    const encodedQuery = encodeURIComponent(query);
    const res = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodedQuery}`,
        {
            method: 'GET',
            headers: {
            'User-Agent': 'shelf-awareness-app/1.0 (contact@example.com)',
            'Accept': 'application/json',
            },
        },
    );

    console.log('Overpass status:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error('Overpass error response:', text);
      return NextResponse.json({ error: 'Failed to fetch stores', detail: text }, { status: 500 });
    }

    const data = await res.json();
    console.log('Overpass elements found:', data.elements.length);

    const stores = data.elements
      .map((el: any) => ({
        id: el.id,
        name: el.tags?.name ?? 'Unnamed Store',
        lat: el.lat ?? el.center?.lat,
        lng: el.lon ?? el.center?.lon,
      }))
      .filter((s: any) => s.lat && s.lng);

    return NextResponse.json(stores);
  } catch (err) {
    console.error('Grocery store fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}