// src/lib/data-sources/live/AmbrProvider.ts
/**
 * AmbrProvider — lấy dữ liệu "live" từ API công khai của ambr.top.
 *
 * ⚠️ KHÔNG PHẢI PROVIDER MẶC ĐỊNH — xem JmpBlueProvider.ts (nguồn ĐÃ
 * VERIFY sống thật). File này giữ lại làm lựa chọn phụ nếu bạn tự xác
 * minh được domain Ambr đúng ở môi trường của mình (đặt
 * `AGENT_LIVE_PROVIDER=ambr`); cấu trúc field bên dưới CHƯA được verify
 * bằng response thật (khác JmpBlueProvider), chỉ dựa trên tài liệu công
 * khai — kiểm tra lại trước khi bật FixTool dựa vào nguồn này.
 *
 * VÁ 0% ANY: response thô gõ kiểu qua `AmbrEnvelope<T>` — Ambr bọc data
 * thật trong `{ response, data }` theo tài liệu công khai.
 */

import type { EntityType, LiveEntityData } from "@/agent/core/types";
import type { LiveDataProvider } from "../DataSourceManager";

const BASE_URL = process.env.AMBR_API_BASE_URL || "https://api.ambr.top/v2/en";
const FETCH_TIMEOUT_MS = 8000;

const ENDPOINT_BY_TYPE: Partial<Record<EntityType, string>> = {
  character: "avatar",
  weapon: "weapon",
  artifact: "reliquary",
  material: "material",
};

interface AmbrEnvelope<T> {
  response?: number;
  data?: T;
}

interface AmbrFightProp {
  type: string;
  initValue: number;
}

interface AmbrCharacterRaw {
  name?: string;
  rank?: number;
  weaponType?: string;
  element?: string;
  upgrade?: { prop?: AmbrFightProp[] };
}

interface AmbrWeaponRaw {
  name?: string;
  rank?: number;
  type?: string;
  upgrade?: { prop?: AmbrFightProp[] };
}

interface AmbrArtifactRaw {
  name?: string;
  levelList?: Record<string, string>;
}

type AmbrRawByType = {
  character: AmbrCharacterRaw;
  weapon: AmbrWeaponRaw;
  artifact: AmbrArtifactRaw;
};

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!res.ok) {
      throw new Error(`Ambr API trả về ${res.status} ${res.statusText} cho ${url}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function findProp(props: AmbrFightProp[] | undefined, type: string): number | undefined {
  return props?.find((p) => p.type === type)?.initValue;
}

export class AmbrProvider implements LiveDataProvider {
  readonly name = "ambr.top";

  async fetchOne<T extends EntityType>(type: T, id: string): Promise<LiveEntityData<T> | null> {
    const endpoint = ENDPOINT_BY_TYPE[type];
    if (!endpoint) {
      throw new Error(`AmbrProvider chưa hỗ trợ loại "${type}" (chưa xác định endpoint tương ứng).`);
    }

    const url = `${BASE_URL}/${endpoint}/${encodeURIComponent(id)}`;

    switch (type) {
      case "character": {
        const json = await fetchJson<AmbrEnvelope<AmbrCharacterRaw>>(url);
        const raw = json.data;
        if (!raw) return null;
        return this.parseCharacter(raw) as LiveEntityData<T>;
      }
      case "weapon": {
        const json = await fetchJson<AmbrEnvelope<AmbrWeaponRaw>>(url);
        const raw = json.data;
        if (!raw) return null;
        return this.parseWeapon(raw) as LiveEntityData<T>;
      }
      case "artifact": {
        const json = await fetchJson<AmbrEnvelope<AmbrArtifactRaw>>(url);
        const raw = json.data;
        if (!raw) return null;
        return this.parseArtifact(raw) as LiveEntityData<T>;
      }
      default:
        return null;
    }
  }

  private parseCharacter(raw: AmbrCharacterRaw): LiveEntityData<"character"> {
    return {
      name: raw.name,
      rarity: raw.rank,
      weaponType: raw.weaponType,
      vision: raw.element,
      baseHp: findProp(raw.upgrade?.prop, "FIGHT_PROP_BASE_HP"),
      baseAtk: findProp(raw.upgrade?.prop, "FIGHT_PROP_BASE_ATTACK"),
      baseDef: findProp(raw.upgrade?.prop, "FIGHT_PROP_BASE_DEFENSE"),
    };
  }

  private parseWeapon(raw: AmbrWeaponRaw): LiveEntityData<"weapon"> {
    return {
      name: raw.name,
      rarity: raw.rank,
      type: raw.type,
      baseAtk: raw.upgrade?.prop?.[0]?.initValue,
    };
  }

  private parseArtifact(raw: AmbrArtifactRaw): LiveEntityData<"artifact"> {
    return {
      name: raw.name,
      twoPieceBonus: raw.levelList?.["2"],
      fourPieceBonus: raw.levelList?.["4"],
    };
  }
}
