#!/usr/bin/env node
/**
 * scripts/i18n/translate-with-glossary.ts
 *
 * DỊCH TỰ ĐỘNG VỚI GAME TERMINOLOGY GLOSSARY
 * 
 * Cải thiện dịch thuật bằng cách:
 * 1. Đọc game terminology glossary (game-terminology-glossary.json)
 * 2. Áp dụng glossary trước khi gọi Azure Translator
 * 3. Khôi phục lại terminology sau khi dịch
 * 4. Đảm bảo consistency across all languages
 *
 * CÁCH DÙNG:
 *   $env:AZURE_TRANSLATOR_KEY="xxx"
 *   $env:AZURE_TRANSLATOR_REGION="eastus"
 *   npx tsx --env-file=.env scripts/i18n/translate-with-glossary.ts
 *
 *   --dry-run              Chỉ đếm số ký tự cần dịch, KHÔNG gọi API.
 *   --locale=ja,ko          Chỉ dịch các locale chỉ định (mặc định: tất cả 13).
 *   --only=characters        Chỉ dịch nhân vật (bỏ qua vũ khí).
 *   --only=weapons            Chỉ dịch vũ khí (bỏ qua nhân vật).
 *   --limit=20                 Chỉ xử lý N bản ghi đầu (test nhanh trước khi chạy full).
 */

import { prisma } from "../../src/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GLOSSARY_PATH = path.join(__dirname, "game-terminology-glossary.json");

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

// Load glossary
let glossary: Record<string, Record<string, Record<string, string>>> = {};
try {
  const glossaryContent = fs.readFileSync(GLOSSARY_PATH, "utf-8");
  glossary = JSON.parse(glossaryContent);
  console.log(`✅ Đã load glossary với ${Object.keys(glossary).length} categories`);
} catch (err) {
  console.warn(`⚠️ Không đọc được glossary từ ${GLOSSARY_PATH}, tiếp tục without glossary`);
}

/**
 * Áp dụng glossary vào text trước khi dịch
 * Thay thế terminology bằng placeholder để tránh dịch sai
 */
function applyGlossary(text: string, targetLang: string): { 
  protectedText: string; 
  restore: (translated: string) => string;
  glossaryTerms: string[];
} {
  if (!text) return { protectedText: text, restore: (t) => t, glossaryTerms: [] };
  
  const tokens: string[] = [];
  const glossaryTerms: string[] = [];
  let protectedText = text;
  
  // Áp dụng glossary theo thứ tự ưu tiên: game_terms > stats > reactions > elements > weapons > rarity
  const categories = ["game_terms", "stats", "reactions", "elements", "weapons", "rarity"];
  
  for (const category of categories) {
    if (!glossary[category]) continue;
    
    for (const [term, translations] of Object.entries(glossary[category])) {
      const targetTerm = translations[targetLang] || translations["en"] || term;
      
      // Thay thế term bằng placeholder
      const regex = new RegExp(`\\b${term}\\b`, "gi");
      if (regex.test(protectedText)) {
        protectedText = protectedText.replace(regex, (match) => {
          tokens.push(targetTerm);
          glossaryTerms.push(term);
          return `§GLOSSARY${tokens.length - 1}§`;
        });
      }
    }
  }
  
  const restore = (translated: string) =>
    translated.replace(/§GLOSSARY(\d+)§/g, (_, i) => tokens[Number(i)] ?? "");
  
  return { protectedText, restore, glossaryTerms };
}

interface ProtectedText {
  protectedText: string;
  restore: (translated: string) => string;
  glossaryTerms: string[];
}

function protectPlaceholders(text: string): ProtectedText {
  if (!text) return { protectedText: text, restore: (t) => t, glossaryTerms: [] };
  const tokens: string[] = [];
  const protectedText = text.replace(/\{[^}]+\}|<[^>]+>/g, (match) => {
    tokens.push(match);
    return "\u00a7" + (tokens.length - 1) + "\u00a7";
  });
  const restore = (translated: string) =>
    translated.replace(/\u00a7(\d+)\u00a7/g, (_, i) => tokens[Number(i)] ?? "");
  return { protectedText, restore, glossaryTerms: [] };
}

async function translateBatch(
  texts: string[],
  targetLang: string,
  apiKey: string | undefined,
  region: string | undefined
): Promise<string[]> {
  if (texts.length === 0) return [];
  const url = AZURE_ENDPOINT + "/translate?api-version=3.0&from=en&to=" + targetLang;
  const headers: Record<string, string> = { 
    "Ocp-Apim-Subscription-Key": apiKey ?? "", 
    "Content-Type": "application/json" 
  };
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

async function translateStringsWithGlossary(
  texts: string[],
  targetLang: string,
  apiKey: string | undefined,
  region: string | undefined
): Promise<{ translated: string[]; glossaryUsage: Record<string, number> }> {
  const protectedItems = texts.map((text) => {
    const placeholderProtected = protectPlaceholders(text);
    const glossaryProtected = applyGlossary(placeholderProtected.protectedText, targetLang);
    return {
      placeholderProtected,
      glossaryProtected,
    };
  });

  const results: string[] = [];
  const glossaryUsage: Record<string, number> = {};

  const BATCH_SIZE = 50;
  for (let i = 0; i < protectedItems.length; i += BATCH_SIZE) {
    const batch = protectedItems.slice(i, i + BATCH_SIZE);
    const translated = await translateBatch(
      batch.map((p) => p.glossaryProtected.protectedText),
      targetLang,
      apiKey,
      region
    );
    
    batch.forEach((item, idx) => {
      // Restore glossary terms first
      const withGlossary = item.glossaryProtected.restore(translated[idx]);
      // Then restore placeholders
      const final = item.placeholderProtected.restore(withGlossary);
      results[i + idx] = final;
      
      // Track glossary usage
      item.glossaryProtected.glossaryTerms.forEach(term => {
        glossaryUsage[term] = (glossaryUsage[term] || 0) + 1;
      });
    });
    
    if (i + BATCH_SIZE < protectedItems.length) await new Promise((r) => setTimeout(r, 300));
  }

  return { translated: results, glossaryUsage };
}

let totalCharsDryRun = 0;
const charsByLocale: Record<string, number> = {};
const totalGlossaryUsage: Record<string, Record<string, number>> = {};

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
    const { translated, glossaryUsage } = await translateStringsWithGlossary(texts, azureTarget, apiKey, region);
    
    // Track glossary usage
    if (!totalGlossaryUsage[locale]) totalGlossaryUsage[locale] = {};
    Object.entries(glossaryUsage).forEach(([term, count]) => {
      totalGlossaryUsage[locale][term] = (totalGlossaryUsage[locale][term] || 0) + count;
    });

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
        descriptionTranslations: descTranslations as Prisma.InputJsonValue,
        talentsTranslations: talentsTranslations as unknown as Prisma.InputJsonValue,
        constellationsTranslations: constellationsTranslations as unknown as Prisma.InputJsonValue,
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
    const { translated, glossaryUsage } = await translateStringsWithGlossary(texts, azureTarget, apiKey, region);
    
    // Track glossary usage
    if (!totalGlossaryUsage[locale]) totalGlossaryUsage[locale] = {};
    Object.entries(glossaryUsage).forEach(([term, count]) => {
      totalGlossaryUsage[locale][term] = (totalGlossaryUsage[locale][term] || 0) + count;
    });

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
      data: {
        descriptionTranslations: descTranslations as Prisma.InputJsonValue,
        passiveByRefinementTranslations: passivesTranslations as unknown as Prisma.InputJsonValue,
      },
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

  console.log("🔄 Bắt đầu dịch với Game Terminology Glossary...");

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
  } else {
    console.log("\n--------------------------------");
    console.log("GLOSSARY USAGE STATISTICS:");
    for (const [locale, usage] of Object.entries(totalGlossaryUsage)) {
      console.log(`  ${locale}:`);
      const sortedTerms = Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 10);
      for (const [term, count] of sortedTerms) {
        console.log(`    ${term}: ${count} lần`);
      }
    }
    console.log("--------------------------------");
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Error:", err.message);
  await prisma.$disconnect();
  process.exit(1);
});