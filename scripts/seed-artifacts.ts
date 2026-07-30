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
      const isLegacyTwoPieceOnlySet = !fourPieceBonus && !!onePieceBonus;

      const pieces = {
        flower: a.images?.filename_flower ? getEnkaUrl(a.images.filename_flower) : null,
        plume: a.images?.filename_plume ? getEnkaUrl(a.images.filename_plume) : null,
        sands: a.images?.filename_sands ? getEnkaUrl(a.images.filename_sands) : null,
        goblet: a.images?.filename_goblet ? getEnkaUrl(a.images.filename_goblet) : null,
        circlet: a.images?.filename_circlet ? getEnkaUrl(a.images.filename_circlet) : null,
      };

      const basePayload = {
        name: a.name,
        onePieceBonus,
        twoPieceBonus,
        fourPieceBonus,
        isLegacyTwoPieceOnlySet,
        pieces: pieces as any,
        iconUrl: getEnkaUrl(a.images?.filename_flower || a.images?.filename_circlet),
      };

      const id = slugify(a.name);

      await prisma.artifactSet.upsert({
        where: { id },
        create: { id, ...basePayload, rarityRange },
        update: { ...basePayload, rarityRange: { set: rarityRange } }, // { set: [...] } bắt buộc cho mảng khi update
      });
      count++;
    } catch (err) {
      console.warn(`⚠ Skipped artifact set "${name}":`, (err as Error).message);
    }
  }
  console.log(`✔ Seeded ${count} artifact sets`);
}