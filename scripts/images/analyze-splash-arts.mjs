import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function analyze() {
  const chars = await prisma.character.findMany({
    select: { id: true, name: true, genshinDbId: true, splashUrl: true, splashUrlOriginal: true },
    orderBy: { name: 'asc' }
  });
  
  const splashDir = 'public/local-genshin-assets/characters/splash';
  const diskFiles = new Set(fs.existsSync(splashDir) ? fs.readdirSync(splashDir) : []);

  let foundById = 0;
  let foundByGenshinDbId = 0;
  const missing = [];
  const fileSizes = [];

  for (const c of chars) {
    const byId = `${c.id}.png`;
    const byDbId = c.genshinDbId ? `${c.genshinDbId}.png` : null;

    if (diskFiles.has(byId)) {
      foundById++;
      const s = fs.statSync(path.join(splashDir, byId)).size;
      fileSizes.push({ id: c.id, name: c.name, file: byId, size: s });
    } else if (byDbId && diskFiles.has(byDbId)) {
      foundByGenshinDbId++;
      const s = fs.statSync(path.join(splashDir, byDbId)).size;
      fileSizes.push({ id: c.id, name: c.name, file: byDbId, size: s });
    } else {
      missing.push({ id: c.id, name: c.name, genshinDbId: c.genshinDbId, splashUrl: c.splashUrl, orig: c.splashUrlOriginal });
    }
  }

  console.log(JSON.stringify({
    totalCharacters: chars.length,
    foundById,
    foundByGenshinDbId,
    totalFound: foundById + foundByGenshinDbId,
    missingCount: missing.length,
    missingList: missing,
    diskFilesTotal: diskFiles.size
  }, null, 2));

  if (fileSizes.length > 0) {
    const totalSizeMB = fileSizes.reduce((a, b) => a + b.size, 0) / (1024 * 1024);
    console.log('Total splash file size on disk:', totalSizeMB.toFixed(2), 'MB');
    const avgSizeKB = (totalSizeMB * 1024) / fileSizes.length;
    console.log('Average size per splash art:', avgSizeKB.toFixed(2), 'KB');
    const largest = [...fileSizes].sort((a,b) => b.size - a.size).slice(0, 10);
    console.log('Largest 10 splash files:', largest);
  }
}

analyze().then(() => prisma.$disconnect()).catch(err => {
  console.error(err);
  process.exit(1);
});
