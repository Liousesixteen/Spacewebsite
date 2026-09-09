-- This migration is intentionally additive: existing production databases were
-- created before Prisma migration history was introduced.
CREATE TABLE IF NOT EXISTS "ProductCapability" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "maturityLevel" TEXT,
    "source" TEXT,
    "sourceUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCapability_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProductCapability_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProductCapability_companyId_idx"
  ON "ProductCapability"("companyId");

CREATE INDEX IF NOT EXISTS "ProductCapability_category_idx"
  ON "ProductCapability"("category");
