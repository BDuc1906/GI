import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Chỉ whitelist đúng các host ảnh thật đang dùng (Enka Network cho
    // icon/splash nhân vật-vũ khí, Fandom Wikia cho icon nguyên tố) thay vì
    // "**" — wildcard cho phép next/image proxy ảnh từ BẤT KỲ domain nào,
    // đây là một rủi ro bảo mật/SSRF không cần thiết cho một app chỉ dùng
    // 2 nguồn ảnh cố định.
    remotePatterns: [
      { protocol: "https", hostname: "enka.network" },
      { protocol: "https", hostname: "static.wikia.nocookie.net" },
      { protocol: "https", hostname: "upload-os-bbs.mihoyo.com" },
    ],
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