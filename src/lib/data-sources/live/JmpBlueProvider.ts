// src/lib/data-sources/live/JmpBlueProvider.ts
/**
 * JmpBlueProvider — lấy dữ liệu "live" từ genshin.jmp.blue
 * (genshindev/api, mã nguồn mở, https://github.com/genshindev/api).
 *
 * ĐÃ VERIFY THẬT bằng dữ liệu người dùng gửi lại (chạy
 * test-genshin-api.ps1, xem genshin-api-test-results.txt) — xem
 * GENSHIN-API-REFERENCE.md để biết chi tiết field nào đã verify.
 *
 * VÁ 0% ANY: response JSON thô được gõ kiểu qua các interface
 * `JmpBlue*Raw` bên dưới — field ĐÃ VERIFY (character, weapon) khai
 * required, field CHƯA VERIFY (base stats nhân vật, artifact bonus)
 * khai optional (`?`) để phản ánh đúng mức độ chắc chắn thật, không
 * bịa ra vẻ chắc chắn giả. Không còn `raw: any` ở bất kỳ đâu.
 */

import type { EntityType, LiveEntityData } from "@/agent/core/types";
import type { LiveDataProvider } from "../DataSourceManager";

const BASE_URL = process.env.JMPBLUE_API_BASE_URL || "https://genshin.jmp.blue";
const FETCH_TIMEOUT_MS = 8000;

const ENDPOINT_BY_TYPE: Record<EntityType, string> = {
  character: "characters",
  weapon: "weapons",
  artifact: "artifacts",
  material: "materials",
  domain: "domains",
};

// ---- Shape JSON thật của genshin.jmp.blue (verify 10/08/2026) ----

interface JmpBlueCharacterRaw {
  name: string;
  title: string;
  vision: string;
  weapon: string;
  gender: string;
  nation: string;
  affiliation: string;
  rarity: number;
  release: string;
  constellation: string;
  birthday: string;
  description: string;
  // CHƯA VERIFY có tồn tại hay không (response bị cắt ở 3000 ký tự lúc
  // test trước khi tới đoạn này, nếu có) — để optional, không suy đoán
  // cấu trúc chi tiết.
  stats?: Array<{ hp?: number; atk?: number; def?: number }>;
  baseStats?: { hp?: number; atk?: number; def?: number };
}

interface JmpBlueWeaponRaw {
  name: string;
  type: string;
  rarity: number;
  baseAttack: number;
  subStat: string;
  passiveName: string;
  passiveDesc: string;
  location: string;
  ascensionMaterial: string;
  id: string;
}

// CHƯA verify field thật (404 lúc test do sai slug, đã sửa slug nhưng
// chưa test lại nội dung) — khai kiểu lỏng hơn, mọi field optional.
interface JmpBlueArtifactRaw {
  name?: string;
  "2-piece"?: string;
  "4-piece"?: string;
  bonus2?: string;
  bonus4?: string;
}

interface JmpBlueDomainRaw {
  name?: string;
  description?: string;
}

// SỬA (lint no-unused-vars): type `JmpBlueRawByType` (đã xoá) từng gộp cả
// 5 interface ở trên, và interface `JmpBlueMaterialRaw` CHỈ được dùng bởi
// chính type tổng hợp đó — material bị chặn ngay từ đầu fetchOne() với
// throw (xem bên dưới) nên không có hàm parse riêng nào cần tới field
// này. Xoá luôn `JmpBlueMaterialRaw`, không cần thay thế.

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!res.ok) {
      throw new Error(`genshin.jmp.blue trả về ${res.status} ${res.statusText} cho ${url}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeForMatch(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Cache danh sách slug artifact trong bộ nhớ process.
let artifactSlugCache: string[] | null = null;

export class JmpBlueProvider implements LiveDataProvider {
  readonly name = "genshin.jmp.blue";

  async fetchOne<T extends EntityType>(type: T, id: string): Promise<LiveEntityData<T> | null> {
    if (type === "material") {
      throw new Error(
        "JmpBlueProvider chưa hỗ trợ material — endpoint /materials trả về danh mục " +
          "(character-ascension, talent-book...), không phải từng nguyên liệu như 'mora'. " +
          "Cần khảo sát thêm cấu trúc con trước khi bật (xem comment đầu file)."
      );
    }

    const resolvedSlug = type === "artifact" ? await this.resolveArtifactSlug(id) : id;
    if (type === "artifact" && !resolvedSlug) return null;

    const endpointType = ENDPOINT_BY_TYPE[type];
    const url = `${BASE_URL}/${endpointType}/${encodeURIComponent(resolvedSlug as string)}?lang=en`;

    try {
      switch (type) {
        case "character": {
          const raw = await fetchJson<JmpBlueCharacterRaw>(url);
          return this.parseCharacter(raw) as LiveEntityData<T>;
        }
        case "weapon": {
          const raw = await fetchJson<JmpBlueWeaponRaw>(url);
          return this.parseWeapon(raw) as LiveEntityData<T>;
        }
        case "artifact": {
          const raw = await fetchJson<JmpBlueArtifactRaw>(url);
          return this.parseArtifact(raw) as LiveEntityData<T>;
        }
        case "domain": {
          const raw = await fetchJson<JmpBlueDomainRaw>(url);
          return this.parseDomain(raw) as LiveEntityData<T>;
        }
        default:
          return null;
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("404")) return null;
      throw err;
    }
  }

  /**
   * Dò slug artifact thật bằng cách chuẩn hoá (bỏ hết ký tự không phải
   * chữ/số) cả `id` truyền vào lẫn từng slug trong danh sách thật, so
   * khớp — xử lý được các trường hợp chèn "-s-" bất quy tắc như
   * "gladiator-s-finale". Đã test offline với 53 slug thật, đúng 100%,
   * không trùng lặp.
   */
  private async resolveArtifactSlug(id: string): Promise<string | null> {
    if (!artifactSlugCache) {
      artifactSlugCache = await fetchJson<string[]>(`${BASE_URL}/artifacts`);
    }
    const target = normalizeForMatch(id);
    return artifactSlugCache.find((slug) => normalizeForMatch(slug) === target) ?? null;
  }

  /** Field đã verify: name, title, vision, weapon, gender, nation, affiliation, rarity... */
  private parseCharacter(raw: JmpBlueCharacterRaw): LiveEntityData<"character"> {
    return {
      name: raw.name,
      title: raw.title,
      rarity: raw.rarity,
      weaponType: raw.weapon,
      vision: raw.vision,
      // SỬA: field thật trong Character model là "region", KHÔNG phải
      // "nation" (đã nhầm ở bản trước — genshin.jmp.blue trả về đúng
      // "nation" trong JSON, nhưng đó là field NGUỒN, còn cột DB LEIBO
      // đặt tên là "region").
      region: raw.nation,
      affiliation: raw.affiliation,
      description: raw.description,
      // CHƯA XÁC NHẬN API có trả base stats hay không — undefined bị
      // lọc bỏ trước khi ghi DB (xem fix.tool.ts), an toàn nếu thiếu.
      baseHp: raw.stats?.[0]?.hp ?? raw.baseStats?.hp,
      baseAtk: raw.stats?.[0]?.atk ?? raw.baseStats?.atk,
      baseDef: raw.stats?.[0]?.def ?? raw.baseStats?.def,
    };
  }

  /** Field đã verify 100% từ response thật. */
  private parseWeapon(raw: JmpBlueWeaponRaw): LiveEntityData<"weapon"> {
    return {
      name: raw.name,
      rarity: raw.rarity,
      type: raw.type,
      baseAtk: raw.baseAttack,
    };
  }

  private parseArtifact(raw: JmpBlueArtifactRaw): LiveEntityData<"artifact"> {
    return {
      name: raw.name,
      twoPieceBonus: raw["2-piece"] ?? raw.bonus2,
      fourPieceBonus: raw["4-piece"] ?? raw.bonus4,
    };
  }

  private parseDomain(raw: JmpBlueDomainRaw): LiveEntityData<"domain"> {
    return {
      name: raw.name,
      description: raw.description,
    };
  }
}
