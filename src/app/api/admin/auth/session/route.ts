import { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { getAuthenticatedUser } from "@/agent/utils/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  return ok(
    {
      authenticated: user.role === "admin",
      role: user.role,
    },
    { noCache: true }
  );
}
