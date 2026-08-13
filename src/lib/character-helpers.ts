import { prisma } from "@/lib/prisma";
import type { Character } from "@prisma/client";
import {
  formatNumber,
  formatSpecialized,
  type StatByLevelRow,
} from "@/lib/character-stats-format";

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

// formatNumber/formatSpecialized/StatByLevelRow: xem character-stats-format.ts
// (re-export ở đầu file) — logic thật nằm ở đó, không định nghĩa lại ở đây.
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
    boySplash: boy?.splashUrl || boy?.iconUrl || null,
    girlSplash: girl?.splashUrl || girl?.iconUrl || null,
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