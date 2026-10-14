/**
 * Download ALL Genshin Impact icons from DB (iconUrlOriginal fields) to local
 * public/local-genshin-assets/{category}/ folders.
 *
 * Run: node --env-file=.env scripts/download-all-icons-to-local.mjs
 *
 * Uses pg directly (no Prisma adapter needed) to query the DB.
 * Downloads from original CDN URLs (Mihoyo/Enka) with proper User-Agent.
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "public", "local-genshin-assets");

// Remove sslmode param to avoid pg warnings
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
  Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
  Referer: "https://genshin.hoyoverse.com/",
};

let totalDownloaded = 0;
let totalSkipped = 0;
let totalFailed = 0;

/** Ensure directory exists */
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Download a single URL to destPath. Returns true if downloaded, false if skipped.
 */
async function downloadFile(url, destPath, label) {
  if (!url || url.trim() === "") return false;

  // Skip non-http URLs
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    // It might be a relative /api/images/... path — skip, we want the original CDN URL
    return false;
  }

  // Skip if already exists
  if (fs.existsSync(destPath)) {
    totalSkipped++;
    return false;
  }

  try {
    const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
    if (!res.ok) {
      console.warn(`  ✗ HTTP ${res.status} for ${label}: ${url}`);
      totalFailed++;
      return false;
    }

    const contentType = res.headers.get("content-type") || "";
    // Only save image responses
    if (!contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
      console.warn(`  ✗ Not an image (${contentType}) for ${label}: ${url}`);
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
    console.warn(`  ✗ Error downloading ${label}: ${err.message}`);
    totalFailed++;
    return false;
  }
}

/** Derive a filename from a URL (last path segment) */
function filenameFromUrl(url) {
  try {
    const { pathname } = new URL(url);
    return path.basename(pathname) || "unknown.png";
  } catch {
    return "unknown.png";
  }
}

/** Sleep helper for rate limiting */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─────────────────────────────────────────────────────────────────
// DOWNLOAD SECTIONS
// ─────────────────────────────────────────────────────────────────

async function downloadCharacters() {
  console.log("\n📦 Characters...");
  const { rows } = await pool.query(`
    SELECT id, name,
      "iconUrlOriginal", "sideIconUrlOriginal", "splashUrlOriginal", "elementIconOriginal"
    FROM "Character"
    ORDER BY name
  `);
  console.log(`  Found ${rows.length} characters`);

  const iconDir = path.join(ASSETS_DIR, "characters", "icon");
  const sideDir = path.join(ASSETS_DIR, "characters", "side");
  const splashDir = path.join(ASSETS_DIR, "characters", "splash");
  const elemDir = path.join(ASSETS_DIR, "elements");

  for (const row of rows) {
    const id = row.id;

    if (row.iconUrlOriginal) {
      const ext = path.extname(filenameFromUrl(row.iconUrlOriginal)) || ".png";
      await downloadFile(
        row.iconUrlOriginal,
        path.join(iconDir, `${id}${ext}`),
        `character icon: ${row.name}`
      );
    }

    if (row.sideIconUrlOriginal) {
      const ext = path.extname(filenameFromUrl(row.sideIconUrlOriginal)) || ".png";
      await downloadFile(
        row.sideIconUrlOriginal,
        path.join(sideDir, `${id}${ext}`),
        `character side: ${row.name}`
      );
    }

    if (row.splashUrlOriginal) {
      const ext = path.extname(filenameFromUrl(row.splashUrlOriginal)) || ".png";
      await downloadFile(
        row.splashUrlOriginal,
        path.join(splashDir, `${id}${ext}`),
        `character splash: ${row.name}`
      );
    }

    if (row.elementIconOriginal) {
      const fname = filenameFromUrl(row.elementIconOriginal);
      await downloadFile(
        row.elementIconOriginal,
        path.join(elemDir, fname),
        `element icon: ${row.name}`
      );
    }

    await sleep(50); // small delay to be polite
  }
}

async function downloadWeapons() {
  console.log("\n⚔️  Weapons...");
  const { rows } = await pool.query(`
    SELECT id, name, "iconUrlOriginal"
    FROM "Weapon"
    ORDER BY name
  `);
  console.log(`  Found ${rows.length} weapons`);

  const dir = path.join(ASSETS_DIR, "weapons");

  for (const row of rows) {
    if (!row.iconUrlOriginal) continue;
    const ext = path.extname(filenameFromUrl(row.iconUrlOriginal)) || ".png";
    await downloadFile(
      row.iconUrlOriginal,
      path.join(dir, `${row.id}${ext}`),
      `weapon: ${row.name}`
    );
    await sleep(50);
  }
}

async function downloadArtifacts() {
  console.log("\n💎 Artifact Sets...");
  const { rows } = await pool.query(`
    SELECT id, name, "iconUrlOriginal", pieces
    FROM "ArtifactSet"
    ORDER BY name
  `);
  console.log(`  Found ${rows.length} artifact sets`);

  const setDir = path.join(ASSETS_DIR, "artifacts", "sets");
  const pieceDir = path.join(ASSETS_DIR, "artifacts", "pieces");

  for (const row of rows) {
    // Main set icon
    if (row.iconUrlOriginal) {
      const ext = path.extname(filenameFromUrl(row.iconUrlOriginal)) || ".png";
      await downloadFile(
        row.iconUrlOriginal,
        path.join(setDir, `${row.id}${ext}`),
        `artifact set: ${row.name}`
      );
    }

    // Individual piece icons from pieces JSON
    if (row.pieces && Array.isArray(row.pieces)) {
      for (const piece of row.pieces) {
        const pieceUrl = piece.iconUrl || piece.iconUrlOriginal || piece.icon;
        if (!pieceUrl) continue;
        // Skip relative/proxy URLs
        if (!pieceUrl.startsWith("http")) continue;
        const fname = filenameFromUrl(pieceUrl);
        await downloadFile(
          pieceUrl,
          path.join(pieceDir, fname),
          `artifact piece: ${piece.name || fname}`
        );
      }
    }

    await sleep(50);
  }
}

async function downloadMaterials() {
  console.log("\n🌿 Materials...");
  const { rows } = await pool.query(`
    SELECT id, name, "iconUrlOriginal"
    FROM "Material"
    ORDER BY name
  `);
  console.log(`  Found ${rows.length} materials`);

  const dir = path.join(ASSETS_DIR, "materials");

  for (const row of rows) {
    if (!row.iconUrlOriginal) continue;
    const ext = path.extname(filenameFromUrl(row.iconUrlOriginal)) || ".png";
    await downloadFile(
      row.iconUrlOriginal,
      path.join(dir, `${row.id}${ext}`),
      `material: ${row.name}`
    );
    await sleep(30);
  }
}

async function downloadDomains() {
  console.log("\n🏯 Domains...");
  const { rows } = await pool.query(`
    SELECT id, name, "imageUrlOriginal"
    FROM "Domain"
    ORDER BY name
  `);
  console.log(`  Found ${rows.length} domains`);

  const dir = path.join(ASSETS_DIR, "domains");

  for (const row of rows) {
    if (!row.imageUrlOriginal) continue;
    const ext = path.extname(filenameFromUrl(row.imageUrlOriginal)) || ".png";
    await downloadFile(
      row.imageUrlOriginal,
      path.join(dir, `${row.id}${ext}`),
      `domain: ${row.name}`
    );
    await sleep(30);
  }
}

// ─────────────────────────────────────────────────────────────────
// ELEMENT ICONS from Enka (fallback from well-known URLs)
// ─────────────────────────────────────────────────────────────────

const ELEMENT_ICONS = {
  anemo: "https://enka.network/ui/UI_ChapterIcon_02_Anemo.png",
  geo: "https://enka.network/ui/UI_ChapterIcon_03_Geo.png",
  electro: "https://enka.network/ui/UI_ChapterIcon_05_Electro.png",
  dendro: "https://enka.network/ui/UI_ChapterIcon_07_Dendro.png",
  hydro: "https://enka.network/ui/UI_ChapterIcon_04_Hydro.png",
  pyro: "https://enka.network/ui/UI_ChapterIcon_01_Pyro.png",
  cryo: "https://enka.network/ui/UI_ChapterIcon_06_Cryo.png",
};

async function downloadElementIcons() {
  console.log("\n🌀 Element Icons (Enka CDN)...");
  const dir = path.join(ASSETS_DIR, "elements");
  ensureDir(dir);

  for (const [elem, url] of Object.entries(ELEMENT_ICONS)) {
    await downloadFile(url, path.join(dir, `${elem}.png`), `element: ${elem}`);
    await sleep(100);
  }
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("🎮 Genshin Impact Icon Downloader");
  console.log(`📁 Output: ${ASSETS_DIR}`);
  console.log("=".repeat(60));

  ensureDir(ASSETS_DIR);

  await downloadCharacters();
  await downloadWeapons();
  await downloadArtifacts();
  await downloadMaterials();
  await downloadDomains();
  await downloadElementIcons();

  await pool.end();

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Done!`);
  console.log(`  Downloaded : ${totalDownloaded}`);
  console.log(`  Skipped    : ${totalSkipped} (already exist)`);
  console.log(`  Failed     : ${totalFailed}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Fatal:", err);
  pool.end();
  process.exit(1);
});
