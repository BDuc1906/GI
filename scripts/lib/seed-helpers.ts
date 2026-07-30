/**
 * Helper dùng chung cho toàn bộ script seed (nhân vật/vũ khí/thánh di vật).
 * Tách riêng ra đây để 3 file seed-*.ts không phải copy-paste lại logic
 * build URL ảnh hay slugify — sửa 1 chỗ, áp dụng cho cả 3.
 */

export function getEnkaUrl(filename?: string | null, mihoyoUrl?: string | null): string | null {
  // VERIFY: confirm the exact base path against a known-good filename from
  // your installed genshin-db version — Enka has changed asset paths before.
  if (filename) return `https://enka.network/ui/${filename}.png`;
  if (mihoyoUrl) return mihoyoUrl;
  return null;
}

export function getElementIconUrl(element?: string | null): string | null {
  if (!element) return null;
  const name = element.trim();
  if (!name) return null;
  // VERIFY: replace with your actual asset source. Left as null-safe
  // rather than guessing a URL that "looks right" but 404s, since a
  // silently-broken icon is worse than an explicit gap you can fill in.
  const known: Record<string, string> = {
    Anemo: "https://static.wikia.nocookie.net/gensin-impact/images/1/10/Element_Anemo.svg",
    Geo: "https://static.wikia.nocookie.net/gensin-impact/images/9/9b/Element_Geo.svg",
    Electro: "https://static.wikia.nocookie.net/gensin-impact/images/f/ff/Element_Electro.svg",
    Dendro: "https://static.wikia.nocookie.net/gensin-impact/images/7/73/Element_Dendro.svg",
    Hydro: "https://static.wikia.nocookie.net/gensin-impact/images/8/80/Element_Hydro.svg",
    Pyro: "https://static.wikia.nocookie.net/gensin-impact/images/2/2c/Element_Pyro.svg",
    Cryo: "https://static.wikia.nocookie.net/gensin-impact/images/7/72/Element_Cryo.svg",
  };
  return known[name] ?? null;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * VERIFY: genshin-db expose `materials(name)` (đã xác nhận có tồn tại qua
 * `folders/materials.d.ts` được reference trong types), nhưng type file đó
 * KHÔNG có trong bundle types đã cung cấp nên chưa xác nhận được tên field
 * ảnh chính xác trong `images` của Material — Character/Weapon/Artifact đều
 * dùng `filename_icon`, giả định Material cũng theo pattern này, nhưng cần
 * chạy thử `console.log(genshindb.materials('<tên nguyên liệu>'))` để xác
 * nhận trước khi seed thật, phòng khi tên field khác (vd `filename_full`).
 */
export function getMaterialIconFilename(material: unknown): string | null {
  const m = material as { images?: Record<string, string | undefined> } | null | undefined;
  if (!m?.images) return null;
  return (
    m.images.filename_icon ??
    m.images.filename_full ??
    m.images.filename ??
    null
  );
}

/**
 * Upsert 1 Material vào bảng riêng (idempotent — an toàn gọi lặp lại nhiều
 * lần cho cùng 1 nguyên liệu khi seed nhiều nhân vật dùng chung nó).
 * Trả về materialId (slug) để lưu vào JSON ascensionMaterials của Character.
 * `prisma` và `genshindb` được truyền vào (dependency injection) thay vì
 * import trực tiếp ở đây, để file helper này không phụ thuộc cứng vào
 * PrismaClient instance nào — seed-weapons.ts sau này có thể tái dùng y
 * hệt hàm này cho nguyên liệu cường hóa vũ khí.
 */
export async function upsertMaterial(
  prisma: { material: { upsert: (args: any) => Promise<unknown> } },
  genshindb: { materials: (name: string) => unknown },
  materialName: string
): Promise<string> {
  const id = slugify(materialName);
  let iconUrl: string | null = null;
  try {
    const raw = genshindb.materials(materialName);
    iconUrl = getEnkaUrl(getMaterialIconFilename(raw), null);
  } catch {
    // Không tìm thấy trong genshin-db (vd nguyên liệu Mora không nằm trong
    // materials()) — vẫn tạo record với iconUrl null, UI fallback về text.
  }
  await prisma.material.upsert({
    where: { id },
    create: { id, name: materialName, iconUrl },
    update: { iconUrl },
  });
  return id;
}