'use server';

import { prisma } from '@/lib/prisma';

export async function getRecommendedProduce(
  email: string,
  settings: { lowStock: number; expDays: number },
) {
  const { lowStock, expDays } = settings;

  // Compute expiring soon cutoff
  const soon = new Date();
  soon.setDate(soon.getDate() + expDays);

  // Get shopping list items (names only)
  const listItems = await prisma.shoppingListItem.findMany({
    where: {
      shoppingList: { owner: email },
    },
    select: { name: true },
  });

  const excludedNames = listItems.map((item: { name: string }) => item.name.toLowerCase());

  // Produce to recommend
  const produce = await prisma.produce.findMany({
    where: {
      owner: email,
      name: { notIn: excludedNames },
      OR: [
        { quantityValue: { lte: lowStock } },
        { expiration: { lte: soon } },
      ],
    },
    orderBy: { quantityValue: 'asc' },
  });

  return produce;
}
