import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const owner = session?.user?.email;

    if (!owner) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    const item = await prisma.shoppingListItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Ensure pantry location exists for this user
    // const location = await prisma.location.upsert({
    //   where: { name_owner: { name: 'Default Pantry', owner: item.shoppingListId.toString() } },
    //   update: {},
    //   create: { name: 'Default Pantry', owner: item.shoppingListId.toString() },
    // });
    const body = await request.json().catch(() => ({}));
    const locationName = body.locationName || 'Default Pantry';
    const storageName = body.storageName || 'Default Shelf';

    const location = await prisma.location.upsert({
      where: { name_owner: { name: locationName, owner: owner } },
      update: {},
      create: { name: locationName, owner: owner },
    });

    // Ensure storage exists under that location
    const storage = await prisma.storage.upsert({
      where: { name_locationId: { name: storageName, locationId: location.id } },
      update: {},
      create: { name: storageName, locationId: location.id },
    });

    // Move item to pantry
    await prisma.produce.create({
      data: {
        name: item.name,
        quantityValue: item.quantityValue,
        quantityUnit: item.quantityUnit || '',
        type: 'Other',
        owner: owner,
        locationId: location.id,
        storageId: storage.id,
        proteinGrams: item.proteinGrams ?? null, // Transfers protein data to pantry
      },
    });

    // Delete from shopping list
    await prisma.shoppingListItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving item to pantry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    const body = await request.json();

    const updatedItem = await prisma.shoppingListItem.update({
      where: { id },
      data: {
        name: body.name,
        quantityValue: body.quantityValue,
        quantityUnit: body.quantityUnit || null,
        price: body.price ?? null,
        proteinGrams: body.proteinGrams ?? null,
        restockTrigger: body.restockTrigger ?? null,
        customThreshold: body.customThreshold ?? null,
      },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error: any) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
