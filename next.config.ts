import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

// Giữ lại 3 host hotlink gốc kể cả sau khi migrate sang R2 (xem
// scripts/mirror-images-to-r2.ts): script mirror ảnh chạy tay, không đồng
// bộ tức thời với `db:seed` — luôn có khả năng vài dòng mới seed (hoặc seed
// lại sau khi genshin-db ra bản mới) tạm thời còn trỏ URL gốc cho tới lần
// chạy `npm run images:mirror` kế tiếp. Xoá các host này sớm sẽ làm next/image
// báo lỗi "hostname not configured" ngay giữa lúc chưa kịp mirror hết.
const HOTLINK_REMOTE_PATTERNS: RemotePattern[] = [
  { protocol: "https", hostname: "enka.network" },
  { protocol: "https", hostname: "static.wikia.nocookie.net" },
  { protocol: "https", hostname: "upload-os-bbs.mihoyo.com" },
];

function resolveRemotePatterns(): RemotePattern[] {
  const patterns = [...HOTLINK_REMOTE_PATTERNS];

  // R2_PUBLIC_URL tùy chọn — chỉ set sau khi đã cấu hình Cloudflare R2 và
  // chạy scripts/mirror-images-to-r2.ts (xem .env.example). Đọc trực tiếp
  // process.env ở đây vì next.config.ts chạy trong Node lúc build/dev,
  // không qua NEXT_PUBLIC_* nên không cần tiền tố đó.
  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  if (r2PublicUrl) {
    try {
      const parsed = new URL(r2PublicUrl);
      patterns.push({
        protocol: parsed.protocol === "http:" ? "http" : "https",
        hostname: parsed.hostname,
      });
    } catch {
      // R2_PUBLIC_URL set nhưng không phải URL hợp lệ — bỏ qua thay vì làm
      // sập build; ảnh R2 (nếu DB đã trỏ vào) sẽ lỗi hostname riêng, dễ
      // debug hơn nhiều so với next.config.ts throw lúc build.
      console.warn(
        `[next.config.ts] R2_PUBLIC_URL="${r2PublicUrl}" không phải URL hợp lệ — bỏ qua khi build remotePatterns.`
      );
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    // Chỉ whitelist đúng các host ảnh thật đang dùng thay vì "**" —
    // wildcard cho phép next/image proxy ảnh từ BẤT KỲ domain nào, đây là
    // một rủi ro bảo mật/SSRF không cần thiết cho một app chỉ dùng vài
    // nguồn ảnh cố định.
    remotePatterns: resolveRemotePatterns(),
  },

  // Security headers cơ bản, áp dụng cho MỌI response (trang HTML lẫn API)
  // — khuyến nghị chuẩn của OWASP Secure Headers Project cho bất kỳ web
  // app public nào, độc lập framework. Khác mục đích với CORS trong
  // middleware.ts: đây là chống clickjacking/MIME-sniffing/rò rỉ Referrer,
  // không phải chia sẻ tài nguyên cross-origin.
  //
  // Không thêm Content-Security-Policy ở đây: CSP cần liệt kê chính xác
  // mọi nguồn script/style/ảnh đang dùng thật (Next.js inline script,
  // Tailwind, next/image domains...) — làm sai sẽ chặn nhầm tài nguyên hợp
  // lệ và phải kiểm tra kỹ trên môi trường build thật trước khi bật, không
  // nên thêm mù trong lần sửa này.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Chặn browser tự đoán content-type khác Content-Type server trả
          // về — chống một số kiểu tấn công MIME-sniffing.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Chặn nhúng site vào <iframe> ở domain khác — chống clickjacking.
          // Không có trang nào trong app cần bị nhúng iframe từ ngoài.
          { key: "X-Frame-Options", value: "DENY" },
          // Gửi Referrer đầy đủ khi cùng origin, chỉ gửi origin (không path/
          // query) khi sang origin khác hoặc downgrade HTTPS -> HTTP.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Tắt các API trình duyệt app không dùng tới, phòng trường hợp bị
          // nhúng iframe ở nơi khác cố gọi camera/mic/vị trí thay người dùng.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;