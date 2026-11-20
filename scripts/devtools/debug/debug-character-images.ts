/**
 * scripts/debug-character-images.ts
 *
 * CHỈ ĐỌC — không sửa DB. In ra giá trị thật của iconUrl/splashUrl/
 * elementIcon (+ bản *Original) cho các nhân vật Traveler (và tối đa 5
 * nhân vật khác đang thiếu ảnh) để xác định CHÍNH XÁC vì sao card hiển
 * thị nhầm icon nguyên tố — dùng kết quả này để chỉnh lại
 * resolveCharacterCardImage() trong src/lib/character-helpers.ts cho
 * đúng thực tế dữ liệu.
 *
 * CHẠY:
 *   npx tsx --env-file=.env scripts/debug-character-images.ts
 */

import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import { prisma } from "../../src/lib/db/prisma";

async function main() {
  const travelers = await prisma.character.findMany({
    where: { id: { startsWith: "traveler-" } },
    select: {
      id: true,
      name: true,
      vision: true,
      iconUrl: true,
      iconUrlOriginal: true,
      splashUrl: true,
      splashUrlOriginal: true,
      elementIcon: true,
      elementIconOriginal: true,
    },
  });

  console.log(`\n=== ${travelers.length} biến thể Traveler ===\n`);
  for (const c of travelers) {
    console.log(`— ${c.name} (${c.id}) — vision: ${c.vision}`);
    console.log(`   iconUrl:             ${c.iconUrl}`);
    console.log(`   iconUrlOriginal:     ${c.iconUrlOriginal}`);
    console.log(`   splashUrl:           ${c.splashUrl}`);
    console.log(`   splashUrlOriginal:   ${c.splashUrlOriginal}`);
    console.log(`   elementIcon:         ${c.elementIcon}`);
    console.log(`   elementIconOriginal: ${c.elementIconOriginal}`);
    console.log("");
  }

  // Vài nhân vật thường khác (không phải Traveler) để so sánh đối chứng.
  const others = await prisma.character.findMany({
    where: { id: { not: { startsWith: "traveler-" } } },
    take: 5,
    select: {
      id: true,
      name: true,
      iconUrl: true,
      splashUrl: true,
      elementIcon: true,
    },
  });

  console.log(`=== 5 nhân vật khác (đối chứng) ===\n`);
  for (const c of others) {
    console.log(`— ${c.name} (${c.id})`);
    console.log(`   iconUrl:     ${c.iconUrl}`);
    console.log(`   splashUrl:   ${c.splashUrl}`);
    console.log(`   elementIcon: ${c.elementIcon}`);
    console.log("");
  }
}

main()
  .catch((err) => {
    console.error("❌ Script thất bại:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
