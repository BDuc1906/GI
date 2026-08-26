/**
 * scripts/seed-name-translations.ts
 *
 * Điền cột `nameTranslations Json?` (xem
 * prisma/schema-nameTranslations.patch.md) — tên hiển thị theo TỪNG NGÔN
 * NGỮ trong 15 locale của dự án (src/i18n/routing.ts), cho cả 5 loại:
 * Character, Weapon, ArtifactSet, Domain, Material.
 *
 * NGUỒN DỮ LIỆU: xem đầy đủ ở scripts/lib/name-translations.ts.
 *   - 13/15 locale: tên CHÍNH THỨC từ chính game (qua genshin-db), không
 *     phải dịch máy.
 *   - 2/15 locale còn lại (it, tr — game gốc không hỗ trợ): dịch máy qua
 *     Azure Translator (cùng cơ chế scripts/i18n-translate.mjs).
 *
 * voiceActors KHÔNG nằm trong phạm vi script này — đó là tên diễn viên
 * lồng tiếng NGOÀI ĐỜI THẬT, không đổi theo ngôn ngữ trang web (chỉ nhãn
 * "Tiếng Nhật:"/"日本語:" mới cần dịch qua src/messages/*.json, không phải
 * chính cái tên).
 *
 * CHẠY LẦN ĐẦU — BẮT BUỘC theo đúng thứ tự:
 *   1. npx prisma migrate dev --name add_name_translations
 *      (hoặc migrate deploy nếu chạy trên production)
 *   2. npx tsx scripts/inspect-name-translations.ts
 *      → soát output, xác nhận tên dịch ra đúng trước khi chạy hàng loạt.
 *   3. AZURE_TRANSLATOR_KEY=xxx AZURE_TRANSLATOR_REGION=southeastasia \
 *      npx tsx scripts/seed-name-translations.ts
 *      (thiếu 2 biến trên vẫn chạy được — chỉ bỏ qua riêng locale it/tr,
 *      không chặn 13 locale còn lại; sẽ in cảnh báo rõ ràng)
 *
 * TÙY CHỌN:
 *   --dry-run              Chỉ in ra sẽ dịch bao nhiêu dòng, KHÔNG ghi DB.
 *   --only=weapons,domains Chỉ chạy cho 1 vài bảng (mặc định: tất cả).
 *
 * Script CHẠY LẠI AN TOÀN NHIỀU LẦN (idempotent) — luôn ghi đè toàn bộ
 * nameTranslations bằng kết quả tính lại mới nhất, không có khái niệm
 * "chỉ điền chỗ thiếu" như i18n-translate.mjs (đây là backfill cho dữ
 * liệu game ít thay đổi, không phải file dịch UI sửa tay thường xuyên —
 * ghi đè lại không mất công review thủ công nào).
 */

import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import { createRequire } from "module";
import { prisma } from "../../src/lib/db/prisma";
import {
  getOfficialGameNames,
  translateNamesAzure,
  MACHINE_TRANSLATE_ONLY_LOCALES,
} from "../../src/lib/i18n/name-translations";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as Record<string, unknown>;

const AZURE_KEY = process.env.AZURE_TRANSLATOR_KEY;
const AZURE_REGION = process.env.AZURE_TRANSLATOR_REGION;

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const onlyArg = args.find((a) => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.split("=")[1].split(",") : null;
  return { dryRun, only };
}

interface Row {
  id: string;
  name: string;
}

interface TableConfig {
  key: string; // dùng cho --only=
  folder: string; // tên hàm query genshin-db
  label: string; // in log
  findMany: () => Promise<Row[]>;
  update: (id: string, nameTranslations: Record<string, string>) => Promise<unknown>;
  // true = tên riêng (nhân vật) — cảnh báo rủi ro dịch máy rõ hơn ở cuối
  isProperNounHeavy?: boolean;
}

const TABLES: TableConfig[] = [
  {
    key: "characters",
    folder: "characters",
    label: "Character",
    findMany: () => prisma.character.findMany({ select: { id: true, name: true } }),
    update: (id, nameTranslations) => prisma.character.update({ where: { id }, data: { nameTranslations } }),
    isProperNounHeavy: true,
  },
  {
    key: "weapons",
    folder: "weapons",
    label: "Weapon",
    findMany: () => prisma.weapon.findMany({ select: { id: true, name: true } }),
    update: (id, nameTranslations) => prisma.weapon.update({ where: { id }, data: { nameTranslations } }),
  },
  {
    key: "artifacts",
    folder: "artifacts",
    label: "ArtifactSet",
    findMany: () => prisma.artifactSet.findMany({ select: { id: true, name: true } }),
    update: (id, nameTranslations) => prisma.artifactSet.update({ where: { id }, data: { nameTranslations } }),
  },
  {
    key: "domains",
    folder: "domains",
    label: "Domain",
    // Tên trong DB là bản ĐÃ GỘP (bỏ số La Mã độ khó, xem seed-domains.ts)
    // — genshin-db không có entry khớp tuyệt đối 100% chuỗi này, nhưng cơ
    // chế autocomplete/substring-match của nó (xem README) vẫn khớp đúng
    // vào 1 trong các biến thể độ khó của domain đó, và phần TÊN (không
    // tính số La Mã) giống hệt nhau giữa các độ khó trong mọi ngôn ngữ —
    // nên kết quả dịch vẫn đúng dù match vào biến thể độ khó nào.
    findMany: () => prisma.domain.findMany({ select: { id: true, name: true } }),
    update: (id, nameTranslations) => prisma.domain.update({ where: { id }, data: { nameTranslations } }),
  },
  {
    key: "materials",
    folder: "materials",
    label: "Material",
    findMany: () => prisma.material.findMany({ select: { id: true, name: true } }),
    update: (id, nameTranslations) => prisma.material.update({ where: { id }, data: { nameTranslations } }),
  },
];

async function main(): Promise<void> {
  const { dryRun, only } = parseArgs();
  const tables = only ? TABLES.filter((t) => only.includes(t.key)) : TABLES;

  if (!AZURE_KEY) {
    console.warn(
      "⚠ Thiếu AZURE_TRANSLATOR_KEY — sẽ BỎ QUA locale 'it' và 'tr' (13 " +
        "locale còn lại từ genshin-db vẫn chạy bình thường, không bị chặn).\n" +
        "  Muốn dịch đủ 15/15: xem hướng dẫn lấy key ở đầu scripts/i18n-translate.mjs.\n"
    );
  }

  const properNounReviewList: string[] = [];

  for (const table of tables) {
    console.log(`\n=== ${table.label} ===`);
    const rows = await table.findMany();
    console.log(`  ${rows.length} dòng cần dịch tên.`);

    // Bước 1: tên chính thức 13 ngôn ngữ từ genshin-db (local, không mạng).
    const perRow: Array<{ id: string; names: Record<string, string> }> = rows.map((row) => ({
      id: row.id,
      names: getOfficialGameNames(genshindb, table.folder, row.name),
    }));

    // Bước 2: dịch máy Azure cho it/tr — theo LÔ 100 tên/lần (giới hạn
    // Azure), gộp toàn bộ bảng lại thay vì gọi lẻ tẻ từng dòng.
    if (AZURE_KEY) {
      for (const locale of MACHINE_TRANSLATE_ONLY_LOCALES) {
        const BATCH_SIZE = 100;
        for (let i = 0; i < perRow.length; i += BATCH_SIZE) {
          const batch = perRow.slice(i, i + BATCH_SIZE);
          const englishNames = batch.map((r) => r.names.en);
          const translated = await translateNamesAzure(englishNames, locale, AZURE_KEY, AZURE_REGION);
          batch.forEach((r, idx) => {
            r.names[locale] = translated[idx];
            if (table.isProperNounHeavy) {
              properNounReviewList.push(`[${table.label}/${locale}] ${r.names.en} → ${translated[idx]}`);
            }
          });
          console.log(`  → đã dịch máy (${locale}) ${Math.min(i + BATCH_SIZE, perRow.length)}/${perRow.length}`);
          if (i + BATCH_SIZE < perRow.length) await new Promise((r) => setTimeout(r, 400));
        }
      }
    }

    // Bước 3: ghi DB.
    if (!dryRun) {
      for (const r of perRow) {
        await table.update(r.id, r.names);
      }
      console.log(`  ✔ Đã ghi nameTranslations cho ${perRow.length} dòng.`);
    } else {
      console.log(`  (--dry-run, chưa ghi DB)`);
    }
  }

  if (properNounReviewList.length > 0) {
    console.log(
      `\n⚠ ${properNounReviewList.length} TÊN NHÂN VẬT vừa được DỊCH MÁY (it/tr) — ` +
        "đây là danh từ riêng, máy dịch dễ sai/ngớ ngẩn hơn hẳn 13 ngôn ngữ còn " +
        "lại (lấy trực tiếp từ game). Nên soát tay danh sách dưới đây, sửa lại " +
        "qua Prisma Studio (cột Character.nameTranslations) nếu thấy bất thường:\n"
    );
    properNounReviewList.forEach((line) => console.log(`  - ${line}`));
  }

  console.log("\n✔ Hoàn tất.");
}

main()
  .catch((err) => {
    console.error("✗ Lỗi:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
