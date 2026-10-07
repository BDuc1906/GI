/**
 * Tính nguyên liệu đột phá / thiên phú từ dữ liệu THẬT đã seed trong DB
 * (`Character.ascensionMaterials`, `Character.talentMaterials`,
 * `Domain.materials`) — thay cho các bảng hardcode giả trong
 * `material-calculator.ts` (tên như "Jewel Sliver", "Local Specialty",
 * "Boss Material" không phải vật liệu thật của bất kỳ nhân vật nào).
 *
 * KHÔNG bịa số liệu không có nguồn: không ước lượng resin/số ngày farm
 * (cần tỉ lệ rớt thật mà DB không có) — chỉ trả những gì suy ra được
 * chính xác từ dữ liệu: tổng nguyên liệu và bí cảnh thật có rớt chúng.
 */

export interface RawMaterialRef {
  materialId?: string;
  name: string;
  count: number | null;
}

export interface RawAscensionPhase {
  phase: number;
  materials: RawMaterialRef[];
}

export interface RawTalentLevel {
  level: number;
  materials: RawMaterialRef[];
}

export interface PlanMaterial {
  materialId?: string;
  name: string;
  quantity: number;
}

export interface RawDomain {
  id: string;
  name: string;
  category: string;
  daysOfWeek: string[];
  materials: Array<{ name?: string }> | null;
}

export interface MatchedDomain {
  id: string;
  name: string;
  category: string;
  daysOfWeek: string[];
  dropsMaterials: string[];
}

// Cấp tối đa MỞ RA sau mỗi lần đột phá: phase k (1-6) là lần đột phá đưa
// nhân vật từ cấp trần cũ lên cấp trần kế tiếp. Trần trước phase k lần
// lượt là 20, 40, 50, 60, 70, 80 (sau phase 6 trần là 90).
const ASCENSION_CAPS = [20, 40, 50, 60, 70, 80] as const;

function addMaterials(target: Map<string, PlanMaterial>, refs: RawMaterialRef[]): void {
  for (const ref of refs) {
    if (!ref?.name || ref.count == null) continue;
    const existing = target.get(ref.name);
    if (existing) {
      existing.quantity += ref.count;
    } else {
      target.set(ref.name, { materialId: ref.materialId, name: ref.name, quantity: ref.count });
    }
  }
}

/**
 * Phase k cần thiết nếu nhân vật đang ở cấp <= trần_k (chưa đột phá qua
 * mốc đó) VÀ mục tiêu > trần_k. Nhân vật đúng cấp trần (vd đang 20/20) coi
 * là CHƯA đột phá mốc đó (phải đột phá mới lên tiếp được) — cách hiểu bảo
 * thủ, nếu ngược lại người dùng đã đột phá rồi thì kết quả chỉ dư 1 phase.
 */
export function buildAscensionPlan(
  phases: RawAscensionPhase[] | null | undefined,
  currentLevel: number,
  targetLevel: number
): PlanMaterial[] | null {
  if (!phases || phases.length === 0) return null;
  const totals = new Map<string, PlanMaterial>();
  for (const phase of phases) {
    const cap = ASCENSION_CAPS[phase.phase - 1];
    if (cap === undefined) continue;
    if (currentLevel <= cap && targetLevel > cap) {
      addMaterials(totals, phase.materials);
    }
  }
  return Array.from(totals.values());
}

export interface TalentTargets {
  normalAttack: number;
  elementalSkill: number;
  elementalBurst: number;
}

/**
 * Nguyên liệu thiên phú: mỗi cấp từ (hiện tại+1) tới mục tiêu cho MỖI
 * trong 3 thiên phú (đòn thường/kỹ năng/nộ) — 3 thiên phú tốn nguyên liệu
 * giống nhau theo cấp nên nhân theo số thiên phú cần nâng ở cấp đó.
 */
export function buildTalentPlan(
  levels: RawTalentLevel[] | null | undefined,
  current: TalentTargets,
  target: TalentTargets
): PlanMaterial[] | null {
  if (!levels || levels.length === 0) return null;
  const byLevel = new Map(levels.map((l) => [l.level, l.materials]));
  const totals = new Map<string, PlanMaterial>();
  const keys: Array<keyof TalentTargets> = ["normalAttack", "elementalSkill", "elementalBurst"];
  for (const key of keys) {
    for (let level = current[key] + 1; level <= target[key]; level++) {
      const refs = byLevel.get(level);
      if (refs) addMaterials(totals, refs);
    }
  }
  return Array.from(totals.values());
}

/**
 * Bí cảnh THẬT có rớt ít nhất 1 nguyên liệu trong danh sách cần (khớp
 * theo tên, không phân biệt hoa thường). Chỉ xét bí cảnh vũ khí/thiên
 * phú (bí cảnh thánh di vật trả về bộ thánh di vật, không phải nguyên
 * liệu). Kèm `daysOfWeek` thật của bí cảnh.
 */
export function matchDomains(domains: RawDomain[], neededNames: string[]): MatchedDomain[] {
  const needed = new Set(neededNames.map((n) => n.toLowerCase()));
  const result: MatchedDomain[] = [];
  for (const domain of domains) {
    if (domain.category === "artifact" || !Array.isArray(domain.materials)) continue;
    const drops = domain.materials
      .map((m) => m?.name)
      .filter((n): n is string => typeof n === "string" && needed.has(n.toLowerCase()));
    if (drops.length > 0) {
      result.push({
        id: domain.id,
        name: domain.name,
        category: domain.category,
        daysOfWeek: domain.daysOfWeek,
        dropsMaterials: drops,
      });
    }
  }
  return result;
}
