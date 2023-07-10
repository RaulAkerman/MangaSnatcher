/*
  Warnings:

  - You are about to drop the column `guild_id` on the `guilds` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "guilds_guild_id_key";

-- AlterTable
ALTER TABLE "guilds" DROP COLUMN "guild_id";
