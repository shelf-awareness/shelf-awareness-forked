-- CreateTable
CREATE TABLE "RecipeRating" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipeRating_userId_idx" ON "RecipeRating"("userId");

-- CreateIndex
CREATE INDEX "RecipeRating_recipeId_idx" ON "RecipeRating"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeRating_userId_recipeId_key" ON "RecipeRating"("userId", "recipeId");

-- AddForeignKey
ALTER TABLE "RecipeRating" ADD CONSTRAINT "RecipeRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeRating" ADD CONSTRAINT "RecipeRating_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
