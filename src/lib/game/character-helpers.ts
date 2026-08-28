import { prisma } from "@/lib/db/prisma";
import type { Character } from "@prisma/client";
import {
  formatNumber,
  formatSpecialized,
  type StatByLevelRow,
} from "@/lib/game/character-stats-format";

export { formatNumber, formatSpecialized, type StatByLevelRow };

export type AscensionMaterialPhase = {
  phase: number;
  materials: Array<{
    materialId?: string | null;
    name: string | null;
    count: number | null;
  }>;
};

export type VoiceActors = {
  english?: string | null;
  chinese?: string | null;
  japanese?: string | null;
  korean?: string | null;
};

export type TalentAttributeRow = {
  label: string;
  values: string[];
};

export type Talent = {
  key: string;
  name: string;
  description: string;
  icon: string | null;
  attributes: TalentAttributeRow[] | null;
};

export type Constellation = {
  level?: number;
  name: string;
  description: string;
  icon: string | null;
};

export type TalentMaterialLevel = {
  level: number;
  materials: Array<{
    materialId?: string | null;
    name: string | null;
    count: number | null;
  }>;
};

// TRƯỚC ĐÂY: map cố định chỉ tới passive4 — nhân vật có passive5 trở lên
// (nếu genshin-db trả về, ví dụ sau 1 đợt rework/buff thêm thiên phú) sẽ
// hiện thẳng key thô "passive5" thay vì nhãn tiếng Việt, do
// TALENT_LABEL_VI[t.key] ?? t.key rơi về nhánh fallback.
//
// SỬA: giữ map cố định cho 4 kỹ năng chiến đấu (tên riêng, không suy ra
// được từ số), còn passive thì TÍNH nhãn động cho MỌI số thứ tự — khớp
// với cách genshin-pure-helpers.ts giờ dò toàn bộ passiveN có thật thay
// vì giới hạn cứng. Không cần sửa file này nữa nếu sau này xuất hiện
// passive5, passive6...
const COMBAT_LABEL_VI: Record<string, string> = {
  normalAttack: "Đòn Thường / Trọng Kích / Bổ Nhào",
  elementalSkill: "Kỹ Năng Nguyên Tố",
  elementalBurst: "Trọng Kích Nguyên Tố (Cực Kỹ)",
  alternateSprint: "Kỹ Năng Di Chuyển Đặc Biệt",
};

export const TALENT_LABEL_VI: Record<string, string> = new Proxy(COMBAT_LABEL_VI, {
  get(target, prop: string) {
    if (prop in target) return target[prop];
    const match = /^passive(\d+)$/.exec(prop);
    if (match) return `Thiên Phú Bị Động ${match[1]}`;
    return undefined;
  },
}) as Record<string, string>;

// Bản đa ngôn ngữ của TALENT_LABEL_VI ở trên — nhận vào hàm dịch t() (namespace
// "CharacterDetail", đã có sẵn 4 khóa combat cố định + khóa "passiveN" nhận
// tham số {n}) thay vì map cứng tiếng Việt. Dùng ở trang /[locale]/characters/[id].
//
// SỬA type tham số `t`: trước đây khai `values?: Record<string, unknown>` —
// quá RỘNG so với `Translator` thật của next-intl (chỉ chấp nhận
// `Record<string, string | number | Date>` cho values, để đúng chuẩn định
// dạng ICU message). Một hàm chỉ hứa hẹn nhận `string | number | Date`
// không thể gán được vào vị trí đòi hỏi nhận ĐƯỢC BẤT KỲ `unknown` nào —
// TypeScript báo lỗi ở đây là ĐÚNG (tham số hàm phản biến), không phải
// false positive. Thu hẹp lại đúng theo cách hàm này thực sự được gọi
// (`{ n: match[1] }`, `match[1]` luôn là `string`) — khớp chính xác với
// kiểu `Translator` thật, không mất gì so với hành vi cũ.
export function getTalentLabel(
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  key: string
): string {
  const combatKeys = ["normalAttack", "elementalSkill", "elementalBurst", "alternateSprint"];
  if (combatKeys.includes(key)) return t(key);
  const match = /^passive(\d+)$/.exec(key);
  if (match) return t("passiveN", { n: match[1] });
  return key;
}

// formatNumber/formatSpecialized/StatByLevelRow: xem character-stats-format.ts
// (re-export ở đầu file) — logic thật nằm ở đó, không định nghĩa lại ở đây.

// Tên nguyên tố hợp lệ — dùng để nhận diện đúng file "rác" do bug bên
// dưới gây ra (xem BAD_LOCAL_ELEMENT_ASSET). Khớp không phân biệt hoa
// thường vì normalizeLocalAssetKey() (src/lib/local-image-name.ts) đã
// hạ hết về chữ thường trước khi lưu vào URL.
const ELEMENT_NAMES = ["anemo", "geo", "electro", "dendro", "hydro", "pyro", "cryo"];

/**
 * BUG THẬT (đã xác nhận qua scripts/debug-character-images.ts): script
 * `scripts/auto-fill-local-images.ts` quét thư mục local `genshin-impact/`
 * rồi dùng `findBestLocalAssetMatch()` (src/lib/local-image-name.ts) để tự
 * điền `splashUrl` còn thiếu — thuật toán so khớp theo ký tự chung quá
 * lỏng, nên với tên kiểu "Aether (Cryo)"/"Lumine (Geo)" (14 biến thể
 * Traveler) nó khớp NHẦM sang các file chỉ đặt tên theo nguyên tố (vd
 * "cryo.png", "geo.png" — nhiều khả năng là icon/badge nguyên tố chung,
 * không phải ảnh nhân vật thật), rồi copy vào
 * `public/local-genshin-assets/<element>.png` và ghi thẳng path đó vào
 * cột `splashUrl`. Vì EntityCard ưu tiên `splashUrl` trước `iconUrl`
 * (`c.splashUrl || c.iconUrl`), path rác này luôn được chọn hiển thị thay
 * vì icon nhân vật thật đã mirror đúng ở `iconUrl`.
 *
 * Đã sửa tận gốc ở scripts/auto-fill-local-images.ts (bỏ qua Traveler +
 * chặn match yếu vào file tên thuần nguyên tố) — hàm này là lớp chặn Ở
 * TẦNG HIỂN THỊ, phòng trường hợp DB còn sót dữ liệu cũ chưa dọn (xem
 * scripts/fix-character-image-mixup.ts).
 */
function isBadLocalElementAsset(url: string): boolean {
  const match = /^\/local-genshin-assets\/([a-z0-9-]+)\.[a-z0-9]+$/i.exec(url.trim());
  if (!match) return false;
  return ELEMENT_NAMES.includes(match[1].toLowerCase());
}

export function resolveCharacterCardImage(c: {
  splashUrl?: string | null;
  iconUrl?: string | null;
}): string | null {
  const splash = c.splashUrl && !isBadLocalElementAsset(c.splashUrl) ? c.splashUrl : null;
  // Danh sách/lưới nhân vật ưu tiên ICON (vuông, gọn, tải nhẹ hơn) thay vì
  // splash art (dọc, nặng) — chỉ fallback về art nếu nhân vật đó thiếu icon.
  return c.iconUrl || splash || null;
}

/**
 * Nếu đây là 1 biến thể Traveler (id "traveler-boy-<element>" /
 * "traveler-girl-<element>"), lấy thêm biến thể giới tính còn lại CÙNG
 * nguyên tố (dữ liệu thật đã seed sẵn) để ghép ảnh nửa Nam / nửa Nữ ở
 * banner đầu trang.
 */
export async function resolveTravelerSibling(character: Character): Promise<{
  isTraveler: boolean;
  boySplash: string | null;
  girlSplash: string | null;
}> {
  const isTraveler = character.id.startsWith("traveler-");
  if (!isTraveler) {
    return { isTraveler: false, boySplash: null, girlSplash: null };
  }

  const siblingId = character.id.startsWith("traveler-boy-")
    ? character.id.replace("traveler-boy-", "traveler-girl-")
    : character.id.replace("traveler-girl-", "traveler-boy-");
  const sibling = await prisma.character.findUnique({ where: { id: siblingId } });

  const boy = character.id.startsWith("traveler-boy-") ? character : sibling;
  const girl = character.id.startsWith("traveler-girl-") ? character : sibling;

  return {
    isTraveler: true,
    boySplash: boy ? resolveCharacterCardImage(boy) : null,
    girlSplash: girl ? resolveCharacterCardImage(girl) : null,
  };
}

/**
 * Icon nguyên liệu đột phá được lưu ở bảng Material riêng (không lặp lại
 * trong JSON của từng nhân vật) — gom hết materialId xuất hiện trong 6
 * giai đoạn rồi query 1 lần duy nhất, tránh N+1 query trong lúc render.
 */
export async function getMaterialIconMap(
  ascensionMaterials: AscensionMaterialPhase[]
): Promise<Map<string, string | null>> {
  const materialIds = Array.from(
    new Set(
      ascensionMaterials
        .flatMap((phase) => phase.materials.map((m) => m.materialId))
        .filter((id): id is string => !!id)
    )
  );

  if (materialIds.length === 0) return new Map();

  const materialIcons = await prisma.material.findMany({
    where: { id: { in: materialIds } },
    select: { id: true, iconUrl: true },
  });

  return new Map(materialIcons.map((m) => [m.id, m.iconUrl]));
}
