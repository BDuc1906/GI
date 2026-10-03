-- Restore columns declared in schema.prisma but absent from the production DB.
ALTER TABLE "ArtifactSet" ADD COLUMN "gameVersion" TEXT;

ALTER TABLE "Enemy"
ADD COLUMN "atk" INTEGER,
ADD COLUMN "behavior" TEXT,
ADD COLUMN "def" INTEGER,
ADD COLUMN "difficulty" TEXT,
ADD COLUMN "domains" TEXT[],
ADD COLUMN "dropRates" JSONB,
ADD COLUMN "hp" INTEGER,
ADD COLUMN "immunities" TEXT[],
ADD COLUMN "isBoss" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "level" INTEGER,
ADD COLUMN "resistances" TEXT[],
ADD COLUMN "spawnRegions" TEXT[],
ADD COLUMN "weaknesses" TEXT[],
ADD COLUMN "weeklyBoss" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Weapon" ADD COLUMN "gameVersion" TEXT;

CREATE INDEX "Enemy_categoryType_idx" ON "Enemy"("categoryType");
CREATE INDEX "Enemy_isBoss_idx" ON "Enemy"("isBoss");
CREATE INDEX "Enemy_weeklyBoss_idx" ON "Enemy"("weeklyBoss");
CREATE INDEX "Enemy_level_idx" ON "Enemy"("level");
