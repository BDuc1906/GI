import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Character } from "@prisma/client";
import { ElementIcon } from "@/components/character/ElementIcon";
import { EntityCard } from "@/components/ui/EntityCard";
import { rarityStars, elementColorVar } from "@/lib/ui/theme";
import { resolveCharacterCardImage } from "@/lib/game/character-helpers";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { getElementNameByKey } from "@/lib/game/element-reactions-data";
import type { CharacterGrouping, TravelerBucket } from "@/features/characters/listing";

// Class grid dùng chung cho cả nhóm Traveler và mọi nhóm rarity — mật độ
// cao hơn bản cũ (dừng ở lg:6), tận dụng màn hình rộng thay vì để card
// giãn to vô lý. Đi kèm compact=true trên EntityCard (icon vuông, không
// tilt, text rút gọn) để phù hợp số lượng card lớn trên 1 màn hình.
const DENSE_GRID = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3";

interface CharacterListingGridProps {
  locale: string;
  grouping: CharacterGrouping;
}

/**
 * Toàn bộ phần kết quả của trang /characters: nhóm Traveler theo nguyên
 * tố + các nhóm rarity còn lại, hoặc trạng thái rỗng. Chỉ nhận dữ liệu đã
 * gom nhóm sẵn (xem features/characters/listing/grouping.ts) — không tự
 * đụng Prisma hay filter logic.
 */
export async function CharacterListingGrid({ locale, grouping }: CharacterListingGridProps) {
  const t = await getTranslations({ locale, namespace: "Characters" });
  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });

  const { travelerByElement, rarityGroups, sortedRarities, hasResults } = grouping;

  if (!hasResults) {
    return (
      <div className="text-center py-20 text-text-muted text-sm">
        {t("noResults")}{" "}
        <Link href="/characters" className="underline underline-offset-2 hover:text-text-primary">
          {t("clearFilters")}
        </Link>
      </div>
    );
  }

  return (
    <>
      {travelerByElement.size > 0 && (
        <div className={`${DENSE_GRID} mb-8`}>
          {Array.from(travelerByElement.entries()).map(([el, { boy, girl }]: [string, TravelerBucket], index: number) => {
            const target = (boy ?? girl) as Character;
            const boyImg = boy ? resolveCharacterCardImage(boy) : null;
            const girlImg = girl ? resolveCharacterCardImage(girl) : null;
            return (
              <EntityCard
                key={`traveler-${el}`}
                href={`/characters/${target.id}`}
                // "Traveler (Anemo)" v.v. — tên ghép cứng ở đây, KHÔNG
                // qua getLocalizedName (Character.name của 2 dòng
                // "Traveler (Boy/Girl)" trong DB không phải tên hiển
                // thị thật, chỉ dùng để phân biệt nội bộ).
                name={`${t("traveler")} (${getElementNameByKey(el, locale)})`}
                subtitle={tWeaponType("Sword")}
                rarity={target.rarity}
                imageSrc={boyImg || girlImg}
                aspect="square"
                imageFit="contain"
                compact
                priority={index < 10}
                elementColor={elementColorVar(el)}
                cornerBadge={<ElementIcon vision={el} iconUrl={target.elementIcon} size={14} />}
              />
            );
          })}
        </div>
      )}

      {sortedRarities.map((r: number) => (
        <div key={r} className="mb-8">
          {/* Tiêu đề nhóm rarity — sticky để không mất mốc khi cuộn dài,
              thay cho ranh giới 5★/4★ vô hình như bản cũ. */}
          <div
            className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur-sm py-2 mb-3 text-xs font-semibold tracking-wide"
            style={{ color: `var(--rarity-${r >= 5 ? 5 : r === 4 ? 4 : 3})` }}
          >
            {rarityStars(r)} · {t("rarityGroupCount", { count: rarityGroups.get(r)!.length })}
          </div>
          <div className={DENSE_GRID}>
            {rarityGroups.get(r)!.map((c: Character, index: number) => (
              <EntityCard
                key={c.id}
                href={`/characters/${c.id}`}
                name={getLocalizedName(c, locale)}
                subtitle={tWeaponType(c.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
                rarity={c.rarity}
                imageSrc={resolveCharacterCardImage(c)}
                aspect="square"
                imageFit="contain"
                compact
                priority={index < 10}
                elementColor={elementColorVar(c.vision)}
                cornerBadge={<ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={14} />}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
