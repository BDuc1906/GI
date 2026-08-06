import { assertEnv } from "../src/lib/env";
assertEnv();

import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🧹 Đang tìm và xóa các Material là tên bộ thánh di vật...\n");

  // 1. Lấy tất cả tên bộ thánh di vật
  const artifactSets = await prisma.artifactSet.findMany({
    select: { name: true },
  });
  const artifactNames = artifactSets.map((a) => a.name);
  console.log(`📋 Có ${artifactNames.length} bộ thánh di vật.`);

  // 2. Xóa các Material có tên trùng
  const deleted = await prisma.material.deleteMany({
    where: {
      name: { in: artifactNames },
    },
  });
  console.log(`✅ Đã xóa ${deleted.count} bản ghi Material là bộ thánh di vật.`);

  // 3. Kiểm tra lại
  const remaining = await prisma.material.count();
  console.log(`📦 Số Material còn lại: ${remaining}`);

  // 4. In ra 10 cái còn lại để kiểm tra
  const samples = await prisma.material.findMany({
    take: 10,
    select: { name: true, iconUrl: true },
  });
  console.log("\n🔍 Một số Material còn lại:");
  samples.forEach((m) => console.log(`  - ${m.name} (icon: ${m.iconUrl ? "✅" : "❌"})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());