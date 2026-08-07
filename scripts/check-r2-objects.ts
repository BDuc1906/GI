import { assertEnv } from "../src/lib/env";
assertEnv();

import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma";
import { createR2Client } from "./lib/r2-client";
import { HeadObjectCommand } from "@aws-sdk/client-s3";

async function headObject(client: any, bucket: string, key: string) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.name || String(err) };
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

  const results: Array<{ table: string; id: string; column: string; url: string; key?: string; ok?: boolean; error?: string }> = [];

  // helper to test a url
  async function testUrl(table: string, id: string, column: string, url: string | null | undefined) {
    if (!url) return;
    const entry: any = { table, id, column, url };
    if (!url.startsWith(baseNorm)) {
      entry.ok = false;
      entry.error = 'url-not-r2';
      results.push(entry);
      return;
    }
    // compute key by removing base prefix
    let key = url.substring(baseNorm.length);
    if (key.startsWith('/')) key = key.substring(1);
    entry.key = key;
    const res = await headObject(client, bucket, key);
    entry.ok = !!res.ok;
    if (!res.ok) entry.error = res.error;
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
  console.log(`Checked ${results.length} entries. OK=${results.length - bad.length}, FAIL=${bad.length}`);
  console.log(`Report saved to ${outPath}`);
  if (bad.length > 0) console.table(bad.slice(0, 30).map(b => ({ table: b.table, id: b.id, column: b.column, url: b.url, key: b.key, error: b.error })));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
