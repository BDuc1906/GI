import fs from 'fs';
import path from 'path';
import { prisma } from "../../src/lib/db/prisma";
import { findBestLocalAssetMatch } from "../../src/lib/game/local-image-name";

const ROOT = process.cwd();
const LOCAL_GISHIN_ROOT = path.join(ROOT, 'genshin-impact');
const PUBLIC_ASSET_ROOT = path.join(ROOT, 'public', 'local-genshin-assets');
const PUBLIC_BASE = '/local-genshin-assets';

function listFilesRecursive(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full));
    } else if (/\.(png|jpg|jpeg|webp|svg|gif)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function basename(file: string): string {
  return path.basename(file);
}

function ensurePublicAssetDir(): void {
  fs.mkdirSync(PUBLIC_ASSET_ROOT, { recursive: true });
}

function copyAssetIntoPublic(incomingPath: string): string {
  const fileName = basename(incomingPath);
  const dest = path.join(PUBLIC_ASSET_ROOT, fileName);
  fs.mkdirSync(PUBLIC_ASSET_ROOT, { recursive: true });

  if (!fs.existsSync(dest)) {
    fs.copyFileSync(incomingPath, dest);
  }

  return `${PUBLIC_BASE}/${fileName}`;
}

async function main() {
  const localFiles = listFilesRecursive(LOCAL_GISHIN_ROOT);
  const localNames = localFiles.map((file) => basename(file));

  const characterRows = await prisma.character.findMany({
    where: {
      OR: [{ iconUrl: null }, { iconUrl: '' }, { sideIconUrl: null }, { sideIconUrl: '' }, { splashUrl: null }, { splashUrl: '' }],
    },
    select: {
      id: true,
      name: true,
      iconUrl: true,
      sideIconUrl: true,
      splashUrl: true,
      iconUrlOriginal: true,
      sideIconUrlOriginal: true,
      splashUrlOriginal: true,
    },
  });

  const materialRows = await prisma.material.findMany({
    where: {
      OR: [{ iconUrl: null }, { iconUrl: '' }],
    },
    select: { id: true, name: true, iconUrl: true, iconUrlOriginal: true },
  });

  ensurePublicAssetDir();

  if (characterRows.length > 0) {
    console.log(`Characters needing image fields: ${characterRows.length}`);
  }

  for (const c of characterRows) {
    const localMatch = findBestLocalAssetMatch(c.name, localNames);

    if (!localMatch) {
      console.log(`CHAR ${c.name} | ${c.id} | match=NO_MATCH`);
      continue;
    }

    const sourcePath = localFiles.find((file) => basename(file) === localMatch);
    if (!sourcePath) {
      console.log(`CHAR ${c.name} | ${c.id} | match=${localMatch} | source=missing`);
      continue;
    }

    const publicUrl = copyAssetIntoPublic(sourcePath);

    const data: Record<string, string> = {};
    if (!c.iconUrl) {
      data.iconUrl = publicUrl;
    }
    if (!c.sideIconUrl) {
      data.sideIconUrl = publicUrl;
    }
    if (!c.splashUrl) {
      data.splashUrl = publicUrl;
    }

    if (Object.keys(data).length > 0) {
      await prisma.character.update({
        where: { id: c.id },
        data,
      });
      console.log(`CHAR ${c.name} | ${c.id} | match=${localMatch} | wrote=${Object.keys(data).join(',')}`);
    }
  }

  if (materialRows.length > 0) {
    console.log(`Materials needing iconUrl: ${materialRows.length}`);
  }

  for (const m of materialRows) {
    const localMatch = findBestLocalAssetMatch(m.name, localNames);

    if (!localMatch) {
      console.log(`MAT ${m.name} | ${m.id} | match=NO_MATCH`);
      continue;
    }

    const sourcePath = localFiles.find((file) => basename(file) === localMatch);
    if (!sourcePath) {
      console.log(`MAT ${m.name} | ${m.id} | match=${localMatch} | source=missing`);
      continue;
    }

    const publicUrl = copyAssetIntoPublic(sourcePath);

    await prisma.material.update({
      where: { id: m.id },
      data: { iconUrl: publicUrl },
    });

    console.log(`MAT ${m.name} | ${m.id} | match=${localMatch} | wrote=iconUrl`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
