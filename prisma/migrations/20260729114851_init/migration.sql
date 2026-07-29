-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "vision" TEXT NOT NULL,
    "weaponType" TEXT NOT NULL,
    "rarity" INTEGER NOT NULL,
    "region" TEXT,
    "affiliation" TEXT,
    "releaseDate" TIMESTAMP(3),
    "description" TEXT,
    "iconUrl" TEXT,
    "splashUrl" TEXT,
    "baseHp" DOUBLE PRECISION,
    "baseAtk" DOUBLE PRECISION,
    "baseDef" DOUBLE PRECISION,
    "ascensionStat" TEXT,
    "constellations" JSONB,
    "talents" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weapon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" INTEGER NOT NULL,
    "baseAtk" DOUBLE PRECISION,
    "subStatName" TEXT,
    "subStatValue" TEXT,
    "effectName" TEXT,
    "effectDescription" TEXT,
    "passiveByRefinement" JSONB,
    "description" TEXT,
    "iconUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Weapon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rarityRange" INTEGER[],
    "twoPieceBonus" TEXT,
    "fourPieceBonus" TEXT,
    "pieces" JSONB,
    "iconUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtifactSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Character_vision_idx" ON "Character"("vision");

-- CreateIndex
CREATE INDEX "Character_weaponType_idx" ON "Character"("weaponType");

-- CreateIndex
CREATE INDEX "Character_rarity_idx" ON "Character"("rarity");

-- CreateIndex
CREATE INDEX "Weapon_type_idx" ON "Weapon"("type");

-- CreateIndex
CREATE INDEX "Weapon_rarity_idx" ON "Weapon"("rarity");
