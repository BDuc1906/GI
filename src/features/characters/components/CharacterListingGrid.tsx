import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Character } from "@prisma/client";
import { resolveCharacterCardImage } from "@/core/game/character-helpers";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { getElementNameByKey } from "@/core/game/element-reactions-data";
import type { CharacterGrouping, TravelerBucket } from "@/features/characters/listing";
import { localCharacterIcon } from "@/lib/ui/local-assets";
import { CharacterCard } from "@/features/characters/components/CharacterCard";

// Mật độ chuẩn hóa theo yêu cầu:
// - Điện thoại: 2-3 cột
// - Tablet: 4-6 cột
// - Desktop: 8 cột
// - Màn hình rất rộng: 10 cột
const DENSE_GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3 sm:gap-3.5";

interface CharacterListingGridProps {
  locale: string;
  grouping: CharacterGrouping;
}

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
      {/* Nhóm Nhà Lữ Hành (Traveler) */}
      {travelerByElement.size > 0 && (
        <div className={`${DENSE_GRID} mb-8`}>
          {Array.from(travelerByElement.entries()).map(([el, { boy, girl }]: [string, TravelerBucket], index: number) => {
            const target = (boy ?? girl) as Character;
            const boyImg = boy ? resolveCharacterCardImage(boy) : null;
            const girlImg = girl ? resolveCharacterCardImage(girl) : null;
            return (
              <div key={`traveler-${el}`} className="h-full">
                <CharacterCard
                  id={target.id}
                  name={`${t("traveler")} (${getElementNameByKey(el, locale)})`}
                  vision={el}
                  weaponType={tWeaponType("Sword")}
                  rarity={target.rarity}
                  imageSrc={boyImg || girlImg || "/local-genshin-assets/characters/icon/aether.png"}
                  fallbackSrcs={[
                    boy?.iconUrlOriginal,
                    girl?.iconUrlOriginal,
                    "/local-genshin-assets/characters/icon/aether.png",
                    "/local-genshin-assets/characters/icon/lumine.png",
                  ]}
                  priority={index < 10}
                  elementIcon={target.elementIcon}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Nhóm theo Phẩm cấp sao (5★, 4★) */}
      {sortedRarities.map((r: number) => (
        <div key={r} className="mb-8">
          <div
            className="sticky top-16 z-10 bg-bg-primary/95 backdrop-blur-md py-2 px-1 mb-3.5 text-xs font-bold tracking-wider uppercase border-b border-border/50 flex items-center justify-between"
            style={{ color: `var(--rarity-${r >= 5 ? 5 : r === 4 ? 4 : 3})` }}
          >
            <span>
              {"★".repeat(r)} · {t("rarityGroupCount", { count: rarityGroups.get(r)!.length })}
            </span>
            <span className="text-[10px] text-text-muted font-normal lowercase">
              {r === 5 ? "Nhân vật 5 sao giới hạn & thường" : "Nhân vật 4 sao"}
            </span>
          </div>
          <div className={DENSE_GRID}>
            {rarityGroups.get(r)!.map((c: Character, index: number) => (
              <div key={c.id} className="h-full">
                <CharacterCard
                  id={c.id}
                  name={getLocalizedName(c, locale)}
                  vision={c.vision}
                  weaponType={tWeaponType(c.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
                  rarity={c.rarity}
                  imageSrc={resolveCharacterCardImage(c)}
                  fallbackSrcs={[localCharacterIcon(c.id), c.iconUrlOriginal]}
                  priority={index < 10}
                  elementIcon={c.elementIcon}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
