import type { NextRequest } from 'next/server';

type UnsplashPhoto = {
  id: string;
  urls?: { small?: string; regular?: string };
  alt_description?: string | null;
  user?: { name?: string | null };
  links?: { html?: string };
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q) return Response.json({ results: [] }); // 200 by default

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return Response.json({ error: 'Missing key' }, { status: 500 });

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', q);
  url.searchParams.set('per_page', '24');
  url.searchParams.set('content_filter', 'high');

  const r = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${key}` },
    // cache lightly to avoid quota burn
    next: { revalidate: 3600 },
  });

  if (!r.ok) {
    return Response.json({ error: `Unsplash ${r.status}` }, { status: 502 });
  }

  const data = await r.json();

  const results = ((data?.results as UnsplashPhoto[]) ?? []).map((p) => ({
    id: p.id,
    thumb: p.urls?.small ?? '',
    full: p.urls?.regular ?? '',
    alt: p.alt_description ?? 'Photo',
    credit: p.user?.name ?? 'Unsplash',
    link: p.links?.html ?? '',
  })) ?? [];

  return Response.json({ results });
}
