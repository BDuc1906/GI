import { describe, it, expect } from 'vitest';
import { normalizeLocalAssetKey, findBestLocalAssetMatch } from "@/lib/game/local-image-name";

describe('local image name normalization', () => {
  it('normalizes file names and aliases into the same key', () => {
    expect(normalizeLocalAssetKey('ui-avataricon-zhongli.png')).toBe('uiavatariconzhongli');
    expect(normalizeLocalAssetKey('Zhongli')).toBe('zhongli');
  });

  it('finds best matched filename by key overlap', () => {
    const candidates = ['ui-avataricon-zhongli.png', 'speech-zhongli.png', 'albedo-1.png'];
    const match = findBestLocalAssetMatch('zhongli', candidates);
    expect(match).toContain('zhongli');
  });
});
