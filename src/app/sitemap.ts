import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [characters, weapons, artifacts] = await withDbRetry(() =>
    Promise.all([
      prisma.character.findMany({ select: { id: true, updatedAt: true } }),
      prisma.weapon.findMany({ select: { id: true, updatedAt: true } }),
      prisma.artifactSet.findMany({ select: { id: true, updatedAt: true } }),
    ])
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/characters`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/weapons`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/artifacts`, changeFrequency: "weekly", priority: 0.8 },
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

  return [...staticRoutes, ...characterRoutes, ...weaponRoutes, ...artifactRoutes];
}