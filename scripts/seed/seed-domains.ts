import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../../src/lib/db/prisma";
import { slugify, upsertMaterial } from "../lib/seed-helpers";
import { logDataSyncChange } from "../lib/audit-diff";
// getUiAssetUrl chỉ tồn tại ở scripts/lib/genshin-pure-helpers.ts —
// scripts/lib/seed-helpers.ts chỉ re-export getEnkaUrl/getElementIconUrl/
// getBestImageUrl/slugify/getMaterialIconFilename từ file đó (xem đầu file
// scripts/lib/seed-helpers.ts), KHÔNG re-export getUiAssetUrl, nên phải
// import trực tiếp từ nguồn gốc thay vì qua seed-helpers.ts.
import { getUiAssetUrl } from "../lib/genshin-pure-helpers";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Domain nào không tự xác minh được ảnh nào còn sống (kể cả sau khi thử
// hết ứng viên tự động) sẽ được liệt kê ở đây rồi in cảnh báo tổng ở cuối
// — người vận hành tự tìm URL đúng, điền vào domain-image-overrides.json,
// chạy lại seed là DB cập nhật ngay, không cần sửa code.
const domainsWithoutVerifiedImage: string[] = [];

let domainImageOverrides: Record<string, string> = {};
try {
  const raw = fs.readFileSync(path.join(__dirname, "../data/domain-image-overrides.json"), "utf-8");
  domainImageOverrides = JSON.parse(raw);
} catch {
  domainImageOverrides = {};
}

/**
 * Kiểm tra 1 URL ảnh có thực sự tải được không (HEAD request, timeout 5s).
 *
 * LÝ DO CẦN HÀM NÀY: đã xác nhận bằng thực nghiệm (fetch tay + log runtime
 * thật) rằng getUiAssetUrl() (gi.yatta.moe) — dù tài liệu ghi "dump TOÀN
 * BỘ asset UI_*" và đã dùng làm nguồn chính cho icon kỹ năng/cung mệnh —
 * KHÔNG bao phủ loại ảnh nền bí cảnh (`UI_DungeonPic_*`), trả 404 cho phần
 * lớn domain. enka.network cũng 404 y hệt (dự đoán trước đó, đã biết).
 * Thay vì tiếp tục ĐOÁN xem nguồn nào "chắc đúng" (không thể xác minh 100%
 * mà không thực sự gọi thử), giờ THỰC SỰ gọi HEAD tới từng ứng viên trước
 * khi ghi vào DB — chỉ lưu URL đã xác nhận sống, không bao giờ lưu 1 link
 * chắc chắn chết nữa.
 */
async function urlExists(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Tìm URL ảnh domain còn sống, theo thứ tự ưu tiên:
 *   1. Override thủ công trong domain-image-overrides.json (nếu có) — tin
 *      tưởng tuyệt đối, KHÔNG verify lại (người điền đã tự xác nhận).
 *   2. gi.yatta.moe (getUiAssetUrl) — verify bằng HEAD request thật.
 *   3. enka.network (dạng URL cũ) — verify bằng HEAD request thật, phòng
 *      trường hợp gi.yatta.moe lỗi nhưng enka.network lại có (hiếm nhưng
 *      không loại trừ, 2 nguồn mirror độc lập nhau).
 * Không có ứng viên nào sống -> null (KHÔNG đoán bừa) + ghi nhận vào
 * domainsWithoutVerifiedImage để cảnh báo cuối script.
 */
async function resolveDomainImageUrl(domainId: string, filename: string | undefined): Promise<string | null> {
  const override = domainImageOverrides[domainId];
  if (typeof override === "string" && override.startsWith("http")) return override;

  if (!filename) {
    domainsWithoutVerifiedImage.push(domainId);
    return null;
  }

  const candidates = [getUiAssetUrl(filename), `https://enka.network/ui/${filename}.png`].filter(
    (u): u is string => !!u
  );

  for (const url of candidates) {
    if (await urlExists(url)) return url;
  }

  domainsWithoutVerifiedImage.push(domainId);
  return null;
}


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
      // BUG ĐÃ SỬA (2 LẦN): lần 1 đổi enka.network -> gi.yatta.moe
      // (getUiAssetUrl) vì enka.network chỉ mirror ảnh hiển thị trên
      // chính site nó, không có ảnh bí cảnh. Lần 2 (2026-09): xác nhận
      // bằng thực nghiệm (fetch tay + log runtime thật) rằng gi.yatta.moe
      // CŨNG 404 phần lớn ảnh `UI_DungeonPic_*` dù tài liệu ghi "dump
      // toàn bộ asset UI_*" — tài liệu không đúng 100% cho riêng loại
      // asset này. Giờ KHÔNG còn tin mù 1 nguồn nào nữa — gọi
      // resolveDomainImageUrl() để thực sự HEAD-check từng ứng viên,
      // dùng override thủ công nếu có, và trả về null (chứ không phải 1
      // URL đoán bừa) nếu không nguồn nào xác minh được.
      const domainId = slugify(baseName);
      const imageUrlOriginal = await resolveDomainImageUrl(domainId, d.images?.filename_image);

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

      // Đọc record cũ TRƯỚC khi upsert — cho audit-diff (xem
      // scripts/lib/audit-diff.ts, cùng pattern các seed script khác).
      const existingDomain = await prisma.domain.findUnique({ where: { id: domainId } });

      await prisma.domain.upsert({
        where: { id: domainId },
        // Record mới -> chưa mirror lần nào, tạm hiển thị thẳng bằng hotlink.
        create: { id: domainId, ...payload, imageUrl: imageUrlOriginal },
        // Record đã tồn tại -> KHÔNG đụng imageUrl.
        update: payload,
      });

      await logDataSyncChange({
        entityType: "domain",
        entityId: domainId,
        oldRecord: existingDomain,
        newRecord: payload,
        source: "seed-domains",
      }).catch((err) => {
        console.warn(`⚠️ Không ghi được AuditLog cho domain "${baseName}":`, (err as Error).message);
      });

      count++;
    } catch (err) {
      console.warn(`⚠ Skipped domain group "${baseName}":`, (err as Error).message);
    }
  }
  if (domainsWithoutVerifiedImage.length) {
    console.warn(
      `\n⚠ ${domainsWithoutVerifiedImage.length} domain KHÔNG tìm được ảnh nào còn sống ` +
      `(đã thử gi.yatta.moe + enka.network, cả 2 đều 404):\n` +
      domainsWithoutVerifiedImage.map((id) => `   - ${id}`).join("\n") +
      `\n→ Tự tìm URL ảnh đúng (khuyến nghị: Genshin Impact Wiki trên Fandom) rồi thêm vào ` +
      `scripts/data/domain-image-overrides.json theo key = domain slug ở trên, chạy lại seed.`
    );
  }

  console.log(`✔ Seeded ${count} domains (gộp từ ${allNames.length} entry gốc theo độ khó)`);
}