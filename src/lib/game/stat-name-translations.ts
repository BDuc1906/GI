
// src/lib/game/stat-name-translations.ts
/**
 * Dịch tên chỉ số phụ đột phá / chỉ số phụ vũ khí (ascensionStat,
 * subStatName) — các chuỗi này lấy THẲNG từ genshin-db (field
 * `substatText`, xem scripts/fix/fix-ascension-stat-data.ts), luôn ở
 * dạng tiếng Anh cố định (vd "Elemental Mastery", "CRIT DMG",
 * "Pyro DMG Bonus"), và trước đây được gán thẳng làm label hiển thị mà
 * KHÔNG qua bước dịch nào — khiến trang chi tiết nhân vật/vũ khí luôn lộ
 * chữ Anh thô ở phần "Chỉ số đột phá"/"Chỉ số phụ" bất kể đang chọn ngôn
 * ngữ nào (vd hiện "ELEMENTAL MASTERY" ngay cả khi đang xem bản zh-CN).
 *
 * Bộ khoá dưới đây liệt kê đủ 19 giá trị `substatText` khả dĩ mà
 * genshin-db trả về (10 chỉ số đột phá nhân vật + biến thể % cho vũ khí +
 * "Healing Bonus" hiếm gặp ở 1 số vũ khí). Nếu genshin-db thêm giá trị
 * mới không có trong bảng, hàm sẽ fallback về đúng chuỗi tiếng Anh gốc
 * (không vỡ UI, chỉ không dịch được giá trị mới đó).
 */
export const STAT_NAME_TRANSLATIONS: Record<string, Record<string, string>> = {
  "HP": { "en": "HP", "zh-CN": "生命值", "zh-TW": "生命值", "ja": "HP", "ko": "HP", "fr": "PV", "de": "LP", "id": "HP", "it": "HP", "pt": "PV", "es": "PS", "ru": "HP", "th": "HP", "tr": "Can" },
  "HP%": { "en": "HP%", "zh-CN": "生命值%", "zh-TW": "生命值%", "ja": "HP%", "ko": "HP%", "fr": "PV%", "de": "LP%", "id": "HP%", "it": "HP%", "pt": "PV%", "es": "PS%", "ru": "HP%", "th": "HP%", "tr": "Can%" },
  "ATK": { "en": "ATK", "zh-CN": "攻击力", "zh-TW": "攻擊力", "ja": "攻撃力", "ko": "공격력", "fr": "ATQ", "de": "ATK", "id": "ATK", "it": "ATK", "pt": "ATK", "es": "ATQ", "ru": "АТК", "th": "พลังโจมตี", "tr": "Saldırı" },
  "ATK%": { "en": "ATK%", "zh-CN": "攻击力%", "zh-TW": "攻擊力%", "ja": "攻撃力%", "ko": "공격력%", "fr": "ATQ%", "de": "ATK%", "id": "ATK%", "it": "ATK%", "pt": "ATK%", "es": "ATQ%", "ru": "АТК%", "th": "พลังโจมตี%", "tr": "Saldırı%" },
  "DEF": { "en": "DEF", "zh-CN": "防御力", "zh-TW": "防禦力", "ja": "防御力", "ko": "방어력", "fr": "DEF", "de": "VERT", "id": "DEF", "it": "DIF", "pt": "DEF", "es": "DEF", "ru": "ЗАЩ", "th": "พลังป้องกัน", "tr": "Savunma" },
  "DEF%": { "en": "DEF%", "zh-CN": "防御力%", "zh-TW": "防禦力%", "ja": "防御力%", "ko": "방어력%", "fr": "DEF%", "de": "VERT%", "id": "DEF%", "it": "DIF%", "pt": "DEF%", "es": "DEF%", "ru": "ЗАЩ%", "th": "พลังป้องกัน%", "tr": "Savunma%" },
  "Elemental Mastery": { "en": "Elemental Mastery", "zh-CN": "元素精通", "zh-TW": "元素精通", "ja": "元素熟知", "ko": "원소 숙련도", "fr": "Maîtrise Élémentaire", "de": "Elementarmeisterei", "id": "Elemental Mastery", "it": "Maestria Elementale", "pt": "Mestria Elemental", "es": "Maestría Elemental", "ru": "Мастерство стихий", "th": "ความเชี่ยวชาญธาตุ", "tr": "Element Ustalığı" },
  "Energy Recharge": { "en": "Energy Recharge", "zh-CN": "元素充能效率", "zh-TW": "元素充能效率", "ja": "元素チャージ効率", "ko": "원소 충전 효율", "fr": "Récupération d'Énergie", "de": "Energieaufladerate", "id": "Energy Recharge", "it": "Ricarica Energia", "pt": "Recarga de Energia", "es": "Recarga de Energía", "ru": "Восст. энергии", "th": "การฟื้นฟูพลังงาน", "tr": "Enerji Şarjı" },
  "CRIT Rate": { "en": "CRIT Rate", "zh-CN": "暴击率", "zh-TW": "暴擊率", "ja": "会心率", "ko": "치명타 확률", "fr": "Taux CRIT", "de": "KT-Rate", "id": "Rasio CRIT", "it": "Percentuale CRIT", "pt": "Taxa CRIT", "es": "Prob. CRIT", "ru": "Шанс крит. попадания", "th": "อัตราคริ", "tr": "Kritik Şansı" },
  "CRIT DMG": { "en": "CRIT DMG", "zh-CN": "暴击伤害", "zh-TW": "暴擊傷害", "ja": "会心ダメージ", "ko": "치명타 피해", "fr": "DGT CRIT", "de": "KT-Schaden", "id": "DMG CRIT", "it": "Danno CRIT", "pt": "Dano CRIT", "es": "Daño CRIT", "ru": "Крит. урон", "th": "ความเสียหายคริ", "tr": "Kritik Hasar" },
  "Physical DMG Bonus": { "en": "Physical DMG Bonus", "zh-CN": "物理伤害加成", "zh-TW": "物理傷害加成", "ja": "物理ダメージ", "ko": "물리 피해 보너스", "fr": "Bonus DGT Physiques", "de": "Phys. Schadensbonus", "id": "Bonus DMG Fisik", "it": "Bonus Danno Fisico", "pt": "Bônus de Dano Físico", "es": "Bono de Daño Físico", "ru": "Бонус физ. урона", "th": "โบนัสความเสียหายกายภาพ", "tr": "Fiziksel Hasar Bonusu" },
  "Pyro DMG Bonus": { "en": "Pyro DMG Bonus", "zh-CN": "火元素伤害加成", "zh-TW": "火元素傷害加成", "ja": "炎元素ダメージ", "ko": "불 원소 피해 보너스", "fr": "Bonus DGT Pyro", "de": "Pyro-Schadensbonus", "id": "Bonus DMG Pyro", "it": "Bonus Danno Pyro", "pt": "Bônus de Dano Pyro", "es": "Bono de Daño Pyro", "ru": "Бонус урона Пиро", "th": "โบนัสความเสียหายไฟ", "tr": "Pyro Hasar Bonusu" },
  "Hydro DMG Bonus": { "en": "Hydro DMG Bonus", "zh-CN": "水元素伤害加成", "zh-TW": "水元素傷害加成", "ja": "水元素ダメージ", "ko": "물 원소 피해 보너스", "fr": "Bonus DGT Hydro", "de": "Hydro-Schadensbonus", "id": "Bonus DMG Hydro", "it": "Bonus Danno Idro", "pt": "Bônus de Dano Hydro", "es": "Bono de Daño Hydro", "ru": "Бонус урона Гидро", "th": "โบนัสความเสียหายน้ำ", "tr": "Hydro Hasar Bonusu" },
  "Electro DMG Bonus": { "en": "Electro DMG Bonus", "zh-CN": "雷元素伤害加成", "zh-TW": "雷元素傷害加成", "ja": "雷元素ダメージ", "ko": "번개 원소 피해 보너스", "fr": "Bonus DGT Électro", "de": "Elektro-Schadensbonus", "id": "Bonus DMG Electro", "it": "Bonus Danno Elettro", "pt": "Bônus de Dano Electro", "es": "Bono de Daño Electro", "ru": "Бонус урона Электро", "th": "โบนัสความเสียหายไฟฟ้า", "tr": "Electro Hasar Bonusu" },
  "Cryo DMG Bonus": { "en": "Cryo DMG Bonus", "zh-CN": "冰元素伤害加成", "zh-TW": "冰元素傷害加成", "ja": "氷元素ダメージ", "ko": "얼음 원소 피해 보너스", "fr": "Bonus DGT Cryo", "de": "Kryo-Schadensbonus", "id": "Bonus DMG Cryo", "it": "Bonus Danno Crio", "pt": "Bônus de Dano Cryo", "es": "Bono de Daño Cryo", "ru": "Бонус урона Крио", "th": "โบนัสความเสียหายน้ำแข็ง", "tr": "Cryo Hasar Bonusu" },
  "Anemo DMG Bonus": { "en": "Anemo DMG Bonus", "zh-CN": "风元素伤害加成", "zh-TW": "風元素傷害加成", "ja": "風元素ダメージ", "ko": "바람 원소 피해 보너스", "fr": "Bonus DGT Anémo", "de": "Anemo-Schadensbonus", "id": "Bonus DMG Anemo", "it": "Bonus Danno Anemo", "pt": "Bônus de Dano Anemo", "es": "Bono de Daño Anemo", "ru": "Бонус урона Анемо", "th": "โบนัสความเสียหายลม", "tr": "Anemo Hasar Bonusu" },
  "Geo DMG Bonus": { "en": "Geo DMG Bonus", "zh-CN": "岩元素伤害加成", "zh-TW": "巖元素傷害加成", "ja": "岩元素ダメージ", "ko": "바위 원소 피해 보너스", "fr": "Bonus DGT Géo", "de": "Geo-Schadensbonus", "id": "Bonus DMG Geo", "it": "Bonus Danno Geo", "pt": "Bônus de Dano Geo", "es": "Bono de Daño Geo", "ru": "Бонус урона Гео", "th": "โบนัสความเสียหายหิน", "tr": "Geo Hasar Bonusu" },
  "Dendro DMG Bonus": { "en": "Dendro DMG Bonus", "zh-CN": "草元素伤害加成", "zh-TW": "草元素傷害加成", "ja": "草元素ダメージ", "ko": "풀 원소 피해 보너스", "fr": "Bonus DGT Dendro", "de": "Dendro-Schadensbonus", "id": "Bonus DMG Dendro", "it": "Bonus Danno Dendro", "pt": "Bônus de Dano Dendro", "es": "Bono de Daño Dendro", "ru": "Бонус урона Дендро", "th": "โบนัสความเสียหายพืช", "tr": "Dendro Hasar Bonusu" },
  "Healing Bonus": { "en": "Healing Bonus", "zh-CN": "治疗加成", "zh-TW": "治療加成", "ja": "治療効果", "ko": "치유 보너스", "fr": "Bonus de Soins", "de": "Heilungsbonus", "id": "Bonus Penyembuhan", "it": "Bonus Cura", "pt": "Bônus de Cura", "es": "Bono de Curación", "ru": "Бонус исцеления", "th": "โบนัสการรักษา", "tr": "İyileştirme Bonusu" },
};

export function translateStatName(rawName: string, locale: string): string {
  const entry = STAT_NAME_TRANSLATIONS[rawName];
  if (!entry) return rawName;
  return entry[locale] ?? entry.en ?? rawName;
}
