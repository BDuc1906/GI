import { NextRequest, NextResponse } from "next/server";

const CACHE_CONTROL = "public, max-age=31536000, immutable";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join("/");

  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  if (!r2PublicUrl) {
    return NextResponse.json(
      { error: "R2_PUBLIC_URL chưa được cấu hình" },
      { status: 500 }
    );
  }

  const upstreamUrl = `${r2PublicUrl.replace(/\/+$/, "")}/${key}`;

  const upstream = await fetch(upstreamUrl, {
    next: { revalidate: 31536000 },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Ảnh không tồn tại trên R2", key },
      { status: upstream.status }
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "image/png";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
