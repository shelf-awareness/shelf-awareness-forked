-- CreateTable
CREATE TABLE "public"."ShoppingList" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShoppingListItem" (
    "id" SERIAL NOT NULL,
    "shoppingListId" INTEGER NOT NULL,
    "produceId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2),

    CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "public"."ShoppingList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "public"."Produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
