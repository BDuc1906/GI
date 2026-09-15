
import { assertEnv } from "../../src/lib/infra/env";

assertEnv();

// Chỉ log host, không log full connection string
{
  const dbUrl = new URL(process.env.DATABASE_URL as string);
  console.log(`DB đang dùng: ${dbUrl.protocol}//${dbUrl.hostname}:${dbUrl.port || '5432'}${dbUrl.pathname}`);
}

import { prisma } from "../../src/lib/db/prisma";
import { seedCharacters } from './seed-characters';
import { seedWeapons } from './seed-weapons';
import { seedArtifacts } from './seed-artifacts';
import { seedDomains } from './seed-domains';
import { seedExtra } from './seed-extra';
import { printMissingIconSummary } from '../lib/seed-helpers';
import { notifyOps } from "../../src/lib/infra/notify";
import { logger } from "../../src/lib/infra/logger";
import { startPipeline, endPipelineSuccess, endPipelineFailure } from '../lib/pipeline-logger';

async function main(): Promise<void> {
  const pipeline = await startPipeline('seed');

  logger.info('🚀 Bắt đầu seed database với dữ liệu Genshin Impact (genshin-db)...');
  const startTime = Date.now();

  try {
    logger.info('📦 Đang seed bảng Character...');
    await seedCharacters();

    logger.info('📦 Đang seed bảng Weapon...');
    await seedWeapons();

    logger.info('📦 Đang seed bảng ArtifactSet...');
    await seedArtifacts();

    logger.info('📦 Đang seed bảng Domain...');
    await seedDomains();

    logger.info('📦 Đang seed 15 bảng dữ liệu bổ sung (achievements, enemies, foods, ...)...');
    await seedExtra();
    
    printMissingIconSummary();

    const duration = Date.now() - startTime;
    logger.info('✅ ALL DATA SEEDED SUCCESSFULLY', { durationMs: duration });

    // Lấy thống kê số lượng
    const [characters, weapons, artifacts, domains, materials] = await Promise.all([
      prisma.character.count(),
      prisma.weapon.count(),
      prisma.artifactSet.count(),
      prisma.domain.count(),
      prisma.material.count(),
    ]);

    await endPipelineSuccess(pipeline.id, {
      rowsAffected: characters + weapons + artifacts + domains + materials,
      characters,
      weapons,
      artifacts,
      domains,
      materials,
    });

    await notifyOps({
      source: 'seed',
      severity: 'info',
      title: `Seed thành công (${duration}ms)`,
      detail: `Characters: ${characters}, Weapons: ${weapons}, Artifacts: ${artifacts}, Domains: ${domains}, Materials: ${materials}`,
    });

    console.log('=== ALL DATA SEEDED SUCCESSFULLY ===');
  } catch (error) {
    const errMsg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    // BUG ĐÃ SỬA (2026-09): trước đây `logger.error(msg, { error })` truyền
    // thẳng object Error — winston (định dạng JSON ở production) không tự
    // serialize được Error (message/stack là non-enumerable), luôn in ra
    // "error":{} rỗng, không có cách nào biết lỗi thật là gì từ log CI.
    logger.error('❌ Seeding halted due to critical error', { error: errMsg, stack: errStack });

    // BUG ĐÃ SỬA: 2 lệnh dưới đây (ghi trạng thái fail vào DB + gửi
    // Discord webhook) trước đây gọi trực tiếp KHÔNG có try/catch riêng —
    // nếu chính DB write ở endPipelineFailure() cũng thất bại (thường
    // cùng nguyên nhân gốc với lỗi seed ban đầu, vd Neon tạm ngắt kết
    // nối), nó ném lỗi MỚI khiến code nhảy thẳng ra khỏi catch block,
    // KHÔNG BAO GIỜ chạy tới console.error(error)/process.exit(1) bên
    // dưới — log CI dừng đột ngột ngay sau dòng logger.error(), không có
    // cách nào biết lỗi gốc là gì. Bọc riêng để 1 lỗi phụ không nuốt mất
    // lỗi chính.
    try {
      await endPipelineFailure(pipeline.id, errMsg);
    } catch (secondaryError) {
      console.error('⚠️ Không ghi được trạng thái fail vào DB (lỗi phụ, không phải lỗi seed gốc):', secondaryError);
    }

    try {
      await notifyOps({
        source: 'seed',
        severity: 'error',
        title: 'Seed database thất bại, dừng giữa chừng',
        detail: errMsg,
      });
    } catch (secondaryError) {
      console.error('⚠️ Không gửi được thông báo Discord (lỗi phụ, không phải lỗi seed gốc):', secondaryError);
    }

    // Luôn in đủ lỗi GỐC ra console — CHẮC CHẮN chạy được dù 2 khối try/
    // catch ở trên có lỗi phụ hay không, vì giờ nằm sau khi đã catch hết.
    console.error('❌ Seeding halted due to critical error:');
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    logger.error('Unhandled error in seed', { error: msg, stack });
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
