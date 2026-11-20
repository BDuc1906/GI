import fs from 'fs';
import path from 'path';

const messagesDir = path.resolve('src/messages');
const enPath = path.join(messagesDir, 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function flatten(obj, prefix = '') {
  let res = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(res, flatten(v, key));
    } else {
      res[key] = v;
    }
  }
  return res;
}

const enFlat = flatten(en);
const enKeys = Object.keys(enFlat);

const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

console.log(`Checking ${files.length} translation files against en.json (${enKeys.length} keys)...`);

for (const file of files) {
  const filePath = path.join(messagesDir, file);
  let raw = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`\n❌ [${file}] JSON PARSE ERROR: ${err.message}`);
    continue;
  }

  const flat = flatten(data);
  const keys = Object.keys(flat);
  const missing = enKeys.filter(k => !(k in flat));
  const extra = keys.filter(k => !(k in enFlat));
  
  // Check for English fallback / identical strings that shouldn't be identical
  const identicalToEn = [];
  for (const [k, v] of Object.entries(flat)) {
    if (typeof v === 'string' && v.trim().length > 3 && v === enFlat[k]) {
      // Ignore things like brand names, URLs, numbers, etc.
      if (!['Metadata.title', 'Footer.copyright', 'Common.appName', 'Hero.tagline'].includes(k)) {
        identicalToEn.push(k);
      }
    }
  }

  console.log(`\n📄 [${file}]:`);
  console.log(`  Keys: ${keys.length}/${enKeys.length}`);
  if (missing.length > 0) {
    console.log(`  ❌ Missing keys (${missing.length}):`, missing);
  } else {
    console.log(`  ✅ No missing keys!`);
  }
  if (extra.length > 0) {
    console.log(`  ℹ️  Extra keys (${extra.length}):`, extra);
  }
  if (identicalToEn.length > 0) {
    console.log(`  ⚠️  Identical to EN (${identicalToEn.length}) - sample:`, identicalToEn.slice(0, 10));
  }
}
