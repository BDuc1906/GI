import { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { createClearAdminSessionCookieHeader } from "@/lib/auth/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest) {
  const res = ok({ authenticated: false }, { noCache: true });
  res.headers.set("Set-Cookie", createClearAdminSessionCookieHeader());
  return res;
}
