import { createRequire } from "module";
import { prisma } from "../src/lib/prisma";
import { getEnkaUrl, slugify } from "./lib/seed-helpers";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

export async function seedArtifacts(): Promise<void> {
  const names = genshindb.artifacts("names", { matchCategories: true }) as string[];
  let count = 0;

  for (const name of names) {
    try {
      const a = genshindb.artifacts(name) as any;
      if (!a || !a.name) continue;

      // Lấy danh sách độ sao và loại bỏ các giá trị lỗi NaN
      const rarityRange: number[] = Array.isArray(a.rarityList)
        ? a.rarityList
            .map((r: string | number) => (typeof r === "string" ? parseInt(r, 10) : r))
            .filter((r: number) => !isNaN(r))
        : [];

      // Hỗ trợ cả 2 kiểu đặt tên thuộc tính của genshin-db
      const onePieceBonus = a.effect1Pc || a["1pc"] || null;
      const twoPieceBonus = a.effect2Pc || a["2pc"] || null;
      const fourPieceBonus = a.effect4Pc || a["4pc"] || null;

      // Ảnh từng mảnh (hoa/lông/cát/ly/vương miện) — KHÔNG được
      // mirror-images-to-r2.ts mirror (chỉ mirror `iconUrl` đại diện), nên
      // vẫn hotlink trực tiếp như cũ, không cần cột Original riêng.
      const pieces = {
        flower: a.images?.filename_flower ? getEnkaUrl(a.images.filename_flower) : null,
        plume: a.images?.filename_plume ? getEnkaUrl(a.images.filename_plume) : null,
        sands: a.images?.filename_sands ? getEnkaUrl(a.images.filename_sands) : null,
        goblet: a.images?.filename_goblet ? getEnkaUrl(a.images.filename_goblet) : null,
        circlet: a.images?.filename_circlet ? getEnkaUrl(a.images.filename_circlet) : null,
      };

      // Ảnh đại diện GỐC (hotlink) tại lần crawl này — ghi tự do mỗi lần
      // seed vào iconUrlOriginal. Cột iconUrl (hiển thị) do
      // scripts/mirror-images-to-r2.ts sở hữu sau lần mirror đầu tiên và
      // KHÔNG được set ở nhánh `update` bên dưới.
      const iconUrlOriginal = getEnkaUrl(a.images?.filename_flower || a.images?.filename_circlet);

      const basePayload = {
        name: a.name,
        onePieceBonus,
        twoPieceBonus,
        fourPieceBonus,
        pieces: pieces as any,
        iconUrlOriginal,
      };

      const id = slugify(a.name);

      await prisma.artifactSet.upsert({
        where: { id },
        // Record mới -> chưa mirror lần nào, tạm hiển thị thẳng bằng hotlink.
        create: { id, ...basePayload, iconUrl: iconUrlOriginal, rarityRange },
        // Record đã tồn tại -> KHÔNG đụng iconUrl.
        update: { ...basePayload, rarityRange: { set: rarityRange } }, // { set: [...] } bắt buộc cho mảng khi update
      });
      count++;
    } catch (err) {
      console.warn(`⚠ Skipped artifact set "${name}":`, (err as Error).message);
    }
  }
  console.log(`✔ Seeded ${count} artifact sets`);
}