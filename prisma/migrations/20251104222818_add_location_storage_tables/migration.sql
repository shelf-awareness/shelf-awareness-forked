/*
  Warnings:

  - You are about to drop the column `location` on the `Produce` table. All the data in the column will be lost.
  - You are about to drop the column `storage` on the `Produce` table. All the data in the column will be lost.
  - Added the required column `locationId` to the `Produce` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageId` to the `Produce` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Produce" DROP COLUMN "location",
DROP COLUMN "storage",
ADD COLUMN     "locationId" INTEGER NOT NULL,
ADD COLUMN     "storageId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_owner_key" ON "Location"("name", "owner");

-- CreateIndex
CREATE UNIQUE INDEX "Storage_name_locationId_key" ON "Storage"("name", "locationId");

-- AddForeignKey
ALTER TABLE "Produce" ADD CONSTRAINT "Produce_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produce" ADD CONSTRAINT "Produce_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
