-- CreateTable
CREATE TABLE "IngredientSubstitution" (
    "id" SERIAL NOT NULL,
    "fromName" TEXT NOT NULL,
    "toName" TEXT NOT NULL,
    "owner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngredientSubstitution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IngredientSubstitution_fromName_idx" ON "IngredientSubstitution"("fromName");

-- CreateIndex
CREATE INDEX "IngredientSubstitution_toName_idx" ON "IngredientSubstitution"("toName");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientSubstitution_fromName_toName_owner_key" ON "IngredientSubstitution"("fromName", "toName", "owner");
