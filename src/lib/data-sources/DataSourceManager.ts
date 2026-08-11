// src/lib/data-sources/DataSourceManager.ts
/**
 * DataSourceManager — điểm truy cập DUY NHẤT mà AI Agent dùng để đọc
 * dữ liệu, dù là local (Prisma, luôn có) hay live (nguồn ngoài, optional).
 *
 * TRƯỚC ĐÂY: các tool trong src/agent/tools/*.ts import class này
 * nhưng file KHÔNG TỒN TẠI — mọi import throw ngay ở build time.
 * Bản này viết lại từ đầu, chỉ dựa trên model Prisma THẬT ĐANG CÓ
 * (Character, Weapon, Material, Domain, ArtifactSet) + dữ liệu tĩnh
 * phản ứng nguyên tố (element-reactions-data.ts) — không đụng tới
 * "enemy" vì DB chưa có bảng đó (xem schemas.ts).
 *
 * Live source (Ambr.top / Enka.Network) là OPTIONAL — nếu bạn chưa có
 * thời gian tích hợp/kiểm thử endpoint thật, cứ để trống, các tool cần
 * "live" (fetchLiveData, compareData, fixData khi không truyền field
 * cụ thể) sẽ trả lỗi rõ ràng thay vì crash mơ hồ. Xem
 * src/lib/data-sources/live/AmbrProvider.ts để bật khi sẵn sàng.
 */

import { prisma } from "@/lib/prisma";
import type { EntityType } from "@/agent/core/schemas";
import { reactionsInvolving, ELEMENTAL_REACTIONS } from "@/lib/element-reactions-data";

export interface LiveDataProvider {
  /** Tên nguồn, dùng để log/hiển thị (vd "ambr.top"). */
  readonly name: string;
  fetchOne(type: EntityType, id: string): Promise<Record<string, any> | null>;
}

type SearchType = EntityType | "reaction";

export class DataSourceManager {
  constructor(private readonly liveProvider: LiveDataProvider | null = getDefaultLiveProvider()) {}

  // ==========================================
  // Search — luôn đọc local DB (hoặc dữ liệu tĩnh cho "reaction")
  // ==========================================
  async search(type: SearchType, query: string, limit: number): Promise<any[]> {
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
  // Fetch 1 record — local hoặc live tuỳ tham số `live`
  // ==========================================
  async fetch(type: EntityType, id: string, live: boolean): Promise<any | null> {
    if (live) {
      if (!this.liveProvider) {
        throw new Error(
          "Chưa cấu hình live data provider. Xem src/lib/data-sources/live/AmbrProvider.ts " +
            "để bật, hoặc dùng dữ liệu local (live=false)."
        );
      }
      return this.liveProvider.fetchOne(type, id);
    }
    return this.fetchLocal(type, id);
  }

  async fetchLocal(type: EntityType, id: string): Promise<any | null> {
    switch (type) {
      case "character":
        return prisma.character.findUnique({ where: { id } });
      case "weapon":
        return prisma.weapon.findUnique({ where: { id } });
      case "material":
        return prisma.material.findUnique({ where: { id } });
      case "domain":
        return prisma.domain.findUnique({ where: { id } });
      case "artifact":
        return prisma.artifactSet.findUnique({ where: { id } });
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
  // Import động để tránh lỗi module-not-found lan ra toàn bộ
  // DataSourceManager nếu ai đó xoá file provider trong lúc thử
  // nghiệm — chỉ ảnh hưởng tới tính năng "live", không ảnh hưởng search/
  // fetch local vốn là đường dùng chính (search public, không cần live).
  //
  // Mặc định "jmpblue" (genshin.jmp.blue) — nguồn ĐÃ VERIFY sống thật,
  // thay cho "ambr" (api.ambr.top) chỉ là đoán chưa kiểm chứng được.
  // Vẫn giữ "ambr" như lựa chọn phụ cho ai đã tự verify được domain
  // Ambr đúng ở môi trường của họ.
  const providerName = process.env.AGENT_LIVE_PROVIDER || "jmpblue";
  try {
    if (providerName === "jmpblue") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { JmpBlueProvider } = require("./live/JmpBlueProvider") as typeof import("./live/JmpBlueProvider");
      return new JmpBlueProvider();
    }
    if (providerName === "ambr") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { AmbrProvider } = require("./live/AmbrProvider") as typeof import("./live/AmbrProvider");
      return new AmbrProvider();
    }
    return null;
  } catch {
    return null;
  }
}
