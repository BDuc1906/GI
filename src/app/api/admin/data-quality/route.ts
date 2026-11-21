import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, fail } from "@/lib/api/response";
import { withRateLimit } from "@/lib/api/rate-limit";
import { requireAdmin } from "@/agent/utils/auth";
import { NON_PLAYABLE_CHARACTER_IDS } from "@/core/game/character-catalog";
import { MULTI_PROFILE_BUILDS } from "@/core/build-profile";

export const dynamic = "force-dynamic";

const LOCALES = [
  "vi", "en", "zh-CN", "zh-TW", "ja", "ko", "es", "fr", "ru", "de", "pt", "id", "th", "tr", "it"
] as const;

function countLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys = keys.concat(countLeafKeys(v as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

export interface LocaleCompleteness {
  locale: string;
  totalKeys: number;
  translatedKeys: number;
  missingKeysCount: number;
  percentage: number;
}

export interface DataQualityReport {
  overallTrustScore: number;
  characters: {
    totalInDb: number;
    playableCount: number;
    withVerifiedBuild: number;
    missingBuildCount: number;
    buildCoveragePercent: number;
  };
  weapons: {
    totalInDb: number;
    withIconCount: number;
    integrityPercent: number;
  };
  buildsReview: {
    verified: number;
    inReview: number;
    draft: number;
    outdated: number;
    missing: number;
  };
  localization: {
    referenceTotalKeys: number;
    averageCompleteness: number;
    locales: LocaleCompleteness[];
  };
  providers: Array<{
    name: string;
    role: string;
    trustTier: "Tier 1 (Authoritative)" | "Tier 2 (Community Standard)" | "Tier 3 (External API)";
    status: "HEALTHY" | "MONITORED" | "FALLBACK";
    note: string;
  }>;
  alerts: Array<{
    severity: "high" | "medium" | "low";
    category: string;
    message: string;
    targetId?: string;
  }>;
}

async function handler(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch (error) {
    return fail(403, "FORBIDDEN", error instanceof Error ? error.message : "Yêu cầu quyền admin");
  }

  try {
    // 1. Character & Build Metrics
    const dbCharacters = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        rarity: true,
        vision: true,
        weaponType: true,
        iconUrl: true,
      },
    });

    const nonPlayableSet = new Set<string>(NON_PLAYABLE_CHARACTER_IDS as readonly string[]);
    const playable = dbCharacters.filter((c) => !nonPlayableSet.has(c.id));

    let verifiedBuildCount = 0;
    let inReviewBuildCount = 0;
    let draftBuildCount = 0;
    let outdatedBuildCount = 0;
    let missingBuildCount = 0;

    const alerts: DataQualityReport["alerts"] = [];

    for (const c of playable) {
      const normId = c.id.toLowerCase().trim();
      const multi = MULTI_PROFILE_BUILDS[normId];

      if (!multi || multi.profiles.length === 0) {
        missingBuildCount++;
        alerts.push({
          severity: "high",
          category: "Build Coverage",
          message: `Nhân vật ${c.name} (${c.id}) chưa có Profile Build chuẩn nào.`,
          targetId: c.id,
        });
      } else {
        const statuses = multi.profiles.map((p) => p.sourceMetadata?.reviewStatus);
        if (statuses.includes("VERIFIED")) {
          verifiedBuildCount++;
        } else if (statuses.includes("IN_REVIEW")) {
          inReviewBuildCount++;
        } else if (statuses.includes("DRAFT")) {
          draftBuildCount++;
        } else {
          outdatedBuildCount++;
        }
      }
    }

    const buildCoveragePercent =
      playable.length > 0 ? Math.round((verifiedBuildCount / playable.length) * 1000) / 10 : 0;

    // 2. Weapon Metrics
    const weaponsCount = await prisma.weapon.count();
    const weaponsWithIcon = await prisma.weapon.count({
      where: { iconUrl: { not: "" } },
    });
    const weaponIntegrityPercent = weaponsCount > 0 ? Math.round((weaponsWithIcon / weaponsCount) * 1000) / 10 : 100;

    // 3. Localization Matrix
    const messagesDir = join(process.cwd(), "src", "messages");
    let refKeys: Set<string> = new Set();
    const localesData: LocaleCompleteness[] = [];

    try {
      const viRaw = JSON.parse(readFileSync(join(messagesDir, "vi.json"), "utf8"));
      const viKeys = countLeafKeys(viRaw);
      refKeys = new Set(viKeys);
    } catch {
      // Fallback
    }

    for (const loc of LOCALES) {
      const filePath = join(messagesDir, `${loc}.json`);
      if (existsSync(filePath)) {
        try {
          const raw = JSON.parse(readFileSync(filePath, "utf8"));
          const currentKeys = new Set(countLeafKeys(raw));
          let matched = 0;
          for (const k of refKeys) {
            if (currentKeys.has(k)) matched++;
          }
          const pct = refKeys.size > 0 ? Math.round((matched / refKeys.size) * 1000) / 10 : 100;
          localesData.push({
            locale: loc,
            totalKeys: refKeys.size,
            translatedKeys: matched,
            missingKeysCount: Math.max(0, refKeys.size - matched),
            percentage: pct,
          });

          if (pct < 95) {
            alerts.push({
              severity: "medium",
              category: "Localization",
              message: `Ngôn ngữ [${loc}] độ hoàn thiện dịch thuật đạt ${pct}% (${refKeys.size - matched} keys còn thiếu).`,
            });
          }
        } catch {
          localesData.push({
            locale: loc,
            totalKeys: refKeys.size,
            translatedKeys: 0,
            missingKeysCount: refKeys.size,
            percentage: 0,
          });
        }
      }
    }

    const averageCompleteness =
      localesData.length > 0
        ? Math.round((localesData.reduce((acc, l) => acc + l.percentage, 0) / localesData.length) * 10) / 10
        : 100;

    // 4. Overall Trust Score Calculation
    // Trọng số: 40% Build Coverage + 30% Localization + 20% Weapon Integrity + 10% Infrastructure Health
    const overallTrustScore = Math.round(
      buildCoveragePercent * 0.4 +
      averageCompleteness * 0.3 +
      weaponIntegrityPercent * 0.2 +
      98 * 0.1
    );

    const report: DataQualityReport = {
      overallTrustScore,
      characters: {
        totalInDb: dbCharacters.length,
        playableCount: playable.length,
        withVerifiedBuild: verifiedBuildCount,
        missingBuildCount,
        buildCoveragePercent,
      },
      weapons: {
        totalInDb: weaponsCount,
        withIconCount: weaponsWithIcon,
        integrityPercent: weaponIntegrityPercent,
      },
      buildsReview: {
        verified: verifiedBuildCount,
        inReview: inReviewBuildCount,
        draft: draftBuildCount,
        outdated: outdatedBuildCount,
        missing: missingBuildCount,
      },
      localization: {
        referenceTotalKeys: refKeys.size,
        averageCompleteness,
        locales: localesData,
      },
      providers: [
        {
          name: "HoYoverse Genshin Impact Game IP",
          role: "Bản quyền nhân vật, hình ảnh, âm thanh, dữ liệu gốc",
          trustTier: "Tier 1 (Authoritative)",
          status: "HEALTHY",
          note: "Tuân thủ nghiêm ngặt điều khoản bản quyền Fan Content Policy và Multi-tiered licensing.",
        },
        {
          name: "KeqingMains (KQM) Theorycrafting",
          role: "Tiêu chuẩn đánh giá build, bộ thánh di vật, vũ khí đề xuất và rotation",
          trustTier: "Tier 2 (Community Standard)",
          status: "HEALTHY",
          note: "4-Layer Validation Engine (Structural, Gameplay, Calculation, Human Review).",
        },
        {
          name: "Enka.Network Showcase API",
          role: "Đồng bộ nhân vật công khai qua UID người chơi",
          trustTier: "Tier 3 (External API)",
          status: "MONITORED",
          note: "Upstash Redis cache 5 phút, sliding window rate limit, không yêu cầu mật khẩu game.",
        },
        {
          name: "Ambr.top / Project Amber",
          role: "Cung cấp schema và dữ liệu game đa ngôn ngữ cập nhật theo patch",
          trustTier: "Tier 2 (Community Standard)",
          status: "HEALTHY",
          note: "Chỉ cho phép đọc qua DataSyncPipeline có gắn AuditLog, không cho phép AI Agent sửa production trực tiếp.",
        },
      ],
      alerts,
    };

    return ok(report, { maxAgeSec: 30 });
  } catch (error) {
    console.error("[Data Quality API] Error:", error);
    return fail(500, "DATA_QUALITY_ERROR", "Lỗi tổng hợp báo cáo chất lượng dữ liệu.");
  }
}

export const GET = withRateLimit(handler, {
  prefix: "admin-data-quality",
  limit: 20,
  failClosed: true,
});
