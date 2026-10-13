// scripts/lib/azure-translator.mjs
/**
 * Helper dùng chung cho Azure Translator API.
 *
 * TRƯỚC ĐÂY đoạn code này bị copy-paste giữa:
 *   - scripts/i18n/i18n-translate.mjs
 *   - scripts/i18n/translate-game-content.mjs
 *   - scripts/i18n/translate-character-content.ts
 * Sửa 1 chỗ là các chỗ kia lệch âm thầm.
 *
 * File này là NGUỒN SỰ THẬT DUY NHẤT cho:
 *   - AZURE_LANG_CODE
 *   - protectPlaceholders
 *   - translateBatch
 *   - translateStrings
 */

const AZURE_ENDPOINT = "https://api.cognitive.microsofttranslator.com";

export const AZURE_LANG_CODE = {
  en: "en", vi: "vi", "zh-CN": "zh-Hans", "zh-TW": "zh-Hant", ja: "ja", ko: "ko",
  id: "id", th: "th", de: "de", fr: "fr", it: "it", pt: "pt-pt", es: "es", ru: "ru", tr: "tr",
};

export function protectPlaceholders(text) {
  const tokens = [];
  const protectedText = text.replace(/\{[^}]+\}|<[^>]+>/g, (match) => {
    tokens.push(match);
    return `§${tokens.length - 1}§`;
  });
  const restore = (translated) =>
    translated.replace(/§(\d+)§/g, (_, i) => tokens[Number(i)] ?? "");
  return { protectedText, restore };
}

export async function translateBatch(texts, targetLang, sourceLang, apiKey, region) {
  if (texts.length === 0) return [];
  const url = `${AZURE_ENDPOINT}/translate?api-version=3.0&from=${sourceLang}&to=${targetLang}`;
  const headers = {
    "Ocp-Apim-Subscription-Key": apiKey,
    "Content-Type": "application/json",
  };
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
      console.log(`  ⏳ Azure 429, chờ ${waitMs / 1000}s (lần ${attempt + 1}/${MAX_RETRIES})...`);
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
  throw new Error(`Vẫn bị 429 sau ${MAX_RETRIES} lần thử lại.`);
}

export async function translateStrings(texts, targetLang, sourceLang, apiKey, region) {
  const protectedItems = texts.map(protectPlaceholders);
  const results = new Array(texts.length);
  const BATCH_SIZE = 50;
  for (let i = 0; i < protectedItems.length; i += BATCH_SIZE) {
    const batch = protectedItems.slice(i, i + BATCH_SIZE);
    const translated = await translateBatch(
      batch.map((p) => p.protectedText),
      targetLang, sourceLang, apiKey, region
    );
    batch.forEach((p, idx) => { results[i + idx] = p.restore(translated[idx]); });
    if (i + BATCH_SIZE < protectedItems.length) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return results;
}