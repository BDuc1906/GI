-- AlterTable
ALTER TABLE "ArtifactSet" ADD COLUMN     "nameTranslations" JSONB;

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "nameTranslations" JSONB;

-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "nameTranslations" JSONB;

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "nameTranslations" JSONB;

-- AlterTable
ALTER TABLE "Weapon" ADD COLUMN     "nameTranslations" JSONB;
