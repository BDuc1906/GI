-- CreateTable
-- Bí cảnh (Domain of Blessing/Forgery/Mastery). Xem comment đầy đủ trong
-- prisma/schema.prisma. "category" phân biệt 3 loại (artifact/weapon/talent)
-- thay vì tách 3 bảng riêng, vì cấu trúc dữ liệu giống hệt nhau, chỉ khác ở
-- chỗ artifact domain không có lịch mở theo ngày (daysOfWeek rỗng).
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "regionName" TEXT,
    "description" TEXT,
    "recommendedLevel" INTEGER,
    "recommendedElements" TEXT[],
    "daysOfWeek" TEXT[],
    "unlockRank" INTEGER,
    "materials" JSONB,
    "monsterNames" TEXT[],
    "imageUrl" TEXT,
    "gameVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Domain_category_idx" ON "Domain"("category");
