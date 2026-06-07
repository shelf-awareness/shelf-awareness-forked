-- CreateTable
CREATE TABLE "RecipeUsage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipeUsage_userId_idx" ON "RecipeUsage"("userId");

-- CreateIndex
CREATE INDEX "RecipeUsage_recipeId_idx" ON "RecipeUsage"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeUsage_userId_recipeId_key" ON "RecipeUsage"("userId", "recipeId");

-- AddForeignKey
ALTER TABLE "RecipeUsage" ADD CONSTRAINT "RecipeUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeUsage" ADD CONSTRAINT "RecipeUsage_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
