import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');

  if (!owner) {
    return NextResponse.json({ error: 'Missing owner' }, { status: 400 });
  }

  const locations = await (prisma as any).location.findMany({
    where: { owner },
    select: { name: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(locations.map((l: { name: string }) => l.name));
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get('name')?.trim().toLowerCase();
    const owner = url.searchParams.get('owner')?.trim().toLowerCase();

    if (!name || !owner) {
      return NextResponse.json({ error: 'Missing name or owner' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.produce.deleteMany({
        where: {
          location: {
            name: { equals: name, mode: 'insensitive' },
            owner: { equals: owner, mode: 'insensitive' },
          },
        },
      }),
      prisma.storage.deleteMany({
        where: {
          location: {
            name: { equals: name, mode: 'insensitive' },
            owner: { equals: owner, mode: 'insensitive' },
          },
        },
      }),
      prisma.location.deleteMany({
        where: {
          name: { equals: name, mode: 'insensitive' },
          owner: { equals: owner, mode: 'insensitive' },
        },
      }),
    ]);

    return NextResponse.json({ message: 'Location and related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
