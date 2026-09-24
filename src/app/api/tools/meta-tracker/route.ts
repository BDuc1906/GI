import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { MetaTracker } from "@/lib/game/meta-tracker";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const metaTracker = new MetaTracker();

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "general";

    let result;

    switch (reportType) {
      case "general":
        result = metaTracker.generateMetaReport();
        break;
      case "characters":
        result = metaTracker.getCurrentMeta();
        break;
      case "teams":
        result = metaTracker.getTopMetaTeams(5);
        break;
      case "counters":
        const characterId = searchParams.get("characterId");
        result = characterId ? metaTracker.analyzeCounterRelationships(characterId) : { counters: [], weakAgainst: [] };
        break;
      default:
        result = metaTracker.generateMetaReport();
    }

    return ok(result, { maxAgeSec: 300 });
  }, { prefix: "meta-tracker", limit: 10 })
);