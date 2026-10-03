import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  vi: "vi_VN",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
  ja: "ja_JP",
  ko: "ko_KR",
  id: "id_ID",
  th: "th_TH",
  de: "de_DE",
  fr: "fr_FR",
  it: "it_IT",
  pt: "pt_PT",
  es: "es_ES",
  ru: "ru_RU",
  tr: "tr_TR",
};

const STATIC_PAGE_METADATA: Record<string, { title: string; description: string }> = {
  achievements: {
    title: "Genshin Impact Achievements",
    description: "Browse Genshin Impact achievements, objectives, and completion details.",
  },
  "achievements/hidden": {
    title: "Hidden Genshin Impact Achievements",
    description: "Find hidden Genshin Impact achievements and learn how to unlock them.",
  },
  "adventure-ranks": {
    title: "Genshin Impact Adventure Ranks",
    description: "Explore Adventure Rank progression, experience requirements, and rewards.",
  },
  animals: {
    title: "Genshin Impact Animals and Wildlife",
    description: "Browse animals and wildlife recorded across the world of Teyvat.",
  },
  crafts: {
    title: "Genshin Impact Crafting Recipes",
    description: "Explore Genshin Impact crafting recipes, ingredients, and crafted items.",
  },
  enemies: {
    title: "Genshin Impact Enemies",
    description: "Browse Genshin Impact enemies, combat details, and related drops.",
  },
  food: {
    title: "Genshin Impact Food",
    description: "Browse Genshin Impact food, effects, recipes, and required ingredients.",
  },
  geography: {
    title: "Genshin Impact Geography",
    description: "Explore locations, landmarks, and geographic records from Teyvat.",
  },
  materials: {
    title: "Genshin Impact Materials",
    description: "Find Genshin Impact materials and use them to plan character and weapon upgrades.",
  },
  namecards: {
    title: "Genshin Impact Namecards",
    description: "Browse Genshin Impact namecards and their associated characters and themes.",
  },
  outfits: {
    title: "Genshin Impact Character Outfits",
    description: "Browse character outfits and alternate appearances in Genshin Impact.",
  },
  windgliders: {
    title: "Genshin Impact Wind Gliders",
    description: "Browse wind gliders and cosmetic wings available in Genshin Impact.",
  },
  "tools/dps-calculator": {
    title: "Genshin Impact DPS Calculator",
    description: "Compare character and weapon stats with the LEIBO Genshin Impact DPS calculator.",
  },
  "tools/material-calculator": {
    title: "Genshin Impact Material Calculator",
    description: "Calculate the materials needed to level Genshin Impact characters and talents.",
  },
};

export function getOpenGraphLocale(locale: string): string {
  return OG_LOCALE_MAP[locale] ?? "en_US";
}

function normalizeDescription(description: string | undefined): string | undefined {
  const normalized = description?.replace(/\s+/g, " ").trim();
  if (!normalized) return undefined;
  const characters = Array.from(normalized);
  if (characters.length <= 170) return normalized;
  return `${characters.slice(0, 167).join("").trimEnd()}...`;
}

export function getSiteUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000";
  const url = new URL(
    /^https?:\/\//i.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`
  );

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.pathname !== "/" && url.pathname !== "") ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an absolute http(s) origin without a path, query, or hash."
    );
  }

  return url.origin;
}

export function getLocalizedUrl(locale: string, pathname = ""): string {
  const normalizedPath = pathname ? `/${pathname.replace(/^\/+|\/+$/g, "")}` : "";
  return `${getSiteUrl()}/${locale}${normalizedPath}`;
}

export function createLocalizedMetadata({
  locale,
  pathname,
  title,
  description,
  robots,
  imagePath,
}: {
  locale: string;
  pathname: string;
  title: string;
  description?: string;
  robots?: Metadata["robots"];
  imagePath?: string;
}): Metadata {
  const canonical = getLocalizedUrl(locale, pathname);
  const socialImage = getLocalizedUrl(locale, imagePath ?? "opengraph-image");
  const normalizedDescription = normalizeDescription(description);
  const languages = Object.fromEntries(
    routing.locales.map((supportedLocale) => [
      supportedLocale,
      getLocalizedUrl(supportedLocale, pathname),
    ])
  );
  languages["x-default"] = getLocalizedUrl(routing.defaultLocale, pathname);

  return {
    title,
    ...(normalizedDescription ? { description: normalizedDescription } : {}),
    alternates: { canonical, languages },
    openGraph: {
      title,
      ...(normalizedDescription ? { description: normalizedDescription } : {}),
      url: canonical,
      siteName: "LEIBO",
      locale: getOpenGraphLocale(locale),
      type: "website",
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${title} | LEIBO` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      ...(normalizedDescription ? { description: normalizedDescription } : {}),
      images: [socialImage],
    },
    ...(robots ? { robots } : {}),
  };
}

export function createStaticPageMetadata(locale: string, pathname: string): Metadata {
  const page = STATIC_PAGE_METADATA[pathname];
  if (!page) {
    throw new Error(`No static SEO metadata is configured for route "${pathname}".`);
  }

  return createLocalizedMetadata({
    locale,
    pathname,
    title: `${page.title} — LEIBO`,
    description: page.description,
  });
}
