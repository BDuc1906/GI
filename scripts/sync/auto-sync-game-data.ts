/**
 * scripts/sync/auto-sync-game-data.ts
 *
 * AUTO-SYNC GAME DATA PIPELINE
 * 
 * Pipeline tự động hoá 100% việc cập nhật dữ liệu game:
 * 1. Kiểm tra phiên bản genshin-db trên npm & phiên bản game trong DB
 * 2. Tự động crawl dữ liệu nhân vật, vũ khí và 15 danh mục mở rộng
 * 3. Đồng bộ cấu hình talent books, image overrides, và phiên bản
 * 4. Nạp dữ liệu vào cơ sở dữ liệu với tốc độ cao (Batch Chunk Seeding)
 * 5. Xác minh toàn vẹn dữ liệu và kiểm định độ phủ build KQM
 * 6. Tự động chạy bộ kiểm thử, TypeCheck, Linting
 */

import "dotenv/config";
import { spawn } from "child_process";
import fs from "fs";

interface SyncConfig {
  forceUpdate: boolean;
  skipBackup: boolean;
  skipTests: boolean;
  skipImageMirror: boolean;
  dryRun: boolean;
}

interface SyncResult {
  success: boolean;
  oldVersion: string;
  newVersion: string;
  steps: Array<{ step: string; success: boolean; duration: number; error?: string }>;
  duration: number;
}

/**
 * Thực thi lệnh shell với streaming output trực tiếp và an toàn bộ nhớ đệm
 */
function runCommand(command: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    console.log(`\n▶️  [Chạy] ${command}`);
    const proc = spawn(command, {
      shell: true,
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "development" },
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true, output: "" });
      } else {
        resolve({ success: false, output: `Exit code: ${code}` });
      }
    });

    proc.on("error", (err) => {
      resolve({ success: false, output: err.message });
    });
  });
}

async function getCurrentGenshinDBVersion(): Promise<string> {
  try {
    const packageJson = JSON.parse(await fs.promises.readFile("package.json", "utf-8"));
    const version = packageJson.dependencies["genshin-db"]?.replace(/[\^~]/g, "") || "5.2.15";
    return version;
  } catch {
    return "5.2.15";
  }
}

async function getLatestGenshinDBVersion(): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn("npm view genshin-db version", { shell: true });
    let data = "";
    proc.stdout.on("data", (chunk) => (data += chunk));
    proc.on("close", (code) => {
      if (code === 0 && data.trim()) {
        resolve(data.trim());
      } else {
        resolve("5.2.15");
      }
    });
    proc.on("error", () => resolve("5.2.15"));
  });
}

async function main() {
  const args = process.argv.slice(2);
  const hasR2 = Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_SECRET_ACCESS_KEY);

  const config: SyncConfig = {
    forceUpdate: args.includes("--force"),
    skipBackup: args.includes("--skip-backup"),
    skipTests: args.includes("--skip-tests"),
    skipImageMirror: args.includes("--skip-images") || !hasR2,
    dryRun: args.includes("--dry-run"),
  };

  console.log("=================================================");
  console.log("🚀 TIẾN TRÌNH TỰ ĐỘNG HÓA CẬP NHẬT DỮ LIỆU GAME (AUTO-SYNC)");
  console.log("=================================================");
  console.log("Cấu hình:", config);

  const startTime = Date.now();
  const result: SyncResult = {
    success: false,
    oldVersion: "",
    newVersion: "",
    steps: [],
    duration: 0,
  };

  try {
    // Bước 1: Kiểm tra phiên bản package
    result.oldVersion = await getCurrentGenshinDBVersion();
    result.newVersion = await getLatestGenshinDBVersion();
    console.log(`📦 Phiên bản genshin-db hiện tại: ${result.oldVersion}`);
    console.log(`🌐 Phiên bản genshin-db mới nhất trên npm: ${result.newVersion}`);

    if (config.dryRun) {
      console.log("🔔 Chế độ Dry-run: Bỏ qua quá trình thực thi thực tế.");
      result.success = true;
      return;
    }

    // Bước 2: Cập nhật thư viện upstream nếu có bản mới
    if (result.oldVersion !== result.newVersion || config.forceUpdate) {
      const stepStart = Date.now();
      const res = await runCommand("npm update genshin-db");
      result.steps.push({
        step: "update_genshin_db",
        success: res.success,
        duration: Date.now() - stepStart,
      });
      if (!res.success) {
        console.warn("⚠️ Không thể cập nhật genshin-db qua npm update, tiếp tục với bản hiện tại.");
      }
    }

    // Bước 3: Crawl dữ liệu nhân vật và 15 danh mục mở rộng
    {
      const stepStart = Date.now();
      const res = await runCommand("npm run data:crawl");
      result.steps.push({
        step: "crawl_game_data",
        success: res.success,
        duration: Date.now() - stepStart,
      });
      if (!res.success) throw new Error("Crawl dữ liệu thất bại");
    }

    // Bước 3.5: Đồng bộ & tự động tải ảnh/icon chính thức còn thiếu từ CDN về local
    {
      const stepStart = Date.now();
      const res = await runCommand("npm run assets:sync");
      result.steps.push({
        step: "sync_authentic_assets",
        success: res.success,
        duration: Date.now() - stepStart,
      });
      if (!res.success) {
        console.warn("⚠️ Tải assets ghi nhận cảnh báo, tiếp tục tiến trình.");
      }
    }

    // Bước 4: Đồng bộ mapping & phát hiện phiên bản mới
    {
      const stepStart = Date.now();
      const res = await runCommand("npm run data:update");
      result.steps.push({
        step: "update_configs_and_versions",
        success: res.success,
        duration: Date.now() - stepStart,
      });
      if (!res.success) throw new Error("Cập nhật config & phiên bản thất bại");
    }

    // Bước 5: Nạp dữ liệu vào Database
    {
      const stepStart = Date.now();
      const res = await runCommand("npm run db:seed");
      result.steps.push({
        step: "seed_database",
        success: res.success,
        duration: Date.now() - stepStart,
      });
      if (!res.success) throw new Error("Nạp dữ liệu vào DB thất bại");
    }

    // Bước 6: Xác minh toàn vẹn dữ liệu
    {
      const stepStart = Date.now();
      const res = await runCommand("npm run db:verify");
      result.steps.push({
        step: "verify_data_integrity",
        success: res.success,
        duration: Date.now() - stepStart,
      });
      if (!res.success) {
        console.warn("⚠️ Xác minh toàn vẹn ghi nhận cảnh báo.");
      }
    }

    // Bước 7: Kiểm định độ phủ build nhân vật
    {
      const stepStart = Date.now();
      const res = await runCommand("npm run builds:update");
      result.steps.push({
        step: "verify_character_builds",
        success: res.success,
        duration: Date.now() - stepStart,
      });
    }

    // Bước 8: Mirror ảnh nếu có cấu hình R2
    if (!config.skipImageMirror && hasR2) {
      const stepStart = Date.now();
      const res = await runCommand("npm run images:mirror");
      result.steps.push({
        step: "mirror_images",
        success: res.success,
        duration: Date.now() - stepStart,
      });
    }

    // Bước 9: Chạy Unit Tests
    if (!config.skipTests) {
      const stepStart = Date.now();
      const res = await runCommand("npm test");
      result.steps.push({
        step: "run_tests",
        success: res.success,
        duration: Date.now() - stepStart,
      });
      if (!res.success) throw new Error("Kiểm thử thất bại");
    }

    // Bước 10: Typecheck
    {
      const stepStart = Date.now();
      const res = await runCommand("npm run typecheck");
      result.steps.push({
        step: "typecheck",
        success: res.success,
        duration: Date.now() - stepStart,
      });
      if (!res.success) throw new Error("TypeScript typecheck thất bại");
    }

    // Bước 11: Linting
    {
      const stepStart = Date.now();
      const res = await runCommand("npm run lint");
      result.steps.push({
        step: "lint",
        success: res.success,
        duration: Date.now() - stepStart,
      });
      if (!res.success) throw new Error("ESLint kiểm tra thất bại");
    }

    result.success = true;
    console.log("\n🎉 TIẾN TRÌNH AUTO-SYNC DỮ LIỆU ĐÃ HOÀN TẤT THÀNH CÔNG RỰC RỠ!");
  } catch (err) {
    console.error("\n❌ Tiến trình Auto-Sync thất bại:", err);
    result.success = false;
  }

  result.duration = Date.now() - startTime;

  console.log("\n" + "=".repeat(50));
  console.log("📊 BÁO CÁO KẾT QUẢ AUTO-SYNC");
  console.log("=".repeat(50));
  console.log(`Trạng thái: ${result.success ? "✅ THÀNH CÔNG (SUCCESS)" : "❌ THẤT BẠI (FAILED)"}`);
  console.log(`Thời gian chạy: ${(result.duration / 1000).toFixed(2)}s`);
  console.log("\nChi tiết từng bước:");
  for (const step of result.steps) {
    const status = step.success ? "✅" : "❌";
    console.log(`  ${status} ${step.step} (${(step.duration / 1000).toFixed(2)}s)`);
  }
  console.log("=".repeat(50));

  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error("Lỗi nghiêm trọng không bắt được:", err);
  process.exit(1);
});
