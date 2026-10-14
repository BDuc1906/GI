/**
 * Local asset URL helpers for Genshin Impact game icons.
 *
 * All icons are downloaded to public/local-genshin-assets/ by:
 *   scripts/download-all-icons-to-local.mjs (Phase 1)
 *   scripts/download-icons-phase2.mjs       (Phase 2)
 *
 * Use these helpers to get local asset URLs — they never fail (worst case
 * the browser shows the fallback text initial in SafeImage).
 */

/** Character icon (face icon, square) */
export function localCharacterIcon(id: string): string {
  return `/local-genshin-assets/characters/icon/${id}.png`;
}

/** Character side icon (smaller, used in party/team views) */
export function localCharacterSide(id: string): string {
  return `/local-genshin-assets/characters/side/${id}.png`;
}

/** Character splash art (gacha/portrait) */
export function localCharacterSplash(id: string): string {
  return `/local-genshin-assets/characters/splash/${id}.png`;
}

/** Weapon icon */
export function localWeaponIcon(id: string): string {
  return `/local-genshin-assets/weapons/${id}.png`;
}

/**
 * Artifact set icon (uses the goblet piece as representative image,
 * which is piece index 4 → suffix _4 in Enka naming convention).
 */
export function localArtifactSetIcon(id: string): string {
  return `/local-genshin-assets/artifacts/sets/${id}.png`;
}

/** Individual artifact piece icon */
export function localArtifactPiece(
  setId: string,
  piece: "flower" | "feather" | "sands" | "goblet" | "circlet"
): string {
  return `/local-genshin-assets/artifacts/pieces/${setId}-${piece}.png`;
}

/** Material icon */
export function localMaterialIcon(id: string): string {
  return `/local-genshin-assets/materials/${id}.png`;
}

/** Element icon (PNG) */
export function localElementIcon(vision: string): string {
  return `/local-genshin-assets/elements/${vision.toLowerCase()}.png`;
}

/** Official game UI asset icon (navigation, currency, tools, paimon) */
export function localUiIcon(name: string): string {
  if (name === "paimon") return "/local-genshin-assets/ui/paimon_hello.png";
  if (name === "weapons") return "/local-genshin-assets/ui/sword.png";
  return `/local-genshin-assets/ui/${name}.png`;
}
