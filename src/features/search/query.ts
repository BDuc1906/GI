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

export function buildCharacterSearchWhereForLocale(
  query: string,
  locale: string
): Prisma.CharacterWhereInput {
  const normalizedQuery = query.trim();
  const matches: Prisma.CharacterWhereInput[] = [
    { name: { contains: normalizedQuery, mode: "insensitive" } },
    {
      nameTranslations: {
        path: [locale],
        string_contains: normalizedQuery,
        mode: "insensitive",
      },
    },
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

export function buildWeaponSearchWhereForLocale(
  query: string,
  locale: string
): Prisma.WeaponWhereInput {
  const normalizedQuery = query.trim();
  const matches: Prisma.WeaponWhereInput[] = [
    { name: { contains: normalizedQuery, mode: "insensitive" } },
    {
      nameTranslations: {
        path: [locale],
        string_contains: normalizedQuery,
        mode: "insensitive",
      },
    },
  ];
  const alias = WEAPON_ALIASES[normalizedQuery.toLocaleLowerCase("en-US")];

  if (alias) matches.push({ name: { equals: alias, mode: "insensitive" } });

  return { OR: matches };
}

export function buildArtifactSearchWhere(
  query: string,
  locale: string
): Prisma.ArtifactSetWhereInput {
  const normalizedQuery = query.trim();
  return {
    OR: [
      { name: { contains: normalizedQuery, mode: "insensitive" } },
      {
        nameTranslations: {
          path: [locale],
          string_contains: normalizedQuery,
          mode: "insensitive",
        },
      },
    ],
  };
}

export function buildDomainSearchWhere(
  query: string,
  locale: string
): Prisma.DomainWhereInput {
  const normalizedQuery = query.trim();
  return {
    OR: [
      { name: { contains: normalizedQuery, mode: "insensitive" } },
      {
        nameTranslations: {
          path: [locale],
          string_contains: normalizedQuery,
          mode: "insensitive",
        },
      },
    ],
  };
}

export function buildMaterialSearchWhere(
  query: string,
  locale: string
): Prisma.MaterialWhereInput {
  const normalizedQuery = query.trim();
  return {
    OR: [
      { name: { contains: normalizedQuery, mode: "insensitive" } },
      {
        nameTranslations: {
          path: [locale],
          string_contains: normalizedQuery,
          mode: "insensitive",
        },
      },
    ],
  };
}
