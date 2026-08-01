import { describe, expect, it } from "vitest";
import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  buildMeta,
  parsePagination,
  parseRarityList,
  parseSort,
} from "@/lib/api/query";
import { ApiError } from "@/lib/api/errors";

function sp(query: Record<string, string>): URLSearchParams {
  return new URLSearchParams(query);
}

describe("parsePagination", () => {
  it("dùng giá trị mặc định khi không có page/limit", () => {
    const result = parsePagination(sp({}));
    expect(result).toEqual({ page: 1, limit: DEFAULT_LIMIT, skip: 0, take: DEFAULT_LIMIT });
  });

  it("parse page/limit hợp lệ và tính đúng skip", () => {
    const result = parsePagination(sp({ page: "3", limit: "10" }));
    expect(result).toEqual({ page: 3, limit: 10, skip: 20, take: 10 });
  });

  it("clamp limit vượt quá MAX_LIMIT thay vì cho qua", () => {
    const result = parsePagination(sp({ limit: String(MAX_LIMIT + 500) }));
    expect(result.limit).toBe(MAX_LIMIT);
  });

  it("throw ApiError khi page không phải số nguyên dương", () => {
    expect(() => parsePagination(sp({ page: "0" }))).toThrow(ApiError);
    expect(() => parsePagination(sp({ page: "-1" }))).toThrow(ApiError);
    expect(() => parsePagination(sp({ page: "abc" }))).toThrow(ApiError);
    expect(() => parsePagination(sp({ page: "1.5" }))).toThrow(ApiError);
  });

  it("throw ApiError khi limit không hợp lệ, giữ status 400", () => {
    try {
      parsePagination(sp({ limit: "abc" }));
      expect.unreachable("phải throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(400);
    }
  });
});

describe("parseSort", () => {
  const ALLOWED = ["name", "rarity", "createdAt"] as const;
  const FALLBACK = { field: "rarity", dir: "desc" } as const;

  it("trả về fallback khi không truyền sort", () => {
    expect(parseSort(null, ALLOWED, FALLBACK)).toEqual(FALLBACK);
  });

  it("parse field không dấu '-' thành asc", () => {
    expect(parseSort("name", ALLOWED, FALLBACK)).toEqual({ field: "name", dir: "asc" });
  });

  it("parse field có dấu '-' thành desc", () => {
    expect(parseSort("-createdAt", ALLOWED, FALLBACK)).toEqual({ field: "createdAt", dir: "desc" });
  });

  it("throw ApiError khi field không nằm trong whitelist", () => {
    expect(() => parseSort("nonExistentField", ALLOWED, FALLBACK)).toThrow(ApiError);
    expect(() => parseSort("-nonExistentField", ALLOWED, FALLBACK)).toThrow(ApiError);
  });
});

describe("parseRarityList", () => {
  it("trả về undefined khi không truyền", () => {
    expect(parseRarityList(null)).toBeUndefined();
  });

  it("parse 1 giá trị đơn", () => {
    expect(parseRarityList("5")).toEqual([5]);
  });

  it("parse danh sách phân cách bởi dấu phẩy, kể cả có khoảng trắng", () => {
    expect(parseRarityList("4, 5")).toEqual([4, 5]);
  });

  it("throw ApiError khi ngoài khoảng 1–5", () => {
    expect(() => parseRarityList("0")).toThrow(ApiError);
    expect(() => parseRarityList("6")).toThrow(ApiError);
    expect(() => parseRarityList("abc")).toThrow(ApiError);
  });
});

describe("buildMeta", () => {
  it("tính totalPages làm tròn lên", () => {
    const meta = buildMeta({ page: 1, limit: 10, skip: 0, take: 10 }, 25);
    expect(meta).toEqual({ page: 1, limit: 10, total: 25, totalPages: 3 });
  });

  it("totalPages = 0 khi total = 0 (không phải NaN/Infinity)", () => {
    const meta = buildMeta({ page: 1, limit: 10, skip: 0, take: 10 }, 0);
    expect(meta.totalPages).toBe(0);
  });
});
