import type { Prisma } from "@prisma/client";

// Avoid very short queries matching unrelated titles or constellation names.
const MIN_ALIAS_QUERY_LENGTH = 3;
const CHARACTER_ALIASES: Readonly<Record<string, string>> = {
  baal: "Raiden Shogun",
};
const WEAPON_ALIASES: Readonly<Record<string, string>> = {
  "prized isshin blade 0": "Prized Isshin Blade",
  "prized isshin blade 1": "Prized Isshin Blade",
  "prized isshin blade 2": "Prized Isshin Blade",
};

export function buildCharacterSearchWhere(query: string): Prisma.CharacterWhereInput {
  const normalizedQuery = query.trim();
  const matches: Prisma.CharacterWhereInput[] = [
    { name: { contains: normalizedQuery, mode: "insensitive" } },
  ];

  if (normalizedQuery.length >= MIN_ALIAS_QUERY_LENGTH) {
    matches.push(
      { title: { contains: normalizedQuery, mode: "insensitive" } },
      { constellationName: { contains: normalizedQuery, mode: "insensitive" } }
    );

    const alias = CHARACTER_ALIASES[normalizedQuery.toLocaleLowerCase("en-US")];
    if (alias) matches.push({ name: { equals: alias, mode: "insensitive" } });
  }

  return { OR: matches };
}

export function buildWeaponSearchWhere(query: string): Prisma.WeaponWhereInput {
  const normalizedQuery = query.trim();
  const matches: Prisma.WeaponWhereInput[] = [
    { name: { contains: normalizedQuery, mode: "insensitive" } },
  ];
  const alias = WEAPON_ALIASES[normalizedQuery.toLocaleLowerCase("en-US")];

  if (alias) matches.push({ name: { equals: alias, mode: "insensitive" } });

  return { OR: matches };
}
