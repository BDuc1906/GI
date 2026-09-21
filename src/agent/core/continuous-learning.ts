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

class ContinuousLearningSystem {
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
    
    // Save to database
    try {
      await prisma.agentSession.update({
        where: { id: feedback.sessionId },
        data: {
          metadata: {
            feedback: feedbackWithTimestamp
          }
        }
      });
    } catch (err) {
      console.error("Failed to save feedback to database:", err);
    }
    
    // Update metrics
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
    const positiveFeedback = this.feedbackBuffer.filter(f => f.feedback === "positive");
    
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
   * Get current learning metrics
   */
  getMetrics(): LearningMetrics {
    return { ...this.metrics };
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
   * Suggest prompt improvements based on feedback
   */
  suggestPromptImprovements(): string[] {
    const suggestions: string[] = [];
    
    if (this.metrics.accuracyScore < 0.6) {
      suggestions.push("Consider improving RAG knowledge base for better accuracy");
    }
    
    if (this.metrics.helpfulnessScore < 0.6) {
      suggestions.push("Consider adding more detailed explanations and examples");
    }
    
    if (this.metrics.categoryScores["clarity"] < 0.6) {
      suggestions.push("Consider simplifying responses and using clearer language");
    }
    
    if (this.metrics.categoryScores["completeness"] < 0.6) {
      suggestions.push("Consider providing more comprehensive answers covering all aspects");
    }
    
    return suggestions;
  }
  
  /**
   * Generate learning report
   */
  generateLearningReport(): string {
    const report = `
## Continuous Learning Report

### Metrics
- Total Feedback: ${this.metrics.totalFeedback}
- Positive Feedback: ${this.metrics.positiveFeedback} (${((this.metrics.positiveFeedback / this.metrics.totalFeedback) * 100).toFixed(1)}%)
- Negative Feedback: ${this.metrics.negativeFeedback} (${((this.metrics.negativeFeedback / this.metrics.totalFeedback) * 100).toFixed(1)}%)
- Average Rating: ${this.metrics.averageRating.toFixed(2)}/5

### Category Scores
${Object.entries(this.metrics.categoryScores).map(([cat, score]) => 
  `- ${cat}: ${(score * 100).toFixed(1)}%`
).join("\n")}

### Knowledge Updates Pending
${this.knowledgeUpdates.length} updates ready for review

### Suggested Improvements
${this.suggestPromptImprovements().map(s => `- ${s}`).join("\n") || "No specific suggestions at this time"}
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