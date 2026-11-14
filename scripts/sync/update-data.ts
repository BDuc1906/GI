import "dotenv/config";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { notifyOps } from "../../src/lib/infra/notify";
import { logger } from "../../src/lib/infra/logger";
import { startPipeline, endPipelineSuccess, endPipelineFailure } from "../lib/pipeline-logger";
import { prisma } from "../../src/lib/db/prisma";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function updateTalentBookMapping() {
  logger.info("📚 Đang cập nhật talent-book-mapping.json...");

  const names = genshindb.characters("names", { matchCategories: true }) as string[];
  const filteredNames = names.filter(
    (n) => !n.includes("Traveler") && n !== "Aether" && n !== "Lumine"
  );

  const mappingPath = path.join(DATA_DIR, "talent-book-mapping.json");
  let existingMapping: Record<string, string> = {};
  if (fs.existsSync(mappingPath)) {
    try {
      existingMapping = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));
    } catch {
      logger.warn("⚠️ File talent-book-mapping.json bị hỏng, tạo mới...");
    }
  }

  const newCharacters = filteredNames.filter((name) => !existingMapping[name]);
  if (newCharacters.length > 0) {
    logger.info(`🆕 Phát hiện ${newCharacters.length} nhân vật mới:`, { newCharacters });
  }

  const updatedMapping = { ...existingMapping };
  newCharacters.forEach((name) => {
    if (!updatedMapping[name]) {
      updatedMapping[name] = "";
    }
  });

  fs.writeFileSync(mappingPath, JSON.stringify(updatedMapping, null, 2));
  logger.info(`✅ Đã cập nhật talent-book-mapping.json (${Object.keys(updatedMapping).length} nhân vật)`);

  const missing = Object.entries(updatedMapping)
    .filter(([, series]) => !series || series === "")
    .map(([name]) => name);

  if (missing.length > 0) {
    logger.warn(`⚠️ ${missing.length} nhân vật CHƯA có mapping:`, { missing });
  }
}

async function updateImageOverrides() {
  logger.info("🖼️ Đang cập nhật image-overrides.json...");

  const overridesPath = path.join(DATA_DIR, "image-overrides.json");
  let existingOverrides: Record<string, string> = {};
  if (fs.existsSync(overridesPath)) {
    try {
      existingOverrides = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));
    } catch {
      logger.warn("⚠️ File image-overrides.json bị hỏng, tạo mới...");
    }
  }

  fs.writeFileSync(overridesPath, JSON.stringify(existingOverrides, null, 2));
  logger.info(`✅ Đã cập nhật image-overrides.json (${Object.keys(existingOverrides).length} override)`);
}

/**
 * Tự động đồng bộ và phát hiện các phiên bản game mới từ cơ sở dữ liệu
 */
async function autoDetectGameVersions() {
  logger.info("🔍 Đang rà soát và phát hiện các phiên bản game mới...");
  try {
    const versionGroups = await prisma.character.groupBy({
      by: ["gameVersion"],
      _count: true,
      where: { gameVersion: { not: null } },
    });

    const versions = versionGroups
      .map((g) => g.gameVersion)
      .filter((v): v is string => typeof v === "string" && /^\d+\.\d+$/.test(v.trim()))
      .sort((a, b) => {
        const pa = a.split(".").map(Number);
        const pb = b.split(".").map(Number);
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
          const d = (pa[i] ?? 0) - (pb[i] ?? 0);
          if (d !== 0) return d;
        }
        return 0;
      });

    const latest = versions.at(-1);
    logger.info(`✨ Phiên bản game cao nhất được phát hiện trong hệ thống: ${latest ?? "N/A"} (tổng ${versions.length} phiên bản)`);
    return { versions, latest };
  } catch (err) {
    logger.warn("⚠️ Không thể truy vấn nhóm phiên bản DB:", { err });
    return { versions: [], latest: undefined };
  }
}

async function main() {
  const startTime = Date.now();
  const pipelineRun = await startPipeline("update-data", {
    action: "update config files (talent-book-mapping, image-overrides, version discovery)",
  });

  try {
    logger.info("🔄 Đang cập nhật dữ liệu tự động từ các nguồn...");
    await updateTalentBookMapping();
    await updateImageOverrides();
    const { latest, versions } = await autoDetectGameVersions();

    const duration = Date.now() - startTime;
    logger.info("✅ Cập nhật dữ liệu tự động hoàn tất!", { durationMs: duration, latestVersion: latest, totalVersions: versions.length });

    await endPipelineSuccess(pipelineRun.id, {
      durationMs: duration,
      latestVersion: latest,
      totalVersions: versions.length,
    });
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error("❌ Lỗi khi cập nhật dữ liệu:", { error: err });
    console.error("❌ Lỗi khi cập nhật dữ liệu:", err);

    await notifyOps({
      source: "update-data",
      severity: "error",
      title: "Cập nhật dữ liệu tự động thất bại",
      detail: errorMsg,
    });

    await endPipelineFailure(pipelineRun.id, errorMsg);
    process.exit(1);
  }
}

main().catch(async (err) => {
  const errorMsg = err instanceof Error ? err.message : String(err);
  logger.error("Unhandled error:", { error: err });
  await notifyOps({
    source: "update-data",
    severity: "error",
    title: "Cập nhật dữ liệu thất bại",
    detail: errorMsg,
  });
  process.exit(1);
});
