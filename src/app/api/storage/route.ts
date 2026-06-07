import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/geocode';

// GET all locations for an owner
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');

  if (!owner) {
    return NextResponse.json({ error: 'Missing owner' }, { status: 400 });
  }

  const locations = await prisma.location.findMany({
    where: { owner },
    select: { id: true, name: true, address: true, latitude: true, longitude: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(locations);
}

// POST create a new location
export async function POST(request: Request) {
  const body = await request.json();
  const { name, owner, address } = body;

  if (!name || !owner || !address) {
    return NextResponse.json({ error: 'name, owner, and address are required' }, { status: 400 });
  }

  const coords = await geocodeAddress(address);

  const location = await prisma.location.create({
    data: {
      name,
      owner,
      address,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
    },
  });

  return NextResponse.json(location, { status: 201 });
}