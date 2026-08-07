import { createRequire } from "module";
const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { notifyOps } from "../src/lib/notify";
import { logger } from "../src/lib/logger";
import { startPipeline, endPipelineSuccess, endPipelineFailure } from "./lib/pipeline-logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");

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
    logger.warn(`⚠️ ${missing.length} nhân vật CHƯA có mapping (cần điền tay):`, { missing });
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

async function main() {
  const startTime = Date.now();
  const pipelineRun = await startPipeline("update-data", {
    action: "update config files (talent-book-mapping, image-overrides)",
  });

  try {
    logger.info("🔄 Đang cập nhật dữ liệu từ các nguồn...");
    await updateTalentBookMapping();
    await updateImageOverrides();

    const duration = Date.now() - startTime;
    logger.info("✅ Cập nhật dữ liệu hoàn tất!", { durationMs: duration });
    console.log("👉 Chạy 'npm run db:seed' để áp dụng dữ liệu mới.");

    await endPipelineSuccess(pipelineRun.id, { durationMs: duration });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error("❌ Lỗi khi cập nhật dữ liệu:", { error: err });
    console.error("❌ Lỗi khi cập nhật dữ liệu:", err);

    await notifyOps({
      source: "update-data",
      severity: "error",
      title: "Cập nhật talent-book-mapping/image-overrides thất bại",
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