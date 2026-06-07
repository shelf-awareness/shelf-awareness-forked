/*
  Warnings:

  - You are about to alter the column `budget` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "budget" DROP NOT NULL,
ALTER COLUMN "budget" DROP DEFAULT,
ALTER COLUMN "budget" SET DATA TYPE DECIMAL(10,2);
