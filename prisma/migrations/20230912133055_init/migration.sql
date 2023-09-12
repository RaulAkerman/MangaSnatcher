-- CreateTable
CREATE TABLE "last_scrape" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "last_scrape_pkey" PRIMARY KEY ("id")
);
