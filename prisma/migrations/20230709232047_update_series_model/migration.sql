-- AlterTable
ALTER TABLE "series" ADD COLUMN     "last_sraped_at" TIMESTAMP(3),
ALTER COLUMN "latest_chapter" DROP NOT NULL,
ALTER COLUMN "latest_chapter" SET DATA TYPE TEXT;
