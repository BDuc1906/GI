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
};

export default nextConfig;