/**
 * src/lib/game/versions.ts
 *
 * Lưu trữ nội dung theo PHIÊN BẢN GAME: mỗi phiên bản thêm gì, trước đó có gì,
 * và sau đó mới thêm gì. Dữ liệu lấy từ cột `gameVersion` đã seed sẵn ở
 * Character / Weapon / ArtifactSet / Domain / Material (không cần migration).
 *
 * Quy ước giá trị `gameVersion` trong DB:
 *   - "5.8"  → phiên bản cụ thể.
 *   - ""     → nội dung gốc: nguồn dữ liệu không đánh dấu phiên bản (nội dung ra
 *              mắt cùng game / có trước khi bắt đầu đánh dấu). Xếp vào LEGACY và
 *              coi là "đã có từ trước mọi phiên bản".
 *   - null   → chưa rõ. KHÔNG đưa vào snapshot theo phiên bản, chỉ đếm riêng.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * CÁCH THÊM NGUỒN MỚI (vd Vực Xoáy / Nhà hát / chế độ endgame sau này)
 * ──────────────────────────────────────────────────────────────────────────
 * Chỉ cần thêm 1 phần tử vào VERSION_SOURCES. Trang /versions, /versions/[v],
 * sitemap và khối trang chủ tự hiển thị, không phải sửa gì thêm. Ví dụ:
 *
 *   {
 *     key: "endgame",
 *     label: "Chế độ endgame",
 *     hrefBase: "/endgame",          // null nếu chưa có trang chi tiết
 *     shape: "square",
 *     load: async () =>
 *       (await prisma.endgameSeason.findMany({
 *         select: { id: true, name: true, nameTranslations: true,
 *                   imageUrl: true, imageUrlOriginal: true, mode: true,
 *                   gameVersion: true },
 *       })).map((r) => ({
 *         id: r.id, name: r.name, nameTranslations: r.nameTranslations,
 *         iconUrl: r.imageUrl, iconUrlOriginal: r.imageUrlOriginal,
 *         meta: r.mode, gameVersion: r.gameVersion,
 *       })),
 *   },
 *
 * (`endgameSeason` là ví dụ: cần tự tạo model + seed — dự án hiện chưa có dữ
 * liệu Vực Xoáy/Nhà hát; xem docs/WIKI-GAP-ANALYSIS.md.)
 */

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { PLAYABLE_CHARACTER_FILTER } from "@/core/game/character-catalog";

/** Giá trị `version` của mục thuộc nội dung gốc. */
export const LEGACY = "legacy";
/** Giá trị `version` của mục chưa có dữ liệu phiên bản. */
export const UNKNOWN = "unknown";

export interface RawEntry {
  id: string;
  name: string;
  nameTranslations: unknown;
  iconUrl: string | null;
  iconUrlOriginal: string | null;
  /** Dòng phụ hiển thị dưới tên (vd "5★"). */
  meta: string | null;
  /** Giá trị gameVersion thô trong DB. */
  gameVersion: string | null;
}

export interface VersionEntry extends Omit<RawEntry, "gameVersion"> {
  /** "5.8" | LEGACY | UNKNOWN */
  version: string;
}

export interface VersionSource {
  key: string;
  label: string;
  /** Trang chi tiết = `${hrefBase}/${id}`; null nếu chưa có trang chi tiết. */
  hrefBase: string | null;
  shape: "round" | "square";
  load: () => Promise<RawEntry[]>;
}

const DOMAIN_CATEGORY_LABEL: Record<string, string> = {
  talent: "Sách thiên phú",
  weapon: "Nguyên liệu vũ khí",
  artifact: "Thánh di vật",
};

export const VERSION_SOURCES: VersionSource[] = [
  {
    key: "characters",
    label: "Nhân vật",
    hrefBase: "/characters",
    shape: "round",
    load: async () =>
      (
        await prisma.character.findMany({
          where: PLAYABLE_CHARACTER_FILTER,
          select: {
            id: true,
            name: true,
            nameTranslations: true,
            iconUrl: true,
            iconUrlOriginal: true,
            rarity: true,
            gameVersion: true,
          },
          orderBy: [{ rarity: "desc" }, { name: "asc" }],
        })
      ).map((r) => ({ ...r, meta: `${r.rarity}★` })),
  },
  {
    key: "weapons",
    label: "Vũ khí",
    hrefBase: "/weapons",
    shape: "square",
    load: async () =>
      (
        await prisma.weapon.findMany({
          select: {
            id: true,
            name: true,
            nameTranslations: true,
            iconUrl: true,
            iconUrlOriginal: true,
            rarity: true,
            gameVersion: true,
          },
          orderBy: [{ rarity: "desc" }, { name: "asc" }],
        })
      ).map((r) => ({ ...r, meta: `${r.rarity}★` })),
  },
  {
    key: "artifacts",
    label: "Thánh di vật",
    hrefBase: "/artifacts",
    shape: "square",
    load: async () =>
      (
        await prisma.artifactSet.findMany({
          select: {
            id: true,
            name: true,
            nameTranslations: true,
            iconUrl: true,
            iconUrlOriginal: true,
            gameVersion: true,
          },
          orderBy: { name: "asc" },
        })
      ).map((r) => ({ ...r, meta: null })),
  },
  {
    key: "domains",
    label: "Bí cảnh",
    hrefBase: "/domains",
    shape: "square",
    load: async () =>
      (
        await prisma.domain.findMany({
          select: {
            id: true,
            name: true,
            nameTranslations: true,
            imageUrl: true,
            imageUrlOriginal: true,
            category: true,
            gameVersion: true,
          },
          orderBy: [{ category: "asc" }, { name: "asc" }],
        })
      ).map((r) => ({
        id: r.id,
        name: r.name,
        nameTranslations: r.nameTranslations,
        iconUrl: r.imageUrl,
        iconUrlOriginal: r.imageUrlOriginal,
        meta: DOMAIN_CATEGORY_LABEL[r.category] ?? r.category,
        gameVersion: r.gameVersion,
      })),
  },
  {
    key: "materials",
    label: "Nguyên liệu",
    hrefBase: "/materials",
    shape: "square",
    load: async () =>
      (
        await prisma.material.findMany({
          select: {
            id: true,
            name: true,
            nameTranslations: true,
            iconUrl: true,
            iconUrlOriginal: true,
            gameVersion: true,
          },
          orderBy: { name: "asc" },
        })
      ).map((r) => ({ ...r, meta: null })),
  },
];

/* ───────────── So sánh phiên bản ───────────── */

export function isVersionString(v: string): boolean {
  return /^\d+\.\d+$/.test(v);
}

/** So sánh theo từng đoạn số: "5.10" > "5.9", "6.0" > "5.8". */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

function normalizeVersion(raw: string | null): string {
  if (raw === null || raw === undefined) return UNKNOWN;
  const v = raw.trim();
  if (v === "") return LEGACY;
  return isVersionString(v) ? v : UNKNOWN;
}

/* ───────────── Chỉ mục ───────────── */

export interface VersionIndex {
  /** Các phiên bản thật, tăng dần (không gồm LEGACY/UNKNOWN). */
  versions: string[];
  sources: Array<Pick<VersionSource, "key" | "label" | "hrefBase" | "shape">>;
  entries: Record<string, VersionEntry[]>;
}

async function buildVersionIndex(): Promise<VersionIndex> {
  // Mỗi nguồn tải độc lập: 1 nguồn lỗi (vd model chưa seed) không làm hỏng cả trang.
  const loaded = await Promise.all(
    VERSION_SOURCES.map(async (s) => {
      try {
        return { s, rows: await withDbRetry(() => s.load()) };
      } catch (err) {
        console.error(`[versions] Không tải được nguồn "${s.key}":`, err);
        return { s, rows: [] as RawEntry[] };
      }
    })
  );

  const versionSet = new Set<string>();
  const entries: Record<string, VersionEntry[]> = {};
  for (const { s, rows } of loaded) {
    entries[s.key] = rows.map(({ gameVersion, ...rest }) => {
      const version = normalizeVersion(gameVersion);
      if (version !== LEGACY && version !== UNKNOWN) versionSet.add(version);
      return { ...rest, version };
    });
  }

  return {
    versions: Array.from(versionSet).sort(compareVersions),
    sources: VERSION_SOURCES.map(({ key, label, hrefBase, shape }) => ({
      key,
      label,
      hrefBase,
      shape,
    })),
    entries,
  };
}

/** Cache 1 giờ — dữ liệu phiên bản chỉ đổi khi seed lại. */
export const getVersionIndex = unstable_cache(buildVersionIndex, ["version-index-v1"], {
  revalidate: 3600,
  tags: ["version-index"],
});

/* ───────────── Truy vấn theo phiên bản ───────────── */

export type VersionView = "added" | "before" | "after";

export function isReal(v: string): boolean {
  return v !== LEGACY && v !== UNKNOWN;
}

/** Lọc mục của 1 phiên bản theo chế độ xem. */
export function pickEntries(entries: VersionEntry[], version: string, view: VersionView): VersionEntry[] {
  return entries.filter((e) => {
    if (e.version === UNKNOWN) return false;
    if (view === "added") return e.version === version;
    if (view === "before") return e.version === LEGACY || compareVersions(e.version, version) < 0;
    return isReal(e.version) && compareVersions(e.version, version) > 0;
  });
}

export interface VersionSummary {
  added: number;
  before: number;
  after: number;
  bySource: Record<string, { added: number; before: number; after: number }>;
}

export function summarize(index: VersionIndex, version: string): VersionSummary {
  const out: VersionSummary = { added: 0, before: 0, after: 0, bySource: {} };
  for (const s of index.sources) {
    const list = index.entries[s.key] ?? [];
    const row = {
      added: pickEntries(list, version, "added").length,
      before: pickEntries(list, version, "before").length,
      after: pickEntries(list, version, "after").length,
    };
    out.bySource[s.key] = row;
    out.added += row.added;
    out.before += row.before;
    out.after += row.after;
  }
  return out;
}

export function countUnknown(index: VersionIndex): number {
  return Object.values(index.entries).reduce(
    (n, list) => n + list.filter((e) => e.version === UNKNOWN).length,
    0
  );
}
