import { prisma } from './prisma';

export async function checkAndAddToShoppingList(produceId: number, owner: string) {
  const produce = await prisma.produce.findUnique({ where: { id: produceId } });
  if (!produce) return;

  let shouldRestock = false;
  // eslint-disable-next-line default-case
  switch (produce.restockTrigger) {
    case 'empty':
      shouldRestock = produce.quantity <= 0;
      break;
    case 'half':
      shouldRestock = produce.quantity <= (produce.restockThreshold ?? 50);
      break;
    case 'custom':
      shouldRestock = produce.quantity <= (produce.customThreshold ?? 0);
      break;
  }

  if (!shouldRestock) return;

  let shoppingList = await prisma.shoppingList.findFirst({
    where: { owner },
    orderBy: { createdAt: 'desc' },
  });

  if (!shoppingList) {
    shoppingList = await prisma.shoppingList.create({
      data: { name: 'Auto Restock List', owner },
    });
  }

  const existingItem = await prisma.shoppingListItem.findFirst({
    where: { shoppingListId: shoppingList.id, name: produce.name },
  });
  if (existingItem) return;

  await prisma.shoppingListItem.create({
    data: {
      shoppingListId: shoppingList.id,
      name: produce.name,
      quantity: 1,
      restockTrigger: produce.restockTrigger,
      customThreshold: produce.customThreshold ?? undefined,
    },
  });
}
