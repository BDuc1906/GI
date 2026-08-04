import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// QUAN TRỌNG: `sitemap.ts` được Next.js biên dịch thành 1 route riêng
// (`/sitemap.xml/route.js`) và mặc định bị prerender TĨNH lúc build —
// giống hệt vấn đề đã gặp ở `src/app/page.tsx`. Khai báo `dynamic` tường
// minh để route này chạy lúc có request (crawler gọi /sitemap.xml) thay
// vì lúc `next build`/`vercel build`, loại bỏ phụ thuộc "DB phải sống
// đúng lúc build" — nguyên nhân trực tiếp gây ECONNREFUSED khi build.
//
// `withDbRetry` bên dưới vẫn được giữ lại: dù không còn chạy lúc build,
// request thật tới /sitemap.xml lúc runtime vẫn có thể trúng đúng lúc
// Neon compute mới suspend xong, nên retry ngắn ở tầng này vẫn có giá trị.
export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [characters, weapons, artifacts, domains] = await withDbRetry(() =>
    Promise.all([
      prisma.character.findMany({ select: { id: true, updatedAt: true } }),
      prisma.weapon.findMany({ select: { id: true, updatedAt: true } }),
      prisma.artifactSet.findMany({ select: { id: true, updatedAt: true } }),
      prisma.domain.findMany({ select: { id: true, updatedAt: true } }),
    ])
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/characters`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/weapons`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/artifacts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/domains`, changeFrequency: "daily", priority: 0.8 },
  ];

  const characterRoutes: MetadataRoute.Sitemap = characters.map((c) => ({
    url: `${SITE_URL}/characters/${c.id}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const weaponRoutes: MetadataRoute.Sitemap = weapons.map((w) => ({
    url: `${SITE_URL}/weapons/${w.id}`,
    lastModified: w.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const artifactRoutes: MetadataRoute.Sitemap = artifacts.map((a) => ({
    url: `${SITE_URL}/artifacts/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const domainRoutes: MetadataRoute.Sitemap = domains.map((d) => ({
    url: `${SITE_URL}/domains/${d.id}`,
    lastModified: d.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...characterRoutes, ...weaponRoutes, ...artifactRoutes, ...domainRoutes];
}