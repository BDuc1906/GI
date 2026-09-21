// src/agent/utils/cost-tracker.ts
/**
 * Cost Tracking cho LLM Calls
 * 
 * Features:
 * 1. Track token usage per provider/model
 * 2. Calculate costs based on provider pricing
 * 3. Budget monitoring and alerts
 * 4. Cost optimization suggestions
 * 5. Historical cost analysis
 */

interface ProviderPricing {
  inputPrice: number; // per 1M tokens
  outputPrice: number; // per 1M tokens
  currency: string;
}

interface CostRecord {
  sessionId: string;
  userId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  timestamp: Date;
}

interface CostBudget {
  dailyBudget: number;
  monthlyBudget: number;
  currentDailySpend: number;
  currentMonthlySpend: number;
  alertThreshold: number; // percentage of budget
}

interface CostAnalysis {
  totalCost: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  byUser: Record<string, number>;
  averageCostPerSession: number;
  trends: {
    daily: number[];
    weekly: number[];
  };
}

class CostTracker {
  private costRecords: CostRecord[] = [];
  private providerPricing: Record<string, ProviderPricing> = {
    "openai": {
      inputPrice: 5.0, // $5 per 1M input tokens (GPT-4)
      outputPrice: 15.0, // $15 per 1M output tokens
      currency: "USD"
    },
    "anthropic": {
      inputPrice: 3.0, // $3 per 1M input tokens (Claude)
      outputPrice: 15.0, // $15 per 1M output tokens
      currency: "USD"
    },
    "google": {
      inputPrice: 0.5, // $0.5 per 1M input tokens (Gemini)
      outputPrice: 1.5, // $1.5 per 1M output tokens
      currency: "USD"
    }
  };
  
  private budget: CostBudget = {
    dailyBudget: 10.0, // $10 per day
    monthlyBudget: 300.0, // $300 per month
    currentDailySpend: 0,
    currentMonthlySpend: 0,
    alertThreshold: 0.8 // Alert at 80% of budget
  };
  
  /**
   * Record LLM call cost
   */
  recordCost(
    sessionId: string,
    userId: string,
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): CostRecord {
    const pricing = this.providerPricing[provider.toLowerCase()] || this.providerPricing["openai"];
    
    const inputCost = (inputTokens / 1000000) * pricing.inputPrice;
    const outputCost = (outputTokens / 1000000) * pricing.outputPrice;
    const totalCost = inputCost + outputCost;
    
    const record: CostRecord = {
      sessionId,
      userId,
      provider: provider.toLowerCase(),
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost,
      outputCost,
      totalCost,
      timestamp: new Date()
    };
    
    this.costRecords.push(record);
    
    // Update budget tracking
    this.updateBudgetTracking(totalCost);
    
    // Check budget alerts
    this.checkBudgetAlerts();
    
    return record;
  }
  
  /**
   * Update budget tracking
   */
  private updateBudgetTracking(cost: number): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get today's records
    const todayRecords = this.costRecords.filter(r => r.timestamp >= today);
    this.budget.currentDailySpend = todayRecords.reduce((sum, r) => sum + r.totalCost, 0);
    
    // Get this month's records
    const monthRecords = this.costRecords.filter(r => r.timestamp >= monthStart);
    this.budget.currentMonthlySpend = monthRecords.reduce((sum, r) => sum + r.totalCost, 0);
  }
  
  /**
   * Check budget alerts
   */
  private checkBudgetAlerts(): void {
    const dailyUsage = this.budget.currentDailySpend / this.budget.dailyBudget;
    const monthlyUsage = this.budget.currentMonthlySpend / this.budget.monthlyBudget;
    
    if (dailyUsage >= this.budget.alertThreshold) {
      console.warn(`⚠️ Daily budget alert: ${(dailyUsage * 100).toFixed(1)}% used ($${this.budget.currentDailySpend.toFixed(2)}/$${this.budget.dailyBudget})`);
    }
    
    if (monthlyUsage >= this.budget.alertThreshold) {
      console.warn(`⚠️ Monthly budget alert: ${(monthlyUsage * 100).toFixed(1)}% used ($${this.budget.currentMonthlySpend.toFixed(2)}/$${this.budget.monthlyBudget})`);
    }
  }
  
  /**
   * Get cost analysis
   */
  getCostAnalysis(): CostAnalysis {
    const totalCost = this.costRecords.reduce((sum, r) => sum + r.totalCost, 0);
    
    // Group by provider
    const byProvider: Record<string, number> = {};
    for (const record of this.costRecords) {
      byProvider[record.provider] = (byProvider[record.provider] || 0) + record.totalCost;
    }
    
    // Group by model
    const byModel: Record<string, number> = {};
    for (const record of this.costRecords) {
      byModel[record.model] = (byModel[record.model] || 0) + record.totalCost;
    }
    
    // Group by user
    const byUser: Record<string, number> = {};
    for (const record of this.costRecords) {
      byUser[record.userId] = (byUser[record.userId] || 0) + record.totalCost;
    }
    
    // Calculate average cost per session
    const sessionIds = new Set(this.costRecords.map(r => r.sessionId));
    const averageCostPerSession = sessionIds.size > 0 ? totalCost / sessionIds.size : 0;
    
    // Calculate trends
    const trends = this.calculateTrends();
    
    return {
      totalCost,
      byProvider,
      byModel,
      byUser,
      averageCostPerSession,
      trends
    };
  }
  
  /**
   * Calculate cost trends
   */
  private calculateTrends(): { daily: number[]; weekly: number[] } {
    const now = new Date();
    const daily: number[] = [];
    const weekly: number[] = [];
    
    // Calculate daily costs for last 7 days
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayRecords = this.costRecords.filter(r => r.timestamp >= day && r.timestamp < nextDay);
      const dayCost = dayRecords.reduce((sum, r) => sum + r.totalCost, 0);
      daily.push(dayCost);
    }
    
    // Calculate weekly costs for last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekRecords = this.costRecords.filter(r => r.timestamp >= weekStart && r.timestamp < weekEnd);
      const weekCost = weekRecords.reduce((sum, r) => sum + r.totalCost, 0);
      weekly.push(weekCost);
    }
    
    return { daily, weekly };
  }
  
  /**
   * Get cost suggestions
   */
  getCostSuggestions(): string[] {
    const suggestions: string[] = [];
    const analysis = this.getCostAnalysis();
    
    // Provider optimization
    const providerCosts = Object.entries(analysis.byProvider);
    if (providerCosts.length > 1) {
      const mostExpensive = providerCosts.sort((a, b) => b[1] - a[1])[0];
      const cheapest = providerCosts.sort((a, b) => a[1] - b[1])[0];
      
      if (mostExpensive[1] > cheapest[1] * 2) {
        suggestions.push(`Consider using ${cheapest[0]} instead of ${mostExpensive[0]} for cost savings`);
      }
    }
    
    // Token efficiency
    const avgTokensPerSession = this.costRecords.length > 0 
      ? this.costRecords.reduce((sum, r) => sum + r.totalTokens, 0) / this.costRecords.length 
      : 0;
    
    if (avgTokensPerSession > 5000) {
      suggestions.push("Average token usage per session is high. Consider optimizing prompts or context management");
    }
    
    // Budget management
    const dailyUsage = this.budget.currentDailySpend / this.budget.dailyBudget;
    if (dailyUsage > 0.9) {
      suggestions.push("Daily budget nearly exhausted. Consider rate limiting or caching responses");
    }
    
    // Model selection
    const modelCosts = Object.entries(analysis.byModel);
    if (modelCosts.length > 0) {
      const expensiveModels = modelCosts.filter(([_, cost]) => cost > 0.1);
      if (expensiveModels.length > 0) {
        suggestions.push(`Consider using smaller models for simple queries. Current expensive models: ${expensiveModels.map(m => m[0]).join(", ")}`);
      }
    }
    
    return suggestions;
  }
  
  /**
   * Update provider pricing
   */
  updateProviderPricing(provider: string, pricing: Partial<ProviderPricing>): void {
    const current = this.providerPricing[provider.toLowerCase()] || this.providerPricing["openai"];
    this.providerPricing[provider.toLowerCase()] = { ...current, ...pricing };
  }
  
  /**
   * Set budget limits
   */
  setBudget(dailyBudget: number, monthlyBudget: number, alertThreshold?: number): void {
    this.budget = {
      ...this.budget,
      dailyBudget,
      monthlyBudget,
      alertThreshold: alertThreshold || this.budget.alertThreshold
    };
  }
  
  /**
   * Get current budget status
   */
  getBudgetStatus(): {
    daily: { spent: number; budget: number; remaining: number; percentage: number };
    monthly: { spent: number; budget: number; remaining: number; percentage: number };
  } {
    return {
      daily: {
        spent: this.budget.currentDailySpend,
        budget: this.budget.dailyBudget,
        remaining: this.budget.dailyBudget - this.budget.currentDailySpend,
        percentage: (this.budget.currentDailySpend / this.budget.dailyBudget) * 100
      },
      monthly: {
        spent: this.budget.currentMonthlySpend,
        budget: this.budget.monthlyBudget,
        remaining: this.budget.monthlyBudget - this.budget.currentMonthlySpend,
        percentage: (this.budget.currentMonthlySpend / this.budget.monthlyBudget) * 100
      }
    };
  }
  
  /**
   * Generate cost report
   */
  generateCostReport(): string {
    const analysis = this.getCostAnalysis();
    const budgetStatus = this.getBudgetStatus();
    const suggestions = this.getCostSuggestions();
    
    return `
## LLM Cost Report

### Cost Summary
- Total Cost: $${analysis.totalCost.toFixed(2)}
- Average Cost per Session: $${analysis.averageCostPerSession.toFixed(2)}
- Total Sessions: ${new Set(this.costRecords.map(r => r.sessionId)).size}
- Total Tokens: ${this.costRecords.reduce((sum, r) => sum + r.totalTokens, 0).toLocaleString()}

### Cost by Provider
${Object.entries(analysis.byProvider).map(([provider, cost]) => 
  `- ${provider}: $${cost.toFixed(2)}`
).join("\n")}

### Cost by Model
${Object.entries(analysis.byModel).map(([model, cost]) => 
  `- ${model}: $${cost.toFixed(2)}`
).join("\n")}

### Budget Status
- Daily: $${budgetStatus.daily.spent.toFixed(2)}/$${budgetStatus.daily.budget} (${budgetStatus.daily.percentage.toFixed(1)}%)
- Monthly: $${budgetStatus.monthly.spent.toFixed(2)}/$${budgetStatus.monthly.budget} (${budgetStatus.monthly.percentage.toFixed(1)}%)

### Cost Trends
- Last 7 days: $${analysis.trends.daily.reduce((sum, cost) => sum + cost, 0).toFixed(2)}
- Last 4 weeks: $${analysis.trends.weekly.reduce((sum, cost) => sum + cost, 0).toFixed(2)}

### Optimization Suggestions
${suggestions.length > 0 ? suggestions.map(s => `- ${s}`).join("\n") : "No specific suggestions at this time"}
`.trim();
  }
  
  /**
   * Clear old cost records (older than specified days)
   */
  clearOldRecords(days: number = 30): void {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    this.costRecords = this.costRecords.filter(r => r.timestamp.getTime() >= cutoff);
  }
}

// Singleton instance
let costTrackerInstance: CostTracker | null = null;

export function getCostTracker(): CostTracker {
  if (!costTrackerInstance) {
    costTrackerInstance = new CostTracker();
  }
  return costTrackerInstance;
}

export { CostTracker, type CostRecord, type CostBudget, type CostAnalysis, type ProviderPricing };