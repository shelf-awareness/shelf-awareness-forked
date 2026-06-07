-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "cookMinutes" INTEGER,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "prepMinutes" INTEGER,
ADD COLUMN     "servings" INTEGER,
ADD COLUMN     "sourceUrl" TEXT;
