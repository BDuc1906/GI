import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// QUAN TRỌNG: `sitemap.ts` được Next.js biên dịch thành 1 route riêng
// (`/sitemap.xml/route.js`) và mặc định bị prerender TĨNH lúc build —
// giống hệt vấn đề đã gặp ở `src/app/[locale]/page.tsx`. Khai báo `dynamic`
// tường minh để route này chạy lúc có request (crawler gọi /sitemap.xml)
// thay vì lúc `next build`/`vercel build`, loại bỏ phụ thuộc "DB phải sống
// đúng lúc build" — nguyên nhân trực tiếp gây ECONNREFUSED khi build.
//
// `withDbRetry` bên dưới vẫn được giữ lại: dù không còn chạy lúc build,
// request thật tới /sitemap.xml lúc runtime vẫn có thể trúng đúng lúc
// Neon compute mới suspend xong, nên retry ngắn ở tầng này vẫn có giá trị.
export const dynamic = "force-dynamic";
export const revalidate = 3600;

// Sau khi thêm i18n (tiền tố locale "always"), MỌI route trang giờ tồn
// tại dưới 15 phiên bản (vd "/characters" → "/en/characters",
// "/vi/characters", "/ja/characters"...). Helper này sinh 1 entry sitemap
// CHO MỖI locale + khai báo `alternates.languages` trỏ chéo sang các
// locale còn lại (bao gồm "x-default" trỏ về bản tiếng Anh) — đúng chuẩn
// hreflang, giúp Google hiểu đây là bản dịch của cùng 1 trang thay vì
// nội dung trùng lặp.
function localizedEntries(
  path: string,
  extra: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])
  );
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${path}`;

  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    alternates: { languages },
    ...extra,
  }));
}

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
    ...localizedEntries("", { changeFrequency: "weekly", priority: 1 }),
    ...localizedEntries("/characters", { changeFrequency: "weekly", priority: 0.8 }),
    ...localizedEntries("/weapons", { changeFrequency: "weekly", priority: 0.8 }),
    ...localizedEntries("/artifacts", { changeFrequency: "weekly", priority: 0.8 }),
    ...localizedEntries("/domains", { changeFrequency: "daily", priority: 0.8 }),
  ];

  const characterRoutes = characters.flatMap((c) =>
    localizedEntries(`/characters/${c.id}`, {
      lastModified: c.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  const weaponRoutes = weapons.flatMap((w) =>
    localizedEntries(`/weapons/${w.id}`, {
      lastModified: w.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    })
  );

  const artifactRoutes = artifacts.flatMap((a) =>
    localizedEntries(`/artifacts/${a.id}`, {
      lastModified: a.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    })
  );

  const domainRoutes = domains.flatMap((d) =>
    localizedEntries(`/domains/${d.id}`, {
      lastModified: d.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    })
  );

  return [...staticRoutes, ...characterRoutes, ...weaponRoutes, ...artifactRoutes, ...domainRoutes];
}
