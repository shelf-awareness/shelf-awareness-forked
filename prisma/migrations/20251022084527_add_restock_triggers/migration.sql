-- AlterTable
ALTER TABLE "Produce" ADD COLUMN     "customThreshold" DOUBLE PRECISION,
ADD COLUMN     "restockTrigger" TEXT NOT NULL DEFAULT 'empty';

-- AlterTable
ALTER TABLE "ShoppingListItem" ADD COLUMN     "customThreshold" INTEGER,
ADD COLUMN     "restockTrigger" TEXT;
