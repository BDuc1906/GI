export function normalizeLocalAssetKey(input: string): string {
  const fileStem = input
    .split(/[\\/]/)
    .pop() ?? input;

  const beforeExt = fileStem.replace(/\.(png|jpg|jpeg|webp|svg|bmp|gif)$/i, '');

  return beforeExt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

// BUG ĐÃ GẶP (xem scripts/auto-fill-local-images.ts): với tên nhân vật
// dạng ghép như "Aether (Cryo)" / "Lumine (Geo)" (14 biến thể Traveler),
// thuật toán so khớp cũ (tính điểm theo "target.includes(key)" +
// "ký tự chung") khớp NHẦM sang các file chỉ đặt tên theo nguyên tố
// chung chung — vd "cryo.png" — dù file đó gần như chắc chắn KHÔNG phải
// ảnh nhân vật (chỉ là icon/badge nguyên tố dùng chung cho nhiều thứ).
// Chặn các key "quá chung chung" này: chỉ chấp nhận khớp nếu đó là khớp
// THẬT SỰ MẠNH (key === target, hoặc key là 1 TOKEN riêng — không phải
// khớp mờ qua "includes"/ký tự chung).
const GENERIC_KEYS = new Set([
  'anemo', 'geo', 'electro', 'dendro', 'hydro', 'pyro', 'cryo',
  'icon', 'splash', 'avatar', 'portrait', 'image', 'default',
]);

export function findBestLocalAssetMatch(
  targetName: string,
  candidates: string[]
): string | null {
  if (!targetName || candidates.length === 0) return null;

  const target = normalizeLocalAssetKey(targetName);
  if (!target) return null;

  const scored = candidates
    .map((candidate) => {
      const key = normalizeLocalAssetKey(candidate);
      const isGenericKey = GENERIC_KEYS.has(key);

      let score = 0;
      if (key === target) score += 100;
      // Khớp mờ (bao gồm / ký tự chung) CHỈ tính điểm nếu key KHÔNG phải
      // 1 từ chung chung — tránh "aethercryo".includes("cryo") khớp
      // nhầm vào file "cryo.png" không liên quan tới nhân vật cụ thể nào.
      if (!isGenericKey) {
        if (key.includes(target)) score += 50;
        if (target.includes(key)) score += 40;
        if (target.length > 2 && key.length > 2) {
          const common = [...target].filter((ch) => key.includes(ch)).length;
          score += Math.min(common, 14);
        }
      }

      return { candidate, key, score };
    })
    // Ngưỡng tối thiểu 40 — loại bỏ các khớp yếu (chỉ dựa vào vài ký tự
    // chung) trước đây vẫn lọt qua chỉ vì "score > 0".
    .filter((r) => r.score >= 40)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.candidate ?? null;
}
