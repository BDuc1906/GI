// src/lib/data-sources/live/AmbrProvider.ts
/**
 * AmbrProvider — lấy dữ liệu "live" từ API công khai của ambr.top, dùng
 * cho CompareTool (đối chiếu local vs nguồn ngoài) và FetchLiveTool.
 *
 * ⚠️ QUAN TRỌNG — ĐỌC TRƯỚC KHI BẬT:
 * Đây là phần DUY NHẤT trong bộ sửa lỗi này tôi KHÔNG THỂ tự kiểm thử
 * (môi trường của tôi không gọi được ra ambr.top). Cấu trúc endpoint/
 * response bên dưới dựa trên tài liệu công khai của Ambr API tại thời
 * điểm viết — rất có thể lệch field name thật với response hiện tại.
 * TRƯỚC KHI dùng CompareTool/FixTool dựa vào nguồn này để tự động sửa
 * DB, hãy:
 *   1. Gọi thử fetchOne("character", "kazuha") và console.log raw
 *      response thật, đối chiếu lại field mapping trong parseCharacter().
 *   2. Chỉ bật FixTool (permission "admin") sau khi bước 1 khớp — nếu
 *      mapping sai, agent sẽ "sửa" dữ liệu đúng thành dữ liệu sai.
 *
 * Muốn đổi nguồn khác (Enka.Network, hoặc chính genshin-db package đã
 * có sẵn trong devDependencies): implement LiveDataProvider tương tự,
 * rồi trỏ AGENT_LIVE_PROVIDER sang giá trị mới trong
 * DataSourceManager.getDefaultLiveProvider().
 */

import type { EntityType } from "@/agent/core/schemas";
import type { LiveDataProvider } from "../DataSourceManager";

const BASE_URL = process.env.AMBR_API_BASE_URL || "https://api.ambr.top/v2/en";
const FETCH_TIMEOUT_MS = 8000;

const ENDPOINT_BY_TYPE: Partial<Record<EntityType, string>> = {
  character: "avatar",
  weapon: "weapon",
  artifact: "reliquary",
  material: "material",
  // "domain" không có endpoint tương ứng rõ ràng trên Ambr — bỏ trống
  // có chủ đích, fetchOne sẽ throw lỗi dễ hiểu thay vì gọi sai endpoint.
};

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!res.ok) {
      throw new Error(`Ambr API trả về ${res.status} ${res.statusText} cho ${url}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export class AmbrProvider implements LiveDataProvider {
  readonly name = "ambr.top";

  async fetchOne(type: EntityType, id: string): Promise<Record<string, any> | null> {
    const endpoint = ENDPOINT_BY_TYPE[type];
    if (!endpoint) {
      throw new Error(`AmbrProvider chưa hỗ trợ loại "${type}" (chưa xác định endpoint tương ứng).`);
    }

    const url = `${BASE_URL}/${endpoint}/${encodeURIComponent(id)}`;
    const json = await fetchJson(url);

    // Ambr bọc data thật trong { response, data } theo tài liệu công
    // khai — nếu response thật khác cấu trúc này (đã ghi chú ở đầu
    // file), sửa lại đúng 1 chỗ này thôi, phần còn lại của agent không
    // cần đổi.
    const raw = json?.data ?? json;
    if (!raw) return null;

    switch (type) {
      case "character":
        return this.parseCharacter(raw);
      case "weapon":
        return this.parseWeapon(raw);
      case "artifact":
        return this.parseArtifact(raw);
      case "material":
        return raw;
      default:
        return raw;
    }
  }

  /** Map field Ambr → đúng tên cột Character trong prisma/schema.prisma. */
  private parseCharacter(raw: any): Record<string, any> {
    return {
      name: raw.name ?? undefined,
      rarity: raw.rank ?? undefined,
      weaponType: raw.weaponType ?? undefined,
      vision: raw.element ?? undefined,
      baseHp: raw.upgrade?.prop?.find((p: any) => p.type === "FIGHT_PROP_BASE_HP")?.initValue,
      baseAtk: raw.upgrade?.prop?.find((p: any) => p.type === "FIGHT_PROP_BASE_ATTACK")?.initValue,
      baseDef: raw.upgrade?.prop?.find((p: any) => p.type === "FIGHT_PROP_BASE_DEFENSE")?.initValue,
    };
  }

  private parseWeapon(raw: any): Record<string, any> {
    return {
      name: raw.name ?? undefined,
      rarity: raw.rank ?? undefined,
      type: raw.type ?? undefined,
      baseAtk: raw.upgrade?.prop?.[0]?.initValue,
    };
  }

  private parseArtifact(raw: any): Record<string, any> {
    return {
      name: raw.name ?? undefined,
      twoPieceBonus: raw.levelList?.["2"] ?? undefined,
      fourPieceBonus: raw.levelList?.["4"] ?? undefined,
    };
  }
}
