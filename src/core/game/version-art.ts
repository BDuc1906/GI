/**
 * src/core/game/version-art.ts
 *
 * Quản lý Key Art / Banner nghệ thuật độc quyền theo từng phiên bản Genshin Impact.
 * Cung cấp background art cho VersionHub và trang chi tiết phiên bản /versions/[version].
 *
 * Chiến lược phân giải ảnh (Resolution Strategy):
 * 1. Curated Key Art: Ảnh quảng bá / key art chính thức được map cho phiên bản.
 * 2. Signature 5★ Character Splash Art: Trích xuất splash art local (/local-genshin-assets/characters/splash/[id].webp)
 *    của nhân vật 5★ ra mắt trong bản đó (vd Mitya/Vesna ở 7.x, Mizuki ở 5.4, Mavuika ở 5.3, Furina ở 4.2).
 * 3. Fallback mặc định: /images/home-cards/versions.webp
 */

/**
 * Bản đồ Key Art độc quyền chính thức theo từng phiên bản
 */
export const VERSION_KEY_ART_MAP: Record<string, string> = {
  // ── 5.x Natlan ──
  "5.4": "/local-genshin-assets/characters/splash/yumemizuki-mizuki.webp",
  "5.3": "/local-genshin-assets/characters/splash/mavuika.webp",
  "5.2": "/local-genshin-assets/characters/splash/chasca.webp",
  "5.1": "/local-genshin-assets/characters/splash/xilonen.webp",
  "5.0": "/local-genshin-assets/characters/splash/mualani.webp",

  // ── 4.x Fontaine ──
  "4.8": "/local-genshin-assets/characters/splash/emilie.webp",
  "4.7": "/local-genshin-assets/characters/splash/clorinde.webp",
  "4.6": "/local-genshin-assets/characters/splash/arlecchino.webp",
  "4.5": "/local-genshin-assets/characters/splash/chiori.webp",
  "4.4": "/local-genshin-assets/characters/splash/xianyun.webp",
  "4.3": "/local-genshin-assets/characters/splash/navia.webp",
  "4.2": "/local-genshin-assets/characters/splash/furina.webp",
  "4.1": "/local-genshin-assets/characters/splash/neuvillette.webp",
  "4.0": "/local-genshin-assets/characters/splash/lyney.webp",

  // ── 3.x Sumeru ──
  "3.8": "/local-genshin-assets/characters/splash/klee.webp",
  "3.7": "/local-genshin-assets/characters/splash/kirara.webp",
  "3.6": "/local-genshin-assets/characters/splash/baizhu.webp",
  "3.5": "/local-genshin-assets/characters/splash/dehya.webp",
  "3.4": "/local-genshin-assets/characters/splash/alhaitham.webp",
  "3.3": "/local-genshin-assets/characters/splash/wanderer.webp",
  "3.2": "/local-genshin-assets/characters/splash/nahida.webp",
  "3.1": "/local-genshin-assets/characters/splash/cyno.webp",
  "3.0": "/local-genshin-assets/characters/splash/tighnari.webp",

  // ── 2.x Inazuma ──
  "2.8": "/local-genshin-assets/characters/splash/kaedehara-kazuha.webp",
  "2.7": "/local-genshin-assets/characters/splash/yelan.webp",
  "2.6": "/local-genshin-assets/characters/splash/kamisato-ayato.webp",
  "2.5": "/local-genshin-assets/characters/splash/yae-miko.webp",
  "2.4": "/local-genshin-assets/characters/splash/shenhe.webp",
  "2.3": "/local-genshin-assets/characters/splash/arataki-itto.webp",
  "2.2": "/local-genshin-assets/characters/splash/tartaglia.webp",
  "2.1": "/local-genshin-assets/characters/splash/raiden-shogun.webp",
  "2.0": "/local-genshin-assets/characters/splash/kamisato-ayaka.webp",

  // ── 1.x Mondstadt / Liyue ──
  "1.6": "/local-genshin-assets/characters/splash/kaedehara-kazuha.webp",
  "1.5": "/local-genshin-assets/characters/splash/eula.webp",
  "1.4": "/local-genshin-assets/characters/splash/venti.webp",
  "1.3": "/local-genshin-assets/characters/splash/xiao.webp",
  "1.2": "/local-genshin-assets/characters/splash/albedo.webp",
  "1.1": "/local-genshin-assets/characters/splash/zhongli.webp",
  "1.0": "/local-genshin-assets/characters/splash/diluc.webp",
};

/**
 * Tên chủ đề chính thức của các phiên bản (Việt - Anh)
 */
export const VERSION_THEMES: Record<string, { vi: string; en: string }> = {
  // 5.x
  "5.4": { vi: "Giấc Mộng Mê Đắm", en: "Embrace of Enchanting Dreams" },
  "5.3": { vi: "Khúc Khải Hoàn Hồi Sinh", en: "Incandescent Ode of Resurrection" },
  "5.2": { vi: "Dệt Nên Linh Hồn Và Hỏa", en: "Tapestry of Spirit and Flame" },
  "5.1": { vi: "Cầu Vồng Rực Cháy", en: "The Rainbow Destined to Burn" },
  "5.0": { vi: "Dạo Bước Dưới Ánh Mặt Trời", en: "Flowers Resplendent on the Sun-Drenched Track" },

  // 4.x
  "4.8": { vi: "Mùa Hè! Rồng Cổ Tích? Thiên Đường!", en: "Summertide Scales and Tales" },
  "4.7": { vi: "Mộng Vĩnh Hằng Đan Cài", en: "An Everlasting Dream Intertwined" },
  "4.6": { vi: "Hai Thế Giới Rực Cháy, Màn Đêm Đỏ Dần Phai", en: "Two Worlds Aflame, the Crimson Night's Fade" },
  "4.5": { vi: "Dệt Dải Gấm Hoa", en: "Blades Weaving Betwixt the Brocade" },
  "4.4": { vi: "Gió Xuân Lướt Cánh Diều", en: "Vibrant Harriers Aloft in Spring Breeze" },
  "4.3": { vi: "Hoa Hồng Và Xạ Thủ", en: "Roses and Muskets" },
  "4.2": { vi: "Vũ Điệu Của Kẻ Tội Đồ", en: "Masquerade of the Guilty" },
  "4.1": { vi: "Hướng Về Những Vì Sao Trong Đáy Biển", en: "To the Stars Shining in the Depths" },
  "4.0": { vi: "Như Mưa Nhẹ Rơi Không Lý Do", en: "As Light Rain Falls Without Reason" },

  // 3.x
  "3.8": { vi: "Thiên Đường Mùa Hè Bí Mật", en: "Secret Summer Paradise" },
  "3.7": { vi: "Quyết Đấu! Đỉnh Cao Triệu Hồi!", en: "Duel! The Summoners' Summit!" },
  "3.6": { vi: "Lễ Hội Trí Tuệ", en: "A Parade of Providence" },
  "3.5": { vi: "Hơi Thở Hoa Gió", en: "Windblume's Breath" },
  "3.4": { vi: "Đêm Huyền Diệu", en: "The Exquisite Night Chimes" },
  "3.3": { vi: "Lục Căn Thanh Tịnh, Vạn Sở Tiêu Hao", en: "All Senses Clear, All Existence Void" },
  "3.2": { vi: "Akasha Bừng Sáng, Ngọn Lửa Kalpa Bùng Cháy", en: "Akasha Pulses, the Kalpa Flame Rises" },
  "3.1": { vi: "Vua Deshret và Ba Nhà Chiêm Tinh", en: "King Deshret and the Three Magi" },
  "3.0": { vi: "Buổi Sáng Ngàn Bông Hồng Mang Lại", en: "The Morn a Thousand Roses Brings" },

  // 2.x
  "2.8": { vi: "Khúc Ca Mùa Hè", en: "Summer Fantasia" },
  "2.7": { vi: "Ảo Mộng Nơi Đáy Vực", en: "Hidden Dreams in the Depths" },
  "2.6": { vi: "Sắc Tím Vườn Thơ", en: "Zephyr of the Violet Garden" },
  "2.5": { vi: "Khi Hoa Anh Đào Nở", en: "When the Sakura Bloom" },
  "2.4": { vi: "Muôn Sắc Hoa Đăng", en: "Fleeting Colors in Flight" },
  "2.3": { vi: "Ảo Ảnh Giữa Bão Tuyết", en: "Shadows Amidst Snowstorms" },
  "2.2": { vi: "Bí Ẩn Biển Sương Mù", en: "Into the Perilous Labyrinth of Fog" },
  "2.1": { vi: "Trăng Nước Soi Bóng", en: "Floating World Under the Moonlight" },
  "2.0": { vi: "Lôi Thần Uy Nghiêm, Địa Đàng Vĩnh Hằng", en: "The Immovable God and the Eternal Euthymia" },

  // 1.x
  "1.6": { vi: "Mùa Hè! Hải Đảo? Cuộc Phiêu Lưu!", en: "Midsummer Island Adventure" },
  "1.5": { vi: "Dưới Ánh Ngọc Bích", en: "Beneath the Light of Jadeite" },
  "1.4": { vi: "Lời Mời Hoa Gió", en: "Invitation of Windblume" },
  "1.3": { vi: "Tết Hải Đăng", en: "All That Glitters" },
  "1.2": { vi: "Vôi Trắng và Rồng Đen", en: "The Chalk Prince and the Dragon" },
  "1.1": { vi: "Ngôi Sao Đang Đến", en: "A New Star Approaches" },
  "1.0": { vi: "Khởi Hành Teyvat", en: "Welcome to Teyvat" },
};

/**
 * Trả về chủ đề song ngữ của phiên bản — tự động sinh fallback cho các bản tương lai
 */
export function getVersionTheme(version: string): { vi: string; en: string } {
  if (VERSION_THEMES[version]) {
    return VERSION_THEMES[version];
  }
  return {
    vi: `Cập Nhật Phiên Bản ${version}`,
    en: `Version ${version} Update`,
  };
}

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
