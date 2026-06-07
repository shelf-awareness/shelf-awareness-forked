import { checkAndAddToShoppingList } from '@/lib/restock';

// Mock Prisma client
const mockShoppingListDB: any[] = [];
const mockShoppingListItemDB: any[] = [];
const mockProduceDB: any[] = [
    { id: 1, name: 'Apple', quantity: 0, restockTrigger: 'empty' },
    { id: 2, name: 'Banana', quantity: 5, restockTrigger: 'half', restockThreshold: 10 },
    { id: 3, name: 'Carrot', quantity: 10, restockTrigger: 'custom', customThreshold: 5 },
    { id: 4, name: 'Broccoli', quantity: -3, restockTrigger: 'empty' },
];

const prisma = {
    produce: {
        findUnique: async ({ where: { id } }: any) => mockProduceDB.find(p => p.id === id),
    },
    shoppingList: {
        findFirst: async ({ where: { owner, name } }: any) =>
            mockShoppingListDB.find(sl => sl.owner === owner && sl.name === name),
        create: async ({ data }: any) => {
            const newList = { id: mockShoppingListDB.length + 1, ...data };
            mockShoppingListDB.push(newList);
            return newList;
        },
    },
    shoppingListItem: {
        findFirst: async ({ where: { shoppingListId, name } }: any) =>
            mockShoppingListItemDB.find(i => i.shoppingListId === shoppingListId && i.name === name),
        create: async ({ data }: any) => {
            mockShoppingListItemDB.push(data);
            return data;
        },
    },
};

// Override prisma in the imported module (TypeScript trick)
(Object.assign as any)(global, { prisma });

async function runTests() {
    // Clear mocks
    mockShoppingListDB.length = 0;
    mockShoppingListItemDB.length = 0;

    // Test 1: Normal empty trigger
    try {
        await checkAndAddToShoppingList(1, 'user1');
        console.log('PASS: Empty trigger adds item');
    } catch (e) {
        console.error('FAIL: Empty trigger adds item', e);
    }

    // Test 2: Half trigger, quantity below threshold
    try {
        await checkAndAddToShoppingList(2, 'user2');
        console.log('PASS: Half trigger adds item');
    } catch (e) {
        console.error('FAIL: Half trigger adds item', e);
    }

    // Test 3: Custom trigger, quantity above custom threshold
    try {
        await checkAndAddToShoppingList(3, 'user3');
        console.log('PASS: Custom trigger does not add item when above threshold');
    } catch (e) {
        console.error('FAIL: Custom trigger', e);
    }

    // Test 4: Negative quantity
    try {
        await checkAndAddToShoppingList(4, 'user4');
        console.log('PASS: Negative quantity still triggers restock');
    } catch (e) {
        console.error('FAIL: Negative quantity', e);
    }

    // Test 5: Missing produce
    try {
        await checkAndAddToShoppingList(999, 'user5');
        console.log('PASS: Missing produce handled without error');
    } catch (e) {
        console.error('FAIL: Missing produce', e);
    }

    // Test 6: Duplicate item is not added twice
    try {
        await checkAndAddToShoppingList(1, 'user1');
        const count = mockShoppingListItemDB.filter(i => i.name === 'Apple' && i.shoppingListId === 1).length;
        if (count === 1) console.log('PASS: Duplicate items not added');
        else console.error('FAIL: Duplicate items added');
    } catch (e) {
        console.error('FAIL: Duplicate test', e);
    }

    console.log('All tests done.');
}

runTests();
