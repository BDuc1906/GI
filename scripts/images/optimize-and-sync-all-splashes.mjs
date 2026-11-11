import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SPLASH_DIR = path.resolve('public/local-genshin-assets/characters/splash');

async function run() {
  console.log('🚀 Bắt đầu tối ưu hóa và nén toàn bộ Splash Art nhân vật...');
  if (!fs.existsSync(SPLASH_DIR)) {
    console.error('Không tìm thấy thư mục splash:', SPLASH_DIR);
    process.exit(1);
  }

  const allFiles = fs.readdirSync(SPLASH_DIR);
  const pngFiles = allFiles.filter((f) => f.toLowerCase().endsWith('.png'));
  console.log(`Tìm thấy ${pngFiles.length} file PNG splash art.`);

  let totalOriginalBytes = 0;
  let totalWebpBytes = 0;
  let convertedCount = 0;

  // 1. Chuyển đổi và nén từng file sang WebP (giữ nguyên độ trong suốt alpha, chất lượng cao 85)
  for (let i = 0; i < pngFiles.length; i++) {
    const file = pngFiles[i];
    const srcPath = path.join(SPLASH_DIR, file);
    const destWebp = path.join(SPLASH_DIR, file.replace(/\.png$/i, '.webp'));

    const originalStat = fs.statSync(srcPath);
    totalOriginalBytes += originalStat.size;

    try {
      const img = sharp(srcPath);
      const meta = await img.metadata();

      // Giới hạn chiều dài/rộng tối đa 1920px để tối ưu dung lượng web
      let pipeline = sharp(srcPath);
      if ((meta.width && meta.width > 1920) || (meta.height && meta.height > 1920)) {
        pipeline = pipeline.resize({
          width: 1920,
          height: 1920,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      await pipeline
        .webp({ quality: 85, effort: 4 })
        .toFile(destWebp);

      const webpStat = fs.statSync(destWebp);
      totalWebpBytes += webpStat.size;
      convertedCount++;

      if ((i + 1) % 25 === 0 || i === pngFiles.length - 1) {
        console.log(`Đã nén ${i + 1}/${pngFiles.length} ảnh WebP...`);
      }
    } catch (err) {
      console.warn(`Lỗi khi nén ${file}:`, err.message);
    }
  }

  const origMB = (totalOriginalBytes / (1024 * 1024)).toFixed(2);
  const webpMB = (totalWebpBytes / (1024 * 1024)).toFixed(2);
  const savedPercent = (((totalOriginalBytes - totalWebpBytes) / totalOriginalBytes) * 100).toFixed(1);
  console.log(`\n🎉 Nén WebP hoàn tất:`);
  console.log(`- Dung lượng gốc PNG: ${origMB} MB`);
  console.log(`- Dung lượng sau nén WebP: ${webpMB} MB`);
  console.log(`- Tiết kiệm: ${savedPercent}% băng thông tải web!\n`);

  // 2. Map và liên kết từng nhân vật trong Database
  console.log('🔄 Đang đồng bộ và cập nhật đường dẫn Splash Art vào Database...');
  const chars = await prisma.character.findMany({
    select: { id: true, name: true, genshinDbId: true },
    orderBy: { name: 'asc' },
  });

  const diskFiles = fs.readdirSync(SPLASH_DIR);
  const fileSet = new Set(diskFiles.map((f) => f.toLowerCase()));

  let updatedCount = 0;
  const updates = [];

  for (const c of chars) {
    let matchedFile = null;

    if (fileSet.has(`${c.id.toLowerCase()}.webp`)) {
      matchedFile = `${c.id.toLowerCase()}.webp`;
    } else if (c.id.startsWith('traveler-boy-') && fileSet.has('aether.webp')) {
      matchedFile = 'aether.webp';
      // Tạo bản sao mang đúng slug nhân vật để truy cập trực tiếp cực nhanh
      const targetWebp = path.join(SPLASH_DIR, `${c.id}.webp`);
      if (!fs.existsSync(targetWebp)) {
        fs.copyFileSync(path.join(SPLASH_DIR, 'aether.webp'), targetWebp);
      }
      matchedFile = `${c.id}.webp`;
    } else if (c.id.startsWith('traveler-girl-') && fileSet.has('lumine.webp')) {
      matchedFile = 'lumine.webp';
      const targetWebp = path.join(SPLASH_DIR, `${c.id}.webp`);
      if (!fs.existsSync(targetWebp)) {
        fs.copyFileSync(path.join(SPLASH_DIR, 'lumine.webp'), targetWebp);
      }
      matchedFile = `${c.id}.webp`;
    } else if (c.genshinDbId && fileSet.has(`${c.genshinDbId.toLowerCase()}.webp`)) {
      const srcName = diskFiles.find((f) => f.toLowerCase() === `${c.genshinDbId.toLowerCase()}.webp`);
      matchedFile = srcName;
      // Tạo alias theo id
      const targetWebp = path.join(SPLASH_DIR, `${c.id}.webp`);
      if (!fs.existsSync(targetWebp)) {
        fs.copyFileSync(path.join(SPLASH_DIR, srcName), targetWebp);
      }
      matchedFile = `${c.id}.webp`;
    } else {
      // Fuzzy tìm theo tên
      const cleanName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = diskFiles.find((f) => {
        if (!f.toLowerCase().endsWith('.webp')) return false;
        const stem = f.toLowerCase().replace(/\.webp$/, '').replace(/[^a-z0-9]/g, '');
        return stem === cleanName || stem.startsWith(cleanName);
      });
      if (found) {
        const targetWebp = path.join(SPLASH_DIR, `${c.id}.webp`);
        if (!fs.existsSync(targetWebp)) {
          fs.copyFileSync(path.join(SPLASH_DIR, found), targetWebp);
        }
        matchedFile = `${c.id}.webp`;
      }
    }

    if (matchedFile) {
      const newUrl = `/local-genshin-assets/characters/splash/${matchedFile}`;
      updates.push(
        prisma.character.update({
          where: { id: c.id },
          data: { splashUrl: newUrl },
        })
      );
      updatedCount++;
    } else {
      console.warn(`⚠️ Không tìm thấy splash art cho: ${c.name} (${c.id})`);
    }
  }

  // Chạy cập nhật database theo lô
  for (let i = 0; i < updates.length; i += 20) {
    const chunk = updates.slice(i, i + 20);
    await Promise.all(chunk);
  }

  console.log(`✅ Đã cập nhật thành công ${updatedCount}/${chars.length} nhân vật trong Database với URL Splash Art tối ưu WebP!`);
}

run()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('Lỗi khi thực thi:', err);
    process.exit(1);
  });
