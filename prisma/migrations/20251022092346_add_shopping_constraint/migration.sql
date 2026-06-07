/*
  Warnings:

  - You are about to drop the column `produceId` on the `ShoppingListItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shoppingListId,name]` on the table `ShoppingListItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `ShoppingListItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ShoppingListItem" DROP CONSTRAINT "ShoppingListItem_produceId_fkey";

-- DropIndex
DROP INDEX "public"."ShoppingListItem_shoppingListId_produceId_key";

-- AlterTable
ALTER TABLE "ShoppingListItem" DROP COLUMN "produceId",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "unit" TEXT,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "customThreshold" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingListItem_shoppingListId_name_key" ON "ShoppingListItem"("shoppingListId", "name");
