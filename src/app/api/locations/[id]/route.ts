import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/geocode';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = parseInt(id);
  const body = await request.json();
  const { name, address } = body;

  let coordFields = {};
  if (address) {
    const coords = await geocodeAddress(address);
    coordFields = { latitude: coords?.lat ?? null, longitude: coords?.lng ?? null };
  }

  const location = await prisma.location.update({
    where: { id: parsedId },
    data: {
      ...(name && { name }),
      ...(address && { address }),
      ...coordFields,
    },
  });

  return NextResponse.json(location);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.location.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}