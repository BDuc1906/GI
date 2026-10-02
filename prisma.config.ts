import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const isGeneratingClient = process.argv.includes("generate");
const datasourceUrl = process.env.DIRECT_URL ??
  (isGeneratingClient
    ? process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/leibo_generate"
    : env("DIRECT_URL"));

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: datasourceUrl,
  },
  migrations: {
    seed: "npx tsx ./scripts/seed-characters.ts",
  },
});