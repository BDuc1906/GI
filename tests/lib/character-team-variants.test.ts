import { describe, it, expect } from "vitest";
import { buildCharacterTeamVariants } from "@/core/game/character-team-variants";

describe("Character Team Variants System", () => {
  const mockCharMap = new Map([
    ["hu-tao", { id: "hu-tao", name: "Hu Tao", localizedName: "Hu Tao", vision: "Pyro", rarity: 5, iconUrl: "/hutao.png" }],
    ["xingqiu", { id: "xingqiu", name: "Xingqiu", localizedName: "Xingqiu", vision: "Hydro", rarity: 4, iconUrl: "/xq.png" }],
    ["yelan", { id: "yelan", name: "Yelan", localizedName: "Yelan", vision: "Hydro", rarity: 5, iconUrl: "/yelan.png" }],
    ["zhongli", { id: "zhongli", name: "Zhongli", localizedName: "Zhongli", vision: "Geo", rarity: 5, iconUrl: "/zhongli.png" }],
    ["furina", { id: "furina", name: "Furina", localizedName: "Furina", vision: "Hydro", rarity: 5, iconUrl: "/furina.png" }],
    ["xianyun", { id: "xianyun", name: "Xianyun", localizedName: "Xianyun", vision: "Anemo", rarity: 5, iconUrl: "/xianyun.png" }],
    ["chevreuse", { id: "chevreuse", name: "Chevreuse", localizedName: "Chevreuse", vision: "Pyro", rarity: 4, iconUrl: "/chev.png" }],
    ["fischl", { id: "fischl", name: "Fischl", localizedName: "Fischl", vision: "Electro", rarity: 4, iconUrl: "/fischl.png" }],
    ["bennett", { id: "bennett", name: "Bennett", localizedName: "Bennett", vision: "Pyro", rarity: 4, iconUrl: "/bennett.png" }],
    ["neuvillette", { id: "neuvillette", name: "Neuvillette", localizedName: "Neuvillette", vision: "Hydro", rarity: 5, iconUrl: "/neuvi.png" }],
    ["kazuha", { id: "kazuha", name: "Kaedehara Kazuha", localizedName: "Kaedehara Kazuha", vision: "Anemo", rarity: 5, iconUrl: "/kazuha.png" }],
    ["baizhu", { id: "baizhu", name: "Baizhu", localizedName: "Baizhu", vision: "Dendro", rarity: 5, iconUrl: "/baizhu.png" }],
    ["alhaitham", { id: "alhaitham", name: "Alhaitham", localizedName: "Alhaitham", vision: "Dendro", rarity: 5, iconUrl: "/alhaitham.png" }],
    ["nahida", { id: "nahida", name: "Nahida", localizedName: "Nahida", vision: "Dendro", rarity: 5, iconUrl: "/nahida.png" }],
    ["kuki-shinobu", { id: "kuki-shinobu", name: "Kuki Shinobu", localizedName: "Kuki Shinobu", vision: "Electro", rarity: 4, iconUrl: "/kuki.png" }],
  ]);

  it("tạo chuẩn xác 3 biến thể chiến thuật cho Hu Tao", () => {
    const hutao = { id: "hu-tao", name: "Hu Tao", vision: "Pyro", rarity: 5 };
    const variants = buildCharacterTeamVariants(hutao, mockCharMap, "vi");

    expect(variants.length).toBe(3);

    // Biến thể 1: Double Hydro Vape
    const v1 = variants[0];
    expect(v1.nameVi).toContain("Double Hydro Vape");
    expect(v1.members.length).toBe(4);
    expect(v1.members.map((m) => m.id)).toEqual(["hu-tao", "xingqiu", "yelan", "zhongli"]);
    expect(v1.reactionsVi).toContain("Bốc Hơi (x1.5)");
    expect(v1.teamBuilderUrl).toContain("/vi/tools/team-builder?team=hu-tao,xingqiu,yelan,zhongli");

    // Biến thể 2: Xianyun Plunge
    const v2 = variants[1];
    expect(v2.nameVi).toContain("Xianyun Plunge");
    expect(v2.members.map((m) => m.id)).toEqual(["hu-tao", "furina", "yelan", "xianyun"]);

    // Biến thể 3: Chevreuse Overload
    const v3 = variants[2];
    expect(v3.nameVi).toContain("Chevreuse Overload");
    expect(v3.reactionsVi).toContain("Quá Tải (x2.75)");
  });

  it("tạo chuẩn xác các biến thể chiến thuật cho Furina", () => {
    const furina = { id: "furina", name: "Furina", vision: "Hydro", rarity: 5 };
    const variants = buildCharacterTeamVariants(furina, mockCharMap, "vi");

    expect(variants.length).toBe(3);

    const v1 = variants[0];
    expect(v1.nameVi).toContain("Neuvillette Hypercarry");
    expect(v1.members.map((m) => m.id)).toEqual(["furina", "neuvillette", "kazuha", "baizhu"]);

    const v2 = variants[1];
    expect(v2.nameVi).toContain("Hu Tao Xianyun Vape");
    expect(v2.members.map((m) => m.id)).toEqual(["furina", "hu-tao", "yelan", "xianyun"]);
  });

  it("tự động suy luận sinh 3 biến thể phản ứng cho nhân vật bất kỳ trong game", () => {
    const unknownPyro = { id: "custom-pyro", name: "Custom Pyro", vision: "Pyro", rarity: 4 };
    const variants = buildCharacterTeamVariants(unknownPyro, mockCharMap, "vi");

    expect(variants.length).toBe(3);
    expect(variants[0].archetypeVi).toContain("Bốc Hơi");
    expect(variants[1].archetypeVi).toContain("Tan Chảy");
    expect(variants[2].archetypeVi).toContain("Quá Tải");

    for (const v of variants) {
      expect(v.members.length).toBe(4);
      expect(v.reactionsVi.length).toBeGreaterThan(0);
      expect(v.teamBuilderUrl).toContain("custom-pyro");
    }
  });
});
