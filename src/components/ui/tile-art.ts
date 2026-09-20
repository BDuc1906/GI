/**
 * Cấu hình & helper cho ảnh nền của các tile (QuickNavigation, WikiToolsHub,
 * đồng hồ La Hoàn Thâm Cảnh...).
 *
 * Thứ tự ưu tiên của MỖI tile (xem withLocal):
 *   1. TILE_ART[key]        — ảnh bạn đặt tay bên dưới (ưu tiên cao nhất)
 *   2. URL từ DB / nguồn ngoài — chỉ là dự phòng, thử lần lượt (SafeImage)
 * Hết cả 2 thì tile vẫn đẹp nhờ nền gradient (xem ArtTile).
 */

export type Candidates = ReadonlyArray<string | null | undefined>;

export type TileKey =
  | "characters"
  | "weapons"
  | "artifacts"
  | "materials"
  | "domains"
  | "enemies"
  | "calendar"
  | "tierlist"
  | "calculator"
  | "optimizer"
  | "abyss" // ảnh ngang La Hoàn Thâm Cảnh (lớp art)
  | "abyssIcon"; // icon quái Abyss (hình chìm dự phòng)

/**
 * Ghi đè tay. Muốn dùng ảnh riêng cho 1 tile: bỏ file vào `public/tiles/`
 * rồi điền đường dẫn, ví dụ:  abyss: "/tiles/abyss.jpg"
 */
export const TILE_ART: Partial<Record<TileKey, string>> = {};

/** Ảnh local (đã đặt tay) của 1 tile, hoặc null nếu chưa có. */
export function localArtFor(key: TileKey): string | null {
  return TILE_ART[key] ?? null;
}

/** Đặt ảnh local (nếu có) lên đầu danh sách ứng viên từ nguồn ngoài. */
export function withLocal(key: TileKey, remote: Candidates): string[] {
  return compact([localArtFor(key), ...remote]);
}

/**
 * Namecard "Deep & Dark" — phần thưởng nhóm thành tựu "Domains and Spiral
 * Abyss: Series I" (data/inspect/namecards.json, UI_NameCardPic_Sj1_P).
 * Là ảnh ngang, chủ đề đúng La Hoàn Thâm Cảnh. Dùng làm ứng viên tự động;
 * nếu URL không tồn tại, script/SafeImage tự chuyển sang ứng viên kế tiếp.
 */
export const ABYSS_NAMECARD_URL = "https://enka.network/ui/UI_NameCardPic_Sj1_P.png";

/** Asset UI_* của game trên gi.yatta.moe (đã whitelist ở next.config.ts). */
export function yattaUiUrl(filename: string): string {
  return `https://gi.yatta.moe/assets/UI/${filename}.png`;
}

/** Bỏ giá trị rỗng + trùng, giữ nguyên thứ tự ưu tiên. */
export function compact(list?: Candidates | null): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list ?? []) {
    if (typeof item === "string" && item && !seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}
