import { describe, it, expect } from "vitest";

describe("Enka.Network Fight Props Parsing", () => {
  it("chuyển đổi chuẩn xác fightPropMap sang phần trăm và số nguyên", () => {
    const rawFightProps = {
      "2000": 19542.45, // HP
      "2001": 2150.12,  // ATK
      "2002": 820.65,   // DEF
      "20": 0.684,      // Crit Rate (68.4%)
      "22": 1.722,      // Crit DMG (172.2%)
      "28": 165.0,      // EM
      "23": 1.352,      // ER (135.2%)
    };

    const parsed = {
      hp: Math.round(rawFightProps["2000"] ?? 0),
      atk: Math.round(rawFightProps["2001"] ?? 0),
      def: Math.round(rawFightProps["2002"] ?? 0),
      critRate: parseFloat(((rawFightProps["20"] ?? 0) * 100).toFixed(1)),
      critDmg: parseFloat(((rawFightProps["22"] ?? 0) * 100).toFixed(1)),
      em: Math.round(rawFightProps["28"] ?? 0),
      er: parseFloat(((rawFightProps["23"] ?? 1) * 100).toFixed(1)),
    };

    expect(parsed.hp).toBe(19542);
    expect(parsed.atk).toBe(2150);
    expect(parsed.def).toBe(821);
    expect(parsed.critRate).toBe(68.4);
    expect(parsed.critDmg).toBe(172.2);
    expect(parsed.em).toBe(165);
    expect(parsed.er).toBe(135.2);
  });

  it("validate UID chỉ chấp nhận đúng 9 chữ số", () => {
    const isValidUid = (uid: string) => /^\d{9}$/.test(uid);

    expect(isValidUid("812345678")).toBe(true);
    expect(isValidUid("81234567")).toBe(false);   // 8 số
    expect(isValidUid("8123456789")).toBe(false);  // 10 số
    expect(isValidUid("81234abcd")).toBe(false);   // có chữ
    expect(isValidUid("-81234567")).toBe(false);   // số âm
  });

  it("tính chuẩn xác Crit Value (CV = 2 * CR + CD) và phân loại rank từng mảnh", () => {
    const calculateCv = (critRate: number, critDmg: number) => {
      const cv = parseFloat((2 * critRate + critDmg).toFixed(1));
      let rating = "Bình Thường";
      if (cv >= 45) rating = "Kỳ Lân (Unicorn)";
      else if (cv >= 35) rating = "Cực Phẩm (God Roll)";
      else if (cv >= 25) rating = "Rất Tốt (Great)";
      else if (cv >= 15) rating = "Khá (Good)";
      return { cv, rating };
    };

    // God roll piece: 10.5% CR, 26.4% CD -> 47.4 CV (Kỳ Lân)
    const godPiece = calculateCv(10.5, 26.4);
    expect(godPiece.cv).toBe(47.4);
    expect(godPiece.rating).toBe("Kỳ Lân (Unicorn)");

    // Good roll piece: 7.0% CR, 21.0% CD -> 35.0 CV (Cực Phẩm)
    const greatPiece = calculateCv(7.0, 21.0);
    expect(greatPiece.cv).toBe(35.0);
    expect(greatPiece.rating).toBe("Cực Phẩm (God Roll)");

    // Decent piece: 3.9% CR, 14.8% CD -> 22.6 CV (Khá)
    const decentPiece = calculateCv(3.9, 14.8);
    expect(decentPiece.cv).toBe(22.6);
    expect(decentPiece.rating).toBe("Khá (Good)");
  });

  it("phân loại chuẩn xác tổng điểm CV của nhân vật theo thang điểm Akasha/Genshin", () => {
    const classifyTotalCv = (totalCv: number) => {
      if (totalCv >= 220) return "Đỉnh Cao (Top 1%)";
      if (totalCv >= 180) return "Cực Phẩm (Endgame)";
      if (totalCv >= 140) return "Chuẩn Thi Đấu";
      return "Đang Hoàn Thiện";
    };

    expect(classifyTotalCv(228.5)).toBe("Đỉnh Cao (Top 1%)");
    expect(classifyTotalCv(195.2)).toBe("Cực Phẩm (Endgame)");
    expect(classifyTotalCv(155.0)).toBe("Chuẩn Thi Đấu");
    expect(classifyTotalCv(120.4)).toBe("Đang Hoàn Thiện");
  });
});
