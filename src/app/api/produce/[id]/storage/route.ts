import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const locationName = searchParams.get('location');

  if (!owner) {
    return NextResponse.json({ error: 'Missing owner' }, { status: 400 });
  }

  if (!locationName) {
    const storages = await prisma.storage.findMany({
      where: { location: { owner } },
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(storages.map((s: { name: string }) => s.name));
  }

  const location = await prisma.location.findFirst({
    where: { owner, name: locationName },
    select: { id: true },
  });

  if (!location) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  }

  const storages = await prisma.storage.findMany({
    where: { locationId: location.id },
    select: { name: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(storages.map((s: { name: string }) => s.name));
}
