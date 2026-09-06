#!/usr/bin/env node
/**
 * scripts/i18n/translate-game-content.mjs
 *
 * Bản song sinh của scripts/i18n/i18n-translate.mjs, nhưng cho nội dung
 * PHẢN ỨNG NGUYÊN TỐ (element-reactions-data.ts) thay vì messages/*.json.
 * Dùng CHUNG Azure Translator API key với script kia — không cần tạo
 * resource mới.
 *
 * NGUỒN: scripts/i18n/game-content-en.json (55 key tiếng Anh đã verify —
 * tên/mô tả phản ứng, cộng hưởng, công thức tính sát thương, Cộng hưởng
 * Nguyệt, Hexerei, Khải Huyền Của Ma Nữ). Dịch tiếng Anh -> các ngôn ngữ
 * khác (KHÔNG dịch từ tiếng Việt, vì nội dung EN đã được verify thuật
 * ngữ chính thức + soát tay, dùng làm nguồn trung gian ổn định hơn).
 *
 * CÁCH DÙNG (giống hệt i18n-translate.mjs):
 *   AZURE_TRANSLATOR_KEY=xxxxx AZURE_TRANSLATOR_REGION=southeastasia \
 *   node scripts/i18n/translate-game-content.mjs
 *
 * TÙY CHỌN:
 *   --dry-run          Chỉ liệt kê, không gọi API, không ghi file.
 *   --locale=ja,ko      Chỉ dịch các locale chỉ định (mặc định: 13 locale
 *                       còn lại ngoài vi/en).
 *
 * KẾT QUẢ: ghi ra scripts/i18n/game-content-{locale}.json cho từng
 * locale — KHÔNG tự sửa element-reactions-data.ts. Sau khi dịch xong,
 * chạy tiếp scripts/i18n/apply-game-content-translations.mjs để ghép
 * các file JSON này vào đúng chỗ trong element-reactions-data.ts.
 * Tách 2 bước để bạn review bản dịch trước khi nó thực sự đi vào code.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.join(__dirname, "game-content-en.json");

const ALL_TARGET_LOCALES = ["zh-CN", "zh-TW", "ja", "ko", "id", "th", "de", "fr", "it", "pt", "es", "ru", "tr"];

const AZURE_LANG_CODE = {
  "zh-CN": "zh-Hans", "zh-TW": "zh-Hant", ja: "ja", ko: "ko",
  id: "id", th: "th", de: "de", fr: "fr", it: "it", pt: "pt-pt", es: "es", ru: "ru", tr: "tr",
};

const AZURE_ENDPOINT = "https://api.cognitive.microsofttranslator.com";

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const localeArg = args.find((a) => a.startsWith("--locale="));
  const onlyLocales = localeArg ? localeArg.split("=")[1].split(",") : null;
  return { dryRun, onlyLocales };
}

/** Bảo toàn placeholder/markup nếu có — hiện tại nội dung game thuần
 * text, không có {placeholder}, giữ hàm này để nhất quán + phòng khi
 * thêm key có placeholder sau này. */
function protectPlaceholders(text) {
  const tokens = [];
  const protectedText = text.replace(/\{[^}]+\}|<[^>]+>/g, (match) => {
    tokens.push(match);
    return `§${tokens.length - 1}§`;
  });
  const restore = (translated) => translated.replace(/§(\d+)§/g, (_, i) => tokens[Number(i)] ?? "");
  return { protectedText, restore };
}

async function translateBatch(texts, targetLang, apiKey, region) {
  if (texts.length === 0) return [];
  const url = `${AZURE_ENDPOINT}/translate?api-version=3.0&from=en&to=${targetLang}`;
  const headers = { "Ocp-Apim-Subscription-Key": apiKey, "Content-Type": "application/json" };
  if (region) headers["Ocp-Apim-Subscription-Region"] = region;

  const MAX_RETRIES = 6;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(texts.map((t) => ({ Text: t }))),
    });

    if (res.status === 429) {
      const waitMs = Math.min(1000 * 2 ** attempt, 30000);
      console.log(`  ⏳ Bị giới hạn tốc độ (429), chờ ${waitMs / 1000}s rồi thử lại (lần ${attempt + 1}/${MAX_RETRIES})...`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Azure Translator API lỗi ${res.status}: ${body}`);
    }
    const data = await res.json();
    return data.map((item) => item.translations[0].text);
  }
  throw new Error(`Vẫn bị giới hạn tốc độ (429) sau ${MAX_RETRIES} lần thử lại.`);
}

async function main() {
  const { dryRun, onlyLocales } = parseArgs();
  const apiKey = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION;

  if (!dryRun && !apiKey) {
    console.error(
      "✗ Thiếu AZURE_TRANSLATOR_KEY. Chạy lại với:\n" +
      "  AZURE_TRANSLATOR_KEY=xxxxx AZURE_TRANSLATOR_REGION=southeastasia node scripts/i18n/translate-game-content.mjs\n" +
      "  (hoặc thêm --dry-run để chỉ xem trước, không cần key)"
    );
    process.exit(1);
  }

  const source = JSON.parse(await fs.readFile(SOURCE_PATH, "utf-8"));
  const keys = Object.keys(source).sort();
  const targets = (onlyLocales ?? ALL_TARGET_LOCALES).filter((l) => AZURE_LANG_CODE[l]);

  console.log(`Nguồn: ${keys.length} key tiếng Anh. Sẽ dịch sang ${targets.length} locale: ${targets.join(", ")}`);
  if (dryRun) {
    console.log("(--dry-run — không gọi API, không ghi file)");
    return;
  }

  for (const locale of targets) {
    const outPath = path.join(__dirname, `game-content-${locale}.json`);
    const azureTarget = AZURE_LANG_CODE[locale];
    const result = {};

    const BATCH_SIZE = 50;
    try {
      for (let i = 0; i < keys.length; i += BATCH_SIZE) {
        const batchKeys = keys.slice(i, i + BATCH_SIZE);
        const protectedItems = batchKeys.map((k) => protectPlaceholders(source[k]));
        const translated = await translateBatch(
          protectedItems.map((p) => p.protectedText),
          azureTarget,
          apiKey,
          region
        );
        batchKeys.forEach((key, idx) => {
          result[key] = protectedItems[idx].restore(translated[idx]);
        });
        console.log(`  → ${locale}: đã dịch ${Math.min(i + BATCH_SIZE, keys.length)}/${keys.length} key`);

        // Ghi ngay sau mỗi lô — không mất tiến độ nếu lô sau lỗi.
        await fs.writeFile(outPath, JSON.stringify(result, null, 2) + "\n", "utf-8");
        if (i + BATCH_SIZE < keys.length) await new Promise((r) => setTimeout(r, 400));
      }
      console.log(`✓ ${locale}: xong, ghi ra ${path.relative(process.cwd(), outPath)}`);
    } catch (err) {
      console.error(`✗ ${locale}: dừng giữa chừng — ${err.message}`);
      console.error(`  (phần đã dịch được vẫn được lưu trong ${outPath}; chạy lại --locale=${locale} để tiếp tục)`);
    }
  }

  console.log("\n──────────────────────────────");
  console.log("Xong bước dịch. Review nhanh các file scripts/i18n/game-content-*.json,");
  console.log("rồi chạy: node scripts/i18n/apply-game-content-translations.mjs");
  console.log("để ghép vào src/lib/game/element-reactions-data.ts.");
}

main().catch((err) => {
  console.error("✗ Lỗi:", err.message);
  process.exit(1);
});
