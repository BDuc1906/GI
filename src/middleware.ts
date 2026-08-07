import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withRequestId } from './lib/logger';

export function middleware(req: NextRequest) {
  const { requestId, child } = withRequestId();
  
  // Log request
  child.info({
    method: req.method,
    url: req.url,
    userAgent: req.headers.get('user-agent'),
  });

  // Xử lý CORS (giữ nguyên code cũ)
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  const res = NextResponse.next();
  // Gắn requestId vào header để client có thể debug
  res.headers.set('X-Request-Id', requestId);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

// Các header CORS chuẩn dùng cho middleware (đặt ở cuối file để dễ tuỳ chỉnh)
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};