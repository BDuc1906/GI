import { createRequire } from "module";
import { prisma } from "../../src/lib/db/prisma";
import { slugify, upsertMaterial } from "../lib/seed-helpers";
// getUiAssetUrl chỉ tồn tại ở scripts/lib/genshin-pure-helpers.ts —
// scripts/lib/seed-helpers.ts chỉ re-export getEnkaUrl/getElementIconUrl/
// getBestImageUrl/slugify/getMaterialIconFilename từ file đó (xem đầu file
// scripts/lib/seed-helpers.ts), KHÔNG re-export getUiAssetUrl, nên phải
// import trực tiếp từ nguồn gốc thay vì qua seed-helpers.ts.
import { getUiAssetUrl } from "../lib/genshin-pure-helpers";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

// domainType (raw enum trong data gốc) -> category dùng trong schema của ta.
// Xác nhận bằng cách soi trực tiếp dữ liệu thật (không đoán theo tên hiển
// thị "Domain of Forgery/Mastery/Blessing" vì tên đó chỉ là tiền tố dịch,
// domainType mới là giá trị ổn định để phân loại).
const CATEGORY_BY_DOMAIN_TYPE: Record<string, string> = {
  UI_ABYSSUS_RELIC: "artifact",
  UI_ABYSSUS_WEAPON_PROMOTE: "weapon",
  UI_ABYSSUS_AVATAR_PROUD: "talent",
};

// Reward chung mọi domain đều có (EXP/Mora/Companionship EXP) — loại ra
// khỏi "materials" vì không giúp phân biệt domain nào cho nguyên liệu gì,
// mục đích field này là "domain X cho nguyên liệu đặc trưng gì".
const GENERIC_REWARD_NAMES = new Set(["Adventure EXP", "Mora", "Companionship EXP"]);

// Tên domain gốc trong genshin-db tách riêng theo độ khó, vd:
// "Domain of Forgery: Artisanship I" / "...II" / "...III" / "...IV"
// -> gộp lại thành 1 bí cảnh duy nhất trên web (khác độ khó chỉ đổi số
// lượng phần thưởng, không đổi lịch mở/nguyên liệu/quái).
function baseDomainName(fullName: string): string {
  return fullName.replace(/\s+(I{1,3}|IV|V)$/, "").trim();
}

// Trong các biến thể độ khó cùng 1 domain, lấy bản độ khó CAO NHẤT làm đại
// diện — reward preview của bản cao nhất luôn là tập đầy đủ nhất (rarity
// nguyên liệu cao nhất mà domain đó có thể cho), phù hợp hiển thị lên web
// hơn là bản độ khó thấp nhất.
function pickHighestDifficulty(variantNames: string[]): string {
  const rank = (n: string): number => {
    const m = n.match(/\s+(I{1,3}|IV|V)$/);
    if (!m) return 0;
    return { I: 1, II: 2, III: 3, IV: 4, V: 5 }[m[1]] ?? 0;
  };
  return [...variantNames].sort((a, b) => rank(b) - rank(a))[0];
}

export async function seedDomains(): Promise<void> {
  const allNames = genshindb.domains("names", { matchCategories: true }) as string[];

  // Gộp theo tên gốc trước khi seed từng cái, để mỗi domain vật lý chỉ tạo
  // đúng 1 dòng trong DB thay vì 3-5 dòng gần như trùng lặp.
  const groups = new Map<string, string[]>();
  for (const name of allNames) {
    const base = baseDomainName(name);
    const arr = groups.get(base) ?? [];
    arr.push(name);
    groups.set(base, arr);
  }

  let count = 0;
  for (const [baseName, variants] of groups) {
    try {
      const representativeName = pickHighestDifficulty(variants);
      const d = genshindb.domains(representativeName) as any;
      if (!d || !d.name || !d.domainType) continue;

      const category = CATEGORY_BY_DOMAIN_TYPE[d.domainType];
      if (!category) {
        console.warn(
          `⚠ Domain "${d.name}" có domainType "${d.domainType}" chưa biết đến ` +
            `(không nằm trong CATEGORY_BY_DOMAIN_TYPE) — bỏ qua. Nếu đây là loại ` +
            `bí cảnh mới từ bản cập nhật game, cần thêm mapping tương ứng.`
        );
        continue;
      }

      // Lọc nguyên liệu đặc trưng (loại bỏ EXP/Mora/Companionship EXP chung).
      const rewardItems: Array<{ name: string; count?: number }> = Array.isArray(d.rewardPreview)
        ? d.rewardPreview.filter((r: any) => r?.name && !GENERIC_REWARD_NAMES.has(r.name))
        : [];

      const materials = [];
      for (const item of rewardItems) {
        if (category === "artifact") {
          // QUAN TRỌNG: domain loại "artifact" (Bí cảnh Thánh Di Vật) trả
          // về TÊN BỘ THÁNH DI VẬT trong rewardPreview (vd "Shimenawa's
          // Reminiscence"), KHÔNG PHẢI tên nguyên liệu. Trước đây code này
          // gọi upsertMaterial() y hệt 2 category kia -> genshindb.materials()
          // luôn luôn không tìm thấy (đúng ra phải tra ArtifactSet), khiến
          // TOÀN BỘ bộ thánh di vật trong game bị báo nhầm "thiếu icon" mỗi
          // lần seed, dù không liên quan gì đến genshin-db cũ/mới.
          //
          // ArtifactSet đã được seedArtifacts() upsert xong TRƯỚC KHI hàm
          // này chạy (xem thứ tự gọi trong update-data.ts) với cùng công
          // thức id = slugify(name), nên chỉ cần tham chiếu lại, không cần
          // tra cứu gì thêm ở đây.
          materials.push({ artifactSetId: slugify(item.name), name: item.name });
        } else {
          const materialId = await upsertMaterial(prisma, genshindb, item.name);
          materials.push({ materialId, name: item.name });
        }
      }

      // Ảnh GỐC (hotlink) tại lần crawl này — ghi tự do mỗi lần seed vào
      // imageUrlOriginal. Cột imageUrl (hiển thị) do
      // scripts/mirror-images-to-r2.ts sở hữu sau lần mirror đầu tiên và
      // KHÔNG được set ở nhánh `update` bên dưới.
      //
      // BUG ĐÃ SỬA: trước đây dùng getEnkaUrl() để build URL này
      // (`https://enka.network/ui/${filename}.png`) — SAI cùng lớp lỗi đã
      // từng sửa cho icon kỹ năng/cung mệnh (xem comment trong
      // scripts/lib/seed-helpers.ts::getUiAssetUrl): enka.network CHỈ
      // mirror ảnh THẬT SỰ hiển thị trên chính trang showcase của nó
      // (avatar/vũ khí/thánh di vật), KHÔNG phải toàn bộ asset UI_* của
      // game. Ảnh bí cảnh (dạng "UI_DungeonPic_*") không nằm trong tập đó
      // nên enka.network trả 404 gần như 100% số lần — toàn bộ ảnh bí
      // cảnh trên trang /domains vỡ hết dù DB seed "thành công" bình
      // thường, không có gì báo lỗi ra ngoài lúc seed.
      //
      // getUiAssetUrl() trỏ sang gi.yatta.moe (Project Amber) — dump TOÀN
      // BỘ asset UI_* của game, đã dùng làm nguồn CHÍNH cho icon kỹ
      // năng/cung mệnh, domain gi.yatta.moe cũng đã có sẵn trong
      // HOTLINK_REMOTE_PATTERNS ở next.config.ts nên không cần sửa gì
      // thêm ở đó.
      const imageUrlOriginal = getUiAssetUrl(d.images?.filename_image);

      const payload = {
        name: baseName,
        category,
        regionName: d.regionName ?? null,
        description: d.description ?? null,
        recommendedLevel: d.recommendedLevel ?? null,
        recommendedElements: Array.isArray(d.recommendedElements) ? d.recommendedElements : [],
        // daysOfWeek chỉ có ở domain vũ khí/sách thiên phú; domain thánh di
        // vật mở hằng ngày nên genshin-db không trả field này -> mảng rỗng.
        daysOfWeek: Array.isArray(d.daysOfWeek) ? d.daysOfWeek : [],
        unlockRank: d.unlockRank ?? null,
        materials: materials.length ? JSON.parse(JSON.stringify(materials)) : null,
        monsterNames: Array.isArray(d.monsterList)
          ? d.monsterList.map((m: any) => m?.name).filter(Boolean)
          : [],
        imageUrlOriginal,
        gameVersion: d.version ?? null,
      };

      const id = slugify(baseName);
      await prisma.domain.upsert({
        where: { id },
        // Record mới -> chưa mirror lần nào, tạm hiển thị thẳng bằng hotlink.
        create: { id, ...payload, imageUrl: imageUrlOriginal },
        // Record đã tồn tại -> KHÔNG đụng imageUrl.
        update: payload,
      });
      count++;
    } catch (err) {
      console.warn(`⚠ Skipped domain group "${baseName}":`, (err as Error).message);
    }
  }
  console.log(`✔ Seeded ${count} domains (gộp từ ${allNames.length} entry gốc theo độ khó)`);
}
