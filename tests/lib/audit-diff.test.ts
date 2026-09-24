import { describe, expect, it } from "vitest";
import { diffRecords } from "../../scripts/lib/audit-diff";

describe("diffRecords — so sánh record cũ/mới để ghi AuditLog kiểu wiki-revision", () => {
  it("record mới hoàn toàn (oldRecord = null) -> không có field nào trong changedFields", () => {
    const result = diffRecords(null, { name: "Diluc", baseAtk: 41 });
    expect(result.changedFields).toEqual([]);
    expect(result.old).toEqual({});
    expect(result.new).toEqual({});
  });

  it("không có gì thay đổi -> changedFields rỗng", () => {
    const record = { name: "Diluc", baseAtk: 41, description: "..." };
    const result = diffRecords(record, { ...record });
    expect(result.changedFields).toEqual([]);
  });

  it("1 field số thay đổi (vd ATK rebalance) -> phát hiện đúng field, đúng giá trị cũ/mới", () => {
    const result = diffRecords(
      { name: "Diluc", baseAtk: 41 },
      { name: "Diluc", baseAtk: 44 }
    );
    expect(result.changedFields).toEqual(["baseAtk"]);
    expect(result.old).toEqual({ baseAtk: 41 });
    expect(result.new).toEqual({ baseAtk: 44 });
  });

  it("nhiều field thay đổi cùng lúc -> phát hiện đủ tất cả", () => {
    const result = diffRecords(
      { name: "Diluc", baseAtk: 41, rarity: 4 },
      { name: "Diluc", baseAtk: 44, rarity: 5 }
    );
    expect(result.changedFields.sort()).toEqual(["baseAtk", "rarity"]);
  });

  it("field JSON lồng nhau thay đổi (vd statsByLevel) -> vẫn phát hiện được", () => {
    const result = diffRecords(
      { statsByLevel: { "1": { hp: 100 } } },
      { statsByLevel: { "1": { hp: 105 } } }
    );
    expect(result.changedFields).toEqual(["statsByLevel"]);
  });

  it("field trong ignoreFields (updatedAt/createdAt) không được tính dù có đổi", () => {
    const result = diffRecords(
      { name: "Diluc", updatedAt: "2026-01-01" },
      { name: "Diluc", updatedAt: "2026-09-22" }
    );
    expect(result.changedFields).toEqual([]);
  });

  it("field mới xuất hiện ở newRecord (không có ở oldRecord) vẫn được phát hiện", () => {
    const result = diffRecords({ name: "Diluc" }, { name: "Diluc", gameVersion: "1.0" });
    expect(result.changedFields).toEqual(["gameVersion"]);
    expect(result.new).toEqual({ gameVersion: "1.0" });
  });
});
