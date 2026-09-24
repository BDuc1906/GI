#!/usr/bin/env node
/**
 * scripts/i18n/translation-review-system.ts
 *
 * HỆ THỐNG REVIEW DỊCH THUẬT
 * 
 * Features:
 * 1. Đánh dấu translations cần review (newly translated, changed terms)
 * 2. Tạo review queue cho từng locale
 * 3. Human approval/rejection workflow
 * 4. Track translation quality metrics
 * 5. Generate review reports
 *
 * CÁCH DÙNG:
 *   npx tsx --env-file=.env scripts/i18n/translation-review-system.ts
 *
 *   --generate-report        Tạo báo cáo review
 *   --approve-locale=ja      Approve tất cả translations cho locale
 *   --reject-locale=ja       Reject và rollback translations cho locale
 *   --export-review=ja       Export review queue ra file JSON
 */

import { prisma } from "../../src/lib/db/prisma";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ReviewRecord {
  entityType: "character" | "weapon";
  entityId: string;
  entityName: string;
  field: string;
  locale: string;
  originalText: string;
  translatedText: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string | null;
  reviewedAt: Date | null;
  feedback: string | null;
  createdAt: Date;
}

interface _ReviewQueue {
  locale: string;
  pending: number;
  approved: number;
  rejected: number;
  records: ReviewRecord[];
}

const REVIEW_STATUS_FILE = path.join(__dirname, "translation-review-status.json");

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    generateReport: args.includes("--generate-report"),
    approveLocale: args.find((a) => a.startsWith("--approve-locale="))?.split("=")[1],
    rejectLocale: args.find((a) => a.startsWith("--reject-locale="))?.split("=")[1],
    exportReview: args.find((a) => a.startsWith("--export-review="))?.split("=")[1],
  };
}

/**
 * Load review status từ file
 */
function loadReviewStatus(): Record<string, ReviewRecord[]> {
  try {
    if (fs.existsSync(REVIEW_STATUS_FILE)) {
      const content = fs.readFileSync(REVIEW_STATUS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch {
    console.warn("⚠️ Không đọc được review status file, tạo mới");
  }
  return {};
}

/**
 * Save review status vào file
 */
function saveReviewStatus(status: Record<string, ReviewRecord[]>) {
  fs.writeFileSync(REVIEW_STATUS_FILE, JSON.stringify(status, null, 2));
}

/**
 * Scan database để tìm translations cần review
 */
async function scanForReview(): Promise<Record<string, ReviewRecord[]>> {
  console.log("🔍 Scanning database for translations needing review...");
  
  const reviewStatus: Record<string, ReviewRecord[]> = {};
  const LOCALES = ["zh-CN", "zh-TW", "ja", "ko", "id", "th", "de", "fr", "it", "pt", "es", "ru", "tr"];
  
  // Scan characters
  const characters = await prisma.character.findMany({
    select: {
      id: true,
      name: true,
      descriptionTranslations: true,
      talentsTranslations: true,
      constellationsTranslations: true,
    },
  });
  
  for (const char of characters) {
    const descTranslations = char.descriptionTranslations as Record<string, string> | null;
    const talentsTranslations = char.talentsTranslations as Record<string, any> | null;
    const constellationsTranslations = char.constellationsTranslations as Record<string, any> | null;
    
    for (const locale of LOCALES) {
      const key = `character-${char.id}-${locale}`;
      if (!reviewStatus[key]) reviewStatus[key] = [];
      
      // Check description
      if (descTranslations && descTranslations[locale]) {
        reviewStatus[key].push({
          entityType: "character",
          entityId: char.id,
          entityName: char.name,
          field: "description",
          locale,
          originalText: char.description || "",
          translatedText: descTranslations[locale],
          status: "pending",
          reviewedBy: null,
          reviewedAt: null,
          feedback: null,
          createdAt: new Date(),
        });
      }
      
      // Check talents
      if (talentsTranslations && talentsTranslations[locale]) {
        const talents = talentsTranslations[locale] as Array<{ name: string; description: string }>;
        talents.forEach((talent, idx) => {
          reviewStatus[key].push({
            entityType: "character",
            entityId: char.id,
            entityName: char.name,
            field: `talent[${idx}].name`,
            locale,
            originalText: talent.name,
            translatedText: talent.name,
            status: "pending",
            reviewedBy: null,
            reviewedAt: null,
            feedback: null,
            createdAt: new Date(),
          });
          
          reviewStatus[key].push({
            entityType: "character",
            entityId: char.id,
            entityName: char.name,
            field: `talent[${idx}].description`,
            locale,
            originalText: talent.description,
            translatedText: talent.description,
            status: "pending",
            reviewedBy: null,
            reviewedAt: null,
            feedback: null,
            createdAt: new Date(),
          });
        });
      }
      
      // Check constellations
      if (constellationsTranslations && constellationsTranslations[locale]) {
        const constellations = constellationsTranslations[locale] as Array<{ name: string; description: string }>;
        constellations.forEach((constellation, idx) => {
          reviewStatus[key].push({
            entityType: "character",
            entityId: char.id,
            entityName: char.name,
            field: `constellation[${idx}].name`,
            locale,
            originalText: constellation.name,
            translatedText: constellation.name,
            status: "pending",
            reviewedBy: null,
            reviewedAt: null,
            feedback: null,
            createdAt: new Date(),
          });
          
          reviewStatus[key].push({
            entityType: "character",
            entityId: char.id,
            entityName: char.name,
            field: `constellation[${idx}].description`,
            locale,
            originalText: constellation.description,
            translatedText: constellation.description,
            status: "pending",
            reviewedBy: null,
            reviewedAt: null,
            feedback: null,
            createdAt: new Date(),
          });
        });
      }
    }
  }
  
  // Scan weapons
  const weapons = await prisma.weapon.findMany({
    select: {
      id: true,
      name: true,
      descriptionTranslations: true,
      passiveByRefinementTranslations: true,
    },
  });
  
  for (const weapon of weapons) {
    const descTranslations = weapon.descriptionTranslations as Record<string, string> | null;
    const passiveTranslations = weapon.passiveByRefinementTranslations as Record<string, any> | null;
    
    for (const locale of LOCALES) {
      const key = `weapon-${weapon.id}-${locale}`;
      if (!reviewStatus[key]) reviewStatus[key] = [];
      
      // Check description
      if (descTranslations && descTranslations[locale]) {
        reviewStatus[key].push({
          entityType: "weapon",
          entityId: weapon.id,
          entityName: weapon.name,
          field: "description",
          locale,
          originalText: weapon.description || "",
          translatedText: descTranslations[locale],
          status: "pending",
          reviewedBy: null,
          reviewedAt: null,
          feedback: null,
          createdAt: new Date(),
        });
      }
      
      // Check passive effects
      if (passiveTranslations && passiveTranslations[locale]) {
        const passives = passiveTranslations[locale] as Array<{ description: string }>;
        passives.forEach((passive, idx) => {
          reviewStatus[key].push({
            entityType: "weapon",
            entityId: weapon.id,
            entityName: weapon.name,
            field: `passive[${idx}].description`,
            locale,
            originalText: passive.description,
            translatedText: passive.description,
            status: "pending",
            reviewedBy: null,
            reviewedAt: null,
            feedback: null,
            createdAt: new Date(),
          });
        });
      }
    }
  }
  
  console.log(`✅ Found ${Object.keys(reviewStatus).length} translation records needing review`);
  return reviewStatus;
}

/**
 * Generate review report
 */
function generateReviewReport(reviewStatus: Record<string, ReviewRecord[]>) {
  console.log("\n📊 TRANSLATION REVIEW REPORT");
  console.log("=" .repeat(50));
  
  const localeStats: Record<string, { pending: number; approved: number; rejected: number }> = {};
  
  for (const [key, records] of Object.entries(reviewStatus)) {
    const locale = key.split("-")[2];
    if (!localeStats[locale]) {
      localeStats[locale] = { pending: 0, approved: 0, rejected: 0 };
    }
    
    records.forEach(record => {
      localeStats[locale][record.status]++;
    });
  }
  
  console.log("\n📈 BY LOCALE:");
  for (const [locale, stats] of Object.entries(localeStats).sort((a, b) => a[0].localeCompare(b[0]))) {
    const total = stats.pending + stats.approved + stats.rejected;
    const approvalRate = total > 0 ? ((stats.approved / total) * 100).toFixed(1) : "0.0";
    console.log(`  ${locale.padEnd(6)}: ${stats.pending} pending | ${stats.approved} approved | ${stats.rejected} rejected | ${approvalRate}% approval`);
  }
  
  const totalPending = Object.values(localeStats).reduce((sum, stats) => sum + stats.pending, 0);
  const totalApproved = Object.values(localeStats).reduce((sum, stats) => sum + stats.approved, 0);
  const totalRejected = Object.values(localeStats).reduce((sum, stats) => sum + stats.rejected, 0);
  const total = totalPending + totalApproved + totalRejected;
  
  console.log("\n📊 OVERALL:");
  console.log(`  Total: ${total} translations`);
  console.log(`  Pending: ${totalPending} (${((totalPending / total) * 100).toFixed(1)}%)`);
  console.log(`  Approved: ${totalApproved} (${((totalApproved / total) * 100).toFixed(1)}%)`);
  console.log(`  Rejected: ${totalRejected} (${((totalRejected / total) * 100).toFixed(1)}%)`);
  
  console.log("\n⚠️ HIGH PRIORITY FOR REVIEW:");
  const pendingLocales = Object.entries(localeStats)
    .filter(([_, stats]) => stats.pending > 0)
    .sort((a, b) => b[1].pending - a[1].pending)
    .slice(0, 5);
  
  for (const [locale, stats] of pendingLocales) {
    console.log(`  ${locale}: ${stats.pending} pending translations`);
  }
}

/**
 * Approve all translations for a locale
 */
function approveLocale(reviewStatus: Record<string, ReviewRecord[]>, locale: string) {
  console.log(`✅ Approving all translations for locale: ${locale}`);
  
  let approvedCount = 0;
  for (const [key, records] of Object.entries(reviewStatus)) {
    if (key.includes(`-${locale}-`)) {
      records.forEach(record => {
        if (record.status === "pending") {
          record.status = "approved";
          record.reviewedBy = "system";
          record.reviewedAt = new Date();
          approvedCount++;
        }
      });
    }
  }
  
  console.log(`  → Approved ${approvedCount} translations`);
  saveReviewStatus(reviewStatus);
}

/**
 * Reject all translations for a locale
 */
function rejectLocale(reviewStatus: Record<string, ReviewRecord[]>, locale: string) {
  console.log(`❌ Rejecting all translations for locale: ${locale}`);
  
  let rejectedCount = 0;
  for (const [key, records] of Object.entries(reviewStatus)) {
    if (key.includes(`-${locale}-`)) {
      records.forEach(record => {
        if (record.status === "pending") {
          record.status = "rejected";
          record.reviewedBy = "system";
          record.reviewedAt = new Date();
          record.feedback = "Batch rejected by system";
          rejectedCount++;
        }
      });
    }
  }
  
  console.log(`  → Rejected ${rejectedCount} translations`);
  saveReviewStatus(reviewStatus);
}

/**
 * Export review queue to JSON file
 */
function exportReviewQueue(reviewStatus: Record<string, ReviewRecord[]>, locale: string) {
  console.log(`📤 Exporting review queue for locale: ${locale}`);
  
  const localeRecords: ReviewRecord[] = [];
  for (const [key, records] of Object.entries(reviewStatus)) {
    if (key.includes(`-${locale}-`)) {
      localeRecords.push(...records.filter(r => r.status === "pending"));
    }
  }
  
  const exportFile = path.join(__dirname, `review-queue-${locale}.json`);
  fs.writeFileSync(exportFile, JSON.stringify(localeRecords, null, 2));
  
  console.log(`  → Exported ${localeRecords.length} pending translations to ${exportFile}`);
}

async function main() {
  const args = parseArgs();
  
  // Load existing review status or scan for new
  let reviewStatus = loadReviewStatus();
  
  if (Object.keys(reviewStatus).length === 0) {
    console.log("🔄 No existing review status found, scanning database...");
    reviewStatus = await scanForReview();
    saveReviewStatus(reviewStatus);
  }
  
  if (args.generateReport) {
    generateReviewReport(reviewStatus);
  } else if (args.approveLocale) {
    approveLocale(reviewStatus, args.approveLocale);
  } else if (args.rejectLocale) {
    rejectLocale(reviewStatus, args.rejectLocale);
  } else if (args.exportReview) {
    exportReviewQueue(reviewStatus, args.exportReview);
  } else {
    console.log("📋 Available commands:");
    console.log("  --generate-report       Generate review report");
    console.log("  --approve-locale=ja     Approve all translations for locale");
    console.log("  --reject-locale=ja      Reject all translations for locale");
    console.log("  --export-review=ja      Export review queue to JSON");
    console.log("\n📊 Current status:");
    generateReviewReport(reviewStatus);
  }
  
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Error:", err.message);
  await prisma.$disconnect();
  process.exit(1);
});