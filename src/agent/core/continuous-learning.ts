// src/agent/core/continuous-learning.ts
/**
 * Continuous Learning System cho AI Agent
 * 
 * Features:
 * 1. User feedback collection
 * 2. Feedback analysis and learning
 * 3. Knowledge base updates based on feedback
 * 4. Performance tracking and improvement
 * 5. Adaptive prompt optimization
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

interface UserFeedback {
  sessionId: string;
  userId: string;
  messageId: string;
  feedback: "positive" | "negative" | "neutral";
  rating: number; // 1-5
  comment: string;
  category: "accuracy" | "helpfulness" | "clarity" | "completeness" | "other";
  timestamp: Date;
}

interface LearningMetrics {
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  averageRating: number;
  accuracyScore: number;
  helpfulnessScore: number;
  categoryScores: Record<string, number>;
}

interface KnowledgeUpdate {
  type: "add" | "update" | "remove";
  category: string;
  content: string;
  confidence: number;
  source: "user_feedback" | "system" | "manual";
  timestamp: Date;
}

/**
 * Tính `LearningMetrics` từ một MẢNG feedback (đã sắp xếp theo thời
 * gian) — logic giống hệt `updateMetrics()` gốc (exponential moving
 * average cho categoryScores, mean động cho averageRating) nhưng viết
 * dạng HÀM THUẦN (fold trên mảng) thay vì mutate state instance, để
 * `getMetrics()` DB-driven tái dùng được và để test được không cần mock
 * Prisma/DB.
 */
export function computeMetricsFromFeedback(feedbackList: UserFeedback[]): LearningMetrics {
  const metrics: LearningMetrics = {
    totalFeedback: 0,
    positiveFeedback: 0,
    negativeFeedback: 0,
    averageRating: 0,
    accuracyScore: 0.5,
    helpfulnessScore: 0.5,
    categoryScores: {},
  };

  for (const feedback of feedbackList) {
    metrics.totalFeedback++;
    if (feedback.feedback === "positive") metrics.positiveFeedback++;
    else if (feedback.feedback === "negative") metrics.negativeFeedback++;

    const totalRating = metrics.averageRating * (metrics.totalFeedback - 1) + feedback.rating;
    metrics.averageRating = totalRating / metrics.totalFeedback;

    if (!metrics.categoryScores[feedback.category]) {
      metrics.categoryScores[feedback.category] = 0.5;
    }
    const ratingNormalized = (feedback.rating - 1) / 4;
    metrics.categoryScores[feedback.category] =
      metrics.categoryScores[feedback.category] * 0.9 + ratingNormalized * 0.1;

    if (feedback.category === "accuracy") {
      metrics.accuracyScore = metrics.categoryScores[feedback.category];
    } else if (feedback.category === "helpfulness") {
      metrics.helpfulnessScore = metrics.categoryScores[feedback.category];
    }
  }

  return metrics;
}

/**
 * Gợi ý cải thiện prompt dựa trên metrics đã tính — tách thành hàm thuần
 * (nhận metrics làm tham số) thay vì đọc `this.metrics`, vì `getMetrics()`
 * giờ tính động từ DB thay vì đọc state instance (xem comment ở đó).
 */
export function suggestPromptImprovementsFor(metrics: LearningMetrics): string[] {
  const suggestions: string[] = [];

  if (metrics.accuracyScore < 0.6) {
    suggestions.push("Consider improving RAG knowledge base for better accuracy");
  }
  if (metrics.helpfulnessScore < 0.6) {
    suggestions.push("Consider adding more detailed explanations and examples");
  }
  if ((metrics.categoryScores["clarity"] ?? 0.5) < 0.6) {
    suggestions.push("Consider simplifying responses and using clearer language");
  }
  if ((metrics.categoryScores["completeness"] ?? 0.5) < 0.6) {
    suggestions.push("Consider providing more comprehensive answers covering all aspects");
  }

  return suggestions;
}

class ContinuousLearningSystem {
  // ⚠️ GIỚI HẠN CÒN LẠI (chưa sửa, ghi rõ để không ai tưởng đã hoàn
  // thiện): `feedbackBuffer` và `knowledgeUpdates` VẪN in-memory — trên
  // serverless nhiều instance, ngưỡng "đủ 10 feedback thì tự tạo
  // knowledge update" (`processLearningBatch`) có thể không bao giờ đạt
  // đúng vì feedback rải rác qua nhiều instance khác nhau, và
  // `knowledgeUpdates` sinh ra có thể mất khi instance đó bị thu hồi.
  // Khác với `getMetrics()` (đã sửa, tính từ DB) — mục "Knowledge Updates
  // Pending" trong report vẫn có thể không phản ánh đúng thực tế. Muốn
  // sửa triệt để cần 1 bảng DB riêng cho `KnowledgeUpdate` (việc lớn hơn,
  // cần quyết định schema — để lại cho lần sau).
  private feedbackBuffer: UserFeedback[] = [];
  private knowledgeUpdates: KnowledgeUpdate[] = [];
  private metrics: LearningMetrics = {
    totalFeedback: 0,
    positiveFeedback: 0,
    negativeFeedback: 0,
    averageRating: 0,
    accuracyScore: 0.5,
    helpfulnessScore: 0.5,
    categoryScores: {}
  };
  
  /**
   * Collect user feedback
   */
  async collectFeedback(feedback: Omit<UserFeedback, "timestamp">): Promise<void> {
    const feedbackWithTimestamp: UserFeedback = {
      ...feedback,
      timestamp: new Date()
    };
    
    this.feedbackBuffer.push(feedbackWithTimestamp);
    
    // BUG ĐÃ SỬA (2026-09-22) — MẤT DỮ LIỆU: trước đây ghi
    // `metadata: { feedback: feedbackJson }` — GHI ĐÈ toàn bộ field
    // `metadata` mỗi lần gọi, thay vì cộng dồn. 1 session thường có NHIỀU
    // tin nhắn, mỗi tin có thể nhận feedback riêng — feedback của tin
    // nhắn trước bị XOÁ MẤT ngay khi tin nhắn sau nhận feedback mới, âm
    // thầm không báo lỗi gì. Đã sửa: đọc `metadata` hiện có trước, CỘNG
    // DỒN vào mảng `feedbackHistory` thay vì thay thế.
    try {
      const { timestamp, ...feedbackFields } = feedbackWithTimestamp;
      const feedbackJson: Prisma.InputJsonObject = {
        ...feedbackFields,
        timestamp: timestamp.toISOString(),
      };

      const existing = await prisma.agentSession.findUnique({
        where: { id: feedback.sessionId },
        select: { metadata: true },
      });
      const existingMetadata = (existing?.metadata as { feedbackHistory?: Prisma.InputJsonObject[] } | null) ?? {};
      const feedbackHistory = Array.isArray(existingMetadata.feedbackHistory) ? existingMetadata.feedbackHistory : [];

      await prisma.agentSession.update({
        where: { id: feedback.sessionId },
        data: {
          metadata: { ...existingMetadata, feedbackHistory: [...feedbackHistory, feedbackJson] },
        }
      });
    } catch (err) {
      console.error("Failed to save feedback to database:", err);
    }
    
    // Update metrics (in-memory — CHỈ đúng trong phạm vi 1 process/request;
    // xem `getMetrics()` bên dưới để biết cách tính đúng, bền vững qua DB).
    this.updateMetrics(feedbackWithTimestamp);
    
    // Trigger learning if enough feedback collected
    if (this.feedbackBuffer.length >= 10) {
      await this.processLearningBatch();
    }
  }
  
  /**
   * Update learning metrics based on feedback
   */
  private updateMetrics(feedback: UserFeedback): void {
    this.metrics.totalFeedback++;
    
    if (feedback.feedback === "positive") {
      this.metrics.positiveFeedback++;
    } else if (feedback.feedback === "negative") {
      this.metrics.negativeFeedback++;
    }
    
    // Update average rating
    const totalRating = this.metrics.averageRating * (this.metrics.totalFeedback - 1) + feedback.rating;
    this.metrics.averageRating = totalRating / this.metrics.totalFeedback;
    
    // Update category scores
    if (!this.metrics.categoryScores[feedback.category]) {
      this.metrics.categoryScores[feedback.category] = 0.5;
    }
    
    const ratingNormalized = (feedback.rating - 1) / 4; // Normalize to 0-1
    this.metrics.categoryScores[feedback.category] = 
      (this.metrics.categoryScores[feedback.category] * 0.9) + (ratingNormalized * 0.1);
    
    // Update accuracy and helpfulness scores
    if (feedback.category === "accuracy") {
      this.metrics.accuracyScore = this.metrics.categoryScores[feedback.category];
    } else if (feedback.category === "helpfulness") {
      this.metrics.helpfulnessScore = this.metrics.categoryScores[feedback.category];
    }
  }
  
  /**
   * Process learning batch when enough feedback collected
   */
  private async processLearningBatch(): Promise<void> {
    console.log("🔄 Processing learning batch with", this.feedbackBuffer.length, "feedback items");
    
    // Analyze feedback patterns
    const negativeFeedback = this.feedbackBuffer.filter(f => f.feedback === "negative");
    const _positiveFeedback = this.feedbackBuffer.filter(f => f.feedback === "positive");
    
    // Identify common issues from negative feedback
    const commonIssues = this.analyzeCommonIssues(negativeFeedback);
    
    // Generate knowledge updates based on feedback
    for (const issue of commonIssues) {
      const update: KnowledgeUpdate = {
        type: "update",
        category: issue.category,
        content: issue.content,
        confidence: issue.confidence,
        source: "user_feedback",
        timestamp: new Date()
      };
      
      this.knowledgeUpdates.push(update);
    }
    
    // Clear feedback buffer after processing
    this.feedbackBuffer = [];
    
    console.log("✅ Learning batch processed, generated", this.knowledgeUpdates.length, "knowledge updates");
  }
  
  /**
   * Analyze common issues from negative feedback
   */
  private analyzeCommonIssues(feedback: UserFeedback[]): Array<{
    category: string;
    content: string;
    confidence: number;
  }> {
    const issues: Array<{ category: string; content: string; confidence: number }> = [];
    
    // Group by category
    const byCategory = new Map<string, UserFeedback[]>();
    for (const f of feedback) {
      if (!byCategory.has(f.category)) {
        byCategory.set(f.category, []);
      }
      byCategory.get(f.category)!.push(f);
    }
    
    // Identify patterns
    for (const [category, categoryFeedback] of byCategory.entries()) {
      if (categoryFeedback.length >= 3) {
        // This is a common issue
        const comments = categoryFeedback.map(f => f.comment).join(" ");
        const confidence = Math.min(categoryFeedback.length / 5, 1.0);
        
        issues.push({
          category,
          content: `Common issue in ${category}: ${comments}`,
          confidence
        });
      }
    }
    
    return issues;
  }
  
  /**
   * BUG ĐÃ SỬA (2026-09-22): trước đây `getMetrics()` chỉ đọc `this.metrics`
   * — state in-memory của MỘT instance `ContinuousLearningSystem`. Trên
   * serverless (Vercel), mỗi request có thể chạy trên instance KHÁC NHAU
   * — `GET /api/agent/feedback` gần như chắc chắn trả về metrics rỗng
   * (0 feedback) dù đã có hàng trăm feedback thật được lưu trong DB, vì
   * instance xử lý GET không phải instance đã xử lý các POST trước đó.
   * Đã sửa: tính lại metrics TỪ ĐẦU, TỪ DB, mỗi lần gọi — chậm hơn 1 chút
   * (query + fold trong bộ nhớ) nhưng ĐÚNG và BỀN VỮNG qua mọi instance.
   *
   * Giới hạn 500 session gần nhất (theo `updatedAt`) để tránh quét toàn
   * bộ bảng khi lượng feedback lớn dần — đủ cho mục đích "xu hướng gần
   * đây", không cần chính xác tuyệt đối lịch sử toàn thời gian.
   */
  async getMetrics(): Promise<LearningMetrics> {
    const feedbackList = await this.fetchRecentFeedbackFromDb();
    return computeMetricsFromFeedback(feedbackList);
  }

  private async fetchRecentFeedbackFromDb(): Promise<UserFeedback[]> {
    const sessions = await prisma.agentSession.findMany({
      where: { metadata: { path: ["feedbackHistory"], not: Prisma.JsonNull } },
      orderBy: { updatedAt: "desc" },
      take: 500,
      select: { metadata: true },
    });

    const all: UserFeedback[] = [];
    for (const session of sessions) {
      const metadata = session.metadata as { feedbackHistory?: Array<Record<string, unknown>> } | null;
      const history = metadata?.feedbackHistory;
      if (!Array.isArray(history)) continue;
      for (const raw of history) {
        if (!raw || typeof raw !== "object") continue;
        all.push({
          sessionId: String(raw.sessionId ?? ""),
          userId: String(raw.userId ?? ""),
          messageId: String(raw.messageId ?? ""),
          feedback: (raw.feedback as UserFeedback["feedback"]) ?? "neutral",
          rating: Number(raw.rating ?? 0),
          comment: String(raw.comment ?? ""),
          category: (raw.category as UserFeedback["category"]) ?? "other",
          timestamp: new Date(String(raw.timestamp ?? 0)),
        });
      }
    }
    // Fold theo đúng thứ tự thời gian (updateMetrics gốc là exponential
    // moving average — PHỤ THUỘC THỨ TỰ, phải sort trước khi fold lại).
    return all.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  /**
   * Get knowledge updates for review
   */
  getKnowledgeUpdates(): KnowledgeUpdate[] {
    return [...this.knowledgeUpdates];
  }
  
  /**
   * Clear knowledge updates after applying them
   */
  clearKnowledgeUpdates(): void {
    this.knowledgeUpdates = [];
  }
  
  /**
   * Suggest prompt improvements based on feedback — giờ tính từ DB (xem
   * `getMetrics()`) thay vì state in-memory `this.metrics` đã lỗi thời
   * trên serverless.
   */
  async suggestPromptImprovements(): Promise<string[]> {
    const metrics = await this.getMetrics();
    return suggestPromptImprovementsFor(metrics);
  }
  
  /**
   * Generate learning report — giờ tính từ DB (xem `getMetrics()`).
   */
  async generateLearningReport(): Promise<string> {
    const metrics = await this.getMetrics();
    const suggestions = suggestPromptImprovementsFor(metrics);
    const positivePercent = metrics.totalFeedback > 0 ? (metrics.positiveFeedback / metrics.totalFeedback) * 100 : 0;
    const negativePercent = metrics.totalFeedback > 0 ? (metrics.negativeFeedback / metrics.totalFeedback) * 100 : 0;

    const report = `
## Continuous Learning Report

### Metrics
- Total Feedback: ${metrics.totalFeedback}
- Positive Feedback: ${metrics.positiveFeedback} (${positivePercent.toFixed(1)}%)
- Negative Feedback: ${metrics.negativeFeedback} (${negativePercent.toFixed(1)}%)
- Average Rating: ${metrics.averageRating.toFixed(2)}/5

### Category Scores
${Object.entries(metrics.categoryScores).map(([cat, score]) => 
  `- ${cat}: ${(score * 100).toFixed(1)}%`
).join("\n")}

### Knowledge Updates Pending
${this.knowledgeUpdates.length} updates ready for review (⚠️ in-memory, xem giới hạn ở comment class)

### Suggested Improvements
${suggestions.map(s => `- ${s}`).join("\n") || "No specific suggestions at this time"}
`.trim();
    
    return report;
  }
}

// Singleton instance
let learningInstance: ContinuousLearningSystem | null = null;

export function getContinuousLearningSystem(): ContinuousLearningSystem {
  if (!learningInstance) {
    learningInstance = new ContinuousLearningSystem();
  }
  return learningInstance;
}

export { ContinuousLearningSystem, type UserFeedback, type LearningMetrics, type KnowledgeUpdate };