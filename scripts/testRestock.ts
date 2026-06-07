/* eslint-disable no-await-in-loop */
import { prisma } from '../src/lib/prisma';
import { checkAndAddToShoppingList } from '../src/lib/restock';

async function testRestock() {
  const owner = 'youremail@example.com'; // Replace with your test user email

  // Ensure some produce items exist and will trigger restock
  const testProduces = [
    { name: 'Eggs', quantity: 5, restockTrigger: 'half', restockThreshold: 10, unit: 'pcs' },
    { name: 'Berries', quantity: 0, restockTrigger: 'empty', unit: 'kg' },
    { name: 'Milk', quantity: 1, restockTrigger: 'custom', customThreshold: 2, unit: 'L' },
  ];

  // Upsert test produces (create if not exists, otherwise update)
  for (const p of testProduces) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.produce.upsert({
      where: { name_owner: { name: p.name, owner } },
      update: {
        quantityValue: p.quantity,
        restockTrigger: p.restockTrigger,
        restockThreshold: p.restockThreshold,
        customThreshold: p.customThreshold,
        quantityUnit: p.unit,
      },
      create: {
        name: p.name,
        owner,
        type: 'Test',
        quantityValue: p.quantity,
        quantityUnit: p.unit,
        restockTrigger: p.restockTrigger,
        restockThreshold: p.restockThreshold,
        customThreshold: p.customThreshold,

        // Connect or create the Location (has owner)
        location: {
          connectOrCreate: {
            where: { name_owner: { name: 'Fridge', owner } },
            create: { name: 'Fridge', owner },
          },
        },

        // Connect or create the Storage (linked by locationId)
        storage: {
          connectOrCreate: {
            where: {
              name_locationId: {
                name: 'Cold',
                locationId: (
                  await prisma.location.findUnique({
                    where: { name_owner: { name: 'Fridge', owner } },
                    select: { id: true },
                  })
                )!.id,
              },
            },
            create: {
              name: 'Cold',
              location: {
                connect: {
                  name_owner: { name: 'Fridge', owner },
                },
              },
            },
          },
        },
      },
    });
  }

  // Run restock check
  const produces = await prisma.produce.findMany({ where: { owner } });
  for (const produce of produces) {
    await checkAndAddToShoppingList(produce.id, owner);
  }

  // Print shopping list items
  const shoppingList = await prisma.shoppingList.findFirst({
    where: { owner, name: 'Auto Restock List' },
    include: { items: true },
  });

  if (shoppingList) {
    console.log(`Shopping List: ${shoppingList.name}`);
    shoppingList.items.forEach((item: any) => {
      console.log(
        // eslint-disable-next-line max-len
        `Item: ${item.produce.name}, Quantity in Pantry: ${item.produce.quantity}, Restock Trigger: ${item.produce.restockTrigger}`,
      );
    });
  } else {
    console.log('No shopping list found for this owner.');
  }
}

testRestock()
  .then(() => console.log('Test finished'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
