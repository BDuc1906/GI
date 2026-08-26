import type { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from "@/lib/db/prisma";
import { ok } from '@/lib/api/response';
import { withErrorHandling } from '@/lib/api/errors';
import { withRateLimit } from '@/lib/api/rate-limit';
import { buildMeta, parsePagination, parseRarityList, parseSort } from '@/lib/api/query';
import { logger } from "@/lib/infra/logger"; // Thêm dòng này

export const revalidate = 60;
export const dynamic = 'force-dynamic';

const SORT_FIELDS = ['name', 'rarity', 'createdAt'] as const;
const LIST_SELECT = {
  id: true,
  name: true,
  title: true,
  vision: true,
  weaponType: true,
  rarity: true,
  region: true,
  iconUrl: true,
  elementIcon: true,
} satisfies Prisma.CharacterSelect;

export const GET = withErrorHandling(
  withRateLimit(
    async (req: NextRequest) => {
      const requestId = req.headers.get('x-request-id') || 'unknown';
      const { searchParams } = new URL(req.url);
      const pagination = parsePagination(searchParams);
      const sort = parseSort(searchParams.get('sort'), SORT_FIELDS, { field: 'rarity', dir: 'desc' });
      const rarity = parseRarityList(searchParams.get('rarity'));

      const q = searchParams.get('q')?.trim();
      const vision = splitList(searchParams.get('vision'));
      const weaponType = splitList(searchParams.get('weaponType'));

      const where: Prisma.CharacterWhereInput = {
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
        ...(vision ? { vision: { in: vision, mode: 'insensitive' } } : {}),
        ...(weaponType ? { weaponType: { in: weaponType, mode: 'insensitive' } } : {}),
        ...(rarity ? { rarity: { in: rarity } } : {}),
      };

      const orderBy: Prisma.CharacterOrderByWithRelationInput[] =
        sort.field === 'name'
          ? [{ name: sort.dir }]
          : [{ [sort.field]: sort.dir }, { name: 'asc' }];

      const [items, total] = await Promise.all([
        prisma.character.findMany({
          where,
          orderBy,
          skip: pagination.skip,
          take: pagination.take,
          select: LIST_SELECT,
        }),
        prisma.character.count({ where }),
      ]);

      // Log kết quả
      logger.info('Characters list fetched', {
        requestId,
        count: items.length,
        total,
        page: pagination.page,
        limit: pagination.limit,
        filters: { q, vision, weaponType, rarity },
        sort,
      });

      return ok(items, { meta: buildMeta(pagination, total) });
    },
    { prefix: 'characters' }
  )
);

function splitList(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  const list = raw.split(',').map((v) => v.trim()).filter(Boolean);
  return list.length ? list : undefined;
}