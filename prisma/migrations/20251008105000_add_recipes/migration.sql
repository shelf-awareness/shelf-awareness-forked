-- AlterTable
ALTER TABLE "public"."Produce" ADD COLUMN     "restockThreshold" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."Recipe" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "cuisine" TEXT NOT NULL,
    "dietary" TEXT[],
    "ingredients" TEXT[],
    "owner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recipe_title_idx" ON "public"."Recipe"("title");

-- CreateIndex
CREATE INDEX "Recipe_cuisine_idx" ON "public"."Recipe"("cuisine");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_title_owner_key" ON "public"."Recipe"("title", "owner");
