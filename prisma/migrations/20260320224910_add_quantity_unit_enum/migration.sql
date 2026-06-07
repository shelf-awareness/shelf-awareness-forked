/*
  Warnings:

  - Added the required column `quantityUnit` to the `Produce` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantityValue` to the `Produce` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantityValue` to the `ShoppingListItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuantityUnit" AS ENUM ('G', 'OZ', 'LB', 'ML', 'CUP', 'ITEM');

-- AlterTable
ALTER TABLE "Produce" ADD COLUMN     "proteinGrams" DOUBLE PRECISION,
ADD COLUMN     "quantityUnit" "QuantityUnit" NOT NULL,
ADD COLUMN     "quantityValue" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "RecipeIngredient" ADD COLUMN     "quantityUnit" "QuantityUnit",
ADD COLUMN     "quantityValue" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ShoppingListItem" ADD COLUMN     "quantityUnit" "QuantityUnit",
ADD COLUMN     "quantityValue" DOUBLE PRECISION NOT NULL;
