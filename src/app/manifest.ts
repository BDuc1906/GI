import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LEIBO — Genshin Impact Wiki & DPS Engine",
    short_name: "LEIBO",
    description: "Bách khoa toàn thư Genshin Impact, dữ liệu nhân vật, vũ khí và công cụ tính toán DPS KQM chuẩn xác.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0d0d",
    theme_color: "#0d0d0d",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["games", "entertainment", "utilities"],
  };
}
