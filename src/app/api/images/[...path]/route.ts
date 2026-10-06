import { NextRequest, NextResponse } from "next/server";

// Cache ảnh ở edge/CDN Vercel trong 1 năm — ảnh game data hiếm khi đổi,
// và key R2 (path) là bất biến theo asset, nên cache dài an toàn.
const CACHE_CONTROL = "public, max-age=31536000, immutable";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join("/");

  const r2PublicUrl =
    process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!r2PublicUrl) {
    return NextResponse.json(
      { error: "R2_PUBLIC_URL chưa được cấu hình" },
      { status: 500 }
    );
  }

  const upstreamUrl = `${r2PublicUrl.replace(/\/+$/, "")}/${key}`;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      // Cache riêng của Next.js data cache, cộng thêm header response ở
      // dưới để browser/CDN Vercel cũng cache theo.
      next: { revalidate: 31536000 },
    });
  } catch {
    // Lỗi mạng tới R2: trả 502 gọn thay vì để route ném exception (500).
    return NextResponse.json({ error: "Không kết nối được R2", key }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Ảnh không tồn tại trên R2", key },
      { status: upstream.status }
    );
  }

  // SVG (icon nguyên tố) thường được R2 trả về octet-stream => trình duyệt
  // không vẽ được. Suy ra content-type từ đuôi file khi R2 không đặt đúng.
  const ext = key.split(".").pop()?.toLowerCase();
  const byExt: Record<string, string> = {
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
  };
  const upstreamType = upstream.headers.get("content-type");
  const contentType =
    !upstreamType || upstreamType.startsWith("application/octet-stream")
      ? (ext && byExt[ext]) || "image/png"
      : upstreamType;
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
