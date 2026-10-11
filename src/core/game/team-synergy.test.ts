import { describe, expect, it } from "vitest";
import { ELEMENTAL_REACTIONS, ELEMENTAL_RESONANCES } from "./element-reactions-data";
import {
  TEAM_SIZE,
  availableReactions,
  availableResonances,
  suggestTeams,
  type ReactionRule,
  type ResonanceRule,
  type TeamChar,
} from "./team-synergy";

// Dùng ĐÚNG dữ liệu đã kiểm duyệt của dự án để luật không lệch với trang /elements.
const reactions: ReactionRule[] = ELEMENTAL_REACTIONS.map((r) => ({
  id: r.id,
  elements: r.elements,
  category: r.category,
  requiresCharacters: r.requiresCharacters,
}));
const resonances: ResonanceRule[] = ELEMENTAL_RESONANCES.map((r) => ({ id: r.id, element: r.element }));

const ELEMENTS = ["Pyro", "Hydro", "Cryo", "Electro", "Anemo", "Geo", "Dendro"];
const mk = (element: string, i: number, rarity = 4): TeamChar => ({
  id: `${element}-${i}`,
  name: `${element}${i}`,
  element,
  rarity,
});
const everyone: TeamChar[] = ELEMENTS.flatMap((e) => [mk(e, 1, 5), mk(e, 2), mk(e, 3)]);

describe("availableReactions", () => {
  it("Pyro + Hydro mở Bốc Hơi, chưa có Tan Chảy", () => {
    const r = availableReactions(new Set(["Pyro", "Hydro"]), reactions);
    expect(r).toContain("vaporize");
    expect(r).not.toContain("melt");
  });

  it("Khuếch Tán cần Anemo + 1 nguyên tố khác; chỉ Anemo thì không có", () => {
    expect(availableReactions(new Set(["Anemo"]), reactions)).not.toContain("swirl");
    expect(availableReactions(new Set(["Anemo", "Cryo"]), reactions)).toContain("swirl");
    expect(availableReactions(new Set(["Pyro", "Hydro"]), reactions)).not.toContain("swirl");
  });

  it("Nở Rộ cần cả Dendro + Hydro + Electro", () => {
    expect(availableReactions(new Set(["Dendro", "Hydro"]), reactions)).not.toContain("hyperbloom");
    expect(availableReactions(new Set(["Dendro", "Hydro", "Electro"]), reactions)).toContain("hyperbloom");
  });

  it("Lunar/Stellar không bao giờ được tính điểm tự động", () => {
    const r = availableReactions(new Set(ELEMENTS), reactions);
    expect(r.some((id) => id.startsWith("lunar-") || id.startsWith("stellar-"))).toBe(false);
  });
});

describe("availableResonances", () => {
  it("2 cùng nguyên tố kích hoạt cộng hưởng của nguyên tố đó", () => {
    expect(availableResonances(["Pyro", "Pyro", "Hydro", "Cryo"], resonances)).toEqual(["fervent-flames"]);
  });
  it("2 + 2 kích hoạt cả hai cộng hưởng", () => {
    expect(availableResonances(["Pyro", "Pyro", "Hydro", "Hydro"], resonances).sort()).toEqual(
      ["fervent-flames", "soothing-water"].sort()
    );
  });
  it("4 nguyên tố khác nhau mở cộng hưởng Unique, 3 thì không", () => {
    expect(availableResonances(["Pyro", "Hydro", "Cryo", "Geo"], resonances)).toEqual(["protective-canopy"]);
    expect(availableResonances(["Pyro", "Hydro", "Cryo", "Cryo"], resonances)).not.toContain("protective-canopy");
  });
});

describe("suggestTeams", () => {
  const input = { pool: everyone, reactions, resonances };

  it("luôn trả đủ 4 người, không trùng nhân vật, điểm giảm dần", () => {
    const { teams } = suggestTeams({ ...input, pinned: [everyone[0]] });
    expect(teams.length).toBeGreaterThan(1);
    for (const t of teams) {
      expect(t.slots).toHaveLength(TEAM_SIZE);
      const ids = t.slots.map((s) => s.character.id);
      expect(new Set(ids).size).toBe(TEAM_SIZE);
    }
    const scores = teams.map((t) => t.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("giữ nguyên nhân vật được ghim và đánh dấu pinned", () => {
    const main = everyone.find((c) => c.id === "Pyro-1")!;
    const { teams } = suggestTeams({ ...input, pinned: [main] });
    for (const t of teams) {
      expect(t.slots[0].character.id).toBe("Pyro-1");
      expect(t.slots[0].pinned).toBe(true);
      expect(t.slots[0].alternatives).toEqual([]);
    }
  });

  it("phương án thay thế cùng nguyên tố, nằm trong pool và không trùng người đã chọn", () => {
    const { teams } = suggestTeams({ ...input, pinned: [] });
    for (const t of teams) {
      const used = new Set(t.slots.map((s) => s.character.id));
      for (const s of t.slots) {
        for (const alt of s.alternatives) {
          expect(alt.element).toBe(s.character.element);
          expect(used.has(alt.id)).toBe(false);
        }
      }
    }
  });

  it("thiếu nguyên tố thì không bao giờ xếp nguyên tố đó vào đội và đưa ra gợi ý nâng cấp", () => {
    const noHydro = everyone.filter((c) => c.element !== "Hydro");
    const main = noHydro.find((c) => c.id === "Pyro-1")!;
    const res = suggestTeams({ pool: noHydro, pinned: [main], universe: everyone, reactions, resonances });
    for (const t of res.teams) expect(t.elements).not.toContain("Hydro");
    const hint = res.hints.find((h) => h.element === "Hydro");
    expect(hint).toBeDefined();
    expect(hint!.toScore).toBeGreaterThan(hint!.fromScore);
    expect(hint!.newReactions).toContain("vaporize");
  });

  it("roster quá nhỏ thì báo rõ thay vì trả đội thiếu người", () => {
    const res = suggestTeams({ pool: everyone.slice(0, 2), reactions, resonances });
    expect(res.teams).toEqual([]);
    expect(res.note).toBeTruthy();
  });

  it("ghim đủ 4 người thì chỉ trả đúng đội đó", () => {
    const four = [everyone[0], everyone[3], everyone[6], everyone[9]];
    const res = suggestTeams({ ...input, pinned: four });
    expect(res.teams).toHaveLength(1);
    expect(res.teams[0].slots.map((s) => s.character.id)).toEqual(four.map((c) => c.id));
  });

  it("kết quả không phụ thuộc thứ tự đầu vào (xác định)", () => {
    const a = suggestTeams({ ...input, pinned: [everyone[0]] });
    const b = suggestTeams({ ...input, pool: [...everyone].reverse(), pinned: [everyone[0]] });
    expect(b.teams.map((t) => t.score)).toEqual(a.teams.map((t) => t.score));
    expect(b.teams.map((t) => t.elements.join())).toEqual(a.teams.map((t) => t.elements.join()));
  });

  it("bỏ qua nhân vật có nguyên tố không hợp lệ như None (Aether/Lumine...)", () => {
    const withNone: TeamChar[] = [...everyone, { id: "aether", name: "Aether", element: "None", rarity: 5 }];
    const { teams } = suggestTeams({ pool: withNone, pinned: [], reactions, resonances });
    for (const t of teams) {
      expect(t.slots.every((s) => s.character.id !== "aether")).toBe(true);
      expect(t.elements).not.toContain("None");
    }
  });

  describe("chế độ tập trung vào một phản ứng", () => {
    const main = everyone.find((c) => c.id === "Pyro-1")!;
    const focused = suggestTeams({ ...input, pinned: [main], focus: "vaporize" });

    it("mọi đội đều mở được phản ứng đã chọn", () => {
      expect(focused.teams.length).toBeGreaterThan(0);
      for (const t of focused.teams) expect(t.reactions).toContain("vaporize");
    });

    it("đội đầu tiên dồn nhiều thành viên nhất vào Pyro/Hydro và có cộng hưởng", () => {
      const top = focused.teams[0];
      const contributors = top.slots.filter((s) => ["Pyro", "Hydro"].includes(s.character.element)).length;
      expect(contributors).toBe(4); // pool có đủ 3 Hydro + Pyro khác ngoài người ghim
      expect(top.resonances).toEqual(expect.arrayContaining(["fervent-flames", "soothing-water"]));
    });

    it("khác chế độ phủ rộng: đội phủ rộng không cần dồn vào Bốc Hơi", () => {
      const broad = suggestTeams({ ...input, pinned: [main] });
      expect(broad.teams[0].elements.length).toBe(4);
      expect(focused.teams[0].elements.length).toBeLessThan(4);
    });

    it("không có nhân vật Hydro trong roster thì không đội nào mở được Bốc Hơi và có thông báo", () => {
      const noHydro = everyone.filter((c) => c.element !== "Hydro");
      const res = suggestTeams({ pool: noHydro, pinned: [main], focus: "vaporize", reactions, resonances });
      expect(res.teams).toEqual([]);
      expect(res.note).toMatch(/phản ứng/);
    });

    it("focus là Lunar/không tồn tại thì quay về chế độ phủ rộng", () => {
      const a = suggestTeams({ ...input, pinned: [main], focus: "lunar-charged" });
      const b = suggestTeams({ ...input, pinned: [main] });
      expect(a.teams.map((t) => t.score)).toEqual(b.teams.map((t) => t.score));
      const c = suggestTeams({ ...input, pinned: [main], focus: "khong-ton-tai" });
      expect(c.teams.map((t) => t.score)).toEqual(b.teams.map((t) => t.score));
    });
  });
});
