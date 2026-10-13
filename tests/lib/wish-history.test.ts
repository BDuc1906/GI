import { describe, it, expect } from "vitest";

describe("Wish History Pity Calculation", () => {
  it("tính toán đúng pity cho lượt quay 5 sao đầu tiên", () => {
    // Giả lập danh sách lượt quay (từ mới tới cũ)
    const mockWishes = [
      { id: "10", rankType: "3" },
      { id: "9", rankType: "3" },
      { id: "8", rankType: "5" }, // 5 sao tại roll thứ 8
      { id: "7", rankType: "4" },
      { id: "6", rankType: "3" },
      { id: "5", rankType: "3" },
      { id: "4", rankType: "3" },
      { id: "3", rankType: "3" },
      { id: "2", rankType: "3" },
      { id: "1", rankType: "3" },
    ];

    // Logic tính pity từ cũ (dưới cùng) tới mới (trên cùng)
    const asc = [...mockWishes].reverse();
    let pity = 0;
    const withPity = asc.map((w) => {
      pity++;
      const res = { ...w, pity };
      if (w.rankType === "5") {
        pity = 0;
      }
      return res;
    }).reverse();

    // Roll #8 là 5 sao, tính từ roll #1 đến #8 là đúng 8 rolls
    const fiveStar = withPity.find((w) => w.id === "8");
    expect(fiveStar?.pity).toBe(8);

    // Roll #10 là roll mới nhất, sau 5 sao (id 8) có 2 roll (id 9, 10)
    const currentPity = withPity.findIndex((w) => w.rankType === "5");
    expect(currentPity).toBe(2);
  });

  it("nhận diện đúng soft pity khi vượt qua mốc 74 cho nhân vật", () => {
    const currentPityNormal = 60;
    const currentPitySoft = 75;
    const isSoftPity = (p: number) => p >= 74;

    expect(isSoftPity(currentPityNormal)).toBe(false);
    expect(isSoftPity(currentPitySoft)).toBe(true);
  });

  it("tính đúng số Nguyên Thạch quy đổi tương đương", () => {
    const totalWishes = 180;
    const primoCost = totalWishes * 160;
    expect(primoCost).toBe(28800);
  });
});
