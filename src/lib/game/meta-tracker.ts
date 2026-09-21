// src/lib/game/meta-tracker.ts
/**
 * Real-time Meta Tracking và Analysis
 * 
 * Features:
 * 1. Track current meta teams and compositions
 * 2. Analyze usage rates and win rates
 * 3. Detect meta shifts and trends
 * 4. Provide meta recommendations
 * 5. Historical meta data comparison
 */

interface MetaTeam {
  name: string;
  composition: string[];
  usageRate: number; // 0-1
  winRate: number; // 0-1
  averageClearTime: number; // seconds
  difficulty: "easy" | "medium" | "hard";
  lastUpdated: Date;
}

interface MetaShift {
  teamName: string;
  previousUsage: number;
  currentUsage: number;
  change: number;
  trend: "rising" | "stable" | "falling";
  detectedAt: Date;
}

interface CharacterMeta {
  characterId: string;
  characterName: string;
  usageRate: number;
  averagePlacement: number; // 1-12 for spiral abyss
  synergies: string[];
  counters: string[];
  metaTier: "S" | "A" | "B" | "C" | "D";
}

class MetaTracker {
  private currentMeta: Map<string, MetaTeam> = new Map();
  private historicalMeta: Map<string, MetaShift[]> = new Map();
  private characterMeta: Map<string, CharacterMeta> = new Map();
  
  constructor() {
    this.initializeCurrentMeta();
    this.initializeCharacterMeta();
  }
  
  /**
   * Initialize current meta data (would be updated from external sources in production)
   */
  private initializeCurrentMeta(): void {
    const metaTeams: MetaTeam[] = [
      {
        name: "Hyperbloom",
        composition: ["Nahida", "Kokomi", "Kuki Shinobu", "Xingqiu"],
        usageRate: 0.35,
        winRate: 0.92,
        averageClearTime: 45,
        difficulty: "medium",
        lastUpdated: new Date()
      },
      {
        name: "Rational Childe",
        composition: ["Childe", "Xiangling", "Bennett", "Kazuha"],
        usageRate: 0.28,
        winRate: 0.88,
        averageClearTime: 50,
        difficulty: "medium",
        lastUpdated: new Date()
      },
      {
        name: "International",
        composition: ["Raiden Shogun", "Xiangling", "Bennett", "Kazuha"],
        usageRate: 0.25,
        winRate: 0.85,
        averageClearTime: 48,
        difficulty: "medium",
        lastUpdated: new Date()
      },
      {
        name: "Mono-Pyro",
        composition: ["Xiangling", "Bennett", "Kazuha", "Xinyan"],
        usageRate: 0.22,
        winRate: 0.82,
        averageClearTime: 52,
        difficulty: "easy",
        lastUpdated: new Date()
      },
      {
        name: "Freeze",
        composition: ["Ayaka", "Kokomi", "Shenhe", "Kazuha"],
        usageRate: 0.20,
        winRate: 0.90,
        averageClearTime: 47,
        difficulty: "medium",
        lastUpdated: new Date()
      },
      {
        name: "Raiden National",
        composition: ["Raiden Shogun", "Xingqiu", "Xiangling", "Bennett"],
        usageRate: 0.18,
        winRate: 0.84,
        averageClearTime: 55,
        difficulty: "medium",
        lastUpdated: new Date()
      },
      {
        name: "Vape Team",
        composition: ["Xingqiu", "Hu Tao", "Yelan", "Zhongli"],
        usageRate: 0.15,
        winRate: 0.80,
        averageClearTime: 58,
        difficulty: "hard",
        lastUpdated: new Date()
      },
      {
        name: "Double Geo",
        composition: ["Navia", "Chiori", "Gorou", "Zhongli"],
        usageRate: 0.12,
        winRate: 0.78,
        averageClearTime: 60,
        difficulty: "medium",
        lastUpdated: new Date()
      }
    ];
    
    metaTeams.forEach(team => {
      this.currentMeta.set(team.name, team);
    });
  }
  
  /**
   * Initialize character meta data
   */
  private initializeCharacterMeta(): void {
    const characterMetas: CharacterMeta[] = [
      {
        characterId: "nahida",
        characterName: "Nahida",
        usageRate: 0.42,
        averagePlacement: 2.1,
        synergies: ["kokomi", "kuki", "xingqiu", "yelan"],
        counters: ["zhongli", "furina"],
        metaTier: "S"
      },
      {
        characterId: "raidenshogun",
        characterName: "Raiden Shogun",
        usageRate: 0.38,
        averagePlacement: 2.3,
        synergies: ["xiangling", "bennett", "kazuha", "sara"],
        counters: ["zhongli", "furina"],
        metaTier: "S"
      },
      {
        characterId: "kazuha",
        characterName: "Kaedehara Kazuha",
        usageRate: 0.35,
        averagePlacement: 2.5,
        synergies: ["xiangling", "bennett", "ayaka", "childe"],
        counters: ["nilou", "kirara"],
        metaTier: "S"
      },
      {
        characterId: "bennett",
        characterName: "Bennett",
        usageRate: 0.33,
        averagePlacement: 3.1,
        synergies: ["xiangling", "razor", "noelle", "kazuha"],
        counters: ["none"],
        metaTier: "S"
      },
      {
        characterId: "xiangling",
        characterName: "Xiangling",
        usageRate: 0.32,
        averagePlacement: 3.2,
        synergies: ["bennett", "kazuha", "childe", "raiden"],
        counters: ["cryo enemies", "shield enemies"],
        metaTier: "S"
      },
      {
        characterId: "furina",
        characterName: "Furina",
        usageRate: 0.30,
        averagePlacement: 2.8,
        synergies: ["kokomi", "baizhu", " Charlotte", "neuvillette"],
        counters: ["pyro enemies", "single target"],
        metaTier: "A"
      },
      {
        characterId: "neuvillette",
        characterName: "Neuvillette",
        usageRate: 0.28,
        averagePlacement: 3.0,
        synergies: ["furina", "kokomi", "bennett", "kazuha"],
        counters: ["hydro enemies", "crowd control"],
        metaTier: "A"
      },
      {
        characterId: "kokomi",
        characterName: "Sangonomiya Kokomi",
        usageRate: 0.26,
        averagePlacement: 3.3,
        synergies: ["nahida", "furina", "yelan", "barbara"],
        counters: ["pyro enemies", "fast enemies"],
        metaTier: "A"
      },
      {
        characterId: "navia",
        characterName: "Navia",
        usageRate: 0.24,
        averagePlacement: 3.5,
        synergies: ["chiori", "gorou", "zhongli", "albedo"],
        counters: ["mobile enemies", "flying enemies"],
        metaTier: "A"
      },
      {
        characterId: "childe",
        characterName: "Tartaglia",
        usageRate: 0.22,
        averagePlacement: 3.8,
        synergies: ["xiangling", "bennett", "kazuha", "zhongli"],
        counters: ["shield enemies", "interrupt enemies"],
        metaTier: "B"
      },
      {
        characterId: "ayaka",
        characterName: "Kamisato Ayaka",
        usageRate: 0.20,
        averagePlacement: 4.0,
        synergies: ["kokomi", "shenhe", "kazuha", "diona"],
        counters: ["pyro enemies", "pyro aura"],
        metaTier: "B"
      }
    ];
    
    characterMetas.forEach(charMeta => {
      this.characterMeta.set(charMeta.characterId, charMeta);
    });
  }
  
  /**
   * Get current meta teams
   */
  getCurrentMeta(): MetaTeam[] {
    return Array.from(this.currentMeta.values()).sort((a, b) => b.usageRate - a.usageRate);
  }
  
  /**
   * Get character meta information
   */
  getCharacterMeta(characterId: string): CharacterMeta | null {
    return this.characterMeta.get(characterId) || null;
  }
  
  /**
   * Get top meta teams by usage rate
   */
  getTopMetaTeams(limit: number = 5): MetaTeam[] {
    return this.getCurrentMeta().slice(0, limit);
  }
  
  /**
   * Get meta teams by difficulty
   */
  getMetaTeamsByDifficulty(difficulty: "easy" | "medium" | "hard"): MetaTeam[] {
    return this.getCurrentMeta().filter(team => team.difficulty === difficulty);
  }
  
  /**
   * Detect meta shifts compared to previous data
   */
  detectMetaShifts(): MetaShift[] {
    const shifts: MetaShift[] = [];
    
    for (const [teamName, currentTeam] of this.currentMeta.entries()) {
      const historicalData = this.historicalMeta.get(teamName);
      
      if (historicalData && historicalData.length > 0) {
        const previousUsage = historicalData[historicalData.length - 1].currentUsage;
        const change = currentTeam.usageRate - previousUsage;
        
        let trend: "rising" | "stable" | "falling";
        if (change > 0.05) {
          trend = "rising";
        } else if (change < -0.05) {
          trend = "falling";
        } else {
          trend = "stable";
        }
        
        shifts.push({
          teamName,
          previousUsage,
          currentUsage: currentTeam.usageRate,
          change,
          trend,
          detectedAt: new Date()
        });
      }
    }
    
    return shifts.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }
  
  /**
   * Update meta data (would be called from external data source)
   */
  updateMetaData(newTeams: MetaTeam[]): void {
    for (const newTeam of newTeams) {
      const existingTeam = this.currentMeta.get(newTeam.name);
      
      if (existingTeam) {
        // Record historical data
        if (!this.historicalMeta.has(newTeam.name)) {
          this.historicalMeta.set(newTeam.name, []);
        }
        
        this.historicalMeta.get(newTeam.name)!.push({
          teamName: newTeam.name,
          previousUsage: existingTeam.usageRate,
          currentUsage: newTeam.usageRate,
          change: newTeam.usageRate - existingTeam.usageRate,
          trend: "stable", // Will be recalculated
          detectedAt: new Date()
        });
      }
      
      this.currentMeta.set(newTeam.name, newTeam);
    }
  }
  
  /**
   * Get team recommendations based on available characters
   */
  getTeamRecommendations(availableCharacters: string[]): MetaTeam[] {
    const recommendations: MetaTeam[] = [];
    
    for (const team of this.currentMeta.values()) {
      const hasAllCharacters = team.composition.every(char => 
        availableCharacters.includes(char.toLowerCase())
      );
      
      if (hasAllCharacters) {
        recommendations.push(team);
      }
    }
    
    return recommendations.sort((a, b) => b.winRate - a.winRate);
  }
  
  /**
   * Analyze counter relationships
   */
  analyzeCounterRelationships(characterId: string): {
    counters: string[];
    weakAgainst: string[];
  } {
    const charMeta = this.characterMeta.get(characterId);
    
    if (!charMeta) {
      return { counters: [], weakAgainst: [] };
    }
    
    return {
      counters: charMeta.counters,
      weakAgainst: charMeta.synergies.filter(s => 
        this.characterMeta.get(s)?.counters.includes(characterId)
      )
    };
  }
  
  /**
   * Generate meta analysis report
   */
  generateMetaReport(): string {
    const topTeams = this.getTopMetaTeams(5);
    const shifts = this.detectMetaShifts();
    const topCharacters = Array.from(this.characterMeta.values())
      .sort((a, b) => b.usageRate - a.usageRate)
      .slice(0, 10);
    
    return `
## Genshin Impact Meta Analysis Report

### Top Meta Teams
${topTeams.map((team, i) => 
  `${i + 1}. ${team.name} (${(team.usageRate * 100).toFixed(1)}% usage, ${(team.winRate * 100).toFixed(1)}% win rate)
   - Composition: ${team.composition.join(", ")}
   - Difficulty: ${team.difficulty}
   - Avg Clear Time: ${team.averageClearTime}s`
`).join("\n")}

### Top Characters by Usage
${topCharacters.map((char, i) => 
  `${i + 1}. ${char.characterName} (${(char.usageRate * 100).toFixed(1)}% usage, Tier ${char.metaTier})
   - Avg Placement: ${char.averagePlacement.toFixed(1)}
   - Synergies: ${char.synergies.join(", ")}
   - Counters: ${char.counters.join(", ")}
`).join("\n")}

### Meta Shifts Detected
${shifts.length > 0 ? shifts.slice(0, 5).map(shift => 
  `- ${shift.teamName}: ${shift.trend} (${shift.change > 0 ? "+" : ""}${(shift.change * 100).toFixed(1)}%)`
`).join("\n") : "No significant meta shifts detected"}

### Meta Analysis Summary
- Total tracked teams: ${this.currentMeta.size}
- Average team win rate: ${(Array.from(this.currentMeta.values()).reduce((sum, t) => sum + t.winRate, 0) / this.currentMeta.size * 100).toFixed(1)}%
- Most popular element: Anemo (present in ${(Array.from(this.currentMeta.values()).filter(t => t.composition.some(c => c.toLowerCase().includes("kazuha") || c.toLowerCase().includes("venti") || c.toLowerCase().includes("sucrose"))).length / this.currentMeta.size * 100).toFixed(1)}% of top teams)
`.trim();
  }
}

// Singleton instance
let metaTrackerInstance: MetaTracker | null = null;

export function getMetaTracker(): MetaTracker {
  if (!metaTrackerInstance) {
    metaTrackerInstance = new MetaTracker();
  }
  return metaTrackerInstance;
}

export { MetaTracker, type MetaTeam, type MetaShift, type CharacterMeta };