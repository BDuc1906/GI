#!/usr/bin/env node
/**
 * scripts/i18n/translate-character-content.ts
 *
 * DỊCH TỰ ĐỘNG mô tả nhân vật + thiên phú + mệnh cung + mô tả vũ khí +
 * tinh luyện vũ khí — dùng CHUNG cơ chế Azure Translator với
 * scripts/i18n-translate.mjs (protectPlaceholders, batch, retry 429),
 * nhưng ghi kết quả vào DB (qua Prisma) thay vì file JSON, vì nguồn dữ
 * liệu này nằm ở DB chứ không phải messages/*.json.
 *
 * PHẠM VI DỊCH:
 *   - Character.description            -> Character.descriptionTranslations
 *   - Character.talents[].name/description/attributes[].label
 *                                       -> Character.talentsTranslations
 *   - Character.constellations[].name/description
 *                                       -> Character.constellationsTranslations
 *   - Weapon.description               -> Weapon.descriptionTranslations
 *   - Weapon.passiveByRefinement[].description
 *                                       -> Weapon.passiveByRefinementTranslations
 *
 * YÊU CẦU TRƯỚC KHI CHẠY:
 *   1. Đã áp dụng schema-additions.prisma (5 cột *Translations mới) và
 *      chạy `npx prisma migrate dev` / `npx prisma db push`.
 *   2. Có AZURE_TRANSLATOR_KEY + AZURE_TRANSLATOR_REGION (xem hướng dẫn
 *      lấy key trong comment đầu file scripts/i18n-translate.mjs).
 *
 * CÁCH DÙNG (BẮT BUỘC dùng tsx, KHÔNG dùng `node` thường — project này
 * dùng Prisma 7 với driver adapter @prisma/adapter-pg, không thể
 * `new PrismaClient()` trơn; file này import thẳng `prisma` đã cấu hình
 * sẵn ở src/lib/db/prisma.ts, giống hệt mọi script DB khác trong
 * scripts/seed/, scripts/pipeline/...):
 *
 *   $env:AZURE_TRANSLATOR_KEY="xxx"
 *   $env:AZURE_TRANSLATOR_REGION="eastus"
 *   npx tsx --env-file=.env scripts/i18n/translate-character-content.ts
 *
 *   --dry-run              Chỉ đếm số ký tự cần dịch, KHÔNG gọi API.
 *   --locale=ja,ko          Chỉ dịch các locale chỉ định (mặc định: tất cả 13).
 *   --only=characters        Chỉ dịch nhân vật (bỏ qua vũ khí).
 *   --only=weapons            Chỉ dịch vũ khí (bỏ qua nhân vật).
 *   --limit=20                 Chỉ xử lý N bản ghi đầu (test nhanh trước khi chạy full).
 *
 * AN TOÀN CHẠY LẠI: idempotent theo TỪNG BẢN GHI — nếu 1 Character/Weapon
 * đã có đủ locale trong cột *Translations rồi thì bỏ qua record đó, chỉ
 * gọi API cho phần còn thiếu. Ghi DB ngay sau mỗi record dịch xong (không
 * đợi hết batch) — nếu script dừng giữa chừng (hết quota, mất mạng), chạy
 * lại sẽ tự tiếp tục đúng chỗ dừng, không dịch lại từ đầu.
 *
 * ƯỚC LƯỢNG CHI PHÍ: gói Azure F0 miễn phí 2 TRIỆU ký tự/tháng. Với vài
 * trăm nhân vật + vũ khí, mỗi cái vài nghìn ký tự mô tả, nhân 13 ngôn ngữ
 * — có thể chạm hoặc vượt hạn mức free tier trong 1 lần chạy full. NÊN
 * chạy trước với --dry-run để xem tổng ký tự ước tính, và cân nhắc chạy
 * từng locale một (--locale=ja rồi --locale=ko...) trải ra nhiều ngày/
 * tháng nếu lo vượt quota.
 */

import { prisma } from "../../src/lib/db/prisma";

const ALL_LOCALES = ["zh-CN", "zh-TW", "ja", "ko", "id", "th", "de", "fr", "it", "pt", "es", "ru", "tr"];

const AZURE_LANG_CODE: Record<string, string> = {
  "zh-CN": "zh-Hans", "zh-TW": "zh-Hant", ja: "ja", ko: "ko",
  id: "id", th: "th", de: "de", fr: "fr", it: "it", pt: "pt-pt", es: "es", ru: "ru", tr: "tr",
};

const AZURE_ENDPOINT = "https://api.cognitive.microsofttranslator.com";

interface ParsedArgs {
  dryRun: boolean;
  onlyLocales: string[] | null;
  only: "characters" | "weapons" | null;
  limit: number | null;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const localeArg = args.find((a) => a.startsWith("--locale="));
  const onlyArg = args.find((a) => a.startsWith("--only="));
  const limitArg = args.find((a) => a.startsWith("--limit="));
  return {
    dryRun,
    onlyLocales: localeArg ? localeArg.split("=")[1].split(",") : null,
    only: onlyArg ? (onlyArg.split("=")[1] as "characters" | "weapons") : null,
    limit: limitArg ? Number(limitArg.split("=")[1]) : null,
  };
}

interface ProtectedText {
  protectedText: string;
  restore: (translated: string) => string;
}

function protectPlaceholders(text: string): ProtectedText {
  if (!text) return { protectedText: text, restore: (t) => t };
  const tokens: string[] = [];
  const protectedText = text.replace(/\{[^}]+\}|<[^>]+>/g, (match) => {
    tokens.push(match);
    return "\u00a7" + (tokens.length - 1) + "\u00a7";
  });
  const restore = (translated: string) =>
    translated.replace(/\u00a7(\d+)\u00a7/g, (_, i) => tokens[Number(i)] ?? "");
  return { protectedText, restore };
}

async function translateBatch(
  texts: string[],
  targetLang: string,
  apiKey: string | undefined,
  region: string | undefined
): Promise<string[]> {
  if (texts.length === 0) return [];
  const url = AZURE_ENDPOINT + "/translate?api-version=3.0&from=en&to=" + targetLang;
  // apiKey chỉ có thể là undefined khi đang ở chế độ --dry-run — nhánh đó
  // luôn `continue` trước khi gọi tới hàm này (xem translateCharacterRecord/
  // translateWeaponRecord), nên fallback "" ở đây thuần tuý để thoả mãn
  // type checker, không bao giờ thực sự tạo ra request với key rỗng.
  const headers: Record<string, string> = { "Ocp-Apim-Subscription-Key": apiKey ?? "", "Content-Type": "application/json" };
  if (region) headers["Ocp-Apim-Subscription-Region"] = region;

  const MAX_RETRIES = 6;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(texts.map((t) => ({ Text: t }))) });
    if (res.status === 429) {
      const waitMs = Math.min(1000 * 2 ** attempt, 30000);
      console.log("    waiting " + (waitMs / 1000) + "s (429)...");
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    if (!res.ok) throw new Error("Azure Translator error " + res.status + ": " + (await res.text()));
    const data = (await res.json()) as { translations: { text: string }[] }[];
    return data.map((item) => item.translations[0].text);
  }
  throw new Error("Still 429 after " + MAX_RETRIES + " retries.");
}

async function translateStrings(
  texts: string[],
  targetLang: string,
  apiKey: string | undefined,
  region: string | undefined
): Promise<string[]> {
  const protectedItems = texts.map(protectPlaceholders);
  const results: string[] = new Array(texts.length);
  const BATCH_SIZE = 50;
  for (let i = 0; i < protectedItems.length; i += BATCH_SIZE) {
    const batch = protectedItems.slice(i, i + BATCH_SIZE);
    const translated = await translateBatch(batch.map((p) => p.protectedText), targetLang, apiKey, region);
    batch.forEach((p, idx) => { results[i + idx] = p.restore(translated[idx]); });
    if (i + BATCH_SIZE < protectedItems.length) await new Promise((r) => setTimeout(r, 300));
  }
  return results;
}

let totalCharsDryRun = 0;
const charsByLocale: Record<string, number> = {};

function addDryRunChars(locale: string, count: number): void {
  totalCharsDryRun += count;
  charsByLocale[locale] = (charsByLocale[locale] ?? 0) + count;
}

interface TalentAttributeRow {
  label: string;
  values: string[];
}

interface TalentRecord {
  key: string;
  name: string;
  description: string;
  attributes: TalentAttributeRow[] | null;
}

interface ConstellationRecord {
  name: string;
  description: string;
}

interface RefinementRecord {
  description: string;
}

interface TalentTranslationEntry {
  key: string;
  name: string;
  description: string;
  attributeLabels: string[];
}

interface ConstellationTranslationEntry {
  name: string;
  description: string;
}

interface RefinementTranslationEntry {
  description: string;
}

/** 1 "việc cần dịch" — discriminated union theo `type`, field phụ (ti/ri/
 * ci/pi) optional vì mỗi loại job chỉ dùng 1 tập con khác nhau. */
interface TranslateJob {
  type: "description" | "talent.name" | "talent.description" | "talent.attrLabel" | "cs.name" | "cs.description" | "passive";
  text: string;
  ti?: number;
  ri?: number;
  ci?: number;
  pi?: number;
}

interface CharacterRow {
  id: string;
  description: string | null;
  talents: unknown;
  constellations: unknown;
  descriptionTranslations: unknown;
  talentsTranslations: unknown;
  constellationsTranslations: unknown;
}

async function translateCharacterRecord(
  character: CharacterRow,
  locales: string[],
  apiKey: string | undefined,
  region: string | undefined,
  dryRun: boolean
): Promise<boolean> {
  const description = character.description ?? "";
  const talents = (character.talents as TalentRecord[] | null) ?? [];
  const constellations = (character.constellations as ConstellationRecord[] | null) ?? [];

  const descTranslations = (character.descriptionTranslations as Record<string, string> | null) ?? {};
  const talentsTranslations = (character.talentsTranslations as Record<string, TalentTranslationEntry[]> | null) ?? {};
  const constellationsTranslations =
    (character.constellationsTranslations as Record<string, ConstellationTranslationEntry[]> | null) ?? {};

  let changed = false;

  for (const locale of locales) {
    const hasDesc = !description || locale in descTranslations;
    const hasTalents = talents.length === 0 || locale in talentsTranslations;
    const hasConstellations = constellations.length === 0 || locale in constellationsTranslations;
    if (hasDesc && hasTalents && hasConstellations) continue;

    const jobs: TranslateJob[] = [];
    if (description && !hasDesc) jobs.push({ type: "description", text: description });
    if (!hasTalents) {
      talents.forEach((tal, ti) => {
        jobs.push({ type: "talent.name", ti, text: tal.name });
        jobs.push({ type: "talent.description", ti, text: tal.description });
        (tal.attributes ?? []).forEach((row, ri) => {
          jobs.push({ type: "talent.attrLabel", ti, ri, text: row.label });
        });
      });
    }
    if (!hasConstellations) {
      constellations.forEach((cs, ci) => {
        jobs.push({ type: "cs.name", ci, text: cs.name });
        jobs.push({ type: "cs.description", ci, text: cs.description });
      });
    }

    const texts = jobs.map((j) => j.text ?? "");
    addDryRunChars(locale, texts.join("").length);
    if (dryRun) continue;

    const azureTarget = AZURE_LANG_CODE[locale];
    const translated = await translateStrings(texts, azureTarget, apiKey, region);

    if (!hasDesc) {
      const idx = jobs.findIndex((j) => j.type === "description");
      descTranslations[locale] = translated[idx];
    }
    if (!hasTalents) {
      const talentEntries: TalentTranslationEntry[] = talents.map((tal) => ({
        key: tal.key,
        name: "",
        description: "",
        attributeLabels: (tal.attributes ?? []).map(() => ""),
      }));
      jobs.forEach((j, idx) => {
        if (j.type === "talent.name" && j.ti !== undefined) talentEntries[j.ti].name = translated[idx];
        if (j.type === "talent.description" && j.ti !== undefined) talentEntries[j.ti].description = translated[idx];
        if (j.type === "talent.attrLabel" && j.ti !== undefined && j.ri !== undefined) {
          talentEntries[j.ti].attributeLabels[j.ri] = translated[idx];
        }
      });
      talentsTranslations[locale] = talentEntries;
    }
    if (!hasConstellations) {
      const csEntries: ConstellationTranslationEntry[] = constellations.map(() => ({ name: "", description: "" }));
      jobs.forEach((j, idx) => {
        if (j.type === "cs.name" && j.ci !== undefined) csEntries[j.ci].name = translated[idx];
        if (j.type === "cs.description" && j.ci !== undefined) csEntries[j.ci].description = translated[idx];
      });
      constellationsTranslations[locale] = csEntries;
    }
    changed = true;
  }

  if (changed && !dryRun) {
    await prisma.character.update({
      where: { id: character.id },
      data: {
        descriptionTranslations: descTranslations,
        talentsTranslations,
        constellationsTranslations,
      },
    });
  }
  return changed;
}

interface WeaponRow {
  id: string;
  description: string | null;
  passiveByRefinement: unknown;
  descriptionTranslations: unknown;
  passiveByRefinementTranslations: unknown;
}

async function translateWeaponRecord(
  weapon: WeaponRow,
  locales: string[],
  apiKey: string | undefined,
  region: string | undefined,
  dryRun: boolean
): Promise<boolean> {
  const description = weapon.description ?? "";
  const passives = (weapon.passiveByRefinement as RefinementRecord[] | null) ?? [];

  const descTranslations = (weapon.descriptionTranslations as Record<string, string> | null) ?? {};
  const passivesTranslations =
    (weapon.passiveByRefinementTranslations as Record<string, RefinementTranslationEntry[]> | null) ?? {};

  let changed = false;

  for (const locale of locales) {
    const hasDesc = !description || locale in descTranslations;
    const hasPassives = passives.length === 0 || locale in passivesTranslations;
    if (hasDesc && hasPassives) continue;

    const jobs: TranslateJob[] = [];
    if (description && !hasDesc) jobs.push({ type: "description", text: description });
    if (!hasPassives) passives.forEach((p, pi) => jobs.push({ type: "passive", pi, text: p.description }));

    const texts = jobs.map((j) => j.text ?? "");
    addDryRunChars(locale, texts.join("").length);
    if (dryRun) continue;

    const azureTarget = AZURE_LANG_CODE[locale];
    const translated = await translateStrings(texts, azureTarget, apiKey, region);

    if (!hasDesc) {
      const idx = jobs.findIndex((j) => j.type === "description");
      descTranslations[locale] = translated[idx];
    }
    if (!hasPassives) {
      const passiveEntries: RefinementTranslationEntry[] = passives.map(() => ({ description: "" }));
      jobs.forEach((j, idx) => {
        if (j.type === "passive" && j.pi !== undefined) passiveEntries[j.pi].description = translated[idx];
      });
      passivesTranslations[locale] = passiveEntries;
    }
    changed = true;
  }

  if (changed && !dryRun) {
    await prisma.weapon.update({
      where: { id: weapon.id },
      data: { descriptionTranslations: descTranslations, passiveByRefinementTranslations: passivesTranslations },
    });
  }
  return changed;
}

async function main() {
  const { dryRun, onlyLocales, only, limit } = parseArgs();
  const apiKey = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION;
  const locales = onlyLocales ?? ALL_LOCALES;

  if (!dryRun && !apiKey) {
    console.error("Missing AZURE_TRANSLATOR_KEY. Add --dry-run to only see the estimate, no key needed.");
    process.exit(1);
  }

  if (!only || only === "characters") {
    const characters = await prisma.character.findMany(limit ? { take: limit } : undefined);
    console.log("\n=== CHARACTERS (" + characters.length + " rows) ===");
    let done = 0;
    for (const c of characters) {
      const changed = await translateCharacterRecord(c, locales, apiKey, region, dryRun);
      if (changed) done++;
      if (!dryRun) console.log("  [" + c.id + "] " + (changed ? "updated" : "already complete, skipped"));
    }
    console.log("-> Updated " + done + "/" + characters.length + " characters.");
  }

  if (!only || only === "weapons") {
    const weapons = await prisma.weapon.findMany(limit ? { take: limit } : undefined);
    console.log("\n=== WEAPONS (" + weapons.length + " rows) ===");
    let done = 0;
    for (const w of weapons) {
      const changed = await translateWeaponRecord(w, locales, apiKey, region, dryRun);
      if (changed) done++;
      if (!dryRun) console.log("  [" + w.id + "] " + (changed ? "updated" : "already complete, skipped"));
    }
    console.log("-> Updated " + done + "/" + weapons.length + " weapons.");
  }

  if (dryRun) {
    console.log("\n--------------------------------");
    console.log("Ước tính số ký tự cần dịch THEO TỪNG NGÔN NGỮ:");
    const sorted = Object.entries(charsByLocale).sort((a, b) => b[1] - a[1]);
    for (const [locale, count] of sorted) {
      console.log("  " + locale.padEnd(6) + count.toLocaleString().padStart(12) + " ký tự");
    }
    console.log("--------------------------------");
    console.log("Tổng cộng: " + totalCharsDryRun.toLocaleString() + " ký tự.");
    console.log("Azure F0 free tier: 2.000.000 ký tự/tháng.");
    console.log("Run again WITHOUT --dry-run (with AZURE_TRANSLATOR_KEY) to translate for real.");
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Error:", err.message);
  await prisma.$disconnect();
  process.exit(1);
});
