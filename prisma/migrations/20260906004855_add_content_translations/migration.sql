-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "constellationsTranslations" JSONB,
ADD COLUMN     "descriptionTranslations" JSONB,
ADD COLUMN     "talentsTranslations" JSONB;

-- AlterTable
ALTER TABLE "Weapon" ADD COLUMN     "descriptionTranslations" JSONB,
ADD COLUMN     "passiveByRefinementTranslations" JSONB;
