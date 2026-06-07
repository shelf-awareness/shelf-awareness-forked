/*
  Warnings:

  - The `dietary` column on the `Recipe` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DietaryCategory" AS ENUM ('VEGAN', 'VEGETARIAN', 'KETO', 'GLUTEN_FREE', 'HIGH_PROTEIN', 'LOW_CARB');

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "dietary",
ADD COLUMN     "dietary" "DietaryCategory"[];
