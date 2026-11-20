import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const characters = await prisma.character.findMany({
    select: { id: true, name: true, iconUrl: true, iconUrlOriginal: true, sideIconUrl: true }
  });
  const weapons = await prisma.weapon.findMany({
    select: { id: true, name: true, iconUrl: true, iconUrlOriginal: true }
  });
  const artifacts = await prisma.artifactSet.findMany({
    select: { id: true, name: true, iconUrl: true }
  });
  const materials = await prisma.material.findMany({
    select: { id: true, name: true, iconUrl: true, iconUrlOriginal: true }
  });

  console.log(`Total Characters: ${characters.length}`);
  console.log(`Characters with iconUrl: ${characters.filter(c => c.iconUrl).length}`);
  console.log(`Characters iconUrl starting with http: ${characters.filter(c => c.iconUrl?.startsWith('http')).length}`);
  console.log(`Characters iconUrl starting with /: ${characters.filter(c => c.iconUrl?.startsWith('/')).length}`);
  console.log('Sample character iconUrl:', characters.slice(0, 5).map(c => ({ name: c.name, iconUrl: c.iconUrl, original: c.iconUrlOriginal })));

  console.log(`\nTotal Weapons: ${weapons.length}`);
  console.log(`Weapons with iconUrl: ${weapons.filter(w => w.iconUrl).length}`);
  console.log(`Weapons iconUrl starting with http: ${weapons.filter(w => w.iconUrl?.startsWith('http')).length}`);
  console.log('Sample weapon iconUrl:', weapons.slice(0, 3).map(w => ({ name: w.name, iconUrl: w.iconUrl, original: w.iconUrlOriginal })));

  console.log(`\nTotal ArtifactSets: ${artifacts.length}`);
  console.log(`ArtifactSets with iconUrl: ${artifacts.filter(a => a.iconUrl).length}`);
  console.log('Sample artifact iconUrl:', artifacts.slice(0, 3).map(a => ({ name: a.name, iconUrl: a.iconUrl })));

  console.log(`\nTotal Materials: ${materials.length}`);
  console.log(`Materials with iconUrl: ${materials.filter(m => m.iconUrl).length}`);
  console.log('Sample material iconUrl:', materials.slice(0, 3).map(m => ({ name: m.name, iconUrl: m.iconUrl })));
}

main().finally(() => prisma.$disconnect());
