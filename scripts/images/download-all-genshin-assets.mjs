/**
 * scripts/images/download-all-genshin-assets.mjs
 *
 * Tự động thu thập và tải về TOÀN BỘ icon, hình ảnh của Genshin Impact:
 * 1. Nhân vật: Avatar, Side Icon, Gacha Splash, Kỹ năng (Normal/Skill/Burst/Passives), Cung mệnh (C1-C6)
 * 2. Vũ khí: Icon cơ bản, Icon đột phá (Awaken)
 * 3. Thánh di vật: Toàn bộ 5 mảnh (Hoa, Lông, Cát, Chén, Vương miện) của mọi set
 * 4. Nguyên liệu: Đột phá nhân vật, thiên phú, rèn đúc, nấu ăn, đặc sản khu vực
 * 5. Kẻ địch & Boss: Toàn bộ quái thường, quái tinh anh, boss tuần, boss thế giới
 * 6. Món ăn & Công thức
 * 7. Động vật & Sinh vật hoang dã
 * 8. Danh thiếp (Namecards), Trang phục (Outfits), Phong chi dực (Windgliders)
 * 9. Nguyên tố & Phản ứng
 */

import fs from "fs";
import path from "path";
import genshindb from "genshin-db";

const BASE_OUT = path.resolve(process.cwd(), "public/local-genshin-assets");

// Đảm bảo các thư mục đích tồn tại
const DIRS = [
  "characters/icon",
  "characters/side",
  "characters/splash",
  "characters/talents",
  "characters/constellations",
  "weapons",
  "artifacts",
  "materials",
  "foods",
  "enemies",
  "animals",
  "namecards",
  "outfits",
  "windgliders",
  "elements",
  "geography",
];

for (const d of DIRS) {
  fs.mkdirSync(path.join(BASE_OUT, d), { recursive: true });
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Danh sách tác vụ download: { targetPath: string, urls: string[] }
const queue = [];
const seenTargets = new Set();

function addDownloadTask(subDir, filename, urls) {
  const cleanFilename = filename.endsWith(".png") ? filename : `${filename}.png`;
  const targetPath = path.join(BASE_OUT, subDir, cleanFilename);
  
  if (seenTargets.has(targetPath)) return;
  seenTargets.add(targetPath);

  // Lọc URLs hợp lệ
  const validUrls = urls.filter((u) => u && typeof u === "string" && u.startsWith("http"));
  if (validUrls.length > 0) {
    queue.push({
      targetPath,
      subDir,
      filename: cleanFilename,
      urls: validUrls,
    });
  }
}

function getCandidateUrls(filename, directUrl) {
  const candidates = [];
  if (directUrl) candidates.push(directUrl);
  if (filename) {
    candidates.push(`https://enka.network/ui/${filename}.png`);
    candidates.push(`https://gi.yatta.moe/assets/UI/${filename}.png`);
    candidates.push(`https://raw.githubusercontent.com/PathOfGenshin/resources/main/resources/gi/Sprite/${filename}.png`);
    candidates.push(`https://upload-os-bbs.mihoyo.com/game_record/genshin/character_icon/${filename}.png`);
    candidates.push(`https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/${filename}.png`);
  }
  return candidates;
}

console.log("🔍 Đang quét cơ sở dữ liệu Genshin Impact...");

// 1. NHÂN VẬT, THIÊN PHÚ, CUNG MỆNH
const charNames = genshindb.characters("names", { matchCategories: true }) || [];
for (const name of charNames) {
  const c = genshindb.characters(name);
  if (!c) continue;
  const slug = slugify(c.id || c.name);

  if (c.images) {
    // Icon
    addDownloadTask(
      "characters/icon",
      `${slug}.png`,
      getCandidateUrls(c.images.filename_icon, c.images.mihoyo_icon)
    );
    // Side icon
    addDownloadTask(
      "characters/side",
      `${slug}.png`,
      getCandidateUrls(c.images.filename_sideIcon, c.images.mihoyo_sideIcon)
    );
    // Gacha splash
    addDownloadTask(
      "characters/splash",
      `${slug}.png`,
      getCandidateUrls(c.images.filename_gachaSplash, c.images.portrait)
    );
  }

  // Thiên phú (Combat & Passives)
  const t = genshindb.talents(name);
  if (t && t.images) {
    const talentKeys = [
      "filename_combat1",
      "filename_combat2",
      "filename_combat3",
      "filename_combatsp",
      "filename_passive1",
      "filename_passive2",
      "filename_passive3",
    ];
    for (const k of talentKeys) {
      const f = t.images[k];
      if (f) {
        addDownloadTask("characters/talents", `${f}.png`, getCandidateUrls(f));
      }
    }
  }

  // Cung mệnh (C1 - C6)
  const co = genshindb.constellations(name);
  if (co && co.images) {
    for (let i = 1; i <= 6; i++) {
      const f = co.images[`filename_c${i}`];
      if (f) {
        addDownloadTask("characters/constellations", `${f}.png`, getCandidateUrls(f));
      }
    }
  }
}

// 2. VŨ KHÍ
const weaponNames = genshindb.weapons("names", { matchCategories: true }) || [];
for (const name of weaponNames) {
  const w = genshindb.weapons(name);
  if (!w || !w.images) continue;
  const slug = slugify(w.id || w.name);

  // Icon cơ bản
  addDownloadTask(
    "weapons",
    `${slug}.png`,
    getCandidateUrls(w.images.filename_icon, w.images.icon || w.images.mihoyo_icon)
  );

  // Awaken icon (sau đột phá)
  if (w.images.filename_awakenIcon || w.images.awakenicon) {
    addDownloadTask(
      "weapons",
      `${slug}_awaken.png`,
      getCandidateUrls(w.images.filename_awakenIcon, w.images.awakenicon || w.images.mihoyo_awakenIcon)
    );
  }
}

// 3. THÁNH DI VẬT
const artifactNames = genshindb.artifacts("names", { matchCategories: true }) || [];
for (const name of artifactNames) {
  const a = genshindb.artifacts(name);
  if (!a || !a.images) continue;
  const slug = slugify(a.id || a.name);

  const slots = ["flower", "plume", "sands", "goblet", "circlet"];
  for (const s of slots) {
    const rawUrl = a.images[s];
    if (rawUrl) {
      const match = rawUrl.match(/(UI_RelicIcon_[A-Za-z0-9_]+)/);
      const filename = match ? match[1] : `${slug}-${s}`;
      addDownloadTask("artifacts", `${slug}-${s}.png`, [rawUrl, ...getCandidateUrls(filename)]);
    }
  }
}

// 4. NGUYÊN LIỆU (MATERIALS)
const materialNames = genshindb.materials("names", { matchCategories: true }) || [];
for (const name of materialNames) {
  const m = genshindb.materials(name);
  if (!m || !m.images) continue;
  const slug = slugify(m.id || m.name);
  addDownloadTask(
    "materials",
    `${slug}.png`,
    getCandidateUrls(m.images.filename_icon, m.images.fandom)
  );
}

// 5. MÓN ĂN (FOODS)
const foodNames = genshindb.foods("names", { matchCategories: true }) || [];
for (const name of foodNames) {
  const f = genshindb.foods(name);
  if (!f || !f.images) continue;
  const slug = slugify(f.id || f.name);
  addDownloadTask(
    "foods",
    `${slug}.png`,
    getCandidateUrls(f.images.filename_icon, f.images.fandom)
  );
}

// 6. KẺ ĐỊCH & BOSS (ENEMIES)
const enemyNames = genshindb.enemies("names", { matchCategories: true }) || [];
for (const name of enemyNames) {
  const e = genshindb.enemies(name);
  if (!e || !e.images) continue;
  const slug = slugify(e.id || e.name);
  addDownloadTask(
    "enemies",
    `${slug}.png`,
    getCandidateUrls(e.images.filename_icon, e.images.fandom)
  );
}

// 7. DANH THIẾP, TRANG PHỤC, CÁNH
const namecardNames = genshindb.namecards("names", { matchCategories: true }) || [];
for (const name of namecardNames) {
  const n = genshindb.namecards(name);
  if (!n || !n.images) continue;
  const slug = slugify(n.id || n.name);
  addDownloadTask("namecards", `${slug}.png`, getCandidateUrls(n.images.filename_icon, n.images.fandom));
}

const outfitNames = genshindb.outfits("names", { matchCategories: true }) || [];
for (const name of outfitNames) {
  const o = genshindb.outfits(name);
  if (!o || !o.images) continue;
  const slug = slugify(o.id || o.name);
  addDownloadTask("outfits", `${slug}.png`, getCandidateUrls(o.images.filename_icon, o.images.fandom));
}

const gliderNames = genshindb.windgliders("names", { matchCategories: true }) || [];
for (const name of gliderNames) {
  const g = genshindb.windgliders(name);
  if (!g || !g.images) continue;
  const slug = slugify(g.id || g.name);
  addDownloadTask("windgliders", `${slug}.png`, getCandidateUrls(g.images.filename_icon, g.images.fandom));
}

// 8. TẢI TỪ CÁC FILE JSON TỒN TẠI TRONG src/data/images/
const jsonFiles = [
  { file: "animals.json", folder: "animals" },
  { file: "geography.json", folder: "geography" },
  { file: "enemies.json", folder: "enemies" },
  { file: "foods.json", folder: "foods" },
];

for (const { file, folder } of jsonFiles) {
  const filePath = path.resolve(process.cwd(), "src/data/images", file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      for (const [id, val] of Object.entries(data)) {
        if (Array.isArray(val) && val[0]) {
          const filename = val[0];
          addDownloadTask(folder, `${filename}.png`, getCandidateUrls(filename));
        }
      }
    } catch {}
  }
}

console.log(`📦 Tổng số asset cần kiểm tra / tải về: ${queue.length} files.`);

// HÀM TẢI 1 FILE VỚI FALLBACK URLS
async function downloadFile(task) {
  const { targetPath, urls } = task;

  // Nếu file đã tồn tại và kích thước > 200 bytes thì bỏ qua
  if (fs.existsSync(targetPath)) {
    try {
      const stat = fs.statSync(targetPath);
      if (stat.size > 200) {
        return { status: "already_exists", path: targetPath };
      }
    } catch {}
  }

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        // Chỉ lưu nếu buffer hợp lệ > 200 bytes
        if (buffer.length > 200) {
          const tempPath = `${targetPath}.tmp`;
          fs.writeFileSync(tempPath, buffer);
          fs.renameSync(tempPath, targetPath);
          return { status: "downloaded", path: targetPath, size: buffer.length };
        }
      }
    } catch {
      // Thử URL tiếp theo trong danh sách candidate
    }
  }

  return { status: "failed", path: targetPath };
}

// BỘ ĐIỀU PHỐI TẢI SONG SONG (CONCURRENCY POOL)
const CONCURRENCY = 12;
let completed = 0;
let downloadedCount = 0;
let skippedCount = 0;
let failedCount = 0;

async function worker(tasks) {
  while (tasks.length > 0) {
    const task = tasks.shift();
    if (!task) break;

    const res = await downloadFile(task);
    completed++;

    if (res.status === "downloaded") downloadedCount++;
    else if (res.status === "already_exists") skippedCount++;
    else failedCount++;

    if (completed % 100 === 0 || completed === queue.length) {
      const pct = ((completed / queue.length) * 100).toFixed(1);
      process.stdout.write(
        `\r⏳ Tiến độ: [${completed}/${queue.length}] (${pct}%) — Mới tải: ${downloadedCount} | Đã có sẵn: ${skippedCount} | Chưa tìm thấy: ${failedCount}`
      );
    }
  }
}

async function run() {
  const startTime = Date.now();
  console.log(`🚀 Bắt đầu tải với ${CONCURRENCY} luồng song song...`);

  const taskPool = [...queue];
  const workers = Array.from({ length: CONCURRENCY }, () => worker(taskPool));
  await Promise.all(workers);

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n\n" + "=".repeat(60));
  console.log("🎉 HOÀN TẤT THU THẬP TÀI NGUYÊN GENSHIN IMPACT!");
  console.log(`⏱️ Thời gian: ${durationSec}s`);
  console.log(`✅ File mới tải thành công: ${downloadedCount}`);
  console.log(`📁 File đã có sẵn từ trước: ${skippedCount}`);
  console.log(`⚠️ File không tìm thấy trên các CDN: ${failedCount}`);
  console.log(`📂 Thư mục lưu trữ: ${BASE_OUT}`);
  console.log("=".repeat(60));

  // TẠO MANIFEST MAPPING TỔNG HỢP CHO CLIENT / APP
  console.log("📝 Đang tạo asset-manifest.json...");
  const manifest = {};
  for (const d of DIRS) {
    const folderPath = path.join(BASE_OUT, d);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      manifest[d] = files.filter((f) => f.endsWith(".png") || f.endsWith(".webp") || f.endsWith(".jpg"));
    }
  }
  fs.writeFileSync(path.join(BASE_OUT, "asset-manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("✅ Đã ghi asset-manifest.json thành công!");
}

run().catch(console.error);
