import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  const counts = await Promise.all([
    p.character.count(),
    p.weapon.count(),
    p.artifactSet.count(),
    p.material.count(),
    p.domain.count(),
  ]);
  console.log('Characters:', counts[0]);
  console.log('Weapons:', counts[1]);
  console.log('Artifacts:', counts[2]);
  console.log('Materials:', counts[3]);
  console.log('Domains:', counts[4]);
  await p.$disconnect();
}
main();