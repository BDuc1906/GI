import { prisma } from "@/lib/prisma";
import type { Character } from "@prisma/client";

export type AscensionMaterialPhase = {
  phase: number;
  materials: Array<{
    materialId?: string | null;
    name: string | null;
    count: number | null;
  }>;
};

export type StatByLevelRow = {
  level: number;
  ascension: number | null;
  hp: number | null;
  attack: number | null;
  defense: number | null;
  specialized: number | null;
};

export type VoiceActors = {
  english?: string | null;
  chinese?: string | null;
  japanese?: string | null;
  korean?: string | null;
};

export type Talent = {
  key: string;
  name: string;
  description: string;
};

export type Constellation = {
  level?: number;
  name: string;
  description: string;
};

export type TalentMaterialLevel = {
  level: number;
  materials: Array<{
    materialId?: string | null;
    name: string | null;
    count: number | null;
  }>;
};

export const TALENT_LABEL_VI: Record<string, string> = {
  normalAttack: "Đòn Thường / Trọng Kích / Bổ Nhào",
  elementalSkill: "Kỹ Năng Nguyên Tố",
  elementalBurst: "Trọng Kích Nguyên Tố (Cực Kỹ)",
  alternateSprint: "Kỹ Năng Di Chuyển Đặc Biệt",
  passive1: "Thiên Phú Bị Động 1",
  passive2: "Thiên Phú Bị Động 2",
  passive3: "Thiên Phú Bị Động 3",
  passive4: "Thiên Phú Bị Động 4",
};

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return Math.round(n).toLocaleString("vi-VN");
}

/**
 * genshin-db trả về chỉ số phụ đột phá (specialized) dưới dạng số thô:
 * - Elemental Mastery: số nguyên thật (vd 187) -> hiển thị như formatNumber.
 * - Mọi chỉ số còn lại (Crit Rate/DMG, Energy Recharge, DMG Bonus theo hệ...)
 *   là % và genshin-db trả về dạng thập phân (vd 0.288 = 28.8%), KHÔNG phải
 *   số nguyên. Trước đây formatNumber() làm tròn thẳng -> mọi giá trị < 1
 *   bị hiển thị thành "0". Nhận biết loại chỉ số qua chuỗi ascensionStat
 *   (vd "CRIT Rate", "Energy Recharge", "Pyro DMG Bonus") có chứa "%" hay
 *   không (genshin-db luôn có "%" trong substatText cho các chỉ số dạng %).
 */
export function formatSpecialized(
  n: number | null | undefined,
  ascensionStatLabel: string | null | undefined
): string {
  if (n === null || n === undefined) return "—";
  const isFlatElementalMastery = (ascensionStatLabel ?? "")
    .toLowerCase()
    .includes("elemental mastery");
  if (isFlatElementalMastery) {
    return formatNumber(n);
  }
  return `${(n * 100).toLocaleString("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
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