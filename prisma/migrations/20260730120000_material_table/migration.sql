-- CreateTable
-- Bảng Material tách riêng: lưu tên + icon của từng loại nguyên liệu
-- (hoa/cỏ/tinh thể/quái vật rơi...) MỘT LẦN DUY NHẤT, thay vì lặp lại
-- iconUrl trong JSON ascensionMaterials của từng nhân vật. Character vẫn
-- giữ Json ascensionMaterials như cũ (phase + count), chỉ thêm materialId
-- trong từng phần tử để join sang bảng này lấy icon lúc render. Thiết kế
-- này tái dùng được cho Weapon sau này (nguyên liệu cường hóa vũ khí dùng
-- chung nhiều loại nguyên liệu với nguyên liệu đột phá nhân vật).
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Material_name_key" ON "Material"("name");