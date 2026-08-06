import { prisma } from "../src/lib/prisma";
import { assertEnv } from "../src/lib/env";
assertEnv();

async function main() {
  const materials = await prisma.material.findMany({
    where: { iconUrl: null },
    select: { name: true },
    orderBy: { name: "asc" },
  });

  console.log(`📋 Có ${materials.length} nguyên liệu thiếu icon:`);
  materials.forEach((m, i) => {
    console.log(`${i + 1}. ${m.name}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());