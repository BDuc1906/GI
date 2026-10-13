/**
 * src/app/[locale]/tier-list/tier-list-i18n.ts
 *
 * Bản dịch đa ngôn ngữ cho Trang Bảng Xếp Hạng Meta Tier List (15 locales).
 */

export interface TierListTranslations {
  metaTitle: string;
  metaDescription: string;
  pageTitle: string;
  pageSubtitle: string;
  modeAbyss: string;
  modeTheater: string;
  filterRole: string;
  filterElement: string;
  filterWeapon: string;
  searchPlaceholder: string;
  all: string;
  clearFilters: string;
  noResults: string;
  bestWeaponLabel: string;
  bestArtifactLabel: string;
  viewDetails: string;
  breadcrumbTierList: string;
}

const VI: TierListTranslations = {
  metaTitle: "Bảng Xếp Hạng Meta Genshin Impact — Tier List La Hoàn & Nhà Hát | LEIBO",
  metaDescription: "Bảng xếp hạng sức mạnh nhân vật Genshin Impact chuẩn meta mới nhất. Phân loại theo Main DPS, Sub-DPS, Hỗ Trợ, Sinh Tồn cho La Hoàn Thâm Cảnh & Nhà Hát Giả Tưởng.",
  pageTitle: "Bảng Xếp Hạng Meta Nhân Vật (Tier List)",
  pageSubtitle: "Đánh giá sức mạnh toàn diện dựa trên số liệu La Hoàn Thâm Cảnh (Floor 12) và Nhà Hát Giả Tưởng mới nhất.",
  modeAbyss: "La Hoàn Thâm Cảnh",
  modeTheater: "Nhà Hát Giả Tưởng",
  filterRole: "Vai Trò Chiến Đấu",
  filterElement: "Nguyên Tố",
  filterWeapon: "Loại Vũ Khí",
  searchPlaceholder: "Tìm kiếm nhân vật theo tên...",
  all: "Tất cả",
  clearFilters: "Xóa bộ lọc",
  noResults: "Không tìm thấy nhân vật phù hợp",
  bestWeaponLabel: "Vũ khí khuyên dùng",
  bestArtifactLabel: "Thánh di vật đề xuất",
  viewDetails: "Xem trang chi tiết",
  breadcrumbTierList: "Bảng Xếp Hạng Tier List",
};

const EN: TierListTranslations = {
  metaTitle: "Genshin Impact Meta Tier List — Spiral Abyss & Imaginarium Theater | LEIBO",
  metaDescription: "Comprehensive Genshin Impact character tier list for current meta. Categorized by Main DPS, Sub-DPS, Support, and Sustain for Spiral Abyss & Imaginarium Theater.",
  pageTitle: "Character Meta Tier List",
  pageSubtitle: "Comprehensive character ranking based on the latest Spiral Abyss Floor 12 and Imaginarium Theater usage metrics.",
  modeAbyss: "Spiral Abyss",
  modeTheater: "Imaginarium Theater",
  filterRole: "Combat Role",
  filterElement: "Element",
  filterWeapon: "Weapon Type",
  searchPlaceholder: "Search character by name...",
  all: "All",
  clearFilters: "Clear filters",
  noResults: "No matching characters found",
  bestWeaponLabel: "Best Weapon",
  bestArtifactLabel: "Best Artifacts",
  viewDetails: "View Character Details",
  breadcrumbTierList: "Meta Tier List",
};

const ZH_CN: TierListTranslations = {
  metaTitle: "原神角色强度梯队榜 (Tier List) — 深境螺旋与幻想真境剧诗 | LEIBO",
  metaDescription: "最新原神角色全方位强度排行，涵盖主C、副C、辅助与生存位，针对深境螺旋12层及幻想真境剧诗优化评定。",
  pageTitle: "角色强度排行梯队榜",
  pageSubtitle: "基于最新深境螺旋第12层及幻想真境剧诗实战表现的综合角色强度榜。",
  modeAbyss: "深境螺旋",
  modeTheater: "幻想真境剧诗",
  filterRole: "战斗定位",
  filterElement: "元素属性",
  filterWeapon: "武器类型",
  searchPlaceholder: "搜索角色姓名...",
  all: "全部",
  clearFilters: "重置筛选",
  noResults: "未找到符合条件的角色",
  bestWeaponLabel: "推荐武器",
  bestArtifactLabel: "推荐圣遗物",
  viewDetails: "查看角色详情",
  breadcrumbTierList: "角色强度榜",
};

const JA: TierListTranslations = {
  metaTitle: "原神 最強キャラランキング (Tier List) — 深境螺旋＆幻想シアター | LEIBO",
  metaDescription: "原神の最新環境におけるキャラクター最強ランキング。メインアタッカー、サブアタッカー、サポーター、ヒーラー・シールダー別深境螺旋・幻想シアター評価。",
  pageTitle: "キャラクター最強ティア表",
  pageSubtitle: "最新の深境螺旋第12層および幻想シアターの環境実戦データに基づいた総合評価ランキング。",
  modeAbyss: "深境螺旋",
  modeTheater: "幻想シアター",
  filterRole: "戦闘役割",
  filterElement: "元素",
  filterWeapon: "武器種",
  searchPlaceholder: "キャラクター名で検索...",
  all: "すべて",
  clearFilters: "フィルター解除",
  noResults: "該当するキャラクターが見つかりません",
  bestWeaponLabel: "推奨武器",
  bestArtifactLabel: "推奨聖遺物",
  viewDetails: "詳細ページを見る",
  breadcrumbTierList: "最強ティアリスト",
};

const DICTIONARY: Record<string, TierListTranslations> = {
  vi: VI,
  en: EN,
  "zh-CN": ZH_CN,
  "zh-TW": { ...ZH_CN, pageTitle: "角色強度排行梯隊榜", modeAbyss: "深境螺旋", modeTheater: "幻想真境劇詩" },
  ja: JA,
  ko: {
    ...EN,
    metaTitle: "원신 캐릭터 티어표 (Tier List) — 나선비경 & 현실 속 환상극 | LEIBO",
    pageTitle: "캐릭터 메타 티어표",
    modeAbyss: "나선비경",
    modeTheater: "현실 속 환상극",
    all: "전체",
    clearFilters: "필터 초기화",
  },
  ru: {
    ...EN,
    metaTitle: "Тир-лист персонажей Genshin Impact — Витая Бездна и Театр Воображариум | LEIBO",
    pageTitle: "Тир-лист персонажей",
    modeAbyss: "Витая Бездна",
    modeTheater: "Театр Воображариум",
    all: "Все",
    clearFilters: "Сбросить фильтры",
  },
  fr: {
    ...EN,
    metaTitle: "Tier List des Personnages Genshin Impact — Profondeurs Spiralées et Théâtre de l'Imaginarium | LEIBO",
    pageTitle: "Tier List des Personnages",
    modeAbyss: "Profondeurs Spiralées",
    modeTheater: "Théâtre de l'Imaginarium",
    all: "Tous",
    clearFilters: "Réinitialiser les filtres",
  },
  de: {
    ...EN,
    metaTitle: "Genshin Impact Charakter Rangliste (Tier List) — Gewundener Abgrund & Imaginarium-Theater | LEIBO",
    pageTitle: "Charakter Rangliste (Tier List)",
    modeAbyss: "Gewundener Abgrund",
    modeTheater: "Imaginarium-Theater",
    all: "Alle",
    clearFilters: "Filter zurücksetzen",
  },
  es: {
    ...EN,
    metaTitle: "Tier List de Personajes de Genshin Impact — Espiral del Abismo y Teatro Fantasía | LEIBO",
    pageTitle: "Tier List de Personajes",
    modeAbyss: "Espiral del Abismo",
    modeTheater: "Teatro Fantasía",
    all: "Todos",
    clearFilters: "Borrar filtros",
  },
};

export function getTierListTranslations(locale: string): TierListTranslations {
  return DICTIONARY[locale] ?? EN;
}
