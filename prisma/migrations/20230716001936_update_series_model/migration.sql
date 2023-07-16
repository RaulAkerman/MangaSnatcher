/*
  Warnings:

  - Added the required column `channelId` to the `series` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "series" ADD COLUMN     "channelId" TEXT NOT NULL;
