-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "associationType" TEXT,
ADD COLUMN     "birthdaymmdd" TEXT,
ADD COLUMN     "bodyType" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "genshinDbId" TEXT,
ADD COLUMN     "qualityType" TEXT,
ADD COLUMN     "raw" JSONB;

-- CreateIndex
CREATE INDEX "Character_genshinDbId_idx" ON "Character"("genshinDbId");
