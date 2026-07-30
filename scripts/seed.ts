import { assertEnv } from "../src/lib/env";

assertEnv();

// Chỉ log host, không log full connection string (chứa user/pass).
{
  const dbUrl = new URL(process.env.DATABASE_URL as string);
  console.log(`DB đang dùng: ${dbUrl.protocol}//${dbUrl.hostname}:${dbUrl.port || "5432"}${dbUrl.pathname}`);
}

import { prisma } from "../src/lib/prisma";
import { seedCharacters } from "./seed-characters";
import { seedWeapons } from "./seed-weapons";
import { seedArtifacts } from "./seed-artifacts";

async function main(): Promise<void> {
  console.log("Seeding database with real Genshin Impact data (genshin-db)...");
  try {
    await seedCharacters();
    await seedWeapons();
    await seedArtifacts();
    console.log("=== ALL DATA SEEDED SUCCESSFULLY ===");
  } catch (error) {
    console.error("❌ Seeding halted due to critical error:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });