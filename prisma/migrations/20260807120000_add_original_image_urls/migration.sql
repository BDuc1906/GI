-- Tách cột ảnh HIỂN THỊ (do scripts/mirror-images-to-r2.ts sở hữu sau lần
-- mirror đầu tiên) khỏi cột ảnh GỐC/hotlink (do các script scripts/seed-*.ts
-- sở hữu, ghi đè tự do mỗi lần crawl).
--
-- Lý do: trước migration này, seed-*.ts và mirror-images-to-r2.ts CÙNG ghi
-- vào 1 cột (iconUrl/sideIconUrl/splashUrl/imageUrl). Mỗi lần
-- `npm run data:crawl && npm run db:seed` chạy lại (kể cả tự động hàng tuần
-- qua .github/workflows/update-data.yml), seed sẽ ghi đè URL đã mirror sang
-- R2 bằng hotlink gốc, hoàn tác toàn bộ công mirror trước đó một cách âm
-- thầm (không có lỗi nào được log ra, ảnh chỉ đơn giản im lặng quay lại
-- hotlink rồi có thể chết theo API nguồn bất cứ lúc nào).

ALTER TABLE "Character" ADD COLUMN "iconUrlOriginal" TEXT;
ALTER TABLE "Character" ADD COLUMN "sideIconUrlOriginal" TEXT;
ALTER TABLE "Character" ADD COLUMN "splashUrlOriginal" TEXT;
ALTER TABLE "Character" ADD COLUMN "elementIconOriginal" TEXT;

ALTER TABLE "Material" ADD COLUMN "iconUrlOriginal" TEXT;
ALTER TABLE "Weapon" ADD COLUMN "iconUrlOriginal" TEXT;
ALTER TABLE "ArtifactSet" ADD COLUMN "iconUrlOriginal" TEXT;
ALTER TABLE "Domain" ADD COLUMN "imageUrlOriginal" TEXT;

-- Backfill 1 lần: dữ liệu đã seed từ trước migration này chưa có giá trị ở
-- cột *Original. Giá trị tốt nhất đang có (dù hiện là hotlink hay đã là R2
-- tuỳ lần seed/mirror gần nhất) chính là cột hiển thị hiện tại — copy tạm
-- sang cột Original; lần `npm run db:seed` kế tiếp sẽ tự làm mới lại bằng
-- đúng hotlink mới nhất từ genshin-db.
UPDATE "Character" SET
  "iconUrlOriginal" = "iconUrl",
  "sideIconUrlOriginal" = "sideIconUrl",
  "splashUrlOriginal" = "splashUrl",
  "elementIconOriginal" = "elementIcon";

UPDATE "Material" SET "iconUrlOriginal" = "iconUrl";
UPDATE "Weapon" SET "iconUrlOriginal" = "iconUrl";
UPDATE "ArtifactSet" SET "iconUrlOriginal" = "iconUrl";
UPDATE "Domain" SET "imageUrlOriginal" = "imageUrl";