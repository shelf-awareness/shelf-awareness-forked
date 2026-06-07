/*
  Warnings:

  - You are about to alter the column `quantity` on the `Produce` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."Produce" ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;
