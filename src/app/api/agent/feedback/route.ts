import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { getContinuousLearningSystem } from "@/agent/core/continuous-learning";

export const dynamic = "force-dynamic";

export const POST = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const body = await req.json();
    
    // Validate required fields
    if (!body.sessionId || !body.messageId || !body.feedback || !body.rating) {
      return fail(400, "BAD_REQUEST", "Missing required fields: sessionId, messageId, feedback, rating");
    }
    
    // Validate rating range
    if (body.rating < 1 || body.rating > 5) {
      return fail(400, "BAD_REQUEST", "Rating must be between 1 and 5");
    }
    
    // Validate category
    const validCategories = ["accuracy", "helpfulness", "clarity", "completeness", "other"];
    if (!validCategories.includes(body.category)) {
      return fail(400, "BAD_REQUEST", `Invalid category. Must be one of: ${validCategories.join(", ")}`);
    }
    
    const learningSystem = getContinuousLearningSystem();
    
    await learningSystem.collectFeedback({
      sessionId: body.sessionId,
      userId: body.userId || "anonymous",
      messageId: body.messageId,
      feedback: body.feedback,
      rating: body.rating,
      comment: body.comment || "",
      category: body.category
    });
    
    return ok({ 
      success: true, 
      message: "Feedback collected successfully" 
    });
  }, { prefix: "agent-feedback" })
);

export const GET = withErrorHandling(
  withRateLimit(async (_req: NextRequest) => {
    const learningSystem = getContinuousLearningSystem();
    const metrics = learningSystem.getMetrics();
    const suggestions = learningSystem.suggestPromptImprovements();
    
    return ok({
      metrics,
      suggestions,
      knowledgeUpdates: learningSystem.getKnowledgeUpdates()
    });
  }, { prefix: "agent-feedback" })
);