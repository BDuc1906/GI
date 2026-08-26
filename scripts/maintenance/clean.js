#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function rmSafe(p) {
  try {
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      if (stat.isDirectory()) fs.rmSync(p, { recursive: true, force: true });
      else fs.rmSync(p, { force: true });
      console.log('Removed', p);
    }
  } catch (err) {
    console.warn('Failed to remove', p, err && err.message);
  }
}

function moveReportsToArchive() {
  const dataDir = path.join(process.cwd(), 'scripts', 'data');
  const archiveDir = path.join(dataDir, 'archive');
  try {
    if (!fs.existsSync(dataDir)) return;
    if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
    const files = fs.readdirSync(dataDir).filter(f => /^r2-check-report-.*\.json$/.test(f));
    for (const f of files) {
      const src = path.join(dataDir, f);
      const dst = path.join(archiveDir, f);
      fs.renameSync(src, dst);
      console.log('Archived', f);
    }
  } catch (err) {
    console.warn('Archive step failed:', err && err.message);
  }
}

console.log('Cleaning project caches and archiving reports...');

// 1) Archive reports
moveReportsToArchive();

// 2) Remove common build/cache artifacts (safe to regenerate)
const toRemove = [
  path.join(process.cwd(), '.next'),
  path.join(process.cwd(), 'tsconfig.tsbuildinfo'),
  path.join(process.cwd(), 'node_modules', '.cache'),
  path.join(process.cwd(), '.cache'),
];
for (const p of toRemove) rmSafe(p);

console.log('Clean complete. To rebuild caches run `npm run dev` or `npm run build`.');
