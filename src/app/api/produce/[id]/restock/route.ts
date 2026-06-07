import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    const { restockTrigger, customThreshold } = await request.json();

    const updateData: any = {};
    if (restockTrigger) updateData.restockTrigger = restockTrigger;
    if (customThreshold !== undefined) updateData.customThreshold = parseFloat(customThreshold);

    const updatedProduce = await prisma.produce.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedProduce, { status: 200 });
  } catch (error) {
    console.error('Error updating produce restock info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}