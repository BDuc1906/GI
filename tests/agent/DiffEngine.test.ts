// tests/agent/DiffEngine.test.ts
import { describe, expect, it } from "vitest";
import { DiffEngine } from "@/lib/sync/DiffEngine";

describe("DiffEngine.diff", () => {
  it("không báo diff khi live rỗng (không có gì để so sánh)", () => {
    const result = DiffEngine.diff({ baseAtk: 100 }, null);
    expect(result.hasDiff).toBe(false);
    expect(result.fields).toEqual([]);
  });

  it("coi mọi field của live là diff khi local chưa tồn tại", () => {
    const result = DiffEngine.diff(null, { baseAtk: 100, name: "Kazuha" });
    expect(result.hasDiff).toBe(true);
    expect(result.fields).toHaveLength(2);
  });

  it("bỏ qua field mà live trả về undefined (provider không cover field đó)", () => {
    const result = DiffEngine.diff({ baseAtk: 100, baseHp: 5000 }, { baseAtk: 100, baseHp: undefined });
    expect(result.hasDiff).toBe(false);
  });

  it("phát hiện đúng field lệch giá trị nguyên thuỷ", () => {
    const result = DiffEngine.diff({ baseAtk: 100, name: "Kazuha" }, { baseAtk: 105, name: "Kazuha" });
    expect(result.hasDiff).toBe(true);
    expect(result.fields).toEqual([{ field: "baseAtk", local: 100, live: 105 }]);
  });

  it("so sánh object lồng nhau không phân biệt thứ tự key", () => {
    const local = { statsByLevel: [{ level: 1, hp: 100, attack: 20 }] };
    const live = { statsByLevel: [{ attack: 20, hp: 100, level: 1 }] };
    const result = DiffEngine.diff(local, live);
    expect(result.hasDiff).toBe(false);
  });

  it("phát hiện lệch trong object lồng nhau khi giá trị thật sự khác", () => {
    const local = { statsByLevel: [{ level: 1, hp: 100 }] };
    const live = { statsByLevel: [{ level: 1, hp: 999 }] };
    const result = DiffEngine.diff(local, live);
    expect(result.hasDiff).toBe(true);
    expect(result.fields[0].field).toBe("statsByLevel");
  });

  it("không báo diff khi cả 2 giá trị đều null", () => {
    const result = DiffEngine.diff({ description: null }, { description: null });
    expect(result.hasDiff).toBe(false);
  });
});
