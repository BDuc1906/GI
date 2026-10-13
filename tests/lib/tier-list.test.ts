import { describe, expect, it } from "vitest";
import {
  META_TIER_LIST,
  getCharacterTierInfo,
  ROLE_LABELS,
  TIER_CONFIG,
  type MetaRole,
  type MetaTier,
} from "@/core/game/tier-list-data";

describe("META_TIER_LIST — Kiểm tra tính toàn vẹn dữ liệu Bảng Xếp Hạng Meta", () => {
  it("toàn bộ nhân vật trong tier list có characterId hợp lệ và duy nhất (không trùng lặp)", () => {
    const ids = META_TIER_LIST.map((c) => c.characterId);
    expect(ids.length).toBeGreaterThanOrEqual(30);

    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("mỗi nhân vật đều có tier hợp lệ (SS, S, A, B, C) cho cả La Hoàn và Nhà Hát", () => {
    const validTiers: MetaTier[] = ["SS", "S", "A", "B", "C"];
    for (const entry of META_TIER_LIST) {
      expect(validTiers).toContain(entry.tier);
      expect(validTiers).toContain(entry.theaterTier);
      expect(entry.summaryVi.length).toBeGreaterThan(10);
      expect(entry.prosVi.length).toBeGreaterThan(0);
      expect(entry.consVi.length).toBeGreaterThan(0);
    }
  });

  it("mỗi nhân vật đều có vai trò hợp lệ trong hệ thống 4 role cốt lõi", () => {
    const validRoles: MetaRole[] = ["main_dps", "sub_dps", "support", "sustain"];
    for (const entry of META_TIER_LIST) {
      expect(validRoles).toContain(entry.primaryRole);
      expect(entry.roles.length).toBeGreaterThan(0);
      for (const r of entry.roles) {
        expect(validRoles).toContain(r);
      }
    }
  });

  it("các nhân vật meta hàng đầu phải đạt Tier SS đúng chuẩn game hiện tại", () => {
    const furina = getCharacterTierInfo("furina");
    const neuvillette = getCharacterTierInfo("neuvillette");
    const kazuha = getCharacterTierInfo("kaedehara-kazuha");
    const nahida = getCharacterTierInfo("nahida");
    const zhongli = getCharacterTierInfo("zhongli");
    const bennett = getCharacterTierInfo("bennett");

    expect(furina?.tier).toBe("SS");
    expect(neuvillette?.tier).toBe("SS");
    expect(kazuha?.tier).toBe("SS");
    expect(nahida?.tier).toBe("SS");
    expect(zhongli?.tier).toBe("SS");
    expect(bennett?.tier).toBe("SS");
  });

  it("getCharacterTierInfo trả về null cho ID không tồn tại", () => {
    expect(getCharacterTierInfo("unknown_character_123")).toBeNull();
  });

  it("TIER_CONFIG và ROLE_LABELS định nghĩa đầy đủ mọi nhãn tiếng Việt và badge", () => {
    const tiers: MetaTier[] = ["SS", "S", "A", "B", "C"];
    for (const t of tiers) {
      expect(TIER_CONFIG[t]).toBeDefined();
      expect(TIER_CONFIG[t].labelVi).toContain(t);
    }

    const roles: MetaRole[] = ["main_dps", "sub_dps", "support", "sustain"];
    for (const r of roles) {
      expect(ROLE_LABELS[r]).toBeDefined();
      expect(ROLE_LABELS[r].vi.length).toBeGreaterThan(0);
    }
  });
});
