/*
  Warnings:

  - You are about to drop the column `isLegacyTwoPieceOnlySet` on the `ArtifactSet` table. All the data in the column will be lost.
  - You are about to drop the column `sideIconUrl` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `effectDescriptionR1` on the `Weapon` table. All the data in the column will be lost.
  - You are about to drop the column `effectDescriptionR5` on the `Weapon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ArtifactSet" DROP COLUMN "isLegacyTwoPieceOnlySet";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "sideIconUrl";

-- AlterTable
ALTER TABLE "Weapon" DROP COLUMN "effectDescriptionR1",
DROP COLUMN "effectDescriptionR5";
