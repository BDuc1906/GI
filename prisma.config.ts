import "dotenv/config";
import { defineConfig } from "prisma/config";

const datasourceUrl = process.env.DIRECT_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: datasourceUrl ? { url: datasourceUrl } : undefined,
  migrations: {
    seed: "npx tsx ./scripts/seed-characters.ts",
  },
});