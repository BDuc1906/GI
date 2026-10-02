import { describe, expect, it } from "vitest";
import { isNonPlayableSpecialCharacter } from "../../scripts/lib/genshin-pure-helpers";

describe("isNonPlayableSpecialCharacter — lọc NPC sự kiện khỏi danh sách nhân vật chơi được", () => {
  it("Manekin (NPC sự kiện Miliastra Wonderland, title rỗng) -> true (loại)", () => {
    expect(isNonPlayableSpecialCharacter({ qualityType: "QUALITY_ORANGE_SP", title: "" })).toBe(true);
  });

  it("Aloy (nhân vật giao thoa THẬT, title đầy đủ dù cùng qualityType _SP) -> false (giữ)", () => {
    expect(
      isNonPlayableSpecialCharacter({ qualityType: "QUALITY_ORANGE_SP", title: "Savior From Another World" })
    ).toBe(false);
  });

  it("Aether/Lumine (Traveler — title rỗng NHƯNG qualityType không có hậu tố _SP) -> false (giữ)", () => {
    expect(isNonPlayableSpecialCharacter({ qualityType: "QUALITY_ORANGE", title: "" })).toBe(false);
  });

  it("nhân vật thường (qualityType không _SP, title đầy đủ) -> false (giữ)", () => {
    expect(isNonPlayableSpecialCharacter({ qualityType: "QUALITY_ORANGE", title: "Dawn..." })).toBe(false);
  });

  it("qualityType không phải string hoặc thiếu field -> không throw, trả false", () => {
    expect(isNonPlayableSpecialCharacter({})).toBe(false);
    expect(isNonPlayableSpecialCharacter({ qualityType: undefined, title: undefined })).toBe(false);
  });
});
