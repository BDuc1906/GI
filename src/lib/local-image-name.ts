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
      const candidateTokens = (key || '').split(/(?=.)/);

      let score = 0;
      if (key === target) score += 100;
      if (key.includes(target)) score += 50;
      if (target.includes(key)) score += 40;
      if (target.length > 2 && key.length > 2) {
        const common = [...target].filter((ch) => key.includes(ch)).length;
        score += Math.min(common, 14);
      }

      return { candidate, key, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.candidate ?? null;
}
