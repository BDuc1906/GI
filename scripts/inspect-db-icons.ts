import { prisma } from '../src/lib/db/prisma';

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
  const enemies = await prisma.enemy.findMany({
    select: { id: true, name: true, iconUrl: true }
  });
  const domains = await prisma.domain.findMany({
    select: { id: true, name: true, iconUrl: true }
  });

  console.log('Characters count:', characters.length);
  console.log('Characters with iconUrl:', characters.filter(c => c.iconUrl).length);
  console.log('Sample character:', characters[0]);

  console.log('\nWeapons count:', weapons.length);
  console.log('Weapons with iconUrl:', weapons.filter(w => w.iconUrl).length);
  console.log('Sample weapon:', weapons[0]);

  console.log('\nArtifacts count:', artifacts.length);
  console.log('Artifacts with iconUrl:', artifacts.filter(a => a.iconUrl).length);
  console.log('Sample artifact:', artifacts[0]);

  console.log('\nMaterials count:', materials.length);
  console.log('Materials with iconUrl:', materials.filter(m => m.iconUrl).length);
  console.log('Sample material:', materials[0]);

  console.log('\nEnemies count:', enemies.length);
  console.log('Enemies with iconUrl:', enemies.filter(e => e.iconUrl).length);
  console.log('Sample enemy:', enemies[0]);

  console.log('\nDomains count:', domains.length);
  console.log('Domains with iconUrl:', domains.filter(d => d.iconUrl).length);
  console.log('Sample domain:', domains[0]);
}

main().finally(() => prisma.$disconnect());
