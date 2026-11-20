#!/usr/bin/env node
/**
 * scripts/i18n/validate-i18n-quality.ts
 *
 * LEIBO TRANSLATION QUALITY GATE
 *
 * Bộ công cụ kiểm định chất lượng bản dịch tự động:
 * 1. Locale Coverage: Kiểm tra tính đầy đủ của 15 ngôn ngữ (không thiếu key, không chuỗi rỗng)
 * 2. Placeholder Integrity: Đối chiếu các biến interpolation ({count}, {query}, v.v.)
 * 3. Hardcoded String Scan: Quét và phát hiện chuỗi text thô chưa qua hệ thống i18n trong route [locale]
 * 4. Translation Status Governance: Phân loại official vs machine-translated vs fallback
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const MESSAGES_DIR = path.join(ROOT_DIR, "src/messages");
const APP_LOCALE_DIR = path.join(ROOT_DIR, "src/app/[locale]");

const SUPPORTED_LOCALES = [
  "en",
  "vi",
  "zh-CN",
  "zh-TW",
  "ja",
  "ko",
  "de",
  "fr",
  "es",
  "pt",
  "ru",
  "th",
  "id",
  "it",
  "tr",
];

const OFFICIAL_LOCALES = new Set([
  "en",
  "vi",
  "zh-CN",
  "zh-TW",
  "ja",
  "ko",
  "de",
  "fr",
  "es",
  "pt",
  "ru",
  "th",
  "id",
]);

const MACHINE_LOCALES = new Set(["it", "tr"]);

interface QualityIssue {
  type: "missing_key" | "empty_value" | "placeholder_mismatch" | "hardcoded_string";
  locale?: string;
  key?: string;
  file?: string;
  line?: number;
  expected?: string;
  actual?: string;
  severity: "error" | "warning";
  message: string;
}

const issues: QualityIssue[] = [];

/**
 * Lấy danh sách toàn bộ key lồng nhau dưới dạng đường dẫn (vd: "Tools.enkaSync.title")
 */
function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else if (typeof value === "string") {
      result[fullKey] = value;
    }
  }
  return result;
}

/**
 * Trích xuất các placeholder dạng {name} trong chuỗi
 */
function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{([a-zA-Z0-9_]+)\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.slice(1, -1))));
}

// =========================================================================
// 1. KIỂM ĐỊNH TÍNH ĐẦY ĐỦ CỦA 15 FILE MESSAGES (COVERAGE & INTEGRITY)
// =========================================================================
console.log("===============================================================");
console.log("LEIBO - TRANSLATION QUALITY GATE & I18N VALIDATION");
console.log("===============================================================\n");

console.log("🔍 [1/3] Đang kiểm tra Locale Coverage và Placeholder Integrity...");

const loadedMessages: Record<string, Record<string, string>> = {};

for (const loc of SUPPORTED_LOCALES) {
  const filePath = path.join(MESSAGES_DIR, `${loc}.json`);
  if (!fs.existsSync(filePath)) {
    issues.push({
      type: "missing_key",
      locale: loc,
      severity: "error",
      message: `Thiếu file ngôn ngữ: ${loc}.json`,
    });
    continue;
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    loadedMessages[loc] = flattenObject(content);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    issues.push({
      type: "missing_key",
      locale: loc,
      severity: "error",
      message: `Lỗi phân tích cú pháp JSON trong ${loc}.json: ${errorMsg}`,
    });
  }
}

// Lấy en.json làm chuẩn đối chiếu canonical
const canonicalKeys = Object.keys(loadedMessages.en || {});
console.log(`- Chuẩn đối chiếu (en.json): ${canonicalKeys.length} translation keys.`);

for (const loc of SUPPORTED_LOCALES) {
  if (loc === "en") continue;
  const targetMap = loadedMessages[loc] || {};

  for (const key of canonicalKeys) {
    const canonicalVal = loadedMessages.en[key];
    const targetVal = targetMap[key];

    // Kiểm tra thiếu key
    if (targetVal === undefined) {
      issues.push({
        type: "missing_key",
        locale: loc,
        key,
        severity: "warning",
        message: `[${loc}] Thiếu key "${key}" (chuẩn en: "${canonicalVal.slice(0, 30)}...")`,
      });
      continue;
    }

    // Kiểm tra chuỗi rỗng
    if (typeof targetVal === "string" && targetVal.trim().length === 0) {
      issues.push({
        type: "empty_value",
        locale: loc,
        key,
        severity: "error",
        message: `[${loc}] Key "${key}" có giá trị rỗng.`,
      });
      continue;
    }

    // Kiểm tra placeholder integrity
    const expectedPlaceholders = extractPlaceholders(canonicalVal);
    if (expectedPlaceholders.length > 0 && typeof targetVal === "string") {
      const actualPlaceholders = extractPlaceholders(targetVal);
      for (const p of expectedPlaceholders) {
        if (!actualPlaceholders.includes(p)) {
          issues.push({
            type: "placeholder_mismatch",
            locale: loc,
            key,
            severity: "error",
            expected: p,
            message: `[${loc}] Sai placeholder: thiếu "{${p}}" trong key "${key}". Chuỗi đích: "${targetVal}"`,
          });
        }
      }
    }
  }
}

// =========================================================================
// 2. QUÉT VĂN BẢN VIẾT CỨNG (HARDCODED STRINGS) TRONG ROUTE [LOCALE]
// =========================================================================
console.log("\n🔍 [2/3] Đang quét văn bản hardcoded trong src/app/[locale]...");

function scanDirectoryForHardcoded(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectoryForHardcoded(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
      // Bỏ qua admin routes vì admin là trang nội bộ
      if (fullPath.includes(`${path.sep}admin${path.sep}`)) continue;

      const lines = fs.readFileSync(fullPath, "utf-8").split("\n");
      lines.forEach((line, lineIdx) => {
        // Bỏ qua comments
        const trimmed = line.trim();
        if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;

        // Tìm kiếm các mẫu thẻ tiêu đề h1/h2/p có text tiếng Việt có dấu trực tiếp
        const vietnameseRegex = /<(h1|h2|p|span|button)[^>]*>\s*([A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ][^<>{}]*[\s\w]*[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]+[^<>{}]*)\s*<\/\1>/i;
        const match = line.match(vietnameseRegex);
        if (match && !line.includes("t(") && !line.includes("tHome(") && !line.includes("tTools(")) {
          const relPath = path.relative(ROOT_DIR, fullPath);
          issues.push({
            type: "hardcoded_string",
            file: relPath,
            line: lineIdx + 1,
            actual: match[2].trim(),
            severity: "warning",
            message: `${relPath}:${lineIdx + 1}: Phát hiện văn bản chưa qua i18n: "${match[2].trim().slice(0, 40)}"`,
          });
        }
      });
    }
  }
}

scanDirectoryForHardcoded(APP_LOCALE_DIR);

// =========================================================================
// 3. BÁO CÁO PHÂN LOẠI TRẠNG THÁI VÀ NGUỒN GỐC (GOVERNANCE MATRIX)
// =========================================================================
console.log("\n📊 [3/3] Ma Trận Phân Loại Trạng Thái Ngôn Ngữ LEIBO:");
console.log("---------------------------------------------------------------");
console.log(`- Tổng số ngôn ngữ hỗ trợ: ${SUPPORTED_LOCALES.length}`);
console.log(`- Ngôn ngữ chính thức (Official Genshin Data): ${OFFICIAL_LOCALES.size} (${Array.from(OFFICIAL_LOCALES).join(", ")})`);
console.log(`- Ngôn ngữ dịch máy (Machine Translated / Azure): ${MACHINE_LOCALES.size} (${Array.from(MACHINE_LOCALES).join(", ")})`);
console.log("---------------------------------------------------------------");

const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warning");

console.log("\n===============================================================");
console.log("TỔNG HỢP KIỂM ĐỊNH DỊCH THUẬT (TRANSLATION AUDIT SUMMARY)");
console.log("===============================================================");
console.log(`- Lỗi nghiêm trọng (Errors):   ${errors.length}`);
console.log(`- Cảnh báo (Warnings):         ${warnings.length}`);

if (errors.length > 0) {
  console.log("\n🚨 DANH SÁCH LỖI NGHIÊM TRỌNG CẦN KHẮC PHỤC:");
  errors.slice(0, 20).forEach((err, idx) => {
    console.log(`  ${idx + 1}. [${err.type}] ${err.message}`);
  });
  if (errors.length > 20) {
    console.log(`  ... và ${errors.length - 20} lỗi khác.`);
  }
}

if (warnings.length > 0) {
  console.log("\n⚠️ CÁC ĐIỂM CẢNH BÁO / ĐỀ XUẤT CẢI THIỆN:");
  warnings.slice(0, 15).forEach((w, idx) => {
    console.log(`  ${idx + 1}. [${w.type}] ${w.message}`);
  });
  if (warnings.length > 15) {
    console.log(`  ... và ${warnings.length - 15} cảnh báo khác.`);
  }
}

if (errors.length === 0) {
  console.log("\n✅ [CI GATE PASS] Toàn bộ tiêu chuẩn Translation Quality Gate đã đạt!");
  process.exit(0);
} else {
  console.log("\n❌ [CI GATE FAIL] Có lỗi nghiêm trọng trong dữ liệu dịch thuật hoặc placeholder.");
  process.exit(1);
}
