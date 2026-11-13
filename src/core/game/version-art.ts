/**
 * src/core/game/version-art.ts
 *
 * Quản lý Key Art / Banner nghệ thuật độc quyền theo từng phiên bản Genshin Impact.
 * Cung cấp background art cho VersionHub và trang chi tiết phiên bản /versions/[version].
 *
 * Chiến lược phân giải ảnh (Resolution Strategy):
 * 1. Curated Key Art: Ảnh quảng bá / key art chính thức được map cho phiên bản.
 * 2. Signature 5★ Character Splash Art: Trích xuất splash art local (/local-genshin-assets/characters/splash/[id].webp)
 *    của nhân vật 5★ ra mắt trong bản đó (vd Vesna ở 7.1, Mavuika ở 5.3, Furina ở 4.2).
 * 3. Namecard / Regional Art fallback: Banner thẻ bài vùng đất / sự kiện độc quyền.
 * 4. General fallback: /images/home-cards/versions.webp
 */

/**
 * Bản đồ Key Art độc quyền chính thức theo từng phiên bản
 */
export const VERSION_KEY_ART_MAP: Record<string, string> = {
  "7.2": "/local-genshin-assets/namecards/210298.png",
  "7.1": "/local-genshin-assets/characters/splash/vesna.webp",
  "7.0": "/local-genshin-assets/namecards/210290.png",
  "5.3": "/local-genshin-assets/characters/splash/mavuika.webp",
  "5.2": "/local-genshin-assets/characters/splash/chasca.webp",
  "5.1": "/local-genshin-assets/characters/splash/xilonen.webp",
  "5.0": "/local-genshin-assets/characters/splash/mualani.webp",
  "4.8": "/local-genshin-assets/characters/splash/emilie.webp",
  "4.7": "/local-genshin-assets/characters/splash/clorinde.webp",
  "4.6": "/local-genshin-assets/characters/splash/arlecchino.webp",
  "4.2": "/local-genshin-assets/characters/splash/furina.webp",
  "4.1": "/local-genshin-assets/characters/splash/neuvillette.webp",
  "4.0": "/local-genshin-assets/characters/splash/lyney.webp",
};

/**
 * Tên chủ đề chính thức của các phiên bản
 */
export const VERSION_THEMES: Record<string, { vi: string; en: string }> = {
  "7.2": { vi: "Chân Trời Băng Đóng", en: "Frostbound Horizon" },
  "7.1": { vi: "Vũ Điệu Băng Tuyết", en: "The Winter Queen's Waltz" },
  "7.0": { vi: "Khúc Ca Snezhnaya", en: "The Snezhnayan Prelude" },
  "5.3": { vi: "Khúc Khải Hoàn Hồi Sinh", en: "Incandescent Ode of Resurrection" },
  "5.2": { vi: "Dệt Nên Linh Hồn Và Hỏa", en: "Tapestry of Spirit and Flame" },
  "5.1": { vi: "Cầu Vồng Rực Cháy", en: "The Rainbow Destined to Burn" },
  "5.0": { vi: "Dạo Bước Dưới Ánh Mặt Trời", en: "Flowers Resplendent on the Sun-Drenched Track" },
};

/**
 * Trả về đường dẫn ảnh nền độc quyền cho phiên bản tương ứng
 */
export function resolveVersionBackgroundArt(
  version: string,
  featuredCharacters: Array<{ id: string; meta?: string | null }> = []
): string {
  // 1. Ưu tiên map thủ công đã kiểm định
  if (VERSION_KEY_ART_MAP[version]) {
    return VERSION_KEY_ART_MAP[version];
  }

  // 2. Tìm nhân vật 5 sao mới nhất của phiên bản có splash local
  const fiveStar = featuredCharacters.find((c) => c.meta?.includes("5★"));
  const char = fiveStar ?? featuredCharacters[0];
  if (char?.id) {
    return `/local-genshin-assets/characters/splash/${char.id}.webp`;
  }

  // 3. Fallback mặc định
  return "/images/home-cards/versions.webp";
}
