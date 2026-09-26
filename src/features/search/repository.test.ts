import { createRequire } from "module";
import { describe, expect, it } from "vitest";
import { resolveAliasName } from "./repository";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

describe("resolveAliasName — tra biệt danh nhân vật/vũ khí qua genshin-db (\"chuẩn wiki lớn\": tương đương redirect page của MediaWiki)", () => {
  it("resolve đúng biệt danh phổ biến nhất: Childe -> Tartaglia", () => {
    expect(resolveAliasName(genshindb.characters, "Childe")).toBe("Tartaglia");
  });

  it("resolve đúng: Baal -> Raiden Shogun (biệt danh từ Fatui, không phải tên chính thức)", () => {
    expect(resolveAliasName(genshindb.characters, "Baal")).toBe("Raiden Shogun");
  });

  it("Homa (biệt danh phổ biến) vẫn trả null vì 'Homa' đã là substring của 'Staff of Homa' — DB search thường đã tìm ra, không cần mở rộng", () => {
    expect(resolveAliasName(genshindb.weapons, "Homa")).toBeNull();
  });

  it("trả về null khi tên chính thức ĐÃ chứa query — không cần mở rộng vì search DB thường đã tìm ra", () => {
    // "Diluc" tự nó là tên chính thức, name.includes(query) = true -> null.
    expect(resolveAliasName(genshindb.characters, "Diluc")).toBeNull();
    // "Raiden" là 1 phần của tên chính thức "Raiden Shogun" -> DB substring
    // search bình thường đã tìm ra rồi, không cần mở rộng.
    expect(resolveAliasName(genshindb.characters, "Raiden")).toBeNull();
  });

  it("trả về null khi query quá ngắn (< 3 ký tự) — tránh fuzzy-match sai (vd 'a' -> 'Aloy')", () => {
    expect(resolveAliasName(genshindb.characters, "a")).toBeNull();
    expect(resolveAliasName(genshindb.characters, "ab")).toBeNull();
  });

  it("trả về null khi query không khớp alias nào cả (không throw, không trả rác)", () => {
    expect(resolveAliasName(genshindb.characters, "xyzxyzxyz123notreal")).toBeNull();
  });
});
