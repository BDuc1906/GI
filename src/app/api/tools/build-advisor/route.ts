import { z } from "zod";
import type { NextRequest } from "next/server";
import { generateBuildAdvice } from "@/agent/build-advisor";
import { withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { fail, ok } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  uid: z.string().regex(/^\d{9}$/, "UID phải gồm đúng 9 chữ số."),
  characterId: z.string().regex(/^[a-z0-9-]{1,80}$/, "Nhân vật không hợp lệ."),
});

const handler = withErrorHandling(async (req: NextRequest) => {
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 2_048) {
    return fail(413, "BODY_TOO_LARGE", "Yêu cầu quá lớn.");
  }

  const bodyText = await req.text();
  if (new TextEncoder().encode(bodyText).byteLength > 2_048) {
    return fail(413, "BODY_TOO_LARGE", "Yêu cầu quá lớn.");
  }

  let body: unknown;
  try {
    body = JSON.parse(bodyText);
  } catch {
    body = null;
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "INVALID_REQUEST", parsed.error.issues[0]?.message ?? "Yêu cầu không hợp lệ.");
  }

  const result = await generateBuildAdvice(parsed.data.uid, parsed.data.characterId);
  const response = ok(result, { noCache: true });
  response.headers.set("Cache-Control", "no-store");
  return response;
});

export const POST = withRateLimit(handler, {
  prefix: "build-advisor",
  limit: 5,
  window: "60 s",
});
