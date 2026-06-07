import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');

  if (!owner) {
    return NextResponse.json({ error: 'Missing owner' }, { status: 400 });
  }

  const locations = await prisma.location.findMany({
    where: { owner },
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(locations);
}