/**
 * src/core/game/enemy-stats.ts
 *
 * Tính toán Bảng Kháng Nguyên Tố 8 Hệ & Chỉ số Chiến đấu của Kẻ Địch theo chuẩn Genshin Impact.
 */

export interface EnemyResistances {
  pyro: number;
  hydro: number;
  cryo: number;
  electro: number;
  anemo: number;
  geo: number;
  dendro: number;
  physical: number;
}

export interface EnemyContext {
  id?: string;
  name: string;
  monsterType?: string | null;
  categoryType?: string | null;
  categoryText?: string | null;
  enemyType?: string | null;
  weaknesses?: string[];
  resistances?: string[];
  immunities?: string[];
}

export function calculateEnemyResistances(enemy: EnemyContext): EnemyResistances {
  const name = enemy.name.toLowerCase();
  const cat = (enemy.categoryText || enemy.categoryType || "").toLowerCase();

  // Kháng mặc định của đa số quái thường Teyvat: 10% mọi hệ
  const res: EnemyResistances = {
    pyro: 10,
    hydro: 10,
    cryo: 10,
    electro: 10,
    anemo: 10,
    geo: 10,
    dendro: 10,
    physical: 10,
  };

  // 1. Dòng máy móc / Tàn tích (Automatons - Ruin series)
  if (cat.includes("automaton") || name.includes("ruin") || name.includes("drake") || name.includes("perpetual") || name.includes("grader")) {
    res.physical = 70;
    return res;
  }

  // 2. Con người (Fatui, Eremites, Nobushi, Treasure Hoarders)
  if (cat.includes("fatui") || cat.includes("human") || cat.includes("eremite") || name.includes("nobushi") || name.includes("kairagi") || name.includes("treasure hoarder")) {
    res.physical = -20;
    if (name.includes("pyro")) res.pyro = 50;
    if (name.includes("hydro")) res.hydro = 50;
    if (name.includes("cryo")) res.cryo = 50;
    if (name.includes("electro")) res.electro = 50;
    if (name.includes("anemo")) res.anemo = 50;
    if (name.includes("geo")) res.geo = 50;
    if (name.includes("dendro")) res.dendro = 50;
    return res;
  }

  // 3. Slimes (Miễn nhiễm nguyên tố của mình)
  if (name.includes("slime")) {
    if (name.includes("pyro")) res.pyro = 100;
    if (name.includes("hydro")) res.hydro = 100;
    if (name.includes("cryo")) res.cryo = 100;
    if (name.includes("electro")) res.electro = 100;
    if (name.includes("anemo")) res.anemo = 100;
    if (name.includes("geo")) res.geo = 100;
    if (name.includes("dendro")) res.dendro = 100;
    return res;
  }

  // 4. Bóng Ma (Specters)
  if (name.includes("specter")) {
    res.pyro = res.hydro = res.cryo = res.electro = res.anemo = res.geo = res.dendro = res.physical = 20;
    if (name.includes("pyro")) res.pyro = 100;
    if (name.includes("hydro")) res.hydro = 100;
    if (name.includes("cryo")) res.cryo = 100;
    if (name.includes("electro")) res.electro = 100;
    if (name.includes("anemo")) res.anemo = 100;
    if (name.includes("geo")) res.geo = 100;
    if (name.includes("dendro")) res.dendro = 100;
    return res;
  }

  // 5. Hoa Lừa Dối (Whopperflowers)
  if (name.includes("whopperflower")) {
    res.pyro = res.hydro = res.cryo = res.electro = res.anemo = res.geo = res.dendro = res.physical = 35;
    if (name.includes("pyro")) res.pyro = 75;
    if (name.includes("cryo")) res.cryo = 75;
    if (name.includes("electro")) res.electro = 75;
    return res;
  }

  // 6. Cây Nổ / Cây Cấp Đông (Regisvines)
  if (name.includes("regisvine")) {
    if (name.includes("pyro")) res.pyro = 70;
    if (name.includes("cryo")) res.cryo = 70;
    if (name.includes("electro")) res.electro = 70;
    res.physical = 30;
    return res;
  }

  // 7. Nguyên Bản (Hypostases)
  if (name.includes("hypostasis")) {
    if (name.includes("anemo")) res.anemo = 100;
    if (name.includes("electro")) res.electro = 100;
    if (name.includes("geo")) res.geo = 100;
    if (name.includes("pyro")) res.pyro = 100;
    if (name.includes("cryo")) res.cryo = 100;
    if (name.includes("hydro")) res.hydro = 100;
    if (name.includes("dendro")) res.dendro = 100;
    return res;
  }

  // 8. Rồng Đất (Vishaps)
  if (name.includes("vishap")) {
    res.physical = 30;
    if (name.includes("geo")) res.geo = 50;
    if (name.includes("cryo")) res.cryo = 30;
    if (name.includes("electro")) res.electro = 30;
    if (name.includes("hydro")) res.hydro = 30;
    return res;
  }

  // 9. Hilichurls (Mitachurl, Lawachurl)
  if (name.includes("lawachurl")) {
    res.physical = 50;
    if (name.includes("frostarm") || name.includes("cryo")) res.cryo = 70;
    if (name.includes("stonehide") || name.includes("geo")) res.geo = 70;
    if (name.includes("thunderhelm") || name.includes("electro")) res.electro = 70;
    return res;
  }
  if (name.includes("mitachurl")) {
    res.physical = 30;
    return res;
  }

  return res;
}
