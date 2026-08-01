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
    // "docs/api.md" trong repo KHÔNG được Next.js serve như route web (chỉ
    // "public/" mới được) — trỏ tới bản copy tĩnh ở public/docs/api.md
    // (giữ đồng bộ thủ công với docs/api.md, xem ghi chú trong file đó)
    // để link này thực sự resolve được, thay vì trả về 404.
    docs: "/docs/api.md",
  });
}