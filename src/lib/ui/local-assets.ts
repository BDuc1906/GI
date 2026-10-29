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
  const n = name.toLowerCase().trim();
  if (n === "paimon") return "/local-genshin-assets/ui/paimon_hello.png";
  if (n === "weapons" || n === "weapon") return "/local-genshin-assets/ui/sword.png";
  if (n === "characters" || n === "character") return "/local-genshin-assets/ui/characters.png";
  if (n === "artifacts" || n === "artifact") return "/local-genshin-assets/ui/artifacts.png";
  if (n === "enemies" || n === "enemy") return "/local-genshin-assets/ui/enemy.png";
  if (n === "domains" || n === "domain") return "/local-genshin-assets/ui/domain.png";
  if (n === "materials" || n === "material") return "/local-genshin-assets/ui/items.png";
  if (n === "foods" || n === "food") return "/local-genshin-assets/ui/food.png";
  if (n === "crafts" || n === "craft") return "/local-genshin-assets/ui/craft.png";
  if (n === "animals" || n === "animal") return "/local-genshin-assets/ui/animal.png";
  if (n === "geography") return "/local-genshin-assets/ui/geography.png";
  if (n === "namecards" || n === "namecard") return "/local-genshin-assets/ui/namecard.png";
  if (n === "outfits" || n === "outfit") return "/local-genshin-assets/ui/outfit.png";
  if (n === "windgliders" || n === "windglider") return "/local-genshin-assets/ui/windglider.png";
  return `/local-genshin-assets/ui/${name}.png`;
}
