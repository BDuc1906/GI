/**
 * Phase 2: Download element icons + artifact piece icons
 * 
 * Run: node --env-file=.env scripts/download-icons-phase2.mjs
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "public", "local-genshin-assets");

function cleanConnectionString(raw) {
  const url = new URL(raw);
  url.searchParams.delete("sslmode");
  return url.toString();
}

const pool = new pg.Pool({
  connectionString: cleanConnectionString(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 20_000,
});

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
};

let totalDownloaded = 0;
let totalSkipped = 0;
let totalFailed = 0;

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function filenameFromUrl(url) {
  try {
    const { pathname } = new URL(url);
    return path.basename(pathname) || "unknown.png";
  } catch { return "unknown.png"; }
}

async function downloadFile(url, destPath, label) {
  if (!url || !url.startsWith("http")) return false;
  if (fs.existsSync(destPath)) { totalSkipped++; return false; }
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
    if (!res.ok) {
      console.warn(`  ✗ HTTP ${res.status} for ${label}`);
      totalFailed++;
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, buffer);
    totalDownloaded++;
    process.stdout.write(`  ✓ ${label}\n`);
    return true;
  } catch (err) {
    console.warn(`  ✗ ${label}: ${err.message}`);
    totalFailed++;
    return false;
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─────────────────────────────────────────────────────────────────
// Element icons from DB (Wikia SVG URLs)
// ─────────────────────────────────────────────────────────────────
async function downloadElementIcons() {
  console.log("\n🌀 Element Icons (from DB elementIconOriginal)...");
  const dir = path.join(ASSETS_DIR, "elements");
  ensureDir(dir);

  const { rows } = await pool.query(`
    SELECT DISTINCT vision, "elementIconOriginal"
    FROM "Character"
    WHERE "elementIconOriginal" IS NOT NULL
    ORDER BY vision
  `);

  const seen = new Set();
  for (const row of rows) {
    const elem = row.vision.toLowerCase();
    if (seen.has(elem)) continue;
    seen.add(elem);

    const url = row.elementIconOriginal;
    const ext = url.endsWith(".svg") ? ".svg" : ".png";
    await downloadFile(url, path.join(dir, `${elem}${ext}`), `element: ${elem}`);
    await sleep(100);
  }

  // Also get existing element PNG references and try Homdgcat CDN
  const HOMDGCAT_ELEMENTS = {
    anemo: "https://gi.yatta.moe/assets/UI/element/UI_Icon_Element_Anemo.png",
    geo:   "https://gi.yatta.moe/assets/UI/element/UI_Icon_Element_Geo.png",
    electro: "https://gi.yatta.moe/assets/UI/element/UI_Icon_Element_Electric.png",
    dendro: "https://gi.yatta.moe/assets/UI/element/UI_Icon_Element_Grass.png",
    hydro: "https://gi.yatta.moe/assets/UI/element/UI_Icon_Element_Water.png",
    pyro:  "https://gi.yatta.moe/assets/UI/element/UI_Icon_Element_Fire.png",
    cryo:  "https://gi.yatta.moe/assets/UI/element/UI_Icon_Element_Ice.png",
  };

  console.log("  Trying Yatta CDN for PNG element icons...");
  for (const [elem, url] of Object.entries(HOMDGCAT_ELEMENTS)) {
    await downloadFile(url, path.join(dir, `${elem}.png`), `element PNG: ${elem}`);
    await sleep(200);
  }
}

// ─────────────────────────────────────────────────────────────────
// Artifact PIECES: derive from set icon URL (change suffix _4 -> _1..5)
// UI_RelicIcon_{setId}_{pieceType} where:
// 1=Flower, 2=Feather, 3=Sands, 4=Goblet, 5=Circlet
// ─────────────────────────────────────────────────────────────────
async function downloadArtifactPieces() {
  console.log("\n💎 Artifact Pieces (derived from set icon URLs)...");

  const { rows } = await pool.query(`
    SELECT id, name, "iconUrlOriginal"
    FROM "ArtifactSet"
    WHERE "iconUrlOriginal" IS NOT NULL
    ORDER BY name
  `);

  const pieceDir = path.join(ASSETS_DIR, "artifacts", "pieces");
  ensureDir(pieceDir);

  const PIECE_NAMES = ["flower", "feather", "sands", "goblet", "circlet"];

  for (const row of rows) {
    const baseUrl = row.iconUrlOriginal;
    // baseUrl like: https://enka.network/ui/UI_RelicIcon_15024_4.png
    // Derive other pieces by replacing _4.png with _1.png, _2.png etc.
    const match = baseUrl.match(/^(.*UI_RelicIcon_\d+)_(\d+)(\.png)$/i);
    if (!match) {
      console.warn(`  ? Cannot derive piece URLs from: ${baseUrl}`);
      continue;
    }

    const [, prefix, , ext] = match;
    for (let i = 1; i <= 5; i++) {
      const pieceUrl = `${prefix}_${i}${ext}`;
      const pieceName = PIECE_NAMES[i - 1];
      const destPath = path.join(pieceDir, `${row.id}-${pieceName}.png`);
      await downloadFile(pieceUrl, destPath, `${row.name} - ${pieceName}`);
    }
    await sleep(50);
  }
}

// ─────────────────────────────────────────────────────────────────
// Re-try failed materials using Mihoyo CDN
// The iconUrlOriginal for materials uses enka.network/ui/UI_ItemIcon_*.png
// Many newer ones are 404 — try Mihoyo upload CDN as fallback
// ─────────────────────────────────────────────────────────────────
async function retryFailedMaterials() {
  console.log("\n🌿 Re-trying failed materials via Mihoyo CDN...");

  const dir = path.join(ASSETS_DIR, "materials");

  const { rows } = await pool.query(`
    SELECT id, name, "iconUrlOriginal"
    FROM "Material"
    WHERE "iconUrlOriginal" LIKE '%enka.network%'
    ORDER BY name
  `);

  for (const row of rows) {
    const ext = path.extname(filenameFromUrl(row.iconUrlOriginal)) || ".png";
    const destPath = path.join(dir, `${row.id}${ext}`);
    if (fs.existsSync(destPath)) { totalSkipped++; continue; }

    // Extract filename from enka URL and try Mihoyo CDN
    const fname = filenameFromUrl(row.iconUrlOriginal);
    const mihoyoUrl = `https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/${fname}`;

    const downloaded = await downloadFile(mihoyoUrl, destPath, `material (mihoyo): ${row.name}`);
    if (!downloaded) {
      // Also try ambr.top API
      const ambrUrl = `https://gi.yatta.moe/assets/UI/${fname}`;
      await downloadFile(ambrUrl, destPath, `material (yatta): ${row.name}`);
    }
    await sleep(80);
  }
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(60));
  console.log("🎮 Genshin Icon Downloader - Phase 2");
  console.log("=".repeat(60));

  await downloadElementIcons();
  await downloadArtifactPieces();
  await retryFailedMaterials();

  await pool.end();

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Phase 2 Done!`);
  console.log(`  Downloaded : ${totalDownloaded}`);
  console.log(`  Skipped    : ${totalSkipped} (already exist)`);
  console.log(`  Failed     : ${totalFailed}`);
  console.log("=".repeat(60));
}

main().catch(err => {
  console.error("Fatal:", err);
  pool.end();
  process.exit(1);
});
