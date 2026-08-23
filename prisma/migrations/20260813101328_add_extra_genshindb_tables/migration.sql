-- CreateTable
CREATE TABLE "AchievementGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER,
    "version" TEXT,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AchievementGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "achievementGroupId" TEXT,
    "achievementGroupName" TEXT,
    "isHidden" BOOLEAN,
    "sortOrder" INTEGER,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdventureRank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exp" INTEGER,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdventureRank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryType" TEXT,
    "categoryText" TEXT,
    "sortOrder" INTEGER,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Constellation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Constellation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Craft" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unlockRank" INTEGER,
    "moraCost" INTEGER,
    "resultCount" INTEGER,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Craft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElementInfo" (
    "name" TEXT NOT NULL,
    "type" TEXT,
    "archon" TEXT,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ElementInfo_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Enemy" (
    "id" TEXT NOT NULL,
    "monsterId" INTEGER,
    "name" TEXT NOT NULL,
    "monsterType" TEXT,
    "enemyType" TEXT,
    "categoryType" TEXT,
    "categoryText" TEXT,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enemy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" INTEGER,
    "foodtype" TEXT,
    "filterType" TEXT,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Geography" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "areaId" TEXT,
    "areaName" TEXT,
    "regionId" TEXT,
    "regionName" TEXT,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Geography_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Namecard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "version" TEXT,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Namecard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outfit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "characterId" TEXT,
    "characterName" TEXT,
    "isDefault" BOOLEAN,
    "source" TEXT,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rarity" (
    "name" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rarity_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Talent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Talent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Windglider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" INTEGER,
    "source" TEXT,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Windglider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Achievement_achievementGroupId_idx" ON "Achievement"("achievementGroupId");

-- CreateIndex
CREATE INDEX "Animal_categoryType_idx" ON "Animal"("categoryType");

-- CreateIndex
CREATE INDEX "Constellation_name_idx" ON "Constellation"("name");

-- CreateIndex
CREATE INDEX "Enemy_monsterType_idx" ON "Enemy"("monsterType");

-- CreateIndex
CREATE INDEX "Enemy_enemyType_idx" ON "Enemy"("enemyType");

-- CreateIndex
CREATE INDEX "Food_foodtype_idx" ON "Food"("foodtype");

-- CreateIndex
CREATE INDEX "Food_rarity_idx" ON "Food"("rarity");

-- CreateIndex
CREATE INDEX "Geography_regionName_idx" ON "Geography"("regionName");

-- CreateIndex
CREATE INDEX "Outfit_characterName_idx" ON "Outfit"("characterName");

-- CreateIndex
CREATE INDEX "Talent_name_idx" ON "Talent"("name");
