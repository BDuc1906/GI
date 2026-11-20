import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import { prisma } from "../../src/lib/db/prisma";

async function main() {
  console.log("🔍 Danh sách nhân vật thiếu splashUrl:\n");

  const characters = await prisma.character.findMany({
    select: { id: true, name: true, iconUrl: true, splashUrl: true },
    orderBy: { name: "asc" },
  });

  const missing = characters.filter((c) => !c.splashUrl);
  console.log(`📌 Tổng số nhân vật: ${characters.length}`);
  console.log(`❌ Thiếu splash: ${missing.length}\n`);

  if (missing.length === 0) {
    console.log("✅ Tất cả nhân vật đều có splash!");
    return;
  }

  console.log("Danh sách chi tiết:");
  missing.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name} (ID: ${c.id})`);
    console.log(`   - iconUrl: ${c.iconUrl || "❌"}`);
    console.log(`   - splashUrl: ${c.splashUrl || "❌"}\n`);
  });

  console.log("\n💡 Gợi ý:");
  console.log("- Nếu nhân vật mới chưa có splash, có thể dùng iconUrl làm fallback trong UI.");
  console.log("- Nếu splash có trên Enka nhưng không lấy được, kiểm tra lại getEnkaUrl trong seed-helpers.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());