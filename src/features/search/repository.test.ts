import { describe, expect, it } from "vitest";
import { buildCharacterSearchWhere, buildWeaponSearchWhere } from "./query";

describe("buildCharacterSearchWhere", () => {
  it("searches canonical names, titles, and constellation names", () => {
    expect(buildCharacterSearchWhere("Childe")).toEqual({
      OR: [
        { name: { contains: "Childe", mode: "insensitive" } },
        { title: { contains: "Childe", mode: "insensitive" } },
        { constellationName: { contains: "Childe", mode: "insensitive" } },
      ],
    });
  });

  it("resolves the community alias Baal to Raiden Shogun", () => {
    expect(buildCharacterSearchWhere("Baal")).toEqual({
      OR: [
        { name: { contains: "Baal", mode: "insensitive" } },
        { title: { contains: "Baal", mode: "insensitive" } },
        { constellationName: { contains: "Baal", mode: "insensitive" } },
        { name: { equals: "Raiden Shogun", mode: "insensitive" } },
      ],
    });
  });

  it("does not search aliases for one- or two-character queries", () => {
    expect(buildCharacterSearchWhere("a")).toEqual({
      OR: [{ name: { contains: "a", mode: "insensitive" } }],
    });
    expect(buildCharacterSearchWhere("ab")).toEqual({
      OR: [{ name: { contains: "ab", mode: "insensitive" } }],
    });
  });
});

describe("buildWeaponSearchWhere", () => {
  it("matches canonical weapon names and duplicate aliases", () => {
    expect(buildWeaponSearchWhere("Prized Isshin Blade 0")).toEqual({
      OR: [
        { name: { contains: "Prized Isshin Blade 0", mode: "insensitive" } },
        { name: { equals: "Prized Isshin Blade", mode: "insensitive" } },
      ],
    });
  });

  it("continues to match weapon names by substring", () => {
    expect(buildWeaponSearchWhere("Homa")).toEqual({
      OR: [{ name: { contains: "Homa", mode: "insensitive" } }],
    });
  });
});
