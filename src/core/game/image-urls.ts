/**
 * src/lib/game/image-urls.ts
 *
 * Ghép danh sách URL ảnh (theo thứ tự thử) cho 1 mục từ bảng ánh xạ trong
 * src/data/images/*.json. Mỗi file JSON có dạng { "<id>": ["TenFileAnh", daCoTrenGitHub] }.
 *
 * Mỗi trang CHỈ import file JSON của loại dữ liệu nó dùng (không gộp chung) để bundle nhỏ.
 *
 * Thứ tự nguồn:
 *   1. GitHub PathOfGenshin/resources — chỉ khi tên file đã xác minh CÓ trong kho
 *      (kho dừng ở khoảng bản 4.7 nên chỉ phủ ~50% nội dung).
 *   2. enka.network/ui — nguồn gốc của dự án; không đảm bảo có mọi ảnh (xem ghi chú
 *      trong scripts/images/mirror-images-to-r2.ts).
 * Hết nguồn thì SafeImage hiện biểu tượng theo loại (EntityThumb), không bao giờ để trống.
 *
 * Khuyến nghị: mirror các ảnh này lên R2 bằng script mirror để khỏi hotlink GitHub/enka.
 */

export type ImageEntry = readonly [file: string, inGithub: number];
export type ImageMap = Record<string, ImageEntry | undefined>;

const ENKA_BASE = "https://enka.network/ui/";
const GITHUB_BASE =
  "https://raw.githubusercontent.com/PathOfGenshin/resources/main/resources/gi/Sprite/";

export function imageCandidates(entry: ImageEntry | undefined | null): string[] {
  if (!entry) return [];
  const [file, inGithub] = entry;
  const enka = `${ENKA_BASE}${file}.png`;
  return inGithub ? [`${GITHUB_BASE}${file}.png`, enka] : [enka];
}

/** Tra theo id (số hoặc chuỗi). Id không có trong bảng → []. */
export function imageFor(map: unknown, id: string | number | null | undefined): string[] {
  if (id === null || id === undefined) return [];
  return imageCandidates((map as ImageMap)[String(id)]);
}
