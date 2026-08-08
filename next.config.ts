import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const HOTLINK_REMOTE_PATTERNS: RemotePattern[] = [
  { protocol: "https", hostname: "enka.network" },
  { protocol: "https", hostname: "static.wikia.nocookie.net" },
  { protocol: "https", hostname: "upload-os-bbs.mihoyo.com" },
];

/**
 * Endpoint API riêng tư của R2 ("<accountId>.r2.cloudflarestorage.com") —
 * BẮT BUỘC chữ ký AWS SigV4, trình duyệt gọi thẳng luôn nhận 403. Nếu
 * R2_PUBLIC_URL trỏ vào đây (sự cố THẬT đã từng xảy ra — xem
 * scripts/lib/r2-client.ts), toàn bộ ảnh đã mirror sang R2 sẽ chết trên
 * production dù next/image build/deploy "thành công" bình thường (Next
 * không có cách nào tự biết domain đó không public). Cảnh báo thật to
 * ngay lúc build thay vì để phát hiện qua báo cáo lỗi người dùng.
 */
const PRIVATE_R2_ENDPOINT_PATTERN = /^[a-f0-9]{32}\.r2\.cloudflarestorage\.com$/i;

function resolveRemotePatterns(): RemotePattern[] {
  const patterns = [...HOTLINK_REMOTE_PATTERNS];
  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  if (r2PublicUrl) {
    try {
      const parsed = new URL(r2PublicUrl);
      if (PRIVATE_R2_ENDPOINT_PATTERN.test(parsed.hostname)) {
        console.error(
          `\n🔴🔴🔴 [next.config.ts] R2_PUBLIC_URL="${r2PublicUrl}" đang trỏ vào ENDPOINT ` +
            `RIÊNG TƯ của R2 (bắt buộc chữ ký, luôn 403 với trình duyệt) — KHÔNG phải Custom Domain public.\n` +
            `Toàn bộ ảnh đã mirror sang R2 sẽ KHÔNG hiển thị được sau khi deploy build này.\n` +
            `👉 Vào Cloudflare Dashboard → R2 → bucket → Settings → Public access → Connect Domain,\n` +
            `   rồi đổi R2_PUBLIC_URL thành domain đó (vd https://assets.leibo-domain-cua-ban.com).\n` +
            `Xem thêm .env.example và scripts/fix-broken-r2-urls.ts.\n`
        );
        // Cố tình KHÔNG thêm domain sai này vào remotePatterns/CSP — thêm vào
        // sẽ khiến next/image "cho phép" một domain build sẵn sẽ chết, im
        // lặng che mất tín hiệu lỗi thay vì cảnh báo rõ như trên.
      } else {
        patterns.push({
          protocol: parsed.protocol === "http:" ? "http" : "https",
          hostname: parsed.hostname,
        });
      }
    } catch {
      console.warn(
        `[next.config.ts] R2_PUBLIC_URL="${r2PublicUrl}" không phải URL hợp lệ — bỏ qua khi build remotePatterns.`
      );
    }
  }
  return patterns;
}

function contentSecurityPolicy(): string {
  const imageHosts = resolveRemotePatterns().map((p) => `${p.protocol}://${p.hostname}`);

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...imageHosts],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'"],
    // Sentry (và các lib khác) tạo web worker từ blob: URL. Nếu không khai
    // báo worker-src riêng, trình duyệt fallback về script-src — nhưng
    // script-src không cho phép blob:, nên worker bị chặn với lỗi CSP
    // ("Creating a worker from 'blob:...' violates ... worker-src was not
    // explicitly set, so script-src is used as a fallback").
    "worker-src": ["'self'", "blob:"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: resolveRemotePatterns(),
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // CSP enforce
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(),
          },
        ],
      },
    ];
  },
};

// Tích hợp Sentry – đã sửa lỗi
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "leibo",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  }
});