import { assertEnv } from "../src/lib/env";

assertEnv();

import { prisma } from "../src/lib/prisma";

/**
 * scripts/verify-seed-integrity.ts
 *
 * Kiểm tra tính toàn vẹn dữ liệu NGAY SAU khi seed. Chạy tay sau
 * `npm run db:seed`, KHÔNG chạy trong GitHub Actions CI — CI hiện tại chỉ
 * migrate schema rồi build/test API trên một DB Postgres rỗng (service
 * container tạm), không seed dữ liệu thật (xem .github/workflows/ci.yml).
 * Seed dữ liệu thật là thao tác thủ công nhắm thẳng vào DB production, theo
 * đúng quy trình ở mục "Cập nhật dữ liệu khi có bản mới của game" trong
 * README.md — script này nên chạy làm bước tiếp theo, ngay sau `db:seed`,
 * trước khi tin rằng dữ liệu đã seed đúng.
 *
 * Lý do cần script này: `npm run db:seed` trước đây có thể chạy "thành
 * công" (exit code 0, không ném lỗi) nhưng dữ liệu vẫn sai hoặc thiếu hàng
 * loạt — 2 case thật đã xảy ra và được ghi lại trong CHANGELOG.md:
 *
 *   1. Thiếu field `sideIconUrl` trong schema.prisma dù cột đã tồn tại
 *      trong DB → Prisma Client sinh thiếu field → MỌI lệnh upsert nhân vật
 *      ném lỗi "Unknown argument sideIconUrl" → bảng Character seed được
 *      ĐÚNG 0 dòng. Script seed vẫn exit 0 vì lỗi bị try/catch nuốt ở vòng
 *      lặp từng nhân vật, chỉ log cảnh báo — không ai để ý giữa hàng trăm
 *      dòng log cho tới khi web hiển thị trống.
 *   2. `BOSS_MATERIAL_NAMES` build sai (category không tồn tại trong
 *      genshin-db) → luôn rỗng → MỌI nhân vật mất nguyên liệu boss ở đột
 *      phá 7-10 (`ascensionMaterials` vẫn có object cho các phase đó,
 *      nhưng mảng `materials` bên trong rỗng) — bảng Character KHÔNG rỗng
 *      nên các kiểm tra "count > 0" đơn thuần sẽ không bắt được lỗi này.
 *
 * Vì vậy script này kiểm tra 2 tầng:
 *   - Tầng bảng (count > 0): bắt case (1) — seed toàn bộ thất bại âm thầm.
 *   - Tầng field/cấu trúc bên trong từng dòng: bắt case (2) — seed "thành
 *     công" nhưng dữ liệu rỗng/thiếu ở một phần cụ thể.
 *
 * Quy tắc FAIL vs WARN:
 *   - FAIL (exit 1, chặn CI): nhiều khả năng là bug seed thật — bảng rỗng,
 *     field bắt buộc null/rỗng hàng loạt, giá trị vi phạm invariant đã biết
 *     của game (vd không đúng 6 cung mệnh).
 *   - WARN (in ra nhưng KHÔNG chặn CI): thiếu sót đã biết trước, có nguyên
 *     nhân rõ ràng và được ghi lại (vd nhân vật quá mới chưa có nguồn
 *     talentMaterials — xem ALLOWLIST_MISSING_TALENT_MATERIALS bên dưới).
 *     Nếu số lượng WARN vượt allowlist, tự động chuyển thành FAIL — để
 *     không bị "quen mắt" bỏ qua khi có thêm nhân vật mới bị thiếu dữ liệu
 *     ngoài dự kiến.
 */

// Đồng bộ tay với mục "Fixed" trong CHANGELOG.md — 11 nhân vật quá mới,
// chưa tìm được nguồn liệt kê talentMaterials đích danh (đúng nguyên tắc
// "không đoán" của dự án, xem scripts/seed-characters.ts). Cập nhật danh
// sách này khi tìm được nguồn và điền dữ liệu, hoặc khi có nhân vật mới ra
// mắt còn thiếu.
const ALLOWLIST_MISSING_TALENT_MATERIALS = new Set([
  "aino",
  "flins",
  "illuga",
  "jahoda",
  "linnea",
  "lohen",
  "manekin",
  "manekina",
  "nicole",
  "prune",
  "zibai",
]);

const VALID_DOMAIN_CATEGORIES = new Set(["artifact", "weapon", "talent"]);

type Issue = { level: "FAIL" | "WARN"; message: string };
const issues: Issue[] = [];

function fail(message: string): void {
  issues.push({ level: "FAIL", message });
}
function warn(message: string): void {
  issues.push({ level: "WARN", message });
}

async function checkTableNotEmpty(
  label: string,
  count: number
): Promise<void> {
  if (count === 0) {
    fail(`Bảng ${label} có 0 dòng — seed đã thất bại hoàn toàn cho bảng này.`);
  } else {
    console.log(`  ✔ ${label}: ${count} dòng`);
  }
}

async function checkCharacters(): Promise<void> {
  const characters = await prisma.character.findMany({
    select: {
      id: true,
      name: true,
      iconUrl: true,
      ascensionMaterials: true,
      talents: true,
      talentMaterials: true,
      constellations: true,
      statsByLevel: true,
    },
  });
  await checkTableNotEmpty("Character", characters.length);

  let missingIcon = 0;
  let missingAscension = 0;
  let emptyAscensionPhase = 0;
  let missingTalents = 0;
  let wrongConstellationCount = 0;
  let missingStats = 0;
  const talentMaterialsWarnList: string[] = [];
  const talentMaterialsUnexpected: string[] = [];

  for (const c of characters) {
    if (!c.iconUrl) missingIcon++;

    const ascension = c.ascensionMaterials as
      | Array<{ phase: number; materials: unknown[] }>
      | null;
    if (!ascension || ascension.length === 0) {
      missingAscension++;
    } else {
      // Bắt lại đúng dạng lỗi của case BOSS_MATERIAL_NAMES: object phase vẫn
      // tồn tại nhưng mảng materials bên trong rỗng ở một phase bất kỳ từ
      // phase 2 trở đi (phase 1 hợp lệ khi rỗng — chưa cần đột phá).
      const hasEmptyPhase = ascension.some(
        (p) => p.phase >= 2 && (!p.materials || p.materials.length === 0)
      );
      if (hasEmptyPhase) emptyAscensionPhase++;
    }

    const talents = c.talents as unknown[] | null;
    if (!talents || talents.length < 3) missingTalents++;

    const constellations = c.constellations as unknown[] | null;
    if (!constellations || constellations.length !== 6) {
      wrongConstellationCount++;
    }

    const stats = c.statsByLevel as unknown[] | null;
    if (!stats || stats.length === 0) missingStats++;

    const talentMats = c.talentMaterials as unknown[] | null;
    if (!talentMats || talentMats.length === 0) {
      if (ALLOWLIST_MISSING_TALENT_MATERIALS.has(c.id)) {
        talentMaterialsWarnList.push(c.id);
      } else {
        talentMaterialsUnexpected.push(c.id);
      }
    }
  }

  if (missingIcon > 0) fail(`${missingIcon} nhân vật thiếu iconUrl.`);
  if (missingAscension > 0)
    fail(`${missingAscension} nhân vật thiếu ascensionMaterials hoàn toàn.`);
  if (emptyAscensionPhase > 0)
    fail(
      `${emptyAscensionPhase} nhân vật có ít nhất 1 phase đột phá (>= 2) với ` +
        `mảng materials rỗng — dấu hiệu giống bug BOSS_MATERIAL_NAMES đã fix ` +
        `trước đây, kiểm tra lại danh sách nguyên liệu build trong seed-characters.ts.`
    );
  if (missingTalents > 0)
    fail(`${missingTalents} nhân vật thiếu talents (hoặc ít hơn 3 mục).`);
  if (wrongConstellationCount > 0)
    fail(
      `${wrongConstellationCount} nhân vật KHÔNG có đúng 6 cung mệnh — mọi ` +
        `nhân vật trong game đều có đúng 6, lệch số này luôn là lỗi seed.`
    );
  if (missingStats > 0)
    fail(`${missingStats} nhân vật thiếu statsByLevel.`);

  if (talentMaterialsWarnList.length > 0) {
    warn(
      `${talentMaterialsWarnList.length} nhân vật thiếu talentMaterials, ` +
        `đúng như allowlist đã biết (${talentMaterialsWarnList.sort().join(", ")}).`
    );
  }
  if (talentMaterialsUnexpected.length > 0) {
    fail(
      `${talentMaterialsUnexpected.length} nhân vật thiếu talentMaterials ` +
        `NGOÀI allowlist đã biết: ${talentMaterialsUnexpected.sort().join(", ")}. ` +
        `Nếu đây là nhân vật mới thật sự chưa có nguồn, thêm id vào ` +
        `ALLOWLIST_MISSING_TALENT_MATERIALS trong scripts/verify-seed-integrity.ts ` +
        `kèm ghi chú lý do; nếu không, đây là lỗi cần sửa TALENT_BOOK_SERIES_BY_CHARACTER.`
    );
  }
}

async function checkWeapons(): Promise<void> {
  const weapons = await prisma.weapon.findMany({
    select: { id: true, iconUrl: true, ascensionMaterials: true },
  });
  await checkTableNotEmpty("Weapon", weapons.length);

  let missingIcon = 0;
  let missingAscension = 0;
  for (const w of weapons) {
    if (!w.iconUrl) missingIcon++;
    const ascension = w.ascensionMaterials as Array<unknown> | null;
    if (!ascension || ascension.length === 0) missingAscension++;
  }
  if (missingIcon > 0) fail(`${missingIcon} vũ khí thiếu iconUrl.`);
  if (missingAscension > 0)
    fail(`${missingAscension} vũ khí thiếu ascensionMaterials.`);
}

async function checkArtifactSets(): Promise<void> {
  const sets = await prisma.artifactSet.findMany({
    select: {
      id: true,
      iconUrl: true,
      onePieceBonus: true,
      twoPieceBonus: true,
      fourPieceBonus: true,
    },
  });
  await checkTableNotEmpty("ArtifactSet", sets.length);

  let missingIcon = 0;
  let missingAllBonuses = 0;
  for (const s of sets) {
    if (!s.iconUrl) missingIcon++;
    if (!s.onePieceBonus && !s.twoPieceBonus && !s.fourPieceBonus) {
      missingAllBonuses++;
    }
  }
  if (missingIcon > 0) fail(`${missingIcon} bộ thánh di vật thiếu iconUrl.`);
  if (missingAllBonuses > 0)
    fail(
      `${missingAllBonuses} bộ thánh di vật không có bất kỳ hiệu ứng ` +
        `(1pc/2pc/4pc) nào — chắc chắn là lỗi seed, mọi set thật đều có ít nhất 1.`
    );
}

async function checkMaterials(): Promise<void> {
  const count = await prisma.material.count();
  await checkTableNotEmpty("Material", count);
  // Không FAIL vì thiếu icon — đây là trường hợp đã biết và có cơ chế báo
  // riêng (MATERIALS_MISSING_ICON / printMissingIconSummary() trong
  // scripts/lib/seed-helpers.ts, chạy ngay trong lúc seed).
}

async function checkDomains(): Promise<void> {
  const domains = await prisma.domain.findMany({
    select: {
      id: true,
      category: true,
      imageUrl: true,
      daysOfWeek: true,
      materials: true,
    },
  });
  await checkTableNotEmpty("Domain", domains.length);

  let invalidCategory = 0;
  let missingImage = 0;
  let weaponOrTalentMissingDays = 0;
  let weaponOrTalentMissingMaterials = 0;

  for (const d of domains) {
    if (!VALID_DOMAIN_CATEGORIES.has(d.category)) invalidCategory++;
    if (!d.imageUrl) missingImage++;

    if (d.category === "weapon" || d.category === "talent") {
      if (!d.daysOfWeek || d.daysOfWeek.length === 0) {
        weaponOrTalentMissingDays++;
      }
      const materials = d.materials as unknown[] | null;
      if (!materials || materials.length === 0) {
        weaponOrTalentMissingMaterials++;
      }
    }
  }

  if (invalidCategory > 0)
    fail(
      `${invalidCategory} bí cảnh có category KHÔNG nằm trong ` +
        `["artifact","weapon","talent"] — sẽ không khớp bộ lọc category trên UI/API.`
    );
  if (missingImage > 0) warn(`${missingImage} bí cảnh thiếu imageUrl.`);
  if (weaponOrTalentMissingDays > 0)
    fail(
      `${weaponOrTalentMissingDays} bí cảnh loại weapon/talent thiếu ` +
        `daysOfWeek — 2 loại này luôn chỉ mở vào các ngày cố định trong tuần, ` +
        `rỗng ở đây gần như chắc chắn là lỗi seed (rỗng chỉ hợp lệ cho category "artifact").`
    );
  if (weaponOrTalentMissingMaterials > 0)
    fail(
      `${weaponOrTalentMissingMaterials} bí cảnh loại weapon/talent thiếu ` +
        `materials — lý do tồn tại của 2 loại bí cảnh này là để farm nguyên liệu ` +
        `cụ thể, rỗng ở đây luôn là lỗi seed.`
    );
}

async function main(): Promise<void> {
  console.log("Kiểm tra tính toàn vẹn dữ liệu sau seed...\n");

  console.log("Characters:");
  await checkCharacters();
  console.log("\nWeapons:");
  await checkWeapons();
  console.log("\nArtifact sets:");
  await checkArtifactSets();
  console.log("\nMaterials:");
  await checkMaterials();
  console.log("\nDomains:");
  await checkDomains();

  const fails = issues.filter((i) => i.level === "FAIL");
  const warns = issues.filter((i) => i.level === "WARN");

  if (warns.length > 0) {
    console.warn(`\n⚠ ${warns.length} cảnh báo (không chặn CI):`);
    for (const w of warns) console.warn(`   - ${w.message}`);
  }

  if (fails.length > 0) {
    console.error(`\n❌ ${fails.length} lỗi toàn vẹn dữ liệu (chặn CI):`);
    for (const f of fails) console.error(`   - ${f.message}`);
    process.exit(1);
  }

  console.log("\n✔ Dữ liệu hợp lệ, không phát hiện lỗi toàn vẹn nào.");
}

main()
  .catch((e) => {
    console.error("❌ Script verify-seed-integrity thất bại khi chạy:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
