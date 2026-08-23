#!/usr/bin/env node
/**
 * scripts/i18n-translate.mjs
 *
 * DỊCH TỰ ĐỘNG THẬT SỰ — gọi Microsoft Azure Translator API (miễn phí
 * 2 triệu ký tự/tháng, gói F0, không yêu cầu đặt cọc thẻ như Google Cloud)
 * để tự lấp các key còn thiếu trong src/messages/*.json so với file gốc
 * (mặc định: vi.json).
 *
 * Khác với lần trước (mình tự tay dịch từng câu), script này:
 *   1. Tự đọc vi.json làm "nguồn sự thật" (source of truth).
 *   2. Tự dò từng locale còn lại (en, ja, ko, zh-CN...), tìm namespace/key
 *      nào ĐANG THIẾU so với vi.json (deep diff theo cấu trúc lồng nhau).
 *   3. Chỉ gọi API dịch cho đúng phần thiếu đó — không đụng vào bản dịch
 *      đã có sẵn (tránh dịch đè, ghi đè công sức review thủ công trước đó).
 *   4. Bảo toàn nguyên vẹn placeholder kiểu {count}, {query}, <b>...</b>
 *      bằng cách thay tạm bằng token trước khi gửi API, rồi khôi phục lại
 *      sau khi nhận bản dịch — tránh Azure dịch nhầm/phá vỡ cú pháp
 *      next-intl bên trong.
 *
 * CÁCH DÙNG:
 *   1. Tạo tài khoản Azure (free, không đặt cọc), tạo resource "Translator"
 *      tại https://portal.azure.com — chọn gói giá F0 (miễn phí, 2M ký
 *      tự/tháng). Lấy KEY và REGION ở mục "Keys and Endpoint".
 *   2. Chạy:
 *        AZURE_TRANSLATOR_KEY=xxxxx AZURE_TRANSLATOR_REGION=southeastasia \
 *        node scripts/i18n-translate.mjs
 *   3. Xem lại output — script in ra danh sách key nào vừa được tự dịch,
 *      để bạn review nhanh (dịch máy vẫn nên có người soát lại các cụm
 *      quan trọng như tiêu đề trang, nút bấm chính).
 *
 * TÙY CHỌN:
 *   --dry-run          Chỉ liệt kê key thiếu, KHÔNG gọi API, không ghi file.
 *   --locale=ja,ko      Chỉ xử lý các locale chỉ định (mặc định: tất cả).
 *   --source=vi         Đổi locale nguồn (mặc định: vi).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.join(__dirname, "..", "src", "messages");

const ALL_LOCALES = ["en", "vi", "zh-CN", "zh-TW", "ja", "ko", "id", "th", "de", "fr", "it", "pt", "es", "ru", "tr"];

// Mã ngôn ngữ Azure Translator dùng — khác chút so với tên file của dự án:
// Azure dùng "zh-Hans" (giản thể) / "zh-Hant" (phồn thể) thay vì zh-CN/zh-TW.
// Xem danh sách đầy đủ: https://learn.microsoft.com/azure/ai-services/translator/language-support
const AZURE_LANG_CODE = {
  en: "en", vi: "vi", "zh-CN": "zh-Hans", "zh-TW": "zh-Hant", ja: "ja", ko: "ko",
  id: "id", th: "th", de: "de", fr: "fr", it: "it", pt: "pt-pt", es: "es", ru: "ru", tr: "tr",
};

const AZURE_ENDPOINT = "https://api.cognitive.microsofttranslator.com";

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const localeArg = args.find((a) => a.startsWith("--locale="));
  const sourceArg = args.find((a) => a.startsWith("--source="));
  const onlyLocales = localeArg ? localeArg.split("=")[1].split(",") : null;
  const sourceLocale = sourceArg ? sourceArg.split("=")[1] : "vi";
  return { dryRun, onlyLocales, sourceLocale };
}

/** Đệ quy tìm mọi (path, giá trị string) trong object lồng nhau. */
function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out[key] = v;
    else if (v && typeof v === "object") Object.assign(out, flatten(v, key));
  }
  return out;
}

function setDeep(obj, dottedKey, value) {
  const parts = dottedKey.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

/**
 * Thay {placeholder} và <tag>...</tag> bằng token an toàn (kiểu §0§, §1§)
 * trước khi gửi cho API dịch, để Azure không dịch/phá vỡ cú pháp
 * next-intl. Trả về { protectedText, restore } — gọi restore(translatedText)
 * sau khi có bản dịch để khôi phục lại placeholder gốc.
 */
function protectPlaceholders(text) {
  const tokens = [];
  const protectedText = text.replace(/\{[^}]+\}|<[^>]+>/g, (match) => {
    tokens.push(match);
    return `§${tokens.length - 1}§`;
  });
  const restore = (translated) =>
    translated.replace(/§(\d+)§/g, (_, i) => tokens[Number(i)] ?? "");
  return { protectedText, restore };
}

async function translateBatch(texts, targetLang, sourceLang, apiKey, region) {
  if (texts.length === 0) return [];
  const url = `${AZURE_ENDPOINT}/translate?api-version=3.0&from=${sourceLang}&to=${targetLang}`;
  const headers = {
    "Ocp-Apim-Subscription-Key": apiKey,
    "Content-Type": "application/json",
  };
  // Region bắt buộc với hầu hết Translator resource (trừ tài nguyên "Global").
  if (region) headers["Ocp-Apim-Subscription-Region"] = region;

  const MAX_RETRIES = 6;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(texts.map((t) => ({ Text: t }))),
    });

    if (res.status === 429) {
      // Gói F0 giới hạn số request/giây (không chỉ tổng ký tự/tháng) — 429
      // nghĩa là gọi dồn dập quá nhanh, không phải hết quota. Chờ rồi thử
      // lại cùng lô, tăng dần thời gian chờ (1s, 2s, 4s, 8s...).
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
  const { dryRun, onlyLocales, sourceLocale } = parseArgs();
  const apiKey = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION;

  if (!dryRun && !apiKey) {
    console.error(
      "✗ Thiếu AZURE_TRANSLATOR_KEY. Chạy lại với:\n" +
      "  AZURE_TRANSLATOR_KEY=xxxxx AZURE_TRANSLATOR_REGION=southeastasia node scripts/i18n-translate.mjs\n" +
      "  (hoặc thêm --dry-run để chỉ xem key nào đang thiếu, không cần key)\n\n" +
      "Lấy key tại: https://portal.azure.com -> tạo resource \"Translator\" -> gói F0 (miễn phí, không đặt cọc) -> mục \"Keys and Endpoint\"."
    );
    process.exit(1);
  }

  const sourcePath = path.join(MESSAGES_DIR, `${sourceLocale}.json`);
  const sourceJson = JSON.parse(await fs.readFile(sourcePath, "utf-8"));
  const sourceFlat = flatten(sourceJson);

  const targets = (onlyLocales ?? ALL_LOCALES).filter((l) => l !== sourceLocale);

  let totalMissing = 0;
  let totalTranslated = 0;

  for (const locale of targets) {
    const localePath = path.join(MESSAGES_DIR, `${locale}.json`);
    const localeJson = JSON.parse(await fs.readFile(localePath, "utf-8"));
    const localeFlat = flatten(localeJson);

    const missingKeys = Object.keys(sourceFlat).filter((k) => !(k in localeFlat));

    if (missingKeys.length === 0) {
      console.log(`✓ ${locale}: đầy đủ, không thiếu key nào.`);
      continue;
    }

    console.log(`⚠ ${locale}: thiếu ${missingKeys.length} key — ${missingKeys.slice(0, 5).join(", ")}${missingKeys.length > 5 ? "..." : ""}`);
    totalMissing += missingKeys.length;

    if (dryRun) continue;

    const azureTarget = AZURE_LANG_CODE[locale];
    const azureSource = AZURE_LANG_CODE[sourceLocale];

    // Bảo toàn placeholder trước khi gửi API, dịch theo lô 50 câu/lần
    // (Azure cho phép tới 100 câu / 50.000 ký tự mỗi request, dùng 50 cho
    // an toàn).
    const BATCH_SIZE = 50;
    let localeTranslatedCount = 0;
    try {
      for (let i = 0; i < missingKeys.length; i += BATCH_SIZE) {
        const batchKeys = missingKeys.slice(i, i + BATCH_SIZE);
        const protectedItems = batchKeys.map((k) => protectPlaceholders(sourceFlat[k]));
        const translated = await translateBatch(
          protectedItems.map((p) => p.protectedText),
          azureTarget,
          azureSource,
          apiKey,
          region
        );
        batchKeys.forEach((key, idx) => {
          const restored = protectedItems[idx].restore(translated[idx]);
          setDeep(localeJson, key, restored);
          totalTranslated++;
          localeTranslatedCount++;
        });
        console.log(`  → đã dịch ${Math.min(i + BATCH_SIZE, missingKeys.length)}/${missingKeys.length} key cho ${locale}`);

        // Ghi file NGAY sau mỗi lô thành công — nếu lô sau bị lỗi (vd hết
        // giờ, mất mạng), phần đã dịch trước đó vẫn được giữ lại, không
        // mất công chạy lại từ đầu cho locale này.
        await fs.writeFile(localePath, JSON.stringify(localeJson, null, 2) + "\n", "utf-8");

        // Nghỉ ngắn giữa các lô để giảm khả năng bị 429 (giới hạn
        // request/giây của gói F0) ngay từ đầu, thay vì phải chờ retry.
        if (i + BATCH_SIZE < missingKeys.length) await new Promise((r) => setTimeout(r, 400));
      }
      console.log(`✓ ${locale}: đã ghi file, ${localeTranslatedCount} key mới được dịch tự động.`);
    } catch (err) {
      // Không dừng cả script vì 1 locale lỗi — phần đã dịch được (nếu có)
      // đã ghi file rồi, các locale còn lại vẫn tiếp tục xử lý bình
      // thường. Chạy lại script sau sẽ tự tiếp tục đúng chỗ dừng (vì chỉ
      // dịch key còn thiếu).
      console.error(`✗ ${locale}: dừng giữa chừng sau ${localeTranslatedCount}/${missingKeys.length} key — ${err.message}`);
      console.error(`  (phần đã dịch được vẫn được lưu; chạy lại script để dịch tiếp phần còn thiếu của ${locale})`);
    }
  }

  console.log("\n──────────────────────────────");
  if (dryRun) {
    console.log(`Tổng cộng thiếu ${totalMissing} key trên toàn bộ locale (chưa dịch — chạy lại không có --dry-run để dịch thật).`);
  } else {
    console.log(`Đã tự động dịch ${totalTranslated} key. Nên review lại các key quan trọng (tiêu đề, nút bấm chính) trước khi deploy.`);
  }
}

main().catch((err) => {
  console.error("✗ Lỗi:", err.message);
  process.exit(1);
});

