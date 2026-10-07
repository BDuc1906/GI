/**
 * scripts/check/check-live-images.ts
 *
 * Kiểm tra ảnh THẬT theo đúng đường trình duyệt đi (không dùng số liệu cũ):
 *   - URL R2 (*.r2.dev) -> gọi `${SITE}/api/images/<key>` (giống SafeImage.toProxiedUrl)
 *   - URL local "/..."   -> gọi `${SITE}/...`
 *   - URL ngoài (enka, wikia...) -> gọi thẳng
 *
 * Phần A: các cột ảnh trong DB (Character, Material, Weapon, ArtifactSet, Domain).
 * Phần B: các danh mục lấy ảnh từ src/data/images/*.json (enemy, food, animal,
 *         namecard, geography, outfit, windglider, achievement-group) — báo cáo R2
 *         cũ KHÔNG phủ phần này. Mỗi mục thử lần lượt các ứng viên như
 *         imageCandidates(); chỉ tính là lỗi nếu KHÔNG ứng viên nào sống.
 *
 * Chạy:
 *   SITE=https://<domain-production-cua-ban> \
 *   npx tsx --env-file=.env scripts/check/check-live-images.ts
 *
 * Kết quả: in tổng kết ra console + ghi scripts/data/live-image-check.json.
 */

import fs from "node:fs";
import path from "node:path";
import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import { prisma } from "../../src/lib/db/prisma";
import { imageCandidates, type ImageEntry } from "../../src/core/game/image-urls";

const SITE = (process.env.SITE ?? "").replace(/\/+$/, "");
if (!SITE) {
  console.error("Thiếu biến SITE (vd SITE=https://leibo.example.com)");
  process.exit(1);
}

const CONCURRENCY = 8;
const TIMEOUT_MS = 15000;

type Result = { ok: boolean; status: number | string; via: string };

function toRequestUrl(url: string): string {
  const r2 = /^https:\/\/[a-z0-9-]+\.r2\.dev\/(.+)$/i.exec(url);
  if (r2) return `${SITE}/api/images/${r2[1]}`;
  if (url.startsWith("/")) return `${SITE}${encodeURI(url)}`;
  return url;
}

const cache = new Map<string, Promise<Result>>();

function probe(url: string): Promise<Result> {
  const reqUrl = toRequestUrl(url);
  let p = cache.get(reqUrl);
  if (!p) {
    p = (async (): Promise<Result> => {
      try {
        const res = await fetch(reqUrl, {
          signal: AbortSignal.timeout(TIMEOUT_MS),
          headers: { "User-Agent": "Mozilla/5.0 image-check" },
        });
        const type = res.headers.get("content-type") ?? "";
        await res.body?.cancel();
        const ok = res.status === 200 && (type.startsWith("image/") || type.includes("svg"));
        return { ok, status: ok ? 200 : `${res.status} ${type}`.trim(), via: reqUrl };
      } catch (e) {
        return { ok: false, status: `ERR ${(e as Error).name}`, via: reqUrl };
      }
    })();
    cache.set(reqUrl, p);
  }
  return p;
}

async function pool<T, R>(items: T[], fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    })
  );
  return out;
}

type Row = { group: string; id: string; urls: string[] };

async function collectDb(): Promise<Row[]> {
  const rows: Row[] = [];
  for (const c of await prisma.character.findMany({
    select: { id: true, iconUrl: true, sideIconUrl: true, splashUrl: true, elementIcon: true },
  })) {
    rows.push({ group: "character.icon", id: c.id, urls: [c.iconUrl].filter(Boolean) as string[] });
    rows.push({ group: "character.sideIcon", id: c.id, urls: [c.sideIconUrl].filter(Boolean) as string[] });
    rows.push({ group: "character.splash", id: c.id, urls: [c.splashUrl].filter(Boolean) as string[] });
    rows.push({ group: "character.element", id: c.id, urls: [c.elementIcon].filter(Boolean) as string[] });
  }
  for (const m of await prisma.material.findMany({ select: { id: true, iconUrl: true, iconUrlOriginal: true } }))
    rows.push({ group: "material", id: m.id, urls: [m.iconUrl, m.iconUrlOriginal].filter(Boolean) as string[] });
  for (const w of await prisma.weapon.findMany({ select: { id: true, iconUrl: true, iconUrlOriginal: true } }))
    rows.push({ group: "weapon", id: w.id, urls: [w.iconUrl, w.iconUrlOriginal].filter(Boolean) as string[] });
  for (const a of await prisma.artifactSet.findMany({ select: { id: true, iconUrl: true, iconUrlOriginal: true } }))
    rows.push({ group: "artifactSet", id: a.id, urls: [a.iconUrl, a.iconUrlOriginal].filter(Boolean) as string[] });
  for (const d of await prisma.domain.findMany({ select: { id: true, imageUrl: true, imageUrlOriginal: true } }))
    rows.push({ group: "domain", id: d.id, urls: [d.imageUrl, d.imageUrlOriginal].filter(Boolean) as string[] });
  return rows;
}

function collectJson(): Row[] {
  const dir = path.join(process.cwd(), "src", "data", "images");
  const rows: Row[] = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const map = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as Record<string, ImageEntry | undefined>;
    for (const [id, entry] of Object.entries(map)) {
      rows.push({ group: `json:${f.replace(".json", "")}`, id, urls: imageCandidates(entry) });
    }
  }
  return rows;
}

async function main() {
  const rows = [...(await collectDb()), ...collectJson()];
  console.log(`Kiểm tra ${rows.length} mục qua ${SITE} ...`);

  // Một mục "sống" nếu ứng viên NÀO đó tải được (đúng như SafeImage fallback).
  // Riêng cột chính (urls[0]) được ghi lại để biết ảnh chính có chết không.
  const results = await pool(rows, async (r) => {
    const tried: Result[] = [];
    for (const u of r.urls) {
      const res = await probe(u);
      tried.push(res);
      if (res.ok) break;
    }
    const alive = tried.some((t) => t.ok);
    return { ...r, alive, primaryOk: tried[0]?.ok ?? false, tried };
  });

  const byGroup = new Map<string, { total: number; dead: number; noUrl: number; primaryDead: number }>();
  const statusCount = new Map<string, number>();
  for (const r of results) {
    const g = byGroup.get(r.group) ?? { total: 0, dead: 0, noUrl: 0, primaryDead: 0 };
    g.total++;
    if (r.urls.length === 0) g.noUrl++;
    else if (!r.alive) {
      g.dead++;
      const key = `${r.group} -> ${String(r.tried[0]?.status)}`;
      statusCount.set(key, (statusCount.get(key) ?? 0) + 1);
    }
    if (r.urls.length && !r.primaryOk) g.primaryDead++;
    byGroup.set(r.group, g);
  }

  console.log("\nNhóm                       tổng   chết hẳn  ảnh chính lỗi  không có URL");
  for (const [g, v] of [...byGroup].sort()) {
    console.log(
      `${g.padEnd(26)} ${String(v.total).padStart(5)} ${String(v.dead).padStart(9)} ${String(v.primaryDead).padStart(13)} ${String(v.noUrl).padStart(13)}`
    );
  }
  console.log("\nMã lỗi (ứng viên đầu tiên của mục chết hẳn):");
  for (const [k, n] of [...statusCount].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${k}`);

  const out = path.join(process.cwd(), "scripts", "data", "live-image-check.json");
  fs.writeFileSync(
    out,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        site: SITE,
        dead: results.filter((r) => r.urls.length && !r.alive).map((r) => ({ group: r.group, id: r.id, tried: r.tried })),
      },
      null,
      2
    )
  );
  console.log(`\nChi tiết các mục chết hẳn: ${out}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
