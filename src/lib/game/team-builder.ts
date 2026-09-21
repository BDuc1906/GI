// src/lib/game/team-builder.ts
/**
 * Team Builder Tool với Elemental Reaction Simulator
 * 
 * Features:
 * 1. Elemental reaction simulation
 * 2. Team composition analysis
 * 3. Synergy calculation
 * 4. ER requirement optimization
 * 5. Elemental resonance benefits
 */

interface Character {
  id: string;
  name: string;
  vision: string;
  weaponType: string;
  role: "main DPS" | "sub DPS" | "support" | "healer" | "shielder";
  erRequirement: number; // Energy Recharge requirement
  burstCost: number;
  skillCooldown: number;
}

interface Team {
  characters: Character[];
  name?: string;
}

interface ElementalReaction {
  name: string;
  trigger: string;
  aura: string;
  multiplier: number;
  frequency: "high" | "medium" | "low";
}

interface TeamAnalysis {
  elementalResonance: string[];
  reactions: ElementalReaction[];
  synergies: string[];
  weaknesses: string[];
  totalERRequirement: number;
  sustainability: number; // 0-1
  damagePotential: number; // 0-1
  flexibility: number; // 0-1
  recommendations: string[];
}

class TeamBuilder {
  /**
   * Calculate elemental resonance for a team
   */
  calculateElementalResonance(team: Team): string[] {
    const elementCounts = new Map<string, number>();
    
    for (const char of team.characters) {
      const count = elementCounts.get(char.vision) || 0;
      elementCounts.set(char.vision, count + 1);
    }
    
    const resonances: string[] = [];
    
    for (const [element, count] of elementCounts.entries()) {
      if (count >= 2) {
        resonances.push(this.getResonanceEffect(element));
      }
    }
    
    return resonances;
  }
  
  /**
   * Get resonance effect for an element
   */
  private getResonanceEffect(element: string): string {
    const effects: Record<string, string> = {
      "Pyro": "Pyro Resonance: +25% ATK and +15% Pyro reaction damage",
      "Hydro": "Hydro Resonance: +25% HP and -40% Hydro effect duration",
      "Anemo": "Anemo Resonance: -15% skill cooldown and -10% stamina consumption",
      "Electro": "Electro Resonance: -30% Energy Recharge requirement and +30% Elemental Energy recovery",
      "Cryo": "Cryo Resonance: +15% CRIT Rate against Cryo-affected enemies",
      "Geo": "Geo Resonance: +15% shield strength and +15% damage when shielded",
      "Dendro": "Dendro Resonance: +30% Elemental Mastery for reactions involving Dendro"
    };
    
    return effects[element] || `${element} Resonance: Elemental bonus`;
  }
  
  /**
   * Simulate elemental reactions for a team
   */
  simulateReactions(team: Team): ElementalReaction[] {
    const reactions: ElementalReaction[] = [];
    const elements = team.characters.map(c => c.vision);
    
    // Common reaction combinations
    const reactionPairs: Array<[string, string, string, number, string]> = [
      ["Pyro", "Hydro", "Vaporize", 2.0, "high"],
      ["Hydro", "Pyro", "Vaporize", 1.5, "high"],
      ["Cryo", "Pyro", "Melt", 2.0, "high"],
      ["Pyro", "Cryo", "Melt", 1.5, "high"],
      ["Pyro", "Electro", "Overload", 1.0, "medium"],
      ["Cryo", "Electro", "Superconduct", 1.0, "medium"],
      ["Electro", "Hydro", "Electro-Charged", 1.0, "high"],
      ["Cryo", "Hydro", "Frozen", 1.0, "high"],
      ["Pyro", "Dendro", "Burning", 1.0, "medium"],
      ["Hydro", "Dendro", "Bloom", 1.0, "high"],
      ["Electro", "Dendro", "Quicken", 1.15, "medium"],
      ["Geo", "any", "Crystallize", 1.0, "medium"]
    ];
    
    for (const [elem1, elem2, reaction, multiplier, frequency] of reactionPairs) {
      if (this.hasReaction(elements, elem1, elem2)) {
        reactions.push({
          name: reaction,
          trigger: elem1,
          aura: elem2 === "any" ? "any" : elem2,
          multiplier,
          frequency: frequency as "high" | "medium" | "low"
        });
      }
    }
    
    return reactions;
  }
  
  /**
   * Check if team has specific reaction elements
   */
  private hasReaction(elements: string[], elem1: string, elem2: string): boolean {
    const hasElem1 = elements.includes(elem1);
    const hasElem2 = elem2 === "any" ? elements.length > 0 : elements.includes(elem2);
    return hasElem1 && hasElem2;
  }
  
  /**
   * Calculate team synergies
   */
  calculateSynergies(team: Team): string[] {
    const synergies: string[] = [];
    const elements = team.characters.map(c => c.vision);
    const roles = team.characters.map(c => c.role);
    
    // Role-based synergies
    const hasMainDPS = roles.includes("main DPS");
    const hasSubDPS = roles.includes("sub DPS");
    const hasSupport = roles.includes("support");
    const hasHealer = roles.includes("healer");
    const hasShielder = roles.includes("shielder");
    
    if (hasMainDPS && hasSubDPS) {
      synergies.push("Strong DPS carry + sub DPS synergy");
    }
    
    if (hasSupport && hasMainDPS) {
      synergies.push("Support enhances main DPS output");
    }
    
    if (hasHealer && hasShielder) {
      synergies.push("Strong sustain with healing + shielding");
    }
    
    // Elemental synergies
    if (elements.includes("Anemo") && elements.length > 1) {
      synergies.push("Anemo character enables grouping and resistance shred");
    }
    
    if (elements.includes("Dendro") && elements.includes("Hydro")) {
      synergies.push("Dendro + Hydro enables powerful reaction teams");
    }
    
    if (elements.includes("Electro") && elements.includes("Hydro")) {
      synergies.push("Electro + Hydro enables consistent damage output");
    }
    
    // Special character synergies (simplified)
    const characterNames = team.characters.map(c => c.name.toLowerCase());
    if (characterNames.some(n => n.includes("raiden")) && characterNames.some(n => n.includes("bennett"))) {
      synergies.push("Raiden + Bennett synergy: High ER sustain");
    }
    
    if (characterNames.some(n => n.includes("kazuha")) && characterNames.some(n => n.includes("xiangling"))) {
      synergies.push("Kazuha + Xiangling synergy: Pyro grouping + boost");
    }
    
    return synergies;
  }
  
  /**
   * Identify team weaknesses
   */
  identifyWeaknesses(team: Team): string[] {
    const weaknesses: string[] = [];
    const elements = team.characters.map(c => c.vision);
    const roles = team.characters.map(c => c.role);
    
    // Role imbalances
    const hasHealer = roles.includes("healer");
    const hasShielder = roles.includes("shielder");
    
    if (!hasHealer && !hasShielder) {
      weaknesses.push("No sustain - may struggle with sustained damage");
    }
    
    if (!roles.includes("main DPS")) {
      weaknesses.push("No dedicated main DPS - damage may be inconsistent");
    }
    
    // Elemental imbalances
    const uniqueElements = new Set(elements);
    if (uniqueElements.size === 1) {
      weaknesses.push("Mono-element team - limited reaction options");
    }
    
    if (uniqueElements.size === 4) {
      weaknesses.push("Quad-element team - may lack elemental resonance bonuses");
    }
    
    // ER sustainability
    const totalERRequirement = team.characters.reduce((sum, char) => sum + char.erRequirement, 0);
    const avgERRequirement = totalERRequirement / team.characters.length;
    
    if (avgERRequirement > 2.0) {
      weaknesses.push("High ER requirements - may have burst uptime issues");
    }
    
    // CC vulnerabilities
    if (!elements.includes("Crowd Control") && !elements.includes("Anemo")) {
      weaknesses.push("Limited crowd control - may struggle with mobile enemies");
    }
    
    return weaknesses;
  }
  
  /**
   * Calculate total ER requirement for team
   */
  calculateTotalERRequirement(team: Team): number {
    return team.characters.reduce((sum, char) => sum + char.erRequirement, 0);
  }
  
  /**
   * Calculate team sustainability (0-1)
   */
  calculateSustainability(team: Team): number {
    const roles = team.characters.map(c => c.role);
    const hasHealer = roles.includes("healer");
    const hasShielder = roles.includes("shielder");
    const hasSupport = roles.includes("support");
    
    let sustainability = 0.5; // Base sustainability
    
    if (hasHealer) sustainability += 0.2;
    if (hasShielder) sustainability += 0.2;
    if (hasSupport) sustainability += 0.1;
    
    // ER sustainability
    const avgERRequirement = this.calculateTotalERRequirement(team) / team.characters.length;
    if (avgERRequirement < 1.5) sustainability += 0.1;
    else if (avgERRequirement > 2.0) sustainability -= 0.1;
    
    return Math.min(1, Math.max(0, sustainability));
  }
  
  /**
   * Calculate damage potential (0-1)
   */
  calculateDamagePotential(team: Team): number {
    const reactions = this.simulateReactions(team);
    const resonances = this.calculateElementalResonance(team);
    const roles = team.characters.map(c => c.role);
    
    let damagePotential = 0.5; // Base damage
    
    // Reaction bonus
    const highReactions = reactions.filter(r => r.frequency === "high").length;
    damagePotential += highReactions * 0.1;
    
    // Resonance bonus
    damagePotential += resonances.length * 0.05;
    
    // Role bonus
    if (roles.includes("main DPS")) damagePotential += 0.15;
    if (roles.includes("sub DPS")) damagePotential += 0.1;
    
    return Math.min(1, Math.max(0, damagePotential));
  }
  
  /**
   * Calculate team flexibility (0-1)
   */
  calculateFlexibility(team: Team): number {
    const elements = team.characters.map(c => c.vision);
    const uniqueElements = new Set(elements);
    const roles = team.characters.map(c => c.role);
    const uniqueRoles = new Set(roles);
    
    let flexibility = 0.5; // Base flexibility
    
    // Elemental diversity
    if (uniqueElements.size === 2) flexibility += 0.1;
    else if (uniqueElements.size === 3) flexibility += 0.2;
    else if (uniqueElements.size === 4) flexibility += 0.1;
    
    // Role diversity
    if (uniqueRoles.size >= 3) flexibility += 0.2;
    else if (uniqueRoles.size === 2) flexibility += 0.1;
    
    return Math.min(1, Math.max(0, flexibility));
  }
  
  /**
   * Generate team recommendations
   */
  generateRecommendations(team: Team): string[] {
    const recommendations: string[] = [];
    const analysis = this.analyzeTeam(team);
    
    // Improve sustainability
    if (analysis.sustainability < 0.6) {
      recommendations.push("Consider adding a healer or shielder for better sustain");
    }
    
    // Improve damage
    if (analysis.damagePotential < 0.6) {
      recommendations.push("Consider adding reaction-enabling characters for more damage");
    }
    
    // Improve flexibility
    if (analysis.flexibility < 0.6) {
      recommendations.push("Consider diversifying elements and roles for more flexibility");
    }
    
    // Optimize ER
    if (analysis.totalERRequirement > 2.5) {
      recommendations.push("Consider optimizing ER requirements or adding ER support");
    }
    
    // Elemental recommendations
    const elements = team.characters.map(c => c.vision);
    if (!elements.includes("Anemo") && analysis.damagePotential < 0.7) {
      recommendations.push("Consider adding an Anemo character for grouping and buffs");
    }
    
    if (!elements.includes("Electro") && !elements.includes("Dendro")) {
      recommendations.push("Consider adding Electro or Dendro for powerful reaction options");
    }
    
    return recommendations;
  }
  
  /**
   * Complete team analysis
   */
  analyzeTeam(team: Team): TeamAnalysis {
    return {
      elementalResonance: this.calculateElementalResonance(team),
      reactions: this.simulateReactions(team),
      synergies: this.calculateSynergies(team),
      weaknesses: this.identifyWeaknesses(team),
      totalERRequirement: this.calculateTotalERRequirement(team),
      sustainability: this.calculateSustainability(team),
      damagePotential: this.calculateDamagePotential(team),
      flexibility: this.calculateFlexibility(team),
      recommendations: this.generateRecommendations(team)
    };
  }
  
  /**
   * Suggest optimal team composition for a character
   */
  suggestOptimalTeam(character: Character, availableCharacters: Character[]): Team[] {
    const suggestions: Team[] = [];
    
    // Filter compatible characters (different from main character)
    const others = availableCharacters.filter(c => c.id !== character.id);
    
    // Generate 3-character combinations
    for (let i = 0; i < others.length; i++) {
      for (let j = i + 1; j < others.length; j++) {
        for (let k = j + 1; k < others.length; k++) {
          const team: Team = {
            characters: [character, others[i], others[j], others[k]]
          };
          
          const analysis = this.analyzeTeam(team);
          
          // Filter for good teams
          if (analysis.damagePotential > 0.6 && analysis.sustainability > 0.5) {
            suggestions.push(team);
          }
        }
      }
    }
    
    // Sort by overall score
    suggestions.sort((a, b) => {
      const analysisA = this.analyzeTeam(a);
      const analysisB = this.analyzeTeam(b);
      const scoreA = analysisA.damagePotential + analysisA.sustainability + analysisA.flexibility;
      const scoreB = analysisB.damagePotential + analysisB.sustainability + analysisB.flexibility;
      return scoreB - scoreA;
    });
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }
}

export { TeamBuilder };
export type { Character, Team, ElementalReaction, TeamAnalysis };