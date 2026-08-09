/**
 * scripts/lib/genshin-pure-helpers.ts
 *
 * Logic THUẦN (pure) để biến đổi dữ liệu thô từ package `genshin-db` thành
 * hình dạng gần với DB — KHÔNG import Prisma, KHÔNG gọi DB ở đâu trong file
 * này. Đây là điểm khác biệt quan trọng với `scripts/lib/seed-helpers.ts`
 * (file đó có `upsertMaterial` ghi thẳng vào bảng Material).
 *
 * Vì sao tách riêng: `src/lib/data-sources/adapters/genshindb-adapter.ts`
 * (fetch dữ liệu cho pipeline crawl) PHẢI là hàm thuần theo đúng hợp đồng
 * kiểu `CharacterData` (xem src/lib/data-sources/types.ts) — không được phụ
 * thuộc Prisma. Dùng chung file này giữa adapter (fetch) và seed-helpers.ts
 * (persist) để không viết trùng logic 2 lần ở 2 nơi rồi lệch nhau dần theo
 * thời gian.
 *
 * Import bằng đường dẫn TƯƠNG ĐỐI ở mọi nơi dùng file này (kể cả từ
 * src/lib/data-sources/adapters/), KHÔNG dùng alias "@/" — lý do: các script
 * seed chạy qua `tsx` với `paths` trong tsconfig.json chỉ định nghĩa
 * "@/*": ["./src/*"], không có mapping cho "scripts/*", nên "@/scripts/..."
 * không bao giờ resolve được (đây chính là bug khiến bản adapter cũ không
 * build được). Import tương đối luôn resolve đúng bất kể chạy qua tsx hay
 * qua Next.js build, nên an toàn hơn.
 */

import type {
  MaterialRef,
  AscensionMaterialPhase,
  TalentMaterialLevel,
  StatsByLevelRow,
  TalentAttributeRow,
  TalentEntry,
  ConstellationEntry,
} from "../../src/lib/data-sources/types";

export type {
  MaterialRef,
  AscensionMaterialPhase,
  TalentMaterialLevel,
  StatsByLevelRow,
  TalentAttributeRow,
  TalentEntry,
  ConstellationEntry,
};

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getEnkaUrl(filename?: string | null, mihoyoUrl?: string | null): string | null {
  if (filename) return `https://enka.network/ui/${filename}.png`;
  if (mihoyoUrl) return mihoyoUrl;
  return null;
}

/**
 * BUG ĐÃ SỬA: icon kỹ năng (combat1/2/3, passiveN) và icon cung mệnh
 * (c1..c6) TỪNG được build bằng getEnkaUrl() y hệt icon nhân vật — nhưng
 * enka.network CHỈ mirror ảnh THẬT SỰ hiển thị trên chính trang showcase
 * của nó (avatar/vũ khí/thánh di vật), KHÔNG phải toàn bộ asset UI_* của
 * game (xem comment gốc ở ALT_ASSET_CDNS trong
 * scripts/mirror-images-to-r2.ts — cùng kết luận, đã xác nhận lại qua
 * tài liệu enka.network chính thức: "enka.network only hosts images that
 * are actually used on the site"). Tên file icon kỹ năng/cung mệnh
 * (vd "Skill_A_01", "UI_Talent_S_Kazuha_01") KHÔNG nằm trong tập đó nên
 * 403/404 gần như luôn luôn -> icon vỡ hoặc hiển thị icon mặc định sai.
 * gi.yatta.moe (Project Amber) dump TOÀN BỘ asset UI_* của game (đã dùng
 * làm CDN dự phòng #1 cho ảnh nguyên liệu/nhân vật lỗi ở mirror script) —
 * dùng thẳng làm nguồn CHÍNH cho icon kỹ năng/cung mệnh thay vì enka.
 */
export function getUiAssetUrl(filename?: string | null): string | null {
  if (!filename) return null;
  return `https://gi.yatta.moe/assets/UI/${filename}.png`;
}

// Xuất ra ngoài (thay vì khai báo cục bộ trong hàm) để dùng lại được ở nơi
// khác cần chiều NGƯỢC LẠI (URL -> tên nguyên tố) — xem
// scripts/fix-vision-mismatch.ts, script sửa lỗi 1 nhân vật hiển thị đúng
// icon nguyên tố (elementIcon) nhưng text vision lại là "Unknown" do bị
// ghi đè nhầm ở 1 lần seed cũ (xem comment trong scripts/seed-characters.ts).
export const ELEMENT_ICON_MAP: Record<string, string> = {
  Anemo: "https://static.wikia.nocookie.net/gensin-impact/images/1/10/Element_Anemo.svg",
  Geo: "https://static.wikia.nocookie.net/gensin-impact/images/9/9b/Element_Geo.svg",
  Electro: "https://static.wikia.nocookie.net/gensin-impact/images/f/ff/Element_Electro.svg",
  Dendro: "https://static.wikia.nocookie.net/gensin-impact/images/7/73/Element_Dendro.svg",
  Hydro: "https://static.wikia.nocookie.net/gensin-impact/images/8/80/Element_Hydro.svg",
  Pyro: "https://static.wikia.nocookie.net/gensin-impact/images/2/2c/Element_Pyro.svg",
  Cryo: "https://static.wikia.nocookie.net/gensin-impact/images/7/72/Element_Cryo.svg",
};

export function getElementIconUrl(element?: string | null): string | null {
  if (!element) return null;
  return ELEMENT_ICON_MAP[element.trim()] ?? null;
}

/**
 * Object ảnh thô từ genshin-db — thư viện cộng đồng không xuất type chính
 * thức cho field này, và tên field không đồng nhất giữa các loại data
 * (nhân vật/vũ khí/vật liệu đều gọi khác nhau chút) nên không khai 1
 * interface chặt cho tất cả được.
 */
export type GenshinDbImages = Record<string, string | undefined>;

export function getBestImageUrl(
  images: GenshinDbImages | null | undefined,
  type: "icon" | "splash" | "side" | "element"
): string | null {
  if (!images || typeof images !== "object") return null;

  const candidates: Array<string | undefined> = [];

  if (type === "icon") {
    candidates.push(
      images.filename_icon,
      images.mihoyo_icon,
      images.icon,
      images.filename,
      images.filename_full,
      images.mihoyo_icon_url
    );
  } else if (type === "splash") {
    candidates.push(
      images.filename_gachaSplash,
      images.mihoyo_gachaSplash,
      images.splash,
      images.filename_splash,
      images.filename_gacha,
      images.gachaSplash
    );
    if (!candidates.some((c) => c)) {
      candidates.push(images.filename_icon, images.mihoyo_icon, images.icon);
    }
  } else if (type === "side") {
    candidates.push(
      images.filename_sideIcon,
      images.mihoyo_sideIcon,
      images.sideIcon,
      images.filename_side
    );
  } else if (type === "element") {
    candidates.push(images.elementIcon, images.element, images.filename_elementIcon);
  }

  for (const c of candidates) {
    if (c && c.trim()) {
      if (c.startsWith("http://") || c.startsWith("https://")) return c;
      return `https://enka.network/ui/${c}.png`;
    }
  }

  return null;
}

export function getMaterialIconFilename(material: unknown): string | null {
  const m = material as { images?: GenshinDbImages } | null | undefined;
  if (!m?.images) return null;
  return m.images.filename_icon ?? m.images.filename_full ?? m.images.filename ?? null;
}

// ---------- SÁCH KỸ NĂNG / CHI PHÍ NÂNG CẤP CUNG MỆNH ----------

export const TALENT_LEVEL_COSTS: Record<
  number,
  {
    bookTier: "teachings" | "guide" | "philosophies";
    bookCount: number;
    bossCount?: number;
    crown?: boolean;
    mora: number;
  }
> = {
  2: { bookTier: "teachings", bookCount: 3, mora: 12500 },
  3: { bookTier: "guide", bookCount: 2, mora: 17500 },
  4: { bookTier: "guide", bookCount: 4, mora: 25000 },
  5: { bookTier: "guide", bookCount: 6, mora: 30000 },
  6: { bookTier: "guide", bookCount: 9, mora: 37500 },
  7: { bookTier: "philosophies", bookCount: 4, bossCount: 1, mora: 120000 },
  8: { bookTier: "philosophies", bookCount: 6, bossCount: 1, mora: 260000 },
  9: { bookTier: "philosophies", bookCount: 12, bossCount: 2, mora: 450000 },
  10: { bookTier: "philosophies", bookCount: 16, bossCount: 2, crown: true, mora: 700000 },
};

/**
 * Danh sách nguyên liệu cần cho từng cấp nâng cung mệnh 2-10 — THUẦN, không
 * ghi DB, không có materialId (chỉ {name, count}). Bước persist (seed) mới
 * là nơi gọi upsertMaterial() để đổi name -> materialId trước khi lưu.
 *
 * Không tự console.warn khi thiếu bookType/bossMaterialName — trả về mảng
 * rỗng/thiếu phần boss và để NGƯỜI GỌI (adapter, đang có đủ ngữ cảnh tên
 * nhân vật) quyết định log thế nào, tránh lẫn side-effect logging vào hàm
 * thuần.
 */
export function buildTalentMaterialLevels(
  bookType: string | null,
  bossMaterialName: string | null
): TalentMaterialLevel[] {
  if (!bookType) return [];

  const bookNames: Record<"teachings" | "guide" | "philosophies", string> = {
    teachings: `Teachings of ${bookType}`,
    guide: `Guide to ${bookType}`,
    philosophies: `Philosophies of ${bookType}`,
  };

  const result: TalentMaterialLevel[] = [];
  for (let level = 2; level <= 10; level++) {
    const cost = TALENT_LEVEL_COSTS[level];
    if (!cost) continue;

    const materials: MaterialRef[] = [
      { name: bookNames[cost.bookTier], count: cost.bookCount },
      { name: "Mora", count: cost.mora },
    ];

    if (cost.bossCount && bossMaterialName) {
      materials.push({ name: bossMaterialName, count: cost.bossCount });
    }
    if (cost.crown) {
      materials.push({ name: "Crown of Insight", count: 1 });
    }

    result.push({ level, materials });
  }
  return result;
}

/**
 * BUG ĐÃ SỬA (nguyên liệu nâng thiên phú SAI + THIẾU): buildTalentMaterialLevels()
 * ở trên tự dựng lại danh sách nguyên liệu từ 1 bảng chi phí CHUNG
 * (TALENT_LEVEL_COSTS) + đoán tên sách theo bookType + đoán nguyên liệu
 * boss bằng heuristic quét toàn bộ enemy "BOSS" (buildBossMaterialName) —
 * cách này THIẾU HẲN 1 loại nguyên liệu bắt buộc ở MỌI cấp 2->10: nguyên
 * liệu quái thường theo vùng (vd "Treasure Hoarder Insignia" / "Silver
 * Raven Insignia" / "Golden Raven Insignia" cho Kazuha) — genshin-db không
 * xuất field này ra ngoài `costs` thô nên bảng cost tự dựng ở trên không
 * thể biết mà thêm vào. Đồng thời việc đoán boss material bằng heuristic
 * có thể ra SAI vật phẩm nếu 1 boss rớt nhiều loại nguyên liệu không rarity.
 *
 * genshin-db thực ra đã trả sẵn `talents(name).costs.lvl2..lvl10` — dữ
 * liệu THẬT, ĐÚNG 1:1 cho từng nhân vật (đã xác nhận qua
 * scripts/inspect-talent-shape.ts chạy tay: đủ cả sách + Mora + nguyên
 * liệu quái vùng + nguyên liệu boss + Vương Miện Trí Tuệ, không thiếu
 * dòng nào) — dùng thẳng nguồn NÀY làm nguồn CHÍNH, chỉ fallback về
 * buildTalentMaterialLevels() (bảng tự dựng, có thể thiếu nguyên liệu
 * quái vùng) khi 1 nhân vật nào đó không có field `costs` (vd lỗi phiên
 * bản genshin-db).
 */
type RawTalentCostItem = { name?: string; count?: number };
type RawTalentCosts = Record<string, RawTalentCostItem[] | undefined>;

export function buildTalentMaterialLevelsFromRawCosts(
  rawCosts: RawTalentCosts | null | undefined
): TalentMaterialLevel[] | null {
  if (!rawCosts || typeof rawCosts !== "object") return null;

  const result: TalentMaterialLevel[] = [];
  for (let level = 2; level <= 10; level++) {
    const items = rawCosts[`lvl${level}`];
    if (!Array.isArray(items) || items.length === 0) return null; // thiếu 1 cấp -> không đáng tin, để caller fallback
    const materials: MaterialRef[] = [];
    for (const item of items) {
      if (!item?.name) continue;
      materials.push({ name: item.name, count: item.count ?? null });
    }
    result.push({ level, materials });
  }
  return result;
}

// ---------- NGUYÊN LIỆU ĐỘT PHÁ (ASCENSION) ----------

export function buildAscensionMaterialPhases(costs: unknown): AscensionMaterialPhase[] | null {
  if (!costs || typeof costs !== "object") return null;
  const raw = costs as Record<string, Array<{ name?: string; count?: number }>>;
  const phases: AscensionMaterialPhase[] = [];
  for (const phase of [1, 2, 3, 4, 5, 6]) {
    const items = raw[`ascend${phase}`];
    if (!Array.isArray(items) || items.length === 0) continue;
    const materials: MaterialRef[] = [];
    for (const m of items) {
      if (!m || !m.name) continue;
      materials.push({ name: m.name, count: m.count ?? null });
    }
    if (materials.length > 0) phases.push({ phase, materials });
  }
  return phases.length ? phases : null;
}

// ---------- BOSS MATERIAL DETECTION ----------

const GENERIC_REWARD_NAMES_FOR_BOSS_SCAN = new Set(["Adventure EXP", "Mora", "Companionship EXP"]);

/**
 * Quét toàn bộ enemy trong genshin-db, gom tên nguyên liệu (viết thường) mà
 * các quái BOSS rớt — dùng để suy luận "phase nâng cấp cung mệnh nào cần
 * nguyên liệu boss" (genshin-db không đánh dấu sẵn field này).
 */
export function buildBossMaterialNameSet(genshindb: {
  enemies: (query: string, options?: { matchCategories?: boolean }) => unknown;
}): Set<string> {
  const set = new Set<string>();
  try {
    const enemyNames = (genshindb.enemies("names", { matchCategories: true }) as string[]) ?? [];
    for (const n of enemyNames) {
      const e = genshindb.enemies(n) as
        | { enemyType?: string; rewardPreview?: Array<{ name?: string; rarity?: unknown }> }
        | null
        | undefined;
      if (!e || e.enemyType !== "BOSS") continue;
      for (const r of e.rewardPreview ?? []) {
        if (r?.name && !GENERIC_REWARD_NAMES_FOR_BOSS_SCAN.has(r.name) && !r.rarity) {
          set.add(r.name.toLowerCase());
        }
      }
    }
  } catch {
    // Trả Set rỗng nếu genshin-db không expose enemies() ở version đang cài
    // — bossMaterialName sẽ luôn null, không chặn crawl các nhân vật khác.
  }
  return set;
}

export function getBossMaterialName(costs: unknown, bossMaterialNames: Set<string>): string | null {
  if (!costs || typeof costs !== "object") return null;
  const raw = costs as Record<string, Array<{ name?: string }>>;
  for (const phase of [6, 5, 4, 3, 2, 1]) {
    const items = raw[`ascend${phase}`];
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (item?.name && bossMaterialNames.has(item.name.toLowerCase())) {
        return item.name;
      }
    }
  }
  return null;
}

// ---------- TALENT BOOK RESOLUTION ----------

function normalizeCharacterName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const TRAVELER_ELEMENT_TO_BOOK: Record<string, string> = {
  Anemo: "Freedom",
  Geo: "Prosperity",
  Electro: "Elegance",
  Dendro: "Praxis",
  Hydro: "Equity",
  Pyro: "Contention",
  Cryo: "Ballad",
};

/**
 * Factory tạo hàm tra "loại sách kỹ năng" của 1 nhân vật, từ mapping
 * tên-nhân-vật -> tên-sách đọc từ scripts/data/talent-book-mapping.json.
 * Trả về 1 closure thay vì hàm nhận thẳng mapping mỗi lần gọi, để chuẩn hóa
 * (bỏ dấu, viết thường) toàn bộ key CHỈ MỘT LẦN lúc tạo, không lặp lại mỗi
 * lần tra cứu nhân vật.
 */
/**
 * BUG ĐÃ SỬA: `crawlCharacter()` trong crawl-characters.ts gọi hàm này cho
 * riêng Aether/Lumine (raw.name chỉ là "Aether"/"Lumine" đơn thuần, không
 * match được regex "Traveler (Element)" trong createTalentBookResolver ở
 * dưới) — nhưng hàm chưa từng được định nghĩa/export ở đây, chỉ có map
 * TRAVELER_ELEMENT_TO_BOOK trơ ra một mình. Import bị lỗi
 * "does not provide an export named 'resolveTravelerTalentBook'" ngay khi
 * chạy `npm run data:crawl`. Thêm hàm bọc map này lại.
 */
export function resolveTravelerTalentBook(vision?: string | null): string | null {
  if (!vision) return null;
  return TRAVELER_ELEMENT_TO_BOOK[vision.trim()] ?? null;
}

/**
 * BUG ĐÃ SỬA (13 nhân vật "KHÔNG resolve được talent book type"): trước
 * đây bookType CHỈ được tra từ talent-book-mapping.json — 1 file map thủ
 * công (tên nhân vật -> tên sách) phải tự tay cập nhật mỗi khi có nhân vật
 * mới, nên 11 nhân vật Natlan mới (Aino, Flins, Illuga, Jahoda, Linnea,
 * Lohen, Manekin, Manekina, Nicole, Prune, Zibai) chưa kịp thêm vào là
 * crawl fail ngay, dù genshin-db ĐÃ CÓ đủ dữ liệu.
 *
 * Thực ra `genshindb.talents(name).costs.lvl2` luôn chứa 1 item tên dạng
 * "Teachings of <BookType>" (đã tự kiểm chứng bằng script test cho cả 11
 * nhân vật trên — ra đúng "Teachings of Elysium", "Teachings of
 * Vagrancy"...) — lấy tên sách TRỰC TIẾP từ đây, không cần map thủ công
 * cho bất kỳ nhân vật thường nào nữa. Chỉ Aether/Lumine là NGOẠI LỆ THẬT:
 * genshin-db 5.2.12 không tách biến thể nguyên tố cho Traveler (`vision`
 * luôn undefined, `talents("Aether")` trả về null) — 2 nhân vật này vẫn
 * phải giữ trong talent-book-mapping.json.
 */
const TEACHINGS_PREFIX = "Teachings of ";

export function deriveBookTypeFromTalentCosts(
  rawTalentCosts: Record<string, Array<{ name?: string }> | undefined> | null | undefined
): string | null {
  const lvl2 = rawTalentCosts?.lvl2;
  if (!Array.isArray(lvl2)) return null;
  for (const item of lvl2) {
    if (item?.name?.startsWith(TEACHINGS_PREFIX)) {
      return item.name.slice(TEACHINGS_PREFIX.length).trim();
    }
  }
  return null;
}

export function createTalentBookResolver(
  talentBookSeriesByCharacter: Record<string, string>
): (characterNameOrCandidates: string | string[]) => string | null {
  const byNormalizedName: Record<string, string> = Object.fromEntries(
    Object.entries(talentBookSeriesByCharacter).map(([name, series]) => [
      normalizeCharacterName(name),
      series,
    ])
  );

  return (characterNameOrCandidates: string | string[]): string | null => {
    const candidates = Array.isArray(characterNameOrCandidates)
      ? characterNameOrCandidates
      : [characterNameOrCandidates];

    for (const candidate of candidates) {
      const match = byNormalizedName[normalizeCharacterName(candidate)];
      if (match) return match;
    }
    for (const candidate of candidates) {
      const match = candidate.match(/Traveler \(([A-Za-z]+)\)/);
      if (match && TRAVELER_ELEMENT_TO_BOOK[match[1]]) return TRAVELER_ELEMENT_TO_BOOK[match[1]];
    }
    return null;
  };
}

// ---------- TALENTS / CONSTELLATIONS ----------

const TALENT_FIELD_ORDER = [
  "combat1",
  "combat2",
  "combatsp",
  "combat3",
  "passive1",
  "passive2",
  "passive3",
  "passive4",
] as const;

const TALENT_LABELS: Record<string, string> = {
  combat1: "normalAttack",
  combat2: "elementalSkill",
  combatsp: "alternateSprint",
  combat3: "elementalBurst",
  passive1: "passive1",
  passive2: "passive2",
  passive3: "passive3",
  passive4: "passive4",
};

/**
 * Định dạng 1 giá trị thô theo hậu tố format trong template genshin-db,
 * vd "F1P" (1 chữ số thập phân, dạng %), "F1" (1 chữ số thập phân,
 * số thường), "I" (số nguyên). Xác nhận đúng bằng dữ liệu THẬT lấy từ
 * genshindb.talents("Kaedehara Kazuha") — xem scripts/inspect-talent-shape.ts.
 */
function formatTalentParamValue(raw: number, format: string): string {
  if (format === "I") return Math.round(raw).toString();

  const isPercent = format.endsWith("P");
  const decimalsMatch = format.match(/^F(\d+)/);
  const decimals = decimalsMatch ? parseInt(decimalsMatch[1], 10) : 0;

  if (isPercent) return `${(raw * 100).toFixed(decimals)}%`;
  return raw.toFixed(decimals);
}

type RawTalentAttributes = {
  labels?: string[];
  parameters?: Record<string, number[]>;
};

/**
 * Parse attributes THÔ của genshin-db (labels dạng template string, vd
 * "3-Hit DMG|{param3:F1P}+{param4:F1P}") thành bảng thông số theo cấp,
 * đã format sẵn (%, số nguyên...) để render trực tiếp lên UI.
 *
 * Chỉ combat1/combat2/combat3 (Đòn thường/Kỹ năng/Trọng kích) có field
 * này — passive và constellation KHÔNG có, vì không scale theo cấp.
 */
function parseTalentAttributes(
  attributes: RawTalentAttributes | undefined
): TalentAttributeRow[] | null {
  if (!attributes?.labels?.length || !attributes.parameters) return null;

  const rows: TalentAttributeRow[] = [];
  for (const rawLabel of attributes.labels) {
    const [displayName, template] = rawLabel.split("|");
    if (!displayName || !template) continue;

    const paramRefs = Array.from(template.matchAll(/\{(param\d+):([^}]+)\}/g));
    if (paramRefs.length === 0) continue;

    const levelCount = attributes.parameters[paramRefs[0][1]]?.length ?? 0;
    const values: string[] = [];
    for (let lvl = 0; lvl < levelCount; lvl++) {
      let rendered = template;
      for (const [fullMatch, paramKey, format] of paramRefs) {
        const raw = attributes.parameters[paramKey]?.[lvl];
        rendered = rendered.replace(
          fullMatch,
          raw !== undefined ? formatTalentParamValue(raw, format) : "—"
        );
      }
      values.push(rendered);
    }
    rows.push({ label: displayName, values });
  }
  return rows.length ? rows : null;
}

type RawTalentAbility = {
  name?: string;
  description?: string;
  attributes?: RawTalentAttributes;
};

type RawConstellationAbility = {
  name?: string;
  description?: string;
};

type RawTalentsResult = Record<string, unknown> & {
  images?: Record<string, string | undefined>;
};

type RawConstellationsResult = Record<string, unknown> & {
  images?: Record<string, string | undefined>;
};

export function getTalentsAndConstellations(
  genshindb: {
    talents?: (name: string) => unknown;
    constellations?: (name: string) => unknown;
  },
  characterName: string
): {
  talents: TalentEntry[] | null;
  constellations: ConstellationEntry[] | null;
  talentMaterials: TalentMaterialLevel[] | null;
  bookType: string | null;
} {
  try {
    const rawTalents =
      typeof genshindb.talents === "function"
        ? (genshindb.talents(characterName) as RawTalentsResult | null)
        : null;
    const rawConstellations =
      typeof genshindb.constellations === "function"
        ? (genshindb.constellations(characterName) as RawConstellationsResult | null)
        : null;

    // Icon nằm ở object "images" RIÊNG (filename_combat1, filename_c1...),
    // KHÔNG nằm trong từng talent/constellation — xác nhận từ dữ liệu thật.
    const talentImages = rawTalents?.images ?? {};
    const talents: TalentEntry[] = rawTalents
      ? TALENT_FIELD_ORDER.map((rawKey) => {
          const t = rawTalents[rawKey] as RawTalentAbility | undefined;
          if (!t) return null;
          return {
            key: TALENT_LABELS[rawKey],
            name: t.name ?? null,
            description: t.description ?? null,
            icon: getUiAssetUrl(talentImages[`filename_${rawKey}`]),
            attributes: parseTalentAttributes(t.attributes),
          };
        }).filter((t): t is TalentEntry => t !== null)
      : [];

    const constellationImages = rawConstellations?.images ?? {};
    const constellations: ConstellationEntry[] = rawConstellations
      ? (Array.from({ length: 6 }, (_, i) => {
          const key = `c${i + 1}`;
          const cst = rawConstellations[key] as RawConstellationAbility | undefined;
          if (!cst) return null;
          return {
            level: i + 1,
            name: cst.name ?? null,
            description: cst.description ?? null,
            icon: getUiAssetUrl(constellationImages[`filename_${key}`]),
          };
        }).filter((c): c is ConstellationEntry => c !== null))
      : [];

    const talentMaterials = buildTalentMaterialLevelsFromRawCosts(
      (rawTalents as (RawTalentsResult & { costs?: RawTalentCosts }) | null)?.costs
    );
    const bookType = deriveBookTypeFromTalentCosts(
      (rawTalents as (RawTalentsResult & { costs?: RawTalentCosts }) | null)?.costs
    );

    return {
      talents: talents.length ? talents : null,
      constellations: constellations.length ? constellations : null,
      talentMaterials,
      bookType,
    };
  } catch {
    return { talents: null, constellations: null, talentMaterials: null, bookType: null };
  }
}

// ---------- STATS THEO CẤP ĐỘ ----------

const ASCENSION_BREAKPOINT_LEVELS = new Set([20, 40, 50, 60, 70, 80]);

function buildStatBreakpoints(): Array<[number, "-" | "+" | undefined]> {
  const points: Array<[number, "-" | "+" | undefined]> = [];
  for (let level = 1; level <= 90; level++) {
    if (ASCENSION_BREAKPOINT_LEVELS.has(level)) {
      points.push([level, "-"]);
      points.push([level, "+"]);
    } else {
      points.push([level, undefined]);
    }
  }
  return points;
}

const STAT_BREAKPOINTS: Array<[number, "-" | "+" | undefined]> = buildStatBreakpoints();

type StatsFn = (level: number, ascension?: "-" | "+") => {
  level?: number;
  ascension?: number;
  hp?: number;
  attack?: number;
  defense?: number;
  specialized?: number;
} | null;

export function getStatsByLevel(statsFn: unknown): StatsByLevelRow[] | null {
  if (typeof statsFn !== "function") return null;
  try {
    const fn = statsFn as StatsFn;
    const rows: StatsByLevelRow[] = STAT_BREAKPOINTS.map(([level, ascension]) => {
      const s = ascension ? fn(level, ascension) : fn(level);
      if (!s) return null;
      return {
        level: s.level ?? level,
        ascension: s.ascension ?? null,
        hp: s.hp ?? null,
        attack: s.attack ?? null,
        defense: s.defense ?? null,
        specialized: s.specialized ?? null,
      };
    }).filter((r): r is StatsByLevelRow => r !== null);
    return rows.length ? rows : null;
  } catch {
    return null;
  }
}