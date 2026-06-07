import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isBelowThreshold } from '@/lib/restockCheck';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ownerEmail = searchParams.get('owner');
  if (!ownerEmail) return NextResponse.json({ error: 'Owner email required' }, { status: 400 });

  const produceItems = await prisma.produce.findMany({
    where: { owner: ownerEmail },
  });

  const lowStockItems = produceItems.filter((p: any) => isBelowThreshold(
    p.quantity,
    p.restockTrigger,
    p.customThreshold ?? undefined,
    p.restockThreshold ?? undefined,
  ));

  return NextResponse.json({ lowStockItems });
}
