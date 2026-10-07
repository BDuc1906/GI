import { describe, expect, it } from "vitest";
import {
  buildAscensionPlan,
  buildTalentPlan,
  matchDomains,
  type RawAscensionPhase,
  type RawTalentLevel,
} from "@/core/game/real-material-plan";

// Dữ liệu thật của Diluc (rút gọn) lấy từ genshin-db lúc audit.
const dilucPhases: RawAscensionPhase[] = [
  { phase: 1, materials: [{ name: "Mora", count: 20000 }, { name: "Agnidus Agate Sliver", count: 1 }] },
  { phase: 2, materials: [{ name: "Mora", count: 40000 }, { name: "Agnidus Agate Fragment", count: 3 }] },
  { phase: 3, materials: [{ name: "Mora", count: 60000 }, { name: "Agnidus Agate Fragment", count: 6 }] },
  { phase: 4, materials: [{ name: "Mora", count: 80000 }, { name: "Agnidus Agate Chunk", count: 3 }] },
  { phase: 5, materials: [{ name: "Mora", count: 100000 }, { name: "Agnidus Agate Chunk", count: 6 }] },
  { phase: 6, materials: [{ name: "Mora", count: 120000 }, { name: "Agnidus Agate Gemstone", count: 6 }] },
];

const qty = (plan: ReturnType<typeof buildAscensionPlan>, name: string) =>
  plan?.find((m) => m.name === name)?.quantity;

describe("buildAscensionPlan — nguyên liệu đột phá từ dữ liệu thật", () => {
  it("1 -> 90 cộng đủ cả 6 phase (Mora = 420.000, đúng tổng thật của game)", () => {
    const plan = buildAscensionPlan(dilucPhases, 1, 90);
    expect(qty(plan, "Mora")).toBe(20000 + 40000 + 60000 + 80000 + 100000 + 120000);
    expect(qty(plan, "Agnidus Agate Fragment")).toBe(9); // 3 + 6 cộng dồn
  });

  it("tên nguyên liệu là tên THẬT, không phải placeholder", () => {
    const plan = buildAscensionPlan(dilucPhases, 1, 90)!;
    expect(plan.some((m) => m.name.includes("Jewel") || m.name === "Local Specialty" || m.name === "Boss Material")).toBe(false);
    expect(plan.some((m) => m.name === "Agnidus Agate Sliver")).toBe(true);
  });

  it("mục tiêu đúng bằng trần (20) thì CHƯA cần đột phá phase 1", () => {
    const plan = buildAscensionPlan(dilucPhases, 1, 20);
    expect(plan).toEqual([]);
  });

  it("mục tiêu 21 cần phase 1 (vượt trần 20)", () => {
    const plan = buildAscensionPlan(dilucPhases, 1, 21);
    expect(qty(plan, "Mora")).toBe(20000);
  });

  it("đang ở cấp 50, mục tiêu 90 -> chỉ cần phase 4,5,6 (bỏ 1-3 đã qua)", () => {
    const plan = buildAscensionPlan(dilucPhases, 51, 90);
    expect(qty(plan, "Mora")).toBe(80000 + 100000 + 120000);
    expect(qty(plan, "Agnidus Agate Sliver")).toBeUndefined();
  });

  it("thiếu dữ liệu -> trả null (route báo lỗi rõ thay vì tính sai)", () => {
    expect(buildAscensionPlan(null, 1, 90)).toBeNull();
    expect(buildAscensionPlan([], 1, 90)).toBeNull();
  });

  it("bỏ qua nguyên liệu có count null, không crash", () => {
    const plan = buildAscensionPlan([{ phase: 1, materials: [{ name: "X", count: null }, { name: "Y", count: 2 }] }], 1, 30);
    expect(plan).toEqual([{ materialId: undefined, name: "Y", quantity: 2 }]);
  });
});

describe("buildTalentPlan — nguyên liệu thiên phú", () => {
  const levels: RawTalentLevel[] = [
    { level: 2, materials: [{ name: "Teachings of Resistance", count: 3 }, { name: "Mora", count: 12500 }] },
    { level: 3, materials: [{ name: "Guide to Resistance", count: 2 }, { name: "Mora", count: 17500 }] },
  ];
  const ones = { normalAttack: 1, elementalSkill: 1, elementalBurst: 1 };

  it("nâng cả 3 thiên phú 1 -> 3 thì nhân đủ 3 lần mỗi cấp", () => {
    const plan = buildTalentPlan(levels, ones, { normalAttack: 3, elementalSkill: 3, elementalBurst: 3 })!;
    expect(plan.find((m) => m.name === "Teachings of Resistance")?.quantity).toBe(9);
    expect(plan.find((m) => m.name === "Mora")?.quantity).toBe(3 * (12500 + 17500));
  });

  it("chỉ nâng 1 thiên phú thì chỉ tính 1 lần", () => {
    const plan = buildTalentPlan(levels, ones, { normalAttack: 2, elementalSkill: 1, elementalBurst: 1 })!;
    expect(plan.find((m) => m.name === "Teachings of Resistance")?.quantity).toBe(3);
  });

  it("thiếu dữ liệu -> null", () => {
    expect(buildTalentPlan(undefined, ones, ones)).toBeNull();
  });
});

describe("matchDomains — bí cảnh thật có rớt nguyên liệu cần", () => {
  const domains = [
    { id: "a", name: "Forsaken Rift", category: "talent", daysOfWeek: ["Monday", "Thursday", "Sunday"], materials: [{ name: "Teachings of Resistance" }] },
    { id: "b", name: "Cecilia Garden", category: "weapon", daysOfWeek: ["Tuesday"], materials: [{ name: "Tile of Decarabian's Tower" }] },
    { id: "c", name: "Artifact Dom", category: "artifact", daysOfWeek: [], materials: [{ name: "Teachings of Resistance" }] },
  ];

  it("chỉ trả bí cảnh rớt thứ cần, kèm ngày mở thật", () => {
    const result = matchDomains(domains, ["teachings of resistance"]); // không phân biệt hoa thường
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Forsaken Rift");
    expect(result[0].daysOfWeek).toEqual(["Monday", "Thursday", "Sunday"]);
  });

  it("loại bí cảnh thánh di vật dù trùng tên", () => {
    expect(matchDomains(domains, ["Teachings of Resistance"]).some((d) => d.id === "c")).toBe(false);
  });

  it("không khớp gì -> mảng rỗng", () => {
    expect(matchDomains(domains, ["Không tồn tại"])).toEqual([]);
  });
});
