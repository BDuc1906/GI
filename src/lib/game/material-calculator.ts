// src/lib/game/material-calculator.ts
/**
 * Material Calculator cho Ascension Planning
 * 
 * Features:
 * 1. Calculate material requirements for character/weapon ascension
 * 2. Talent upgrade material calculator
 * 3. Domain farming schedule optimization
 * 4. Resin planning tool
 * 5. Material shortage analysis
 */

interface MaterialRequirement {
  materialId: string;
  materialName: string;
  quantity: number;
  tier: number;
  domain?: string;
  dropRate?: number;
}

interface AscensionPlan {
  characterName: string;
  currentLevel: number;
  targetLevel: number;
  materials: MaterialRequirement[];
  totalResinNeeded: number;
  farmingDays: number;
  recommendedDomains: string[];
}

interface TalentPlan {
  characterName: string;
  talentLevels: {
    normalAttack: number;
    elementalSkill: number;
    elementalBurst: number;
  };
  targetLevels: {
    normalAttack: number;
    elementalSkill: number;
    elementalBurst: number;
  };
  materials: MaterialRequirement[];
  totalResinNeeded: number;
  recommendedDomains: string[];
}

interface FarmingSchedule {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  domains: string[];
  characters: string[];
  materials: string[];
}

class MaterialCalculator {
  // Domain schedule mapping
  private readonly DOMAIN_SCHEDULE: Record<string, string[]> = {
    "Monday": ["Mondstadt", "Liyue"],
    "Tuesday": ["Mondstadt", "Inazuma"],
    "Wednesday": ["Liyue", "Inazuma"],
    "Thursday": ["Mondstadt", "Sumeru"],
    "Friday": ["Liyue", "Sumeru"],
    "Saturday": ["All domains"],
    "Sunday": ["All domains"]
  };
  
  // Domain to material mapping
  private readonly DOMAIN_MATERIALS: Record<string, string[]> = {
    "Mondstadt": ["Fight for Glory", "Resistance and Tenacity", "Ballads of Bravery"],
    "Liyue": ["Fruits of Diligence", "Gold", "Relics of the Golden City"],
    "Inazuma": ["Ephemeral Dreams", "Lightning and Storm", "Scorched Stones"],
    "Sumeru": ["Adventures of the Dawn", "The Pilgrimage", "Blazing Heart"]
  };
  
  // Resin cost per domain run
  private readonly RESIN_PER_DOMAIN = 20;
  
  // Base ascension material requirements (simplified)
  private readonly ASCENSION_MATERIALS: Record<number, MaterialRequirement[]> = {
    20: [
      { materialId: "sliver", materialName: "Jewel Sliver", quantity: 1, tier: 1 },
      { materialId: "local1", materialName: "Local Specialty", quantity: 3, tier: 1 },
      { materialId: "boss1", materialName: "Boss Material", quantity: 1, tier: 1 }
    ],
    40: [
      { materialId: "fragment", materialName: "Jewel Fragment", quantity: 3, tier: 2 },
      { materialId: "local2", materialName: "Local Specialty", quantity: 15, tier: 2 },
      { materialId: "boss2", materialName: "Boss Material", quantity: 2, tier: 2 }
    ],
    50: [
      { materialId: "chunk", materialName: "Jewel Chunk", quantity: 6, tier: 3 },
      { materialId: "local3", materialName: "Local Specialty", quantity: 12, tier: 3 },
      { materialId: "boss3", materialName: "Boss Material", quantity: 4, tier: 3 }
    ],
    60: [
      { materialId: "gemstone", materialName: "Jewel Gemstone", quantity: 6, tier: 4 },
      { materialId: "local4", materialName: "Local Specialty", quantity: 18, tier: 4 },
      { materialId: "boss4", materialName: "Boss Material", quantity: 8, tier: 4 }
    ],
    70: [
      { materialId: "gemstone", materialName: "Jewel Gemstone", quantity: 12, tier: 4 },
      { materialId: "local5", materialName: "Local Specialty", quantity: 24, tier: 4 },
      { materialId: "boss5", materialName: "Boss Material", quantity: 12, tier: 4 }
    ],
    80: [
      { materialId: "gemstone", materialName: "Jewel Gemstone", quantity: 20, tier: 4 },
      { materialId: "local6", materialName: "Local Specialty", quantity: 36, tier: 4 },
      { materialId: "boss6", materialName: "Boss Material", quantity: 20, tier: 4 }
    ],
    90: [
      { materialId: "gemstone", materialName: "Jewel Gemstone", quantity: 24, tier: 4 },
      { materialId: "local7", materialName: "Local Specialty", quantity: 48, tier: 4 },
      { materialId: "boss7", materialName: "Boss Material", quantity: 24, tier: 4 }
    ]
  };
  
  // Talent upgrade material requirements (simplified)
  private readonly TALENT_MATERIALS: Record<number, MaterialRequirement[]> = {
    2: [
      { materialId: "talent1", materialName: "Talent Book 1", quantity: 3, tier: 1 },
      { materialId: "boss1", materialName: "Boss Material", quantity: 1, tier: 1 }
    ],
    3: [
      { materialId: "talent2", materialName: "Talent Book 2", quantity: 2, tier: 2 },
      { materialId: "boss2", materialName: "Boss Material", quantity: 2, tier: 2 }
    ],
    4: [
      { materialId: "talent2", materialName: "Talent Book 2", quantity: 4, tier: 2 },
      { materialId: "boss3", materialName: "Boss Material", quantity: 2, tier: 2 }
    ],
    5: [
      { materialId: "talent3", materialName: "Talent Book 3", quantity: 6, tier: 3 },
      { materialId: "boss4", materialName: "Boss Material", quantity: 4, tier: 3 }
    ],
    6: [
      { materialId: "talent3", materialName: "Talent Book 3", quantity: 9, tier: 3 },
      { materialId: "boss5", materialName: "Boss Material", quantity: 6, tier: 3 }
    ],
    7: [
      { materialId: "talent4", materialName: "Talent Book 4", quantity: 12, tier: 4 },
      { materialId: "boss6", materialName: "Boss Material", quantity: 9, tier: 4 }
    ],
    8: [
      { materialId: "talent4", materialName: "Talent Book 4", quantity: 16, tier: 4 },
      { materialId: "boss7", materialName: "Boss Material", quantity: 12, tier: 4 }
    ],
    9: [
      { materialId: "talent4", materialName: "Talent Book 4", quantity: 20, tier: 4 },
      { materialId: "boss8", materialName: "Boss Material", rarity: 16, tier: 4 }
    ],
    10: [
      { materialId: "talent4", materialName: "Talent Book 4", quantity: 24, tier: 4 },
      { materialId: "boss9", materialName: "Boss Material", quantity: 20, tier: 4 }
    ]
  };
  
  /**
   * Calculate ascension materials for a character
   */
  calculateAscensionMaterials(
    characterName: string,
    currentLevel: number,
    targetLevel: number,
    vision: string
  ): AscensionPlan {
    const materials: MaterialRequirement[] = [];
    const ascensionLevels = [20, 40, 50, 60, 70, 80, 90];
    
    // Calculate materials for each ascension level between current and target
    for (const level of ascensionLevels) {
      if (level > currentLevel && level <= targetLevel) {
        const levelMaterials = this.ASCENSION_MATERIALS[level] || [];
        
        for (const material of levelMaterials) {
          // Customize material name based on vision
          const visionMaterial = this.customizeMaterialName(material, vision);
          materials.push(visionMaterial);
        }
      }
    }
    
    // Aggregate materials
    const aggregatedMaterials = this.aggregateMaterials(materials);
    
    // Calculate resin needed
    const totalResinNeeded = this.calculateResinForMaterials(aggregatedMaterials);
    
    // Calculate farming days
    const farmingDays = this.calculateFarmingDays(aggregatedMaterials);
    
    // Get recommended domains
    const recommendedDomains = this.getRecommendedDomains(vision);
    
    return {
      characterName,
      currentLevel,
      targetLevel,
      materials: aggregatedMaterials,
      totalResinNeeded,
      farmingDays,
      recommendedDomains
    };
  }
  
  /**
   * Customize material name based on character vision
   */
  private customizeMaterialName(material: MaterialRequirement, vision: string): MaterialRequirement {
    const visionPrefix = vision === "Pyro" ? "Agnidus" :
                        vision === "Hydro" ? "Varunada" :
                        vision === "Anemo" ? "Vajrada" :
                        vision === "Electro" ? "Vajrada" :
                        vision === "Cryo" ? "Shivada" :
                        vision === "Geo" ? "Prithiva" :
                        vision === "Dendro" ? "Nagadus" : "";
    
    if (material.materialName.includes("Jewel")) {
      return {
        ...material,
        materialName: `${visionPrefix} ${material.materialName}`
      };
    }
    
    return material;
  }
  
  /**
   * Aggregate duplicate materials
   */
  private aggregateMaterials(materials: MaterialRequirement[]): MaterialRequirement[] {
    const aggregated = new Map<string, MaterialRequirement>();
    
    for (const material of materials) {
      const existing = aggregated.get(material.materialId);
      
      if (existing) {
        existing.quantity += material.quantity;
      } else {
        aggregated.set(material.materialId, { ...material });
      }
    }
    
    return Array.from(aggregated.values());
  }
  
  /**
   * Calculate resin needed for materials
   */
  private calculateResinForMaterials(materials: MaterialRequirement[]): number {
    let totalResin = 0;
    
    for (const material of materials) {
      if (material.domain) {
        // Domain materials cost resin
        const runsNeeded = Math.ceil(material.quantity / (material.dropRate || 1));
        totalResin += runsNeeded * this.RESIN_PER_DOMAIN;
      } else if (material.tier >= 3) {
        // High-tier materials typically require domain runs
        totalResin += this.RESIN_PER_DOMAIN * 2;
      }
    }
    
    return totalResin;
  }
  
  /**
   * Calculate farming days needed
   */
  private calculateFarmingDays(materials: MaterialRequirement[]): number {
    // Assuming 160 resin/day and focusing on materials
    const dailyResin = 160;
    const totalResin = this.calculateResinForMaterials(materials);
    
    return Math.ceil(totalResin / dailyResin);
  }
  
  /**
   * Get recommended domains for a vision
   */
  private getRecommendedDomains(vision: string): string[] {
    const visionDomain: Record<string, string> = {
      "Pyro": "Mondstadt",
      "Hydro": "Mondstadt",
      "Anemo": "Mondstadt",
      "Electro": "Inazuma",
      "Cryo": "Mondstadt",
      "Geo": "Liyue",
      "Dendro": "Sumeru"
    };
    
    return [visionDomain[vision] || "Mondstadt"];
  }
  
  /**
   * Calculate talent upgrade materials
   */
  calculateTalentMaterials(
    characterName: string,
    currentLevels: { normalAttack: number; elementalSkill: number; elementalBurst: number },
    targetLevels: { normalAttack: number; elementalSkill: number; elementalBurst: number },
    vision: string
  ): TalentPlan {
    const materials: MaterialRequirement[] = [];
    
    // Calculate materials for each talent
    const talents = ["normalAttack", "elementalSkill", "elementalBurst"] as const;
    
    for (const talent of talents) {
      const current = currentLevels[talent];
      const target = targetLevels[talent];
      
      for (let level = current + 1; level <= target; level++) {
        const levelMaterials = this.TALENT_MATERIALS[level] || [];
        materials.push(...levelMaterials);
      }
    }
    
    // Aggregate materials
    const aggregatedMaterials = this.aggregateMaterials(materials);
    
    // Calculate resin needed
    const totalResinNeeded = this.calculateResinForMaterials(aggregatedMaterials);
    
    // Get recommended domains
    const recommendedDomains = this.getRecommendedDomains(vision);
    
    return {
      characterName,
      talentLevels: currentLevels,
      targetLevels,
      materials: aggregatedMaterials,
      totalResinNeeded,
      recommendedDomains
    };
  }
  
  /**
   * Generate optimal farming schedule
   */
  generateFarmingSchedule(
    characters: Array<{ name: string; vision: string; priority: number }>
  ): FarmingSchedule[] {
    const schedule: FarmingSchedule[] = [];
    
    for (const [day, domains] of Object.entries(this.DOMAIN_SCHEDULE)) {
      const charactersForDay = characters.filter(char => {
        const recommendedDomains = this.getRecommendedDomains(char.vision);
        return domains.includes("All domains") || 
               recommendedDomains.some(d => domains.includes(d));
      });
      
      // Sort by priority
      charactersForDay.sort((a, b) => b.priority - a.priority);
      
      // Get materials for this day
      const materialsForDay = domains.flatMap(domain => 
        this.DOMAIN_MATERIALS[domain] || []
      );
      
      schedule.push({
        day: day as any,
        domains,
        characters: charactersForDay.map(c => c.name),
        materials: materialsForDay
      });
    }
    
    return schedule;
  }
  
  /**
   * Analyze material shortages
   */
  analyzeMaterialShortages(
    requiredMaterials: MaterialRequirement[],
    inventory: Record<string, number>
  ): Array<{ material: MaterialRequirement; shortage: number; priority: "high" | "medium" | "low" }> {
    const shortages: Array<{ material: MaterialRequirement; shortage: number; priority: "high" | "medium" | "low" }> = [];
    
    for (const material of requiredMaterials) {
      const owned = inventory[material.materialId] || 0;
      const shortage = Math.max(0, material.quantity - owned);
      
      if (shortage > 0) {
        let priority: "high" | "medium" | "low" = "medium";
        
        // High priority for boss materials and high-tier materials
        if (material.tier >= 3 || material.materialName.includes("Boss")) {
          priority = "high";
        } else if (material.tier === 1) {
          priority = "low";
        }
        
        shortages.push({
          material,
          shortage,
          priority
        });
      }
    }
    
    // Sort by priority and shortage amount
    shortages.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      return b.shortage - a.shortage;
    });
    
    return shortages;
  }
  
  /**
   * Generate material checklist
   */
  generateMaterialChecklist(
    plans: Array<AscensionPlan | TalentPlan>
  ): {
    totalMaterials: MaterialRequirement[];
    totalResin: number;
    totalDays: number;
    priorityList: Array<{ material: MaterialRequirement; needed: number; priority: string }>;
  } {
    const allMaterials: MaterialRequirement[] = [];
    let totalResin = 0;
    let totalDays = 0;
    
    for (const plan of plans) {
      allMaterials.push(...plan.materials);
      totalResin += plan.totalResinNeeded;
      totalDays += plan.farmingDays || 0;
    }
    
    // Aggregate all materials
    const aggregatedMaterials = this.aggregateMaterials(allMaterials);
    
    // Generate priority list
    const priorityList = aggregatedMaterials.map(material => ({
      material,
      needed: material.quantity,
      priority: material.tier >= 3 ? "high" : material.tier === 2 ? "medium" : "low"
    })).sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    return {
      totalMaterials: aggregatedMaterials,
      totalResin,
      totalDays,
      priorityList
    };
  }
}

export { MaterialCalculator, type MaterialRequirement, type AscensionPlan, type TalentPlan, type FarmingSchedule };