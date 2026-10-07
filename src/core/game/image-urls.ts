/**
 * src/core/game/image-urls.ts
 *
 * Ghép danh sách URL ảnh (theo thứ tự thử) cho 1 mục từ bảng ánh xạ trong
 * src/data/images/<loại>.json. Mỗi file JSON có dạng:
 *
 *   { "<id>": [ "TenFileAnh", daCoTrenGitHub, trangThai?, duoiFile? ] }
 *
 *   daCoTrenGitHub : 1 = tên file đã xác minh CÓ trong kho GitHub PathOfGenshin/resources
 *   trangThai      : 1  = ĐÃ mirror lên R2  -> chỉ dùng R2, không hotlink nguồn ngoài
 *                    -1 = đã thử mọi nguồn đều chết -> không thử nữa (hiện chữ cái đầu)
 *                    (bỏ trống) = chưa mirror -> thử GitHub (nếu có) rồi enka
 *   duoiFile       : "png" (mặc định) | "webp" — đuôi file của bản đã mirror
 *
 * trangThai/duoiFile do `npm run images:mirror-game` tự ghi lại; không sửa tay.
 *
 * Mỗi trang CHỈ import file JSON của loại dữ liệu nó dùng (không gộp chung) để bundle nhỏ.
 */

export type ImageEntry = readonly [
  file: string,
  inGithub: number,
  state?: number,
  ext?: string,
];
export type ImageMap = Record<string, ImageEntry | undefined>;

const ENKA_BASE = "https://enka.network/ui/";
const GITHUB_BASE =
  "https://raw.githubusercontent.com/PathOfGenshin/resources/main/resources/gi/Sprite/";

/** Thư mục trên R2 chứa ảnh nhóm Kẻ địch/Món ăn/... (script mirror và site dùng chung hằng số này). */
export const GAME_IMAGE_R2_PREFIX = "game-images";

/** Khoá object R2 của ảnh đã mirror (tên file game là duy nhất nên không cần thêm thư mục theo loại). */
export function gameImageR2Key(file: string, ext = "png"): string {
  return `${GAME_IMAGE_R2_PREFIX}/${file}.${ext}`;
}

export function imageCandidates(entry: ImageEntry | undefined | null): string[] {
  if (!entry) return [];
  const [file, inGithub, state, ext] = entry;
  if (state === 1) return [`/api/images/${gameImageR2Key(file, ext ?? "png")}`];
  if (state === -1) return [];
  const enka = `${ENKA_BASE}${file}.png`;
  return inGithub ? [`${GITHUB_BASE}${file}.png`, enka] : [enka];
}

/** Tra theo id (số hoặc chuỗi). Id không có trong bảng → []. */
export function imageFor(map: unknown, id: string | number | null | undefined): string[] {
  if (id === null || id === undefined) return [];
  return imageCandidates((map as ImageMap)[String(id)]);
}
