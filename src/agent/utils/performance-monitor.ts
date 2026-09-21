// src/agent/utils/performance-monitor.ts
/**
 * Performance Monitoring cho AI Agent
 * 
 * Features:
 * 1. Real-time latency tracking
 * 2. Token usage monitoring
 * 3. Tool call performance tracking
 * 4. Error rate monitoring
 * 5. Performance alerts and thresholds
 */

interface PerformanceMetrics {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  totalLatency: number;
  averageLatency: number;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  toolCalls: {
    total: number;
    successful: number;
    failed: number;
    byTool: Record<string, { count: number; avgLatency: number }>;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
  };
  ragUsage: {
    knowledgeRetrieved: boolean;
    chunksUsed: number;
    retrievalLatency: number;
  };
}

interface PerformanceAlert {
  level: "info" | "warning" | "critical";
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

interface PerformanceThresholds {
  maxLatency: number; // ms
  maxTokenUsage: number; // tokens
  maxErrorRate: number; // 0-1
  maxToolCallLatency: number; // ms
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private alerts: PerformanceAlert[] = [];
  private thresholds: PerformanceThresholds = {
    maxLatency: 5000, // 5 seconds
    maxTokenUsage: 10000, // 10k tokens
    maxErrorRate: 0.1, // 10% error rate
    maxToolCallLatency: 2000 // 2 seconds
  };
  
  /**
   * Start monitoring a session
   */
  startSession(sessionId: string, userId: string): void {
    this.metrics.set(sessionId, {
      sessionId,
      userId,
      startTime: new Date(),
      totalLatency: 0,
      averageLatency: 0,
      tokenUsage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0
      },
      toolCalls: {
        total: 0,
        successful: 0,
        failed: 0,
        byTool: {}
      },
      errors: {
        total: 0,
        byType: {}
      },
      ragUsage: {
        knowledgeRetrieved: false,
        chunksUsed: 0,
        retrievalLatency: 0
      }
    });
  }
  
  /**
   * End monitoring a session
   */
  endSession(sessionId: string): void {
    const metrics = this.metrics.get(sessionId);
    if (!metrics) return;
    
    metrics.endTime = new Date();
    
    // Calculate final metrics
    const duration = metrics.endTime.getTime() - metrics.startTime.getTime();
    metrics.totalLatency = duration;
    metrics.averageLatency = duration / (metrics.toolCalls.total || 1);
    
    // Check for performance issues
    this.checkPerformanceThresholds(sessionId);
  }
  
  /**
   * Record tool call performance
   */
  recordToolCall(
    sessionId: string,
    toolName: string,
    latency: number,
    success: boolean
  ): void {
    const metrics = this.metrics.get(sessionId);
    if (!metrics) return;
    
    metrics.toolCalls.total++;
    
    if (success) {
      metrics.toolCalls.successful++;
    } else {
      metrics.toolCalls.failed++;
    }
    
    // Track by tool
    if (!metrics.toolCalls.byTool[toolName]) {
      metrics.toolCalls.byTool[toolName] = { count: 0, avgLatency: 0 };
    }
    
    const toolMetrics = metrics.toolCalls.byTool[toolName];
    toolMetrics.count++;
    toolMetrics.avgLatency = (toolMetrics.avgLatency * (toolMetrics.count - 1) + latency) / toolMetrics.count;
    
    // Check tool call latency
    if (latency > this.thresholds.maxToolCallLatency) {
      this.addAlert({
        level: "warning",
        message: `Tool call ${toolName} exceeded latency threshold`,
        metric: "toolCallLatency",
        value: latency,
        threshold: this.thresholds.maxToolCallLatency,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Record token usage
   */
  recordTokenUsage(
    sessionId: string,
    inputTokens: number,
    outputTokens: number
  ): void {
    const metrics = this.metrics.get(sessionId);
    if (!metrics) return;
    
    metrics.tokenUsage.inputTokens += inputTokens;
    metrics.tokenUsage.outputTokens += outputTokens;
    metrics.tokenUsage.totalTokens += inputTokens + outputTokens;
    
    // Check token usage
    if (metrics.tokenUsage.totalTokens > this.thresholds.maxTokenUsage) {
      this.addAlert({
        level: "warning",
        message: "Token usage exceeded threshold",
        metric: "tokenUsage",
        value: metrics.tokenUsage.totalTokens,
        threshold: this.thresholds.maxTokenUsage,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Record error
   */
  recordError(sessionId: string, errorType: string): void {
    const metrics = this.metrics.get(sessionId);
    if (!metrics) return;
    
    metrics.errors.total++;
    metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;
    
    this.addAlert({
      level: "critical",
      message: `Error occurred: ${errorType}`,
      metric: "error",
      value: metrics.errors.total,
      threshold: 0,
      timestamp: new Date()
    });
  }
  
  /**
   * Record RAG usage
   */
  recordRAGUsage(
    sessionId: string,
    knowledgeRetrieved: boolean,
    chunksUsed: number,
    retrievalLatency: number
  ): void {
    const metrics = this.metrics.get(sessionId);
    if (!metrics) return;
    
    metrics.ragUsage.knowledgeRetrieved = knowledgeRetrieved;
    metrics.ragUsage.chunksUsed = chunksUsed;
    metrics.ragUsage.retrievalLatency = retrievalLatency;
  }
  
  /**
   * Check performance thresholds
   */
  private checkPerformanceThresholds(sessionId: string): void {
    const metrics = this.metrics.get(sessionId);
    if (!metrics) return;
    
    // Check total latency
    if (metrics.totalLatency > this.thresholds.maxLatency) {
      this.addAlert({
        level: "warning",
        message: "Session exceeded latency threshold",
        metric: "totalLatency",
        value: metrics.totalLatency,
        threshold: this.thresholds.maxLatency,
        timestamp: new Date()
      });
    }
    
    // Check error rate
    const errorRate = metrics.toolCalls.total > 0 
      ? metrics.toolCalls.failed / metrics.toolCalls.total 
      : 0;
    
    if (errorRate > this.thresholds.maxErrorRate) {
      this.addAlert({
        level: "critical",
        message: "Error rate exceeded threshold",
        metric: "errorRate",
        value: errorRate,
        threshold: this.thresholds.maxErrorRate,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Add performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }
  
  /**
   * Get session metrics
   */
  getSessionMetrics(sessionId: string): PerformanceMetrics | null {
    return this.metrics.get(sessionId) || null;
  }
  
  /**
   * Get aggregated metrics across all sessions
   */
  getAggregatedMetrics(): {
    totalSessions: number;
    averageLatency: number;
    totalTokens: number;
    totalToolCalls: number;
    successRate: number;
    errorRate: number;
    ragUsageRate: number;
  } {
    const sessions = Array.from(this.metrics.values());
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageLatency: 0,
        totalTokens: 0,
        totalToolCalls: 0,
        successRate: 0,
        errorRate: 0,
        ragUsageRate: 0
      };
    }
    
    const totalLatency = sessions.reduce((sum, m) => sum + m.totalLatency, 0);
    const totalTokens = sessions.reduce((sum, m) => sum + m.tokenUsage.totalTokens, 0);
    const totalToolCalls = sessions.reduce((sum, m) => sum + m.toolCalls.total, 0);
    const successfulToolCalls = sessions.reduce((sum, m) => sum + m.toolCalls.successful, 0);
    const failedToolCalls = sessions.reduce((sum, m) => sum + m.toolCalls.failed, 0);
    const ragUsageCount = sessions.filter(m => m.ragUsage.knowledgeRetrieved).length;
    
    return {
      totalSessions: sessions.length,
      averageLatency: totalLatency / sessions.length,
      totalTokens,
      totalToolCalls,
      successRate: totalToolCalls > 0 ? successfulToolCalls / totalToolCalls : 0,
      errorRate: totalToolCalls > 0 ? failedToolCalls / totalToolCalls : 0,
      ragUsageRate: ragUsageCount / sessions.length
    };
  }
  
  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 20): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }
  
  /**
   * Get performance report
   */
  generatePerformanceReport(): string {
    const aggregated = this.getAggregatedMetrics();
    const recentAlerts = this.getRecentAlerts(10);
    
    return `
## AI Agent Performance Report

### Overall Metrics
- Total Sessions: ${aggregated.totalSessions}
- Average Latency: ${aggregated.averageLatency.toFixed(0)}ms
- Total Tokens Used: ${aggregated.totalTokens.toLocaleString()}
- Total Tool Calls: ${aggregated.totalToolCalls}
- Success Rate: ${(aggregated.successRate * 100).toFixed(1)}%
- Error Rate: ${(aggregated.errorRate * 100).toFixed(1)}%
- RAG Usage Rate: ${(aggregated.ragUsageRate * 100).toFixed(1)}%

### Performance Thresholds
- Max Latency: ${this.thresholds.maxLatency}ms
- Max Token Usage: ${this.thresholds.maxTokenUsage} tokens
- Max Error Rate: ${(this.thresholds.maxErrorRate * 100).toFixed(1)}%
- Max Tool Call Latency: ${this.thresholds.maxToolCallLatency}ms

### Recent Alerts
${recentAlerts.length > 0 ? recentAlerts.map(alert => 
  `- [${alert.level.toUpperCase()}] ${alert.message} (${alert.timestamp.toISOString()})`
).join("\n") : "No recent alerts"}

### Performance Health Score
${this.calculateHealthScore(aggregated)}/100
`.trim();
  }
  
  /**
   * Calculate overall health score (0-100)
   */
  private calculateHealthScore(metrics: ReturnType<typeof this.getAggregatedMetrics>): number {
    let score = 100;
    
    // Latency impact
    if (metrics.averageLatency > 5000) score -= 30;
    else if (metrics.averageLatency > 3000) score -= 15;
    else if (metrics.averageLatency > 1000) score -= 5;
    
    // Error rate impact
    if (metrics.errorRate > 0.2) score -= 40;
    else if (metrics.errorRate > 0.1) score -= 20;
    else if (metrics.errorRate > 0.05) score -= 10;
    
    // Success rate impact
    if (metrics.successRate < 0.8) score -= 20;
    else if (metrics.successRate < 0.9) score -= 10;
    
    // RAG usage bonus
    if (metrics.ragUsageRate > 0.8) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Clear old metrics (older than specified hours)
   */
  clearOldMetrics(hours: number = 24): void {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    for (const [sessionId, metrics] of this.metrics.entries()) {
      if (metrics.startTime.getTime() < cutoff) {
        this.metrics.delete(sessionId);
      }
    }
  }
  
  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
}

// Singleton instance
let performanceMonitorInstance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
  }
  return performanceMonitorInstance;
}

export { PerformanceMonitor, type PerformanceMetrics, type PerformanceAlert, type PerformanceThresholds };