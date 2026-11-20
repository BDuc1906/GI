import { prisma } from '../src/lib/db/prisma';

const r = await prisma.character.findMany({
  where: { vision: 'Geo' },
  select: { id: true, name: true, vision: true, weaponType: true }
});
console.log(JSON.stringify(r, null, 2));
await prisma.$disconnect();
