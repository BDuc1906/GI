/**
 * Helper dùng chung cho toàn bộ script seed.
 */

export function getEnkaUrl(filename?: string | null, mihoyoUrl?: string | null): string | null {
  if (filename) return `https://enka.network/ui/${filename}.png`;
  if (mihoyoUrl) return mihoyoUrl;
  return null;
}

export function getElementIconUrl(element?: string | null): string | null {
  if (!element) return null;
  const known: Record<string, string> = {
    Anemo: "https://static.wikia.nocookie.net/gensin-impact/images/1/10/Element_Anemo.svg",
    Geo: "https://static.wikia.nocookie.net/gensin-impact/images/9/9b/Element_Geo.svg",
    Electro: "https://static.wikia.nocookie.net/gensin-impact/images/f/ff/Element_Electro.svg",
    Dendro: "https://static.wikia.nocookie.net/gensin-impact/images/7/73/Element_Dendro.svg",
    Hydro: "https://static.wikia.nocookie.net/gensin-impact/images/8/80/Element_Hydro.svg",
    Pyro: "https://static.wikia.nocookie.net/gensin-impact/images/2/2c/Element_Pyro.svg",
    Cryo: "https://static.wikia.nocookie.net/gensin-impact/images/7/72/Element_Cryo.svg",
  };
  return known[element.trim()] ?? null;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getMaterialIconFilename(material: unknown): string | null {
  const m = material as { images?: Record<string, string | undefined> } | null | undefined;
  if (!m?.images) return null;
  return m.images.filename_icon ?? m.images.filename_full ?? m.images.filename ?? null;
}

/**
 * Kiểu thật của genshindb.materials(): hỗ trợ cả dạng tra 1 tên
 * ("Vayuda Turquoise Sliver") lẫn dạng liệt kê tên ("names", { matchCategories }).
 * Bản trước đây khai báo chỉ nhận 1 tham số nhưng code bên dưới lại gọi với
 * 2 tham số -> lỗi biên dịch "Expected 1 arguments, but got 2" khi build với
 * tsconfig "strict": true. Khai báo lại đúng chữ ký để khớp cách gọi thật.
 */
type MaterialsFn = (
  name: string,
  options?: { matchCategories?: boolean }
) => unknown;

// Danh sách tên nguyên liệu KHÔNG tra được icon — in tổng kết ở cuối run
// (cùng cách làm với CHARACTERS_MISSING_BOOK_TYPE bên seed-characters.ts)
// thay vì im lặng bỏ qua như trước. Trước đây nếu cả 3 bước lookup đều thất
// bại, hàm chỉ đơn giản để iconUrl = null mà không log gì -> không ai biết
// material nào bị thiếu cho tới khi thấy icon "-" trên web.
export const MATERIALS_MISSING_ICON: string[] = [];

export function printMissingIconSummary(): void {
  if (MATERIALS_MISSING_ICON.length === 0) {
    console.log("✔ Mọi nguyên liệu đều tra được icon.");
    return;
  }
  const unique = Array.from(new Set(MATERIALS_MISSING_ICON));
  console.warn(
    `\n⚠ ${unique.length} nguyên liệu KHÔNG tra được icon (sẽ hiện "-" trên web):`
  );
  console.warn(unique.map((n) => `   - ${n}`).join("\n"));
  console.warn(
    `→ Nguyên nhân thường gặp: bản "genshin-db" đang cài chưa có data cho nguyên liệu ` +
    `vùng mới ra (vd Natlan). Thử "npm install genshin-db@latest" rồi seed lại.\n` +
    `  Nếu vẫn thiếu sau khi update, package cộng đồng đó chưa kịp cập nhật —\n` +
    `  cần map icon tay tạm thời cho các tên này (xem MANUAL_ICON_OVERRIDES).`
  );
}

// Fallback tay cho nguyên liệu mà genshin-db chưa có data (vd nội dung vùng
// mới ra mắt). Điền thủ công filename icon từ enka.network khi phát hiện
// qua MATERIALS_MISSING_ICON, để không phải đợi package cộng đồng cập nhật.
// Key: tên nguyên liệu (đúng chính tả trong game), value: filename trên enka
// (không gồm .png), dùng lại getEnkaUrl() bên dưới.
const MANUAL_ICON_OVERRIDES: Record<string, string> = {
  // "Frostlamp Flower": "UI_ItemIcon_...",
};


/**
 * upsert 1 nguyên liệu vào bảng Material, tra icon từ genshin-db theo 3 bước
 * dự phòng (trực tiếp -> chuẩn hóa tên -> dò trong danh sách tên).
 *
 * Quan trọng: mỗi bước tra cứu được bọc try/catch RIÊNG (qua `tryLookup`).
 * Trước đây cả 3 bước nằm chung 1 try/catch duy nhất -> nếu bước 1 ném lỗi
 * (một số version của genshin-db throw thay vì trả về giá trị rỗng khi
 * không khớp tên), toàn bộ hàm nhảy thẳng ra catch và bỏ qua luôn bước 2 + 3,
 * dù đó chính là lý do các bước dự phòng này tồn tại.
 */
export async function upsertMaterial(
  prisma: { material: { upsert: (args: any) => Promise<unknown> } },
  genshindb: { materials: MaterialsFn },
  materialName: string
): Promise<string> {
  const id = slugify(materialName);
  let iconUrl: string | null = null;

  const tryLookup = (name: string): unknown => {
    try {
      return genshindb.materials(name);
    } catch {
      return null;
    }
  };

  // 1. Lấy trực tiếp
  let raw = tryLookup(materialName);

  // 2. Chuẩn hóa tên (bỏ dấu, viết thường) — chỉ chạy nếu bước 1 không ra kết quả
  if (!raw) {
    const normalized = materialName.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    if (normalized) raw = tryLookup(normalized);
  }

  // 3. Tìm trong danh sách tên — chỉ chạy nếu 2 bước trên đều không ra kết quả
  if (!raw) {
    try {
      const allNames = genshindb.materials("names", { matchCategories: true }) as string[];
      const match = allNames.find((n) => n.toLowerCase() === materialName.toLowerCase());
      if (match) raw = tryLookup(match);
    } catch {
      // Không lấy được danh sách tên -> bỏ qua, iconUrl vẫn null
    }
  }

  if (raw) {
    iconUrl = getEnkaUrl(getMaterialIconFilename(raw), null);
  }

  // Vẫn không có icon sau cả 3 bước tra genshin-db -> thử override tay,
  // rồi ghi nhận vào danh sách thiếu để in cảnh báo tổng kết cuối run.
  if (!iconUrl) {
    const override = MANUAL_ICON_OVERRIDES[materialName];
    if (override) {
      iconUrl = getEnkaUrl(override, null);
    } else {
      MATERIALS_MISSING_ICON.push(materialName);
    }
  }

  await prisma.material.upsert({
    where: { id },
    create: { id, name: materialName, iconUrl },
    update: { iconUrl },
  });
  return id;
}