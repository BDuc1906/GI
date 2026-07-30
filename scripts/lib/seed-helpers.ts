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