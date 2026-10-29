import type { Prisma } from "@prisma/client";

export const NON_PLAYABLE_CHARACTER_IDS = [
  "manekin",
  "manekina",
  "traveler-boy-cryo",
  "traveler-girl-cryo",
] as const;

export const PLAYABLE_CHARACTER_FILTER = {
  id: { notIn: [...NON_PLAYABLE_CHARACTER_IDS] },
} satisfies Prisma.CharacterWhereInput;

export function isNonPlayableCharacterId(id: string): boolean {
  return (NON_PLAYABLE_CHARACTER_IDS as readonly string[]).includes(id);
}
