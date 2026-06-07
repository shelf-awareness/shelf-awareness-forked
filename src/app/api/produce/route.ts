import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner');

    if (!owner) {
      return NextResponse.json({ error: 'Missing owner query parameter' }, { status: 400 });
    }

    // Fetch produce with Location and Storage names
    const produce = await prisma.produce.findMany({
      where: { owner },
      select: {
        id: true,
        name: true,
        type: true,
        quantityValue: true,
        quantityUnit: true,
        expiration: true,
        restockThreshold: true,
        customThreshold: true,
        restockTrigger: true,
        image: true,
        location: { select: { name: true } },
        storage: { select: { name: true } },
      },
    });

    // Map to friendly structure for frontend
    const result = produce.map((p: { id: any; name: any; type: any; 
      quantityValue: any; quantityUnit: any; expiration: any; 
      restockThreshold: any; customThreshold: any; restockTrigger: any; 
      image: any; location: { name: any; }; storage: { name: any; }; }) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      quantityValue: p.quantityValue,
      quantityUnit: p.quantityUnit,
      expiration: p.expiration,
      restockThreshold: p.restockThreshold,
      customThreshold: p.customThreshold,
      restockTrigger: p.restockTrigger,
      image: p.image,
      location: p.location.name,
      storage: p.storage.name,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching produce:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
