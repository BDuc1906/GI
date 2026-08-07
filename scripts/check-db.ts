import { prisma } from '../src/lib/prisma';

async function main() {
  const characters = await prisma.character.count();
  const weapons = await prisma.weapon.count();
  const artifacts = await prisma.artifactSet.count();
  const domains = await prisma.domain.count();
  const materials = await prisma.material.count();

  console.log('📊 Thống kê dữ liệu trong Neon:');
  console.log(`  Characters: ${characters}`);
  console.log(`  Weapons: ${weapons}`);
  console.log(`  Artifacts: ${artifacts}`);
  console.log(`  Domains: ${domains}`);
  console.log(`  Materials: ${materials}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());