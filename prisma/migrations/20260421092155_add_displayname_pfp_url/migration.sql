/*
  Warnings:

  - Added the required column `displayName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "pfpURL" TEXT DEFAULT 'https://i.pinimg.com/474x/13/74/20/137420f5b9c39bc911e472f5d20f053e.jpg';
