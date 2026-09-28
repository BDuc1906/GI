import { describe, expect, it } from "vitest";
import { computeMetricsFromFeedback, suggestPromptImprovementsFor } from "@/agent/core/continuous-learning";

function makeFeedback(overrides: Partial<Parameters<typeof computeMetricsFromFeedback>[0][number]> = {}) {
  return {
    sessionId: "s1",
    userId: "u1",
    messageId: "m1",
    feedback: "positive" as const,
    rating: 5,
    comment: "",
    category: "accuracy" as const,
    timestamp: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("computeMetricsFromFeedback — tính metrics từ mảng feedback (thay cho state in-memory dễ mất)", () => {
  it("mảng rỗng -> metrics mặc định, không chia cho 0 (NaN)", () => {
    const metrics = computeMetricsFromFeedback([]);
    expect(metrics.totalFeedback).toBe(0);
    expect(metrics.averageRating).toBe(0);
    expect(Number.isNaN(metrics.averageRating)).toBe(false);
  });

  it("đếm đúng tổng/positive/negative", () => {
    const metrics = computeMetricsFromFeedback([
      makeFeedback({ feedback: "positive" }),
      makeFeedback({ feedback: "positive" }),
      makeFeedback({ feedback: "negative" }),
    ]);
    expect(metrics.totalFeedback).toBe(3);
    expect(metrics.positiveFeedback).toBe(2);
    expect(metrics.negativeFeedback).toBe(1);
  });

  it("averageRating tính đúng trung bình cộng", () => {
    const metrics = computeMetricsFromFeedback([
      makeFeedback({ rating: 5 }),
      makeFeedback({ rating: 1 }),
    ]);
    expect(metrics.averageRating).toBeCloseTo(3, 5);
  });

  it("kết quả KHÔNG phụ thuộc việc gọi nhiều lần (hàm thuần, không mutate state ẩn giữa 2 lần gọi)", () => {
    const feedbackList = [makeFeedback({ rating: 4 }), makeFeedback({ rating: 2 })];
    const first = computeMetricsFromFeedback(feedbackList);
    const second = computeMetricsFromFeedback(feedbackList);
    expect(first).toEqual(second);
  });

  it("accuracyScore/helpfulnessScore cập nhật đúng theo category tương ứng", () => {
    const metrics = computeMetricsFromFeedback([
      makeFeedback({ category: "accuracy", rating: 5 }),
      makeFeedback({ category: "helpfulness", rating: 1 }),
    ]);
    // rating 5 -> normalized 1.0 -> categoryScore tiến dần về 1.0 (EWMA từ 0.5)
    expect(metrics.accuracyScore).toBeGreaterThan(0.5);
    // rating 1 -> normalized 0.0 -> categoryScore giảm dần xuống dưới 0.5
    expect(metrics.helpfulnessScore).toBeLessThan(0.5);
  });
});

describe("suggestPromptImprovementsFor — gợi ý dựa trên metrics đã tính (hàm thuần)", () => {
  it("accuracyScore thấp -> gợi ý cải thiện RAG", () => {
    const metrics = computeMetricsFromFeedback([]);
    metrics.accuracyScore = 0.3;
    const suggestions = suggestPromptImprovementsFor(metrics);
    expect(suggestions.some((s) => s.toLowerCase().includes("rag"))).toBe(true);
  });

  it("mọi điểm đều cao -> không có gợi ý nào", () => {
    const metrics = computeMetricsFromFeedback([]);
    metrics.accuracyScore = 0.9;
    metrics.helpfulnessScore = 0.9;
    metrics.categoryScores = { clarity: 0.9, completeness: 0.9 };
    expect(suggestPromptImprovementsFor(metrics)).toEqual([]);
  });

  it("categoryScores thiếu field (clarity/completeness chưa có feedback nào) -> không throw", () => {
    const metrics = computeMetricsFromFeedback([]);
    expect(() => suggestPromptImprovementsFor(metrics)).not.toThrow();
  });
});
