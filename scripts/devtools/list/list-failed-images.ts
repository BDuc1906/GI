import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import { prisma } from "../../src/lib/db/prisma";
import { isAlreadyMirrored } from "../lib/r2-client";

async function main() {
  const allUrls: { id: string; url: string; type: string }[] = [];

  // Characters
  const chars = await prisma.character.findMany({
    select: { id: true, iconUrl: true, splashUrl: true, sideIconUrl: true },
  });
  chars.forEach(c => {
    if (c.iconUrl && !isAlreadyMirrored(c.iconUrl)) allUrls.push({ id: c.id, url: c.iconUrl, type: 'character-icon' });
    if (c.splashUrl && !isAlreadyMirrored(c.splashUrl)) allUrls.push({ id: c.id, url: c.splashUrl, type: 'character-splash' });
    if (c.sideIconUrl && !isAlreadyMirrored(c.sideIconUrl)) allUrls.push({ id: c.id, url: c.sideIconUrl, type: 'character-side' });
  });

  // Weapons
  const weapons = await prisma.weapon.findMany({ select: { id: true, iconUrl: true } });
  weapons.forEach(w => { if (w.iconUrl && !isAlreadyMirrored(w.iconUrl)) allUrls.push({ id: w.id, url: w.iconUrl, type: 'weapon-icon' }); });

  // Artifacts
  const artifacts = await prisma.artifactSet.findMany({ select: { id: true, iconUrl: true } });
  artifacts.forEach(a => { if (a.iconUrl && !isAlreadyMirrored(a.iconUrl)) allUrls.push({ id: a.id, url: a.iconUrl, type: 'artifact-icon' }); });

  // Materials
  const materials = await prisma.material.findMany({ select: { id: true, iconUrl: true } });
  materials.forEach(m => { if (m.iconUrl && !isAlreadyMirrored(m.iconUrl)) allUrls.push({ id: m.id, url: m.iconUrl, type: 'material-icon' }); });

  // Domains
  const domains = await prisma.domain.findMany({ select: { id: true, imageUrl: true } });
  domains.forEach(d => { if (d.imageUrl && !isAlreadyMirrored(d.imageUrl)) allUrls.push({ id: d.id, url: d.imageUrl, type: 'domain-image' }); });

  console.log(`📋 Tổng số ảnh chưa mirror: ${allUrls.length}`);
  console.log(`📝 Danh sách chi tiết:\n`);
  allUrls.forEach((item, i) => {
    console.log(`${i+1}. [${item.type}] ${item.id} → ${item.url}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());