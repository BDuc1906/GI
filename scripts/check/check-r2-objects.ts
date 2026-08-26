import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import fs from "fs";
import path from "path";
import { prisma } from "../../src/lib/db/prisma";
import { createR2Client, isPrivateR2Endpoint } from "../lib/r2-client";
import { HeadObjectCommand } from "@aws-sdk/client-s3";

async function headObject(client: any, bucket: string, key: string) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.name || String(err) };
  }
}

/**
 * Kiểm tra URL có thực sự tải được như TRÌNH DUYỆT sẽ làm — request KHÔNG
 * chữ ký, KHÔNG credentials. Đây là bổ sung QUAN TRỌNG so với bản trước:
 * bản cũ chỉ dùng HeadObjectCommand (có ký AWS SigV4) để xác nhận object
 * tồn tại trong bucket, nên khi R2_PUBLIC_URL từng bị set nhầm thành
 * endpoint riêng tư ("<accountId>.r2.cloudflarestorage.com"), object vẫn
 * "ok": true trong report dù trình duyệt không tải được (403) — sự cố này
 * gây ra lỗi ảnh chết hàng loạt mà chính script kiểm tra lại không phát
 * hiện ra được. Giờ luôn fetch công khai thật, độc lập với việc HeadObject
 * (có ký) có pass hay không.
 */
async function checkPubliclyReachable(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    // Không cần tải hết body — chỉ cần biết status. Hủy sớm để tiết kiệm băng thông.
    res.body?.cancel?.();
    return { ok: res.ok, status: res.status };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

function normalizeBase(url: string) {
  return url.replace(/\/+$/, "");
}

async function main() {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) {
    console.error("R2_PUBLIC_URL not set in environment. Aborting.");
    process.exit(1);
  }
  const baseNorm = normalizeBase(base);
  const client = createR2Client();
  const bucket = process.env.R2_BUCKET_NAME as string;

  const results: Array<{
    table: string;
    id: string;
    column: string;
    url: string;
    key?: string;
    ok?: boolean;
    error?: string;
    publiclyReachable?: boolean;
    publicCheckStatus?: number;
    publicCheckError?: string;
  }> = [];

  // helper to test a url
  async function testUrl(table: string, id: string, column: string, url: string | null | undefined) {
    if (!url) return;
    const entry: any = { table, id, column, url };

    // Cờ báo rõ trường hợp đã từng gây sự cố thật: URL trỏ vào endpoint
    // riêng tư của R2 thay vì domain public — luôn 403 với trình duyệt dù
    // object có tồn tại trong bucket hay không.
    if (isPrivateR2Endpoint(url)) {
      entry.ok = false;
      entry.error = "private-r2-endpoint";
      entry.publiclyReachable = false;
      results.push(entry);
      return;
    }

    if (!url.startsWith(baseNorm)) {
      entry.ok = false;
      entry.error = "url-not-r2";
      // Vẫn kiểm tra khả năng truy cập public thật cho các URL hotlink
      // ngoài (enka.network...) — hữu ích để biết nguồn ngoài có đang chết
      // hay không, tách biệt với vấn đề cấu hình R2.
      const publicCheck = await checkPubliclyReachable(url);
      entry.publiclyReachable = publicCheck.ok;
      entry.publicCheckStatus = publicCheck.status;
      entry.publicCheckError = publicCheck.error;
      results.push(entry);
      return;
    }

    // compute key by removing base prefix
    let key = url.substring(baseNorm.length);
    if (key.startsWith("/")) key = key.substring(1);
    entry.key = key;

    const [headRes, publicCheck] = await Promise.all([
      headObject(client, bucket, key),
      checkPubliclyReachable(url),
    ]);

    entry.publiclyReachable = publicCheck.ok;
    entry.publicCheckStatus = publicCheck.status;
    entry.publicCheckError = publicCheck.error;

    // "ok" giờ đòi hỏi CẢ HAI: object thật sự tồn tại trong bucket VÀ
    // trình duyệt (không chữ ký) tải được — trước đây chỉ cần điều kiện
    // đầu, gây báo cáo "ok": true sai lệch.
    entry.ok = !!headRes.ok && publicCheck.ok;
    if (!headRes.ok) entry.error = headRes.error;
    else if (!publicCheck.ok) entry.error = `not-publicly-reachable (status=${publicCheck.status ?? "n/a"})`;

    results.push(entry);
  }

  // Characters
  const chars = await prisma.character.findMany({ select: { id: true, iconUrl: true, sideIconUrl: true, splashUrl: true, elementIcon: true } });
  for (const c of chars) {
    await testUrl('character', c.id, 'iconUrl', c.iconUrl);
    await testUrl('character', c.id, 'sideIconUrl', c.sideIconUrl);
    await testUrl('character', c.id, 'splashUrl', c.splashUrl);
    await testUrl('character', c.id, 'elementIcon', c.elementIcon);
  }

  // Weapons
  const weapons = await prisma.weapon.findMany({ select: { id: true, iconUrl: true } });
  for (const w of weapons) await testUrl('weapon', w.id, 'iconUrl', w.iconUrl);

  // Materials
  const materials = await prisma.material.findMany({ select: { id: true, iconUrl: true } });
  for (const m of materials) await testUrl('material', m.id, 'iconUrl', m.iconUrl);

  // ArtifactSets
  const artifacts = await prisma.artifactSet.findMany({ select: { id: true, iconUrl: true } });
  for (const a of artifacts) await testUrl('artifactSet', a.id, 'iconUrl', a.iconUrl);

  // Domains
  const domains = await prisma.domain.findMany({ select: { id: true, imageUrl: true } });
  for (const d of domains) await testUrl('domain', d.id, 'imageUrl', d.imageUrl);

  const outDir = path.join(process.cwd(), 'scripts', 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `r2-check-report-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  const bad = results.filter(r => !r.ok);
  const privateEndpointCount = results.filter((r) => r.error === "private-r2-endpoint").length;
  console.log(`Checked ${results.length} entries. OK=${results.length - bad.length}, FAIL=${bad.length}`);
  if (privateEndpointCount > 0) {
    console.log(
      `⚠️  ${privateEndpointCount} URL đang trỏ vào endpoint riêng tư của R2 (luôn 403 với trình duyệt).\n` +
      `    Chạy "npm run images:fix-public-url -- --apply" để sửa (sau khi đã chỉnh đúng R2_PUBLIC_URL).`
    );
  }
  console.log(`Report saved to ${outPath}`);
  if (bad.length > 0) console.table(bad.slice(0, 30).map(b => ({ table: b.table, id: b.id, column: b.column, url: b.url, key: b.key, error: b.error })));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
