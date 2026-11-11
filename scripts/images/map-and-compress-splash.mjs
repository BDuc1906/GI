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

async function check() {
  const chars = await prisma.character.findMany({
    select: { id: true, name: true, genshinDbId: true, rarity: true, vision: true },
    orderBy: { name: 'asc' }
  });
  const splashDir = 'public/local-genshin-assets/characters/splash';
  const files = fs.readdirSync(splashDir);
  const fileSet = new Set(files.map(f => f.toLowerCase()));

  console.log('Total characters in DB:', chars.length);
  const unmapped = [];
  const mapped = [];

  for (const c of chars) {
    let match = null;
    const byId = `${c.id.toLowerCase()}.png`;
    if (fileSet.has(byId)) {
      match = files.find(f => f.toLowerCase() === byId);
    } else if (c.id.startsWith('traveler-boy-') && fileSet.has('aether.png')) {
      match = 'aether.png';
    } else if (c.id.startsWith('traveler-girl-') && fileSet.has('lumine.png')) {
      match = 'lumine.png';
    } else if (c.genshinDbId && fileSet.has(`${c.genshinDbId.toLowerCase()}.png`)) {
      match = files.find(f => f.toLowerCase() === `${c.genshinDbId.toLowerCase()}.png`);
    } else {
      // fuzzy search by normalized name
      const cleanName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = files.find(f => {
        const cleanFile = f.toLowerCase().replace(/\.png$/, '').replace(/[^a-z0-9]/g, '');
        return cleanFile === cleanName || cleanFile.startsWith(cleanName);
      });
      if (found) match = found;
    }

    if (match) {
      mapped.push({ id: c.id, name: c.name, match });
    } else {
      unmapped.push({ id: c.id, name: c.name });
    }
  }

  console.log(`Mapped: ${mapped.length} / ${chars.length}`);
  if (unmapped.length > 0) {
    console.log('Unmapped characters:', unmapped);
  } else {
    console.log('ALL 138 characters are successfully mapped to splash art files!');
  }
}

check()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
