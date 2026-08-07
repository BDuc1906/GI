import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.character.count();
  console.log(`Characters: ${count}`);
  
  const weaponCount = await prisma.weapon.count();
  console.log(`Weapons: ${weaponCount}`);
  
  const artifactCount = await prisma.artifactSet.count();
  console.log(`Artifacts: ${artifactCount}`);
  
  const domainCount = await prisma.domain.count();
  console.log(`Domains: ${domainCount}`);
  
  const materialCount = await prisma.material.count();
  console.log(`Materials: ${materialCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());