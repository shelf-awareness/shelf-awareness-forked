import { prisma } from './prisma';

export async function checkAndAddToShoppingList(produceId: number, owner: string) {
  const produce = await prisma.produce.findUnique({ where: { id: produceId } });
  if (!produce) return;

  let shouldRestock = false;

  switch (produce.restockTrigger) {
    case 'empty':
      shouldRestock = produce.quantity <= 0;
      break;

    case 'half': {
      const fullQuantity = produce.restockThreshold ?? produce.quantity;
      shouldRestock = produce.quantity <= fullQuantity / 2;
      break;
    }

    case 'custom':
      shouldRestock = produce.quantity <= (produce.customThreshold ?? 0);
      break;
    default:
      break;
  }

  if (!shouldRestock) return;

  // Get or create the auto restock shopping list
  let shoppingList = await prisma.shoppingList.findFirst({
    where: { owner, name: 'Auto Restock List' },
  });
  if (!shoppingList) {
    shoppingList = await prisma.shoppingList.create({
      data: { name: 'Auto Restock List', owner },
    });
  }

  // Check if the item is already in the list by name
  const existingItem = await prisma.shoppingListItem.findFirst({
    where: { shoppingListId: shoppingList.id, name: produce.name },
  });
  if (existingItem) return;

  // Add the produce item
  await prisma.shoppingListItem.create({
    data: {
      shoppingListId: shoppingList.id,
      name: produce.name,
      quantity: 1,
    },
  });
}
