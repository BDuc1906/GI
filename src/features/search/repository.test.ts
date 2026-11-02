import { describe, expect, it } from "vitest";
import {
  buildArtifactSearchWhere,
  buildCharacterSearchWhereForLocale,
  buildDomainSearchWhere,
  buildMaterialSearchWhere,
  buildWeaponSearchWhereForLocale,
} from "./query";

describe("localized search filters", () => {
  it("searches character names in English, localized names, titles, and constellations", () => {
    expect(buildCharacterSearchWhereForLocale("Childe", "en")).toEqual({
      OR: [
        { name: { contains: "Childe", mode: "insensitive" } },
        { nameTranslations: { path: ["en"], string_contains: "Childe", mode: "insensitive" } },
        { title: { contains: "Childe", mode: "insensitive" } },
        { constellationName: { contains: "Childe", mode: "insensitive" } },
      ],
    });
  });

  it("resolves the community alias Baal to Raiden Shogun", () => {
    expect(buildCharacterSearchWhereForLocale("Baal", "en")).toEqual({
      OR: [
        { name: { contains: "Baal", mode: "insensitive" } },
        { nameTranslations: { path: ["en"], string_contains: "Baal", mode: "insensitive" } },
        { title: { contains: "Baal", mode: "insensitive" } },
        { constellationName: { contains: "Baal", mode: "insensitive" } },
        { name: { equals: "Raiden Shogun", mode: "insensitive" } },
      ],
    });
  });

  it("does not search aliases for one- or two-character queries", () => {
    expect(buildCharacterSearchWhereForLocale("a", "en")).toEqual({
      OR: [
        { name: { contains: "a", mode: "insensitive" } },
        { nameTranslations: { path: ["en"], string_contains: "a", mode: "insensitive" } },
      ],
    });
    expect(buildCharacterSearchWhereForLocale("ab", "en")).toEqual({
      OR: [
        { name: { contains: "ab", mode: "insensitive" } },
        { nameTranslations: { path: ["en"], string_contains: "ab", mode: "insensitive" } },
      ],
    });
  });

  it("matches canonical weapon names and duplicate aliases", () => {
    expect(buildWeaponSearchWhereForLocale("Prized Isshin Blade 0", "en")).toEqual({
      OR: [
        { name: { contains: "Prized Isshin Blade 0", mode: "insensitive" } },
        { nameTranslations: { path: ["en"], string_contains: "Prized Isshin Blade 0", mode: "insensitive" } },
        { name: { equals: "Prized Isshin Blade", mode: "insensitive" } },
      ],
    });
  });

  it("continues to match weapon names by substring", () => {
    expect(buildWeaponSearchWhereForLocale("Homa", "vi")).toEqual({
      OR: [
        { name: { contains: "Homa", mode: "insensitive" } },
        { nameTranslations: { path: ["vi"], string_contains: "Homa", mode: "insensitive" } },
      ],
    });
  });

  it("searches artifact, domain, and material names in the active locale", () => {
    const expected = {
      OR: [
        { name: { contains: "mora", mode: "insensitive" } },
        { nameTranslations: { path: ["vi"], string_contains: "mora", mode: "insensitive" } },
      ],
    };
    expect(buildArtifactSearchWhere("mora", "vi")).toEqual(expected);
    expect(buildDomainSearchWhere("mora", "vi")).toEqual(expected);
    expect(buildMaterialSearchWhere("mora", "vi")).toEqual(expected);
  });
});
