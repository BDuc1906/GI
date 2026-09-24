/**
 * scripts/seed/seed-enhanced-enemies.ts
 *
 * Seed dữ liệu Enemy với thông tin chi tiết: stats, weaknesses, resistances
 * Sử dụng dữ liệu từ genshin-db và bổ sung thông tin từ game knowledge
 */

import { createRequire } from "module";
import { prisma } from "../../src/lib/db/prisma";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

interface EnhancedEnemyData {
  id: string;
  name: string;
  monsterId?: number;
  monsterType?: string;
  enemyType?: string;
  categoryType?: string;
  categoryText?: string;
  level?: number;
  hp?: number;
  atk?: number;
  def?: number;
  weaknesses?: string[];
  resistances?: string[];
  immunities?: string[];
  dropRates?: Record<string, number>;
  behavior?: string;
  spawnRegions?: string[];
  isBoss?: boolean;
  weeklyBoss?: boolean;
  domains?: string[];
  difficulty?: string;
  raw: any;
}

// Game knowledge mapping cho enemy weaknesses và resistances
const ENEMY_WEAKNESSES: Record<string, string[]> = {
  // Hilichurls - yếu Dendro, Pyro
  "hilichurl": ["Dendro", "Pyro"],
  "pyro hilichurl": ["Hydro", "Cryo"],
  "cryo hilichurl": ["Pyro", "Electro"],
  "electro hilichurl": ["Pyro", "Cryo"],
  "dendro hilichurl": ["Pyro", "Electro"],
  
  // Slimes - yếu đối với nguyên tố tương ứng
  "pyro slime": ["Hydro", "Cryo"],
  "hydro slime": ["Pyro", "Electro"],
  "cryo slime": ["Pyro", "Electro"],
  "electro slime": ["Pyro", "Cryo"],
  "anemo slime": ["Pyro", "Cryo", "Electro", "Hydro", "Geo", "Dendro"],
  "geo slime": ["Pyro", "Cryo", "Electro", "Hydro", "Anemo", "Dendro"],
  "dendro slime": ["Pyro", "Electro"],
  
  // Mitachurls - yếu Pyro
  "mitachurl": ["Pyro"],
  
  // Ruin Guards - yếu đối với nguyên tố tương ứng, không yếu Physical
  "ruin guard": ["Electro", "Pyro", "Cryo", "Hydro"],
  "ruin grader": ["Electro", "Pyro", "Cryo", "Hydro"],
  "ruin hunter": ["Electro", "Pyro", "Cryo", "Hydro"],
  "ruin cruiser": ["Electro", "Pyro", "Cryo", "Hydro"],
  "ruin destroyer": ["Electro", "Pyro", "Cryo", "Hydro"],
  "ruin scout": ["Electro", "Pyro", "Cryo", "Hydro"],
  
  // Nobushi - yếu Pyro, Electro
  "nobushi": ["Pyro", "Electro"],
  
  // Abyss Lectors - yếu tương ứng theo loại
  "abyss lector": ["Pyro", "Electro", "Cryo", "Hydro"],
  
  // Automatons - yếu Electro, Pyro
  "automaton": ["Electro", "Pyro"],
  
  // Fatui enemies - yếu tương ứng theo loại
  "fatui": ["Crowd Control"],
  "fatui pyro agent": ["Cryo", "Hydro"],
  "fatui cryo agent": ["Pyro", "Electro"],
  "fatui electro agent": ["Pyro", "Cryo"],
  
  // Teyvat enemies - yếu Pyro, Dendro
  "teyvat": ["Pyro", "Dendro"],
};

const ENEMY_RESISTANCES: Record<string, string[]> = {
  // Slimes - miễn nhiễm nguyên tố của chính
  "pyro slime": ["Pyro"],
  "hydro slime": ["Hydro"],
  "cryo slime": ["Cryo"],
  "electro slime": ["Electro"],
  "anemo slime": ["Anemo"],
  "geo slime": ["Geo"],
  "dendro slime": ["Dendro"],
  
  // Hypostases - miễn nhiễm nguyên tố của chính, yếu với phản ứng
  "hypostasis": ["Elemental Reactions"],
  
  // Regisvine - miễn Cryo, Electro, Physical khi trong shell
  "regisvine": ["Cryo", "Electro", "Physical"],
  
  // Shield enemies - Physical resistance cao
  "shield": ["Physical"],
};

const BOSS_DIFFICULTY: Record<string, string> = {
  "childe": "hard",
  "la signora": "very hard",
  "azhdaha": "very hard",
  "raiden shogun": "very hard",
  "scaramouche": "very hard",
  "wolf of the depths": "hard",
  "golden wolf king": "hard",
  "andrius": "hard",
  "cryo regisvine": "very hard",
  "pyro hypostasis": "very hard",
  "hydro hypostasis": "very hard",
  "electro hypostasis": "very hard",
  "geo hypostasis": "very hard",
  "dendro hypostasis": "very hard",
};

const DOMAIN_ENEMIES: Record<string, string[]> = {
  "domain of forgiveness": ["Fatui Skirmisher", "Fatui Pyro Agent", "Fatui Cryo Agent"],
  "ridge watch": ["Abyss Lector", "Abyss Herald"],
  "spiral abyss": ["All boss types"],
};

/**
 * Extract weakness information từ tên enemy
 */
function extractWeaknesses(name: string, category: string): string[] {
  const nameLower = name.toLowerCase();
  
  // Check predefined weaknesses
  for (const [key, weaknesses] of Object.entries(ENEMY_WEAKNESSES)) {
    if (nameLower.includes(key)) {
      return [...weaknesses];
    }
  }
  
  // Category-based weaknesses
  if (category === "Abyss") {
    return ["Crowd Control", "CC"];
  }
  
  return [];
}

/**
 * Extract resistance information từ tên enemy
 */
function extractResistances(name: string, _category: string): string[] {
  const nameLower = name.toLowerCase();
  
  // Check predefined resistances
  for (const [key, resistances] of Object.entries(ENEMY_RESISTANCES)) {
    if (nameLower.includes(key)) {
      return [...resistances];
    }
  }
  
  return [];
}

/**
 * Extract immunities từ tên enemy
 */
function extractImmunities(name: string): string[] {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes("hypostasis")) {
    // Hypostases immune to their own element
    if (nameLower.includes("pyro")) return ["Pyro"];
    if (nameLower.includes("hydro")) return ["Hydro"];
    if (nameLower.includes("cryo")) return ["Cryo"];
    if (nameLower.includes("electro")) return ["Electro"];
    if (nameLower.includes("geo")) return ["Geo"];
    if (nameLower.includes("dendro")) return ["Dendro"];
  }
  
  return [];
}

/**
 * Determine if enemy is a boss
 */
function isBossEnemy(name: string, _category: string): boolean {
  const nameLower = name.toLowerCase();
  
  // Weekly bosses
  const weeklyBosses = [
    "childe", "la signora", "azhdaha", "raiden shogun", 
    "scaramouche", "wolf of the depths", "golden wolf king", "andrius",
    "cryo regisvine", "pyro hypostasis", "hydro hypostasis", 
    "electro hypostasis", "geo hypostasis", "dendro hypostasis"
  ];
  
  if (weeklyBosses.some(boss => nameLower.includes(boss))) {
    return true;
  }
  
  // Hypostases
  if (nameLower.includes("hypostasis")) {
    return true;
  }
  
  // Regisvine
  if (nameLower.includes("regisvine")) {
    return true  ;
  }
  
  return false;
}

/**
 * Determine enemy difficulty
 */
function determineDifficulty(name: string, level: number, isBoss: boolean): string {
  if (isBoss) {
    return BOSS_DIFFICULTY[name] || "hard";
  }
  
  if (level >= 90) {
    return "hard";
  } else if (level >= 70) {
    return "medium";
  } else {
    return "easy";
  }
}

/**
 * Generate enhanced enemy data từ genshin-db
 */
function generateEnhancedEnemyData(): EnhancedEnemyData[] {
  const enemies: EnhancedEnemyData[] = [];
  
  try {
    const enemyNames = genshindb.enemies("names", { matchCategories: true }) as string[];
    
    for (const name of enemyNames) {
      const raw = genshindb.enemies(name) as any;
      
      if (!raw || !raw.name) continue;
      
      const id = name.toLowerCase().replace(/\s+/g, "-");
      const category = raw.categoryType || "Unknown";
      
      const weaknesses = extractWeaknesses(raw.name, category);
      const resistances = extractResistances(raw.name, category);
      const immunities = extractImmunities(raw.name);
      const boss = isBossEnemy(raw.name, category);
      const difficulty = determineDifficulty(raw.name, raw.level || 0, boss);
      
      // Spawn regions based on enemy type
      const spawnRegions = extractSpawnRegions(raw.enemyType, raw.categoryType);
      
      // Domains where enemy appears
      const domains = extractDomains(raw.name);
      
      // Behavior based on enemy type
      const behavior = extractBehavior(raw.enemyType);
      
      enemies.push({
        id,
        name: raw.name,
        monsterId: raw.id,
        monsterType: raw.monsterType,
        enemyType: raw.enemyType,
        categoryType: raw.categoryType,
        categoryText: raw.categoryText,
        level: raw.level,
        hp: raw.hp,
        atk: raw.atk,
        def: raw.def,
        weaknesses,
        resistances,
        immunities,
        dropRates: raw.rewardPreview ? extractDropRates(raw.rewardPreview) : undefined,
        behavior,
        spawnRegions,
        isBoss: boss,
        weeklyBoss: boss && name.toLowerCase().includes("weekly"),
        domains,
        difficulty,
        raw
      });
    }
  } catch (err) {
    console.error("Error generating enhanced enemy data:", err);
  }
  
  return enemies;
}

/**
 * Extract spawn regions from enemy type
 */
function extractSpawnRegions(enemyType: string | undefined, categoryType: string | undefined): string[] {
  const regions: string[] = [];
  
  if (enemyType?.includes("Hilichurl")) {
    regions.push("Mondstadt", "Liyue", "Inazuma", "Sumeru", "Fontaine", "Natlan");
  } else if (enemyType?.includes("Slime")) {
    regions.push("All regions");
  } else if (categoryType?.includes("Abyss")) {
    regions.push("Spiral Abyss");
  } else if (enemyType?.includes("Fatui")) {
    regions.push("Mondstadt", "Liyue", "Inazuma", "Sumeru", "Fontaine");
  } else if (enemyType?.includes("Automaton")) {
    regions.push("Fontaine");
  }
  
  return regions;
}

/**
 * Extract domains where enemy appears
 */
function extractDomains(name: string): string[] {
  const nameLower = name.toLowerCase();
  const domains: string[] = [];
  
  for (const [domain, enemies] of Object.entries(DOMAIN_ENEMIES)) {
    if (enemies.some(enemy => nameLower.includes(enemy))) {
      domains.push(domain);
    }
  }
  
  return domains;
}

/**
 * Extract drop rates from reward preview
 */
function extractDropRates(rewardPreview: any[]): Record<string, number> {
  const dropRates: Record<string, number> = {};
  
  if (!rewardPreview) return dropRates;
  
  for (const reward of rewardPreview) {
    if (reward.name && !["Adventure EXP", "Mora", "Companionship EXP"].includes(reward.name)) {
      // Drop rate is simplified - in production would use actual game data
      dropRates[reward.name] = 0.1; // 10% base drop rate
    }
  }
  
  return dropRates;
}

/**
 * Extract behavior from enemy type
 */
function extractBehavior(enemyType: string | undefined): string | undefined {
  if (!enemyType) return undefined;
  
  if (enemyType.includes("Hilichurl")) {
    return "aggressive";
  } else if (enemyType.includes("Slime")) {
    return "passive";
  } else if (enemyType.includes("Abyss")) {
    return "aggressive";
  } else if (enemyType.includes("Fatui")) {
    return "aggressive";
  } else if (enemyType.includes("Mitachurl")) {
    return "aggressive";
  } else if (enemyType.includes("Automaton")) {
    return "stationary";
  }
  
  return "passive";
}

/**
 * Seed enhanced enemy data
 */
export async function seedEnhancedEnemies(): Promise<void> {
  console.log("🔄 Seeding enhanced enemy data...");
  
  const enhancedEnemies = generateEnhancedEnemyData();
  
  console.log(`Found ${enhancedEnemies.length} enemies to enhance`);
  
  let updatedCount = 0;
  for (const enemy of enhancedEnemies) {
    try {
      await prisma.enemy.upsert({
        where: { id: enemy.id },
        create: {
          id: enemy.id,
          name: enemy.name,
          monsterId: enemy.monsterId,
          monsterType: enemy.monsterType,
          enemyType: enemy.enemyType,
          categoryType: enemy.categoryType,
          categoryText: enemy.categoryText,
          level: enemy.level,
          hp: enemy.hp,
          atk: enemy.atk,
          def: enemy.def,
          weaknesses: enemy.weaknesses,
          resistances: enemy.resistances,
          immunities: enemy.immunities,
          dropRates: enemy.dropRates,
          behavior: enemy.behavior,
          spawnRegions: enemy.spawnRegions,
          isBoss: enemy.isBoss,
          weeklyBoss: enemy.weeklyBoss,
          domains: enemy.domains,
          difficulty: enemy.difficulty,
          raw: enemy.raw
        },
        update: {
          level: enemy.level,
          hp: enemy.hp,
          atk: enemy.atk,
          def: enemy.def,
          weaknesses: enemy.weaknesses,
          resistances: enemy.resistances,
          immunities: enemy.immunities,
          dropRates: enemy.dropRates,
          behavior: enemy.behavior,
          spawnRegions: enemy.spawnRegions,
          isBoss: enemy.isBoss,
          weeklyBoss: enemy.weeklyBoss,
          domains: enemy.domains,
          difficulty: enemy.difficulty
        }
      });
      
      updatedCount++;
    } catch (err) {
      console.warn(`⚠️ Failed to upsert enemy ${enemy.id}:`, err);
    }
  }
  
  console.log(`✅ Enhanced ${updatedCount}/${enhancedEnemies.length} enemies with detailed stats`);
  
  // Print summary
  const bossCount = enhancedEnemies.filter(e => e.isBoss).length;
  const weeklyBossCount = enhancedEnemies.filter(e => e.weeklyBoss).length;
  const totalWeaknesses = enhancedEnemies.reduce((sum, e) => sum + (e.weaknesses?.length || 0), 0);
  
  console.log(`\n📊 Enemy Database Summary:`);
  console.log(`  Total enemies: ${enhancedEnemies.length}`);
  console.log(`  Boss enemies: ${bossCount}`);
  console.log(`  Weekly bosses: ${weeklyBossCount}`);
  console.log(`  Total weaknesses defined: ${totalWeaknesses}`);
  console.log(`  Enemies with difficulty ratings: ${enhancedEnemies.filter(e => e.difficulty).length}`);
}