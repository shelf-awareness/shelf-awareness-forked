/*
  Warnings:

  - Added the required column `storage` to the `Produce` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Produce" ADD COLUMN     "storage" TEXT NOT NULL;
