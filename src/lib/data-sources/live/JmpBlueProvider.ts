// src/lib/data-sources/live/JmpBlueProvider.ts
/**
 * JmpBlueProvider — lấy dữ liệu "live" từ genshin.jmp.blue
 * (genshindev/api, mã nguồn mở, https://github.com/genshindev/api).
 *
 * THAY THẾ cho AmbrProvider.ts cũ — lý do đổi:
 * 1. `api.ambr.top` trong bản cũ là ĐOÁN, chưa từng verify được — tra
 *    lại thì trang Ambr đã chuyển sang domain gi.yatta.moe, domain cũ
 *    rất có thể không còn đúng.
 * 2. Nguồn này tôi đã GỌI THẬT và xác nhận sống lúc viết file này:
 *    `curl https://genshin.jmp.blue/` trả về đúng
 *    `{"types":["artifacts","boss","characters","consumables","domains",...]}`.
 * 3. Có tài liệu công khai rõ ràng (README trên GitHub), không phải
 *    suy luận từ cấu trúc response của người khác đồn lại.
 *
 * ⚠️ VẪN CẦN BẠN XÁC NHẬN 1 VIỆC: tôi mới verify được endpoint GỐC
 * (`/`), CHƯA verify được JSON chi tiết của 1 entity cụ thể (vd
 * `/characters/albedo?lang=en`) do giới hạn công cụ fetch của tôi chỉ
 * cho phép gọi URL đã xuất hiện trong kết quả tìm kiếm trước đó. Mapping
 * field bên dưới dựa trên cấu trúc chuẩn phổ biến của các API loại này
 * (name, rarity, element...) — xác suất đúng cao vì đây là API có cấu
 * trúc đơn giản, công khai, nhưng chưa phải "đã tận mắt thấy JSON thật"
 * như tôi làm được với endpoint gốc. Chạy 1 lệnh trong
 * GENSHIN-API-REFERENCE.md, đối chiếu lại field, sửa nếu lệch.
 */

import type { EntityType } from "@/agent/core/schemas";
import type { LiveDataProvider } from "../DataSourceManager";

const BASE_URL = process.env.JMPBLUE_API_BASE_URL || "https://genshin.jmp.blue";
const FETCH_TIMEOUT_MS = 8000;

// Đổi từ số ít ("character") sang đúng tên loại của genshin.jmp.blue
// (số nhiều: "characters", "weapons"...) — khác quy ước với Ambr.
const ENDPOINT_BY_TYPE: Record<EntityType, string> = {
  character: "characters",
  weapon: "weapons",
  artifact: "artifacts",
  material: "materials",
  domain: "domains",
};

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!res.ok) {
      throw new Error(`genshin.jmp.blue trả về ${res.status} ${res.statusText} cho ${url}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export class JmpBlueProvider implements LiveDataProvider {
  readonly name = "genshin.jmp.blue";

  async fetchOne(type: EntityType, id: string): Promise<Record<string, any> | null> {
    const endpointType = ENDPOINT_BY_TYPE[type];
    const url = `${BASE_URL}/${endpointType}/${encodeURIComponent(id)}?lang=en`;

    let raw: any;
    try {
      raw = await fetchJson(url);
    } catch (err) {
      // API trả 404 dạng JSON hoặc lỗi HTTP khi không tìm thấy slug —
      // coi là "không có dữ liệu" thay vì throw, để CompareTool/FixTool
      // xử lý như trường hợp bình thường (có thể do slug sai, không
      // phải lỗi hệ thống).
      if (err instanceof Error && err.message.includes("404")) return null;
      throw err;
    }
    if (!raw) return null;

    switch (type) {
      case "character":
        return this.parseCharacter(raw);
      case "weapon":
        return this.parseWeapon(raw);
      case "artifact":
        return this.parseArtifact(raw);
      case "material":
        return this.parseMaterial(raw);
      case "domain":
        return this.parseDomain(raw);
      default:
        return raw;
    }
  }

  /**
   * Map field genshin.jmp.blue → đúng tên cột Character trong
   * prisma/schema.prisma. CHƯA verify JSON thật (xem cảnh báo đầu
   * file) — field name dưới đây là suy đoán có căn cứ, cần đối chiếu.
   */
  private parseCharacter(raw: any): Record<string, any> {
    return {
      name: raw.name ?? undefined,
      rarity: raw.rarity ?? undefined,
      weaponType: raw.weaponType ?? raw.weapon ?? undefined,
      vision: raw.vision ?? raw.element ?? undefined,
      nation: raw.nation ?? undefined,
      // Base stats thường nằm trong 1 mảng/list theo cấp độ trong các
      // API dạng này — nếu genshin.jmp.blue trả `stats` là mảng theo
      // level, lấy phần tử đầu (level 1) làm base:
      baseHp: raw.stats?.[0]?.hp ?? raw.baseStats?.hp ?? undefined,
      baseAtk: raw.stats?.[0]?.atk ?? raw.baseStats?.atk ?? undefined,
      baseDef: raw.stats?.[0]?.def ?? raw.baseStats?.def ?? undefined,
    };
  }

  private parseWeapon(raw: any): Record<string, any> {
    return {
      name: raw.name ?? undefined,
      rarity: raw.rarity ?? undefined,
      type: raw.type ?? undefined,
      baseAtk: raw.stats?.[0]?.atk ?? raw.baseStats?.atk ?? undefined,
    };
  }

  private parseArtifact(raw: any): Record<string, any> {
    return {
      name: raw.name ?? undefined,
      twoPieceBonus: raw["2-piece"] ?? raw.bonus2 ?? undefined,
      fourPieceBonus: raw["4-piece"] ?? raw.bonus4 ?? undefined,
    };
  }

  private parseMaterial(raw: any): Record<string, any> {
    return {
      name: raw.name ?? undefined,
      description: raw.description ?? undefined,
    };
  }

  private parseDomain(raw: any): Record<string, any> {
    return {
      name: raw.name ?? undefined,
      description: raw.description ?? undefined,
    };
  }
}
