/**
 * scripts/validate/data-freshness-checker.ts
 *
 * DATA FRESHNESS MONITORING
 * 
 * Features:
 * 1. Check data age for all records
 * 2. Detect stale data (>30 days old)
 * 3. Identify records needing refresh
 * 4. Generate freshness reports
 * 5. Auto-refresh if configured
 */

import { prisma } from "../../src/lib/db/prisma";

interface FreshnessConfig {
  maxAgeDays: number;
  warnAgeDays: number;
  autoRefresh: boolean;
}

interface FreshnessReport {
  totalRecords: number;
  staleRecords: number;
  warningRecords: number;
  freshRecords: number;
  byEntity: Record<string, {
    total: number;
    stale: number;
    warning: number;
    fresh: number;
  }>;
  needsRefresh: string[];
}

class DataFreshnessChecker {
  private config: FreshnessConfig = {
    maxAgeDays: 30, // Data older than 30 days is stale
    warnAgeDays: 14, // Data older than 14 days is warning
    autoRefresh: false
  };

  constructor(config?: Partial<FreshnessConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check freshness of character data
   */
  private async checkCharacterFreshness(): Promise<{
    total: number;
    stale: number;
    warning: number;
    fresh: number;
  }> {
    const now = new Date();
    const maxAge = new Date(now.getTime() - this.config.maxAgeDays * 24 * 60 * 60 * 1000);
    const warnAge = new Date(now.getTime() - this.config.warnAgeDays * 24 * 60 * 60 * 1000);

    const allCharacters = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    });

    let stale = 0;
    let warning = 0;
    let fresh = 0;

    for (const char of allCharacters) {
      if (char.updatedAt < maxAge) {
        stale++;
      } else if (char.updatedAt < warnAge) {
        warning++;
      } else {
        fresh++;
      }
    }

    return {
      total: allCharacters.length,
      stale,
      warning,
      fresh
    };
  }

  /**
   * Check freshness of weapon data
   */
  private async checkWeaponFreshness(): Promise<{
    total: number;
    stale: number;
    warning: number;
    fresh: number;
  }> {
    const now = new Date();
    const maxAge = new Date(now.getTime() - this.config.maxAgeDays * 24 * 60 * 60 * 1000);
    const warnAge = new Date(now.getTime() - this.config.warnAgeDays * 24 * 60 * 60 * 1000);

    const allWeapons = await prisma.weapon.findMany({
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    });

    let stale = 0;
    let warning = 0;
    let fresh = 0;

    for (const weapon of allWeapons) {
      if (weapon.updatedAt < maxAge) {
        stale++;
      } else if (weapon.updatedAt < warnAge) {
        warning++;
      } else {
        fresh++;
      }
    }

    return {
      total: allWeapons.length,
      stale,
      warning,
      fresh
    };
  }

  /**
   * Check freshness of enemy data
   */
  private async checkEnemyFreshness(): Promise<{
    total: number;
    stale: number;
    warning: number;
    fresh: number;
  }> {
    const now = new Date();
    const maxAge = new Date(now.getTime() - this.config.maxAgeDays * 24 * 60 * 60 * 1000);
    const warnAge = new Date(now.getTime() - this.config.warnAgeDays * 24 * 60 * 60 * 1000);

    const allEnemies = await prisma.enemy.findMany({
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    });

    let stale = 0;
    let warning = 0;
    let fresh = 0;

    for (const enemy of allEnemies) {
      if (enemy.updatedAt < maxAge) {
        stale++;
      } else if (enemy.updatedAt < warnAge) {
        warning++;
      } else {
        fresh++;
      }
    }

    return {
      total: allEnemies.length,
      stale,
      warning,
      fresh
    };
  }

  /**
   * Generate comprehensive freshness report
   */
  async generateReport(): Promise<FreshnessReport> {
    console.log("🔍 Checking data freshness...");

    const charFreshness = await this.checkCharacterFreshness();
    const weaponFreshness = await this.checkWeaponFreshness();
    const enemyFreshness = await this.checkEnemyFreshness();

    const totalRecords = charFreshness.total + weaponFreshness.total + enemyFreshness.total;
    const staleRecords = charFreshness.stale + weaponFreshness.stale + enemyFreshness.stale;
    const warningRecords = charFreshness.warning + weaponFreshness.warning + enemyFreshness.warning;
    const freshRecords = charFreshness.fresh + weaponFreshness.fresh + enemyFreshness.fresh;

    const needsRefresh: string[] = [];

    if (charFreshness.stale > 0) {
      needsRefresh.push(`${charFreshness.stale} characters`);
    }
    if (weaponFreshness.stale > 0) {
      needsRefresh.push(`${weaponFreshness.stale} weapons`);
    }
    if (enemyFreshness.stale > 0) {
      needsRefresh.push(`${enemyFreshness.stale} enemies`);
    }

    const report: FreshnessReport = {
      totalRecords,
      staleRecords,
      warningRecords,
      freshRecords,
      byEntity: {
        characters: charFreshness,
        weapons: weaponFreshness,
        enemies: enemyFreshness
      },
      needsRefresh
    };

    return report;
  }

  /**
   * Print freshness report
   */
  printReport(report: FreshnessReport): void {
    console.log("\n" + "=".repeat(50));
    console.log("📊 DATA FRESHNESS REPORT");
    console.log("=".repeat(50));
    console.log(`Total Records: ${report.totalRecords}`);
    console.log(`Fresh: ${report.freshRecords} (${((report.freshRecords / report.totalRecords) * 100).toFixed(1)}%)`);
    console.log(`Warning: ${report.warningRecords} (${((report.warningRecords / report.totalRecords) * 100).toFixed(1)}%)`);
    console.log(`Stale: ${report.staleRecords} (${((report.staleRecords / report.totalRecords) * 100).toFixed(1)}%)`);

    console.log("\nBy Entity:");
    for (const [entity, stats] of Object.entries(report.byEntity)) {
      console.log(`  ${entity}:`);
      console.log(`    Total: ${stats.total}`);
      console.log(`    Fresh: ${stats.fresh}`);
      console.log(`    Warning: ${stats.warning}`);
      console.log(`    Stale: ${stats.stale}`);
    }

    if (report.needsRefresh.length > 0) {
      console.log("\n⚠️ Needs Refresh:");
      report.needsRefresh.forEach(item => {
        console.log(`  - ${item}`);
      });
    }

    console.log("=".repeat(50));
  }

  /**
   * Auto-refresh stale data if configured
   */
  async autoRefreshStaleData(): Promise<boolean> {
    if (!this.config.autoRefresh) {
      console.log("ℹ️ Auto-refresh is disabled");
      return false;
    }

    const report = await this.generateReport();

    if (report.staleRecords === 0) {
      console.log("✅ No stale data to refresh");
      return true;
    }

    console.log("🔄 Auto-refreshing stale data...");

    try {
      // Would trigger auto-sync pipeline here
      // For now, just simulate
      console.log("✅ Auto-refresh simulated (would trigger full sync pipeline)");
      return true;
    } catch (err) {
      console.error("❌ Auto-refresh failed:", err);
      return false;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const checker = new DataFreshnessChecker({
    maxAgeDays: args.includes("--max-age") ? parseInt(args[1]) : 30,
    autoRefresh: args.includes("--auto-refresh")
  });

  switch (command) {
    case "check":
      const report = await checker.generateReport();
      checker.printReport(report);
      break;

    case "auto-refresh":
      await checker.autoRefreshStaleData();
      break;

    default:
      console.log("Usage:");
      console.log("  node scripts/validate/data-freshness-checker.ts check         - Check data freshness");
      console.log("  node scripts/validate/data-freshness-checker.ts check --max-age 30 - Check with custom max age");
      console.log("  node scripts/validate/data-freshness-checker.ts auto-refresh  - Auto-refresh stale data");
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});