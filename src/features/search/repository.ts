import { createRequire } from "module";
import { prisma } from "@/lib/db/prisma";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

// Query ngắn hơn mức này KHÔNG dùng để tra alias — thuật toán fuzzy-match
// của genshin-db (dùng fuzzysort) với query 1-2 ký tự dễ trả về match
// "gần đúng" vô nghĩa (vd "a" -> "Aloy") thay vì thật sự liên quan tới
// alias người dùng gõ.
const MIN_ALIAS_QUERY_LENGTH = 3;

/**
 * BỔ SUNG (2026-09-22) — "chuẩn wiki lớn": MediaWiki xử lý biệt danh nhân
 * vật (vd trang "Childe" redirect sang "Tartaglia") bằng cơ chế redirect
 * page. Site này trước đây search CHỈ so khớp `name` lưu trong DB (tên
 * chính thức) — gõ "Childe" tìm KHÔNG RA "Tartaglia", gõ "Raiden" hay
 * "Baal" tìm KHÔNG RA "Raiden Shogun", dù đây là 2 trong số biệt danh phổ
 * biến nhất cộng đồng dùng (đã verify bằng cách gọi thẳng gdb.characters()
 * trước khi sửa).
 *
 * Phát hiện: `genshin-db` (dependency đã có sẵn) tự mang theo đúng bảng
 * alias/biệt danh này (option `matchAliases`) — không cần thêm dữ liệu gì
 * mới, chỉ cần DÙNG nó. Hàm dưới đây tra alias TRƯỚC khi query DB, nếu
 * resolve được sang 1 tên chính thức KHÁC hẳn (không phải thứ substring
 * DB đã tìm ra được rồi) thì mở rộng điều kiện WHERE để bắt luôn tên đó.
 *
 * An toàn: nếu genshin-db không resolve được gì (query không phải alias
 * nào cả) hoặc lỗi bất kỳ, trả `null` — search vẫn chạy y hệt trước đây,
 * không có gì bị phá vỡ.
 */
export function resolveAliasName(
  folder: { (query: string, opts: Record<string, boolean>): unknown },
  query: string
): string | null {
  if (query.trim().length < MIN_ALIAS_QUERY_LENGTH) return null;
  try {
    const result = folder(query, {
      matchNames: true,
      matchAltNames: true,
      matchAliases: true,
      matchCategories: true,
    }) as { name?: string } | { name?: string }[] | undefined;
    const match = Array.isArray(result) ? result[0] : result;
    const name = match?.name;
    if (!name) return null;
    // Không cần mở rộng WHERE nếu tên chính thức ĐÃ chứa query — substring
    // search bình thường đã tìm ra được rồi, alias không thêm giá trị gì.
    return name.toLowerCase().includes(query.toLowerCase()) ? null : name;
  } catch {
    return null;
  }
}

export const searchRepository = {
  async searchCharacters(query: string, limit: number) {
    const aliasName = resolveAliasName(genshindb.characters, query);
    return prisma.character.findMany({
      where: aliasName
        ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { name: aliasName }] }
        : { name: { contains: query, mode: "insensitive" } },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      take: limit,
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
        rarity: true,
        iconUrl: true,
        elementIcon: true,
      },
    });
  },

  async searchWeapons(query: string, limit: number) {
    const aliasName = resolveAliasName(genshindb.weapons, query);
    return prisma.weapon.findMany({
      where: aliasName
        ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { name: aliasName }] }
        : { name: { contains: query, mode: "insensitive" } },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      take: limit,
      select: {
        id: true,
        name: true,
        type: true,
        rarity: true,
        iconUrl: true,
      },
    });
  },

  async searchArtifacts(query: string, limit: number) {
    return prisma.artifactSet.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        rarityRange: true,
        iconUrl: true,
      },
    });
  },

  async searchDomains(query: string, limit: number) {
    return prisma.domain.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        category: true,
        imageUrl: true,
      },
    });
  },
};