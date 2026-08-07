import { assertEnv } from '../src/lib/env';

assertEnv();

// Chỉ log host, không log full connection string
{
  const dbUrl = new URL(process.env.DATABASE_URL as string);
  console.log(`DB đang dùng: ${dbUrl.protocol}//${dbUrl.hostname}:${dbUrl.port || '5432'}${dbUrl.pathname}`);
}

import { prisma } from '../src/lib/prisma';
import { seedCharacters } from './seed-characters';
import { seedWeapons } from './seed-weapons';
import { seedArtifacts } from './seed-artifacts';
import { seedDomains } from './seed-domains';
import { printMissingIconSummary } from './lib/seed-helpers';
import { notifyOps } from '../src/lib/notify';
import { logger } from '../src/lib/logger';
import { startPipeline, endPipelineSuccess, endPipelineFailure } from './lib/pipeline-logger';

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
    logger.error('❌ Seeding halted due to critical error', { error });
    await endPipelineFailure(pipeline.id, errMsg);

    await notifyOps({
      source: 'seed',
      severity: 'error',
      title: 'Seed database thất bại, dừng giữa chừng',
      detail: errMsg,
    });

    console.error('❌ Seeding halted due to critical error:');
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    logger.error('Unhandled error in seed', { error: e });
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });