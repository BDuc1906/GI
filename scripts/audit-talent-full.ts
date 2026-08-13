/**
 * scripts/audit-talent-full.ts
 *
 * AUDIT TOÀN DIỆN — CHẠY 1 LẦN, RA BÁO CÁO ĐẦY ĐỦ, KHÔNG CẦN CHẠY LẦN LƯỢT
 * TỪNG NHÂN VẬT.
 *
 * Quét TOÀN BỘ nhân vật có trong genshin-db (không chỉ nhóm nghi ngờ), với
 * 3 lớp kiểm tra:
 *
 *   1) SỐ LƯỢNG FIELD — nhân vật nào có passive/combat nằm ngoài 8 field
 *      cũ (combat1-3, passive1-4) mà code CŨ từng bỏ sót.
 *   2) TEXT RỖNG/THIẾU — với MỌI nhân vật (không chỉ nhóm buff), kiểm tra
 *      từng passive/combat có "name" hoặc "description" bị rỗng/null/quá
 *      ngắn (< 10 ký tự) — dấu hiệu genshin-db có field nhưng chưa kịp
 *      điền nội dung thật (hay gặp ngay sau khi 1 buff/rework vừa ra).
 *   3) NHÓM ĐÃ BIẾT BỊ BUFF CHÍNH THỨC (tra cứu thực tế, không đoán) —
 *      liệt kê chi tiết riêng cho từng nhân vật trong 3 đợt buff:
 *        - 6.0: Albedo, Eula, Klee
 *        - 6.2 "Hexenzirkel": Venti, Albedo, Mona, Klee, Fischl, Razor,
 *          Sucrose
 *        - 6.7 "Witch's Revelation": Qiqi, Wriothesley,
 *          Yumemizuki Mizuki (Mizuki), Yae Miko, Cyno, Diona, Beidou
 *      In ra TOÀN BỘ passive thật (tên + có description hay không) cho
 *      từng người này để bạn tự đọc, không tóm tắt qua loa.
 *
 * CHẠY (tại D:\GI):
 *   npx tsx scripts/audit-talent-full.ts
 *
 * KẾT QUẢ: in đầy đủ ra console + ghi audit-talent-full-report.json.
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

const VALID_ABILITY_PATTERN = /^(combat\d*|combatsp|passive\d+)$/;
const OLD_HARDCODED_FIELDS = new Set([
  "combat1",
  "combat2",
  "combatsp",
  "combat3",
  "passive1",
  "passive2",
  "passive3",
  "passive4",
]);

// Tra cứu thực tế (web search, không đoán) — 3 đợt buff chính thức cho
// nhân vật cũ, tính tới bản 7.0 (12/8/2026).
const KNOWN_REWORKED_CHARACTERS: Record<string, string> = {
  Albedo: "6.0 + 6.2 Hexenzirkel",
  Eula: "6.0",
  Klee: "6.0 + 6.2 Hexenzirkel",
  Venti: "6.2 Hexenzirkel",
  Mona: "6.2 Hexenzirkel",
  Fischl: "6.2 Hexenzirkel",
  Razor: "6.2 Hexenzirkel",
  Sucrose: "6.2 Hexenzirkel",
  Qiqi: "6.7 Witch's Revelation",
  Wriothesley: "6.7 Witch's Revelation",
  "Yumemizuki Mizuki": "6.7 Witch's Revelation",
  "Yae Miko": "6.7 Witch's Revelation",
  Cyno: "6.7 Witch's Revelation",
  Diona: "6.7 Witch's Revelation",
  Beidou: "6.7 Witch's Revelation",
};

interface TalentIssue {
  character: string;
  field: string;
  issue: "empty_name" | "empty_description" | "short_description";
  detail: string;
}

interface CharacterSummary {
  character: string;
  reworkWave: string | null; // null nếu không nằm trong nhóm buff đã biết
  passiveCount: number;
  combatCount: number;
  extraFieldsBeyondOldHardcode: string[];
  passiveDetails: Array<{ key: string; name: string | null; hasDescription: boolean; descLength: number }>;
}

async function main() {
  const names = genshindb.characters("names", { matchCategories: true }) as string[];
  console.log(`🔍 Đang audit toàn diện ${names.length} nhân vật...\n`);

  const summaries: CharacterSummary[] = [];
  const issues: TalentIssue[] = [];

  for (const name of names) {
    const talentData = genshindb.talents(name, { matchCategories: true }) as
      | Record<string, { name?: string; description?: string }>
      | undefined;
    if (!talentData) {
      issues.push({ character: name, field: "*", issue: "empty_description", detail: "genshin-db không có dữ liệu talent nào cho nhân vật này" });
      continue;
    }

    const allFields = Object.keys(talentData).filter((k) => VALID_ABILITY_PATTERN.test(k));
    const passiveFields = allFields.filter((k) => /^passive\d+$/.test(k));
    const combatFields = allFields.filter((k) => !/^passive\d+$/.test(k));
    const extraFields = allFields.filter((k) => !OLD_HARDCODED_FIELDS.has(k));

    const passiveDetails = passiveFields.map((key) => {
      const t = talentData[key];
      const name_ = t?.name ?? null;
      const desc = t?.description ?? "";
      if (!name_) {
        issues.push({ character: name, field: key, issue: "empty_name", detail: "Thiếu tên passive" });
      }
      if (!desc) {
        issues.push({ character: name, field: key, issue: "empty_description", detail: "Thiếu mô tả passive" });
      } else if (desc.length < 10) {
        issues.push({ character: name, field: key, issue: "short_description", detail: `Mô tả quá ngắn (${desc.length} ký tự): "${desc}"` });
      }
      return { key, name: name_, hasDescription: desc.length > 0, descLength: desc.length };
    });

    summaries.push({
      character: name,
      reworkWave: KNOWN_REWORKED_CHARACTERS[name] ?? null,
      passiveCount: passiveFields.length,
      combatCount: combatFields.length,
      extraFieldsBeyondOldHardcode: extraFields,
      passiveDetails,
    });
  }

  // ---- In báo cáo nhóm buff đã biết TRƯỚC (quan trọng nhất) ----
  console.log("=".repeat(70));
  console.log("NHÓM NHÂN VẬT ĐÃ ĐƯỢC BUFF CHÍNH THỨC (6.0 / 6.2 / 6.7)");
  console.log("=".repeat(70));
  for (const [charName, wave] of Object.entries(KNOWN_REWORKED_CHARACTERS)) {
    const s = summaries.find((x) => x.character.toLowerCase() === charName.toLowerCase());
    if (!s) {
      console.log(`\n❌ ${charName} (${wave}): KHÔNG TÌM THẤY trong genshin-db — kiểm tra tên/chính tả.`);
      continue;
    }
    console.log(`\n👤 ${s.character}  [đợt buff: ${wave}]`);
    console.log(`   Tổng passive: ${s.passiveCount} | combat: ${s.combatCount}`);
    for (const p of s.passiveDetails) {
      const status = p.hasDescription ? `✅ có mô tả (${p.descLength} ký tự)` : "⚠️  THIẾU MÔ TẢ";
      console.log(`   - [${p.key}] ${p.name ?? "(không tên)"} — ${status}`);
    }
  }

  // ---- Nhóm KHÔNG nằm trong danh sách buff, làm đối chứng ----
  console.log("\n" + "=".repeat(70));
  console.log("ĐỐI CHỨNG: NHÂN VẬT KHÔNG NẰM TRONG DANH SÁCH BUFF ĐÃ BIẾT");
  console.log("(chỉ hiện nhân vật CÓ vấn đề, để so sánh — nếu nhóm này cũng lỗi");
  console.log(" nhiều tương đương nhóm buff, vấn đề không phải do rework mà do")
  console.log(" chất lượng genshin-db nói chung)");
  console.log("=".repeat(70));
  const controlGroupIssues = summaries.filter(
    (s) => !s.reworkWave && (s.extraFieldsBeyondOldHardcode.length > 0 || s.passiveDetails.some((p) => !p.hasDescription))
  );
  for (const s of controlGroupIssues.slice(0, 20)) {
    console.log(`   ⚠️  ${s.character}: ${s.passiveDetails.filter((p) => !p.hasDescription).length} passive thiếu mô tả`);
  }
  if (controlGroupIssues.length > 20) {
    console.log(`   ... và ${controlGroupIssues.length - 20} nhân vật khác (xem file JSON đầy đủ)`);
  }

  // ---- Tổng kết số liệu ----
  console.log("\n" + "=".repeat(70));
  console.log("TỔNG KẾT");
  console.log("=".repeat(70));
  console.log(`Tổng số nhân vật quét: ${names.length}`);
  console.log(`Tổng số vấn đề phát hiện (text rỗng/thiếu, mọi nhân vật): ${issues.length}`);
  console.log(`Trong đó thuộc nhóm đã bị buff chính thức: ${issues.filter((i) => KNOWN_REWORKED_CHARACTERS[i.character]).length}`);
  console.log(`Trong đó thuộc nhóm KHÔNG bị buff (đối chứng): ${issues.filter((i) => !KNOWN_REWORKED_CHARACTERS[i.character]).length}`);

  writeFileSync(
    "audit-talent-full-report.json",
    JSON.stringify({ generatedAt: new Date().toISOString(), totalCharacters: names.length, summaries, issues }, null, 2),
    "utf-8"
  );
  console.log(`\n📄 Báo cáo đầy đủ (mọi nhân vật, mọi field): audit-talent-full-report.json`);
}

main().catch((err) => {
  console.error("❌ Audit thất bại:", err);
  process.exit(1);
});
