import { describe, it, expect } from "vitest";
import { getCharacterTalentPriority } from "@/core/game/talent-priority";

describe("Talent Upgrade Priority System", () => {
  it("xác định chuẩn xác ưu tiên cho Furina: E = Q >> NA (Đánh thường để Lv. 1)", () => {
    const furina = {
      id: "furina",
      name: "Furina",
      weaponType: "Sword",
      vision: "Hydro",
    };
    const priority = getCharacterTalentPriority(furina);

    expect(priority.orderFormula).toContain("E = Q >> NA");
    expect(priority.items.normalAttack.canLeaveAtLevel1).toBe(true);
    expect(priority.items.elementalSkill.isCrownRecommended).toBe(true);
    expect(priority.items.elementalBurst.rank).toBe(2);
    expect(priority.summaryVi).toContain("Kỹ Năng Nguyên Tố (E)");
  });

  it("xác định chuẩn xác ưu tiên cho Neuvillette: Trọng Kích là ưu tiên số 1 (Vương Miện)", () => {
    const neuvi = {
      id: "neuvillette",
      name: "Neuvillette",
      weaponType: "Catalyst",
      vision: "Hydro",
    };
    const priority = getCharacterTalentPriority(neuvi);

    expect(priority.orderFormula).toContain("NA > Q = E");
    expect(priority.items.normalAttack.rank).toBe(1);
    expect(priority.items.normalAttack.isCrownRecommended).toBe(true);
    expect(priority.items.normalAttack.recommendationNote).toContain("Thẩm Phán Cân Bằng");
  });

  it("xác định chuẩn xác ưu tiên cho Bennett: Kỹ năng nộ Q là ưu tiên hàng đầu, Đánh thường để Lv. 1", () => {
    const bennett = {
      id: "bennett",
      name: "Bennett",
      weaponType: "Sword",
      vision: "Pyro",
    };
    const priority = getCharacterTalentPriority(bennett);

    expect(priority.orderFormula).toContain("Q > E >> NA");
    expect(priority.items.elementalBurst.rank).toBe(1);
    expect(priority.items.elementalBurst.isCrownRecommended).toBe(true);
    expect(priority.items.normalAttack.canLeaveAtLevel1).toBe(true);
  });

  it("xác định chuẩn xác ưu tiên cho Hu Tao: Nâng song song NA và E", () => {
    const hutao = {
      id: "hu-tao",
      name: "Hu Tao",
      weaponType: "Polearm",
      vision: "Pyro",
    };
    const priority = getCharacterTalentPriority(hutao);

    expect(priority.orderFormula).toContain("NA = E > Q");
    expect(priority.items.normalAttack.rank).toBe(1);
    expect(priority.items.elementalSkill.rank).toBe(2);
  });

  it("suy luận chuẩn quy luật cho nhân vật hỗ trợ/hồi máu tổng quát", () => {
    const char = {
      id: "custom-healer",
      name: "Barbara",
      weaponType: "Catalyst",
      vision: "Hydro",
    };
    const priority = getCharacterTalentPriority(char);

    expect(priority.items.normalAttack.canLeaveAtLevel1).toBe(true);
    expect(priority.items.elementalSkill.rank).toBe(1);
  });
});
