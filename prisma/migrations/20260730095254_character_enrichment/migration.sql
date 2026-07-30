-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "ascensionMaterials" JSONB,
ADD COLUMN     "birthday" TEXT,
ADD COLUMN     "constellationName" TEXT,
ADD COLUMN     "gameVersion" TEXT,
ADD COLUMN     "sideIconUrl" TEXT,
ADD COLUMN     "statsByLevel" JSONB,
ADD COLUMN     "voiceActors" JSONB,
ADD COLUMN     "wikiUrl" TEXT;
