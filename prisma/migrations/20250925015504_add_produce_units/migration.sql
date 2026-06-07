/*
  Warnings:

  - You are about to alter the column `quantity` on the `Produce` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[name,owner]` on the table `Produce` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,owner]` on the table `ShoppingList` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shoppingListId,produceId]` on the table `ShoppingListItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Produce" 
ADD COLUMN "unit" TEXT NOT NULL DEFAULT 'unit not set',
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "public"."Produce"
ALTER COLUMN "unit" DROP DEFAULT;

UPDATE "public"."Produce" SET "unit" = 'pieces' WHERE "name" IN ('Banana', 'Apple', 'Carrot', 'Chicken Breast');
UPDATE "public"."Produce" SET "unit" = 'heads'  WHERE "name" = 'Broccoli';
UPDATE "public"."Produce" SET "unit" = 'fillets' WHERE "name" = 'Salmon Fillet';


-- CreateIndex
CREATE UNIQUE INDEX "Produce_name_owner_key" ON "public"."Produce"("name", "owner");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingList_name_owner_key" ON "public"."ShoppingList"("name", "owner");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingListItem_shoppingListId_produceId_key" ON "public"."ShoppingListItem"("shoppingListId", "produceId");
