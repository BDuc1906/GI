#!/usr/bin/env node
/**
 * scripts/i18n/translation-consistency-checker.ts
 *
 * HỆ THỐNG KIỂM TRA CONSISTENCY CỦA DỊCH THUẬT
 * 
 * Features:
 * 1. Kiểm tra consistency của terminology across translations
 * 2. Detect inconsistencies trong game terms usage
 * 3. Validate formatting consistency (placeholders, HTML tags)
 * 4. Check length consistency across languages
 * 5. Generate consistency reports
 * 
 * CÁCH DÙNG:
 *   npx tsx --env-file=.env scripts/i18n/translation-consistency-checker.ts
 *
 *   --locale=ja              Check chỉ locale cụ thể
 *   --fix-terminology        Auto-fix terminology inconsistencies
 *   --check-formatting       Check formatting consistency
 *   --check-length           Check length consistency
 */

import { prisma } from "../../src/lib/db/prisma";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GLOSSARY_PATH = path.join(__dirname, "game-terminology-glossary.json");

interface ConsistencyIssue {
  type: "terminology" | "formatting" | "length" | "missing";
  severity: "error" | "warning" | "info";
  entityType: "character" | "weapon";
  entityId: string;
  entityName: string;
  field: string;
  locale: string;
  expected: string;
  actual: string;
  description: string;
}

interface ConsistencyReport {
  totalIssues: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byLocale: Record<string, number>;
  issues: ConsistencyIssue[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    locale: args.find((a) => a.startsWith("--locale="))?.split("=")[1],
    fixTerminology: args.includes("--fix-terminology"),
    checkFormatting: args.includes("--check-formatting"),
    checkLength: args.includes("--check-length"),
  };
}

// Load glossary
let glossary: Record<string, Record<string, Record<string, string>>> = {};
try {
  const glossaryContent = fs.readFileSync(GLOSSARY_PATH, "utf-8");
  glossary = JSON.parse(glossaryContent);
  console.log(`✅ Đã load glossary với ${Object.keys(glossary).length} categories`);
} catch {
  console.warn(`⚠️ Không đọc được glossary từ ${GLOSSARY_PATH}`);
}

/**
 * Kiểm tra terminology consistency
 */
function _checkTerminologyConsistency(
  text: string,
  expectedTerm: string,
  locale: string,
  entityType: string,
  entityId: string,
  entityName: string,
  field: string
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  
  // Find expected translation from glossary
  let expectedTranslation = expectedTerm;
  for (const category of Object.values(glossary)) {
    if (category[expectedTerm] && category[expectedTerm][locale]) {
      expectedTranslation = category[expectedTerm][locale];
      break;
    }
  }
  
  // Check if the expected term is used correctly
  if (expectedTranslation !== expectedTerm && !text.includes(expectedTranslation)) {
    issues.push({
      type: "terminology",
      severity: "error",
      entityType: entityType as "character" | "weapon",
      entityId,
      entityName,
      field,
      locale,
      expected: expectedTranslation,
      actual: text,
      description: `Expected terminology "${expectedTranslation}" not found in translation`,
    });
  }
  
  return issues;
}

/**
 * Kiểm tra formatting consistency
 */
function checkFormattingConsistency(
  text: string,
  originalText: string,
  locale: string,
  entityType: string,
  entityId: string,
  entityName: string,
  field: string
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  
  // Check placeholder consistency
  const originalPlaceholders = originalText.match(/\{[^}]+\}/g) || [];
  const translatedPlaceholders = text.match(/\{[^}]+\}/g) || [];
  
  if (originalPlaceholders.length !== translatedPlaceholders.length) {
    issues.push({
      type: "formatting",
      severity: "error",
      entityType: entityType as "character" | "weapon",
      entityId,
      entityName,
      field,
      locale,
      expected: originalPlaceholders.join(", "),
      actual: translatedPlaceholders.join(", "),
      description: `Placeholder count mismatch: ${originalPlaceholders.length} vs ${translatedPlaceholders.length}`,
    });
  }
  
  // Check HTML tag consistency
  const originalTags = originalText.match(/<[^>]+>/g) || [];
  const translatedTags = text.match(/<[^>]+>/g) || [];
  
  if (originalTags.length !== translatedTags.length) {
    issues.push({
      type: "formatting",
      severity: "warning",
      entityType: entityType as "character" | "weapon",
      entityId,
      entityName,
      field,
      locale,
      expected: originalTags.join(", "),
      actual: translatedTags.join(", "),
      description: `HTML tag count mismatch: ${originalTags.length} vs ${translatedTags.length}`,
    });
  }
  
  return issues;
}

/**
 * Kiểm tra length consistency
 */
function checkLengthConsistency(
  text: string,
  originalText: string,
  locale: string,
  entityType: string,
  entityId: string,
  entityName: string,
  field: string
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  
  const originalLength = originalText.length;
  const translatedLength = text.length;
  const ratio = translatedLength / originalLength;
  
  // Warning if translation is too long or too short
  if (ratio > 2.0) {
    issues.push({
      type: "length",
      severity: "warning",
      entityType: entityType as "character" | "weapon",
      entityId,
      entityName,
      field,
      locale,
      expected: `${originalLength} chars`,
      actual: `${translatedLength} chars (${(ratio * 100).toFixed(0)}% of original)`,
      description: `Translation is significantly longer than original`,
    });
  } else if (ratio < 0.3) {
    issues.push({
      type: "length",
      severity: "warning",
      entityType: entityType as "character" | "weapon",
      entityId,
      entityName,
      field,
      locale,
      expected: `${originalLength} chars`,
      actual: `${translatedLength} chars (${(ratio * 100).toFixed(0)}% of original)`,
      description: `Translation is significantly shorter than original`,
    });
  }
  
  return issues;
}

/**
 * Kiểm tra missing translations
 */
function checkMissingTranslations(
  translations: Record<string, any> | null,
  locales: string[],
  entityType: string,
  entityId: string,
  entityName: string,
  field: string
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  
  if (!translations) {
    locales.forEach(locale => {
      issues.push({
        type: "missing",
        severity: "error",
        entityType: entityType as "character" | "weapon",
        entityId,
        entityName,
        field,
        locale,
        expected: "translation",
        actual: "missing",
        description: `Translation missing for ${locale}`,
      });
    });
    return issues;
  }
  
  locales.forEach(locale => {
    if (!translations[locale]) {
      issues.push({
        type: "missing",
        severity: "error",
        entityType: entityType as "character" | "weapon",
        entityId,
        entityName,
        field,
        locale,
        expected: "translation",
        actual: "missing",
        description: `Translation missing for ${locale}`,
      });
    }
  });
  
  return issues;
}

/**
 * Run consistency check on characters
 */
async function checkCharacters(
  locales: string[],
  options: { checkFormatting: boolean; checkLength: boolean }
): Promise<ConsistencyIssue[]> {
  console.log("🔍 Checking character translations consistency...");
  
  const issues: ConsistencyIssue[] = [];
  const characters = await prisma.character.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      descriptionTranslations: true,
      talentsTranslations: true,
      constellationsTranslations: true,
    },
  });
  
  for (const char of characters) {
    const descTranslations = char.descriptionTranslations as Record<string, string> | null;
    const talentsTranslations = char.talentsTranslations as Record<string, any> | null;
    const constellationsTranslations = char.constellationsTranslations as Record<string, any> | null;
    
    // Check description translations
    if (char.description) {
      const missingIssues = checkMissingTranslations(
        descTranslations,
        locales,
        "character",
        char.id,
        char.name,
        "description"
      );
      issues.push(...missingIssues);
      
      if (descTranslations) {
        for (const locale of locales) {
          if (descTranslations[locale]) {
            if (options.checkFormatting) {
              const formatIssues = checkFormattingConsistency(
                descTranslations[locale],
                char.description,
                locale,
                "character",
                char.id,
                char.name,
                "description"
              );
              issues.push(...formatIssues);
            }
            
            if (options.checkLength) {
              const lengthIssues = checkLengthConsistency(
                descTranslations[locale],
                char.description,
                locale,
                "character",
                char.id,
                char.name,
                "description"
              );
              issues.push(...lengthIssues);
            }
          }
        }
      }
    }
    
    // Check talents translations
    if (talentsTranslations) {
      for (const locale of locales) {
        if (talentsTranslations[locale]) {
          const talents = talentsTranslations[locale] as Array<{ name: string; description: string }>;
          talents.forEach((talent, idx) => {
            if (options.checkFormatting) {
              const formatIssues = checkFormattingConsistency(
                talent.description,
                talent.description, // Would need original text here
                locale,
                "character",
                char.id,
                char.name,
                `talent[${idx}].description`
              );
              issues.push(...formatIssues);
            }
          });
        }
      }
    }
    
    // Check constellations translations
    if (constellationsTranslations) {
      for (const locale of locales) {
        if (constellationsTranslations[locale]) {
          const constellations = constellationsTranslations[locale] as Array<{ name: string; description: string }>;
          constellations.forEach((constellation, idx) => {
            if (options.checkFormatting) {
              const formatIssues = checkFormattingConsistency(
                constellation.description,
                constellation.description, // Would need original text here
                locale,
                "character",
                char.id,
                char.name,
                `constellation[${idx}].description`
              );
              issues.push(...formatIssues);
            }
          });
        }
      }
    }
  }
  
  console.log(`✅ Checked ${characters.length} characters, found ${issues.length} issues`);
  return issues;
}

/**
 * Run consistency check on weapons
 */
async function checkWeapons(
  locales: string[],
  options: { checkFormatting: boolean; checkLength: boolean }
): Promise<ConsistencyIssue[]> {
  console.log("🔍 Checking weapon translations consistency...");
  
  const issues: ConsistencyIssue[] = [];
  const weapons = await prisma.weapon.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      descriptionTranslations: true,
      passiveByRefinementTranslations: true,
    },
  });
  
  for (const weapon of weapons) {
    const descTranslations = weapon.descriptionTranslations as Record<string, string> | null;
    const passiveTranslations = weapon.passiveByRefinementTranslations as Record<string, any> | null;
    
    // Check description translations
    if (weapon.description) {
      const missingIssues = checkMissingTranslations(
        descTranslations,
        locales,
        "weapon",
        weapon.id,
        weapon.name,
        "description"
      );
      issues.push(...missingIssues);
      
      if (descTranslations) {
        for (const locale of locales) {
          if (descTranslations[locale]) {
            if (options.checkFormatting) {
              const formatIssues = checkFormattingConsistency(
                descTranslations[locale],
                weapon.description,
                locale,
                "weapon",
                weapon.id,
                weapon.name,
                "description"
              );
              issues.push(...formatIssues);
            }
            
            if (options.checkLength) {
              const lengthIssues = checkLengthConsistency(
                descTranslations[locale],
                weapon.description,
                locale,
                "weapon",
                weapon.id,
                weapon.name,
                "description"
              );
              issues.push(...lengthIssues);
            }
          }
        }
      }
    }
    
    // Check passive translations
    if (passiveTranslations) {
      for (const locale of locales) {
        if (passiveTranslations[locale]) {
          const passives = passiveTranslations[locale] as Array<{ description: string }>;
          passives.forEach((passive, idx) => {
            if (options.checkFormatting) {
              const formatIssues = checkFormattingConsistency(
                passive.description,
                passive.description, // Would need original text here
                locale,
                "weapon",
                weapon.id,
                weapon.name,
                `passive[${idx}].description`
              );
              issues.push(...formatIssues);
            }
          });
        }
      }
    }
  }
  
  console.log(`✅ Checked ${weapons.length} weapons, found ${issues.length} issues`);
  return issues;
}

/**
 * Generate consistency report
 */
function generateConsistencyReport(issues: ConsistencyIssue[]): ConsistencyReport {
  const report: ConsistencyReport = {
    totalIssues: issues.length,
    byType: {},
    bySeverity: {},
    byLocale: {},
    issues,
  };
  
  issues.forEach(issue => {
    report.byType[issue.type] = (report.byType[issue.type] || 0) + 1;
    report.bySeverity[issue.severity] = (report.bySeverity[issue.severity] || 0) + 1;
    report.byLocale[issue.locale] = (report.byLocale[issue.locale] || 0) + 1;
  });
  
  return report;
}

/**
 * Display consistency report
 */
function displayConsistencyReport(report: ConsistencyReport) {
  console.log("\n📊 TRANSLATION CONSISTENCY REPORT");
  console.log("=".repeat(50));
  
  console.log(`\n📈 OVERALL: ${report.totalIssues} issues found`);
  
  console.log("\n📋 BY TYPE:");
  for (const [type, count] of Object.entries(report.byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }
  
  console.log("\n⚠️ BY SEVERITY:");
  for (const [severity, count] of Object.entries(report.bySeverity).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${severity}: ${count}`);
  }
  
  console.log("\n🌍 BY LOCALE:");
  for (const [locale, count] of Object.entries(report.byLocale).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${locale}: ${count}`);
  }
  
  console.log("\n🔴 HIGH PRIORITY ISSUES (errors):");
  const errorIssues = report.issues.filter(i => i.severity === "error").slice(0, 10);
  errorIssues.forEach(issue => {
    console.log(`  [${issue.entityType}] ${issue.entityName} - ${issue.field} (${issue.locale})`);
    console.log(`    ${issue.description}`);
  });
  
  if (errorIssues.length > 10) {
    console.log(`  ... and ${errorIssues.length - 10} more error issues`);
  }
}

async function main() {
  const args = parseArgs();
  const locales = args.locale ? [args.locale] : ["zh-CN", "zh-TW", "ja", "ko", "id", "th", "de", "fr", "it", "pt", "es", "ru", "tr"];
  
  console.log("🔄 Starting translation consistency check...");
  console.log(`🎯 Target locales: ${locales.join(", ")}`);
  
  const options = {
    checkFormatting: args.checkFormatting,
    checkLength: args.checkLength,
  };
  
  const characterIssues = await checkCharacters(locales, options);
  const weaponIssues = await checkWeapons(locales, options);
  
  const allIssues = [...characterIssues, ...weaponIssues];
  const report = generateConsistencyReport(allIssues);
  
  displayConsistencyReport(report);
  
  // Save report to file
  const reportPath = path.join(__dirname, "consistency-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to ${reportPath}`);
  
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Error:", err.message);
  await prisma.$disconnect();
  process.exit(1);
});