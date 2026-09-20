// src/agent/core/rag-system.ts
/**
 * RAG (Retrieval-Augmented Generation) System cho AI Agent
 * 
 * Cung cấp detailed game knowledge cho AI Agent thông qua:
 * 1. Vector similarity search
 * 2. Knowledge base indexing
 * 3. Context retrieval
 * 4. Dynamic knowledge updates
 */

import { prisma } from "@/lib/db/prisma";

interface KnowledgeChunk {
  id: string;
  content: string;
  source: string;
  category: string;
  tags: string[];
  embedding?: number[];
  metadata: Record<string, unknown>;
}

interface RetrievalResult {
  chunk: KnowledgeChunk;
  similarity: number;
}

interface RAGConfig {
  maxChunks: number;
  minSimilarity: number;
  categories: string[];
}

class RAGSystem {
  private knowledgeBase: Map<string, KnowledgeChunk[]> = new Map();
  private config: RAGConfig;
  
  constructor(config?: Partial<RAGConfig>) {
    this.config = {
      maxChunks: config?.maxChunks || 5,
      minSimilarity: config?.minSimilarity || 0.7,
      categories: config?.categories || [
        "characters",
        "weapons", 
        "artifacts",
        "elements",
        "reactions",
        "domains",
        "materials",
        "team_building",
        "spiral_abyss",
        "meta_analysis"
      ]
    };
  }
  
  /**
   * Load knowledge base từ database
   */
  async loadKnowledgeBase(): Promise<void> {
    console.log("🔄 Loading RAG knowledge base from database...");
    
    // Load character knowledge
    const characters = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        vision: true,
        weaponType: true,
        rarity: true,
        talents: true,
        constellations: true,
        statsByLevel: true,
      },
    });
    
    const characterChunks: KnowledgeChunk[] = characters.map(char => ({
      id: `char-${char.id}`,
      content: this.buildCharacterContent(char),
      source: "database",
      category: "characters",
      tags: [char.vision, char.weaponType, `rarity-${char.rarity}`],
      metadata: {
        characterId: char.id,
        characterName: char.name,
        vision: char.vision,
        weaponType: char.weaponType,
        rarity: char.rarity,
      },
    }));
    
    this.knowledgeBase.set("characters", characterChunks);
    
    // Load weapon knowledge
    const weapons = await prisma.weapon.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        rarity: true,
        passiveByRefinement: true,
        statsByLevel: true,
      },
    });
    
    const weaponChunks: KnowledgeChunk[] = weapons.map(weapon => ({
      id: `weapon-${weapon.id}`,
      content: this.buildWeaponContent(weapon),
      source: "database",
      category: "weapons",
      tags: [weapon.type, `rarity-${weapon.rarity}`],
      metadata: {
        weaponId: weapon.id,
        weaponName: weapon.name,
        type: weapon.type,
        rarity: weapon.rarity,
      },
    }));
    
    this.knowledgeBase.set("weapons", weaponChunks);
    
    // Load elemental reactions knowledge
    const reactionChunks: KnowledgeChunk[] = this.buildReactionKnowledge();
    this.knowledgeBase.set("reactions", reactionChunks);
    
    // Load team building knowledge
    const teamChunks: KnowledgeChunk[] = this.buildTeamBuildingKnowledge();
    this.knowledgeBase.set("team_building", teamChunks);
    
    // Load spiral abyss knowledge
    const abyssChunks: KnowledgeChunk[] = this.buildSpiralAbyssKnowledge();
    this.knowledgeBase.set("spiral_abyss", abyssChunks);
    
    console.log(`✅ Loaded RAG knowledge base: ${this.getTotalChunks()} chunks across ${this.knowledgeBase.size} categories`);
  }
  
  /**
   * Build character content chunk
   */
  private buildCharacterContent(character: any): string {
    const talents = character.talents || [];
    const constellations = character.constellations || [];
    
    return `
Character: ${character.name}
Vision: ${character.vision}
Weapon: ${character.weaponType}
Rarity: ${character.rarity}★

Description: ${character.description || "N/A"}

Talents:
${talents.map((t: any, i: number) => `${i + 1}. ${t.name}: ${t.description}`).join("\n")}

Constellations:
${constellations.map((c: any, i: number) => `C${i + 1}. ${c.name}: ${c.description}`).join("\n")}

Stats progression available for levels 1-90.
`.trim();
  }
  
  /**
   * Build weapon content chunk
   */
  private buildWeaponContent(weapon: any): string {
    const passives = weapon.passiveByRefinement || [];
    
    return `
Weapon: ${weapon.name}
Type: ${weapon.type}
Rarity: ${weapon.rarity}★

Refinement Effects:
${passives.map((p: any, i: number) => `R${i + 1}: ${p.description}`).join("\n")}

Stats progression available for levels 1-90.
`.trim();
  }
  
  /**
   * Build elemental reactions knowledge
   */
  private buildReactionKnowledge(): KnowledgeChunk[] {
    const reactions = [
      {
        name: "Vaporize",
        elements: "Hydro + Pyro",
        multiplier: "2.0x (Hydro on Pyro), 1.5x (Pyro on Hydro)",
        description: "Amplifying reaction that increases damage based on elemental gauge."
      },
      {
        name: "Melt",
        elements: "Cryo + Pyro",
        multiplier: "2.0x (Pyro on Cryo), 1.5x (Cryo on Pyro)",
        description: "Amplifying reaction that increases damage based on elemental gauge."
      },
      {
        name: "Overload",
        elements: "Pyro + Electro",
        multiplier: "AoE explosion damage",
        description: "Transformative reaction that deals AoE Pyro damage."
      },
      {
        name: "Superconduct",
        elements: "Cryo + Electro",
        multiplier: "Reduces Physical RES by 40%",
        description: "Transformative reaction that reduces physical resistance."
      },
      {
        name: "Electro-Charged",
        elements: "Electro + Hydro",
        multiplier: "DoT + AoE damage",
        description: "Transformative reaction that deals damage over time and spreads to nearby wet enemies."
      },
      {
        name: "Frozen",
        elements: "Cryo + Hydro",
        multiplier: "Immobilizes enemy",
        description: "Shield reaction that freezes enemies in place. Can be shattered for extra damage."
      },
      {
        name: "Shatter",
        elements: "Physical on Frozen",
        multiplier: "Additional damage",
        description: "Deals extra damage when attacking frozen enemies with physical damage."
      },
      {
        name: "Burning",
        elements: "Pyro + Dendro",
        multiplier: "DoT based on EM",
        description: "Transformative reaction that deals Pyro damage over time."
      },
      {
        name: "Bloom",
        elements: "Hydro + Dendro",
        multiplier: "Creates Dendro Cores",
        description: "Transformative reaction that creates Dendro Cores that explode on contact."
      },
      {
        name: "Hyperbloom",
        elements: "Electro + Dendro Core",
        multiplier: "High single-target damage",
        description: "Triggered by Electro on Dendro Cores, deals high single-target damage."
      },
      {
        name: "Burgeon",
        elements: "Pyro + Dendro Core",
        multiplier: "AoE damage",
        description: "Triggered by Pyro on Dendro Cores, deals AoE Pyro damage."
      },
      {
        name: "Quicken",
        elements: "Dendro + Electro",
        multiplier: "Creates Quicken aura",
        description: "Creates aura that can be triggered by further reactions for additional damage."
      },
      {
        name: "Aggravate",
        elements: "Electro on Quicken aura",
        multiplier: "1.5x damage boost",
        description: "Triggered by Electro on Quicken aura, boosts Electro damage."
      },
      {
        name: "Spread",
        elements: "Dendro on Quicken aura",
        multiplier: "1.25x damage boost",
        description: "Triggered by Dendro on Quicken aura, boosts Dendro damage."
      },
      {
        name: "Crystallize",
        elements: "Geo + any element",
        multiplier: "Creates elemental shield",
        description: "Shield reaction that creates elemental shields absorbing damage of that element."
      }
    ];
    
    return reactions.map(reaction => ({
      id: `reaction-${reaction.name}`,
      content: `
${reaction.name} (${reaction.elements})
Multiplier: ${reaction.multiplier}
Description: ${reaction.description}
`.trim(),
      source: "game_knowledge",
      category: "reactions",
      tags: reaction.elements.split(" + "),
      metadata: {
        reactionName: reaction.name,
        elements: reaction.elements,
        type: reaction.elements.includes("+") ? "transformative" : "amplifying"
      }
    }));
  }
  
  /**
   * Build team building knowledge
   */
  private buildTeamBuildingKnowledge(): KnowledgeChunk[] {
    const teams = [
      {
        name: "Hyperbloom",
        composition: "Dendro + Hydro + Electro",
        characters: "Nahida, Kokomi, Kuki Shinobu, Xingqiu/Yelan",
        description: "Focuses on triggering Hyperbloom reaction for high single-target damage.",
        tips: "High EM requirement for Dendro characters, Kokomi for hydro application, Kuki for electro trigger."
      },
      {
        name: "Rational Childe",
        composition: "Hydro + Pyro + Anemo",
        characters: "Childe, Xiangling, Bennett, Kazuha",
        description: "Uses Childe's hydro application with Xiangling's pyro for Vaporize reactions.",
        tips: "Kazuha for grouping and resistance shred, Bennett for pyro application and buff."
      },
      {
        name: "International",
        composition: "Electro + Pyro + Anemo",
        characters: "Raiden Shogun, Xiangling, Bennett, Kazuha",
        description: "Raiden focused team with pyro support for Overload reactions.",
        tips: "Raiden as main DPS, Xiangling for pyro application, Bennett for buff, Kazuha for support."
      },
      {
        name: "Mono-Pyro",
        composition: "Pyro only",
        characters: "Xiangling, Bennett, Kazuha, Xinyan",
        description: "All pyro team for maximum pyro resonance and reactions.",
        tips: "Strong pyro resonance bonus, Bennett healing, Kazuha grouping."
      },
      {
        name: "Freeze",
        composition: "Cryo + Hydro",
        characters: "Ayaka, Kokomi, Shenhe, Kazuha",
        description: "Freezes enemies for control and shatter damage.",
        tips: "Ayaka main DPS, Kokomi hydro application, Shenhe cryo buff, Kazuha grouping."
      }
    ];
    
    return teams.map(team => ({
      id: `team-${team.name}`,
      content: `
${team.name}
Composition: ${team.composition}
Key Characters: ${team.characters}
Description: ${team.description}
Tips: ${team.tips}
`.trim(),
      source: "meta_knowledge",
      category: "team_building",
      tags: team.composition.split(" + "),
      metadata: {
        teamName: team.name,
        archetypes: team.composition.split(" + "),
        metaTier: "S"
      }
    }));
  }
  
  /**
   * Build spiral abyss knowledge
   */
  private buildSpiralAbyssKnowledge(): KnowledgeChunk[] {
    const knowledge = [
      {
        topic: "Floor Structure",
        content: "Spiral Abyss has 16 floors. Floors 1-8 are early game, 9-12 are mid game, 13-16 are endgame requiring optimized builds."
      },
      {
        topic: "Star Requirements",
        content: "36 stars total for full rewards (600 Primogems). 9 stars per chamber (3 stars per half-chamber)."
      },
      {
        topic: "Current Meta",
        content: "Top teams include Hyperbloom, Rational Childe, International, Mono-Pyro, and Freeze comps."
      },
      {
        topic: "Buffs",
        content: "Each floor has specific buffs that change every rotation. Adapt team composition to maximize buff benefits."
      },
      {
        topic: "Enemy Types",
        content: "Abyss features high defense enemies, mechanical enemies, and elemental shields. Bring appropriate counters."
      }
    ];
    
    return knowledge.map(item => ({
      id: `abyss-${item.topic}`,
      content: item.content,
      source: "game_knowledge",
      category: "spiral_abyss",
      tags: ["abyss", "endgame"],
      metadata: {
        topic: item.topic
      }
    }));
  }
  
  /**
   * Simple keyword matching retrieval (would use vector embeddings in production)
   */
  private retrieveChunks(query: string, category?: string): RetrievalResult[] {
    const queryLower = query.toLowerCase();
    const results: RetrievalResult[] = [];
    
    const categoriesToSearch = category ? [category] : this.config.categories;
    
    for (const cat of categoriesToSearch) {
      const chunks = this.knowledgeBase.get(cat) || [];
      
      for (const chunk of chunks) {
        // Simple keyword matching
        const contentLower = chunk.content.toLowerCase();
        const tagsLower = chunk.tags.map(t => t.toLowerCase());
        
        let matchScore = 0;
        
        // Direct content match
        if (contentLower.includes(queryLower)) {
          matchScore += 1.0;
        }
        
        // Tag matches
        for (const tag of tagsLower) {
          if (tag.includes(queryLower) || queryLower.includes(tag)) {
            matchScore += 0.5;
          }
        }
        
        // Partial word matches
        const queryWords = queryLower.split(/\s+/);
        for (const word of queryWords) {
          if (contentLower.includes(word) && word.length > 3) {
            matchScore += 0.3;
          }
        }
        
        if (matchScore >= this.config.minSimilarity) {
          results.push({
            chunk,
            similarity: matchScore
          });
        }
      }
    }
    
    // Sort by similarity and take top results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, this.config.maxChunks);
  }
  
  /**
   * Retrieve relevant knowledge for a query
   */
  async retrieve(query: string, category?: string): Promise<string> {
    const results = this.retrieveChunks(query, category);
    
    if (results.length === 0) {
      return "";
    }
    
    const context = results.map((result, index) => 
      `[Knowledge ${index + 1}] ${result.chunk.content}\nSource: ${result.chunk.source}\n`
    ).join("\n");
    
    return context;
  }
  
  /**
   * Get total chunks in knowledge base
   */
  private getTotalChunks(): number {
    let total = 0;
    for (const chunks of this.knowledgeBase.values()) {
      total += chunks.length;
    }
    return total;
  }
  
  /**
   * Update knowledge base with new information
   */
  async updateKnowledge(category: string, chunks: KnowledgeChunk[]): Promise<void> {
    if (!this.knowledgeBase.has(category)) {
      this.knowledgeBase.set(category, []);
    }
    
    const existing = this.knowledgeBase.get(category) || [];
    this.knowledgeBase.set(category, [...existing, ...chunks]);
    
    console.log(`✅ Updated ${category} knowledge: added ${chunks.length} chunks`);
  }
}

// Singleton instance
let ragInstance: RAGSystem | null = null;

export async function getRAGSystem(): Promise<RAGSystem> {
  if (!ragInstance) {
    ragInstance = new RAGSystem();
    await ragInstance.loadKnowledgeBase();
  }
  return ragInstance;
}

export { RAGSystem, type KnowledgeChunk, type RetrievalResult, type RAGConfig };