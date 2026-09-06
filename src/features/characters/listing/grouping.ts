import type { Character } from "@prisma/client";

export interface TravelerBucket {
  boy?: Character;
  girl?: Character;
}

export interface CharacterGrouping {
  travelerByElement: Map<string, TravelerBucket>;
  rarityGroups: Map<number, Character[]>;
  sortedRarities: number[];
  hasResults: boolean;
  /** Số lượng hiển thị trên UI: mỗi cặp Traveler (boy+girl) tính là 1. */
  displayCount: number;
}

/**
 * Tách danh sách nhân vật thành: nhóm Traveler theo nguyên tố (ghép cặp
 * boy/girl) + nhóm nhân vật thường theo rarity (dùng để chèn tiêu đề
 * sticky "★★★★★" giữa các nhóm, thay vì để ranh giới 5★/4★ vô hình).
 */
export function groupCharactersForListing(characters: Character[]): CharacterGrouping {
  const travelerByElement = new Map<string, TravelerBucket>();
  const nonTraveler: Character[] = [];

  for (const c of characters) {
    if (c.id.startsWith("traveler-boy-")) {
      const bucket = travelerByElement.get(c.vision) ?? {};
      bucket.boy = c;
      travelerByElement.set(c.vision, bucket);
    } else if (c.id.startsWith("traveler-girl-")) {
      const bucket = travelerByElement.get(c.vision) ?? {};
      bucket.girl = c;
      travelerByElement.set(c.vision, bucket);
    } else {
      nonTraveler.push(c);
    }
  }

  const rarityGroups = new Map<number, Character[]>();
  for (const c of nonTraveler) {
    const list = rarityGroups.get(c.rarity) ?? [];
    list.push(c);
    rarityGroups.set(c.rarity, list);
  }

  const sortedRarities = Array.from(rarityGroups.keys()).sort((a, b) => b - a);
  const hasResults = nonTraveler.length > 0 || travelerByElement.size > 0;
  const displayCount = nonTraveler.length + travelerByElement.size;

  return { travelerByElement, rarityGroups, sortedRarities, hasResults, displayCount };
}
