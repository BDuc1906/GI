import { describe, expect, it } from "vitest";
import { findNearestLevelRow, resolveTalentMultiplier } from "@/app/api/tools/dps/route";

const characterRows = [
  { level: 1, ascension: 0, hp: 1000, attack: 20, defense: 60 },
  { level: 20, ascension: 0, hp: 2000, attack: 40, defense: 120 },
  { level: 20, ascension: 1, hp: 2200, attack: 44, defense: 130 },
  { level: 40, ascension: 2, hp: 3500, attack: 70, defense: 200 },
  { level: 90, ascension: 6, hp: 12000, attack: 300, defense: 700 },
];

describe("findNearestLevelRow — chọn dòng statsByLevel khớp nhất để tính DPS", () => {
  it("level khớp chính xác, chỉ có 1 dòng -> trả đúng dòng đó", () => {
    const row = findNearestLevelRow(characterRows, 40);
    expect(row?.level).toBe(40);
    expect(row?.hp).toBe(3500);
  });

  it("level khớp chính xác nhưng có 2 dòng (trước/sau đột phá) -> ưu tiên ascension cao hơn", () => {
    const row = findNearestLevelRow(characterRows, 20);
    expect(row?.ascension).toBe(1); // không phải 0
    expect(row?.hp).toBe(2200);
  });

  it("level không khớp chính xác -> lấy dòng gần nhất NHỎ HƠN HOẶC BẰNG target", () => {
    // level 55 không có trong bảng -> phải lấy dòng level 40 (gần nhất bên dưới),
    // KHÔNG được lấy dòng level 90 (vượt quá target -> stats sai, quá cao).
    const row = findNearestLevelRow(characterRows, 55);
    expect(row?.level).toBe(40);
  });

  it("target thấp hơn mọi level trong bảng -> lấy dòng thấp nhất có sẵn", () => {
    const row = findNearestLevelRow(characterRows, 0);
    expect(row?.level).toBe(1);
  });

  it("target cao hơn mọi level trong bảng (vd 90 khi bảng chỉ có tới 85) -> lấy dòng cao nhất", () => {
    const rowsWithout90 = characterRows.filter((r) => r.level !== 90);
    const row = findNearestLevelRow(rowsWithout90, 90);
    expect(row?.level).toBe(40);
  });

  it("bảng rỗng hoặc null -> trả null, không throw", () => {
    expect(findNearestLevelRow([], 90)).toBeNull();
    expect(findNearestLevelRow(null as unknown as typeof characterRows, 90)).toBeNull();
  });
});

describe("resolveTalentMultiplier — lấy % ATK thật theo cấp thiên phú (KHÔNG dùng cấp độ thô làm hệ số nhân)", () => {
  // Dữ liệu thật của Diluc combat1 (Normal Attack), lấy trực tiếp từ
  // genshin-db lúc audit — param1[9] (index 0 = cấp 1) = cấp 10.
  const dilucNormalAttack = {
    attributes: {
      parameters: {
        param1: [
          0.89698, 0.96999, 1.043, 1.1473, 1.22031, 1.30375, 1.41848, 1.53321, 1.64794, 1.7731, 1.916513, 2.085166,
          2.253819, 2.422472,
        ],
      },
    },
  };

  it("cấp 10 trả đúng giá trị thật trong bảng (1.7731 = 177.31% ATK), KHÔNG PHẢI số 10", () => {
    const result = resolveTalentMultiplier(dilucNormalAttack, 10);
    expect(result).toBeCloseTo(1.7731, 5);
    expect(result).not.toBe(10); // xác nhận KHÔNG còn bug "dùng cấp độ làm hệ số"
  });

  it("cấp 1 trả phần tử đầu mảng", () => {
    expect(resolveTalentMultiplier(dilucNormalAttack, 1)).toBeCloseTo(0.89698, 5);
  });

  it("cấp vượt quá số phần tử có trong bảng (vd 15 khi bảng chỉ có 14) -> lấy phần tử cuối, không crash", () => {
    expect(resolveTalentMultiplier(dilucNormalAttack, 15)).toBeCloseTo(2.422472, 5);
  });

  it("combat data undefined hoặc thiếu param1 -> trả null (route sẽ trả lỗi rõ ràng thay vì tính sai)", () => {
    expect(resolveTalentMultiplier(undefined, 10)).toBeNull();
    expect(resolveTalentMultiplier({ attributes: {} }, 10)).toBeNull();
  });
});
