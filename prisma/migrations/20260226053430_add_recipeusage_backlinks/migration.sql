-- AlterTable
ALTER TABLE "RecipeIngredient" ALTER COLUMN "substitutes" DROP NOT NULL,
ALTER COLUMN "substitutes" DROP DEFAULT,
ALTER COLUMN "substitutes" SET DATA TYPE TEXT;
