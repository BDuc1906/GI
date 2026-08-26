// src/lib/data-sources/DataSourceManager.ts
/**
 * DataSourceManager — điểm truy cập DUY NHẤT mà AI Agent dùng để đọc
 * dữ liệu, dù là local (Prisma, luôn có) hay live (nguồn ngoài, optional).
 *
 * VÁ 0% ANY:
 * - `fetch()` dùng 2 OVERLOAD theo giá trị literal `live: true`/`false`
 *   — TypeScript tự suy ra đúng kiểu trả về (Partial khi live, đầy đủ
 *   khi local) tại từng call site, không cần ép kiểu tay ở nơi gọi.
 * - Bỏ `require()` động — cả 2 file provider (`JmpBlueProvider`,
 *   `AmbrProvider`) LUÔN tồn tại trong dự án (không phải optional
 *   dependency thật), nên import tĩnh vừa đúng hơn vừa hết luôn lỗi
 *   ESLint `no-require-imports`.
 */

import { prisma } from "@/lib/db/prisma";
import type { EntityType, EntityRecordMap, LiveEntityData, AnyEntityRecord } from "@/agent/core/types";
import { reactionsInvolving, ELEMENTAL_REACTIONS, type ElementalReaction } from "@/lib/game/element-reactions-data";
import { JmpBlueProvider } from "./live/JmpBlueProvider";
import { AmbrProvider } from "./live/AmbrProvider";

export interface LiveDataProvider {
  /** Tên nguồn, dùng để log/hiển thị (vd "genshin.jmp.blue"). */
  readonly name: string;
  fetchOne<T extends EntityType>(type: T, id: string): Promise<LiveEntityData<T> | null>;
}

type SearchType = EntityType | "reaction";
type SearchResult = AnyEntityRecord | ElementalReaction;

export class DataSourceManager {
  constructor(private readonly liveProvider: LiveDataProvider | null = getDefaultLiveProvider()) {}

  // ==========================================
  // Search — luôn đọc local DB (hoặc dữ liệu tĩnh cho "reaction")
  // ==========================================
  async search(type: SearchType, query: string, limit: number): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    switch (type) {
      case "character":
        return prisma.character.findMany({
          where: { OR: [{ id: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] },
          take: limit,
        });

      case "weapon":
        return prisma.weapon.findMany({
          where: { OR: [{ id: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] },
          take: limit,
        });

      case "material":
        return prisma.material.findMany({
          where: { OR: [{ id: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] },
          take: limit,
        });

      case "domain":
        return prisma.domain.findMany({
          where: { OR: [{ id: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] },
          take: limit,
        });

      case "artifact":
        return prisma.artifactSet.findMany({
          where: { OR: [{ id: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] },
          take: limit,
        });

      case "reaction": {
        // Dữ liệu tĩnh, không phân trang qua Prisma — lọc tay theo tên
        // (Anh/Việt) hoặc theo tên nguyên tố liên quan.
        const lower = q.toLowerCase();
        const byName = ELEMENTAL_REACTIONS.filter(
          (r) => r.name.toLowerCase().includes(lower) || r.nameVi.toLowerCase().includes(lower)
        );
        const byElement = reactionsInvolving(q);
        const merged = [...byName, ...byElement.filter((r) => !byName.some((b) => b.id === r.id))];
        return merged.slice(0, limit);
      }

      default: {
        const _exhaustive: never = type;
        throw new Error(`Loại dữ liệu không được hỗ trợ: ${_exhaustive}`);
      }
    }
  }

  // ==========================================
  // Fetch 1 record — local hoặc live tuỳ tham số `live`.
  // Overload để kiểu trả về khớp CHÍNH XÁC theo giá trị literal `live`
  // tại từng nơi gọi — vd `fetch(type, id, true)` được suy ra ngay là
  // `LiveEntityData<T> | null`, không cần ép kiểu ở tools/*.ts.
  // ==========================================
  async fetch<T extends EntityType>(type: T, id: string, live: true): Promise<LiveEntityData<T> | null>;
  async fetch<T extends EntityType>(type: T, id: string, live: false): Promise<EntityRecordMap[T] | null>;
  async fetch<T extends EntityType>(
    type: T,
    id: string,
    live: boolean
  ): Promise<EntityRecordMap[T] | LiveEntityData<T> | null> {
    if (live) {
      if (!this.liveProvider) {
        throw new Error(
          "Chưa cấu hình live data provider. Xem src/lib/data-sources/live/JmpBlueProvider.ts " +
            "để bật, hoặc dùng dữ liệu local (live=false)."
        );
      }
      return this.liveProvider.fetchOne(type, id);
    }
    return this.fetchLocal(type, id);
  }

  async fetchLocal<T extends EntityType>(type: T, id: string): Promise<EntityRecordMap[T] | null> {
    switch (type) {
      case "character":
        return prisma.character.findUnique({ where: { id } }) as Promise<EntityRecordMap[T] | null>;
      case "weapon":
        return prisma.weapon.findUnique({ where: { id } }) as Promise<EntityRecordMap[T] | null>;
      case "material":
        return prisma.material.findUnique({ where: { id } }) as Promise<EntityRecordMap[T] | null>;
      case "domain":
        return prisma.domain.findUnique({ where: { id } }) as Promise<EntityRecordMap[T] | null>;
      case "artifact":
        return prisma.artifactSet.findUnique({ where: { id } }) as Promise<EntityRecordMap[T] | null>;
      default: {
        const _exhaustive: never = type;
        throw new Error(`Loại dữ liệu không được hỗ trợ: ${_exhaustive}`);
      }
    }
  }

  /** Có cấu hình live provider hay chưa — dùng để tool báo lỗi sớm, rõ ràng. */
  hasLiveProvider(): boolean {
    return this.liveProvider !== null;
  }
}

function getDefaultLiveProvider(): LiveDataProvider | null {
  // Mặc định "jmpblue" (genshin.jmp.blue) — nguồn ĐÃ VERIFY sống thật
  // (xem GENSHIN-API-REFERENCE.md), thay cho "ambr" (api.ambr.top) chỉ
  // là đoán chưa kiểm chứng được. Vẫn giữ "ambr" như lựa chọn phụ cho
  // ai đã tự verify được domain Ambr đúng ở môi trường của họ.
  const providerName = process.env.AGENT_LIVE_PROVIDER || "jmpblue";
  if (providerName === "jmpblue") return new JmpBlueProvider();
  if (providerName === "ambr") return new AmbrProvider();
  return null;
}
