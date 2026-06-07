/*
  Warnings:

  - You are about to drop the column `proteinG` on the `ShoppingListItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ShoppingListItem" DROP COLUMN "proteinG",
ADD COLUMN     "proteinGrams" DOUBLE PRECISION;
