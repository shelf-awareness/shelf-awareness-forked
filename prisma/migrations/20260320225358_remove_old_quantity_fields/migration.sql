/*
  Warnings:

  - You are about to drop the column `quantity` on the `Produce` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Produce` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `ShoppingListItem` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `ShoppingListItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Produce" DROP COLUMN "quantity",
DROP COLUMN "unit";

-- AlterTable
ALTER TABLE "RecipeIngredient" DROP COLUMN "quantity",
DROP COLUMN "unit";

-- AlterTable
ALTER TABLE "ShoppingListItem" DROP COLUMN "quantity",
DROP COLUMN "unit";
