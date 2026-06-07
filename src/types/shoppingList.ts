import { Prisma } from '@prisma/client';

export type ShoppingListWithItems =
  Prisma.ShoppingListGetPayload<{
    include: { items: true };
  }>;

export type ShoppingListWithProtein =
  ShoppingListWithItems & {
    totalProtein: number;
  };