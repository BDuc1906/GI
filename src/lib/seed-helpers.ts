
/**
 * Helper dùng chung cho toàn bộ script seed.
 */

import type { Prisma } from "@prisma/client";

export function getEnkaUrl(filename?: string | null, mihoyoUrl?: string | null): string | null {
  if (filename) return `https://enka.network/ui/${filename}.png`;
  if (mihoyoUrl) return mihoyoUrl;
  return null;
}

/**
 * Lấy URL ảnh tốt nhất từ object images của genshin-db.
 * Thử nhiều nguồn: filename, mihoyo, các field khác.
 *
 * `images` không có type chính thức từ genshin-db (thư viện cộng đồng),
 * và tên field không đồng nhất giữa các loại data (nhân vật/vũ khí/vật
 * liệu đều gọi khác nhau chút) nên không khai 1 interface chặt cho tất cả
 * được — dùng `Record<string, string | undefined>` thay vì `any`: vẫn ép
 * kiểu giá trị PHẢI là string (đúng thực tế: mọi field ảnh trong
 * genshin-db đều là filename dạng string), chỉ chấp nhận không biết
 * trước TÊN field nào tồn tại.
 */
type GenshinDbImages = Record<string, string | undefined>;

export function getBestImageUrl(
  images: GenshinDbImages | null | undefined,
  type: 'icon' | 'splash' | 'side' | 'element'
): string | null {
  if (!images || typeof images !== 'object') return null;

  const candidates: string[] = [];

  if (type === 'icon') {
    candidates.push(
      images.filename_icon,
      images.mihoyo_icon,
      images.icon,
      images.filename,
      images.filename_full,
      images.mihoyo_icon_url
    );
  } else if (type === 'splash') {
    candidates.push(
      images.filename_gachaSplash,
      images.mihoyo_gachaSplash,
      images.splash,
      images.filename_splash,
      images.filename_gacha,
      images.gachaSplash
    );
    if (!candidates.some(c => c)) {
      candidates.push(
        images.filename_icon,
        images.mihoyo_icon,
        images.icon
      );
    }
  } else if (type === 'side') {
    candidates.push(
      images.filename_sideIcon,
      images.mihoyo_sideIcon,
      images.sideIcon,
      images.filename_side
    );
  } else if (type === 'element') {
    candidates.push(
      images.elementIcon,
      images.element,
      images.filename_elementIcon
    );
  }

  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim()) {
      if (c.startsWith('http://') || c.startsWith('https://')) {
        return c;
      }
      if (c.trim()) {
        return `https://enka.network/ui/${c}.png`;
      }
    }
  }

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

export let MANUAL_ICON_OVERRIDES: Record<string, string> = {};

export function loadManualOverrides(overrides: Record<string, string>) {
  MANUAL_ICON_OVERRIDES = overrides;
}

/**
 * Options thật sự được dùng khi gọi `genshindb.materials(name, options)`
 * trong toàn bộ codebase (xem `tryLookup` bên dưới và các script seed) —
 * package `genshin-db` không xuất type chính thức cho tham số này.
 */
interface GenshinDbMaterialsOptions {
  matchCategories?: boolean;
}

export async function upsertMaterial(
  prisma: { material: { upsert: (args: Prisma.MaterialUpsertArgs) => Promise<unknown> } },
  genshindb: { materials: (name: string, options?: GenshinDbMaterialsOptions) => unknown },
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

  let raw = tryLookup(materialName);

  if (!raw) {
    const normalized = materialName.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    if (normalized) raw = tryLookup(normalized);
  }

  if (!raw) {
    try {
      const allNames = genshindb.materials("names", { matchCategories: true }) as string[];
      const match = allNames.find((n) => n.toLowerCase() === materialName.toLowerCase());
      if (match) raw = tryLookup(match);
    } catch {
      // bỏ qua
    }
  }

  if (raw) {
    iconUrl = getEnkaUrl(getMaterialIconFilename(raw), null);
  }

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
