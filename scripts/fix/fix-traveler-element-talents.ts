import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import { prisma } from "../../src/lib/db/prisma";
import { seedTravelerElementVariants } from "../seed/seed-characters";

seedTravelerElementVariants()
  .then(() => {
    console.log("Đã cập nhật talent, constellation và vật liệu cho Traveler variants.");
  })
  .catch((error) => {
    console.error("Không thể cập nhật dữ liệu Traveler variants:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
