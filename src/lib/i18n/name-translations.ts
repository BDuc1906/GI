/**
 * scripts/lib/name-translations.ts
 *
 * Logic dùng chung để lấy TÊN CHÍNH THỨC của 1 entity (nhân vật/vũ khí/
 * thánh di vật/bí cảnh/nguyên liệu) theo TỪNG NGÔN NGỮ, cho cột
 * `nameTranslations Json?` (xem prisma/schema-nameTranslations.patch.md).
 *
 * HAI NGUỒN, THEO THỨ TỰ ƯU TIÊN:
 *
 * 1. genshin-db chính nó (KHÔNG gọi API ngoài, không cần mạng) — package
 *    này lấy dữ liệu trực tiếp từ file localization CỦA CHÍNH GAME
 *    (GenshinData repo), nên đây là bản dịch CHUẨN NHẤT có thể có, đúng
 *    100% với những gì người chơi thấy trong game ở ngôn ngữ đó — không
 *    phải suy đoán hay dịch máy. Hỗ trợ 13/15 locale của dự án:
 *    ChineseSimplified, ChineseTraditional, English, French, German,
 *    Indonesian, Japanese, Korean, Portuguese, Russian, Spanish, Thai,
 *    Vietnamese (xác nhận qua README chính thức + npm page của
 *    theBowja/genshin-db tại thời điểm viết file này — option
 *    `resultLanguage`).
 *
 * 2. Azure Translator (dịch máy thật, cùng cơ chế với
 *    scripts/i18n-translate.mjs) — CHỈ dùng cho 2 locale mà bản thân
 *    game KHÔNG hỗ trợ: Italian (it), Turkish (tr). Genshin Impact không
 *    có bản dịch tiếng Ý/Thổ Nhĩ Kỳ chính thức, nên genshin-db cũng
 *    không có — không có "nguồn chuẩn" nào để tra. Đây là lựa chọn tốt
 *    nhất tiếp theo để phủ đủ 15/15 locale, NHƯNG chất lượng thấp hơn
 *    hẳn nguồn (1) vì đây là DANH TỪ RIÊNG (đặc biệt tên nhân vật) — máy
 *    dịch có thể dịch sai/ngớ ngẩn. scripts/seed-name-translations.ts in
 *    ra danh sách các tên nhân vật đã dịch bằng nguồn này ở cuối để soát
 *    tay riêng.
 */

// Map locale code của dự án (src/i18n/routing.ts) -> tên enum ngôn ngữ mà
// genshin-db chấp nhận cho option `resultLanguage`. CHỈ chứa 13 locale mà
// genshin-db hỗ trợ — "it" và "tr" CỐ TÌNH không có mặt ở đây, xử lý riêng
// bằng Azure ở scripts/seed-name-translations.ts.
export const GENSHINDB_LOCALE_MAP: Record<string, string> = {
  en: "English",
  vi: "Vietnamese",
  "zh-CN": "ChineseSimplified",
  "zh-TW": "ChineseTraditional",
  ja: "Japanese",
  ko: "Korean",
  id: "Indonesian",
  th: "Thai",
  de: "German",
  fr: "French",
  pt: "Portuguese",
  es: "Spanish",
  ru: "Russian",
};

// 2 locale của dự án mà genshin-db KHÔNG có (game gốc không hỗ trợ) —
// bắt buộc phải dịch máy nếu muốn phủ đủ 15/15 locale.
export const MACHINE_TRANSLATE_ONLY_LOCALES = ["it", "tr"] as const;
export type MachineTranslateLocale = (typeof MACHINE_TRANSLATE_ONLY_LOCALES)[number];

/**
 * Lấy tên entity theo cả 13 ngôn ngữ genshin-db hỗ trợ, bằng cách query
 * lại CHÍNH entity đó (theo tên tiếng Anh — ổn định, không đổi giữa các
 * lần gọi) với `resultLanguage` đổi lần lượt qua từng ngôn ngữ.
 *
 * QUAN TRỌNG: giữ nguyên `queryLanguages` mặc định của genshin-db (chỉ
 * tìm bằng tiếng Anh) ở MỌI lần gọi — nghĩa là luôn tìm bằng tên tiếng
 * Anh làm input, chỉ đổi ngôn ngữ ĐẦU RA (`resultLanguage`). Nếu đổi cả
 * ngôn ngữ tìm kiếm theo từng vòng lặp, việc match theo tên gốc sẽ không
 * còn ổn định — đây là lớp lỗi "đoán sai tham số, chạy không lỗi nhưng
 * trả về sai/null hàng loạt" mà dự án này đã gặp nhiều lần (xem các file
 * inspect-*.ts), nên cố tình tránh bằng cách giữ nguyên input tìm kiếm.
 *
 * @param genshindb   Module genshin-db đã require() sẵn (dùng chung 1
 *                    instance, không require() lại trong hàm này — hàm
 *                    này bị gọi hàng nghìn lần/lượt seed).
 * @param folder      Tên hàm query trên genshindb: "characters",
 *                    "weapons", "artifacts", "domains", "materials".
 * @param englishName Tên tiếng Anh CHÍNH XÁC của entity (dùng làm query
 *                    input, giữ nguyên xuyên suốt).
 * @returns           { vi: "...", ja: "...", ... } — luôn có key "en"
 *                    (gán thẳng = englishName, không cần query lại).
 *                    Locale nào genshin-db không trả tên hợp lệ cho
 *                    riêng entity đó thì bị bỏ qua (không có key), KHÔNG
 *                    tự bịa fallback ở tầng này — tầng đọc dữ liệu
 *                    (src/lib/entity-name.ts) chịu trách nhiệm fallback
 *                    về tiếng Anh khi hiển thị.
 */
export function getOfficialGameNames(
  genshindb: Record<string, unknown>,
  folder: string,
  englishName: string
): Record<string, string> {
  const fn = genshindb[folder];
  if (typeof fn !== "function") {
    throw new Error(`genshin-db không có folder "${folder}"`);
  }

  const result: Record<string, string> = { en: englishName };
  for (const [projectLocale, genshinDbLang] of Object.entries(GENSHINDB_LOCALE_MAP)) {
    if (projectLocale === "en") continue; // đã gán ở trên, khỏi query lại
    try {
      const raw = (fn as (q: string, opts: Record<string, unknown>) => { name?: string } | undefined)(
        englishName,
        { resultLanguage: genshinDbLang }
      );
      if (raw?.name) result[projectLocale] = raw.name;
    } catch {
      // Bỏ qua — 1 entity/1 ngôn ngữ lỗi không nên chặn toàn bộ vòng lặp
      // (giống nguyên tắc try/catch từng dòng đã dùng khắp scripts/seed-*.ts).
    }
  }
  return result;
}

const AZURE_ENDPOINT = "https://api.cognitive.microsofttranslator.com";

// Mã ngôn ngữ Azure Translator dùng cho riêng 2 locale không có trong
// genshin-db — xem giải thích đầy đủ ở scripts/i18n-translate.mjs.
const AZURE_LANG_CODE: Record<MachineTranslateLocale, string> = { it: "it", tr: "tr" };

/**
 * Dịch máy 1 lô tên (tối đa 100 phần tử/lần theo giới hạn Azure) sang 1
 * locale không có trong genshin-db (it/tr). KHÔNG cần bảo toàn
 * placeholder kiểu {count}/<b> như scripts/i18n-translate.mjs — tên
 * entity là cụm danh từ thuần, không chứa cú pháp next-intl.
 */
export async function translateNamesAzure(
  names: string[],
  targetLocale: MachineTranslateLocale,
  apiKey: string,
  region: string | undefined
): Promise<string[]> {
  if (names.length === 0) return [];
  const target = AZURE_LANG_CODE[targetLocale];
  const url = `${AZURE_ENDPOINT}/translate?api-version=3.0&from=en&to=${target}`;
  const headers: Record<string, string> = {
    "Ocp-Apim-Subscription-Key": apiKey,
    "Content-Type": "application/json",
  };
  if (region) headers["Ocp-Apim-Subscription-Region"] = region;

  const MAX_RETRIES = 6;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(names.map((t) => ({ Text: t }))),
    });

    if (res.status === 429) {
      // Gói F0 giới hạn số request/giây — chờ rồi thử lại cùng lô, tăng
      // dần thời gian chờ (1s, 2s, 4s, 8s...), giống i18n-translate.mjs.
      const waitMs = Math.min(1000 * 2 ** attempt, 30000);
      console.log(`  ⏳ Azure Translator bị giới hạn tốc độ, chờ ${waitMs / 1000}s...`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    if (!res.ok) {
      throw new Error(`Azure Translator lỗi ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as Array<{ translations: Array<{ text: string }> }>;
    return data.map((item) => item.translations[0].text);
  }
  throw new Error(`Vẫn bị giới hạn tốc độ sau ${MAX_RETRIES} lần thử lại.`);
}
