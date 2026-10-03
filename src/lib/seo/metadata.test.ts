import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createLocalizedMetadata,
  createStaticPageMetadata,
  getLocalizedUrl,
  getSiteUrl,
} from "./metadata";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("SEO URL helpers", () => {
  it("uses the configured public origin and normalizes its trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://leibo.example/");
    expect(getSiteUrl()).toBe("https://leibo.example");
    expect(getLocalizedUrl("vi", "characters/kazuha")).toBe(
      "https://leibo.example/vi/characters/kazuha"
    );
  });

  it("uses Vercel's production domain when the public URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "leibo.example");
    vi.stubEnv("VERCEL_URL", "preview-leibo.example");
    expect(getSiteUrl()).toBe("https://leibo.example");
  });

  it("rejects a configured URL that includes a path", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://leibo.example/site");
    expect(() => getSiteUrl()).toThrow(/absolute http\(s\) origin/);
  });
});

describe("createLocalizedMetadata", () => {
  it("sets canonical, localized alternates, and social image URLs for the route", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://leibo.example");
    const metadata = createLocalizedMetadata({
      locale: "en",
      pathname: "characters/kazuha",
      title: "Kaedehara Kazuha — LEIBO",
      description: "Anemo character",
      imagePath: "characters/kazuha/opengraph-image",
    });

    expect(metadata.alternates).toEqual({
      canonical: "https://leibo.example/en/characters/kazuha",
      languages: expect.objectContaining({
        en: "https://leibo.example/en/characters/kazuha",
        vi: "https://leibo.example/vi/characters/kazuha",
        "x-default": "https://leibo.example/en/characters/kazuha",
      }),
    });
    expect(metadata.openGraph).toMatchObject({
      url: "https://leibo.example/en/characters/kazuha",
      images: [
        {
          url: "https://leibo.example/en/characters/kazuha/opengraph-image",
          width: 1200,
          height: 630,
        },
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["https://leibo.example/en/characters/kazuha/opengraph-image"],
    });
  });

  it("normalizes and caps long descriptions", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://leibo.example");
    const description = "Long description ".repeat(30);
    const metadata = createLocalizedMetadata({
      locale: "en",
      pathname: "weapons",
      title: "Weapons — LEIBO",
      description,
    });

    expect(metadata.description).toHaveLength(170);
    expect(metadata.description).toMatch(/\.\.\.$/);
    expect(metadata.openGraph).toMatchObject({ description: metadata.description });
  });

  it("provides complete route metadata for secondary public sections", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://leibo.example");
    const metadata = createStaticPageMetadata("en", "achievements/hidden");

    expect(metadata).toMatchObject({
      title: "Hidden Genshin Impact Achievements — LEIBO",
      alternates: {
        canonical: "https://leibo.example/en/achievements/hidden",
      },
      openGraph: {
        url: "https://leibo.example/en/achievements/hidden",
        title: "Hidden Genshin Impact Achievements — LEIBO",
      },
    });
  });
});
