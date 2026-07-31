import { ok } from "@/lib/api/response";

export const dynamic = "force-static";

/** GET /api — mục lục API, hữu ích cho client tự khám phá endpoint. */
export async function GET() {
  return ok({
    name: "LEIBO API",
    version: "1.0.0",
    endpoints: {
      characters: { list: "GET /api/characters", detail: "GET /api/characters/:id" },
      weapons: { list: "GET /api/weapons", detail: "GET /api/weapons/:id" },
      artifacts: { list: "GET /api/artifacts", detail: "GET /api/artifacts/:id" },
      materials: { list: "GET /api/materials", detail: "GET /api/materials/:id" },
      search: { combined: "GET /api/search?q=..." },
      health: { check: "GET /api/health" },
    },
    docs: "/docs/API.md",
  });
}
